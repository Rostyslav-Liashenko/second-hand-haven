import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends BaseException {
    constructor() {
        super(HttpStatus.UNPROCESSABLE_ENTITY);
        this.name = 'InvalidCredentialsException';
        this.message = 'invalid credentials';
    }
}
