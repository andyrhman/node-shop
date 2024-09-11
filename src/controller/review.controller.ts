import { Request, Response } from "express";
import logger from "../config/logger.config";
import { ReviewService } from "../service/review.service";
import { plainToClass } from "class-transformer";
import { CreateReviewDTO } from "../validation/dto/reviews/create.dto";
import { validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { ProductService } from "../service/product.service";
import { OrderService } from "../service/order.service";
import { OrderItemService } from "../service/order-item.service";
import myPrisma from "../config/db.config";

export const Reviews = async (req: Request, res: Response) => {
  const reviewService = new ReviewService(myPrisma);
  let reviews = await reviewService.find({}, { user: true, product: true });

  if (req.query.search) {
    const search = req.query.search.toString().toLowerCase();
    reviews = reviews.filter(
      (p: any) =>
        p.product.title.toLowerCase().indexOf(search) >= 0 ||
        p.product.description.toLowerCase().indexOf(search) >= 0
    );
  }
  res.send(reviews);
};

export const GetReviewAdmin = async (req: Request, res: Response) => {
  const reviewService = new ReviewService(myPrisma);
  res.send(reviewService.findOne({ id: req.params.id }, { user: true, product: true }));
};

export const GetReviewsUser = async (req: Request, res: Response) => {
  const reviewService = new ReviewService(myPrisma);
  res.send(reviewService.find({ product_id: req.params.id }, { user: true }));
};

// ! [BUG] Create user review.
// ! If the user buy the same products with different order id
// ! It will show the message --> You have already review this product.
// ! Fix the code by insert the order id and then validate
// ! if the order id is the same or different

// ! Use the frontend to get the order id by create some kind of link in the order page
// ? https://www.phind.com/search?cache=jzhjmit5z3nnh9ky1xhmu369
export const CreateReview = async (req: Request, res: Response) => {
  const body = req.body;
  const input = plainToClass(CreateReviewDTO, body);
  const validationErrors = await validate(input);

  if (validationErrors.length > 0) {
    // Use the utility function to format and return the validation errors
    return res.status(400).json(formatValidationErrors(validationErrors));
  }

  const reviewService = new ReviewService(myPrisma);

  const productService = new ProductService(myPrisma);

  const orderService = new OrderService(myPrisma);

  const orderItemService = new OrderItemService(myPrisma);

  const user = req["id"];

  const reviewExist = await reviewService.findOne({
    user_id: user,
    order_id: body.order_id,
    product_id: body.product_id,
    variant_id: body.variant_id,
  });

  const product = await productService.findOne({ id: body.product_id });

  if (reviewExist) {
    return res
      .status(400)
      .send({ message: "You have already review this product." });
  }

  if (body.star > 5) {
    return res.status(400).send({ message: "Invalid Request" });
  }

  if (!product) {
    return res.status(404).send({ message: "Product does not exist." });
  }

  // * Create a form with the order id hidden in the from of create review on the frontend
  const completedOrders = await orderService.findOne({
    id: body.order_id,
    user_id: user,
    completed: true,
  });

  const productInOrderItems = await orderItemService.findOne({
    id: body.order_item,
    order_id: body.order_id,
    product_id: body.product_id,
    variant_id: body.variant_id,
  });

  if (!completedOrders) {
    return res.status(400).send({
      message: "You can't review a product that you haven't purchased.",
    });
  }

  if (!productInOrderItems) {
    return res.status(400).send({
      message: "You can't review a product that you haven't purchased.",
    });
  }

  const review = await reviewService.create({
    star: body.star,
    comment: body.comment,
    image: body.image,
    order: { connect: { id: body.order_id } },
    product: { connect: { id: body.product_id } },
    variant: { connect: { id: body.variant_id } },
    user: { connect: { id: user } },
  });

  res.send(review);
};
