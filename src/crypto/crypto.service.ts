import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, randomBytes, } from 'node:crypto';

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-gcm'; 
    private readonly ivLength = 12; 
    private readonly authTagLength = 16;
    private readonly key: Buffer;

    constructor(configService: ConfigService) {
        const encryptionKey = configService.get<string>(
            'ENCRYPTION_KEY',
        );

        if (!encryptionKey) {
            throw new Error('ENCRYPTION_KEY is not defined');
        }

        this.key = Buffer.from(encryptionKey, 'hex');

        if (this.key.length !== 32) {
            throw new Error('ENCRYPTION_KEY must be 32 bytes');
        }
    }

    encrypt(value: string): string { 
        const iv = randomBytes(this.ivLength); 

        const cipher = createCipheriv(
            this.algorithm, 
            this.key, 
            iv, 
            { 
                authTagLength: this.authTagLength, 
            }
        );

        const encrypted = Buffer.concat([ 
            cipher.update(value, 'utf8'), 
            cipher.final(), 
        ]); 

        const authTag = cipher.getAuthTag(); 
        
        // iv + authTag + encrypted 
        return Buffer.concat([ 
            iv, 
            authTag, 
            encrypted, 
        ]).toString('base64'); 
    }

    decrypt(encryptedValue: string): string { 
        try { 
            const buffer = Buffer.from(encryptedValue, 'base64'); 
            
            const iv = buffer.subarray(0, this.ivLength); 
            
            const authTag = buffer.subarray( 
                this.ivLength, 
                this.ivLength + this.authTagLength
            ); 
            
            const encrypted = buffer.subarray(this.ivLength + this.authTagLength); 
            
            const decipher = createDecipheriv( 
                this.algorithm, 
                this.key, 
                iv, 
                { 
                    authTagLength: this.authTagLength, 
                }, 
            ); 
            
            decipher.setAuthTag(authTag); 
            
            return Buffer.concat([ 
                decipher.update(encrypted), 
                decipher.final(), 
            ]).toString('utf8'); 
        } catch { 
            throw new InternalServerErrorException( 'Failed to decrypt value', ); 
        } 
    }
}