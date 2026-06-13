import { IsUUID } from "class-validator";

export class GetAuthParams {
    @IsUUID()
    userId!: string;
}