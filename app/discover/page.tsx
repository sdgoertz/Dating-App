"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import SwipeCard from "@/components/SwipeCard";
import MatchModal from "@/components/MatchModal";
import { Heart, RefreshCw } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string;
  interests: string;
  location: string;
}

interface MatchInfo {
  matchId: string;
  otherName: string;
  otherPhoto: string | null;
}

export default function DiscoverPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/discover");
    if (res.status === 401) { router.push("/auth/login"); return; }
    const data = await res.json();
    setCandidates(data.candidates || []);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadCandidates(); }, [loadCandidates]);

  async function handleSwipe(id: string, direction: "like" | "pass") {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: id, direction }),
    });
    const data = await res.json();
    if (data.matched) {
      const target = candidates.find((c) => c.id === id);
      const photos: string[] = JSON.parse(target?.photos || "[]");
      setMatchInfo({ matchId: data.matchId, otherName: target?.name || "them", otherPhoto: photos[0] || null });
    }
  }

  const top = candidates[candidates.length - 1];
  const second = candidates[candidates.length - 2];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pt-16">
      <Navigation />
      <main className="max-w-md mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <h1 className="text-2xl font-black text-gray-900">Discover</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3" />
            <p>Finding people near you…</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😴</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No more profiles</h2>
            <p className="text-gray-500 mb-6">Check back later or adjust your preferences</p>
            <button onClick={loadCandidates} className="px-6 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors">
              Refresh
            </button>
          </div>
        ) : (
          <div className="relative" style={{ height: 600 }}>
            {second && (
              <div className="absolute inset-0 scale-95 origin-bottom opacity-80 pointer-events-none">
                <SwipeCard candidate={second} onSwipe={() => {}} />
              </div>
            )}
            <div className="absolute inset-0">
              <SwipeCard candidate={top} onSwipe={handleSwipe} />
            </div>
          </div>
        )}
      </main>

      {matchInfo && (
        <MatchModal
          matchId={matchInfo.matchId}
          otherName={matchInfo.otherName}
          otherPhoto={matchInfo.otherPhoto}
          onClose={() => setMatchInfo(null)}
        />
      )}
    </div>
  );
}
