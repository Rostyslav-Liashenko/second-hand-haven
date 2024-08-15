import { HttpStatus } from '@nestjs/common';

export abstract class BaseException extends Error {
    public readonly status: HttpStatus;

    protected constructor(httpStatus: HttpStatus) {
        super();
        this.status = httpStatus;
    }
}
