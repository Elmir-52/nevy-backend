import { IsUUID } from "class-validator";

export class GetUserParamsDto {
    @IsUUID(4)
    userId!: string;
}