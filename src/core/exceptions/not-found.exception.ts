import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
    constructor() {
        super(HttpStatus.NOT_FOUND);
        this.name = 'NotFoundException';
        this.message = 'Not found';
    }
}
