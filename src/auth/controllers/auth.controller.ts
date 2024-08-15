import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Query,
    Req,
    Request,
    Response,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AllowUnauthorized } from '../decorators/allow-unauthorized.decorator';
import { LocalLoginRequestDto } from '../dtos/request/local-login.request.dto';
import { UserResponseDto } from '../../user/dtos/response/user.response.dto';
import { LocalRegistrationRequestDto } from '../dtos/request/local-registration.request.dto';
import { EmailConfirmRequestDto } from '../dtos/request/email-confirm.request.dto';
import { EmailExistResponseDto } from '../dtos/response/email-exist.response.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { JwtTokenResponseDto } from '../dtos/response/jwt-token.response.dto';
import { EmailConfirmService } from '../services/email-confirm.service';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';
import { TryResetPasswordRequestDto } from '../dtos/request/try-reset-password.request.dto';
import { ResetPasswordRequestDto } from '../dtos/request/reset-password.request.dto';
import { AdminRegistrationRequestDto } from '../dtos/request/admin-registration.request.dto';
import {GoogleAuthGuard} from "../guards/google-auth.guard";
import {SocialAuth} from "../decorators/social-auth.decorator";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly emailConfirmService: EmailConfirmService,
    ) {}

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Post('admin-register')
    public async adminRegister(
        @Body() userCreateRequestDto: AdminRegistrationRequestDto
    ): Promise<UserResponseDto> {
        return this.authService.adminRegister(userCreateRequestDto);
    }

    @AllowUnauthorized()
    @Post('register')
    public async register(@Body() userCreateRequestDto: LocalRegistrationRequestDto): Promise<UserResponseDto> {
        return this.authService.register(userCreateRequestDto);
    }

    @UseInterceptors(AuthInterceptor)
    @AllowUnauthorized()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiBody({
        type: LocalLoginRequestDto,
        examples: {
            example1: {
                value: {
                    email: 'someEmail@example.com',
                    password: 'somePassword',
                },
            },
        },
    })
    public async login(@Request() req): Promise<JwtTokenResponseDto> {
        return await this.authService.login(req.user);
    }

    @Post('logout')
    public async logout(@Request() req, @Response() res): Promise<void> {
        const userId = req.user.sub;
        await this.authService.logout(userId);

        res.clearCookie('refreshToken', {
            httpOnly: true,
        });

        res.send();
    }

    @AllowUnauthorized()
    @UseGuards(GoogleAuthGuard)
    @Get('google')
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public async googleAuth(): Promise<void> {}

    @UseInterceptors(AuthInterceptor)
    @AllowUnauthorized()
    @SocialAuth()
    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    public async googleAuthRedirect(
        @Request() req,
    ): Promise<JwtTokenResponseDto> {
        return await this.authService.login(req.user);
    }

    @UseInterceptors(AuthInterceptor)
    @AllowUnauthorized()
    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    public async refreshTokens(@Req() req): Promise<JwtTokenResponseDto> {
        const userId = req.user.sub;
        const refreshToken = req.user.refreshToken;

        return await this.authService.refreshTokens(userId, refreshToken);
    }

    @AllowUnauthorized()
    @Get('email-exist')
    public async emailExist(@Query('email') email: string): Promise<EmailExistResponseDto> {
        return this.authService.emailExist(email);
    }

    @Post('email-confirm')
    public async sendEmailConfirm(@Request() req): Promise<void> {
        const userId = req.user.id;

        return this.emailConfirmService.sendVerificationLinkByUserId(userId);
    }

    @AllowUnauthorized()
    @Put('email-confirm')
    public async emailConfirm(@Body() emailConfirmRequest: EmailConfirmRequestDto): Promise<UserResponseDto> {
        return this.authService.emailConfirm(emailConfirmRequest);
    }

    @AllowUnauthorized()
    @Put('try-reset-password')
    public async tryResetPassword(
        @Body() resetPasswordRequestDto: TryResetPasswordRequestDto
    ): Promise<void> {
        return this.authService.tryResetPassword(resetPasswordRequestDto);
    }

    @AllowUnauthorized()
    @Put('reset-password')
    public async resetPassword(
        @Body() resetPassword: ResetPasswordRequestDto
    ): Promise<void> {
        return this.authService.resetPassword(resetPassword);
    }
}
