import { PrismaClient, Cart, Prisma } from '@prisma/client';
import { AbstractService } from './abstract.service';
export class CartService extends AbstractService<
    Cart,
    Prisma.CartWhereInput,
    Prisma.CartCreateInput,
    Prisma.CartUpdateInput,
    Prisma.CartInclude
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.cart);
    }
    async deleteUserCart(user_id: string, cart_id: string): Promise<any> {
        return this.model.delete({ where: { user_id: user_id, id: cart_id } });
    }

    async findCartItemByProductAndVariant(
        productId: string,
        variantId: string,
        userId: string
    ) {
        return this.prisma.cart.findFirst({
            where: {
                product_id: productId,
                variant_id: variantId,
                user_id: userId,
                completed: false
            }
        });
    }

    async findUserCart(where: Prisma.CartWhereInput, include: Prisma.CartInclude = {}): Promise<Cart[]> {
        const cartItems = await this.prisma.cart.findMany({ where, include, orderBy: { created_at: 'desc' } });
        // map through the cart items and calculate the total price for each item
        const cartWithTotalPrices = cartItems.map((item) => ({
            ...item,
            total_price: item.price * item.quantity,
        }));
        return cartWithTotalPrices;
    }

    async chart(): Promise<any[]> {
        const result: any = await this.prisma.$queryRaw`
            SELECT
            TO_CHAR(c.created_at, 'YYYY-MM-DD') as date,
            REPLACE(TO_CHAR(TRUNC(sum(c.quantity)), 'FM999G999G999'), ',', '') as sum
            FROM carts c
            GROUP BY TO_CHAR(c.created_at, 'YYYY-MM-DD')
            ORDER BY TO_CHAR(c.created_at, 'YYYY-MM-DD') ASC;      
        `;
        return result;
    }

    async totalPriceAndCount(where: Prisma.CartWhereInput, include: Prisma.CartInclude = {}): Promise<{ totalItems: number; totalPrice: number; }> {
        const cartItems = await this.prisma.cart.findMany({ where, include });
        let totalItems = 0;
        let totalPrice = 0;
        cartItems.forEach((item) => {
            if (item.completed === false) {
                totalItems += item.quantity;
                totalPrice += item.price * item.quantity;
            }
        });
        return {
            totalItems,
            totalPrice,
        };
    }
}
