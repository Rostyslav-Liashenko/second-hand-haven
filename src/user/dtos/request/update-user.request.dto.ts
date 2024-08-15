import { SystemRole } from '../../../core/enums/system-role.enum';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';


export class UpdateUserRequestDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    public firstName: string;

    @IsString()
    @MaxLength(100)
    public lastName: string;

    @IsNotEmpty()
    @IsBoolean()
    public isEmailConfirm: boolean;

    @IsString()
    @IsOptional()
    public phoneNumber: string;

    @IsNotEmpty()
    @IsEnum(SystemRole)
    public systemRole: SystemRole;
}