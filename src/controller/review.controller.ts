import { Request, Response } from "express";
import logger from "../config/logger.config";
import { ReviewService } from "../service/review.service";
import { plainToClass } from "class-transformer";
import { CreateReviewDTO } from "../validation/dto/reviews/create.dto";
import { validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { Review, ReviewDocument } from "../models/review.schema";
import { Order } from "../models/order.schema";
import { OrderItem } from "../models/order-items.schema";
import { User } from "../models/user.schema";

export const Reviews = async (req: Request, res: Response) => {
  try {
    let reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate("user_id");

    if (req.query.search) {
      const search = req.query.search.toString().toLowerCase();
      reviews = reviews.filter(
        (p) =>
          p.product_id.title.toLowerCase().indexOf(search) >= 0 ||
          p.product_id.description.toLowerCase().indexOf(search) >= 0
      );
    }
    res.send(
      reviews.map((r: ReviewDocument) => {
        return {
          _id: r.id,
          star: r.star,
          comment: r.comment,
          image: r.image,
          user_id: {
            _id: r.user_id._id,
            fullName: r.user_id.fullName,
            username: r.user_id.username,
            email: r.user_id.email,
            id: r.user_id._id,
          },
          product_id: r.product_id,
          variant_id: r.variant_id,
          order_id: r.order_id,
          created_at: r.created_at,
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

export const GetReviewAdmin = async (req: Request, res: Response) => {
  try {
    const r = await Review.findById(req.params.id)
      .populate("user_id", ["_id", "fullName", "username", "id"])
      .populate("product_id", ["_id", "title", "slug", "image", "price", "id"]);
    res.send({
      _id: r.id,
      star: r.star,
      comment: r.comment,
      image: r.image,
      user_id: r.user_id,
      product_id: r.product_id,
      variant_id: r.variant_id,
      order_id: r.order_id,
      created_at: r.created_at,
      id: r.id,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const GetReviewsUser = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ product_id: req.params.id }).populate(
      "user_id"
    );
    res.send(
      reviews.map((r: ReviewDocument) => {
        return {
          _id: r.id,
          star: r.star,
          comment: r.comment,
          image: r.image,
          user_id: {
            _id: r.user_id._id,
            fullName: r.user_id.fullName,
            username: r.user_id.username,
            email: r.user_id.email,
            id: r.user_id._id,
          },
          product_id: r.product_id,
          variant_id: r.variant_id,
          order_id: r.order_id,
          created_at: r.created_at,
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

// ! [BUG] Create user review.
// ! If the user buy the same products with different order id
// ! It will show the message --> You have already review this product.
// ! Fix the code by insert the order id and then validate
// ! if the order id is the same or different

// ! Use the frontend to get the order id by create some kind of link in the order page
// ? https://www.phind.com/search?cache=jzhjmit5z3nnh9ky1xhmu369
export const CreateReview = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const input = plainToClass(CreateReviewDTO, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const reviewService = new ReviewService();

    const user = req["id"];

    const reviewExist = await reviewService.findOne({
      user_id: user,
      order_id: body.order_id,
      product_id: body.product_id,
      variant_id: body.variant_id,
    });

    if (reviewExist) {
      return res
        .status(400)
        .send({ message: "You have already review this product." });
    }

    if (body.star > 5) {
      return res.status(400).send({ message: "Invalid Request" });
    }

    // * Create a form with the order id hidden in the from of create review on the frontend
    const completedOrders = await Order.findOne({
      _id: body.order_id,
      user_id: user,
      completed: true,
    });

    const productInOrderItems = await OrderItem.findOne({
      _id: body.order_item,
      order_id: body.order_id,
      product_id: body.product_id,
      variant_id: body.variant_id,
    });

    if (!completedOrders) {
      return res.status(400).send({
        message: "You can't review a product that you haven't purchased 1 .",
      });
    }

    if (!productInOrderItems) {
      return res.status(400).send({
        message: "You can't review a product that you haven't purchased 2 .",
      });
    }

    const review = await reviewService.create({
      ...body,
      user_id: user,
    });

    await User.findByIdAndUpdate(user, { $push: { review } });

    res.send(review);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};
