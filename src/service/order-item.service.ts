import { PrismaClient, OrderItem, Order, Prisma } from '@prisma/client';
import { AbstractService } from './abstract.service';

export class OrderItemService extends AbstractService<
    OrderItem,
    Prisma.OrderItemWhereInput,
    Prisma.OrderItemCreateInput,
    Prisma.OrderItemUpdateInput,
    Prisma.OrderItemInclude
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.orderItem);
    }

    async isProductInOrderItems(productId: string, orders: Order[]) {
        const orderIds: any = orders.map((order) => order.id);
        const productOrderItems = await this.prisma.orderItem.findMany({
            where: { product_id: productId, order_id: orderIds },
        });
        return productOrderItems.length > 0;
    }
}
