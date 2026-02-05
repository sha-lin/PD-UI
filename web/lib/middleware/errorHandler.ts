import { NextRequest, NextResponse } from "next/server";
import { AppError, ErrorCode } from "@/lib/errors";
import { logger } from "@/lib/services/logger";

export interface ApiErrorResponse {
    error: {
        message: string;
        code: string;
        statusCode: number;
    };
    requestId?: string;
}

export function createErrorResponse(
    error: unknown,
    requestId?: string
): NextResponse<ApiErrorResponse> {
    if (error instanceof AppError) {
        logger.error(error.message, error, {
            requestId,
            code: error.code,
            statusCode: error.statusCode,
            ...error.metadata,
        });

        return NextResponse.json(
            {
                error: {
                    message: error.getUserMessage(),
                    code: error.code,
                    statusCode: error.statusCode,
                },
                requestId,
            },
            { status: error.statusCode }
        );
    }

    if (error instanceof Error) {
        logger.error("Unhandled error", error, { requestId });

        return NextResponse.json(
            {
                error: {
                    message: "An unexpected error occurred. Please try again later.",
                    code: ErrorCode.INTERNAL_SERVER_ERROR,
                    statusCode: 500,
                },
                requestId,
            },
            { status: 500 }
        );
    }

    logger.error("Unknown error type", undefined, {
        requestId,
        errorType: typeof error,
    });

    return NextResponse.json(
        {
            error: {
                message: "An unexpected error occurred. Please try again later.",
                code: ErrorCode.INTERNAL_SERVER_ERROR,
                statusCode: 500,
            },
            requestId,
        },
        { status: 500 }
    );
}

export type ApiHandler = (
    request: NextRequest,
    context?: { params: Record<string, string> }
) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
    return async (request: NextRequest, context) => {
        const requestId = crypto.randomUUID();

        try {
            logger.info("API request started", {
                requestId,
                method: request.method,
                path: request.nextUrl.pathname,
            });

            const startTime = Date.now();
            const response = await handler(request, context);
            const duration = Date.now() - startTime;

            logger.info("API request completed", {
                requestId,
                method: request.method,
                path: request.nextUrl.pathname,
                statusCode: response.status,
                duration,
            });

            return response;
        } catch (error) {
            logger.error("API request failed", error as Error, {
                requestId,
                method: request.method,
                path: request.nextUrl.pathname,
            });

            return createErrorResponse(error, requestId);
        }
    };
}
