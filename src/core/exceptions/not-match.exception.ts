import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class NotMatchException extends BaseException {
    constructor() {
        super(HttpStatus.NOT_FOUND);
        this.name = 'NotMatchException';
        this.message = 'Not match';
    }
}
