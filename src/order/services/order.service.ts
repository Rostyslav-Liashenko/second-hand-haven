import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { CreateOrderRequestDto } from '../dtos/request/create-order.request.dto';
import { UpdateOrderRequestDto } from '../dtos/request/update-order.request.dto';
import { OrderResponseDto } from '../dtos/response/order.response.dto';
import { Order } from '../entities/order.entity';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { Product } from '../../product/entities/product.entity';
import { OrderProduct } from '../entities/order-product.entity';
import { OwnerProductResponseDto } from '../../product/dtos/response/owner-product.response.dto';
import { CreateOrderResponseDto } from '../dtos/response/create-order.response.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderShippingInfoResponseDto } from '../dtos/response/order-shipping-info.response.dto';
import { PageOptionsRequestDto } from '../../core/dto/request/page-options.request.dto';
import { PageResponseDto } from '../../core/dto/response/page.response.dto';
import { PaginationService } from '../../core/services/pagination.service';
import { CustomLoggerService } from '../../core/logger/custom-logger.service';
import { UpdateOrderTrackerRequestDto } from '../dtos/request/update-order-tracker.request.dto';
import { ProductService } from '../../product/services/product.service';
import { SoldProductException } from '../../core/exceptions/sold-product.exception';
import { PaymentService } from 'src/payment/services/payment.service';

@Injectable()
export class OrderService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly paginationService: PaginationService,
        private readonly customLoggerService: CustomLoggerService,
        private readonly productService: ProductService,
        private readonly paymentService: PaymentService,
    ) {
        super(unitOfWork);
        customLoggerService.setContext('OrderService');
    }

    public async findAll(pageOptionsDto: PageOptionsRequestDto): Promise<PageResponseDto<OrderResponseDto>> {
        const orderSelectQueryBuilder = await this.unitOfWork.orderRepository.findAllQueryBuilder(pageOptionsDto);

        const { entities } = await orderSelectQueryBuilder.getRawAndEntities();
        const totalItemCount = await orderSelectQueryBuilder.getCount();
        const orderResponseDtos = this.toDtoWithSum(entities);

        return this.paginationService.createPage(orderResponseDtos, pageOptionsDto, totalItemCount);
    }

    public async findById(orderId: string): Promise<OrderResponseDto> {
        const order = await this.unitOfWork.orderRepository.findById(orderId);
        const sum = this.findTotalPrice(order);

        return Order.toDto(order, sum);
    }

    public async findEntityById(orderId: string): Promise<Order> {
        return this.unitOfWork.orderRepository.findById(orderId);
    }

    public async findByBuyerId(buyerId: string): Promise<OrderResponseDto[]> {
        const orders = await this.unitOfWork.orderRepository.findByBuyerId(buyerId);

        return this.toDtoWithSum(orders);
    }

    public async findBySellerId(sellerId: string): Promise<OrderResponseDto[]> {
        const orders = await this.unitOfWork.orderRepository.findBySellerId(sellerId);

        return this.toDtoWithSum(orders);
    }

    public async findShippingInfoByOrderId(orderId: string): Promise<OrderShippingInfoResponseDto> {
        const order = await this.unitOfWork.orderRepository.findById(orderId);
        const { buyer } = order;
        const buyerShippingInfo = buyer.shippingInfo;

        return {
            firstName: buyer.firstName,
            lastName: buyer.lastName,
            homeAddress: buyerShippingInfo.addressLine,
            city: buyerShippingInfo.city,
            postNumber: buyerShippingInfo.zipCode,
        };
    }

    public async create(createOrderRequestDto: CreateOrderRequestDto): Promise<CreateOrderResponseDto[]> {
        const { productIds, buyerId } = createOrderRequestDto;
        const products = await this.unitOfWork.productRepository.findByManyId(productIds, buyerId);
        const hasSoldProduct = products.some((product) => product.isSold);

        if (hasSoldProduct) {
            throw new SoldProductException();
        }

        const ownerGroups = this.findGroupsByOwnerId(products);

        const ordersToSave = ownerGroups.map((ownerGroup) => {
            const orderProducts = ownerGroup.products.map((product) => OrderProduct.fromDto(product));

            const order = Order.fromCreateOrderDto(createOrderRequestDto);
            order.orderProducts = orderProducts;

            return order;
        });

        const orders = await this.unitOfWork.orderRepository.batchSave(ordersToSave);

        return orders.map((order) => ({ id: order.id }))
    }

    public async update(id: string, updateOrderRequest: UpdateOrderRequestDto): Promise<OrderResponseDto> {
        const work = async () => {
            const orderToUpdate = await this.unitOfWork.orderRepository.findById(id);
            const newStatus = updateOrderRequest.status;

            if (!orderToUpdate) {
                throw new NotFoundException();
            }

            await this.checkAndExecutionPayment(orderToUpdate, newStatus);

            orderToUpdate.status = newStatus;
            const order = await this.unitOfWork.orderRepository.save(orderToUpdate);
            const sum = this.findTotalPrice(order);

            return Order.toDto(order, sum);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async updateTracker(id: string, updateOrderTracker: UpdateOrderTrackerRequestDto): Promise<OrderResponseDto> {
        const work = async () => {
            const orderToUpdateTracker = await this.unitOfWork.orderRepository.findById(id);

            if (!orderToUpdateTracker) {
                throw new NotFoundException();
            }

            const isConfirmed = orderToUpdateTracker.status === OrderStatus.CONFIRMED;

            if (!isConfirmed) {
                throw new BadRequestException();
            }

            orderToUpdateTracker.trackId = updateOrderTracker.trackerId;
            const order = await this.unitOfWork.orderRepository.save(orderToUpdateTracker);
            const sum = this.findTotalPrice(order);

            return Order.toDto(order, sum);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async tryMarkProductsAsSold(orderProducts: OrderProduct[], orderStatus: OrderStatus): Promise<void> {
        const isOrderConfirmed = orderStatus === OrderStatus.CONFIRMED;

        if (!isOrderConfirmed) return;

        const products = orderProducts.map((orderProducts) => orderProducts.product);
        const productIds = products.map((product) => product.id);

        return await this.productService.markAsSold(productIds);
    }

    private async checkAndExecutionPayment(order: Order, newOrderStatus: OrderStatus): Promise<void> {
        const totalSum = this.findTotalPrice(order);
        const description = this.findDescription(order);

        switch (newOrderStatus) {
            case OrderStatus.EXPECT_PAYMENT: {
                await this.paymentService.checkout(order.id, totalSum, description);
                break;
            }
            case OrderStatus.CLOSED: {
                await this.paymentService.payouts(order.id, totalSum, description);
                break;
            }
        }
    }

    private findGroupsByOwnerId(products: Product[]): OwnerProductResponseDto[] {
        const group = new Map<string, Product[]>();

        products.forEach((product) => {
            const ownerId = product.owner.id;
            const productsByOwnerId = group.get(ownerId);

            if (productsByOwnerId) {
                group.set(ownerId, [...(productsByOwnerId), product]);
            } else {
                group.set(ownerId, [product]);
            }
        });

        const arrayGroups = [...group];

        return arrayGroups.map((arrayGroup) => ({
            ownerId: arrayGroup[0],
            products: arrayGroup[1],
        }));
    }

    private toDtoWithSum(orders: Order[]): OrderResponseDto[] {
        return orders.map((order) => {
            const totalSum = this.findTotalPrice(order);

            return Order.toDto(order, totalSum);
        });
    }

    private findTotalPrice(order: Order): number {
        const orderProducts = order.orderProducts;

        return orderProducts.reduce((sum: number, orderProduct) => sum + (+orderProduct.price), 0);
    }

    private findDescription(order: Order): string {
        const productTitles = order.orderProducts.map((orderProduct) => orderProduct.product.name);
        const title = 'Payment for the SecondHandHaven service';
        const purchasedProductTitle = `Payment for such products: ${productTitles.join(', ')}`;

        return title + '\n' + purchasedProductTitle;
    }
}
