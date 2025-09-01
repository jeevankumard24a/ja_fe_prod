// utils/ApiError.ts
export default class ApiError extends Error {
    statusCode: number;
    code: string;
    details?: unknown;
    requestId?: string;
    actionId?: string;
    isOperational: boolean;
    override cause?: unknown;

    constructor(
        statusCode: number,
        message: string,
        code = "API_ERROR",
        details?: unknown,
        requestId?: string,
        actionId?: string,
        options?: { cause?: unknown; isOperational?: boolean }
    ) {
        super(message, options);
        this.name = "ApiError";
        this.statusCode = Number.isInteger(statusCode) ? statusCode : 500;
        this.code = code;
        this.details = details;
        this.requestId = requestId;
        this.actionId = actionId;
        this.isOperational = options?.isOperational ?? true;
        this.cause = options?.cause;

        // maintain proper prototype chain for instanceof after transpilation
        Object.setPrototypeOf(this, new.target.prototype);
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, ApiError);
        }
    }

    /** Build from backend JSON envelope (your Express error handler format) */
    static fromBackend(body: any, requestId?: string, actionId?: string) {
        const status = body?.statusCode ?? 500;
        const code   = body?.code ?? body?.errorCode ?? "API_ERROR";
        const msg    = body?.message ?? "Unexpected error";
        return new ApiError(status, msg, code, { details: body }, requestId, actionId);
    }

    /** Normalize any unknown error on the Next.js side */
    static fromUnknown(
        err: unknown,
        requestId?: string,
        actionId?: string,
        fallbackStatus = 500,
        fallbackCode = "INTERNAL_ERROR"
    ): ApiError {
        if (err instanceof ApiError) {
            if (requestId && !err.requestId) err.requestId = requestId;
            if (actionId && !err.actionId)   err.actionId = actionId;
            return err;
        }

        // Browser/Edge abort
        if (isAbortError(err)) {
            return new ApiError(
                504,
                "Upstream timeout",
                "UPSTREAM_TIMEOUT",
                { original: simple(err) },
                requestId,
                actionId,
                { cause: err }
            );
        }

        // Browser/Edge network failure: fetch() rejects with TypeError
        if (err instanceof TypeError) {
            return new ApiError(
                502,
                "Upstream network error",
                "UPSTREAM_ERROR",
                { original: simple(err) },
                requestId,
                actionId,
                { cause: err }
            );
        }

        // Respect foreign shape if present
        const hintedStatus =
            (err as any)?.statusCode ?? (err as any)?.status ?? undefined;
        const hintedCode =
            (err as any)?.code ?? (err as any)?.name ?? undefined;

        const msg =
            typeof err === "object" && err && "message" in (err as any)
                ? String((err as any).message)
                : typeof err === "string"
                    ? err
                    : "Unexpected error";

        return new ApiError(
            Number.isInteger(hintedStatus) ? (hintedStatus as number) : fallbackStatus,
            msg,
            (typeof hintedCode === "string" ? hintedCode : fallbackCode) as string,
            { original: simple(err) },
            requestId,
            actionId,
            { cause: err }
        );
    }

    toJSON() {
        return {
            status: "error",
            statusCode: this.statusCode,
            code: this.code,
            message: this.message,
            requestId: this.requestId,
            actionId: this.actionId,
        };
    }
}

/* helpers */
function isAbortError(err: unknown) {
    // DOMException on web runtimes, name === 'AbortError'; some runtimes set code 'ABORT_ERR'
    return (
        (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") ||
        (typeof err === "object" && err !== null && ((err as any).name === "AbortError" || (err as any).code === "ABORT_ERR"))
    );
}

function simple(e: unknown) {
    if (!e || typeof e !== "object") return e;
    const o: any = {};
    for (const k of ["name", "code", "message", "stack"]) {
        if ((e as any)[k] != null) o[k] = (e as any)[k];
    }
    return o;
}
