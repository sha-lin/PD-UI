import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/middleware";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/services/logger";

async function handler(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
        throw new ValidationError("Missing required parameter", [
            {
                field: "id",
                message: "ID parameter is required",
            },
        ]);
    }

    logger.info("Processing example request", { id });

    const data = { id, message: "Example API response" };

    return NextResponse.json(data);
}

export const GET = withErrorHandler(handler);
