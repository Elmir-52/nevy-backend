import { IsUUID } from "class-validator";

export class GetUserParams {
    @IsUUID(4)
    userId: string;
}