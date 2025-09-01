"use client";

import { useEffect } from "react";

export default function CSRFInit() {
    useEffect(() => {
        const ctrl = new AbortController();

        // Fire-and-forget: mint host-only csrfToken cookie
        void fetch("/api/auth/csrf", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: ctrl.signal,
        }).catch(() => { /* ignore */ });

        return () => {
            ctrl.abort();
        };
    }, []);

    return null;
}
