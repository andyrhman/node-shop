// import { Request, Response } from "express";
// import { OrderService } from "../service/order.service";
// import logger from "../config/logger.config";
// import sanitizeHtml from "sanitize-html";
// import { UserService } from "../service/user.service";

// export const Orders = async (req: Request, res: Response) => {
//   try {
//     const orderService = new OrderService();
//     let search = req.query.search;

//     let orders = await orderService.find({}, ['order_items', 'order_items.product'])
//     if (typeof search === 'string') {
//         search = sanitizeHtml(search);
//         if (search) {
//             const searchOrder = search.toString().toLowerCase();

//             orders = orders.filter(order => {
//                 const orderMatches = order.order_items.some(orderItem => {
//                     return orderItem.product_title.toLowerCase().includes(searchOrder);
//                 });
//                 return (
//                     order.name.toLowerCase().includes(searchOrder) ||
//                     order.email.toLowerCase().includes(searchOrder) ||
//                     orderMatches
//                 );
//             });

//             // Check if the resulting filtered data array is empty
//             if (orders.length === 0) {
//                 // Respond with a 404 status code and a message
//                 return res.status(404).json({ message: `No ${search} matching your search criteria.` });
//             }
//         }
//     }

//     res.send(orders);
// } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const CheckoutOrder = async (req: Request, res: Response) => {
//     const userService = new UserService();
//     const userId = req["id"];

//     const user = await userService.findOne({ id: userId });
//     const address = await this.addressService.findOne({ user_id: userId });
//     if (!address) {
//         throw new BadRequestException("Please create your shipping address first.")
//     }
//     try {

//         const queryRunner = this.dataSource.createQueryRunner();
//         try {
//             await queryRunner.connect();
//             await queryRunner.startTransaction();

//             const o = new Order()
//             o.name = user.fullName
//             o.email = user.email
//             o.user_id = userId

//             const order = await queryRunner.manager.save(o);

//             // * Stripe.
//             const line_items = [];

//             for (let c of body.carts) {
//                 if (!isUUID(c.cart_id)) {
//                     throw new BadRequestException('Invalid UUID format');
//                 }
//                 const cart: Cart[] = await this.cartService.find({ id: c.cart_id, user_id: userId }, ['product', 'variant']);

//                 if (cart.length === 0) {
//                     throw new NotFoundException("Cart not found.");
//                 }
//                 if (cart[0].completed === true) {
//                     throw new BadRequestException("Invalid order, please add new order.");
//                 }
//                 const orderItem = new OrderItem();
//                 orderItem.order = order;
//                 orderItem.product_title = cart[0].product_title;
//                 orderItem.price = cart[0].price;
//                 orderItem.quantity = cart[0].quantity;
//                 orderItem.product_id = cart[0].product_id;
//                 orderItem.variant_id = cart[0].variant_id;

//                 const totalAmount = cart[0].price * cart[0].quantity;
//                 if (totalAmount < 7500) {
//                     throw new BadRequestException("The total amount must be at least Rp7,500.00");
//                 }

//                 cart[0].order_id = order.id;
//                 await queryRunner.manager.update(Cart, cart[0].id, cart[0]);

//                 await queryRunner.manager.save(orderItem);

//                 // * Stripe
//                 line_items.push({
//                     price_data: {
//                         currency: 'idr',
//                         unit_amount: cart[0].price,
//                         product_data: {
//                             name: `${cart[0].product_title} - Variant ${cart[0].variant.name}`,
//                             description: cart[0].product.description,
//                             images: [
//                                 `${cart[0].product.image}`
//                             ]
//                         },
//                     },
//                     quantity: cart[0].quantity
//                 })
//             }
//             // * Stripe
//             const source = await this.stripeClient.checkout.sessions.create({
//                 payment_method_types: ['card'],
//                 mode: 'payment',
//                 line_items,
//                 success_url: `${this.configService.get('CHECKOUT_URL')}/success?source={CHECKOUT_SESSION_ID}`,
//                 cancel_url: `${this.configService.get('CHECKOUT_URL')}/error`,
//             })

//             order.transaction_id = source['id'];
//             await queryRunner.manager.save(order);

//             await queryRunner.commitTransaction();
//             return source;
//         } catch (err) {
//             await queryRunner.rollbackTransaction();
//             console.log(err)
//             throw new BadRequestException(err.response);
//         } finally {
//             await queryRunner.release();
//         }
//   } catch (error) {
//       if (process.env.NODE_ENV === "development") {
//         logger.error(error);
//       }
//       return res.status(400).send({ message: "Invalid Request" });
//     }
//   };



// export const copyme = async (req: Request, res: Response) => {
//     try {
//       const addressService = new AddressService();
//     } catch (error) {
//       if (process.env.NODE_ENV === "development") {
//         logger.error(error);
//       }
//       return res.status(400).send({ message: "Invalid Request" });
//     }
//   };
  