"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  read: boolean;
  senderId: string;
  sender: { id: string; name: string; photos: string };
}

interface Me {
  id: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherName, setOtherName] = useState("");
  const [otherPhoto, setOtherPhoto] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/messages/${matchId}`);
    if (res.status === 401) { router.push("/auth/login"); return; }
    if (res.status === 403) { router.push("/messages"); return; }
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }, [matchId, router]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user));

    loadMessages();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      const other = messages.find((m) => m.senderId !== me?.id)?.sender;
      if (other) {
        setOtherName(other.name);
        const photos: string[] = JSON.parse(other.photos || "[]");
        setOtherPhoto(photos[0] || null);
      }
    }
  }, [messages, me]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    const res = await fetch(`/api/messages/${matchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (data.message) setMessages((prev) => [...prev, data.message]);
    setSending(false);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 z-10 md:pl-4">
        <Link href="/messages" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        {otherPhoto ? (
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image src={otherPhoto} alt={otherName} width={40} height={40} className="object-cover" />
          </div>
        ) : otherName ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{otherName[0]}</span>
          </div>
        ) : null}
        <h1 className="font-bold text-gray-900">{otherName || "Chat"}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-3">👋</div>
            <p className="font-bold text-gray-700">Say hello!</p>
            <p className="text-gray-500 text-sm">Be the first to send a message</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === me?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? "bg-rose-500 text-white rounded-br-sm"
                      : "bg-white text-gray-900 shadow-sm rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                  <div className={`text-xs mt-1 ${isMe ? "text-rose-200" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t px-4 py-3 flex gap-3 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-600 disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
