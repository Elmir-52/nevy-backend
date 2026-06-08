import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import postgres from "postgres";

@Injectable()
export class SqlService {
    private sqlInstance: postgres.Sql;

    constructor(private configService: ConfigService) {
        const connectionString = this.configService.get<string>('DB_CONNECTION');
        
        if (!connectionString) {
            throw new Error('Db ref not existing');
        }
        
        this.sqlInstance = postgres(connectionString);
    }

    get sql() {
        return this.sqlInstance;
    }

    async onModuleDestroy() {
        await this.sqlInstance.end();
    }
}