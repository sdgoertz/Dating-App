"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Image from "next/image";
import { User, Camera, Plus, X, Check } from "lucide-react";

const INTERESTS = ["Coffee", "Hiking", "Travel", "Music", "Cooking", "Art", "Fitness", "Reading", "Gaming", "Yoga", "Dogs", "Cats", "Movies", "Wine", "Dancing", "Cycling", "Photography", "Surfing"];

interface Profile {
  id: string; name: string; email: string; age: number; gender: string;
  bio: string; photos: string; interests: string;
  prefGenderInterest: string; prefAgeMin: number; prefAgeMax: number;
  prefMaxDistance: number; location: string;
}

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "1";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/profile");
    if (res.status === 401) { router.push("/auth/login"); return; }
    const data = await res.json();
    if (data.user) {
      setProfile(data.user);
      setForm(data.user);
      setPhotos(JSON.parse(data.user.photos || "[]"));
      setInterests(JSON.parse(data.user.interests || "[]"));
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, photos, interests }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (isSetup) router.push("/discover");
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setPhotos((prev) => [...prev, data.url]);
    setUploading(false);
    e.target.value = "";
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url));
  }

  function toggleInterest(i: string) {
    setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pt-16">
        <Navigation />
        <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pt-16">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl font-black text-gray-900">{isSetup ? "Set Up Your Profile" : "My Profile"}</h1>
        </div>

        <div className="space-y-6">
          {/* Photos */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-rose-400" /> Photos
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((url) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={url} alt="Profile photo" fill className="object-cover" sizes="150px" />
                  <button
                    onClick={() => removePhoto(url)}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className={`aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors ${uploading ? "opacity-50" : ""}`}>
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">{uploading ? "Uploading…" : "Add photo"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Basic Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number" min="18" max="99"
                  value={form.age || ""}
                  onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={form.gender || ""}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm bg-white"
              >
                <option value="man">Man</option>
                <option value="woman">Woman</option>
                <option value="nonbinary">Non-binary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                value={form.location || ""}
                placeholder="e.g. New York, NY"
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                rows={3}
                value={form.bio || ""}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell people about yourself…"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm resize-none"
              />
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    interests.includes(i)
                      ? "bg-rose-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Preferences</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Show me</label>
              <select
                value={form.prefGenderInterest || "everyone"}
                onChange={(e) => setForm({ ...form, prefGenderInterest: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm bg-white"
              >
                <option value="everyone">Everyone</option>
                <option value="man">Men</option>
                <option value="woman">Women</option>
                <option value="nonbinary">Non-binary people</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age range: {form.prefAgeMin ?? 18} – {form.prefAgeMax ?? 99}
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range" min="18" max="99"
                  value={form.prefAgeMin ?? 18}
                  onChange={(e) => setForm({ ...form, prefAgeMin: Number(e.target.value) })}
                  className="flex-1 accent-rose-500"
                />
                <input
                  type="range" min="18" max="99"
                  value={form.prefAgeMax ?? 99}
                  onChange={(e) => setForm({ ...form, prefAgeMax: Number(e.target.value) })}
                  className="flex-1 accent-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saved ? <><Check className="w-5 h-5" /> Saved!</> : saving ? "Saving…" : isSetup ? "Complete Profile" : "Save Changes"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <ProfilePageInner />
    </Suspense>
  );
}
