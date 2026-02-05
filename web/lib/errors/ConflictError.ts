import { AppError, ErrorCode, ErrorMetadata } from "./AppError";

export class ConflictError extends AppError {
    constructor(
        message: string = "Resource already exists",
        metadata: Partial<ErrorMetadata> = {}
    ) {
        super(message, ErrorCode.CONFLICT, 409, true, metadata);
    }

    public override getUserMessage(): string {
        return "This resource already exists";
    }
}
