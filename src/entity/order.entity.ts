import { Expose } from "class-transformer";
import { User } from "./user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-items.entity";
import { Cart } from "./cart.entity";
// import { Review } from "src/review/models/review.entity";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    transaction_id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @CreateDateColumn()
    created_at: string;

    @Column({ name: 'user_id' })
    user_id: string;

    @Column({default: false})
    completed: boolean;

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    order_items: OrderItem[];

    @OneToMany(() => Cart, cart => cart.order)
    cart: Cart[];

    // @OneToMany(() => Review, review => review.order)
    // review: Review[];

    // * Getting the total price
    @Expose()
    get total(): number {
        return this.order_items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    }

    // * Total order items
    @Expose()
    get total_orders(): number {
        return this.order_items.length;
    }
}