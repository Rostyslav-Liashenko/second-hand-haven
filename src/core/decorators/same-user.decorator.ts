import { RequestObjectType } from '../enums/request-object-type.enum';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export type SameUserConfig = {
    requestObjectType: RequestObjectType
}

export const SameUser = (sameUserConfig: SameUserConfig): CustomDecorator => {
    return SetMetadata('sameUserConfig', sameUserConfig);
};
