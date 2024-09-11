import { Request, Response } from "express";
import { CartService } from "../service/cart.service";
import { OrderItemService } from "../service/order-item.service";
import { OrderService } from "../service/order.service";
import { ProductService } from "../service/product.service";
import { ReviewService } from "../service/review.service";
import { UserService } from "../service/user.service";
import myPrisma from "../config/db.config";
import json from "../validation/utility/json.utility";

export const Stats = async (req: Request, res: Response) => {
    const userService = new UserService(myPrisma);
    const productService = new ProductService(myPrisma);
    const orderService = new OrderService(myPrisma);
    const orderItemService = new OrderItemService(myPrisma);
    const reviewService = new ReviewService(myPrisma);
    const cartService = new CartService(myPrisma);

    const user_total = await userService.total({});
    const product_total = await productService.total({});
    const order_total = await orderService.total({});
    const orderItem_total = await orderItemService.total({});
    const review_total = await reviewService.total({});
    const cart_total = await cartService.total({});

    res.send({
        user_total: user_total.total,
        product_total: product_total.total,
        order_total: order_total.total,
        orderItem_total: orderItem_total.total,
        review_total: review_total.total,
        cart_total: cart_total.total,
    });
};

export const OrdersStat = async (req: Request, res: Response) => {
    const orderService = new OrderService(myPrisma);
    res.send(await orderService.chart());
};

export const CartsStat = async (req: Request, res: Response) => {
    const cartService = new CartService(myPrisma);
    res.send(await cartService.chart());
};

export const UsersStat = async (req: Request, res: Response) => {
    const userService: any = new UserService(myPrisma);
    res.send(json(await userService.chart()));
};
