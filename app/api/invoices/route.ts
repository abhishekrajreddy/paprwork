import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const invoices = await Invoice.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const invoice = await Invoice.create({ ...body, userId: session.user.id });
  return NextResponse.json(invoice, { status: 201 });
}