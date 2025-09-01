// utils/ApiError.ts
export default class ApiError extends Error {
    statusCode: number;
    code: string;
    details?: any;
    requestId?: string;
    actionId?: string;

    constructor(statusCode: number, message: string, code = 'API_ERROR', details?: any, requestId?: string, actionId?: string) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.requestId = requestId;
        this.actionId = actionId;
    }

    static fromUnknown(err: unknown, requestId?: string, actionId?: string, fallbackStatus = 500, fallbackCode = 'INTERNAL_ERROR') {
        if (err instanceof ApiError) {
            if (requestId && !err.requestId) err.requestId = requestId;
            if (actionId && !err.actionId) err.actionId = actionId;
            return err;
        }
        if ((err as any)?.name === 'AbortError') {
            return new ApiError(504, 'Upstream timeout', 'UPSTREAM_TIMEOUT', { original: String(err) }, requestId, actionId);
        }
        const msg =
            (typeof err === 'object' && err && 'message' in err) ? (err as any).message :
                typeof err === 'string' ? err : 'Unexpected error';
        return new ApiError(fallbackStatus, msg, fallbackCode, { original: err }, requestId, actionId);
    }
}
