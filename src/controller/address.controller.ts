// import { Response, Request } from "express";
// import logger from "../config/logger.config";
// import { AddressService } from "../service/address.service";
// import { plainToClass } from "class-transformer";
// import { AddressCreateDto } from "../validation/dto/address/create.dto";
// import { validate } from "class-validator";
// import { formatValidationErrors } from "../validation/utility/validation.utility";
// import { AddressUpdateDto } from "../validation/dto/address/update.dto";

// export const Address = async (req: Request, res: Response) => {
//   try {
//     const addressService = new AddressService();
//     res.send(await addressService.find({}, ["user"]));
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const CreateAddress = async (req: Request, res: Response) => {
//   try {
//     const body = req.body;
//     const input = plainToClass(AddressCreateDto, body);
//     const validationErrors = await validate(input);

//     if (validationErrors.length > 0) {
//       // Use the utility function to format and return the validation errors
//       return res.status(400).json(formatValidationErrors(validationErrors));
//     }

//     const authUser = req["id"];
//     const addressService = new AddressService();
//     const existingAddress = await addressService.findOne({ user_id: authUser });

//     if (existingAddress) {
//       return res.status(400).send({ message: "Address already exists" });
//     }

//     await addressService.create({
//       ...body,
//       user_id: authUser,
//     });

//     res.send({
//       message: "Address created successfully",
//     });
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const GetAddress = async (req: Request, res: Response) => {
//   try {
//     const id = req["id"];

//     const addressService = new AddressService();

//     const checkAddress = await addressService.findOne({ user_id: id });

//     if (!checkAddress) {
//       return res.status(404).send({ message: "Address not found" });
//     }

//     res.send(await addressService.findOne({ user_id: id }));
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const UpdateAddress = async (req: Request, res: Response) => {
//   try {
//     const body = req.body;
//     const input = plainToClass(AddressUpdateDto, body);
//     const validationErrors = await validate(input);

//     if (validationErrors.length > 0) {
//       // Use the utility function to format and return the validation errors
//       return res.status(400).json(formatValidationErrors(validationErrors));
//     }

//     const addressService = new AddressService();
//     const id = req["id"];

//     const checkAddress = await addressService.findOne({ user_id: id });

//     if (!checkAddress) {
//       return res.status(404).send({ message: "Address not found" });
//     }

//     await addressService.update(checkAddress.id, body);

//     res.status(202).send({
//       message: "Updated Successfully!",
//     });
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };

// export const DeleteAddress = async (req: Request, res: Response) => {
//   try {
//     const addressService = new AddressService();
//     const id = req["id"];

//     const checkAddress = await addressService.findOne({ user_id: id });

//     if (!checkAddress) {
//       return res.status(404).send({ message: "Address not found" });
//     }

//     await addressService.delete(checkAddress.id);

//     res.status(204).send(null);
//   } catch (error) {
//     if (process.env.NODE_ENV === "development") {
//       logger.error(error);
//     }
//     return res.status(400).send({ message: "Invalid Request" });
//   }
// };