import { Global, Module } from "@nestjs/common";
import { SqlService } from "./sql.service";

@Module({
    providers: [SqlService],
    exports: [SqlService]
})
@Global()
export class SqlModule {}