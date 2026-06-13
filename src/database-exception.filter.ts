import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import postgres from "postgres";

@Catch(postgres.PostgresError)
export class DatabaseExceptionFilter implements ExceptionFilter {
    catch(exception: postgres.PostgresError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const responce = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal server error";

        switch(exception.code) {
            case '23505':
                status = HttpStatus.CONFLICT;
                message = 'Such an entity already exists';
                break;
            case '22P02':
                status = HttpStatus.BAD_REQUEST;
                message = 'Data not valid';
                break;
            case '22001':
                status = HttpStatus.BAD_REQUEST;
                message = 'Data not valid';
        }

        return responce.status(status).json({
            statusCode: status,
            message: message
        });
    }
}