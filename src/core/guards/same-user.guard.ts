import { UserResponseDto } from '../../user/dtos/response/user.response.dto';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestObjectType } from '../enums/request-object-type.enum';
import { SameUserConfig } from '../decorators/same-user.decorator';
import { ProductService } from '../../product/services/product.service';


type RequestWithUserAndUserId = {
    user: UserResponseDto,
    body?: { userId: string, ownerId: string },
    params?: { id: string },
    query?: { userId: string, productId: string },
};

@Injectable()
export class SameUserGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly productService: ProductService,
    ) {}

    public async canActivate(context:ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUserAndUserId>();

        const sameUserConfig = this.reflector.get<SameUserConfig>('sameUserConfig', context.getHandler());
        const { requestObjectType } = sameUserConfig;
        const senderUserId = request.user.id;

        if (!requestObjectType) return false;

        const targetObjectId = await this.getTargetObjectId(requestObjectType, request);

        return senderUserId === targetObjectId;
    }

    private async getTargetObjectId(
        requestObjectType: RequestObjectType,
        request: RequestWithUserAndUserId
    ): Promise<string> {
        switch (requestObjectType) {
            case RequestObjectType.BODY: {
                return request.body.userId;
            }
            case RequestObjectType.PARAM: {
                return request.params.id;
            }
            case RequestObjectType.QUERY: {
                return request.query.userId;
            }
            case RequestObjectType.BODY_USER_OWNER_ID: {
                return request.body.ownerId;
            }
            case RequestObjectType.PRODUCT_ID: {
                const productId = request.query.productId;
                const product = await this.productService.findById(productId);

                return product.owner.id;
            }
        }
    }
}