// middleware.ts
import { NextRequest, NextResponse } from "next/server";

function newId() {
  // works in Edge/Node; graceful fallback if randomUUID is absent
  try { return globalThis.crypto?.randomUUID?.() ?? ""; } catch {}
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function middleware(req: NextRequest) {
  // clone headers so we can mutate
  const headers = new Headers(req.headers);

  // ensure an x-request-id
  const requestId = headers.get("x-request-id") || newId();
  headers.set("x-request-id", requestId);

  // forward the header downstream
  const res = NextResponse.next({ request: { headers } });

  // echo back on the response too
  res.headers.set("x-request-id", requestId);

  return res;
}

export const config = {
  // run on everything except next static assets & common public files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
