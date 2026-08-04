"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/google-button";
import { Glasses } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push("/");
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Glasses className="h-10 w-10 mx-auto mb-4 text-ink/30" />
          <h1 className="text-2xl font-display font-bold">Welcome Back</h1>
          <p className="text-sm text-ink/50 mt-1">Sign in to your Chashmish account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="text-xs uppercase tracking-wider text-ink/40">or</span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <GoogleButton />

        <p className="text-sm text-center mt-8 text-ink/50">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-ink font-medium underline underline-offset-4 hover:no-underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
