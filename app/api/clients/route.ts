import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const clients = await Client.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const client = await Client.create({ ...body, userId: session.user.id });
  return NextResponse.json(client, { status: 201 });
}