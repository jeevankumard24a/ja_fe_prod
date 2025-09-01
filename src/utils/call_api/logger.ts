// utils/logger.ts
import 'server-only';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import type { Logger } from '@/utils/loggerType'; // <- your lightweight interface (info/warn/error/debug/child)

const { combine, timestamp, json, colorize, errors, printf } = format;

const ENV = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
const IS_EDGE = process.env.NEXT_RUNTIME === 'edge';
const IS_SERVERLESS = !!process.env.VERCEL;
const FILE_LOGS_ENABLED =
    process.env.SERVER_LOG_TO_FILE === 'true' && !IS_EDGE && !IS_SERVERLESS;

const LOG_LEVEL = process.env.LOG_LEVEL || (ENV === 'development' ? 'debug' : 'info');

/* ---------- helpers ---------- */
function serializeError(err: unknown) {
    if (err instanceof Error) return { name: err.name, message: err.message, stack: err.stack };
    return err;
}

function asEntry(level: string, args: unknown[]) {
    const [first, ...rest] = args;

    if (typeof first === 'string') {
        const meta = Object.assign({}, ...rest.map((m) => serializeError(m) as object));
        return { level, message: first, ...meta };
    }

    if (first instanceof Error) {
        const e = serializeError(first) as any;
        const meta = Object.assign({}, ...rest.map((m) => serializeError(m) as object));
        return { level, message: e.message ?? String(first), stack: e.stack, errorName: e.name, ...meta };
    }

    if (first && typeof first === 'object') {
        const base = { ...(first as object), ...Object.assign({}, ...rest.map((m) => serializeError(m) as object)) } as any;
        const msg = typeof base.message === 'string' ? base.message : base.event || base.msg || base.type || level;
        return { level, message: msg, ...base };
    }

    return { level, message: String(first) };
}

const normalizeInfo = format((info) => {
    if (info.message == null || typeof info.message !== 'string') {
        const anyInfo = info as any;
        info.message = anyInfo.event || anyInfo.msg || anyInfo.type || info.level;
    }
    return info;
});

const coerceMessage = format((info) => {
    if (info.message != null && typeof info.message !== 'string') {
        try { info.message = JSON.stringify(info.message); }
        catch { info.message = String(info.message); }
    }
    return info;
});

const devConsoleFormat = combine(
    colorize(),
    timestamp(),
    errors({ stack: true }),
    normalizeInfo(),
    coerceMessage(),
    printf(({ level, message, timestamp, stack, ...meta }) => {
        const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return stack
            ? `[${timestamp}] ${level}: ${message}\n${stack}${rest}`
            : `[${timestamp}] ${level}: ${message}${rest}`;
    })
);

const prodConsoleFormat = combine(timestamp(), errors({ stack: true }), normalizeInfo(), coerceMessage(), json());

/* ---------- factory ---------- */
function createWinston(): WinstonLogger {
    const base = createLogger({
        defaultMeta: { service: 'next-app', env: ENV, runtime: IS_EDGE ? 'edge' : 'node' },
        transports: [
            new transports.Console({
                level: LOG_LEVEL,
                format: ENV === 'development' ? devConsoleFormat : prodConsoleFormat,
            }),
        ],
        silent: ENV === 'test',
    });

    if (ENV !== 'test') {
        const fmt = ENV === 'development' ? devConsoleFormat : prodConsoleFormat;
        base.exceptions.handle(new transports.Console({ format: fmt }));
        base.rejections.handle(new transports.Console({ format: fmt }));
    }

    if (FILE_LOGS_ENABLED) {
        (async () => {
            try {
                const [{ default: DailyRotateFile }, path, fs] = await Promise.all([
                    import('winston-daily-rotate-file'),
                    import('path'),
                    import('fs'),
                ]);

                const logDir = process.env.LOG_DIR || 'logs';
                try { if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true }); } catch {}

                const fileFormat = combine(timestamp(), errors({ stack: true }), normalizeInfo(), coerceMessage(), json());

                base.add(new (DailyRotateFile as any)({
                    filename: path.join(logDir, '%DATE%-combined.log'),
                    datePattern: 'YYYY-MM-DD',
                    level: 'info', maxSize: '20m', maxFiles: '14d', zippedArchive: true, format: fileFormat,
                }));
                base.add(new (DailyRotateFile as any)({
                    filename: path.join(logDir, '%DATE%-error.log'),
                    datePattern: 'YYYY-MM-DD',
                    level: 'error', maxSize: '20m', maxFiles: '14d', zippedArchive: true, format: fileFormat,
                }));

                base.exceptions.handle(new (DailyRotateFile as any)({
                    filename: path.join(logDir, 'exceptions-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD', maxSize: '20m', maxFiles: '14d', zippedArchive: true, format: fileFormat,
                }));
                base.rejections.handle(new (DailyRotateFile as any)({
                    filename: path.join(logDir, 'rejections-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD', maxSize: '20m', maxFiles: '14d', zippedArchive: true, format: fileFormat,
                }));
            } catch (err) {
                base.warn('file-logging.disabled', { reason: (err as Error)?.message });
            }
        })();
    }

    base.info('logger.initialized', { level: LOG_LEVEL, env: ENV, runtime: IS_EDGE ? 'edge' : 'node' });
    return base;
}

/** Wrap a Winston logger to your app's Logger interface */
function wrap(base: WinstonLogger): Logger {
    return {
        info:  (...a: unknown[]) => (base as any).log(asEntry('info',  a)),
        warn:  (...a: unknown[]) => (base as any).log(asEntry('warn',  a)),
        error: (...a: unknown[]) => (base as any).log(asEntry('error', a)),
        debug: (...a: unknown[]) => (base as any).log(asEntry('debug', a)),
        child(meta: Record<string, unknown>): Logger {
            const childBase = base.child(meta) as WinstonLogger;
            return wrap(childBase); // recursion keeps meta chain intact
        },
    };
}

/* ---------- singleton export (no ambient global typing) ---------- */
const g = globalThis as any; // avoid TS2403 by not re-declaring a global type
export const logger: Logger = g.__NEXT_APP_LOGGER__ ?? wrap(createWinston());
if (process.env.NODE_ENV !== 'production') g.__NEXT_APP_LOGGER__ = logger;

export default logger;
