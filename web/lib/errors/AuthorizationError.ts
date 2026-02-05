import { AppError, ErrorCode, ErrorMetadata } from "./AppError";

export class AuthorizationError extends AppError {
    constructor(
        message: string = "Access denied",
        metadata: Partial<ErrorMetadata> = {}
    ) {
        super(message, ErrorCode.AUTHORIZATION_ERROR, 403, true, metadata);
    }

    public override getUserMessage(): string {
        return "You do not have permission to perform this action";
    }
}
