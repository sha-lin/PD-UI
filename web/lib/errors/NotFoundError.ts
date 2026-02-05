import { AppError, ErrorCode, ErrorMetadata } from "./AppError";

export class NotFoundError extends AppError {
    constructor(
        resource: string = "Resource",
        metadata: Partial<ErrorMetadata> = {}
    ) {
        super(`${resource} not found`, ErrorCode.NOT_FOUND, 404, true, metadata);
    }

    public override getUserMessage(): string {
        return "The requested resource was not found";
    }
}
