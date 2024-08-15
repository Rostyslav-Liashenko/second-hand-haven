import { UserService } from '../services/user.service';
import { ApiTags } from '@nestjs/swagger';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Put,
    Query,
    Request,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { UserResponseDto } from '../dtos/response/user.response.dto';
import { AllowUnauthorized } from '../../auth/decorators/allow-unauthorized.decorator';
import { UpdateUserRequestDto } from '../dtos/request/update-user.request.dto';
import { PersonalSettingResponseDto } from '../dtos/response/personal-setting.response.dto';
import { PersonalSettingService } from '../services/personal-setting.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { storageUserFolder, userStorage } from '../../configs/upload-file-config';
import { UpdateUserPhotoResponseDto } from '../dtos/response/update-user-photo.response.dto';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';
import { SameUser } from '../../core/decorators/same-user.decorator';
import { RequestObjectType } from '../../core/enums/request-object-type.enum';
import { OrGuard } from '@nest-lab/or-guard';
import { SameUserGuard } from '../../core/guards/same-user.guard';
import { UpdatePasswordRequestDto } from '../dtos/request/update-password.request.dto';
import { DeleteFileInterceptor } from '../../core/interceptors/delete-file.interceptor';
import { DeleteFile } from '../../core/decorators/delete-file.decorator';
import { RequestDeleteFileObjectType } from '../../core/enums/request-delete-file-object-type.enum';
import { PublicProfileResponseDto } from '../dtos/response/public-profile.response.dto';
import { PageOptionsRequestDto } from '../../core/dto/request/page-options.request.dto';
import { PageResponseDto } from '../../core/dto/response/page.response.dto';
import { DetailUserResponseDto } from '../dtos/response/detail-user.response.dto';
import { UpdatePersonalSettingRequestDto } from '../dtos/request/update-personal-setting.request.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly personalSettingService: PersonalSettingService,
    ) {}

    @Get()
    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    public async find(@Query() pageOptionsDto: PageOptionsRequestDto): Promise<PageResponseDto<DetailUserResponseDto>> {
        return this.userService.findAll(pageOptionsDto);
    }

    @Get('owners')
    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    public async findOwners(): Promise<UserResponseDto[]> {
        return this.userService.findOwners();
    }

    @AllowUnauthorized()
    @Get('top-sellers')
    public async findTopSellers(@Query('count') countSeller: number): Promise<UserResponseDto[]> {
        return this.userService.findTopSellers(countSeller);
    }

    @Get(':id')
    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    public async findById(@Param('id') userId: string): Promise<DetailUserResponseDto> {
        return this.userService.findById(userId);
    }

    @Get(':id/personal-setting')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async findPersonalSettingByUserId(@Param('id') id: string): Promise<PersonalSettingResponseDto> {
        return this.personalSettingService.findByUserId(id);
    }

    @AllowUnauthorized()
    @Get('public-profile/:id')
    public async findByPublicProfileId(@Param('id') id: string): Promise<PublicProfileResponseDto> {
        return this.userService.findByPublicProfileId(id);
    }


    @Put(':id/personal-setting/password')
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(SameUserGuard)
    public async updatePassword(
        @Param('id') id: string,
        @Body() updatePasswordRequestDto: UpdatePasswordRequestDto,
    ): Promise<void> {
        return this.personalSettingService.updatePassword(id, updatePasswordRequestDto);
    }

    @Put(':id/personal-setting')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async updatePersonalSettingByUserId(
        @Param('id') id: string,
        @Body() updatePersonalSettingRequestDto: UpdatePersonalSettingRequestDto,
    ): Promise<PersonalSettingResponseDto> {
        return this.personalSettingService.update(id, updatePersonalSettingRequestDto);
    }

    @Put('update-photo')
    @DeleteFile({
        prefixFolder: storageUserFolder,
        requestDeleteFileObjectType: RequestDeleteFileObjectType.USER
    })
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.QUERY
    })
    @UseGuards(OrGuard([SameUserGuard, SystemRoleGuard]))
    @UseInterceptors(DeleteFileInterceptor, AnyFilesInterceptor(userStorage))
    public async uploadUserImage(
        @Query('userId') userId: string,
        @UploadedFiles() files,
        @Request() req
    ): Promise<UpdateUserPhotoResponseDto> {
        const trueUserId = req.query.userId;
        const file = files[0];
        const fileName = `${trueUserId}/${file.filename}`

        return this.personalSettingService.updatePhoto(trueUserId, fileName);
    }

    @Put(':id')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserRequestDto
    ): Promise<UserResponseDto> {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    public async deleteById(@Param('id') productId: string): Promise<void> {
        return this.userService.softDeleteById(productId);
    }
}
