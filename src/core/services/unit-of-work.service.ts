import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { CategoryRepository } from '../../category/repositories/category.repository';
import { ProductRepository } from '../../product/repositories/product.repository';
import { WishlistRepository } from '../../wishlist/repositories/wishlist.repository';
import { ProductWishlistRepository } from '../../wishlist/repositories/product-wishlist.repository';
import { CartRepository } from '../../cart/repositories/cart.repository';
import { ProductCartRepository } from '../../cart/repositories/product-cart.repository';
import { AttributeRepository } from '../../attribute/repositories/attribute.repository';
import { CategoryAttributeRepository } from '../../attribute/repositories/category-attribute.repository';
import { ProductAttributeRepository } from '../../attribute/repositories/product-attribute.repository';
import { DefaultAttributeValueRepository } from '../../attribute/repositories/default-attribute-value.repository';
import { ProductImageRepository } from '../../product/repositories/product-image.repository';
import { ShippingInfoRepository } from '../../shipping-info/repositories/shipping-info.repository';
import { ChatRepository } from '../../chat/repositories/chat.repository';
import { MessageRepository } from '../../chat/repositories/message.repository';
import { MessageReaderRepository } from '../../chat/repositories/message-reader.repository';
import { UserChatRepository } from '../../chat/repositories/user-chat.repository';
import { OrderRepository } from '../../order/repositories/order.repository';
import { CardRepository } from '../../card/repositories/card.repository';
import { PaymentConfigRepository } from '../../payment/repositories/payment-config.repository';
import { NotificationRepository } from '../../notification/repositories/notification.repository';
import { PriceOfferRepository } from '../../price-offer/repositories/price-offer.repository';
import { NotificationRecipientRepository } from '../../notification/repositories/notification-recipient.repository';

@Injectable()
export class UnitOfWorkService {
    constructor(
        public readonly dataSource: DataSource,
        public readonly userRepository: UserRepository,
        public readonly categoryRepository: CategoryRepository,
        public readonly productRepository: ProductRepository,
        public readonly wishlistRepository: WishlistRepository,
        public readonly productWishlistRepository: ProductWishlistRepository,
        public readonly cartRepository: CartRepository,
        public readonly productCartRepository: ProductCartRepository,
        public readonly attributeRepository: AttributeRepository,
        public readonly categoryAttributeRepository: CategoryAttributeRepository,
        public readonly productAttributeRepository: ProductAttributeRepository,
        public readonly defaultAttributeValueRepository: DefaultAttributeValueRepository,
        public readonly productImageRepository: ProductImageRepository,
        public readonly shippingInfoRepository: ShippingInfoRepository,
        public readonly chatRepository: ChatRepository,
        public readonly messageRepository: MessageRepository,
        public readonly messageReaderRepository: MessageReaderRepository,
        public readonly userChatRepository: UserChatRepository,
        public readonly orderRepository: OrderRepository,
        public readonly cardRepository: CardRepository,
        public readonly paymentConfigRepository: PaymentConfigRepository,
        public readonly priceOfferRepository: PriceOfferRepository,
        public readonly notificationRepository: NotificationRepository,
        public readonly notificationRecipientRepository: NotificationRecipientRepository,
    ) {}

    public async doWork<T>(work: () => T): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await work();
            await queryRunner.commitTransaction();

            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            Logger.error(error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}