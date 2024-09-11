import { Response, Request } from "express";
import { AddressService } from "../service/address.service";
import { plainToClass } from "class-transformer";
import { AddressCreateDto } from "../validation/dto/address/create.dto";
import { validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { AddressUpdateDto } from "../validation/dto/address/update.dto";
import myPrisma from "../config/db.config";

export const Address = async (req: Request, res: Response) => {
    const addressService = new AddressService(myPrisma);
    const addresses = await addressService.find({}, { user: true });

    const sanitizedAddresses = addresses.map(address => {
        const user = (address as any).user;
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return { ...address, user: userWithoutPassword };
        }
        return address;
    });

    res.send(sanitizedAddresses);
};

export const CreateAddress = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(AddressCreateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        // Use the utility function to format and return the validation errors
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const user = req["id"];
    const addressService = new AddressService(myPrisma);
    const existingAddress = await addressService.findOne({ user_id: user });

    if (existingAddress) {
        return res.status(400).send({ message: "Address already exists" });
    }

    await addressService.create({
        ...body,
        user_id: user,
    });

    res.send({
        message: "Address created successfully",
    });
};

export const GetAddress = async (req: Request, res: Response) => {
    const user = req["id"];

    const addressService = new AddressService(myPrisma);

    const checkAddress = await addressService.findOne({ user_id: user });

    if (!checkAddress) {
        return res.status(404).send({ message: "Address not found" });
    }

    res.send(checkAddress);
};

export const UpdateAddress = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(AddressUpdateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        // Use the utility function to format and return the validation errors
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const addressService = new AddressService(myPrisma);
    const user = req["id"];

    const checkAddress = await addressService.findOne({ user_id: user });

    if (!checkAddress) {
        return res.status(404).send({ message: "Address not found" });
    }

    await addressService.update(checkAddress.id, body);

    res.status(202).send({
        message: "Updated Successfully!",
    });
};

export const DeleteAddress = async (req: Request, res: Response) => {
    const addressService = new AddressService(myPrisma);
    const user = req["id"];

    const checkAddress = await addressService.findOne({ user_id: user });

    if (!checkAddress) {
        return res.status(404).send({ message: "Address not found" });
    }

    await addressService.delete(checkAddress.id);

    res.status(204).send(null);
};