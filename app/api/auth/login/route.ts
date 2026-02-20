import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body || {};
  if (!username || !password) return NextResponse.json({ error: 'username/password required' }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');

  let user = await users.findOne({ username });
  // seed default superadmin if missing
  if (!user) {
    const count = await users.countDocuments();
    if (count === 0 && username === 'admin' && password === 'admin') {
      const hash = await bcrypt.hash(password, 10);
      const doc = { username: 'admin', password: hash, role: 'superadmin', createdAt: new Date() };
      await users.insertOne(doc);
      user = await users.findOne({ username: 'admin' });
    }
  }

  if (!user) return NextResponse.json({ error: 'invalid' }, { status: 401 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: 'invalid' }, { status: 401 });

  const token = signToken({ id: user._id.toString(), username: user.username, role: user.role });
  const res = NextResponse.json({ ok: true, user: { username: user.username, role: user.role } });
  // set httpOnly cookie
  res.headers.append('Set-Cookie', `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=900`);
  return res;
}
