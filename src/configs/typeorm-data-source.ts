import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import configDataBase from './config-database';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export const dataSource = new DataSource(configDataBase.getTypeOrmOptions(configService) as DataSourceOptions);