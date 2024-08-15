import { Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { UnitOfWorkService } from './unit-of-work.service';
import { PageMetaResponseDto } from '../dto/response/page-meta.response.dto';
import { PageResponseDto } from '../dto/response/page.response.dto';
import { PageOptionsRequestDto } from '../dto/request/page-options.request.dto';
import { PageWithDataMetaResponseDto } from '../dto/response/page-with-data-meta.response.dto';

@Injectable()
export class PaginationService extends BaseService {
    constructor(protected readonly unitOfWork: UnitOfWorkService) {
        super(unitOfWork);
    }

    public async createPage<T>(data: T[], pageOptionsDto: PageOptionsRequestDto, itemTotalCount: number): Promise<PageResponseDto<T>> {
        const meta = await this.createPageMeta(pageOptionsDto, itemTotalCount);

        return {
            data: data,
            meta: meta
        };
    }

    public async createPageWithDataMeta<T, K>(
        data: T,
        metaData: K,
        pageOptionsDto: PageOptionsRequestDto,
        itemTotalCount: number
    ): Promise<PageWithDataMetaResponseDto<T, K>> {
        const meta = await this.createPageMeta(pageOptionsDto, itemTotalCount);

        return {
            data,
            metaData,
            meta,
        }
    }

    private async createPageMeta(pageOptionsDto: PageOptionsRequestDto, itemTotalCount: number): Promise<PageMetaResponseDto> {
        const pageCount = Math.ceil(itemTotalCount / pageOptionsDto.take)

        return {
            page: pageOptionsDto.page,
            take: pageOptionsDto.take,
            itemTotalCount: itemTotalCount,
            pageCount: pageCount,
            hasPreviousPage: pageOptionsDto.page > 1,
            hasNextPage: pageOptionsDto.page < pageCount,
        };
    }
}
