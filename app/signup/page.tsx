"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push("/");
    });
  }, [router]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display font-bold mb-4">Check your email</h1>
        <p className="text-ink/60">We sent a confirmation link to {email}.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-display font-bold mb-8 text-center">Create Account</h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Sign Up"}</Button>
      </form>
      <p className="text-sm text-center mt-6 text-ink/60">
        Already have an account? <Link href="/login" className="underline">Sign in</Link>
      </p>
    </div>
  );
}
