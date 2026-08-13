export class JwtPayloadDto {
    type!: 'refresh' | 'access';
    userId!: string;
    email!: string;
}