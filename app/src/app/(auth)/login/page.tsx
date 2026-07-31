"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userApi } from "@lib/api";
import { useAuthStore } from "@store/useAuthStore";
import { useLoadingStore } from "@store/useLoadingStore";
import Link from "next/link";
import Image from "next/image";
import InputGroup from "@components/ui/InputGroup";
import TextInput from "@components/ui/basic-inputs/TextInput";
import PasswordInput from "@components/ui/basic-inputs/PasswordInput";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const setProfile = useAuthStore((state) => state.setProfile);
  const { isLoading, setLoading } = useLoadingStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await userApi.api.v1.auth.login.post({
        identifier,
        password,
      });

      if (response.error) {
        setError(response.error.value?.message || "Invalid credentials");
      } else if (response.data?.data) {
        setProfile(response.data.data.user, response.data.data.accessToken);
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 w-full h-full min-h-[80vh]">
      <div className="glass p-8 w-full max-w-md relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-500/20 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="Bekasi Stock Exchange Logo" width={48} height={48} className="w-12 h-12 object-contain mb-6" />

          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-zinc-400 text-sm mb-8">
            Sign in to access your dashboard.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <InputGroup label="Username or Email">
              <TextInput
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="admin"
              />
            </InputGroup>

            <InputGroup label="Password">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </InputGroup>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 glow-primary"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
