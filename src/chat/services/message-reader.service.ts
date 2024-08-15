import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { CreateMessageReaderRequestDto } from '../dtos/request/create-message-reader.request.dto';


@Injectable()
export class MessageReaderService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService
    ) {
        super(unitOfWork);
    }

    public async create(createMessageReaderRequestDtos: CreateMessageReaderRequestDto[]): Promise<void> {
        const work = async () => {
            await this.unitOfWork.messageReaderRepository.batchInsert(createMessageReaderRequestDtos);
        }

        return await this.unitOfWork.doWork(work);
    }
}
