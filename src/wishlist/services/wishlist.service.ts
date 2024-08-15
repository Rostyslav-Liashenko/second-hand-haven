import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { ProductResponseDto } from '../../product/dtos/response/product.response.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { Product } from '../../product/entities/product.entity';
import { ProductWishlistRequestDto } from '../dtos/request/product-wishlist.request.dto';
import { InvalidCredentialsException } from '../../core/exceptions/invalid-credentials.exception';
import { ProductWishlist } from '../entities/product-wishlist.entity';
import { ProductWishlistResponseDto } from '../dtos/response/product-wishlist.response.dto';

@Injectable()
export class WishlistService extends BaseService {
    constructor(protected readonly unityOfWork: UnitOfWorkService) {
        super(unityOfWork);
    }

    public async findByUserId(userId: string): Promise<ProductResponseDto[]> {
        const wishlist = await this.unityOfWork.wishlistRepository.findByUserId(userId);

        if (!wishlist) {
            throw new NotFoundException();
        }

        return wishlist.productWishlists.map((productWishlist) => Product.toDto(productWishlist.product));
    }

    public async addProduct(productWishlistRequest: ProductWishlistRequestDto): Promise<ProductWishlistResponseDto> {
        const work = async () => {
            const wishlist = await this.unityOfWork.wishlistRepository.findByUserId(productWishlistRequest.userId);
            const isExistsProduct = wishlist.productWishlists.some(
                (productWishlist) => productWishlist.product.id === productWishlistRequest.productId
            );

            const productOwner = await this.unityOfWork.userRepository.findOwnerByProductId(productWishlistRequest.productId);
            const isSameOwner = productOwner.wishlist.id === wishlist.id;

            if (isExistsProduct || isSameOwner) {
                throw new InvalidCredentialsException();
            }

            const productWishlistFromDto = ProductWishlist.fromDto(productWishlistRequest, wishlist.id);
            const productWishlist = await this.unityOfWork.productWishlistRepository.save(productWishlistFromDto);

            return ProductWishlist.toDto(productWishlist);
        }

        return await this.unityOfWork.doWork(work);
    }

    public async deleteProduct(productWishlistRequest: ProductWishlistRequestDto): Promise<void> {
        const work = async () => {
            const productWishlist = await this.unityOfWork.productWishlistRepository.findByUserIdAndProductId(
                productWishlistRequest.userId,
                productWishlistRequest.productId,
            );

            if (!productWishlist) {
                throw new NotFoundException();
            }

            await this.unityOfWork.productWishlistRepository.remove(productWishlist);
        }

        return await this.unityOfWork.doWork(work);
    }
}