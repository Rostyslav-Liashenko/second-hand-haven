import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../core/entities/base.entity';
import { ShippingInfoResponseDto } from '../dtos/response/shipping-info.response.dto';
import { UpdateShippingInfoRequestDto } from '../dtos/request/update-shipping-info.request.dto';

@Entity({name: 'shipping_info'})
export class ShippingInfo extends BaseEntity {
    @Column({name: 'address_line1', type: 'varchar', length: 1000})
    public addressLine: string;

    @Column({name: 'city', type: 'varchar', length: 500})
    public city: string;

    @Column({name: 'zip_code', type: 'varchar', length: 10})
    public zipCode: string;

    @OneToOne(() => User, (user) => user.shippingInfo)
    @JoinColumn({name: 'user_id'})
    public user: User;

    public static fromUpdateShippingInfo(dto: UpdateShippingInfoRequestDto): ShippingInfo {
        const shippingInfo = new ShippingInfo();

        shippingInfo.addressLine = dto.addressLine;
        shippingInfo.city = dto.city;
        shippingInfo.zipCode = dto.zipCode;

        return shippingInfo;
    }

    public static toDto(shippingInfo: ShippingInfo): ShippingInfoResponseDto {
        return {
            addressLine: shippingInfo.addressLine,
            city: shippingInfo.city,
            zipCode: shippingInfo.zipCode
        }
    }
}