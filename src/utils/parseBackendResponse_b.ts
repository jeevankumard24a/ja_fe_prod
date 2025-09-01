import ApiError from '@/components/utils/ApiError';
import { getRequestLogger } from '@/utils/requestLogger';
import logger from '@/utils/logger';
import type { NextRequest } from 'next/server';
import { Logger } from '@/utils/loggerType';

export async function parseBackendResponse(
    res: Response,
    fallbackMessage: string,
    parentRequestId?: string,
    actionId?: string,
    req?: NextRequest
) {
    const rid = res.headers.get('x-request-id') || parentRequestId || crypto.randomUUID();
    const aid = res.headers.get('x-action-id') || actionId;
    const requestLogger: Logger = req ? getRequestLogger(req) : logger;
    let json: any = null;

    try {
        json = await res.json();
        console.log("888888888888888",JSON.stringify(json));
        const safeJson = { ...json };
        if (safeJson.data?.accessToken) safeJson.data.accessToken = '[REDACTED]';
        if (safeJson.data?.refreshToken) safeJson.data.refreshToken = '[REDACTED]';
        requestLogger.debug('Parsed Express response', { response: safeJson, requestId: rid, actionId: aid });
    } catch (error) {
        if (!res.ok) {
            const text = await res.clone().text().catch(() => '<unreadable>');
            requestLogger.error('Failed to parse Express response', { status: res.status, text, requestId: rid, actionId: aid });
            throw new ApiError(
                res.status || 500,
                fallbackMessage,
                'INVALID_JSON',
                { status: res.status, text },
                rid,
                aid
            );
        }
        requestLogger.debug('Empty Express response', { status: res.status, requestId: rid, actionId: aid });
        return null;
    }

    if (!res.ok || json?.status === 'error') {
        requestLogger.error('Express response error', { response: json, requestId: rid, actionId: aid });
        throw new ApiError(
            json?.statusCode || res.status || 500,
            json?.message || fallbackMessage,
            json?.code || json?.errorCode || 'API_ERROR',
            { details: json },
            rid,
            aid
        );
    }

    return json;
}