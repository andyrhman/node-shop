// import { Request, Response } from "express";
// import logger from "../config/logger.config";
// import { ReviewService } from "../service/review.service";
// import { plainToClass } from "class-transformer";
// import { CreateReviewDTO } from "../validation/dto/reviews/create.dto";
// import { validate } from "class-validator";
// import { formatValidationErrors } from "../validation/utility/validation.utility";
// import { ProductService } from "../service/product.service";
// import { OrderService } from "../service/order.service";
// import { OrderItemService } from "../service/order-item.service";

// export const Reviews = async (req: Request, res: Response) => {
//   try {
//     const reviewService = new ReviewService();
//     let reviews = await reviewService.find({}, ["user", "product"]);

//     if (req.query.search) {
//       const search = req.query.search.toString().toLowerCase();
//       reviews = reviews.filter(
//         (p) =>
//           p.product.title.toLowerCase().indexOf(search) >= 0 ||
//           p.product.description.toLowerCase().indexOf(search) >= 0
//       );
//     }
//     res.send(reviews);
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const GetReviewAdmin = async (req: Request, res: Response) => {
//   try {
//     const reviewService = new ReviewService();
//     res.send(reviewService.findOne({ id: req.params.id }, ["user", "product"]));
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const GetReviewsUser = async (req: Request, res: Response) => {
//   try {
//     const reviewService = new ReviewService();
//     res.send(reviewService.find({ product_id: req.params.id }, ["user"]));
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// // ! [BUG] Create user review.
// // ! If the user buy the same products with different order id 
// // ! It will show the message --> You have already review this product.
// // ! Fix the code by insert the order id and then validate 
// // ! if the order id is the same or different

// // ! Use the frontend to get the order id by create some kind of link in the order page
// // ? https://www.phind.com/search?cache=jzhjmit5z3nnh9ky1xhmu369
// export const CreateReview = async (req: Request, res: Response) => {
//   try {
//     const body = req.body;
//     const input = plainToClass(CreateReviewDTO, body);
//     const validationErrors = await validate(input);

//     if (validationErrors.length > 0) {
//       // Use the utility function to format and return the validation errors
//       return res.status(400).json(formatValidationErrors(validationErrors));
//     }

//     const reviewService = new ReviewService();

//     const productService = new ProductService();

//     const orderService = new OrderService();

//     const orderItemService = new OrderItemService();

//     const user = req["id"];

//     const reviewExist = await reviewService.findOne({
//       user_id: user,
//       product_id: body.product_id,
//     });

//     const product = await productService.findOne({ id: body.product_id });

//     if (reviewExist) {
//       return res
//         .status(400)
//         .send({ message: "You have already review this product." });
//     }

//     if (body.star > 5) {
//       return res.status(400).send({ message: "Invalid Request" });
//     }

//     if (!product) {
//       return res.status(404).send({ message: "Product does not exist." });
//     }

//     const completedOrders = await orderService.findCompletedOrdersByUser(user);

//     const productInOrderItems = await orderItemService.isProductInOrderItems(
//       body.product_id,
//       completedOrders
//     );

//     if (!productInOrderItems) {
//       return res
//         .status(400)
//         .send({
//           message: "You can't review a product that you haven't purchased.",
//         });
//     }

//     const review = await reviewService.create({
//       ...body,
//       user_id: user,
//     });

//     res.send(review);
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };
