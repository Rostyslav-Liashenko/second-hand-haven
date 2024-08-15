import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { ProductCart } from './product-cart.entity';

@Entity({name: 'cart'})
export class Cart extends BaseEntity {

    @OneToOne(() => User, (user) => user.cart)
    @JoinColumn({name: 'user_id'})
    public user: User;

    @OneToMany(() => ProductCart, (productCart) => productCart.cart)
    public productCart: ProductCart[];
}