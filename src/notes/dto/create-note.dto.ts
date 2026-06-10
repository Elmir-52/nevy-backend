import { IsHexColor, IsString, IsUUID, Length } from "class-validator";

export class CreateNoteDto {
    @IsUUID()
    userId!: string;

    @IsString()
    title!: string;

    @IsString()
    content!: string;

    @IsHexColor()
    @Length(7, 7)
    color!: string;
}