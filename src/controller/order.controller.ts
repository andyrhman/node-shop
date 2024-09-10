import { Request, Response } from "express";
import { OrderService } from "../service/order.service";
import { UserService } from "../service/user.service";
import { AddressService } from "../service/address.service";
import { isUUID, validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { CreateOrderDto } from "../validation/dto/orders/create.dto";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { CartService } from "../service/cart.service";
import { eventEmitter } from "../../utility/eventEmitter";
import { ChangeStatusDTO } from "../validation/dto/orders/change-status.dto";
import { OrderItemService } from "../service/order-item.service";
import { Cart, OrderItem, OrderItemStatus } from "@prisma/client";
import sanitizeHtml from "sanitize-html";
import Stripe from "stripe";
import myPrisma from "../config/db.config";

export const Orders = async (req: Request, res: Response) => {
    const orderService = new OrderService(myPrisma);
    let search = req.query.search;

    let orders = await orderService.find({}, { order_items: { include: { product: true } } });
    if (typeof search === "string") {
        search = sanitizeHtml(search);
        if (search) {
            const searchOrder = search.toString().toLowerCase();

            orders = orders.filter((order: any) => {
                const orderMatches = order.order_items.some((orderItem) => {
                    return orderItem.product_title.toLowerCase().includes(searchOrder);
                });
                return (
                    order.name.toLowerCase().includes(searchOrder) ||
                    order.email.toLowerCase().includes(searchOrder) ||
                    orderMatches
                );
            });

            // Check if the resulting filtered data array is empty
            if (orders.length === 0) {
                // Respond with a 404 status code and a message
                return res
                    .status(404)
                    .json({ message: `No ${search} matching your search criteria.` });
            }
        }
    }

    res.send(orders);
};

export const CreateOrder = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(CreateOrderDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        // Use the utility function to format and return the validation errors
        return res.status(400).json(formatValidationErrors(validationErrors));
    }
    const userService = new UserService(myPrisma);
    const addressService = new AddressService(myPrisma);
    const cartService = new CartService(myPrisma);
    const userId = req["user"];

    const user = await userService.findOne({ id: userId.id });
    const address = await addressService.findOne({ user_id: userId.id });
    if (!address) {
        return res
            .status(400)
            .send({ message: "Please create your shipping address first." });
    }
    try {
        await myPrisma.$transaction(async (prisma) => {
            // Create order
            const order = await prisma.order.create({
                data: {
                    name: user.fullName,
                    email: user.email,
                    user_id: userId.id,
                    transaction_id: undefined
                },
            });

            const line_items = [];

            for (let c of body.carts) {
                if (!isUUID(c.cart_id)) {
                    throw new Error("Invalid UUID format");
                }

                const cart: any = await cartService.find(
                    { id: c.cart_id, user_id: userId.id },
                    { product: true, variant: true }
                );

                if (cart.length === 0) {
                    throw new Error("Cart not found.");
                }
                if (cart[0].completed === true) {
                    throw new Error("Invalid order, please add a new order.");
                }

                const totalAmount = cart[0].price * cart[0].quantity;
                if (totalAmount < 7500) {
                    throw new Error("The total amount must be at least Rp7,500.00");
                }

                // Create order item
                await prisma.orderItem.create({
                    data: {
                        order_id: order.id,
                        product_title: cart[0].product_title,
                        price: cart[0].price,
                        quantity: cart[0].quantity,
                        product_id: cart[0].product_id,
                        variant_id: cart[0].variant_id,
                    },
                });

                // Update cart
                await prisma.cart.update({
                    where: { id: cart[0].id },
                    data: { order_id: order.id },
                });

                // * Stripe
                line_items.push({
                    price_data: {
                        currency: "idr",
                        unit_amount: cart[0].price,
                        product_data: {
                            name: `${cart[0].product_title} - Variant ${cart[0].variant.name}`,
                            description: cart[0].product.description,
                            images: [`${cart[0].product.image}`],
                        },
                    },
                    quantity: cart[0].quantity,
                });
            }

            // * Stripe
            const stripe = new Stripe(process.env.STRIPE_SECRET, {
                apiVersion: "2023-10-16",
            });

            const source = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items,
                success_url: `${process.env.CHECKOUT_URL}/success?source={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CHECKOUT_URL}/error`,
            });

            // Update order with transaction ID
            await prisma.order.update({
                where: { id: order.id },
                data: { transaction_id: source.id },
            });

            res.send(source);
        });
    } catch (error) {
        return res.status(400).send({ message: "Invalid Request" });
    }
};

export const ConfirmOrder = async (req: Request, res: Response) => {
    try {
        const user = req["user"];
        const orderService = new OrderService(myPrisma);
        const orderItemService = new OrderItemService(myPrisma);
        const cartService = new CartService(myPrisma);

        const order = await orderService.findOne(
            {
                transaction_id: req.body.source,
            },
            { user: true, order_items: { include: { product: true, variant: true } } }
        );

        if (!order) {
            return res.status(404).send({ messagge: "Order not found" });
        } else if (order.completed) {
            return res.status(404).send({ message: "This order payment has been completed" });
        }

        const carts: Cart[] = await cartService.find({
            order_id: order.id,
            user_id: user.id,
        });
        const orderItems: OrderItem[] = await orderItemService.find({
            order_id: order.id,
        });
        if (carts.length === 0) {
            return res.status(403).send({ message: "Forbidden" });
        }

        for (let cart of carts) {
            await cartService.update(cart.id, { completed: true });
        }
        for (let orderItem of orderItems) {
            await orderItemService.update(orderItem.id, {
                status: OrderItemStatus.Selesai,
            });
        }
        await orderService.update(order.id, { completed: true });

        eventEmitter.emit("order.completed", order);

        res.send({
            message: "success",
        });
    } catch (error) {
        return res.status(400).send({ message: "Invalid Request" });
    }
};

// export const GetUserOrder = async (req: Request, res: Response) => {
//   try {
//     const id = req["id"];
//     const orderService = new OrderService();
//     res.send(
//       await orderService.find({ user_id: id }, [
//         "order_items",
//         "order_items.product",
//       ])
//     );
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const GetOrderItem = async (req: Request, res: Response) => {
//   try {
//     const orderItemService = new OrderItemService();
//     res.send(await orderItemService.findOne({ id: req.params.id }));
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const ChangeOrderStatus = async (req: Request, res: Response) => {
//   try {
//     const body = req.body;
//     const input = plainToClass(ChangeStatusDTO, body);
//     const validationErrors = await validate(input);

//     if (validationErrors.length > 0) {
//       // Use the utility function to format and return the validation errors
//       return res.status(400).json(formatValidationErrors(validationErrors));
//     }

//     if (!isUUID(req.params.id)) {
//       return res.status(400).send({ message: "Invalid UUID format" });
//     }

//     const orderItemService = new OrderItemService();

//     res.send(await orderItemService.update(req.params.id, body));
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };
