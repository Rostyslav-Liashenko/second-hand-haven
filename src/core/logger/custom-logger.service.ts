import {
    cyanBright,
    Format,
    green,
    magentaBright,
    red,
    white,
    yellow,
} from 'cli-color';
import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { format } from 'date-fns';

enum LogParts {
    DATE = 'date',
    CONTEXT = 'context',
    TIMESTAMP_DIFF = 'timestampDiff',
}

enum LogLevel {
    LOG = 'log',
    ERROR = 'error',
    WARN = 'warn',
    DEBUG = 'debug',
    VERBOSE = 'verbose',
}

type LogColorings = LogParts | LogLevel;

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
    public context: string;

    private readonly colors = new Map<LogColorings, Format>([
        [LogLevel.LOG, green],
        [LogLevel.ERROR, red],
        [LogLevel.WARN, yellow],
        [LogLevel.DEBUG, magentaBright],
        [LogLevel.VERBOSE, cyanBright],
        [LogParts.DATE, white],
        [LogParts.CONTEXT, yellow],
        [LogParts.TIMESTAMP_DIFF, yellow],
    ]);

    private static lastTimestampAt: number;

    public log(message: string, context?: string): void {
        this.printMessage(message, context, LogLevel.LOG);
    }

    public error(message: string, stack?: string, context?: string): void {
        this.printMessage(message, context, LogLevel.ERROR);
        this.printStackTrace(stack);
    }

    public warn(message: string, context?: string): void {
        this.printMessage(message, context, LogLevel.WARN);
    }

    public debug(message: string, context?: string): void {
        this.printMessage(message, context, LogLevel.DEBUG);
    }

    public verbose(message: string, context?: string): void {
        this.printMessage(message, context, LogLevel.VERBOSE);
    }

    public setContext(context: string): void {
        this.context = context;
    }

    private printMessage(message: string, context: string, level: LogLevel): void {
        if (context) {
            this.context = context;
        }

        const preparedMessage = this.prepareMessage(message, level);

        console.log(preparedMessage); // eslint-disable-line no-console
    }

    private printStackTrace(stack?: string): void {
        if (!stack) {
            return;
        }

        console.log(`${stack}\n`); // eslint-disable-line no-console
    }

    private prepareMessage(message: string, level: LogLevel): string {
        const timestampDiff = this.colors.get(LogParts.TIMESTAMP_DIFF)(
            this.getTimestampDiff(),
        );

        message = this.colors.get(level)(message);

        const prefix = this.preparePrefix(level);

        return `${prefix} ${message} ${timestampDiff}`;
    }

    private preparePrefix(level: LogLevel): string {
        const prefixes: string[] = [];

        const date = format(
            CustomLoggerService.lastTimestampAt,
            'yyyy-MM-dd HH:mm:ss.SSS',
        );
        prefixes.push(
            this.colors.get(LogParts.DATE)(`${date}`),
            this.colors.get(level)(`[${level.toUpperCase()}]`),
        );

        if (this.context) {
            prefixes.push(
                this.colors.get(LogParts.CONTEXT)(`[${this.context}]`),
            );
        }

        return prefixes.map((prefix) => `${prefix}`).join(' ');
    }

    private getTimestampDiff(): string {
        const diff = CustomLoggerService.lastTimestampAt
            ? Date.now() - CustomLoggerService.lastTimestampAt
            : 0;

        CustomLoggerService.lastTimestampAt = Date.now();

        return `+${diff}ms`;
    }
}
