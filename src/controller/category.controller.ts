import { Request, Response } from "express";
import myDataSource from "../config/db.config";
import { Category } from "../entity/category.entity";
import logger from "../config/logger.config";
import { CreateCategoryDTO } from "../validation/dto/category/create-category.dto";
import { plainToClass } from "class-transformer";
import { isUUID, validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { UpdateCategoryDTO } from "../validation/dto/category/update-category.dto";

export const Categories = async (req: Request, res: Response) => {
  try {
    res.send(
      await myDataSource
        .getRepository(Category)
        .find({ relations: ["product"] })
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
    res.send(await myDataSource.getRepository(Category).find({}));
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

    const category = await myDataSource.getRepository(Category).save(body);

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
    res.send(
      await myDataSource
        .getRepository(Category)
        .findOne({ where: { id: req.params.id } })
    );
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
    const repository = myDataSource.getRepository(Category);
    const body = req.body;
    const input = plainToClass(UpdateCategoryDTO, body);
    const validationErrors = await validate(input);

    if (!isUUID(id)) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const category = await repository.findOne({ where: { id: id } });

    if (!category) {
      return res.status(404).send({ message: "Invalid Request" });
    }
    res.status(202).send(await repository.update(id, body));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const DeleteCategory = async (req: Request, res: Response) => {
  try {
    await myDataSource.getRepository(Category).delete(req.params.id);

    res.status(204).send(null);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};
