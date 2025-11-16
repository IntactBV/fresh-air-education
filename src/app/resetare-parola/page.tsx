// src/app/resetare-parola/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/utils/auth-client";
import Image from "next/image";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const hasToken = !!token;

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasToken) {
      setError(
        "Acest link nu este valid. Te rugam sa folosesti linkul primit pe email sau sa ceri un nou link de resetare."
      );
      return;
    }

    if (!password || !passwordConfirm) {
      setError("Te rugam sa completezi toate campurile.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Parolele nu coincid. Te rugam sa incerci din nou.");
      return;
    }

    setPending(true);

    const { error } = await authClient.resetPassword({
      token,
      newPassword: password,
    });

    setPending(false);

    if (!error) {
      router.replace("/autentificare");
    } else {
      setError(
        error.message ??
          "Nu am putut salva parola. Te rugam sa incerci din nou."
      );
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-[#020617] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand header, similar cu pagina de autentificare */}
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
              Reseteaza parola
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Alege o parola noua pentru contul tau.
            </p>

            {!hasToken && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
                Acest link de resetare nu este valid sau a expirat. Te rugam sa
                folosesti linkul primit pe email sau sa ceri un nou link de
                resetare din pagina de autentificare.
              </div>
            )}

            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                >
                  Parola noua
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition 
                             placeholder:text-zinc-400
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                             dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="Introdu parola noua"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="password-confirm"
                  className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                >
                  Confirma parola noua
                </label>
                <input
                  id="password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition 
                             placeholder:text-zinc-400
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                             dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="Reintrodu parola noua"
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
                disabled={pending || !hasToken}
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg 
                           bg-gradient-to-r from-blue-600 to-blue-500 px-4 text-sm font-semibold text-white 
                           shadow-sm transition hover:brightness-110 active:scale-[0.99] 
                           disabled:cursor-not-allowed disabled:opacity-70
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
              >
                {pending ? "Se salveaza..." : "Salveaza parola"}
              </button>
            </form>

            <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              Daca ai ajuns aici din greseala, te poti intoarce la{" "}
              <button
                type="button"
                onClick={() => router.push("/autentificare")}
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                pagina de autentificare
              </button>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
