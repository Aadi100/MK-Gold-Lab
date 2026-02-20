import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');
  const all = await users.find({}, { projection: { password: 0 } }).toArray();
  return NextResponse.json({ users: all });
}

export async function POST(request: Request) {
  // create user (only superadmin can create)
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = match ? match[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== 'superadmin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json();
  const { username, password, role } = body || {};
  if (!username || !password || !role) return NextResponse.json({ error: 'missing' }, { status: 400 });

  if (!['admin', 'manager', 'superadmin'].includes(role)) return NextResponse.json({ error: 'invalid role' }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');

  const exists = await users.findOne({ username });
  if (exists) return NextResponse.json({ error: 'exists' }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);
  const doc = { username, password: hash, role, createdAt: new Date() };
  await users.insertOne(doc);
  return NextResponse.json({ ok: true, user: { username, role } });
}

export async function PUT(request: Request) {
  // update user (superadmin only or self)
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = match ? match[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json();
  const { username, password, role } = body || {};
  if (!username) return NextResponse.json({ error: 'missing' }, { status: 400 });

  if (role && payload.role !== 'superadmin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');

  const update: any = {};
  if (password) update.password = await bcrypt.hash(password, 10);
  if (role) update.role = role;

  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 });

  await users.updateOne({ username }, { $set: update });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  // delete user (superadmin only) but block deleting superadmin
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = match ? match[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== 'superadmin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const username = url.searchParams.get('username');
  if (!username) return NextResponse.json({ error: 'missing' }, { status: 400 });

  if (username === 'admin') return NextResponse.json({ error: 'cannot delete superadmin' }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');
  await users.deleteOne({ username });
  return NextResponse.json({ ok: true });
}
