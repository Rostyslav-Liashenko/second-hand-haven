import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';

@Injectable()
export class CryptoService {
    public toBase64(data: string): string {
        const buffer = Buffer.from(data);

        return buffer.toString('base64');
    }

    public getHashBySha1(data: string): string {
        const shaSum = crypto.createHash('sha1');
        shaSum.update(data);

        return shaSum.digest('base64');
    }
}
