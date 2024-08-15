import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AdjacentCategoryRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public previousId: string;

    @IsNotEmpty()
    @IsString()
    public name: string;
}
