import { Request, Response } from "express"
import { verify } from "jsonwebtoken";
import { User } from "../models/user.schema";
import logger from "../config/logger.config";

export const AuthMiddleware = async (req: Request, res: Response, next: Function) => {
    try {
        const jwt = req.cookies["my_session"];

        if (!jwt) {
            return res.status(401).send({ message: "Unauthenticated" })
        }

        const payload: any = verify(jwt, process.env.JWT_SECRET_ACCESS);

        if (!payload) {
            return res.status(401).send({ message: "Unauthenticated" })
        }

        // ? check if ambassdor by using the ambassador endpoints
        const is_user = req.path.indexOf('api/user') >= 0;
        const { scope } = payload;
        const is_admin = scope === 'admin';

        const user = (await User.findOne({ id: payload.id })).toObject();

        if (!user.is_verified) {
            return res.status(401).send({ message: "Please verify your account" })
        }

        if ((is_user && (scope === 'user' || is_admin)) || (!is_user && is_admin)) {
            req["user"] = user
            next();
        } else {
            return res.status(403).send({ message: "Forbidden" });
        }
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}