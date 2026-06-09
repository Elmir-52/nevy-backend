import { IsUUID } from "class-validator";

export class GetNoteParamsDto {
    @IsUUID()
    noteId!: string;
}