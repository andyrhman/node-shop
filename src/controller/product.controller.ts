import { Request, Response } from "express";
import { ProductService } from "../service/product.service";
import { Product } from "../entity/product.entity";
import { Category } from "../entity/category.entity";
import { ProductCreateDto } from "../validation/dto/products/product-create.dto";
import { plainToClass } from "class-transformer";
import { isUUID, validate } from "class-validator";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { ProductImages } from "../entity/product-images.entity";
import { ProductVariation } from "../entity/product-variation.entity";
import logger from "../config/logger.config";
import myDataSource from "../config/db.config";
import slugify from "slugify";
import { ProductUpdateDto } from "../validation/dto/products/product-update.dto";

export const Products = async (req: Request, res: Response) => {
  try {
    const repository = new ProductService();
    let products = await repository.find({}, ["variant", "category"]);

    // Add average rating to each product.
    // for (let product of products) {
    //     (product as any).averageRating = await this.reviewService.calculateAverageRating(product.id);
    // }

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
        p.variant.some((v) => filterByVariant.includes(v.name.toLowerCase()))
      );
    }
    if (req.query.filterByCategory) {
      const filterByCategory = req.query.filterByCategory
        .toString()
        .toLowerCase()
        .split(",");
      products = products.filter((p) =>
        filterByCategory.includes(p.category.name.toLowerCase())
      );
    }
    if (req.query.sortByPrice || req.query.sortByDate) {
      const sortByPrice = req.query.sortByPrice?.toString().toLowerCase();
      const sortByDate = req.query.sortByDate?.toString().toLowerCase();

      products.sort((a, b) => {
        if (sortByPrice) {
          if (sortByPrice === "asc") {
            return b.price - a.price;
          } else {
            return a.price - b.price;
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
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const CreateProduct = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const input = plainToClass(ProductCreateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const productRepository = myDataSource.getRepository(Product);
    const categoryRepository = myDataSource.getRepository(Category);

    const category = await categoryRepository.findOne({
      where: { id: body.category },
    });
    const p = new Product();
    p.title = body.title;
    p.slug = slugify(body.title, {
      lower: true,
      strict: true,
      trim: true,
    });
    p.description = body.description;
    p.image = body.image;
    p.price = body.price;
    if (!isUUID(body.category)) {
      return res.status(400).send({ message: "Invalid UUID format" });
    }
    if (!category) {
      return res.status(400).send({ message: "Category does not exists" });
    }
    p.category_id = body.category;

    const product = await productRepository.save(p);
    for (let i of body.images) {
      const productImages = new ProductImages();
      productImages.productId = product.id;
      productImages.image = i;
      await myDataSource.getRepository(ProductImages).save(productImages);
    }

    for (let v of body.variants) {
      const productVariant = new ProductVariation();
      productVariant.name = v;
      productVariant.product_id = product.id;
      await myDataSource.getRepository(ProductVariation).save(productVariant);
    }

    res.send(product);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const AllVariants = async (req: Request, res: Response) => {
  try {
    res.send(await myDataSource.getRepository(ProductVariation).find({}));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const GetProduct = async (req: Request, res: Response) => {
  try {
    const product = await myDataSource.getRepository(Product).findOne({
      where: { slug: req.params.slug },
      relations: [
        "product_images",
        "variant",
        "category",
        // "review",
        // "review.user",
      ],
    });

    // Add average rating and review count to the product
    // const ratingAndReviewCount =
    //   await this.reviewService.getRatingAndReviewCount(product.id);
    // (product as any).averageRating = ratingAndReviewCount.averageRating;
    // (product as any).reviewCount = ratingAndReviewCount.reviewCount;

    res.send(product);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const GetProductAdmin = async (req: Request, res: Response) => {
  try {
    res.send(
      await myDataSource.getRepository(Product).findOne({
        where: { id: req.params.id },
        relations: ["product_images", "variant", "category"],
      })
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const UpdateProduct = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const repository = myDataSource.getRepository(Product);
    const input = plainToClass(ProductUpdateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const products = await repository.findOne({ where: { id: req.params.id } });
    if (!products) {
      return res.status(404).send({ message: "Invalid Request" });
    }

    await repository.update(req.params.id, body);

    res.send(await repository.findOne({ where: { id: req.params.id } }));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const UpdateProductVariants = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const repository = myDataSource.getRepository(Product);
    const input = plainToClass(ProductUpdateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const product = await repository.findOne({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).send({ message: "Invalid Request" });
    }

    for (let v of body.variants) {
      const productVariant = new ProductVariation();
      productVariant.name = v;
      productVariant.product_id = product.id;
      await myDataSource.getRepository(ProductVariation).save(productVariant);
    }

    res.send(
      await myDataSource
        .getRepository(ProductVariation)
        .find({ where: { product_id: req.params.id } })
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const UpdateProductImages = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const repository = myDataSource.getRepository(Product);
    const input = plainToClass(ProductUpdateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const product = await repository.findOne({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).send({ message: "Invalid Request" });
    }

    for (let i of body.images) {
      const productImages = new ProductImages();
      productImages.productId = req.params.id;
      productImages.image = i;
      await myDataSource.getRepository(ProductImages).save(productImages);
    }

    res.send(
      await myDataSource
        .getRepository(ProductImages)
        .find({ where: { productId: req.params.id } })
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const Delete = async (req: Request, res: Response) => {
  try {
    // * Find the related images
    const findImages = await myDataSource
      .getRepository(ProductImages)
      .find({ where: { productId: req.params.id } });

    // * Delete the multiple images
    for (const image of findImages) {
      await myDataSource.getRepository(ProductImages).delete(image.productId);
    }

    // * Delete the related variants
    for (const variant of findImages) {
      await myDataSource
        .getRepository(ProductVariation)
        .delete(variant.productId);
    }

    // * Delete the product
    return myDataSource.getRepository(Product).delete(req.params.id);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const DeleteProductImage = async (req: Request, res: Response) => {
  try {
    await myDataSource.getRepository(ProductImages).delete(req.params.id);
    res.status(204).send(null);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const DeleteProductVariation = async (req: Request, res: Response) => {
  try {
    await myDataSource.getRepository(ProductVariation).delete(req.params.id);
    res.status(204).send(null);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};
