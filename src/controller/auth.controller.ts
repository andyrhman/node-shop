import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { RegisterDto } from "../validation/dto/register.dto";
import { validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { User } from "../models/user.schema";
import { sign } from "jsonwebtoken";
import { eventEmitter } from "../index";
import { Token } from "../models/token.schema";
import logger from "../config/logger.config";
import myDataSource from "../config/db.config";
import transporter from "../config/transporter.config";
import * as argon2 from "argon2";
import * as crypto from "crypto";
import * as fs from "fs";
import * as handlebars from "handlebars";
// import * as FB from 'fb';
// import { TokenService } from "../service/token.service";
import { OAuth2Client } from "google-auth-library";

// export const Register = async (req: Request, res: Response) => {
//   try {
//     const body = req.body;
//     const input = plainToClass(RegisterDto, body);
//     const validationErrors = await validate(input);

//     if (validationErrors.length > 0) {
//       // Use the utility function to format and return the validation errors
//       return res.status(400).json(formatValidationErrors(validationErrors));
//     }

//     const existingUser = await myDataSource
//       .getRepository(User)
//       .findOne({ where: { username: body.username, email: body.email } });

//     if (existingUser) {
//       return res.status(400).send("Username or email already exists");
//     }

//     const hashPassword = await argon2.hash(body.password);

//     const user = await myDataSource.getRepository(User).save({
//       fullName: body.fullName,
//       username: body.username.toLowerCase(),
//       email: body.email.toLowerCase(),
//       password: hashPassword,
//     });

//     delete user.password;

//     eventEmitter.emit("user.created", user);
//     res.send(user);
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const Login = async (req: Request, res: Response) => {
//   try {
//     const repository = myDataSource.getRepository(User);

//     const body = req.body;

//     let user: User;

//     // Check whether to find the user by email or username based on input.
//     if (body.email) {
//       user = await repository.findOne({
//         where: { email: body.email },
//         select: ["id", "password", "is_user"],
//       });
//     } else if (body.username) {
//       user = await repository.findOne({
//         where: { username: body.username },
//         select: ["id", "password", "is_user"],
//       });
//     }

//     // If user doesn't exist, throw a BadRequestException indicating invalid credentials.
//     if (!user) {
//       return res.status(400).send({ message: "Username or Email is Invalid" });
//     }
    
//     if (user.is_verified === false) {
//       return res
//         .status(400)
//         .send("Please verfiy your email first, before log in.");
//     }

//     if (!(await argon2.verify(user.password, body.password))) {
//       return res.status(400).send({ message: "Password is invalid" });
//     }

//     // Calculate the expiration time for the refresh token
//     // Generate a refresh token using the JWT service with the calculated expiration time.
//     const refreshTokenExpiration = body.rememberMe
//       ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
//       : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Adding 7 days in milliseconds

//     // * Check for role
//     const adminLogin = req.path === "/api/admin/login";

//     if (user.is_user && adminLogin) {
//       return res.status(400).send({ message: "Unauthorized" });
//     }

//     const jwt = sign(
//       {
//         id: user.id,
//         scope: adminLogin ? "admin" : "user",
//       },
//       process.env.JWT_SECRET_ACCESS
//     );

//     res.cookie("my_session", jwt, {
//       httpOnly: true,
//       expires: refreshTokenExpiration,
//     });
//     res.status(200).send({ message: "Successfully logged in!" });
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const AuthenticatedUser = async (req: Request, res: Response) => {
//   try {
//     const user = req["user"];

//     if (req.path === "/api/admin/user") {
//       return res.send(user);
//     }

//     res.send(user);
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const Logout = async (req: Request, res: Response) => {
//   try {
//     res.cookie("my_session", "", { maxAge: 0 });

//     res.status(204).send(null);
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const UpdateInfo = async (req: Request, res: Response) => {
//   try {
//     const body = req.body;

//     const repository = myDataSource.getRepository(User);

//     const user = req["user"];

//     const existingUser = await repository.findOne({ where: { id: user.id } });

//     if (!existingUser) {
//       return res.status(400).send({ message: "User not found" });
//     }

//     if (body.fullname) {
//       existingUser.fullName = body.fullname;
//     }

//     if (body.email && body.email !== existingUser.email) {
//       const existingUserByEmail = await repository.findOne({
//         where: { email: body.email },
//       });
//       if (existingUserByEmail) {
//         return res.status(400).send({ message: "Email already exists" });
//       }
//       existingUser.email = body.email;
//     }

//     if (body.username && body.username !== existingUser.username) {
//       const existingUserByUsername = await repository.findOne({
//         where: { username: body.username },
//       });
//       if (existingUserByUsername) {
//         return res.status(400).send({ message: "Username already exists" });
//       }
//       existingUser.username = body.username;
//     }

//     await repository.update(user.id, existingUser);

//     res.send(await repository.findOne({ where: { id: user.id } }));
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const UpdatePassword = async (req: Request, res: Response) => {
//   try {
//     const body = req.body;

//     const repository = myDataSource.getRepository(User);

//     const user = req["user"];

//     if (body.password !== body.confirm_password) {
//       return res.status(400).send({ message: "Password do not match." });
//     }

//     const hashPassword = await argon2.hash(body.password);

//     await repository.update(user.id, {
//       password: hashPassword,
//     });

//     res.send(user);
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const VerifyAccount = async (req: Request, res: Response) => {
//   try {
//     const body = req.params;

//     const userRepository = myDataSource.getRepository(User);

//     const tokenRepository = new TokenService();

//     const userToken = await tokenRepository.findByTokenExpiresAt(body.token);

//     if (!userToken) {
//       return res.status(400).send({ message: "Invalid verify ID" });
//     }

//     if (userToken.used) {
//       return res
//         .status(400)
//         .send({ message: "Verify ID has already been used" });
//     }

//     const user = await userRepository.findOne({
//       where: { email: userToken.email, id: userToken.user_id },
//     });
//     if (!user) {
//       return res.status(400).send({ message: "User not found" });
//     }
//     if (user.is_verified) {
//       return res
//         .status(400)
//         .send({ message: "Your account had already verified" });
//     }

//     if (user.email !== userToken.email && user.id !== userToken.user_id) {
//       return res.status(400).send({ message: "Invalid Verify ID or email" });
//     }

//     await tokenRepository.update(userToken.id, { used: true });
//     await userRepository.update(user.id, { is_verified: true });

//     res.status(200).send({ message: "Account verified successfully" });
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const ResendVerify = async (req: Request, res: Response) => {
//   try {
//     const body = req.body;

//     const userRepository = myDataSource.getRepository(User);

//     const tokenRepository = myDataSource.getRepository(Token);

//     if (!body.email) {
//       return res.status(400).send({ message: "Provide your email address" });
//     }

//     const user = await userRepository.findOne({ where: { email: body.email } });
//     if (!user) {
//       return res.status(400).send({ message: "Email not found" });
//     }

//     if (user.is_verified) {
//       return res
//         .status(400)
//         .send({ message: "Your account has already verified" });
//     }

//     const token = crypto.randomBytes(16).toString("hex");

//     const tokenExpiresAt = Date.now() + 1 * 60 * 1000;

//     tokenRepository.save({
//       token,
//       email: user.email,
//       user_id: user.id,
//       expiresAt: tokenExpiresAt,
//     });

//     const url = `${process.env.ORIGIN_2}/verify/${token}`;

//     const name = user.fullName;

//     // ? https://www.phind.com/agent?cache=clpqjretb0003ia07g9pc4v5a
//     const source = fs
//       .readFileSync("src/templates/auth.hbs", "utf-8")
//       .toString();

//     const template = handlebars.compile(source);

//     const replacements = {
//       name,
//       url,
//     };
//     const htmlToSend = template(replacements);

//     const options = {
//       from: "from@mail.com",
//       to: user.email,
//       subject: "Verify your email",
//       html: htmlToSend,
//     };

//     await transporter.sendMail(options);

//     res.status(200).send({ message: "Email has successfully sent" });
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const googleAuth = async (req: Request, res: Response) => {
//   try {
//     const { token, rememberMe } = req.body;
//     const repository = myDataSource.getRepository(User);
//     const clientId = process.env.GOOGLE_CLIENT_ID;
//     const client = new OAuth2Client(clientId);

//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: clientId,
//     });

//     const googleUser = ticket.getPayload();

//     if (!googleUser) {
//       return res.status(401).send("Unauthorized");
//     }

//     let user = await repository.findOne({ where: { email: googleUser.email } });

//     if (!user) {
//       // Generate a random username and password
//       const randomUsername = `user${Math.floor(Math.random() * 1000)}`;
//       const randomPassword = Math.random().toString(36).slice(-10);
//       const hashedPassword = await argon2.hash(randomPassword);

//       // Generate a random 10-character password
//       user = await repository.save({
//         fullName: randomUsername,
//         username: randomUsername,
//         email: googleUser.email,
//         password: hashedPassword,
//       });
//     }

//     // Calculate the expiration time for the refresh token
//     // Generate a refresh token using the JWT service with the calculated expiration time.
//     const refreshTokenExpiration = rememberMe
//       ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
//       : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Adding 7 days in milliseconds

//     const jwt = sign(
//       {
//         id: user.id,
//         scope: "user",
//       },
//       process.env.JWT_SECRET_ACCESS
//     );

//     res.cookie("my_session", jwt, {
//       httpOnly: true,
//       expires: refreshTokenExpiration,
//     });
//     res.status(200).send({ message: "Succesfully logged in" });
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const FacebookAuth = async (req: Request, res: Response) => {
//   try {
//     const { token, rememberMe } = req.body;
//     const repository = myDataSource.getRepository(User);
//     const appId = process.env.FACEBOOK_APP_ID;
//     const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

//     var FB = require("fb");

//     FB.options({
//       appId: appId,
//       appSecret: clientSecret,
//       version: "v11.0",
//     });

//     const jwt = await new Promise((resolve, reject) => {
//       FB.api(
//         "me",
//         { fields: ["id", "name", "email"], access_token: token },
//         async (res: any) => {
//           if (!res || res.error) {
//             console.log(!res ? "error occurred" : res.error);
//             reject(res.status(401).send({ message: "Unauthorized" }));
//             return;
//           }

//           let user = await repository.findOne({ where: { email: res.email } });

//           if (!user) {
//             const randomUsername = `user${Math.floor(Math.random() * 1000)}`;
//             const randomPassword = Math.random().toString(36).slice(-10);
//             const hashedPassword = await argon2.hash(randomPassword);

//             user = await repository.save({
//               fullName: randomUsername,
//               username: randomUsername,
//               email: res.email,
//               password: hashedPassword,
//             });
//           }

//           const refreshTokenExpiration = rememberMe
//             ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
//             : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Adding 7 days in milliseconds

//           const adminLogin = req.path === "/api/admin/login";

//           if (user.is_user && adminLogin) {
//             return res.status(400).send({ message: "Unauthorized" });
//           }

//           res.cookie("my_session", jwt, {
//             httpOnly: true,
//             expires: refreshTokenExpiration,
//           });

//           resolve(jwt);
//         }
//       );
//     });

//     res.status(200).send({ message: "Succesfully logged in" });
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };
