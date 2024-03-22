import { Request, Response } from "express";
import { OrderService } from "../service/order.service";
import { UserService } from "../service/user.service";
import { AddressService } from "../service/address.service";
import { Order, OrderDocument } from "../models/order.schema";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { CreateOrderDto } from "../validation/dto/orders/create.dto";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { Cart, CartDocument } from "../models/cart.schema";
import { CartService } from "../service/cart.service";
import {
  OrderItem,
  OrderItemStatus,
  OrderItemsDocument,
} from "../models/order-items.schema";
import { eventEmitter } from "../index";
import { ChangeStatusDTO } from "../validation/dto/orders/change-status.dto";
import { OrderItemService } from "../service/order-item.service";
import mongoose, { isValidObjectId } from "mongoose";
import sanitizeHtml from "sanitize-html";
import Stripe from "stripe";
import logger from "../config/logger.config";
import { User } from "../models/user.schema";
import { Address } from "../models/address.schema";

export const Orders = async (req: Request, res: Response) => {
  try {
    let search = req.query.search;

    let orders = await Order.find().populate({
      path: "order_items",
      populate: { path: "product_id" },
    });

    if (typeof search === "string") {
      search = sanitizeHtml(search);
      if (search) {
        const searchOrder = search.toString().toLowerCase();

        orders = orders.filter((order) => {
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

    res.send(
      orders.map((o: OrderDocument) => {
        return {
          _id: o._id,
          name: o.name,
          email: o.email,
          completed: o.completed,
          user_id: o.user_id,
          total: o.total,
          total_orders: o.total_orders,
          order_items: o.order_items.map((i: OrderItemsDocument) => {
            return {
              _id: i._id,
              product_title: i.product_title,
              price: i.price,
              quantity: i.quantity,
              variant_id: i.variant_id,
              order_id: i.order_id,
              status: i.status,
            };
          }),
          created_at: o.created_at,
          id: o._id,
        };
      })
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const CreateOrder = async (req: Request, res: Response) => {
  const body = req.body;
  const input = plainToClass(CreateOrderDto, body);
  const validationErrors = await validate(input);

  if (validationErrors.length > 0) {
    // Use the utility function to format and return the validation errors
    return res.status(400).json(formatValidationErrors(validationErrors));
  }

  const userId = req["id"];

  const user = await User.findById(userId);
  const address = await Address.findOne({ user_id: userId });
  if (!address) {
    return res
      .status(400)
      .send({ message: "Please create your shipping address first." });
  }

  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const o = new Order();
    o.name = user.fullName;
    o.email = user.email;
    o.user_id = userId;
    o.order_items = [];

    const order = await o.save({ session });

    // * Stripe.
    const line_items = [];

    for (let c of body.carts) {
      if (!isValidObjectId(c.cart_id)) {
        return res.status(400).send({ message: "Invalid UUID format" });
      }
    
      const cart: CartDocument[] = await Cart.find(
        { _id: c.cart_id, user_id: userId },
        null,
        { session }
      )
        .populate("product_id")
        .populate("variant_id");
    
      if (cart.length === 0) {
        return res.status(404).send({ message: "Cart not found." });
      }
      // ? https://claude.ai/chat/2d5c36a0-00c7-4e50-b6b8-706ca356da8d
      for (let cartItem of cart) {
        if (cartItem.completed === true) {
          return res
            .status(400)
            .send({ message: "Invalid order, please add new order." });
        }
    
        const orderItem = new OrderItem();
        orderItem.order_id = order;
        orderItem.product_title = cartItem.product_title;
        orderItem.price = cartItem.price;
        orderItem.quantity = cartItem.quantity;
        orderItem.product_id = cartItem.product_id;
        orderItem.variant_id = cartItem.variant_id;
    
        const totalAmount = cartItem.price * cartItem.quantity;
        if (totalAmount < 7500) {
          return res
            .status(400)
            .send({ message: "The total amount must be at least Rp7,500.00" });
        }
    
        cartItem.order_id = order.id;
        await Cart.findOneAndUpdate(
          { _id: cartItem._id },
          { $set: { order_id: order._id } },
          { new: true, session }
        );
    
        await orderItem.save({ session });
        order.order_items.push(orderItem);
    
        line_items.push({
          price_data: {
            currency: "idr",
            unit_amount: cartItem.price,
            product_data: {
              name: `${cartItem.product_title} - Variant ${cartItem.variant_id.name}`,
              description: cartItem.product_id.description,
              images: [`${cartItem.product_id.image}`],
            },
          },
          quantity: cartItem.quantity,
        });
      }
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

    order.transaction_id = source["id"];
    await order.save({ session });

    await session.commitTransaction();

    session.endSession();

    res.send(source);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(error);
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const ConfirmOrder = async (req: Request, res: Response) => {
  try {
    const user = req["id"];
    const orderService = new OrderService();
    const orderItemService = new OrderItemService();
    const cartService = new CartService();

    const order = await Order.findOne({ transaction_id: req.body.source })
      .populate("user_id")
      .populate({ path: "order_items", populate: { path: "product_id" } })
      .populate({ path: "order_items", populate: { path: "variant_id" } });

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    if ((order as any)._doc.user_id._id.toString() !== user) {
      // logger.info((order as any)._doc.user_id._id.toString());
      return res.status(403).send({ message: "Not Allowed!" });
    }

    const carts: CartDocument[] = await cartService.find({
      order_id: order._id,
      user_id: user,
    });
    const orderItems: OrderItemsDocument[] = await orderItemService.find({
      order_id: order._id,
    });
    if (carts.length === 0) {
      return res.status(403).send("Forbidden");
    }

    for (let cart of carts) {
      await cartService.update(cart._id, { completed: true });
    }
    for (let orderItem of orderItems) {
      await orderItemService.update(orderItem._id, {
        status: OrderItemStatus.Selesai,
      });
    }
    await orderService.update(order._id, { completed: true });

    await User.findByIdAndUpdate(order.user_id, { $push: { orders: order } });

    eventEmitter.emit("order.completed", order);

    res.send({
      message: "success",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const GetUserOrder = async (req: Request, res: Response) => {
  try {
    const id = req["id"];
    res.send(
      await Order.find({ user_id: id }).populate({
        path: "order_items",
        populate: { path: "product_id" },
      })
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const GetOrderItem = async (req: Request, res: Response) => {
  try {
    res.send(await OrderItem.findById(req.params.id));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const ChangeOrderStatus = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const input = plainToClass(ChangeStatusDTO, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({ message: "Invalid UUID format" });
    }

    const orderItemService = new OrderItemService();

    res.send(await orderItemService.update(req.params.id, body));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};
