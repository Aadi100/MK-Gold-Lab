import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

async function saveImageFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const ext = path.extname(file.name || '') || '.png';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${fileName}`;
}

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection('products');
  const items = await col.find().sort({ createdAt: -1 }).limit(200).toArray();
  return NextResponse.json({ products: items });
}

export async function POST(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = match ? match[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const formData = await request.formData();
  const title = (formData.get('title') || '').toString();
  const weight = (formData.get('weight') || '').toString();
  const price = (formData.get('price') || '').toString();
  const existingImg = formData.get('existingImg');
  const image = formData.get('image');

  if (!title) return NextResponse.json({ error: 'missing' }, { status: 400 });

  let imgPath = typeof existingImg === 'string' ? existingImg : '';
  if (image && image instanceof File) {
    imgPath = await saveImageFile(image);
  }

  const client = await clientPromise;
  const db = client.db();
  const col = db.collection('products');
  const doc = { title, weight, price, img: imgPath, createdAt: new Date() };
  await col.insertOne(doc);
  return NextResponse.json({ ok: true, product: doc });
}

export async function PUT(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = match ? match[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const formData = await request.formData();
  const _id = formData.get('_id');
  const title = (formData.get('title') || '').toString();
  const weight = (formData.get('weight') || '').toString();
  const price = (formData.get('price') || '').toString();
  const existingImg = formData.get('existingImg');
  const image = formData.get('image');

  if (!_id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  let imgPath = typeof existingImg === 'string' ? existingImg : '';
  if (image && image instanceof File) {
    imgPath = await saveImageFile(image);
  }

  const client = await clientPromise;
  const db = client.db();
  const col = db.collection('products');
  const { ObjectId } = await import('mongodb');
  await col.updateOne(
    { _id: new ObjectId(_id.toString()) },
    { $set: { title, weight, price, img: imgPath } }
  );
  const doc = await col.findOne({ _id: new ObjectId(_id.toString()) });
  return NextResponse.json({ ok: true, product: doc });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = match ? match[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();
  const col = db.collection('products');
  const { ObjectId } = await import('mongodb');
  await col.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
