import { PageMetaResponseDto } from './page-meta.response.dto';

export class PageResponseDto<T>{
    public readonly data: T[];

    public readonly meta: PageMetaResponseDto;
}