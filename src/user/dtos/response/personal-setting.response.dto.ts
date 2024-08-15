import { AuthProvider } from '../../../auth/enums/auth-provider.enum';

export class PersonalSettingResponseDto {
    public email: string;
    public firstName: string;
    public lastName: string;
    public imageUrl: string;
    public authProvider: AuthProvider;
    public aboutMe: string;
    public phoneNumber: string;
}
