import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CardService } from '../services/card.service';
import { ApiTags } from '@nestjs/swagger';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SameUser } from '../../core/decorators/same-user.decorator';
import { RequestObjectType } from '../../core/enums/request-object-type.enum';
import { OrGuard } from '@nest-lab/or-guard';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';
import { SameUserGuard } from '../../core/guards/same-user.guard';
import { UpsertCardRequestDto } from '../dtos/request/upsert-card.request.dto';
import { UpsertCardResponseDto } from '../dtos/response/upsert-card.response.dto';

@ApiTags('cards')
@Controller('cards')
export class CardController {
    constructor(private readonly cardService: CardService) {}

    @Get('user/:id')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async findByUserId(@Param('id') userId: string): Promise<UpsertCardResponseDto> {
        return this.cardService.findByUserId(userId);
    }

    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    @Put('user/:id')
    public async updateByUserId(
        @Param('id') userId: string,
        @Body() updateCardRequestDto: UpsertCardRequestDto,
    ): Promise<UpsertCardResponseDto> {
        return this.cardService.updateByUserId(userId, updateCardRequestDto);
    }
}