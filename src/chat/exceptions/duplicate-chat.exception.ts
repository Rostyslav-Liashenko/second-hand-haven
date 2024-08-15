import { BaseException } from '../../core/exceptions/base.exception';
import { HttpStatus } from '@nestjs/common';


export class DuplicateChatException extends BaseException {

    public readonly chatId: string;

    constructor(chatId: string) {
        super(HttpStatus.UNPROCESSABLE_ENTITY);
        this.chatId = chatId;
        this.name = 'DuplicateChatException';
        this.message = 'duplicate chat';
    }
}