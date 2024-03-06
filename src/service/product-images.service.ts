import { ProductImages, ProductImagesDocument } from "../models/product-images.schema";
import { AbstractService } from "./abstract.service";

export class ProductImageService extends AbstractService<ProductImagesDocument> {
  constructor() {
    super(ProductImages);
  }
  async deleteMultipleImages(productId: string): Promise<any> {
    return this.model.findOneAndDelete({ productId });
  }
}
