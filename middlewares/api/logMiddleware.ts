import { NextRequest } from 'next/server';

export function logMiddleware(request: NextRequest) {
  return { response: `${request.method}/${request.url} ` };
}
