import { SystemRole } from '../enums/system-role.enum';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_SYSTEM_ROLE = 'isSystemRole';
export const SystemRoles = (...roles: SystemRole[]): CustomDecorator<string> => SetMetadata(IS_SYSTEM_ROLE, roles);