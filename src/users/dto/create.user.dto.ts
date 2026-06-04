import { IsDateString, IsStrongPassword, Length } from "class-validator";

export class CreateUserDto {
    @Length(6, 320)
    email: string;

    @IsStrongPassword()
    password: string;

    @IsDateString()
    createdAt: Date; 
}