import { RequestDeleteFileObjectType } from '../enums/request-delete-file-object-type.enum';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export type DeleteFileConfig = {
    prefixFolder: string
    requestDeleteFileObjectType: RequestDeleteFileObjectType
}

export const DELETE_FILE_DECORATOR_KEY = 'deleteFileDecoratorKey';

export const DeleteFile = (deleteFileConfig: DeleteFileConfig): CustomDecorator => {
    return SetMetadata(DELETE_FILE_DECORATOR_KEY, deleteFileConfig);
};
