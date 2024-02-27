// import { Order } from "src/order/models/order.entity";
import { ProductVariation } from "./product-variation.entity";
import { Product } from "./product.entity";
import { User } from "./user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('carts')
export class Cart{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    product_title: string;

    @Column()
    quantity: number;

    @Column()
    price: number;

    @Column({name: "variant_id", nullable: true})
    variant_id: string;

    @Column({default: 'false'})
    completed: boolean;

    @Column({name: "product_id"})
    product_id: string;

    @Column({name: "user_id"})
    user_id: string;

    @Column({name: "order_id", nullable: true})
    order_id: string;

    @CreateDateColumn()
    created_at: string;

    @ManyToOne(() => Product, (product) => product.cart)
    @JoinColumn({name: "product_id"})
    product: Product;

    @ManyToOne(() => User, (user) => user.cart)
    @JoinColumn({name: "user_id"})
    user: User;

    // @ManyToOne(() => Order, (order) => order.cart)
    // @JoinColumn({name: "order_id"})
    // order: Order;

    @ManyToOne(() => ProductVariation, (variant) => variant.cart)
    @JoinColumn({name: "variant_id"})
    variant: ProductVariation;
}