"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/google-button";
import { Glasses } from "lucide-react";
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
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Glasses className="h-10 w-10 mx-auto mb-4 text-ink/30" />
          <h1 className="text-2xl font-display font-bold mb-3">Check your email</h1>
          <p className="text-ink/60 leading-relaxed">
            We sent a confirmation link to <span className="font-medium text-ink">{email}</span>.
            Click the link to activate your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Glasses className="h-10 w-10 mx-auto mb-4 text-ink/30" />
          <h1 className="text-2xl font-display font-bold">Create Account</h1>
          <p className="text-sm text-ink/50 mt-1">Join Optique and start shopping</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="text-xs uppercase tracking-wider text-ink/40">or</span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <GoogleButton />

        <p className="text-sm text-center mt-8 text-ink/50">
          Already have an account?{" "}
          <Link href="/login" className="text-ink font-medium underline underline-offset-4 hover:no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
