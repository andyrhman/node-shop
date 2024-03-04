// import myDataSource from "../config/db.config";
// import { Product } from "../entity/product.entity";
// import { AbstractService } from "./abstract.service";

// export class ProductService extends AbstractService<Product> {
//   constructor() {
//     super(myDataSource.getRepository(Product));
//   }
//   async find(options, relations = []) {
//     return this.repository.find({
//       where: options,
//       relations,
//       order: { created_at: "DESC" },
//     });
//   }
// }
