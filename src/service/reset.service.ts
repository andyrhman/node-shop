import { PrismaClient, Reset, Prisma } from '@prisma/client';
import { AbstractService } from './abstract.service';

export class ResetService extends AbstractService<
    Reset,
    Prisma.ResetWhereInput,
    Prisma.ResetCreateInput,
    Prisma.ResetUpdateInput,
    undefined
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.reset);
    }

    async findByTokenExpiresAt(token: string): Promise<Reset | null> {
        const reset = await this.findOne({ token });

        if (!reset || reset.expiresAt < Date.now()) {
            return null; // Token is invalid or expired
        }

        return reset;
    }
}
