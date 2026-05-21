import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { join } from "path";

const adapter = new PrismaLibSql({ url: `file:${join(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter } as never);

const users = [
  { name: "Alex Chen", email: "alex@example.com", age: 28, gender: "man", bio: "Software engineer by day, chef by night. Looking for someone to explore the city with.", interests: ["Cooking", "Hiking", "Travel"], location: "San Francisco, CA" },
  { name: "Jamie Rivera", email: "jamie@example.com", age: 25, gender: "woman", bio: "Art teacher who loves museums, jazz, and spontaneous road trips.", interests: ["Art", "Music", "Travel"], location: "New York, NY" },
  { name: "Sam Morgan", email: "sam@example.com", age: 30, gender: "nonbinary", bio: "Yoga instructor and plant parent. Big fan of farmers markets and cozy bookshops.", interests: ["Yoga", "Reading", "Coffee"], location: "Austin, TX" },
  { name: "Taylor Kim", email: "taylor@example.com", age: 27, gender: "woman", bio: "Marine biologist obsessed with diving and conservation. Beach walks > city walks.", interests: ["Fitness", "Travel", "Dogs"], location: "Miami, FL" },
  { name: "Jordan Lee", email: "jordan@example.com", age: 32, gender: "man", bio: "Startup founder and weekend cyclist. I make really good playlists.", interests: ["Music", "Cycling", "Coffee"], location: "Seattle, WA" },
];

async function main() {
  console.log("Seeding database...");
  for (const u of users) {
    const hashed = await bcrypt.hash("password123", 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        password: hashed,
        interests: JSON.stringify(u.interests),
        photos: JSON.stringify([]),
      },
    });
  }
  console.log("Seed complete. All demo users have password: password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
