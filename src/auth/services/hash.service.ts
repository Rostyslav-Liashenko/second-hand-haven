import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import * as bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { PairCodeChellengerVerifier } from '../types/pair-code-chellenger-verifier';

@Injectable()
export class HashService extends BaseService {

    private readonly saltOrRounds = 10; // TODO generate salt dynamic

    constructor(protected readonly unitOfWork: UnitOfWorkService) {
        super(unitOfWork);
    }

    public hashing(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltOrRounds);
    }

    public isCompare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    public getHmac(data: string, privateKey: string): string {
        const encryptAlgorithm = 'sha256';

        return crypto.createHmac(encryptAlgorithm, privateKey)
            .update(data)
            .digest('hex')
    }

    public calculateVCode(hashString: string): string {
        const md = crypto.createHash('sha-256');
        const hash = Buffer.from(hashString, 'base64');
        md.update(hash);

        const _hash = md.digest();
        const last = [];
        last[0] = _hash.at(-2);
        last[1] = _hash.at(-1);
        const numberFromBytes = this.bytesToNumber(last);
        const strCode = numberFromBytes.toString();

        return strCode.slice(Math.max(0, strCode.length - 4));
    }

    public getCodeChallengeAndVerifier(): PairCodeChellengerVerifier {
        const md = crypto.createHash('sha-256');
        const codeVerifier = crypto.randomBytes(64).toString('hex');
        const hashCodeVerifier = Buffer.from(codeVerifier);
        md.update(hashCodeVerifier);
        const codeChallenge = md.digest('base64url');

        return {
            challenge: codeChallenge,
            verifier: codeVerifier,
        }
    }

    public getHashString(): string {
        const str = crypto.randomBytes(64).toString('hex');
        const md = crypto.createHash('sha-512');
        const binaryHash = Buffer.from(str);

        md.update(binaryHash);

        return md.digest('base64');
    }

    private bytesToNumber(bytes: number[]): number {
        let code = 0;

        for (const byte of bytes) {
            code <<= 8;
            code |= byte;
        }

        return code;
    }
}