import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId } = await params;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.user1Id !== session.userId && match.user2Id !== session.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { matchId },
    include: { sender: { select: { id: true, name: true, photos: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Mark messages as read
  await prisma.message.updateMany({
    where: { matchId, senderId: { not: session.userId }, read: false },
    data: { read: true },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.user1Id !== session.userId && match.user2Id !== session.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: { matchId, senderId: session.userId, content: content.trim() },
    include: { sender: { select: { id: true, name: true, photos: true } } },
  });

  return NextResponse.json({ message });
}
