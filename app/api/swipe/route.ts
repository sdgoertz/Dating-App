import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetId, direction } = await req.json();
  if (!targetId || !["like", "pass"].includes(direction)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.swipe.upsert({
    where: { swiperId_swipedId: { swiperId: session.userId, swipedId: targetId } },
    update: { direction },
    create: { swiperId: session.userId, swipedId: targetId, direction },
  });

  let matched = false;
  let matchId: string | null = null;

  if (direction === "like") {
    // Check if the other person already liked us
    const theirSwipe = await prisma.swipe.findUnique({
      where: { swiperId_swipedId: { swiperId: targetId, swipedId: session.userId } },
    });

    if (theirSwipe?.direction === "like") {
      // Create match - ensure user1Id < user2Id for the unique constraint
      const [u1, u2] = [session.userId, targetId].sort();
      const match = await prisma.match.upsert({
        where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
        update: {},
        create: { user1Id: u1, user2Id: u2 },
      });
      matched = true;
      matchId = match.id;
    }
  }

  return NextResponse.json({ matched, matchId });
}
