import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // clear cookie
  res.headers.append('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0`);
  return res;
}
