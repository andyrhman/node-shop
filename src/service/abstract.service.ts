import { FindManyOptions, Repository } from 'typeorm';

export abstract class AbstractService<T> {
    protected repository: Repository<T>;

    protected constructor(repository: Repository<T>) {
        this.repository = repository;
    }

    async all(relations: string[] = []): Promise<T[]> {
        return await this.repository.find({ relations });
    }

    async create(data: Partial<T>): Promise<T> {
        return this.repository.save(data as any);
    }

    async update(id: string, data: Partial<T>): Promise<any> {
        return this.repository.update(id, data as any);
    }

    async delete(id: string): Promise<any> {
        return this.repository.delete(id);
    }

    async findOne(options: object, relations: string[] = []): Promise<T | null> {
        return this.repository.findOne({ where: options, relations } as any);
    }


    async findByEmail(email: string): Promise<T | null> {
        return this.repository.findOne({ where: { email } } as any);
    }

    async findByUsername(username: string): Promise<T | null> {
        return this.repository.findOne({ where: { username } } as any);
    }

    async findByUsernameOrEmail(username: string, email: string): Promise<T | null> {
        return this.repository
            .createQueryBuilder('user')
            .where('user.username = :username', { username })
            .orWhere('user.email = :email', { email })
            .getOne();
    }

    // ? https://www.phind.com/search?cache=i2helomupthybetydx4fgtvt
    async paginate(options: FindManyOptions<T>, page: number, take: number, relations = []) {
        const [data, total] = await this.repository.findAndCount({
            ...options,
            take,
            skip: (page - 1) * take,
            relations
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
}