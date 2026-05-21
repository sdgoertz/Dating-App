"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

interface Match {
  matchId: string;
  other: { id: string; name: string; photos: string; age: number };
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  createdAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => { if (r.status === 401) router.push("/auth/login"); return r.json(); })
      .then((d) => { setMatches(d.matches || []); setLoading(false); });
  }, [router]);

  const withMessages = matches.filter((m) => m.lastMessage);
  const newMatches = matches.filter((m) => !m.lastMessage);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pt-16">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl font-black text-gray-900">Messages</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No conversations yet</h2>
            <p className="text-gray-500 mb-6">Match with someone to start chatting</p>
            <Link href="/discover" className="px-6 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors inline-block">
              Start Discovering
            </Link>
          </div>
        ) : (
          <>
            {newMatches.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">New Matches</h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {newMatches.map((m) => {
                    const photos: string[] = JSON.parse(m.other.photos || "[]");
                    const photo = photos[0] || null;
                    return (
                      <Link key={m.matchId} href={`/messages/${m.matchId}`} className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden mb-1 ring-2 ring-rose-400 ring-offset-2">
                          {photo ? (
                            <Image src={photo} alt={m.other.name} width={64} height={64} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center">
                              <span className="text-xl font-bold text-white">{m.other.name[0]}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium truncate w-16">{m.other.name}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {withMessages.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Conversations</h2>
                <div className="space-y-2">
                  {withMessages.map((m) => {
                    const photos: string[] = JSON.parse(m.other.photos || "[]");
                    const photo = photos[0] || null;
                    return (
                      <Link
                        key={m.matchId}
                        href={`/messages/${m.matchId}`}
                        className="flex items-center gap-4 bg-white rounded-2xl p-4 hover:bg-rose-50 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                          {photo ? (
                            <Image src={photo} alt={m.other.name} width={56} height={56} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center">
                              <span className="text-xl font-bold text-white">{m.other.name[0]}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900">{m.other.name}</p>
                          <p className="text-sm text-gray-500 truncate">{m.lastMessage?.content}</p>
                        </div>
                        <p className="text-xs text-gray-400 flex-shrink-0">
                          {m.lastMessage ? new Date(m.lastMessage.createdAt).toLocaleDateString() : ""}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
