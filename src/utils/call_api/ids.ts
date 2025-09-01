// utils/ids.ts
export const newId = () =>
    (crypto as any)?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
