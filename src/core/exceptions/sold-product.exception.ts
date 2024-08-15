import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';


export class SoldProductException extends BaseException {
    constructor() {
        super(HttpStatus.UNPROCESSABLE_ENTITY);
        this.name = 'SoldProductException'
        this.message = 'It is not possible to buy the sold product';
    }
}