import { Product } from "./product.entity";
import { Order } from "./order.entity";
import { User } from "./user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductVariation } from "./product-variation.entity";

@Entity('reviews')
export class Review{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()   
    star: number;
                 
    @Column()
    comment: string;        
 
    @Column()                               
    image: string;

    @Column({name: "user_id"})
    user_id: string;

    @Column({name: "product_id"})
    product_id: string;

    @Column({name: "variant_id", nullable: true})
    variant_id: string;

    @CreateDateColumn()
    created_at: string;

    @Column({name: "order_id", nullable: true})
    order_id: string;

    @ManyToOne(() => User, (user) => user.review)
    @JoinColumn({name: "user_id"})
    user: User;

    @ManyToOne(() => Product, (product) => product.review)
    @JoinColumn({name: "product_id"})
    product: Product;

    @ManyToOne(() => Order, (order) => order.review)
    @JoinColumn({name: "order_id"})
    order: Order;

    @ManyToOne(() => ProductVariation, (variants) => variants.reviews)
    @JoinColumn({name: "variant_id"})
    variants: ProductVariation;
}