"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, MessageCircle, User, Compass, LogOut } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/discover", icon: Compass, label: "Discover" },
    { href: "/matches", icon: Heart, label: "Matches" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/discover" className="hidden md:flex items-center gap-2 font-bold text-rose-500 text-xl">
          <Heart className="w-6 h-6 fill-rose-500" />
          Spark
        </Link>
        <div className="flex items-center gap-1 flex-1 md:flex-none justify-around md:justify-end md:gap-2">
          {links.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-colors ${
                  active ? "text-rose-500 bg-rose-50" : "text-gray-500 hover:text-rose-400 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-xl text-xs md:text-sm font-medium text-gray-500 hover:text-rose-400 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
