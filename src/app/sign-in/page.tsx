// app/sign-in/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/utils/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackURL = params.get("callbackURL") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email(
      { email, password, rememberMe: true, callbackURL },
      {
        onError: (ctx) => setError(ctx.error.message),
      }
    );

    setPending(false);

    if (!error) {
      // Better Auth sets cookies; nextCookies plugin ensures Next picks them up
      router.replace(callbackURL);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center px-6">
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-lg border">
        <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-neutral-600 mb-6">
          Use your email and password.
        </p>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md border px-3 outline-none focus:ring-2"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-md border px-3 outline-none focus:ring-2"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-md border bg-black text-white disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-sm text-neutral-600">
          No account yet?{" "}
          <a className="underline" href="/sign-up">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
