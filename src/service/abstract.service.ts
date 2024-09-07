import { PrismaClient } from '@prisma/client';

export abstract class AbstractService<T, WhereInput, CreateInput, UpdateInput, Include> {
    protected prisma: PrismaClient;
    protected model: any; // Prisma model

    protected constructor(prisma: PrismaClient, model: any) {
        this.prisma = prisma;
        this.model = model;
    }

    async all(include: Include = {} as Include): Promise<T[]> {
        return this.model.findMany({ include });
    }

    async find(where: WhereInput, include: Include = {} as Include): Promise<T[]> {
        return this.model.findMany({ where, include });
    }

    async create(data: CreateInput): Promise<T> {
        return this.model.create({ data });
    }

    async update(id: string, data: UpdateInput): Promise<T> {
        return this.model.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<T> {
        return this.model.delete({ where: { id } });
    }

    async findOne(where: WhereInput, include: Include = {} as Include): Promise<T | null> {
        return this.model.findFirst({ where, include });
    }

    async total(where: WhereInput): Promise<{ total: number }> {
        const count = await this.model.count({ where });
        return { total: count };
    }

    async findByEmail(email: string): Promise<T | null> {
        return this.model.findUnique({ where: { email } as any });
    }

    async findByUsername(username: string): Promise<T | null> {
        return this.model.findUnique({ where: { username } as any });
    }

    async findByUsernameOrEmail(username: string, email: string): Promise<T | null> {
        return this.model.findFirst({
            where: {
                OR: [
                    { username },
                    { email },
                ],
            },
        });
    }
}
