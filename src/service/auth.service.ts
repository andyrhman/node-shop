import myDataSource from "../config/db.config";
import { ProductImages } from "../entity/product-images.entity";
import { AbstractService } from "./abstract.service";
import { Request, Response } from "express";
import { verify } from "jsonwebtoken";

export class AuthService {
  async userId(req: Request, res: Response): Promise<string> {
    const cookie = req.cookies["my_session"];

    if (!cookie) {
      res.status(401).send({ message: "User not authenticated" });
    }

    try {
      const data = verify(cookie, process.env.JWT_SECRET_ACCESS);
      return data["id"];
    } catch (error) {
      res.status(401).send({ message: "User not authenticated" });
    }
  }
}
