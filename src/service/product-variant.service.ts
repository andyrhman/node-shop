import { ProductVariations, ProductVariationsDocument } from "../models/product-variation.schema";
import { AbstractService } from "./abstract.service";

export class ProductVariantService extends AbstractService<ProductVariationsDocument> {
  constructor() {
    super(ProductVariations);
  }
  async deleteMultipleVariants(product_id: any): Promise<any> {
    return this.model.findOneAndDelete({ product: product_id });
  }
}
