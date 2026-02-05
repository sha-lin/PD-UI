export enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    BAD_REQUEST = "BAD_REQUEST",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

export interface ErrorMetadata {
    timestamp: string;
    path?: string;
    method?: string;
    userId?: string;
    requestId?: string;
    [key: string]: unknown;
}

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly metadata: ErrorMetadata;

    constructor(
        message: string,
        code: ErrorCode,
        statusCode: number,
        isOperational: boolean = true,
        metadata: Partial<ErrorMetadata> = {}
    ) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);

        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.metadata = {
            timestamp: new Date().toISOString(),
            ...metadata,
        };

        Error.captureStackTrace(this, this.constructor);
    }

    public toJSON(): Record<string, unknown> {
        return {
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            metadata: this.metadata,
        };
    }

    public getUserMessage(): string {
        return this.message;
    }
}
