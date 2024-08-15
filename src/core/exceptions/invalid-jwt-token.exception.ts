import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidJwtTokenException extends BaseException {
    constructor() {
        super(HttpStatus.UNAUTHORIZED);
        this.name = 'InvalidJwtTokenException';
        this.message = 'The JWT token is not valid';
    }
}
