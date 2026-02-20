import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const serial = url.searchParams.get('serial');
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection('silver_bars');

  if (serial) {
    const doc = await col.findOne({ serialNo: serial.toUpperCase() });
    if (!doc) return NextResponse.json({ found: false }, { status: 404 });
    return NextResponse.json({ found: true, data: doc });
  }

  const items = await col.find().sort({ production: -1 }).limit(200).toArray();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  // auth check
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = match ? match[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection('silver_bars');

  if (!body?.serialNo) {
    return NextResponse.json({ error: 'serialNo required' }, { status: 400 });
  }

  const serial = String(body.serialNo).toUpperCase();
  const doc = {
    serialNo: serial,
    weight: body.weight ?? '',
    purity: body.purity ?? '',
    certifiedBy: body.certifiedBy ?? '',
    origin: body.origin ?? '',
    metal: body.metal ?? 'Silver',
    production: body.production ?? new Date().toISOString(),
    createdAt: new Date()
  };

  await col.updateOne({ serialNo: serial }, { $set: doc }, { upsert: true });

  return NextResponse.json({ ok: true, data: doc });
}

export async function PUT(request: Request) {
  const body = await request.json();
  // auth
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = match ? match[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection('silver_bars');

  if (!body?.serialNo) {
    return NextResponse.json({ error: 'serialNo required' }, { status: 400 });
  }

  const serial = String(body.serialNo).toUpperCase();
  const updateDoc: any = {};
  if (body.weight !== undefined) updateDoc.weight = body.weight;
  if (body.purity !== undefined) updateDoc.purity = body.purity;
  if (body.certifiedBy !== undefined) updateDoc.certifiedBy = body.certifiedBy;
  if (body.origin !== undefined) updateDoc.origin = body.origin;
  if (body.metal !== undefined) updateDoc.metal = body.metal;
  if (body.production !== undefined) updateDoc.production = body.production;

  if (Object.keys(updateDoc).length === 0) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  }

  const result = await col.updateOne({ serialNo: serial }, { $set: updateDoc });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const doc = await col.findOne({ serialNo: serial });
  return NextResponse.json({ ok: true, data: doc });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const serialQuery = url.searchParams.get('serial');
  // auth
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = match ? match[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection('silver_bars');

  let serial: string | null = null;
  if (serialQuery) serial = serialQuery.toUpperCase();
  else {
    try {
      const body = await request.json();
      if (body?.serialNo) serial = String(body.serialNo).toUpperCase();
    } catch (e) {
      // ignore
    }
  }

  if (!serial) return NextResponse.json({ error: 'serialNo required' }, { status: 400 });

  const result = await col.deleteOne({ serialNo: serial });
  if (result.deletedCount === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
