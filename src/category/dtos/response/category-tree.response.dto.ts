
export class CategoryTreeResponseDto {
    public id: string;
    public name: string;
    public order: number;
    public children: CategoryTreeResponseDto[];
}