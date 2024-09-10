import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import { routes } from "./routes";
import { ValidationMiddleware } from "./middleware/validation.middleware";
import { AppError } from "./middleware/apperror.middleware";
import { globalErrorHandler } from "./middleware/error.middleware";

dotenv.config();

import "./event/auth.listener";
import "./event/order.listener";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(ValidationMiddleware);
app.use(
  cors({
    credentials: true,
    origin: [`${process.env.ORIGIN_1}`, `${process.env.ORIGIN_2}`],
  })
);

routes(app);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Continuing...');
  console.error(err);
});

process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! Continuing...');
  console.error(err);
  app.use((req, res, next) => {
    next(err);
  });
});
