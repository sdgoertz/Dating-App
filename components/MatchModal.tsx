"use client";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import Image from "next/image";

interface Props {
  matchId: string;
  otherName: string;
  otherPhoto: string | null;
  onClose: () => void;
}

export default function MatchModal({ matchId, otherName, otherPhoto, onClose }: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-once">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
        </div>
        <h2 className="text-3xl font-black text-rose-500 mb-1">It&apos;s a Match!</h2>
        <p className="text-gray-500 mb-6">You and {otherName} liked each other</p>

        {otherPhoto && (
          <div className="relative w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-rose-300">
            <Image src={otherPhoto} alt={otherName} fill className="object-cover" sizes="96px" />
          </div>
        )}
        {!otherPhoto && (
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{otherName[0]}</span>
          </div>
        )}

        <button
          onClick={() => { onClose(); router.push(`/messages/${matchId}`); }}
          className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors mb-3"
        >
          Send Message
        </button>
        <button onClick={onClose} className="w-full py-3 text-gray-500 font-medium hover:text-gray-700">
          Keep Swiping
        </button>
      </div>
    </div>
  );
}
