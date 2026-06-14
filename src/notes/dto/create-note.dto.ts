import { IsHexColor, IsString, Length } from "class-validator";

export class CreateNoteDto {
    @IsString()
    title!: string;

    @IsString()
    content!: string;

    @IsHexColor()
    @Length(7, 7)
    color!: string;
}