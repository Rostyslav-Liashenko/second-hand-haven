import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';


export class DuplicateLoginEmailException extends BaseException {
    constructor() {
        super(HttpStatus.UNPROCESSABLE_ENTITY);
        this.name = 'DuplicateLoginEmailException';
        this.message = 'User with this email already exists'
    }
}