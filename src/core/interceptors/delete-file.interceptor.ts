import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { corePath } from '../../configs/upload-file-config';
import { Reflector } from '@nestjs/core';
import { DELETE_FILE_DECORATOR_KEY, DeleteFileConfig, } from '../decorators/delete-file.decorator';
import { RequestDeleteFileObjectType } from '../enums/request-delete-file-object-type.enum';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { FileService } from '../services/file.service';

type RequestWithQuery = {
    query: { productId?: string, userId?: string },
};

@Injectable()
export class DeleteFileInterceptor implements NestInterceptor {

    constructor(
        private readonly reflector: Reflector,
        private readonly fileService: FileService,
    ) {}

    public intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<void> {
        const request = context.switchToHttp().getRequest();
        const deleteFileConfig = this.reflector.get<DeleteFileConfig>(DELETE_FILE_DECORATOR_KEY, context.getHandler());
        const { prefixFolder, requestDeleteFileObjectType } = deleteFileConfig;
        const folder = this.findFolderByRequestDeleteFileObjectType(requestDeleteFileObjectType, request);

        if (!folder) throw new InvalidCredentialsException();

        const directory = `${corePath}/${prefixFolder}/${folder}`;
        const isExistDirectory = this.fileService.isExistDirectory(directory);

        if (isExistDirectory) {
            this.fileService.deleteFilesInDirectory(directory);
        }

        return next.handle();
    }



    private findFolderByRequestDeleteFileObjectType(
        requestDeleteFileObjectType: RequestDeleteFileObjectType,
        request: RequestWithQuery,
    ): string {
        switch (requestDeleteFileObjectType) {
            case RequestDeleteFileObjectType.PRODUCT: {
                return request.query.productId;
            }
            case RequestDeleteFileObjectType.USER: {
                return request.query.userId;
            }
        }
    }
}