import { PrismaClient, Product, Prisma } from '@prisma/client';
import { AbstractService } from './abstract.service';

export class ProductService extends AbstractService<
    Product,
    Prisma.ProductWhereInput,
    Prisma.ProductCreateInput,
    Prisma.ProductUpdateInput,
    Prisma.ProductInclude
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.product);
    }

    async findMyProduct(where: Prisma.ProductWhereInput, include: Prisma.ProductInclude = {}): Promise<Product[]> {
        return this.model.findMany({
            where,
            include,
            orderBy: { created_at: 'desc' },
        });
    }
}
