import { SetMetadata } from '@nestjs/common';
import { BaseEntity } from '../core/entities/base.entity';

export const TYPEORM_EX_CUSTOM_REPOSITORY = 'TYPEORM_EX_CUSTOM_REPOSITORY';

export function CustomRepository<T extends typeof BaseEntity>(
    entity: T,
): ClassDecorator {
    return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity);
}