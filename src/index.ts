require("dotenv").config();

import logger from "./config/logger.config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import myDataSource from "./config/db.config";
import EventEmitter from 'events';
import { routes } from "./routes";
import { ValidationMiddleware } from "./middleware/validation.middleware";

export const eventEmitter = new EventEmitter();

import "./event/auth.listener"
import "./event/order.listener"

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

myDataSource
.initialize()
.then(async () => {
  routes(app);
  
  logger.info("🗃️ Database has been initialized!");
  app.listen(8000, () => {
    logger.info("👍 Server listening on port 8000");
  });
})
  .catch((err) => {
    logger.error(err);
  });
