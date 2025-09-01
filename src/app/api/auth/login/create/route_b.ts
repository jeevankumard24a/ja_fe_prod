// app/api/auth/login/route.ts (or wherever your route lives)
import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/withApiHandler';
import { createSuccessResponse } from '@/utils/apiResponse';
import { parseBackendResponse } from '@/utils/parseBackendResponse';
import { getRequestContext } from '@/utils/requestLogger';
import ApiError from '@/components/utils/ApiError';

export const POST = withApiHandler(async (req: NextRequest, API_BASE_URL: string) => {
  const { logger, requestId, actionId, cookieOptions } = getRequestContext(req, 'login_attempt');

  try {
    if (!API_BASE_URL) {
      throw new ApiError(500, 'API base URL not configured', 'CONFIG_ERROR', null, requestId, actionId);
    }

    // Safely parse JSON body with a clear 400 on invalid JSON
    let body: { user_id?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, 'Invalid JSON payload', 'INVALID_JSON', null, requestId, actionId);
    }

    logger.info('Processing login request', {
      body: { ...body, password: '[REDACTED]' },
      requestId,
      actionId,
    });

    // Validate input
    if (
        !body?.user_id ||
        !body?.password ||
        typeof body.user_id !== 'string' ||
        typeof body.password !== 'string'
    ) {
      throw new ApiError(400, 'Invalid user_id or password', 'VALIDATION_ERROR', null, requestId, actionId);
    }

    // Call Express login endpoint
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/ipa/v1/auth/submit-login-data`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'content-type': 'application/json',
          // Correlation
          'x-request-id': requestId,
          ...(actionId ? { 'x-action-id': actionId } : {}),
          // Help backend attribute real client
          'user-agent': req.headers.get('user-agent') || '',
          // Preserve forwarding chain if present
          ...(req.headers.get('x-forwarded-for')
              ? { 'x-forwarded-for': req.headers.get('x-forwarded-for') as string }
              : {}),
        },
        body: JSON.stringify({ user_id: body.user_id, password: body.password }),
      });
    } catch (error) {
      throw new ApiError(503, 'Failed to connect to backend', 'NETWORK_ERROR', { error }, requestId, actionId);
    }

    // Express returns an ENVELOPE: { status, error, statusCode, message, data: { user_id, user_name, accessToken, refreshToken }, ... }
    const backendEnvelope = await parseBackendResponse(response, 'Failed to login', requestId, actionId, req);

    // Unwrap envelope defensively
    const payload = backendEnvelope?.data ?? backendEnvelope;

    if (!payload?.user_id || !payload?.user_name || !payload?.accessToken || !payload?.refreshToken) {
      throw new ApiError(500, 'Invalid response from backend', 'INVALID_RESPONSE', { backendEnvelope }, requestId, actionId);
    }

    // Build Next response ENVELOPE (include actionId for symmetry)
    const res = createSuccessResponse(
        'Login successful',
        {
          user_id: payload.user_id,
          user_name: payload.user_name,
          accessToken: payload.accessToken, // client keeps in memory
        },
        'LOGIN_SUCCESS',
        200,
        requestId,
        actionId
    );

    // Set refreshToken cookie (httpOnly)
    res.cookies.set('refreshToken', payload.refreshToken, {
      ...cookieOptions,
      // Optionally set a domain if you serve across subdomains:
      // domain: process.env.COOKIE_DOMAIN, // e.g. ".jalgo.ai"
    });

    // optional session marker for middleware gating
    res.cookies.set('__Host-sid', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // no domain when using __Host-*
      maxAge: 60 * 30,
    });

    logger.info('Login response prepared', {
      response: { ...payload, accessToken: '[REDACTED]', refreshToken: '[REDACTED]' },
      requestId,
      actionId,
    });

    return res;
  } catch (err) {
    const ae = ApiError.fromUnknown(err, requestId, actionId);
    logger.error('Login request failed', {
      error: ae.message,
      code: ae.code,
      details: ae.details,
      requestId,
      actionId,
    });
    throw ae; // withApiHandler will format & attach correlation headers
  }
});
