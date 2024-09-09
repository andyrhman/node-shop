import { PrismaClient, Order, Prisma } from '@prisma/client';
import { AbstractService } from './abstract.service';

export class OrderService extends AbstractService<
    Order,
    Prisma.OrderWhereInput,
    Prisma.OrderCreateInput,
    Prisma.OrderUpdateInput,
    Prisma.OrderInclude
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.order);
    }

    async findCompletedOrdersByUser(userId: string) {
        return this.model.order.find({
            where: { user_id: userId, completed: true },
        });
    }

    async chart(): Promise<any[]> {
        const result: any = await this.prisma.$queryRaw`
            SELECT
            TO_CHAR(o.created_at, 'YYYY-MM-DD') as date,
            REPLACE(TO_CHAR(TRUNC(sum(i.price * i.quantity)), 'FM999G999G999'), ',', '') as sum
            FROM orders o
            JOIN order_items i on o.id = i.order_id
            WHERE o.completed = true
            GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD')
            ORDER BY TO_CHAR(o.created_at, 'YYYY-MM-DD') ASC;
        `;

        return result;
    }
}
