import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { UpsertCardRequestDto } from '../dtos/request/upsert-card.request.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { UpsertCardResponseDto } from '../dtos/response/upsert-card.response.dto';
import { Card } from '../entities/card.entity';

@Injectable()
export class CardService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
    ) {
        super(unitOfWork);
    }

    public async findByUserId(userId: string): Promise<UpsertCardResponseDto> {
        const card = await this.unitOfWork.cardRepository.findByUserId(userId);

        if (!card) {
            throw new NotFoundException();
        }

        return Card.toDto(card);
    }


    public async updateByUserId(
        userId: string,
        updateCard: UpsertCardRequestDto
    ): Promise<UpsertCardResponseDto> {
        const work = async () => {
            const updateCardFromDto = Card.fromUpdateDto(updateCard);
            const cardToUpdate = await this.unitOfWork.cardRepository.findByUserId(userId);

            if (!cardToUpdate) {
                throw new NotFoundException();
            }

            cardToUpdate.number = updateCardFromDto.number;
            cardToUpdate.cvv = updateCardFromDto.cvv;
            cardToUpdate.expireMonth = updateCardFromDto.expireMonth;
            cardToUpdate.expireYear = updateCardFromDto.expireYear;

            return  await this.unitOfWork.cardRepository.save(cardToUpdate);
        }

        return await this.unitOfWork.doWork(work);
    }
}
