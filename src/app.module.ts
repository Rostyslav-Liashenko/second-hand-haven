import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from './typeorm-ex/typeorm-ex.module';
import { UserController } from './user/controllers/user.controller';
import { UserService } from './user/services/user.service';
import { UnitOfWorkService } from './core/services/unit-of-work.service';
import { AuthService } from './auth/services/auth.service';
import { UserRepository } from './user/repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth/controllers/auth.controller';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as process from 'node:process';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailConfirmService } from './auth/services/email-confirm.service';
import { GoogleStrategy } from './auth/strategies/google.strategy';
import { HashService } from './auth/services/hash.service';
import { JwtRefreshStrategy } from './auth/strategies/jwt-refresh.strategy';
import { CustomLoggerService } from './core/logger/custom-logger.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { CategoryService } from './category/services/category.service';
import { CategoryRepository } from './category/repositories/category.repository';
import { CategoryController } from './category/controllers/category.controller';
import { ProductRepository } from './product/repositories/product.repository';
import { ProductService } from './product/services/product.service';
import { ProductController } from './product/controllers/product.controller';
import { PaginationService } from './core/services/pagination.service';
import { WishlistRepository } from './wishlist/repositories/wishlist.repository';
import { ProductWishlistRepository } from './wishlist/repositories/product-wishlist.repository';
import { WishlistController } from './wishlist/controllers/wishlist.controller';
import { WishlistService } from './wishlist/services/wishlist.service';
import { CartRepository } from './cart/repositories/cart.repository';
import { CartController } from './cart/controllers/cart.controller';
import { CartService } from './cart/services/cart.service';
import { ProductCartRepository } from './cart/repositories/product-cart.repository';
import configDatabase from './configs/config-database';
import { AttributeRepository } from './attribute/repositories/attribute.repository';
import { AttributeService } from './attribute/services/attribute.service';
import { AttributeController } from './attribute/controller/attribute.controller';
import { CategoryAttributeRepository } from './attribute/repositories/category-attribute.repository';
import { ProductAttributeRepository } from './attribute/repositories/product-attribute.repository';
import { DefaultAttributeValueController } from './attribute/controller/default-attribute-value.controller';
import { DefaultAttributeValueRepository } from './attribute/repositories/default-attribute-value.repository';
import { DefaultAttributeValueService } from './attribute/services/default-attribute-value.service';
import { ProductAttributeService } from './attribute/services/product-attribute.service';
import { CategoryAttributeService } from './attribute/services/category-attribute.service';
import { ProductImageController } from './product/controllers/product-image.controller';
import { ProductImageService } from './product/services/product-image.service';
import { ProductImageRepository } from './product/repositories/product-image.repository';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { ShippingInfoController } from './shipping-info/controllers/shipping-info.controller';
import { ShippingInfoRepository } from './shipping-info/repositories/shipping-info.repository';
import { ShippingInfoService } from './shipping-info/services/shipping-info.service';
import { PersonalSettingService } from './user/services/personal-setting.service';
import { ChatGetaway } from './chat/gateways/chat.getaway';
import { ChatController } from './chat/controllers/chat.controller';
import { ChatService } from './chat/services/chat.service';
import { ChatRepository } from './chat/repositories/chat.repository';
import { MessageRepository } from './chat/repositories/message.repository';
import { MessageService } from './chat/services/message.service';
import { CustomHttpExceptionFilter } from './core/exception-filters/custom-http-exception-filter';
import { MessageReaderRepository } from './chat/repositories/message-reader.repository';
import { MessageReaderService } from './chat/services/message-reader.service';
import { SystemRoleGuard } from './core/guards/system-role.guard';
import { SameUserGuard } from './core/guards/same-user.guard';
import { UserChatRepository } from './chat/repositories/user-chat.repository';
import { OrderController } from './order/controllers/order.controller';
import { OrderService } from './order/services/order.service';
import { OrderRepository } from './order/repositories/order.repository';
import { EmailConfirmGuard } from './core/guards/email-confirm.guard';
import { DeleteFileInterceptor } from './core/interceptors/delete-file.interceptor';
import { FileService } from './core/services/file.service';
import { CardService } from './card/services/card.service';
import { CardRepository } from './card/repositories/card.repository';
import { CardController } from './card/controllers/card.controller';
import { HttpModule } from '@nestjs/axios';
import { PaymentConfigRepository } from './payment/repositories/payment-config.repository';
import { PaymentConfigService } from './payment/services/payment-config.service';
import { SellerGuard } from './order/guards/seller.guard';
import { CategoryAttributeController } from './attribute/controller/category-attribute.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentConfigController } from './payment/controllers/payment-config.controller';
import { BuyerGuard } from './order/guards/buyer.guard';
import { ChangeProductOfferStatusGuard } from './product/guards/change-product-offer-status.guard';
import { NotificationRepository } from './notification/repositories/notification.repository';
import { NotificationRecipientRepository } from './notification/repositories/notification-recipient.repository';
import { NotificationService } from './notification/services/notification.service';
import { NotificationGateway } from './notification/gateways/notification.gateway';
import { PriceOfferService } from './price-offer/services/price-offer.service';
import { PriceOfferRepository } from './price-offer/repositories/price-offer.repository';
import { PriceOfferGateway } from './price-offer/gateways/price-offer.gateway';
import { MailingController } from './mailing/controllers/mailing.controller';
import { MailingService } from './mailing/services/mailing.service';
import { EmailService } from './core/services/email.service';
import { CryptoService } from './core/services/crypto.service';
import { LiqPayService } from './payment/services/liq-pay.service';
import { PaymentService } from './payment/services/payment.service';

const controllers = [
    UserController,
    AuthController,
    CategoryController,
    ProductController,
    WishlistController,
    CartController,
    AttributeController,
    DefaultAttributeValueController,
    ProductImageController,
    ShippingInfoController,
    ChatController,
    OrderController,
    CardController,
    CategoryAttributeController,
    PaymentConfigController,
    MailingController,
];

const strategies = [
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    JwtRefreshStrategy,
];

const services = [
    UnitOfWorkService,
    UserService,
    CategoryService,
    AuthService,
    EmailService,
    EmailConfirmService,
    HashService,
    CustomLoggerService,
    ProductService,
    PaginationService,
    WishlistService,
    CartService,
    AttributeService,
    ProductAttributeService,
    DefaultAttributeValueService,
    CategoryAttributeService,
    ProductImageService,
    ShippingInfoService,
    PersonalSettingService,
    ChatService,
    MessageService,
    MessageReaderService,
    OrderService,
    FileService,
    CardService,
    PaymentConfigService,
    PriceOfferService,
    NotificationService,
    MailingService,
    CryptoService,
    LiqPayService,
    PaymentService,
];

const repositories = [
    UserRepository,
    CategoryRepository,
    ProductRepository,
    WishlistRepository,
    ProductWishlistRepository,
    CartRepository,
    ProductCartRepository,
    AttributeRepository,
    CategoryAttributeRepository,
    ProductAttributeRepository,
    DefaultAttributeValueRepository,
    ProductImageRepository,
    ShippingInfoRepository,
    ChatRepository,
    MessageRepository,
    MessageReaderRepository,
    UserChatRepository,
    OrderRepository,
    CardRepository,
    PaymentConfigRepository,
    PriceOfferRepository,
    NotificationRepository,
    NotificationRecipientRepository,
];

const gateways = [
    ChatGetaway,
    PriceOfferGateway,
    NotificationGateway,
];

const exceptionFilters = [
    { provide: APP_FILTER, useClass: CustomHttpExceptionFilter },
];

const globalJwtGuard = {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
}

const guards = [
    SystemRoleGuard,
    SameUserGuard,
    EmailConfirmGuard,
    SellerGuard,
    BuyerGuard,
    ChangeProductOfferStatusGuard,
];

const interceptors = [
    DeleteFileInterceptor,
];

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                ...configDatabase.getTypeOrmOptions(configService)
            }),
            inject: [ConfigService],
        }),
        TypeOrmExModule.forCustomRepository(repositories),
        PassportModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public')
        }),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_ACCESS_SECRET,
            signOptions: { expiresIn: `${process.env.JWT_ACCESS_EXPIRE_TIME}s` },
        }),
        MailerModule.forRoot({
            transport: {
                host: process.env.EMAIL_HOST,
                auth: {
                    user: process.env.EMAIL_FROM,
                    pass: process.env.EMAIL_PASS,
                },
            },
            template: {
                dir: ('dist/views/emails'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                }
            },
        }),
        HttpModule,
        ScheduleModule.forRoot(),
    ],
    controllers: [...controllers],
    providers: [...services, ...strategies, ...gateways, ...guards, globalJwtGuard, ...exceptionFilters, ...interceptors ],
})
export class AppModule {}
