import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { Wishlist } from '../entities/wishlist.entity';
import { BaseRepository } from '../../core/repositories/base.repository';

@CustomRepository(Wishlist)
export class WishlistRepository extends BaseRepository<Wishlist> {
    public async generateWishlist(userId: string): Promise<void> {
        const wishlist = {
            user: { id: userId }
        };

        await this.save(wishlist);
    }

    public async findByUserId(userId: string): Promise<Wishlist> {
        return await this.findOne({
            where: {
                user: { id: userId },
            },
            relations: {
                productWishlists: {
                    product: {
                        productWishlists: true,
                        owner: true,
                        productImages: true
                    },
                },
                user: true,
            }
        });
    }

    public async softDeleteByUserId(userId: string): Promise<void> {
        await this.createQueryBuilder('wishlist')
            .innerJoin('wishlist.user', 'user')
            .softDelete()
            .where('user.id = :userId', {userId})
            .execute();
    }
}