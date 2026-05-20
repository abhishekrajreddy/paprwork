import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  await connectDB();
  const client = await Client.findOne({ _id: id, userId: session.user.id });
  if (!client)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
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
  await Client.findOneAndDelete({ _id: id, userId: session.user.id });
  return NextResponse.json({ message: "Client deleted" });
}
