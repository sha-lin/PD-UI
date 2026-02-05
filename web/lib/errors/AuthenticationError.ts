import { AppError, ErrorCode, ErrorMetadata } from "./AppError";

export class AuthenticationError extends AppError {
    constructor(
        message: string = "Authentication required",
        metadata: Partial<ErrorMetadata> = {}
    ) {
        super(message, ErrorCode.AUTHENTICATION_ERROR, 401, true, metadata);
    }

    public override getUserMessage(): string {
        return "Please log in to continue";
    }
}
