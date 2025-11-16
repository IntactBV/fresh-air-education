"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/utils/auth-client";
import Image from "next/image";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackURL = params.get("callbackURL") ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPending, setResetPending] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  
  // if already authenticated, redirect to the correct area
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: freshSession } = await authClient.getSession();
      if (!mounted) return;
      const role = freshSession?.user?.role;
      if (!role) return;

      if (callbackURL) {
        router.replace(callbackURL);
        return;
      }
      if (role === "admin") router.replace("/admin");
      else if (role === "tutore") router.replace("/tutore");
      else router.replace("/edu");
    })();
    return () => {
      mounted = false;
    };
  }, [router, callbackURL]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { error } = await authClient.signIn.email(
      { email, password, rememberMe: true },
      {
        onError: (ctx) => setError(ctx.error.message),
      }
    );

    setPending(false);

    if (error) return;

    const { data: freshSession } = await authClient.getSession();
    const role = freshSession?.user?.role;

    if (callbackURL) {
      router.replace(callbackURL);
      return;
    }

    if (role === "admin") {
      router.replace("/admin");
    } else if (role === "tutore") {
      router.replace("/tutore");
    } else {
      router.replace("/edu");
    }
  }

  async function onResetSubmit(e: FormEvent) {
    e.preventDefault();
    setResetMessage(null);

    if (!resetEmail.trim()) {
      setResetMessage("Te rugam sa introduci un email.");
      return;
    }

    setResetMessage(null);
    setResetSuccess(false);

    setResetPending(true);

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      if (!res.ok) {
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          // ignore
        }

        setResetSuccess(false);
        setResetMessage(
          data?.error ?? "A aparut o eroare. Incearca din nou."
        );
      } else {
        setResetSuccess(true);
        setResetMessage(
          "Daca exista un cont cu acest email, vei primi un link de resetare a parolei."
        );
      }
    } catch (err) {
      setResetSuccess(false);
      setResetMessage("A aparut o eroare de retea. Incearca din nou.");
    } finally {
      setResetPending(false);
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-[#020617] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/images/logo.png"
              alt="Fresh Air logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            {/* <span className="text-xl font-semibold tracking-tight text-zinc-800/90 dark:text-zinc-100/90">
              FRESH TECH
            </span> */}
            <span
              className="
                hidden md:inline
                align-middle
                font-sans
                text-[1.15rem] leading-[1.2rem]
                font-semibold
                tracking-tight
                select-none
                text-zinc-800 dark:text-zinc-100
              "
            >
              <span className="inline-block align-baseline text-[1.3rem] leading-none">
                F
              </span>
              RESH{" "}
              <span className="inline-block align-baseline text-[1.3rem] leading-none text-primary">
                T
              </span>
              <span className="text-primary">ECH</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tehnologii si educatie pentru studenti
          </p>
        </div>

        <div className="w-full rounded-2xl border border-zinc-200/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
          <div className="px-6 py-7 sm:px-8">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
              Autentificare
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Introdu emailul si parola pentru a accesa platforma.
            </p>

            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition 
                             placeholder:text-zinc-400
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                             dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="nume@exemplu.ro"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                  >
                    Parola
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition 
                             placeholder:text-zinc-400
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                             dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="Parola ta"
                />
              </div>

              {error && (
                <p
                  className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-1 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg 
                           bg-gradient-to-r from-blue-600 to-blue-500 px-4 text-sm font-semibold text-white 
                           shadow-sm transition hover:brightness-110 active:scale-[0.99] 
                           disabled:cursor-not-allowed disabled:opacity-70
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
              >
                {pending ? "Se conecteaza..." : "Conecteaza-te"}
              </button>
            </form>

            <div className="mt-4 border-t border-zinc-200/80 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              <button
                type="button"
                onClick={() => {
                  setResetOpen((prev) => !prev);
                  setResetMessage(null);
                  setResetSuccess(false);
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Ai uitat parola?
              </button>

              {resetOpen && (
                <form onSubmit={onResetSubmit} className="mt-3 grid gap-3">
                  <div className="grid gap-2">
                    <label
                      htmlFor="reset-email"
                      className="text-xs font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      Introdu emailul tau
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-9 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 outline-none transition 
                                 placeholder:text-zinc-400
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                                 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                      placeholder="nume@exemplu.ro"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetPending || resetSuccess}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-500/80 
                              bg-white px-3 text-xs font-semibold text-blue-600 
                              hover:bg-blue-50 active:scale-[0.99]
                              disabled:cursor-not-allowed disabled:opacity-70
                              dark:bg-zinc-950 dark:text-blue-400 dark:border-blue-400/70 dark:hover:bg-zinc-900
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
                  >
                    {resetPending
                      ? "Se trimite..."
                      : resetSuccess
                      ? "Email trimis"
                      : "Trimite link de resetare"}
                  </button>
                  {resetMessage && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {resetMessage}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
