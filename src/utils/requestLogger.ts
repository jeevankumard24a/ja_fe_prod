
import 'server-only';
import type { NextRequest } from 'next/server';
import logger from '@/utils/logger';
import type { Logger } from '@/utils/loggerType';

const SECRET_KEYS = [
    'authorization', 'proxy-authorization', 'cookie', 'set-cookie',
    'password', 'pass', 'token', 'refresh', 'access', 'secret', 'otp'
];

function newId() {
    try { return crypto.randomUUID(); } catch { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
}

function deepRedact(v: any, seen = new WeakSet()): any {
    if (v == null || typeof v !== 'object') return v;
    if (seen.has(v)) return '[circular]';
    seen.add(v);
    if (Array.isArray(v)) return v.length > 50 ? `[array(${v.length})]` : v.map(x => deepRedact(x, seen));
    const out: any = {};
    for (const [k, val] of Object.entries(v)) {
        const lk = k.toLowerCase();
        if (SECRET_KEYS.some(s => lk.includes(s))) out[k] = '[REDACTED]';
        else if (val && typeof val === 'object') out[k] = deepRedact(val, seen);
        else out[k] = val;
    }
    return out;
}

function getClientIp(req: NextRequest) {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    return req.headers.get('cf-connecting-ip')
        ?? req.headers.get('x-real-ip')
        ?? 'unknown';
}

export function getCorrelation(req: NextRequest, opts?: { defaultActionId?: string }) {
    const requestId = req.headers.get('x-request-id') ?? newId();
    const actionId  = req.headers.get('x-action-id') ?? opts?.defaultActionId ?? undefined;
    return { requestId, actionId };
}

export function getRequestLogger(req: NextRequest): Logger {
    const { requestId, actionId } = getCorrelation(req);
    const childMeta = {
        'service.name': process.env.NEXT_PUBLIC_SERVICE_NAME ?? 'next',
        env: process.env.NODE_ENV ?? 'development',
        'trace.id': requestId,
        'transaction.id': actionId,
        'client.ip': getClientIp(req),
        'http.request.method': req.method,
        'url.path': req.nextUrl.pathname,
        'user_agent.original': req.headers.get('user-agent') ?? '',
        referer: req.headers.get('referer') ?? '',
    };
    return (logger as Logger).child(childMeta);
}

export function getRequestContext(req: NextRequest, defaultActionId?: string) {
    const { requestId, actionId } = getCorrelation(req, { defaultActionId });
    const log = getRequestLogger(req);

    // headers to forward to Express on fetch()
    const correlationHeaders = {
        'x-request-id': requestId,
        ...(actionId ? { 'x-action-id': actionId } : {}),
    } as Record<string, string>;

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 60 * 60,
    };

    return { logger: log, requestId, actionId, correlationHeaders, cookieOptions };
}

/** Convenience: log with deep redaction */
export function logSafe(l: Logger, level: 'debug'|'info'|'warn'|'error', msg: string, meta?: Record<string, any>) {
    const safe = meta ? deepRedact(meta) : undefined;
    (l[level] as any)(msg, safe ?? {});
}
