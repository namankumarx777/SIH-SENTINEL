import { NextResponse } from "next/server";
import { AuthError } from "./auth/current-user";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  requestId: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  requestId: string;
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function apiSuccess<T>(data: T, requestId?: string): NextResponse<ApiResponse<T>> {
  const id = requestId ?? generateRequestId();
  return NextResponse.json(
    {
      success: true,
      data,
      requestId: id,
    },
    {
      headers: {
        "X-Request-ID": id,
      },
    }
  );
}

export function apiError(
  code: string,
  message: string,
  status: number,
  requestId?: string,
  details?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  const id = requestId ?? generateRequestId();
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      requestId: id,
    },
    {
      status,
      headers: {
        "X-Request-ID": id,
      },
    }
  );
}

export function apiCreated<T>(data: T, location?: string, requestId?: string): NextResponse<ApiResponse<T>> {
  const id = requestId ?? generateRequestId();
  const headers: Record<string, string> = {
    "X-Request-ID": id,
  };
  if (location) {
    headers["Location"] = location;
  }
  return NextResponse.json(
    {
      success: true,
      data,
      requestId: id,
    },
    {
      status: 201,
      headers,
    }
  );
}

export function apiNoContent(requestId?: string): NextResponse {
  const id = requestId ?? generateRequestId();
  return new NextResponse(null, {
    status: 204,
    headers: {
      "X-Request-ID": id,
    },
  });
}

export function handleApiError(error: unknown, requestId?: string): NextResponse<ApiErrorResponse> {
  const id = requestId ?? generateRequestId();

  if (error instanceof AuthError) {
    return apiError(
      error.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      error.message,
      error.status,
      id
    );
  }

  if (error instanceof SyntaxError) {
    return apiError("BAD_REQUEST", "Invalid JSON in request body", 400, id);
  }

  if (error instanceof TypeError) {
    return apiError("BAD_REQUEST", "Invalid request format", 400, id);
  }

  if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
    const err = error as { code?: string; message: string; status?: number };
    return apiError(
      err.code ?? "INTERNAL_ERROR",
      err.message,
      err.status ?? 500,
      id
    );
  }

  console.error("[API Error]", error);
  return apiError("INTERNAL_ERROR", "An unexpected error occurred", 500, id);
}

export function validationError(
  errors: Record<string, string[]>,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  const id = requestId ?? generateRequestId();
  return apiError("VALIDATION_ERROR", "Request validation failed", 422, id, errors);
}
