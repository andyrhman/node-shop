import { Request, Response } from "express";
import { CartService } from "../service/cart.service";
import { OrderItemService } from "../service/order-item.service";
import { OrderService } from "../service/order.service";
import { ProductService } from "../service/product.service";
import { ReviewService } from "../service/review.service";
import { UserService } from "../service/user.service";
import logger from "../config/logger.config";

export const Stats = async (req: Request, res: Response) => {
  try {
    const userService = new UserService();
    const productService = new ProductService();
    const orderService = new OrderService();
    const orderItemService = new OrderItemService();
    const reviewService = new ReviewService();
    const cartService = new CartService();

    const user_total = await userService.total({});
    const product_total = await productService.total({});
    const order_total = await orderService.total({});
    const orderItem_total = await orderItemService.total({});
    const review_total = await reviewService.total({});
    const cart_total = await cartService.total({});

    return {
      user_total: user_total.total,
      product_total: product_total.total,
      order_total: order_total.total,
      orderItem_total: orderItem_total.total,
      review_total: review_total.total,
      cart_total: cart_total.total,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const OrdersStat = async (req: Request, res: Response) => {
  try {
    const orderService = new OrderService();
    res.send(await orderService.chart());
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const CartsStat = async (req: Request, res: Response) => {
  try {
    const cartService = new CartService();
    res.send(await cartService.chart());
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const UsersStat = async (req: Request, res: Response) => {
  try {
    const userService = new UserService();
    res.send(await userService.chart());
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};
