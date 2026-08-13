import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JwtPayloadDto } from "./dto/jwt-payload.dto";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractAccessToken(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractAccessToken(request: Request): string | undefined {
    const token = request.cookies['access_token'];
    return token;
  }
}