import { PrismaClient } from '@prisma/client';

export abstract class AbstractService<T> {
    protected prisma: PrismaClient;
    protected model: any;

    constructor(prisma: PrismaClient, model: any) {
        this.prisma = prisma;
        this.model = model;
    }

    async all(relations: string[] = []): Promise<T[]> {
        return this.model.findMany({
            include: this.getRelations(relations),
        });
    }

    async create(data: any): Promise<T> {
        return this.model.create({
            data,
        });
    }

    async update(id: string, data: any): Promise<T> {
        return this.model.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<T> {
        return this.model.delete({
            where: { id },
        });
    }

    // ! NOT WORKING
    async findOne(options: any, relations: string[] = []): Promise<T | null> {
        return this.model.findUnique({
            where: options,
            include: this.getRelations(relations),
        });
    }

    async findByEmail(email: string): Promise<T | null> {
        return this.model.findUnique({
            where: { email },
        });
    }

    async findByUsername(username: string): Promise<T | null> {
        return this.model.findUnique({
            where: { username },
        });
    }

    async findByUsernameOrEmail(username: string, email: string): Promise<T | null> {
        return this.model.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
    }

    async paginate(page: number, take: number, relations: string[] = []): Promise<{ data: T[]; meta: { total: number; page: number; last_page: number; }; }> {
        const total = await this.model.count();
        const data = await this.model.findMany({
            take,
            skip: (page - 1) * take,
            include: this.getRelations(relations),
        });

        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / take),
            },
        };
    }

    public getRelations(relations: string[]): any {
        return relations.reduce((acc, relation) => {
            const [relationName, subRelation] = relation.split('.');
            if (subRelation) {
                acc[relationName] = { include: { [subRelation]: true } };
            } else {
                acc[relationName] = true;
            }
            return acc;
        }, {});
    }
}