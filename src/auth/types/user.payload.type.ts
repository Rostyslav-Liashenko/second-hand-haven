import { SystemRole } from '../../core/enums/system-role.enum';

export class UserPayload {
    public sub: string;
    public firstName: string;
    public lastName: string;
    public imageUrl?: string;
    public publicProfileId: string;
    public systemRole: SystemRole;
    public isEmailConfirm: boolean;
}
