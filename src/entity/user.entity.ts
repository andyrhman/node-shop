import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Token } from "./token.entity";
import { Cart } from "./cart.entity";
import { Address } from "./address.entity";
import { Order } from "./order.entity";
// import { Review } from "src/review/models/review.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  fullName: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  is_user: boolean;

  @Column({ default: false })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @OneToOne(() => Address, (address) => address.user)
  address: Address;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Cart, (cart) => cart.user)
  cart: Cart[];

  @OneToMany(() => Token, (token) => token.user, {
    createForeignKeyConstraints: false,
  })
  verify: Token[];

  // @OneToMany(() => Review, (review) => review.user)
  // review: Review[];
}
