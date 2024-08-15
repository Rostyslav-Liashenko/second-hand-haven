import { IsArray, IsNotEmpty, IsString } from 'class-validator';


export class IdValuesRequestDto {
    @IsNotEmpty()
    @IsString()
    public id: string;

    @IsArray()
    @IsString({each: true})
    public values: string[];
}
