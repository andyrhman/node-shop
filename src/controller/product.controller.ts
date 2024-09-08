import { Request, Response } from "express";
import { ProductService } from "../service/product.service";
import { ProductCreateDto } from "../validation/dto/products/product-create.dto";
import { plainToClass } from "class-transformer";
import { isUUID, validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { ProductUpdateDto } from "../validation/dto/products/product-update.dto";
import { ProductImageService } from "../service/product-images.service";
import { ProductVariantService } from "../service/product-variant.service";
import { ReviewService } from "../service/review.service";
import slugify from "slugify";
import myPrisma from "../config/db.config";

export const Products = async (req: Request, res: Response) => {
    const repository = new ProductService(myPrisma);
    const reviewService = new ReviewService(myPrisma);

    let products = await repository.find({}, { variant: true, category: true });

    // Add average rating to each product.
    for (let product of products) {
        (product as any).averageRating =
            await reviewService.calculateAverageRating(product.id);
    }

    // Existing filter and sort code...
    if (req.query.search) {
        const search = req.query.search.toString().toLowerCase();
        products = products.filter(
            (p) =>
                p.title.toLowerCase().indexOf(search) >= 0 ||
                p.description.toLowerCase().indexOf(search) >= 0
        );
    }
    if (req.query.filterByVariant) {
        const filterByVariant = req.query.filterByVariant
            .toString()
            .toLowerCase()
            .split(",");
        products = products.filter((p) =>
            (p as any).variant.some((v) => filterByVariant.includes(v.name.toLowerCase()))
        );
    }
    if (req.query.filterByCategory) {
        const filterByCategory = req.query.filterByCategory
            .toString()
            .toLowerCase()
            .split(",");
        products = products.filter((p) =>
            filterByCategory.includes((p as any).category.name.toLowerCase())
        );
    }
    if (req.query.sortByPrice || req.query.sortByDate) {
        const sortByPrice = req.query.sortByPrice?.toString().toLowerCase();
        const sortByDate = req.query.sortByDate?.toString().toLowerCase();

        products.sort((a, b) => {
            if (sortByPrice) {
                if (sortByPrice === "asc") {
                    return (b as any).price - (a as any).price;
                } else {
                    return (a as any).price - (b as any).price;
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
    res.send(products);
};

export const CreateProduct = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(ProductCreateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        // Use the utility function to format and return the validation errors
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const category = await myPrisma.category.findUnique({
        where: { id: body.category },
    });

    if (!isUUID(body.category)) {
        return res.status(400).send({ message: "Invalid UUID format" });
    }
    if (!category) {
        return res.status(400).send({ message: "Category does not exists" });
    }

    const product = await myPrisma.product.create({
        data: {
            title: body.title,
            slug: slugify(body.title, {
                lower: true,
                strict: true,
                trim: true,
            }),
            description: body.description,
            image: body.image,
            price: body.price,
            category_id: body.category
        }
    });

    for (let i of body.images) {
        await myPrisma.productImages.create({
            data: {
                product_id: product.id,
                image: i
            }
        });
    }

    for (let v of body.variants) {
        await myPrisma.productVariation.create({
            data: {
                name: v,
                product_id: product.id
            }
        });
    }

    res.send(product);
};

export const Variants = async (req: Request, res: Response) => {
    res.send(await myPrisma.productVariation.findMany());
};

export const GetProduct = async (req: Request, res: Response) => {
    const reviewService = new ReviewService(myPrisma);

    const product = await myPrisma.product.findFirst({
        where: { slug: req.params.slug },
        include: {
            product_images: true,
            variant: true,
            category: true,
            review: { include: { user: true } }
        }
    });

    // Add average rating and review count to the product
    const ratingAndReviewCount =
        await reviewService.getRatingAndReviewCount(product.id);
    (product as any).averageRating = ratingAndReviewCount.averageRating;
    (product as any).reviewCount = ratingAndReviewCount.reviewCount;

    res.send(product);
};

export const GetProductAdmin = async (req: Request, res: Response) => {
    res.send(
        await myPrisma.product.findUnique({
            where: { id: req.params.id },
            include: { product_images: true, variant: true, category: true }
        })
    );
};

export const UpdateProduct = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(ProductUpdateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        // Use the utility function to format and return the validation errors
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Invalid Request" });
    }
    const products = await myPrisma.product.findUnique({ where: { id: req.params.id } });

    if (!products) {
        return res.status(404).send({ message: "Product Not Found!" });
    }

    const updated = await myPrisma.product.update({ where: { id: req.params.id }, data: { ...body } });

    res.send(updated);
};

export const UpdateProductVariants = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(ProductUpdateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        // Use the utility function to format and return the validation errors
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Invalid Request" });
    }
    const product = await myPrisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
        return res.status(404).send({ message: "Invalid Request" });
    }

    for (let v of body.variants) {
        await myPrisma.productVariation.create({
            data: {
                name: v,
                product_id: product.id
            }
        });
    }

    res.send(
        await myPrisma.productVariation.findMany({ where: { product_id: req.params.id } })
    );
};

export const UpdateProductImages = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(ProductUpdateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        // Use the utility function to format and return the validation errors
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Invalid Request" });
    }
    const product = await myPrisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
        return res.status(404).send({ message: "Invalid Request" });
    }

    for (let i of body.images) {
        await myPrisma.productImages.create({
            data: {
                product_id: req.params.id,
                image: i
            }
        });
    }

    res.send(
        await myPrisma.productImages.findMany({ where: { product_id: req.params.id } })
    );
};

export const DeleteProduct = async (req: Request, res: Response) => {
    const product: any = await myPrisma.product.findUnique({ where: { id: req.params.id }, include: { product_images: true, variant: true } });

    // * Delete the multiple images
    for (const image of product.product_images) {
        await myPrisma.productImages.delete({ where: { id: image.id } });
    }

    // * Delete the related variants
    for (const variant of product.variant) {
        await myPrisma.productVariation.delete({ where: { id: variant.id } });
    }

    // * Delete the product
    await myPrisma.product.delete({ where: { id: req.params.id } });

    res.status(204).send(null);
};

export const DeleteProductImage = async (req: Request, res: Response) => {
    await myPrisma.productImages.delete({ where: { id: req.params.id } });
    res.status(204).send(null);
};

export const DeleteProductVariation = async (req: Request, res: Response) => {
    await myPrisma.productVariation.delete({ where: { id: req.params.id } });
    res.status(204).send(null);
};

export const GetProductAvgRating = async (req: Request, res: Response) => {
    const reviewService = new ReviewService(myPrisma);
    const averageRating = await reviewService.calculateAverageRating(req.params.id);
    res.status(200).send({ averageRating });
};
