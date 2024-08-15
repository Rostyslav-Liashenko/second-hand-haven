import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export default {
    getTypeOrmOptions: (configService: ConfigService) => ({
        host: configService.get<string>('POSTGRES_HOST') || "localhost",
        port: configService.get<number>('POSTGRES_PORT') || 5432,
        username: configService.get<string>('POSTGRES_USER') || "postgres",
        password: configService.get<string>('POSTGRES_PASSWORD') || "postgres",
        database: configService.get<string>('POSTGRES_DB') || "secondhandhaven",
        type: 'postgres',
        synchronize: false,
        logging: true,
        entities: [
            `${__dirname}/../user/entities/*.entity{.ts,.js}`,
            `${__dirname}/../auth/entities/*.entity{.ts,.js}`,
            `${__dirname}/../category/entities/*.entity{.ts,.js}`,
            `${__dirname}/../product/entities/*.entity{.ts,.js}`,
            `${__dirname}/../wishlist/entities/*.entity{.ts,.js}`,
            `${__dirname}/../cart/entities/*.entity{.ts,.js}`,
            `${__dirname}/../attribute/entities/*.entity{.ts,.js}`,
            `${__dirname}/../shipping-info/entities/*.entity{.ts,.js}`,
            `${__dirname}/../chat/entities/*.entity{.ts,.js}`,
            `${__dirname}/../order/entities/*.entity{.ts,.js}`,
            `${__dirname}/../card/entities/*.entity{.ts,.js}`,
            `${__dirname}/../payment/entities/*.entity{.ts,.js}`,
            `${__dirname}/../price-offer/entities/*.entity{.ts,.js}`,
            `${__dirname}/../notification/entities/*.entity{.ts,.js}`,
        ],
        migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
        migrationsRun: false,
    } as TypeOrmModuleOptions),
};