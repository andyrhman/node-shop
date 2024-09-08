import { Request, Response } from "express";
import { CreateCategoryDTO } from "../validation/dto/categories/create-category.dto";
import { plainToClass } from "class-transformer";
import { isUUID, validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { UpdateCategoryDTO } from "../validation/dto/categories/update-category.dto";
import myPrisma from "../config/db.config";

export const Categories = async (req: Request, res: Response) => {
    res.send(
        await myPrisma.category.findMany({ include: { product: true } })
    );
};

export const AdminAllCategories = async (req: Request, res: Response) => {
    res.send(await myPrisma.category.findMany());
};

export const CreateCategory = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(CreateCategoryDTO, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        // Use the utility function to format and return the validation errors
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const category = await myPrisma.category.create({ data: { ...body } });

    res.send(category);
};

export const GetCategory = async (req: Request, res: Response) => {
    res.send(
        await myPrisma.category.findUnique({ where: { id: req.params.id } })
    );
};

export const UpdateCategory = async (req: Request, res: Response) => {
    const { id }: any = req.params;
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

    const category = await myPrisma.category.findUnique({ where: { id } });

    if (!category) {
        return res.status(404).send({ message: "Category Not Found!" });
    }
    res.status(202).send(await myPrisma.category.update({ where: { id }, data: { ...body } }));
};

export const DeleteCategory = async (req: Request, res: Response) => {
    try {
        const deleted = await myPrisma.category.delete({ where: { id: req.params.id } });

        res.status(204).send(null);
    } catch (error) {
        return res.status(400).send({ message: "Category Not Found!" });
    }
};
