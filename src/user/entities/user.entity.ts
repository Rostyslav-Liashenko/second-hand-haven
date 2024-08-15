import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { UserResponseDto } from '../dtos/response/user.response.dto';
import { SocialLoginRequestDto } from '../../auth/dtos/request/social-login.request.dto';
import { LocalAuthEntity } from '../../auth/entities/local-auth.entity';
import { GoogleAuthEntity } from '../../auth/entities/google-auth.entity';
import { BaseAuthEntity } from '../../auth/entities/base-auth.entity';
import { AuthProvider } from '../../auth/enums/auth-provider.enum';
import { FacebookAuthEntity } from '../../auth/entities/facebook-auth.entity';
import { SystemRole } from '../../core/enums/system-role.enum';
import { Product } from '../../product/entities/product.entity';
import { Wishlist } from '../../wishlist/entities/wishlist.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { UpdateUserRequestDto } from '../dtos/request/update-user.request.dto';
import { ShippingInfo } from '../../shipping-info/entities/shipping-info.entity';
import { PersonalSettingResponseDto } from '../dtos/response/personal-setting.response.dto';
import { UpdatePersonalSettingCreatedUserRequestDto } from '../dtos/request/update-personal-setting-created-user.request.dto';
import { storageUserFolder } from '../../configs/upload-file-config';
import { UpdateUserPhotoResponseDto } from '../dtos/response/update-user-photo.response.dto';
import { UserChat } from '../../chat/entities/user-chat.entity';
import { Order } from '../../order/entities/order.entity';
import { PublicProfileResponseDto } from '../dtos/response/public-profile.response.dto';
import { DetailUserResponseDto } from '../dtos/response/detail-user.response.dto';
import { Notification } from '../../notification/entities/notification.entity';
import { NotificationRecipient } from '../../notification/entities/notification-recipient.entity';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';
import { AdminRegistrationRequestDto } from '../../auth/dtos/request/admin-registration.request.dto';
import { UpdatePersonalSettingRequestDto } from '../dtos/request/update-personal-setting.request.dto';
import { Card } from '../../card/entities/card.entity';
import * as process from "process";

@Entity()
export class User extends BaseEntity {
    @Column({name: 'first_name', type: 'varchar', length: 100})
    public firstName: string;

    @Column({name: 'last_name', type: 'varchar', length: 100, nullable: true})
    public lastName?: string;

    @Column({ name: 'image_url', type: 'varchar', nullable: true })
    public imageUrl?: string;

    @Column({name: 'is_email_subscribe', type: 'boolean', default: false})
    public isEmailSubscribe: boolean;

    @Column( {name: 'is_email_confirm', type: 'boolean', default: false})
    public isEmailConfirm: boolean;

    @Column({
        name: 'system_role',
        type: 'enum',
        enum: SystemRole,
        default: SystemRole.USER
    })
    public systemRole: SystemRole;

    @Column({name: 'public_profile_id', type: 'varchar', length: 200})
    public publicProfileId: string;

    @Column({name: 'phone_number', type: 'varchar', length: 14, default: '', unique: true})
    public phoneNumber: string;

    @Column({name: 'about_me', type: 'varchar', length: 510, default: ''})
    public aboutMe: string;

    @OneToOne(() => BaseAuthEntity, {cascade: true})
    @JoinColumn()
    public auth: BaseAuthEntity;

    @OneToMany(() => Product, (product) => product.owner)
    public products: Product[];

    @OneToOne(() => Wishlist, (wishlist) => wishlist.user)
    public wishlist: Wishlist;

    @OneToOne(() => Cart, (cart) => cart.user)
    public cart: Cart;

    @OneToOne(() => ShippingInfo, (shippingInfo) => shippingInfo.user)
    public shippingInfo: ShippingInfo;

    @OneToOne(() => Card, (card) => card.user)
    public card: Card;

    @OneToMany(() => UserChat, (userChat) => userChat.user)
    public userChats: UserChat[];

    @OneToMany(() => Order, (order) => order.buyer)
    public orders: Order[];

    @OneToMany(() => PriceOffer, (priceOffer) => priceOffer.buyer)
    public priceOffers: PriceOffer[];

    @OneToMany(() => Notification, (notification) => notification.sender)
    public notifications: Notification[];

    @OneToMany(() => NotificationRecipient, (notificationRecipient) => notificationRecipient.recipient)
    public notificationRecipients: NotificationRecipient[];

    public static fromLocalAuthDto(userCreateDto: AdminRegistrationRequestDto): User {
        const user = new User();
        user.firstName = userCreateDto.firstName;
        user.isEmailSubscribe = userCreateDto.isEmailSubscribe;
        user.isEmailConfirm = false;

        const auth = new BaseAuthEntity();
        auth.email = userCreateDto.email;
        auth.isAccordingTermUse = true;
        auth.provider = AuthProvider.LOCAL;
        user.auth = auth;

        const localAuth = new LocalAuthEntity();
        localAuth.password = userCreateDto.password;
        auth.localAuth = localAuth;

        return user;
    }

    public static fromGoogleAuthDto(userCreateDto: SocialLoginRequestDto): User {
        const user = new User();

        user.firstName = userCreateDto.firstName;
        user.lastName = userCreateDto.lastName;
        user.imageUrl = userCreateDto.imageUrl;
        user.isEmailSubscribe = userCreateDto.isEmailSubscribe;
        user.isEmailConfirm = userCreateDto.isEmailConfirm;

        const auth = new BaseAuthEntity();
        auth.email = userCreateDto.email;
        auth.isAccordingTermUse = true;
        auth.provider = AuthProvider.GOOGLE;
        user.auth = auth;

        const googleAuth = new GoogleAuthEntity();
        googleAuth.socialId = userCreateDto.socialId;
        auth.googleAuth = googleAuth;

        return user;
    }

    public static fromFacebookAuthDto(userCreateDto: SocialLoginRequestDto): User {
        const user = new User();

        user.firstName = userCreateDto.firstName;
        user.lastName = userCreateDto.lastName;
        user.imageUrl = userCreateDto.imageUrl;
        user.isEmailSubscribe = userCreateDto.isEmailSubscribe;
        user.isEmailConfirm = userCreateDto.isEmailConfirm;

        const auth = new BaseAuthEntity();
        auth.email = userCreateDto.email;
        auth.isAccordingTermUse = true;
        auth.provider = AuthProvider.FACEBOOK;
        user.auth = auth;

        const facebookAuth = new FacebookAuthEntity();
        facebookAuth.socialId = userCreateDto.socialId;
        auth.facebookAuth = facebookAuth;

        return user;
    }

    public static toImageResponseDto(imageUrl?: string): string {
        if (!imageUrl) return;

        return imageUrl.includes('https')
            ? imageUrl
            : `${process.env.BASE_SERVER_URL}${process.env.SERVER_PHOTO}/${storageUserFolder}/${imageUrl}`;
    }

    public static fromUpdateUserDto(dto: UpdateUserRequestDto): User {
        const user = new User();

        user.firstName = dto.firstName;
        user.lastName = dto.lastName;
        user.isEmailConfirm = dto.isEmailConfirm;
        user.phoneNumber = dto.phoneNumber;
        user.systemRole = dto.systemRole;

        return user;
    }

    public static toDto(user: User): UserResponseDto {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: User.toImageResponseDto(user.imageUrl),
            publicProfileId: user.publicProfileId,
            systemRole: user.systemRole,
            isEmailConfirm: user.isEmailConfirm,
        };
    }

    public static fromUpdatePersonalSettingCreatedUser(dto: UpdatePersonalSettingCreatedUserRequestDto): User {
        const user = new User();
        const auth = new BaseAuthEntity();

        auth.email = dto.email;

        user.firstName = dto.firstName;
        user.lastName = dto.lastName;
        user.phoneNumber = dto.phoneNumber;
        user.aboutMe = dto.aboutMe;
        user.auth = auth;

        return user;
    }

    public static fromUpdatePersonalSetting(dto: UpdatePersonalSettingRequestDto): User {
        const user = new User();
        const auth = new BaseAuthEntity();

        auth.email = dto.email;

        user.firstName = dto.firstName;
        user.lastName = dto.lastName;
        user.aboutMe = dto.aboutMe;
        user.auth = auth;

        return user;
    }

    public static toPersonalSettingDto(user: User): PersonalSettingResponseDto {
        return {
            email: user.auth.email,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: User.toImageResponseDto(user.imageUrl),
            authProvider: user.auth.provider,
            aboutMe: user.aboutMe,
            phoneNumber: user.phoneNumber,
        }
    }

    public static toUpdateUserPhotoDto(user: User): UpdateUserPhotoResponseDto {
        return {
            imageUrl: User.toImageResponseDto(user.imageUrl),
        }
    }

    public static toPublicProfileDto(user: User): PublicProfileResponseDto {
        return  {
            id: user.id,
            publicProfileId: user.publicProfileId,
            firstName: user.firstName,
            lastName: user.lastName,
            aboutMe: user.aboutMe,
            imageUrl: User.toImageResponseDto(user.imageUrl),
        }
    }

    public static toDetailUser(user: User): DetailUserResponseDto {
        return  {
            id: user.id,
            publicProfileId: user.publicProfileId,
            firstName: user.firstName,
            lastName: user.lastName ?? '',
            imageUrl: User.toImageResponseDto(user.imageUrl),
            phoneNumber: user.phoneNumber ?? '',
            email: user.auth.email,
            systemRole: user.systemRole,
            isEmailConfirm: user.isEmailConfirm,
        }
    }
}
