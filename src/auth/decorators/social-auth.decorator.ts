import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_SOCIAL_AUTH = 'isSocialAuth';
export const SocialAuth = (): CustomDecorator => SetMetadata(IS_SOCIAL_AUTH, true);