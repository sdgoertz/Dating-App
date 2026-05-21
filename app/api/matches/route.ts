import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: session.userId }, { user2Id: session.userId }],
    },
    include: {
      user1: { select: { id: true, name: true, photos: true, age: true, bio: true } },
      user2: { select: { id: true, name: true, photos: true, age: true, bio: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = matches.map((m) => {
    const other = m.user1Id === session.userId ? m.user2 : m.user1;
    return {
      matchId: m.id,
      other,
      lastMessage: m.messages[0] || null,
      createdAt: m.createdAt,
    };
  });

  return NextResponse.json({ matches: result });
}
