import { PrismaClient, Token, Prisma } from '@prisma/client';
import { AbstractService } from './abstract.service';

export class TokenService extends AbstractService<
    Token,
    Prisma.TokenWhereInput,
    Prisma.TokenCreateInput,
    Prisma.TokenUpdateInput,
    Prisma.TokenInclude
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.token);
    }

    async findByTokenExpiresAt(data: string) {
        const reset = await this.findOne({ token: data });

        if (!reset || reset.expiresAt < Date.now()) {
            return null; // Token is invalid or expired
        }

        return reset;
    }
}
