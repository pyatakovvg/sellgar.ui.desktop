import { createServer } from 'node:http';

const session = {
  sessionUuid: '00000000-0000-4000-8000-000000000001',
  userUuid: null,
  expiresAt: '2099-01-01T00:00:00.000Z',
};
const cart = {
  uuid: '00000000-0000-4000-8000-000000000002',
  version: '0',
  shop: { uuid: '00000000-0000-4000-8000-000000000003', name: 'CI fixture' },
  items: [],
  currencyCode: 'RUB',
  itemsTotal: '0.00',
};

createServer((request, response) => {
  const routes = {
    'POST /v1/auth/session': session,
    'GET /v1/cart': cart,
    'GET /v1/products': { data: [], meta: { totalRows: 0 } },
  };
  const payload = routes[`${request.method} ${request.url}`];

  response.writeHead(payload ? 200 : 404, {
    'Content-Type': 'application/json',
    ...(request.url === '/v1/auth/session' ? { 'Set-Cookie': 'smoke-session=fixture; HttpOnly; Path=/' } : {}),
  });
  response.end(JSON.stringify(payload ?? { message: 'Unknown fixture request' }));
}).listen(8080, '0.0.0.0');
