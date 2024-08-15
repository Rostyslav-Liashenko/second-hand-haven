import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { ShippingInfo } from '../entities/shipping-info.entity';
import { BaseRepository } from '../../core/repositories/base.repository';


@CustomRepository(ShippingInfo)
export class ShippingInfoRepository extends BaseRepository<ShippingInfo> {
    public async generateShippingInfo(userId: string): Promise<void> {
        const shippingInfo = {
            addressLine: '',
            city: '',
            zipCode: '',
            user: { id: userId }
        };

        await this.save(shippingInfo);
    }


    public async findByUserId(userId: string): Promise<ShippingInfo> {
        return this.findOne({
            where: {
                user: { id: userId }
            },
        });
    }

    public async softDeleteByUserId(userId: string): Promise<void> {
        await this.createQueryBuilder('shippingInfo')
            .innerJoin('shippingInfo.user', 'user')
            .softDelete()
            .where('user.id = :userId', {userId})
            .execute();
    }
}