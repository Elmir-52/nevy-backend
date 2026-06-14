import { IsEmail, IsStrongPassword, Length } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsStrongPassword()
    @Length(8, 40)
    password!: string;
}