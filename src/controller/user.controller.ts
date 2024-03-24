import { Request, Response } from "express";
import { User } from "../models/user.schema";
import { UserService } from "../service/user.service";
import logger from "../config/logger.config";

export const Users = async (req: Request, res: Response) => {
    try {
        let user = await User.find({}, {cart: 0, orders: 0, verify: 0, review: 0, password: 0});

        if (req.query.search) {
            const search = req.query.search.toString().toLowerCase();
            user = user.filter(
                p => p.fullName.toLowerCase().indexOf(search) >= 0 ||
                    p.username.toLowerCase().indexOf(search) >= 0
            )
        }

        res.send(user)
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            logger.info(error)
        }
        return res.status(400).send({message: "Invalid Request"})
    }
}

export const TotalUsers = async (req: Request, res: Response) => {
    try {
        const userService = new UserService();
        res.send(await userService.total({}));
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            logger.info(error)
        }
        return res.status(400).send({message: "Invalid Request"})
    }
}