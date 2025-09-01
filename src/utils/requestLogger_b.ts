import 'server-only';
import type { NextRequest } from 'next/server';
import logger from '@/utils/logger';
import { Logger } from '@/utils/loggerType';

const typedLogger: Logger = logger;

const sanitizeMeta = (data: any) => {
    const sensitiveFields = ['password', 'accessToken', 'refreshToken'];
    const sanitized = { ...data };
    sensitiveFields.forEach(field => {
        if (sanitized[field]) sanitized[field] = '[REDACTED]';
    });
    return sanitized;
};

export function getRequestLogger(req: NextRequest): Logger {
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    const actionId = req.headers.get('x-action-id') || `action_${req.nextUrl.pathname.replace('/api/', '')}`;
    const meta = {
        method: req.method,
        path: req.nextUrl.pathname,
        requestId,
        ...(actionId ? { actionId } : {}),
        userAgent: req.headers.get('user-agent') || 'unknown',
    };

    return typedLogger.child(meta);
}

export function getRequestContext(req: NextRequest, defaultActionId: string) {
    const logger = getRequestLogger(req);
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    const actionId = req.headers.get('x-action-id') || defaultActionId;
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 60 * 60,
    };
    return { logger, requestId, actionId, cookieOptions };
}