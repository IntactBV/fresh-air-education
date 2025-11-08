"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/utils/auth-client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { error } = await authClient.signUp.email(
      { name, email, password, callbackURL: "/" },
      { onError: (ctx) => setError(ctx.error.message) }
    );

    setPending(false);
    if (!error) router.replace("/");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-6 grid gap-3">
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-md border px-3" />
      <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 rounded-md border px-3" />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 rounded-md border px-3" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="h-10 rounded-md border bg-black text-white">{pending ? "Creating…" : "Create account"}</button>
    </form>
  );
}
