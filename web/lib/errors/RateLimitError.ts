import { AppError, ErrorCode, ErrorMetadata } from "./AppError";

export class RateLimitError extends AppError {
    public readonly retryAfter?: number;

    constructor(
        retryAfter?: number,
        metadata: Partial<ErrorMetadata> = {}
    ) {
        super(
            "Too many requests",
            ErrorCode.RATE_LIMIT_EXCEEDED,
            429,
            true,
            metadata
        );
        this.retryAfter = retryAfter;
    }

    public override getUserMessage(): string {
        if (this.retryAfter) {
            return `Too many requests. Please try again in ${this.retryAfter} seconds`;
        }
        return "Too many requests. Please try again later";
    }
}
