import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRole } from '../enums/system-role.enum';
import { IS_SYSTEM_ROLE } from '../decorators/system-roles.decorator';

@Injectable()
export class SystemRoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    public canActivate(context:ExecutionContext): boolean {
        const roles = this.reflector.get<SystemRole[]>(IS_SYSTEM_ROLE, context.getHandler());

        if (!roles?.length) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return roles.includes(user.systemRole);
    }
}