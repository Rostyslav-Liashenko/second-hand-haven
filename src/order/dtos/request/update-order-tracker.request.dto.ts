import { IsNotEmpty, IsString } from 'class-validator';


export class UpdateOrderTrackerRequestDto {
    @IsNotEmpty()
    @IsString()
    public trackerId: string;
}
