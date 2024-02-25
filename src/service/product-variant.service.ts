import myDataSource from "../config/db.config";
import { ProductVariation } from "../entity/product-variation.entity";
import { AbstractService } from "./abstract.service";

export class ProductVariantService extends AbstractService<ProductVariation> {
  constructor() {
    super(myDataSource.getRepository(ProductVariation));
  }
  async deleteMultipleVariants(product_id: string): Promise<any> {
    return this.repository.delete({ product_id });
  }
}
