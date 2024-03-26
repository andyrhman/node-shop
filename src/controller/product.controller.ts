import { Request, Response } from "express";
import { ProductService } from "../service/product.service";
import { Product, ProductDocument } from "../models/product.schema";
import { Category } from "../models/category.schema";
import { ProductCreateDto } from "../validation/dto/products/product-create.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { isValidObjectId } from "mongoose";
import { formatValidationErrors } from "../validation/utility/validation.utility";
import { ProductImages } from "../models/product-images.schema";
import { ProductVariations } from "../models/product-variation.schema";
import logger from "../config/logger.config";
import slugify from "slugify";
import { ProductUpdateDto } from "../validation/dto/products/product-update.dto";
import { ProductImageService } from "../service/product-images.service";
import { ProductVariantService } from "../service/product-variant.service";
import { ReviewService } from "../service/review.service";

export const Products = async (req: Request, res: Response) => {
  try {
    const reviewService = new ReviewService();

    let products = await Product.find({}, { cart: 0 })
      .sort({ createdAt: -1 })
      .populate("variant", "name")
      .populate("product_images", "image")
      .populate({
        path: "review",
        select: {
          _id: 0,
          comment: 0,
          image: 0,
          user_id: 0,
          product_id: 0,
          variant_id: 0,
          order_id: 0,
          created_at: 0,
          updatedAt: 0,
        },
      })
      .populate("category_id", "name")
      .lean(); // Retrieve plain JavaScript objects

    // Add average rating to each product.
    for (let product of products) {
      product.averageRating = await reviewService.calculateAverageRating(
        product._id.toString()
      );
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
        p.variant.some((v) => filterByVariant.includes(v.name.toLowerCase()))
      );
    }
    if (req.query.filterByCategory) {
      const filterByCategory = req.query.filterByCategory
        .toString()
        .toLowerCase()
        .split(",");
      products = products.filter((p) =>
        filterByCategory.includes(p.category_id.name.toLowerCase())
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

    if (!isValidObjectId(body.category)) {
      return res.status(400).send({ message: "Invalid UUID format" });
    }
    const category = await Category.findById(body.category);

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

    // Initialize product_images and variant as empty arrays
    // ? https://www.phind.com/search?cache=aif0qe2bebiiu3jz57i94oe7
    p.product_images = [];
    p.variant = [];

    if (!category) {
      return res.status(400).send({ message: "Category does not exists" });
    }
    p.category_id = body.category;

    for (let i of body.images) {
      const productImages = new ProductImages();
      productImages.productId = p.id;
      productImages.image = i;
      await productImages.save();
      p.product_images.push(productImages);
    }

    for (let v of body.variants) {
      const productVariant = new ProductVariations();
      productVariant.name = v;
      productVariant.product = p.id;
      await productVariant.save();
      p.variant.push(productVariant);
    }
    const product = await p.save();

    await Category.findByIdAndUpdate(body.category, { $push: { product } });

    res.send(product);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const Variants = async (req: Request, res: Response) => {
  try {
    res.send(await ProductVariations.find());
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const GetProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne(
      { slug: req.params.slug },
      { cart: 0 }
    )
      .populate("product_images")
      .populate({
        path: "variant",
        select: {
          cart: 0,
        },
      })
      .populate("category_id", ["_id", "name"])
      .populate({
        path: "review",
        populate: [
          {
            path: "user_id",
            select: {
              _id: 0,
              is_user: 0,
              is_verified: 0,
              email: 0,
              password: 0,
              cart: 0,
              orders: 0,
              verify: 0,
              review: 0,
              created_at: 0,
              updated_at: 0,
              id: 0,
            },
          },
          {
            path: "variant_id",
            select: {
              cart: 0,
            },
          },
        ],
      });

    if (!product) {
      return res.status(404).send({ message: "Not Found" });
    }
    // Add average rating and review count to the product
    const reviewService = new ReviewService();
    const { averageRating, reviewCount } =
      await reviewService.getRatingAndReviewCount(product._id);

    // Merge the _doc object with the averageRating object
    const mergeDatas = {
      ...(product as any)._doc,
      averageRating,
      reviewCount,
    };

    res.send(mergeDatas);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const GetProductAdmin = async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ message: "Invalid Request" });
  }
  try {
    res.send(
      await Product.findById(req.params.id)
        .populate("product_images")
        .populate("variant")
        .populate("category_id", ["_id", "name"])
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
    const input = plainToClass(ProductUpdateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const products = await Product.findById(req.params.id);
    if (!products) {
      return res.status(404).send({ message: "Invalid Request" });
    }

    // Check if category_id is present in the request body
    if (body.category_id) {
      // If category_id is present, update the categories associated with the product
      await Category.updateMany(
        { product: products._id },
        { $pull: { product: products._id } }
      );

      await Category.findByIdAndUpdate(body.category_id, {
        $addToSet: { product: products },
      });
    }

    const data = await Product.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });

    res.send(data);
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
    const input = plainToClass(ProductUpdateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Invalid Request" });
    }

    // ? https://www.phind.com/search?cache=ljjv98qt433b57qvk0idppe5
    const newVariants = await Promise.all(
      body.variants.map(async (variant: any) => {
        // If variant is a name, create a new variant
        const newVariant = new ProductVariations({
          name: variant,
          product: product.id,
        });
        await newVariant.save();
        return newVariant._id; // Return the new variant's ID
      })
    );

    await Product.findByIdAndUpdate(product.id, {
      $push: { variant: { $each: newVariants } },
    });

    res.send(await ProductVariations.find({ product: req.params.id }));
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
    const input = plainToClass(ProductUpdateDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
      // Use the utility function to format and return the validation errors
      return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Invalid Request" });
    }

    // ? https://www.phind.com/search?cache=ljjv98qt433b57qvk0idppe5
    const newImages = await Promise.all(
      body.images.map(async (images: any) => {
        // If variant is a name, create a new variant
        const newImage = new ProductImages({
          productId: req.params.id,
          image: images,
        });
        await newImage.save();
        return newImage._id; // Return the new variant's ID
      })
    );

    await Product.findByIdAndUpdate(product.id, {
      $push: { product_images: { $each: newImages } },
    });

    res.send(await ProductImages.find({ productId: req.params.id }));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const DeleteProduct = async (req: Request, res: Response) => {
  try {
    const productImageService = new ProductImageService();
    const productVariantService = new ProductVariantService();

    // * Find the related images
    const findImages = await productImageService.find({
      productId: req.params.id,
    });

    // * Find the related variants
    const findVariants = await productVariantService.find({
      product: req.params.id,
    });

    // * Delete the multiple images
    for (const image of findImages) {
      await productImageService.deleteMultipleImages(image.productId);
    }

    // * Delete the related variants
    for (const variant of findVariants) {
      await productVariantService.deleteMultipleVariants(variant.product);
    }

    // * Delete the related product category
    await Category.updateMany(
      { product: req.params.id },
      { $pull: { product: req.params.id } }
    );

    // * Delete the product
    await Product.findByIdAndDelete(req.params.id);

    res.status(204).send(null);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const DeleteProductImage = async (req: Request, res: Response) => {
  try {
    await ProductImages.findByIdAndDelete(req.params.id);
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
    await ProductVariations.findByIdAndDelete(req.params.id);
    res.status(204).send(null);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};

export const GetProductAvgRating = async (req: Request, res: Response) => {
  try {
    const reviewService = new ReviewService();
    res
      .status(200)
      .json(await reviewService.calculateAverageRating(req.params.id));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      logger.error(error);
    }
    return res.status(400).send({ message: "Invalid Request" });
  }
};
