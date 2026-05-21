import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      gender: true,
      bio: true,
      photos: true,
      interests: true,
      prefGenderInterest: true,
      prefAgeMin: true,
      prefAgeMax: true,
      prefMaxDistance: true,
      location: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, age, gender, bio, photos, interests,
    prefGenderInterest, prefAgeMin, prefAgeMax, prefMaxDistance, location,
  } = body;

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      ...(name !== undefined && { name }),
      ...(age !== undefined && { age: Number(age) }),
      ...(gender !== undefined && { gender }),
      ...(bio !== undefined && { bio }),
      ...(photos !== undefined && { photos: JSON.stringify(photos) }),
      ...(interests !== undefined && { interests: JSON.stringify(interests) }),
      ...(prefGenderInterest !== undefined && { prefGenderInterest }),
      ...(prefAgeMin !== undefined && { prefAgeMin: Number(prefAgeMin) }),
      ...(prefAgeMax !== undefined && { prefAgeMax: Number(prefAgeMax) }),
      ...(prefMaxDistance !== undefined && { prefMaxDistance: Number(prefMaxDistance) }),
      ...(location !== undefined && { location }),
    },
    select: {
      id: true, name: true, email: true, age: true, gender: true,
      bio: true, photos: true, interests: true,
      prefGenderInterest: true, prefAgeMin: true, prefAgeMax: true,
      prefMaxDistance: true, location: true,
    },
  });

  return NextResponse.json({ user });
}
