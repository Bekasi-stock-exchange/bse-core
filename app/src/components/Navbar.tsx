"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@store/useAuthStore";
import { useRouter } from "next/navigation";
import { userApi } from "@lib/api";

export default function Navbar() {
  const { profile, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await userApi.api.v1.auth.logout.post();
    } catch (e) {
      console.error(e);
    }
    logout();
    router.push("/");
  };

  return (
    <nav className="fixed top-4 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-7xl z-50 glass border border-surface-border rounded-2xl">
      <div className="px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white flex items-center gap-2"
        >
          <Image src="/logo.png" alt="Bekasi Stock Exchange Logo" width={32} height={32} className="w-8 h-8 object-contain" />
          Bekasi Stock Exchange
        </Link>
        <div className="flex items-center gap-4">
          {profile ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-300 hidden md:block">
                Welcome,{" "}
                <span className="font-semibold text-white">
                  {profile.username}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-surface-hover rounded-xl hover:bg-surface border border-surface-border transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-semibold text-white bg-white/10 rounded-xl hover:bg-white/20 border border-white/10 transition-all glow-primary"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
