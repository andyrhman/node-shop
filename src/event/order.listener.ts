import transporter from "../config/transporter.config";
import * as fs from "fs";
import * as handlebars from "handlebars";
import { eventEmitter } from "../index";
import { Order, OrderDocument } from "../models/order.schema";

eventEmitter.on("order.completed", async (order: OrderDocument) => {
  const orderId = order.id;
  const orderTotal = `Rp${new Intl.NumberFormat('id-ID').format(order.total)}`;
  const products = order.order_items.map(item => ({
      title: item.product_title,
      variant: item.variant_id.name,
      price: `Rp${new Intl.NumberFormat('id-ID').format(item.price)}`,
      quantity: item.quantity,
      image: item.product_id.image
  }));

  // ? https://www.phind.com/agent?cache=clpqjretb0003ia07g9pc4v5a
  const source = fs.readFileSync("src/templates/order.hbs", "utf-8").toString();

  const template = handlebars.compile(source);

  const replacements = {
    products,
    orderId,
    orderTotal
  };
  const htmlToSend = template(replacements);

  const options = {
    from: "service@mail.com",
    to: order.email,
    subject: 'An order has been completed',
    html: htmlToSend,
  };

  await transporter.sendMail(options);
});
