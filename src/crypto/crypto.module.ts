import { Global, Module } from '@nestjs/common'; 
import { CryptoService } from './crypto.service';

@Module({ 
    providers: [CryptoService], 
    exports: [CryptoService], 
})
@Global()
export class CryptoModule {}