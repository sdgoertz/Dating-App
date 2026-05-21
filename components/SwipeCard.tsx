"use client";
import { useState, useRef } from "react";
import { Heart, X, Info } from "lucide-react";
import Image from "next/image";

interface Candidate {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string;
  interests: string;
  location: string;
}

interface Props {
  candidate: Candidate;
  onSwipe: (id: string, direction: "like" | "pass") => void;
}

export default function SwipeCard({ candidate, onSwipe }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [decision, setDecision] = useState<"like" | "pass" | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const photos: string[] = JSON.parse(candidate.photos || "[]");
  const interests: string[] = JSON.parse(candidate.interests || "[]");
  const mainPhoto = photos[0] || null;

  function onMouseDown(e: React.MouseEvent) {
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging || !startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setOffset({ x: dx, y: dy });
    if (dx > 50) setDecision("like");
    else if (dx < -50) setDecision("pass");
    else setDecision(null);
  }

  function onMouseUp() {
    if (!dragging) return;
    setDragging(false);
    if (offset.x > 80) {
      onSwipe(candidate.id, "like");
    } else if (offset.x < -80) {
      onSwipe(candidate.id, "pass");
    } else {
      setOffset({ x: 0, y: 0 });
      setDecision(null);
    }
    startRef.current = null;
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!startRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;
    setOffset({ x: dx, y: dy });
    if (dx > 50) setDecision("like");
    else if (dx < -50) setDecision("pass");
    else setDecision(null);
  }

  function onTouchEnd() {
    if (offset.x > 80) onSwipe(candidate.id, "like");
    else if (offset.x < -80) onSwipe(candidate.id, "pass");
    else { setOffset({ x: 0, y: 0 }); setDecision(null); }
    setDragging(false);
    startRef.current = null;
  }

  const rotate = offset.x / 15;

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-sm mx-auto select-none cursor-grab active:cursor-grabbing"
      style={{
        transform: `translate(${offset.x}px, ${offset.y * 0.3}px) rotate(${rotate}deg)`,
        transition: dragging ? "none" : "transform 0.3s ease",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="rounded-3xl overflow-hidden shadow-2xl bg-white" style={{ height: 520 }}>
        {/* Photo */}
        <div className="relative w-full" style={{ height: showInfo ? 200 : 400 }}>
          {mainPhoto ? (
            <Image src={mainPhoto} alt={candidate.name} fill className="object-cover" sizes="400px" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center">
              <span className="text-6xl font-bold text-white">{candidate.name[0]}</span>
            </div>
          )}
          {/* Like/Pass overlays */}
          {decision === "like" && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <span className="text-green-500 font-black text-5xl border-4 border-green-500 px-4 py-1 rotate-[-20deg]">LIKE</span>
            </div>
          )}
          {decision === "pass" && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
              <span className="text-red-500 font-black text-5xl border-4 border-red-500 px-4 py-1 rotate-[20deg]">NOPE</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-gray-900">{candidate.name}, {candidate.age}</h2>
            <button onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }} className="p-2 rounded-full hover:bg-gray-100">
              <Info className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {candidate.location && <p className="text-gray-500 text-sm mb-2">{candidate.location}</p>}
          {showInfo && (
            <>
              {candidate.bio && <p className="text-gray-700 text-sm mb-3">{candidate.bio}</p>}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {interests.map((i) => (
                    <span key={i} className="bg-rose-50 text-rose-600 text-xs px-2 py-1 rounded-full">{i}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-6 mt-4" onMouseDown={(e) => e.stopPropagation()}>
        <button
          onClick={() => onSwipe(candidate.id, "pass")}
          className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all"
        >
          <X className="w-7 h-7 text-red-400" />
        </button>
        <button
          onClick={() => onSwipe(candidate.id, "like")}
          className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-green-50 hover:scale-110 transition-all"
        >
          <Heart className="w-7 h-7 text-green-400" />
        </button>
      </div>
    </div>
  );
}
