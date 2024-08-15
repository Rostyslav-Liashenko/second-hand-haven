import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { ShippingInfoResponseDto } from '../dtos/response/shipping-info.response.dto';
import { ShippingInfo } from '../entities/shipping-info.entity';
import { UpdateShippingInfoRequestDto } from '../dtos/request/update-shipping-info.request.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';


@Injectable()
export class ShippingInfoService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
    ) {
        super(unitOfWork);
    }

    public async findByUserId(userId: string): Promise<ShippingInfoResponseDto> {
        const shippingInfo = await this.unitOfWork.shippingInfoRepository.findByUserId(userId);

        if (!shippingInfo) {
            throw new NotFoundException();
        }

        return ShippingInfo.toDto(shippingInfo);
    }

    public async updateByUserId(
        userId: string,
        updateShippingInfo: UpdateShippingInfoRequestDto
    ): Promise<ShippingInfoResponseDto> {
        const work = async () => {
            const shippingInfoFromDto = ShippingInfo.fromUpdateShippingInfo(updateShippingInfo);
            const shippingInfoToUpdate = await this.unitOfWork.shippingInfoRepository.findByUserId(userId);

            if (!shippingInfoToUpdate) {
                throw new NotFoundException();
            }

            shippingInfoToUpdate.addressLine = shippingInfoFromDto.addressLine;
            shippingInfoToUpdate.city = shippingInfoFromDto.city;
            shippingInfoToUpdate.zipCode = shippingInfoFromDto.zipCode;

            const shippingInfo = await this.unitOfWork.shippingInfoRepository.save(shippingInfoToUpdate);

            return ShippingInfo.toDto(shippingInfo);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async clearByUserId(userId: string): Promise<void> {
        const work = async () => {
            const shippingInfo = await this.unitOfWork.shippingInfoRepository.findByUserId(userId);

            shippingInfo.addressLine = '';
            shippingInfo.city = '';
            shippingInfo.zipCode = '';

            await this.unitOfWork.shippingInfoRepository.save(shippingInfo);
        }

        return await this.unitOfWork.doWork(work);
    }
}