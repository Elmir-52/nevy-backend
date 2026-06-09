import { IsDateString, IsString } from "class-validator";

export class UpdateNoteDto {
    @IsString()
    title!: string;

    @IsString()
    content!: string;

    @IsDateString()
    updatedAt!: Date;
}