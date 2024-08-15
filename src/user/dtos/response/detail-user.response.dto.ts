import { SystemRole } from '../../../core/enums/system-role.enum';


export class DetailUserResponseDto {
    public id: string;
    public firstName: string;
    public lastName: string;
    public imageUrl?: string;
    public publicProfileId: string;
    public isEmailConfirm: boolean;
    public phoneNumber: string;
    public email: string;
    public systemRole: SystemRole;
}
