import { IsInt, IsPositive, IsString } from "class-validator";

export class CreatePropertyDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsInt()
    // @IsPositive()
    price: number;
}
