import { PageMetaResponseDto } from './page-meta.response.dto';

export class PageWithDataMetaResponseDto<T, K> {
    public readonly data: T;
    public readonly metaData: K;
    public readonly meta: PageMetaResponseDto;
}
