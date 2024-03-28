import { Request, Response } from "express";
import { User } from "../entity/user.entity";
import { UserService } from "../service/user.service";
import myDataSource from "../config/db.config";
import logger from "../config/logger.config";

export const Users = async (req: Request, res: Response) => {
    try {
        let user = await myDataSource.getRepository(User).find({});

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