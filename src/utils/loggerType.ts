export interface Logger {
    info: (msg: string, meta?: object) => void;
    warn: (msg: string, meta?: object) => void;
    error: (msg: string, meta?: object) => void;
    debug: (msg: string, meta?: object) => void; // Required, as logger.ts guarantees debug
    child: (meta: Record<string, unknown>) => Logger; // Required, with Record<string, unknown>
}