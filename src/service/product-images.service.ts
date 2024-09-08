import { PrismaClient, ProductImages, Prisma } from '@prisma/client';
import { AbstractService } from './abstract.service';

export class ProductImageService extends AbstractService<
    ProductImages,
    Prisma.ProductImagesWhereInput,
    Prisma.ProductImagesCreateInput,
    Prisma.ProductImagesUpdateInput,
    Prisma.ProductImagesInclude
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.productImages);
    }
}
