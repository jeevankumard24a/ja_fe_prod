import log from 'loglevel';

// Set log level by environment
log.setLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'warn');

// Custom remote appender for 'warn' and above
const sendToServer = (level: string, message: any[]) => {
    try {
        fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                level,
                message,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                timestamp: new Date().toISOString(),
            }),
        });
    } catch (err) {
        // Swallow errors, do not block app
    }
};

const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);
    return function (...messages: any[]) {
        rawMethod(...messages); // still log to console
        // Send to server only if warn or error
        if (['warn', 'error'].includes(methodName)) {
            sendToServer(methodName, messages);
        }
    };
};
log.setLevel(log.getLevel()); // Apply new methodFactory

export default log;
