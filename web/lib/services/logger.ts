export enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    FATAL = "fatal",
}

export interface LogContext {
    userId?: string;
    requestId?: string;
    sessionId?: string;
    path?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
    [key: string]: unknown;
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
        code?: string;
    };
}

interface LogServiceConfig {
    minLevel: LogLevel;
    enableConsoleInDev: boolean;
    serviceName: string;
}

class Logger {
    private config: LogServiceConfig;

    constructor(config: Partial<LogServiceConfig> = {}) {
        this.config = {
            minLevel: this.getMinLevelFromEnv(),
            enableConsoleInDev: process.env.NODE_ENV === "development",
            serviceName: "print-duka",
            ...config,
        };
    }

    private getMinLevelFromEnv(): LogLevel {
        const level = process.env.LOG_LEVEL?.toLowerCase();
        return (Object.values(LogLevel).includes(level as LogLevel)
            ? level
            : LogLevel.INFO) as LogLevel;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = [
            LogLevel.DEBUG,
            LogLevel.INFO,
            LogLevel.WARN,
            LogLevel.ERROR,
            LogLevel.FATAL,
        ];
        return levels.indexOf(level) >= levels.indexOf(this.config.minLevel);
    }

    private createLogEntry(
        level: LogLevel,
        message: string,
        context?: LogContext,
        error?: Error
    ): LogEntry {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context: {
                service: this.config.serviceName,
                environment: process.env.NODE_ENV || "development",
                ...context,
            },
        };

        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: (error as { code?: string }).code,
            };
        }

        return entry;
    }

    private sendToLoggingService(entry: LogEntry): void {
        if (this.config.enableConsoleInDev) {
            return;
        }

        if (typeof window !== "undefined") {
            this.sendToClientLoggingService(entry);
        } else {
            this.sendToServerLoggingService(entry);
        }
    }

    private sendToClientLoggingService(entry: LogEntry): void {
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
            // SENTRY INTEGRATION 
        }
    }

    private sendToServerLoggingService(entry: LogEntry): void {
        if (process.env.SENTRY_DSN) {
            // SENTRY INTEGRATION
        }
    }

    public debug(message: string, context?: LogContext): void {
        if (!this.shouldLog(LogLevel.DEBUG)) return;

        const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
        this.sendToLoggingService(entry);
    }

    public info(message: string, context?: LogContext): void {
        if (!this.shouldLog(LogLevel.INFO)) return;

        const entry = this.createLogEntry(LogLevel.INFO, message, context);
        this.sendToLoggingService(entry);
    }

    public warn(message: string, context?: LogContext): void {
        if (!this.shouldLog(LogLevel.WARN)) return;

        const entry = this.createLogEntry(LogLevel.WARN, message, context);
        this.sendToLoggingService(entry);
    }

    public error(
        message: string,
        error?: Error,
        context?: LogContext
    ): void {
        if (!this.shouldLog(LogLevel.ERROR)) return;

        const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
        this.sendToLoggingService(entry);
    }

    public fatal(
        message: string,
        error?: Error,
        context?: LogContext
    ): void {
        if (!this.shouldLog(LogLevel.FATAL)) return;

        const entry = this.createLogEntry(LogLevel.FATAL, message, context, error);
        this.sendToLoggingService(entry);
    }
}

export const logger = new Logger();
