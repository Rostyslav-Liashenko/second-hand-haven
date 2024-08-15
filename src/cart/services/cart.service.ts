import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { Product } from '../../product/entities/product.entity';
import { InvalidCredentialsException } from '../../core/exceptions/invalid-credentials.exception';
import { ProductCart } from '../entities/product-cart.entity';
import { ProductCartRequestDto } from '../dtos/request/product-cart.request.dto';
import { ProductCartResponseDto } from '../dtos/responses/product-cart.response.dto';
import { ProductQuantityResponseDto } from '../dtos/responses/product-quantity.response.dto';
import { CartResponseDto } from '../dtos/responses/cart.response.dto';
import { PriceOfferStatus } from '../../price-offer/enums/price-offer-status.enum';


@Injectable()
export class CartService extends BaseService {
    constructor(protected readonly unitOfWork: UnitOfWorkService) {
        super(unitOfWork);
    }

    public async findByUserId(userId: string): Promise<CartResponseDto> { // TODO add decimal package
        const cart = await this.unitOfWork.cartRepository.findByUserId(userId);

        if (!cart) {
            throw new NotFoundException();
        }

        const productDtos = cart.productCart.map((productCart) => {
            const product = productCart.product;
            const priceOffers = product.priceOffers;
            const isEmpty = priceOffers.length === 0;

            if (!isEmpty && priceOffers.at(-1).status === PriceOfferStatus.APPROVED) {
                const lastApprovedOffer = priceOffers.at(-1);
                product.price = lastApprovedOffer.price;
            }

            return Product.toDto(product)
        });

        const totalSum = productDtos.reduce((sum: number, product) => sum + product.price, 0);

        return {
            products: productDtos,
            totalSum,
        };
    }

    public async findProductQuantityByUserId(userId: string): Promise<ProductQuantityResponseDto> {
        const productQuantity = await this.unitOfWork.productCartRepository.findProductQuantityByUserId(userId);

        return { quantity: productQuantity };
    }

    public async addProduct(productCartRequestDto: ProductCartRequestDto): Promise<ProductCartResponseDto> {
        const work = async () => {
            const cart = await this.unitOfWork.cartRepository.findByUserId(productCartRequestDto.userId);

            if (!cart) {
                throw new NotFoundException();
            }

            const isExistProduct = cart.productCart.some((productCart) => productCart.product.id === productCartRequestDto.productId);
            const productOwner = await this.unitOfWork.userRepository.findOwnerByProductId(productCartRequestDto.productId);

            if (!productOwner) {
                throw new NotFoundException();
            }

            const isSameOwner = productOwner.id === cart.user.id;

            if (isExistProduct || isSameOwner) {
                throw new InvalidCredentialsException();
            }

            const productCartFromDto = ProductCart.fromDto(productCartRequestDto, cart.id);
            const productCart = await this.unitOfWork.productCartRepository.save(productCartFromDto);

            return ProductCart.toDto(productCart);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async deleteProduct(userId: string, productId: string): Promise<void> {
        const work = async () => {
            const productCart = await this.unitOfWork.productCartRepository.findByUserIdAndProductId(
                userId,
                productId,
            );

            if (!productCart) {
                throw new NotFoundException();
            }

            await this.unitOfWork.productCartRepository.remove(productCart);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async deleteByUserIdAndOwnerId(userId: string, ownerId: string): Promise<void> {
        const work = async () => {
            const productCarts = await this.unitOfWork.productCartRepository.findByUserIdAndOwnerId(
                userId,
                ownerId
            );

            const productCartIds = productCarts.map((productCart) => productCart.id);
            await this.unitOfWork.productCartRepository.deleteByIds(productCartIds);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async deleteByUserId(userId: string): Promise<void> {
        const work = async () => {
            const cart = await this.unitOfWork.cartRepository.findByUserId(userId);

            if (!cart) {
                throw new NotFoundException();
            }

            const productCartIds = cart.productCart.map((productCart) => productCart.id);
            await this.unitOfWork.productCartRepository.deleteByIds(productCartIds);
        }

        return await this.unitOfWork.doWork(work);
    }
}
