import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { PersonalSettingResponseDto } from '../dtos/response/personal-setting.response.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { User } from '../entities/user.entity';
import { UpdatePersonalSettingCreatedUserRequestDto } from '../dtos/request/update-personal-setting-created-user.request.dto';
import { UpdateUserPhotoResponseDto } from '../dtos/response/update-user-photo.response.dto';
import { UpdatePasswordRequestDto } from '../dtos/request/update-password.request.dto';
import { HashService } from '../../auth/services/hash.service';
import { UpdatePersonalSettingRequestDto } from '../dtos/request/update-personal-setting.request.dto';


@Injectable()
export class PersonalSettingService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly cryptoService: HashService,
    ) {
        super(unitOfWork);
    }

    public async findByUserId(userId: string): Promise<PersonalSettingResponseDto> {
        const user = await this.unitOfWork.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        return User.toPersonalSettingDto(user);
    }

    public async update(
        userId: string,
        updatePersonalSetting: UpdatePersonalSettingRequestDto
    ): Promise<PersonalSettingResponseDto> {
        const work = async () => {
            const userFromDto = User.fromUpdatePersonalSetting(updatePersonalSetting);
            const userToUpdate = await this.unitOfWork.userRepository.findById(userId);

            if (!userToUpdate) {
                throw new NotFoundException();
            }

            userToUpdate.firstName = userFromDto.firstName;
            userToUpdate.lastName = userFromDto.lastName;
            userToUpdate.aboutMe = userFromDto.aboutMe;
            userToUpdate.auth.email = userFromDto.auth.email.toLowerCase();

            const user = await this.unitOfWork.userRepository.save(userToUpdate);

            return User.toPersonalSettingDto(user);
        };

        return this.unitOfWork.doWork(work);
    }

    public async updateCreateUser(
        userId: string,
        updatePersonalSettingDto: UpdatePersonalSettingCreatedUserRequestDto
    ): Promise<PersonalSettingResponseDto> {
        const work = async () => {
            const userToUpdate = await this.unitOfWork.userRepository.findById(userId);

            if (!userToUpdate) {
                throw new NotFoundException();
            }

            userToUpdate.firstName = updatePersonalSettingDto.firstName;
            userToUpdate.lastName = updatePersonalSettingDto.lastName;
            userToUpdate.phoneNumber = updatePersonalSettingDto.phoneNumber;
            userToUpdate.aboutMe = updatePersonalSettingDto.aboutMe;
            userToUpdate.auth.email = updatePersonalSettingDto.email.toLowerCase();

            const user = await this.unitOfWork.userRepository.save(userToUpdate);

            return User.toPersonalSettingDto(user);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async updatePassword(
        userId: string,
        updatePasswordRequest: UpdatePasswordRequestDto
    ): Promise<void> {
        const work = async () => {
            const userToUpdate = await this.unitOfWork.userRepository.findById(userId);

            if (!userToUpdate) {
                throw new NotFoundException();
            }

            const newPassword = updatePasswordRequest.password;
            userToUpdate.auth.localAuth.password = await this.cryptoService.hashing(newPassword);

            await this.unitOfWork.userRepository.save(userToUpdate);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async updatePhoto(id: string, fileName: string): Promise<UpdateUserPhotoResponseDto> {
        const work = async () => {
            const userToUpdate = await this.unitOfWork.userRepository.findById(id);

            if (!userToUpdate) {
                throw new NotFoundException();
            }

            userToUpdate.imageUrl = fileName;
            const user = await this.unitOfWork.userRepository.save(userToUpdate);

            return User.toUpdateUserPhotoDto(user);
        }

        return await this.unitOfWork.doWork(work);
    }
}