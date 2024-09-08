import { PrismaClient, ProductVariation, Prisma } from '@prisma/client';
import { AbstractService } from './abstract.service';

export class ProductVariantService extends AbstractService<
    ProductVariation,
    Prisma.ProductVariationWhereInput,
    Prisma.ProductVariationCreateInput,
    Prisma.ProductVariationUpdateInput,
    Prisma.ProductVariationInclude
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.productVariation);
    }
}
