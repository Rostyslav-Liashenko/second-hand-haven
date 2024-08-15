import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { CustomLoggerService } from './core/logger/custom-logger.service';
import * as process from 'node:process';

async function bootstrap(): Promise<void> {
    process.env.TZ = 'UTC';

    const app = await NestFactory.create(AppModule, {
        logger: new CustomLoggerService(),
    });

    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.use(cookieParser());

    const config = new DocumentBuilder()
        .setTitle('SecondHandHaven')
        .addSecurity('AccessToken', {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
        })
        .addSecurityRequirements('AccessToken')
        .build();

    app.enableCors({
        origin: [process.env.SITE_URL],
        credentials: true,
    });

    if (process.env.NODE_ENV !== 'production') {
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/swagger', app, document);
    }

    await app.listen(process.env.PORT);
}

bootstrap();
