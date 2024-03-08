import { Request, Response } from "express";
import myDataSource from "../config/db.config";
import { Category } from "../models/category.schema";
import logger from "../config/logger.config";
import { CreateCategoryDTO } from "../validation/dto/categories/create-category.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { UpdateCategoryDTO } from "../validation/dto/categories/update-category.dto";
import { isValidObjectId } from "mongoose";

export const Categories = async (req: Request, res: Response) => {
  try {
    res.send(
      await Category.find().populate('product')
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const AdminAllCategories = async (req: Request, res: Response) => {
  try {
    res.send(await Category.find());
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const CreateCategory = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const input = plainToClass(CreateCategoryDTO, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const category = await Category.create(body);

    res.send(category);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const GetCategory = async (req: Request, res: Response) => {
  try {
    res.send(await Category.findById(req.params.id));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const UpdateCategory = async (req: Request, res: Response) => {
  try {
    const { id }: any = req.params;

    const body = req.body;
    const input = plainToClass(UpdateCategoryDTO, body);
    const validationErrors = await validate(input);

    if (!isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    
    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).send({ message: "Invalid Request" });
    }
    res.status(202).send(await Category.findByIdAndUpdate(id, body));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const DeleteCategory = async (req: Request, res: Response) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    res.status(204).send(null);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};
