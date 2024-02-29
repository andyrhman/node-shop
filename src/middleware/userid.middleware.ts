// ? https://www.phind.com/search?cache=lnjrcznzuvysth2104090wwv&source=sidebar
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

export const userIdMidlleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["my_session"];

  if (!token) {
    return res.status(401).send({ message: "User not authenticated" });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET_ACCESS);
    // Assuming the decoded object has an 'id' property that represents the user ID
    if (decoded && typeof decoded === "object" && "id" in decoded) {
      // ? delete?
      req["id"] = decoded.id; // Attach the user ID to the request object
      next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(401).send({ message: "User not authenticated" });
    }
  } catch (error) {
    return res.status(401).send({ message: "User not authenticated" });
  }
};
