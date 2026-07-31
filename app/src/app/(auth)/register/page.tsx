"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userApi } from "@lib/api";
import { useLoadingStore } from "@store/useLoadingStore";
import Link from "next/link";
import Image from "next/image";
import InputGroup from "@components/ui/InputGroup";
import TextInput from "@components/ui/basic-inputs/TextInput";
import PasswordInput from "@components/ui/basic-inputs/PasswordInput";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");

  const { isLoading, setLoading } = useLoadingStore();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await userApi.api.v1.auth.register.post({
        username,
        email: email || undefined,
        name,
        password,
        referralCode,
      });

      if (response.error) {
        setError(response.error.value?.message || "Registration failed");
      } else if (response.data?.data) {
        // According to the login flow, we can set the profile after a successful registration
        // or we might need them to log in. Assuming register returns the user object in data.user
        // Wait, does register also set auth cookie? Yes, register service handles it just like login usually, or if not they can be redirected to login.
        // I will redirect them to login with a success message or log them in directly.
        // For safety, I'll redirect to login page.
        router.push("/login?registered=true");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 w-full h-full min-h-[80vh] my-10">
      <div className="glass p-8 w-full max-w-md relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-500/20 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="Bekasi Stock Exchange Logo" width={48} height={48} className="w-12 h-12 object-contain mb-6" />

          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-zinc-400 text-sm mb-8">
            Join the next generation trading platform.
          </p>

          <form onSubmit={handleRegister} className="w-full space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <InputGroup label="Display Name">
              <TextInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </InputGroup>

            <InputGroup label="Username">
              <TextInput
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                placeholder="johndoe"
              />
            </InputGroup>

            <InputGroup label="Email Address (Optional)">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </InputGroup>

            <InputGroup label="Password">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </InputGroup>

            <InputGroup label="Referral Code">
              <TextInput
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                required
                placeholder="INVITE-CODE"
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
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
