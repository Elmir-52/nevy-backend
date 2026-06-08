import { IsDateString, IsEmail, IsStrongPassword, Length } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsStrongPassword()
    password!: string;

    @IsDateString()
    createdAt!: Date; 
}