import { IsEmail, IsStrongPassword } from "class-validator";

export class LogingDto {
    @IsEmail()
    email!: string;

    @IsStrongPassword()
    password!: string;
}