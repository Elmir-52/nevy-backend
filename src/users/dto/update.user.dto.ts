import { IsStrongPassword } from "class-validator";

export class UpdateUserDto {
    @IsStrongPassword()
    password: string;
}