import transporter from "../config/transporter.config";
import { eventEmitter } from "../index";
import { Token } from "../models/token.schema";
import { UserDocument } from "../models/user.schema";
import * as crypto from "crypto";
import * as fs from "fs";
import * as handlebars from "handlebars";

eventEmitter.on("user.created", async (user: UserDocument) => {
  const token = crypto.randomBytes(16).toString("hex");

  const tokenExpiresAt = Date.now() + 1 * 60 * 1000;

  // Save the reset token and expiration time
  await Token.create({
    token,
    email: user.email,
    user_id: user._id,
    expiresAt: tokenExpiresAt,
  });

  const url = `${process.env.ORIGIN_2}/verify/${token}`;

  const name = user.fullName;

  // ? https://www.phind.com/agent?cache=clpqjretb0003ia07g9pc4v5a
  const source = fs.readFileSync("src/templates/auth.hbs", "utf-8").toString();

  const template = handlebars.compile(source);

  const replacements = {
    name,
    url,
  };
  const htmlToSend = template(replacements);

  const options = {
    from: "from@mail.com",
    to: user.email,
    subject: "Verify your email",
    html: htmlToSend,
  };

  await transporter.sendMail(options);
});
