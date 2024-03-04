import { Request, Response } from "express";
import logger from "../config/logger.config";
import * as crypto from "crypto";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as argon2 from 'argon2'
import { UserService } from "../service/user.service";
import { ResetService } from "../service/reset.service";
import transporter from "../config/transporter.config";
import { ResetDTO } from "../validation/dto/reset/reset.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";

export const Forgot = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const userService = new UserService();
    const resetService = new ResetService();

    if (!body.email) {
      return res.status(400).send({ message: "Email must be provided" });
    }

    const resetToken = crypto.randomBytes(16).toString("hex");
    const tokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds
    const checkEmail = await userService.findOne({ email: body.email });
    if (!checkEmail) {
      return res.status(404).send({ message: "Email not found!" });
    }
    // Save the reset token and expiration time
    await resetService.create({
      token: resetToken,
      email: body.email,
      expiresAt: tokenExpiresAt,
      used: false, // Token is not used yet
    });

    const url = `${process.env.ORIGIN_2}/reset/${resetToken}`;

    // ? https://www.phind.com/agent?cache=clpqjretb0003ia07g9pc4v5a
    const source = fs
      .readFileSync("src/templates/auth.hbs", "utf-8")
      .toString();

    const template = handlebars.compile(source);

    const replacements = {
      name: checkEmail.fullName,
      url,
    };

    const htmlToSend = template(replacements);

    const options = {
      from: "service@mail.com",
      to: body.email,
      subject: "Reset Your Password",
      html: htmlToSend,
    };

    await transporter.sendMail(options);

    res.status(200).send({ message: "Success! Please check your email." });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const Reset = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const input = plainToClass(ResetDTO, body);
    const validationErrors = await validate(input);

    const resetService = new ResetService();
    const userService = new UserService();

    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (body.password !== body.confirm_password) {
      return res.status(400).send({ message: "Password do not match." });
    }

    const resetToken = await resetService.findByTokenExpiresAt(body.token);
    if (!resetToken) {
      return res.status(400).send({ message: "Token is Invalid or Expired" });
    }

    if (resetToken.used) {
      return res.status(400).send({ message: "Token has already been used" });
    }

    const user = await userService.findOne({ email: resetToken.email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.email !== resetToken.email) {
      return res.status(400).send({ message: "Invalid token or email" });
    }

    await userService.update(user.id, {
      password: await argon2.hash(body.password),
    });
    await resetService.update(resetToken.id, {
      used: true,
    });

    res.send({ message: "Password reset successfuly" });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};
