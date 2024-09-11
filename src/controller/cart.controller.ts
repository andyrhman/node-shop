import { Request, Response } from "express";
import { CartService } from "../service/cart.service";
import { CreateCartDTO } from "../validation/dto/carts/create.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { UpdateCartDto } from "../validation/dto/carts/update.dto";
import { Prisma } from "@prisma/client";
import myPrisma from "../config/db.config";

export const Carts = async (req: Request, res: Response) => {
    const cartService = new CartService(myPrisma);

    let carts = (await cartService.find({}, { user: true })).map(c => {
        const user = (c as any).user;
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return { ...c, user: userWithoutPassword };
        }
        return c;
    });

    if (req.query.search) {
        const search = req.query.search.toString().toLowerCase();

        carts = carts.filter((cart: any) => {
            const userMatches =
                cart.user &&
                (cart.user.fullName.toLowerCase().includes(search) ||
                    cart.user.username.toLowerCase().includes(search) ||
                    cart.user.email.toLowerCase().includes(search));

            const productMatches = cart.product_title
                .toLowerCase()
                .includes(search);

            return productMatches || userMatches;
        });
    }
    if (req.query.sortByCompleted || req.query.sortByDate) {
        const sortByCompleted = req.query.sortByCompleted
            ?.toString()
            .toLowerCase();
        const sortByDate = req.query.sortByDate?.toString().toLowerCase();

        carts.sort((a, b) => {
            if (sortByCompleted) {
                if (sortByCompleted === "asc") {
                    if (a.completed !== b.completed) {
                        return a.completed ? 1 : -1;
                    }
                } else {
                    if (a.completed !== b.completed) {
                        return a.completed ? -1 : 1;
                    }
                }
            }

            if (sortByDate) {
                if (sortByDate === "newest") {
                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
                } else {
                    return (
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    );
                }
            }

            return 0;
        });
    }

    res.send(carts);
};

export const GetUserCart = async (req: Request, res: Response) => {
    const cartService = new CartService(myPrisma);
    res.send(await cartService.findOne({ id: req.params.id }));
};

export const CreateCart = async (req: Request, res: Response) => {
    const body = req.body as CreateCartDTO; // Explicitly cast the body to CreateCartDTO
    const input = plainToClass(CreateCartDTO, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const user = req["id"];
    const cartService = new CartService(myPrisma);
    const existingCartItem = await cartService.findCartItemByProductAndVariant(
        body.product_id,
        body.variant_id,
        user
    );

    if (existingCartItem) {
        existingCartItem.quantity += body.quantity;
        return res.send(
            await cartService.update(existingCartItem.id, existingCartItem)
        );
    } else {
        const cartData: Prisma.CartCreateInput = {
            product_title: body.product_title,
            quantity: body.quantity,
            price: body.price,
            user: { connect: { id: user } },
            product: { connect: { id: body.product_id } },
            variant: { connect: { id: body.variant_id } },
            order: undefined
        };

        const created = await myPrisma.cart.create({
            data: cartData,
        });
        return res.send(created);
    }
};

export const GetAuthUserCart = async (req: Request, res: Response) => {
    const cartService = new CartService(myPrisma);
    const user = req["id"];
    const cart = await cartService.findUserCart({ user_id: user }, { variant: true, product: true });
    if (!cart) {
        return res.status(400).send({ message: "Invalid Request" });
    }
    res.send(cart);
};

export const UpdateCartQuantity = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(UpdateCartDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        // Use the utility function to format and return the validation errors
        return res.status(400).json(formatValidationErrors(validationErrors));
    }
    const user = req["id"];

    const cartService = new CartService(myPrisma);
    const checkUser = await cartService.findOne({
        id: req.params.id,
        user_id: user,
    });

    if (!checkUser) {
        return res.status(400).send({ message: "Not Allowed" });
    }

    res.send(await cartService.update(req.params.id, body));
};

export const DeleteCart = async (req: Request, res: Response) => {
    const cartService = new CartService(myPrisma);
    const user_id = req["id"];
    const cart = await cartService.findOne({ id: req.params.cart_id });
    if (!cart) {
        return res.status(404).send({ message: "Cart Not Found" });
    }
    if (cart.user_id !== user_id) {
        return res.status(403).send({ message: "Not Allowed" });
    }
    await cartService.deleteUserCart(user_id, req.params.cart_id);
    res.status(204).send(null);
};

export const GetTotalCart = async (req: Request, res: Response) => {
    const user = req["id"];
    const cartService = new CartService(myPrisma);
    const totalData = await cartService.totalPriceAndCount({
        user_id: user,
    });
    res.send({
        totalItems: totalData.totalItems,
        totalPrice: totalData.totalPrice,
    });
};
