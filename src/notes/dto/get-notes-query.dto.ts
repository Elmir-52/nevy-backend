import { IsUUID } from "class-validator";

export class GetNotesQueryDto {
    @IsUUID()
    userId!: string;
}