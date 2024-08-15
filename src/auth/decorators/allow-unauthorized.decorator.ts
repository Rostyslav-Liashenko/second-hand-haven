import { CustomDecorator, SetMetadata } from '@nestjs/common';


export const IS_ALLOW_UNAUTHORIZED_KEY = 'isAllowUnauthorized';
export const AllowUnauthorized = (): CustomDecorator => SetMetadata(IS_ALLOW_UNAUTHORIZED_KEY, true);