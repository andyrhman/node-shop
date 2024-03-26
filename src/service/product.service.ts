import { Product, ProductDocument } from "../models/product.schema";
import { AbstractService } from "./abstract.service";

export class ProductService extends AbstractService<ProductDocument> {
  constructor() {
    super(Product);
  }
}
