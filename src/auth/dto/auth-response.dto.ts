export class AuthResponseDto {
    accessToken: string; // 10 min
    refreshToken: string; // 2 month

    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}