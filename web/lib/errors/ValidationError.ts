import { AppError, ErrorCode, ErrorMetadata } from "./AppError";

export interface ValidationErrorDetail {
    field: string;
    message: string;
    value?: unknown;
}

export class ValidationError extends AppError {
    public readonly validationErrors: ValidationErrorDetail[];

    constructor(
        message: string = "Validation failed",
        validationErrors: ValidationErrorDetail[] = [],
        metadata: Partial<ErrorMetadata> = {}
    ) {
        super(message, ErrorCode.VALIDATION_ERROR, 400, true, metadata);
        this.validationErrors = validationErrors;
    }

    public override toJSON(): Record<string, unknown> {
        return {
            ...super.toJSON(),
            validationErrors: this.validationErrors,
        };
    }

    public override getUserMessage(): string {
        if (this.validationErrors.length > 0) {
            return `Validation failed: ${this.validationErrors[0].message}`;
        }
        return this.message;
    }
}
