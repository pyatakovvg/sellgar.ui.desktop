import { NextRequest, NextResponse } from 'next/server';

import { resolveGatewayUrl } from '@library/domain/gateway-url';

const DEVICE_COOKIE = 'sellgar.deviceUuid';

export async function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const deviceUuid = request.cookies.get(DEVICE_COOKIE)?.value ?? crypto.randomUUID();
  const gatewayUrl = process.env.CLIENT_GATEWAY_URL ?? process.env.PUBLIC_CLIENT_GATEWAY_URL ?? 'http://localhost:4030';
  let session: Response;

  try {
    session = await fetch(resolveGatewayUrl('/v1/auth/session', gatewayUrl), {
      method: 'POST',
      cache: 'no-store',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
        'user-agent': request.headers.get('user-agent') ?? '',
        'x-device-id': deviceUuid,
      },
      signal: request.signal,
    });
  } catch {
    return unavailable();
  }

  if (!session.ok) return unavailable();

  const principal: unknown = await session.json();
  const cookies = new Map(request.cookies.getAll().map(({ name, value }) => [name, value]));
  const issuedCookies = session.headers.getSetCookie();

  for (const cookie of issuedCookies) {
    const pair = cookie.split(';', 1)[0];
    const separator = pair.indexOf('=');

    if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  cookies.set(DEVICE_COOKIE, deviceUuid);
  headers.set('cookie', [...cookies].map(([name, value]) => `${name}=${value}`).join('; '));
  headers.set('x-device-id', deviceUuid);
  headers.set('x-sellgar-session', JSON.stringify(principal));

  const response = NextResponse.next({ request: { headers } });

  response.cookies.set(DEVICE_COOKIE, deviceUuid, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  });
  for (const cookie of issuedCookies) response.headers.append('set-cookie', cookie);
  response.headers.set('Cache-Control', 'private, no-store');

  return response;
}

function unavailable(): NextResponse {
  return new NextResponse('Магазин временно недоступен. Попробуйте позже.', {
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export const config = { matcher: ['/', '/offers/:path*'] };
