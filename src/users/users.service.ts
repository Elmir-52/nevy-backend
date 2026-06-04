import { Injectable, NotImplementedException } from "@nestjs/common";
import { CreateUserDto, GetUserDto, UpdateUserDto } from "./dto";

@Injectable()
export class UsersService {
    getOne(userId: string): Promise<GetUserDto> {
        throw new NotImplementedException('Method not implemented');
    }

    create(data: CreateUserDto): Promise<string> {
        throw new NotImplementedException('Method not implemented');
    }

    update(data: UpdateUserDto): Promise<GetUserDto> {
        throw new NotImplementedException('Method not implemented');
    }

    delete(userId: string): Promise<void> {
        throw new NotImplementedException('Method not implemented');
    }
}