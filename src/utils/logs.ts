'use client';

import log from 'loglevel';

// ---------- Types ----------
type LogRecord = {
    actionId?: string;
    error?: unknown; // allow anything; we'll coerce to boolean
    message?: string;
    code?: string;
    requestId?: string;
    [key: string]: any;
};

type LogMessage = string | Error | LogRecord;

// ---------- Setup ----------
const isDev = process.env.NODE_ENV === 'development';
log.setLevel(isDev ? 'debug' : 'warn');

// ---------- IDs ----------
function getClientId(): string {
    try {
        const KEY = 'ja_client_id';
        let id = localStorage.getItem(KEY);
        if (!id) {
            id =
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
                    ? crypto.randomUUID()
                    : Math.random().toString(36).slice(2);
            localStorage.setItem(KEY, id);
        }
        return id;
    } catch {
        return 'no-client-id';
    }
}

const pageId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

let currentActionId: string | undefined;
export function setActionId(id?: string) {
    currentActionId = id;
}
export function getActionId() {
    return currentActionId;
}

// ---------- Helpers ----------
function serializeArg(a: LogMessage): any {
    if (a instanceof Error) {
        return {
            __error: true,
            name: a.name,
            message: a.message,
            stack: a.stack,
            error: true,
        };
    }

    if (typeof a === 'object' && a !== null) {
        try {
            const copy: Record<string, any> = JSON.parse(JSON.stringify(a));
            const sensitiveFields = ['password', 'accessToken', 'refreshToken'];
            for (const field of sensitiveFields) {
                if (field in copy) copy[field] = '[REDACTED]';
            }
            // ensure boolean error flag
            if ('error' in copy) {
                copy.error = typeof copy.error === 'boolean' ? copy.error : Boolean(copy.error);
            } else {
                copy.error = false;
            }
            return copy;
        } catch {
            return { message: String(a), error: false };
        }
    }

    return a;
}

function sendToServer(level: 'warn' | 'error', messages: LogMessage[]) {
    try {
        const explicitActionId =
            messages.find(
                (m): m is { actionId?: string } =>
                    !!m && typeof m === 'object' && 'actionId' in (m as any) && !!(m as any).actionId,
            )?.actionId;

        const serializedMessages = messages.map(serializeArg).map((msg) => {
            if (msg && typeof msg === 'object' && 'error' in msg) {
                (msg as any).error = typeof (msg as any).error === 'boolean' ? (msg as any).error : Boolean((msg as any).error);
            }
            return msg;
        });

        const payload = {
            level,
            messages: serializedMessages,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            timestamp: new Date().toISOString(),
            path: typeof window !== 'undefined' ? window.location.pathname : '',
            href: typeof window !== 'undefined' ? window.location.href : '',
            clientId: getClientId(),
            pageId,
            actionId: explicitActionId || currentActionId,
            from: 'frontend' as const,
        };

        const body = JSON.stringify(payload);

        if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
            const blob = new Blob([body], { type: 'application/json' });
            (navigator as any).sendBeacon('/api/logs', blob);
        } else {
            fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(payload.actionId ? { 'x-action-id': payload.actionId } : {}),
                },
                body,
                keepalive: true,
            }).catch((err) => {
                // eslint-disable-next-line no-console
                console.error('Failed to send log to server', { err, payload });
            });
        }
    } catch {
        /* no-throw */
    }
}

// ---------- Intercept warn/error (do NOT re-bind; call raw directly) ----------
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
    const raw = originalFactory(methodName, logLevel, loggerName)!;
    return function (...msgs: LogMessage[]) {
        // loglevel returns a callable that is already correctly bound; just call it.
        try {
            (raw as any)(...msgs);
        } catch {
            try {
                const m = methodName as 'debug' | 'info' | 'warn' | 'error';
                if (typeof console !== 'undefined' && typeof (console as any)[m] === 'function') {
                    (console as any)[m](...msgs);
                } else {
                    // eslint-disable-next-line no-console
                    console.log(...msgs);
                }
            } catch { /* ignore */ }
        }

        if (methodName === 'warn' || methodName === 'error') {
            sendToServer(methodName as 'warn' | 'error', msgs);
        }
    };
};
log.setLevel(log.getLevel());

// ---------- Global init (once) ----------
declare global {
    // eslint-disable-next-line no-var
    var __FE_LOG_INIT__: boolean | undefined;
}

if (typeof window !== 'undefined' && !globalThis.__FE_LOG_INIT__) {
    globalThis.__FE_LOG_INIT__ = true;

    window.addEventListener('error', (e: ErrorEvent) => {
        const err = e.error instanceof Error ? e.error : new Error(e.message || 'window.error');
        log.error('window.error', {
            message: err.message,
            stack: err.stack,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            actionId: currentActionId,
            error: true,
        });
    });

    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
        const reason = e.reason instanceof Error ? e.reason : new Error(typeof e.reason === 'string' ? e.reason : 'unhandledrejection');
        log.error('unhandledrejection', {
            message: reason.message,
            stack: reason.stack,
            actionId: currentActionId,
            error: true,
        });
    });
}

export default log;
