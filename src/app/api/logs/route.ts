// app/api/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';

export const runtime = 'nodejs';

type FELogPayload = {
    level?: string;
    messages?: any[];
    userAgent?: string;
    timestamp?: string;
    path?: string;
    href?: string;
    clientId?: string;
    pageId?: string;
    actionId?: string;
};

function pickLevel(l?: string) {
    const lvl = String(l || '').toLowerCase();
    return (['debug','info','warn','error'] as const).includes(lvl as any)
        ? (lvl as 'debug'|'info'|'warn'|'error')
        : 'warn';
}

function firstLine(msgs: any[]) {
    if (!Array.isArray(msgs) || msgs.length === 0) return 'fe.log';
    const m = msgs[0];
    if (m && typeof m === 'object' && m.__error && typeof m.message === 'string') return m.message;
    if (typeof m === 'string') return m.slice(0, 200);
    try { return JSON.stringify(m).slice(0, 200); } catch { return 'fe.log'; }
}

// Best-effort client IP extraction from headers
function getClientIp(req: NextRequest): string {
    // 1) Standard proxy chain: "ip1, ip2, ip3"
    const xff = req.headers.get('x-forwarded-for');
    if (xff) {
        const first = xff.split(',')[0]?.trim();
        if (first) return normalizeIp(first);
    }
    // 2) Other common headers set by proxies/CDNs
    const candidates = [
        'x-real-ip',
        'cf-connecting-ip',
        'true-client-ip',
        'fastly-client-ip',
        'x-client-ip',
    ];
    for (const h of candidates) {
        const v = req.headers.get(h);
        if (v) return normalizeIp(v);
    }
    // 3) RFC 7239 Forwarded: for=1.2.3.4;proto=https;by=...
    const fwd = req.headers.get('forwarded');
    if (fwd) {
        const m = /for=(?:"?\[?([^;\]\s"]+)\]?"?)/i.exec(fwd);
        if (m?.[1]) return normalizeIp(m[1]);
    }
    return 'unknown';
}

function normalizeIp(ip: string): string {
    // Strip surrounding brackets for IPv6 and any :port suffix
    const unbracketed = ip.replace(/^\[|]$/g, '');
    // If it looks like IPv6 (contains :) keep it; if it looks like IPv4:port, drop port
    if (unbracketed.includes(':') && !/^\d{1,3}(\.\d{1,3}){3}:/.test(unbracketed)) {
        return unbracketed; // IPv6 (may include ::), ports rarely attached in headers for IPv6
    }
    return unbracketed.split(':')[0]; // IPv4[:port] → IPv4
}

export async function POST(req: NextRequest) {
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    const actionId = req.headers.get('x-action-id') || undefined;

    let data: FELogPayload | FELogPayload[] | null = null;
    try {
        data = await req.json();
    } catch {
        try { data = JSON.parse(await req.text()); } catch {
            return NextResponse.json(
                { status: 'error', message: 'Invalid payload', requestId },
                { status: 400, headers: { 'x-request-id': requestId, ...(actionId ? { 'x-action-id': actionId } : {}) } }
            );
        }
    }

    const ip = getClientIp(req);
    const referer = req.headers.get('referer') || '';
    const ua = req.headers.get('user-agent') || '';

    const events = Array.isArray(data) ? data : [data];

    for (const ev of events) {
        if (!ev) continue;
        const level = pickLevel(ev.level);
        const meta = {
            from: 'frontend',
            path: ev.path,
            href: ev.href,
            clientId: ev.clientId,
            pageId: ev.pageId,
            userAgent: ev.userAgent || ua,
            ts: ev.timestamp,
            actionId: ev.actionId || actionId,
            requestId,
            ip,
            referer,
            messages: ev.messages,
        };

        const msg = firstLine(ev.messages || []);
        if (level === 'error') logger.error(msg, meta);
        else if (level === 'warn') logger.warn(msg, meta);
        else if (level === 'info') logger.info(msg, meta);
        else logger.debug(msg, meta);
    }

    return new NextResponse(null, {
        status: 204,
        headers: { 'x-request-id': requestId, ...(actionId ? { 'x-action-id': actionId } : {}) },
    });
}
