import { PrismaClient, Address, Prisma } from '@prisma/client';
import { AbstractService } from './abstract.service';

export class AddressService extends AbstractService<
    Address,
    Prisma.AddressWhereInput,
    Prisma.AddressCreateInput,
    Prisma.AddressUpdateInput,
    Prisma.AddressInclude
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.address);
    }
}
