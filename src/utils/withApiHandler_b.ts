// utils/withApiHandler.ts
import ApiError from '@/components/utils/ApiError';
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';


type Handler = (req: NextRequest, API_BASE_URL: string) => Promise<Response>;

export function withApiHandler(handler: Handler) {
    return async (req: NextRequest) => {
        const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
        const actionId = req.headers.get('x-action-id') || undefined;
        const API_BASE_URL = process.env.API_BASE_URL || '';

        try {
            const res = await handler(req, API_BASE_URL);
            res.headers.set('x-request-id', requestId);
            if (actionId) res.headers.set('x-action-id', actionId);
            return res;
        } catch (err) {
            const ae = ApiError.fromUnknown(err, requestId, actionId);
            logger.error('api.error', {
                path: req.nextUrl.pathname,
                method: req.method,
                statusCode: ae.statusCode,
                code: ae.code,
                message: ae.message,
                requestId: ae.requestId,
                actionId: ae.actionId,
                details: ae.details,
            });

            const body = {
                status: 'error',
                statusCode: ae.statusCode,
                code: ae.code,
                message: ae.message,
                requestId: ae.requestId,
                actionId: ae.actionId,
            };
            return NextResponse.json(body, {
                status: ae.statusCode,
                headers: { 'x-request-id': requestId, ...(actionId ? { 'x-action-id': actionId } : {}) },
            });
        }
    };
}
