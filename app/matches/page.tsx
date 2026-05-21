"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";

interface Match {
  matchId: string;
  other: { id: string; name: string; photos: string; age: number; bio: string };
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  createdAt: string;
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => { if (r.status === 401) router.push("/auth/login"); return r.json(); })
      .then((d) => { setMatches(d.matches || []); setLoading(false); });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pt-16">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <h1 className="text-2xl font-black text-gray-900">Matches</h1>
          {matches.length > 0 && (
            <span className="ml-auto bg-rose-100 text-rose-600 text-sm font-bold px-3 py-1 rounded-full">
              {matches.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💫</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No matches yet</h2>
            <p className="text-gray-500 mb-6">Keep swiping to find your spark</p>
            <Link href="/discover" className="px-6 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors inline-block">
              Discover People
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {matches.map((m) => {
              const photos: string[] = JSON.parse(m.other.photos || "[]");
              const photo = photos[0] || null;
              return (
                <Link
                  key={m.matchId}
                  href={`/messages/${m.matchId}`}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative">
                    {photo ? (
                      <Image src={photo} alt={m.other.name} fill className="object-cover" sizes="200px" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{m.other.name[0]}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-bold text-sm">{m.other.name}, {m.other.age}</p>
                      {m.lastMessage && (
                        <p className="text-white/70 text-xs truncate">{m.lastMessage.content}</p>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-full p-1.5 shadow">
                      <MessageCircle className="w-4 h-4 text-rose-500" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
