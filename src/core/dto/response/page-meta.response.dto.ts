
export class PageMetaResponseDto {
    public readonly page: number;
    public readonly take: number;
    public readonly itemTotalCount: number;
    public readonly pageCount: number;
    public readonly hasPreviousPage: boolean;
    public readonly hasNextPage: boolean;
}