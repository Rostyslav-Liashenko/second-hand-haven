import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { BaseRepository } from '../../core/repositories/base.repository';
import { User } from '../entities/user.entity';
import { AuthProvider } from '../../auth/enums/auth-provider.enum';
import { PageOptionsRequestDto } from '../../core/dto/request/page-options.request.dto';
import { SelectQueryBuilder } from 'typeorm';

@CustomRepository(User)
export class UserRepository extends BaseRepository<User> {
    public async findAll(): Promise<User[]> {
        return this.find({
            order: {
                createdAt: 'ASC',
            },
        });
    }

    public async findByPhoneNumber(phoneNumber: string): Promise<User> {
        return this.findOne({
            where: {
                phoneNumber,
            }
        });
    }

    public async findAllQueryBuilder(pageOptionsDto: PageOptionsRequestDto): Promise<SelectQueryBuilder<User>> {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.auth', 'auth')
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take)
            .addOrderBy('user.createdAt', 'ASC')
            .addOrderBy('user.firstName', 'ASC')
            .addOrderBy('user.lastName', 'ASC');
    }

    public async findSellersByProductCount(count: number): Promise<User[]> {
        return this.createQueryBuilder('user')
            .leftJoin('user.products', 'product')
            .groupBy('user.id')
            .orderBy('COUNT(product.id)', 'DESC')
            .limit(count)
            .getMany();
    }

    public async findByPublicProfileId(publicProfileId: string): Promise<User> {
        return await this.findOne({
            where: {
                publicProfileId: publicProfileId
            },
        });
    }

    public async findById(userId: string): Promise<User> {
        return await this.findOne({
            where: {id: userId},
            relations: {
                auth: {
                    localAuth: true
                }
            },
        });
    }

    public async findByIdWithProduct(userId: string): Promise<User> {
        return await this.findOne({
            where: {id: userId},
            relations: {
                products: true,
            },
        });
    }

    public async findByEmail(email: string): Promise<User> {
        return await this.findOne({
            where: {
                auth: {email: email}
            },
            relations: {
                auth: true
            },
        });
    }

    public findOwnerByProductId(productId: string): Promise<User> {
        return this.findOne({
            where: {
                products: {
                    id: productId,
                }
            },
            relations: {
                wishlist: true,
                cart: true,
            },
        });
    }

    public async findByEmailLocalAuth(email: string): Promise<User> {
        return await this.findOne({
            where: {
                auth: {
                    email: email,
                    provider: AuthProvider.LOCAL,
                }
            },
            relations: {
                auth: { localAuth: true }
            },
        });
    }

    public async findByGoogleSocialId(socialId: string): Promise<User> {
        return await this.findOne({
            where: {
                auth: {
                    googleAuth: {socialId: socialId},
                    provider: AuthProvider.GOOGLE,
                }
            },
            relations: {
                auth: { googleAuth: true }
            },
        });
    }

    public async findByFacebookSocialId(socialId: string): Promise<User> {
        return await this.findOne({
            where: {
                auth: {
                    facebookAuth: {socialId: socialId},
                    provider: AuthProvider.FACEBOOK,
                }
            },
            relations: {
                auth: { facebookAuth: true }
            },
        });
    }
}
