// utils/request-id-context.tsx
"use client";

import React, { createContext, useContext } from "react";

const RequestIdContext = createContext<string | null>(null);

export function RequestIdProvider({
                                      requestId,
                                      children,
                                  }: { requestId: string | null; children: React.ReactNode }) {
    return (
        <RequestIdContext.Provider value={requestId}>
            {children}
        </RequestIdContext.Provider>
    );
}

export function useRequestId() {
    return useContext(RequestIdContext);
}
