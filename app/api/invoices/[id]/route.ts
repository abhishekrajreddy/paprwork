import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  await connectDB();
  const invoice = await Invoice.findOne({
    _id: id,
    userId: session.user.id,
  });
  if (!invoice)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const invoice = await Invoice.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    body,
    { new: true },
  );
  if (!invoice)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  await connectDB();
  await Invoice.findOneAndDelete({ _id: id, userId: session.user.id });
  return NextResponse.json({ message: "Invoice deleted" });
}
