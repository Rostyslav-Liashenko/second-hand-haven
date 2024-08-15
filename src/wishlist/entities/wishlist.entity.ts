import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { ProductWishlist } from './product-wishlist.entity';


@Entity({name: 'wishlist'})
export class Wishlist extends BaseEntity {

    @OneToOne(() => User, (user) => user.wishlist)
    @JoinColumn({name: 'user_id'})
    public user: User;

    @OneToMany(() => ProductWishlist, (productWishlist) => productWishlist.wishlist)
    public productWishlists: ProductWishlist[];
}