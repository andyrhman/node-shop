import { Product, ProductDocument } from "../models/product.schema";
import { AbstractService } from "./abstract.service";

export class ProductService extends AbstractService<ProductDocument> {
  constructor() {
    super(Product);
  }
  async find(options: any) {
    return this.model.find(options).sort({ createdAt: -1 }).populate('variant', 'name').populate('category_id', 'name');
  }
}
