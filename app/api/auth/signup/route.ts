import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, email, password, age, gender } = await req.json();

  if (!name || !email || !password || !age || !gender) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, age: Number(age), gender },
  });

  const token = signToken({ userId: user.id, email: user.email });
  const cookieOpts = createSessionCookie(token);

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  res.cookies.set(cookieOpts);
  return res;
}
