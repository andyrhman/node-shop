import { Request, Response } from "express";
import { UserService } from "../service/user.service";
import myPrisma from "../config/db.config";

export const Users = async (req: Request, res: Response) => {
    let user = await myPrisma.user.findMany();

    user = user.map((user: any) => {
        const { password, ...data } = user;
        return data;
    });

    if (req.query.search) {
        const search = req.query.search.toString().toLowerCase();
        user = user.filter(
            p => p.fullName.toLowerCase().indexOf(search) >= 0 ||
                p.username.toLowerCase().indexOf(search) >= 0
        );
    }

    res.send(user);
};

export const TotalUsers = async (req: Request, res: Response) => {
    const userService = new UserService(myPrisma);
    res.send(await userService.total({}));
};