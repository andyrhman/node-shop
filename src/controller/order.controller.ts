// import { Request, Response } from "express";
// import { OrderService } from "../service/order.service";
// import sanitizeHtml from "sanitize-html";
// import { UserService } from "../service/user.service";
// import { AddressService } from "../service/address.service";
// import { Order } from "../entity/order.entity";
// import { isUUID, validate } from "class-validator";
// import { plainToClass } from "class-transformer";
// import { CreateOrderDto } from "../validation/dto/orders/create.dto";
// import { formatValidationErrors } from "../validation/utility/validation.utility";
// import { Cart } from "../entity/cart.entity";
// import { CartService } from "../service/cart.service";
// import { OrderItem, OrderItemStatus } from "../entity/order-items.entity";
// import { eventEmitter } from "../index";
// import logger from "../config/logger.config";
// import myDataSource from "../config/db.config";
// import Stripe from "stripe";
// import { ChangeStatusDTO } from "../validation/dto/orders/change-status.dto";
// import { OrderItemService } from "../service/order-item.service";

// export const Orders = async (req: Request, res: Response) => {
//   try {
//     const orderService = new OrderService();
//     let search = req.query.search;

//     let orders = await orderService.find({}, [
//       "order_items",
//       "order_items.product",
//     ]);
//     if (typeof search === "string") {
//       search = sanitizeHtml(search);
//       if (search) {
//         const searchOrder = search.toString().toLowerCase();

//         orders = orders.filter((order) => {
//           const orderMatches = order.order_items.some((orderItem) => {
//             return orderItem.product_title.toLowerCase().includes(searchOrder);
//           });
//           return (
//             order.name.toLowerCase().includes(searchOrder) ||
//             order.email.toLowerCase().includes(searchOrder) ||
//             orderMatches
//           );
//         });

//         // Check if the resulting filtered data array is empty
//         if (orders.length === 0) {
//           // Respond with a 404 status code and a message
//           return res
//             .status(404)
//             .json({ message: `No ${search} matching your search criteria.` });
//         }
//       }
//     }

//     res.send(orders);
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const CreateOrder = async (req: Request, res: Response) => {
//   const body = req.body;
//   const input = plainToClass(CreateOrderDto, body);
//   const validationErrors = await validate(input);

//   if (validationErrors.length > 0) {
//     // Use the utility function to format and return the validation errors
//     return res.status(400).json(formatValidationErrors(validationErrors));
//   }
//   const userService = new UserService();
//   const addressService = new AddressService();
//   const cartService = new CartService();
//   const userId = req["id"];

//   const user = await userService.findOne({ id: userId });
//   const address = await addressService.findOne({ user_id: userId });
//   if (!address) {
//     return res
//       .status(400)
//       .send({ message: "Please create your shipping address first." });
//   }
//   const queryRunner = myDataSource.createQueryRunner();
//   try {
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     const o = new Order();
//     o.name = user.fullName;
//     o.email = user.email;
//     o.user_id = userId;

//     const order = await queryRunner.manager.save(o);

//     // * Stripe.
//     const line_items = [];

//     for (let c of body.carts) {
//       if (!isUUID(c.cart_id)) {
//         return res.status(400).send({ message: "Invalid UUID format" });
//       }
//       const cart: Cart[] = await cartService.find(
//         { id: c.cart_id, user_id: userId },
//         ["product", "variant"]
//       );

//       if (cart.length === 0) {
//         return res.status(404).send({ message: "Cart not found." });
//       }
//       if (cart[0].completed === true) {
//         return res
//           .status(400)
//           .send({ message: "Invalid order, please add new order." });
//       }
//       const orderItem = new OrderItem();
//       orderItem.order = order;
//       orderItem.product_title = cart[0].product_title;
//       orderItem.price = cart[0].price;
//       orderItem.quantity = cart[0].quantity;
//       orderItem.product_id = cart[0].product_id;
//       orderItem.variant_id = cart[0].variant_id;

//       const totalAmount = cart[0].price * cart[0].quantity;
//       if (totalAmount < 7500) {
//         return res
//           .status(400)
//           .send({ message: "The total amount must be at least Rp7,500.00" });
//       }

//       cart[0].order_id = order.id;
//       await queryRunner.manager.update(Cart, cart[0].id, cart[0]);

//       await queryRunner.manager.save(orderItem);

//       // * Stripe
//       line_items.push({
//         price_data: {
//           currency: "idr",
//           unit_amount: cart[0].price,
//           product_data: {
//             name: `${cart[0].product_title} - Variant ${cart[0].variant.name}`,
//             description: cart[0].product.description,
//             images: [`${cart[0].product.image}`],
//           },
//         },
//         quantity: cart[0].quantity,
//       });
//     }
//     // * Stripe
//     const stripe = new Stripe(process.env.STRIPE_SECRET, {
//       apiVersion: "2023-10-16",
//     });

//     const source = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items,
//       success_url: `${process.env.CHECKOUT_URL}/success?source={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CHECKOUT_URL}/error`,
//     });

//     order.transaction_id = source["id"];
//     await queryRunner.manager.save(order);

//     await queryRunner.commitTransaction();
//     res.send(source);
//   } catch (error) {
//     await queryRunner.rollbackTransaction();
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const ConfirmOrder = async (req: Request, res: Response) => {
//   try {
//     const user = req["id"];
//     const orderService = new OrderService();
//     const orderItemService = new OrderItemService();
//     const cartService = new CartService();

//     const order = await orderService.findOne(
//       {
//         transaction_id: req.body.source,
//       },
//       ["user", "order_items", "order_items.product", "order_items.variant"]
//     );

//     if (!order) {
//       return res.status(404).send("Order not found");
//     }

//     const carts: Cart[] = await cartService.find({
//       order_id: order.id,
//       user_id: user,
//     });
//     const orderItems: OrderItem[] = await orderItemService.find({
//       order_id: order.id,
//     });
//     if (carts.length === 0) {
//       return res.status(403).send("Forbidden");
//     }

//     for (let cart of carts) {
//       await cartService.update(cart.id, { completed: true });
//     }
//     for (let orderItem of orderItems) {
//       await orderItemService.update(orderItem.id, {
//         status: OrderItemStatus.Selesai,
//       });
//     }
//     await orderService.update(order.id, { completed: true });

//     eventEmitter.emit("order.completed", order);

//     res.send({
//       message: "success",
//     });
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

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
