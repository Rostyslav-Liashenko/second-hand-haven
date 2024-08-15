import { UnitOfWorkService } from './unit-of-work.service';

export abstract class BaseService {
    constructor(protected readonly unitOfWork: UnitOfWorkService) {}
}