import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get IDs the current user has already swiped
  const swiped = await prisma.swipe.findMany({
    where: { swiperId: session.userId },
    select: { swipedId: true },
  });
  const swipedIds = swiped.map((s: { swipedId: string }) => s.swipedId);
  swipedIds.push(session.userId);

  const genderFilter =
    me.prefGenderInterest === "everyone"
      ? {}
      : { gender: me.prefGenderInterest };

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: swipedIds },
      age: { gte: me.prefAgeMin, lte: me.prefAgeMax },
      ...genderFilter,
    },
    select: {
      id: true,
      name: true,
      age: true,
      gender: true,
      bio: true,
      photos: true,
      interests: true,
      location: true,
    },
    take: 20,
  });

  return NextResponse.json({ candidates });
}
