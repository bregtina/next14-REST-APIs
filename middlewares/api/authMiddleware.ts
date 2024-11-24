import { NextRequest } from 'next/server';

const validate = (token: any) => {
  const validToken = true;

  if (!validToken || !token) {
    return false;
  }
  return true;
};

export function authMiddleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  return { isValid: validate(token) };
}
