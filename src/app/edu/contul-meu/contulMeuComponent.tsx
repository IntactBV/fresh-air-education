"use client";

import React, { useMemo, useState } from "react";
import IconMail from "@/components/icon/icon-mail";
import IconAward from "@/components/icon/icon-award";
import IconUser from "@/components/icon/icon-user";
import IconCode from "@/components/icon/icon-code";
import { authClient } from "@fa/utils/auth-client";
import { useRouter } from "next/navigation";

type UserSummary = {
  name: string;
  email: string;
  role: string;
  id?: string;
};

type Props = {
  user: UserSummary;
};

const ContulMeuComponent: React.FC<Props> = ({ user }) => {
  const router = useRouter();
  const email = user?.email ?? "";
  const name = user?.name ?? "";
  const role = user?.role ?? "";
  const id = user?.id ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const passwordErrors = useMemo(() => {
    const errors: string[] = [];
    if (newPassword && newPassword.length < 8)
      errors.push("Parola noua trebuie sa aiba minim 8 caractere.");
    if (confirmNewPassword && newPassword !== confirmNewPassword)
      errors.push("Confirmarea parolei nu coincide.");
    return errors;
  }, [newPassword, confirmNewPassword]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    setPwErr(null);

    if (passwordErrors.length > 0) {
      setPwErr(passwordErrors[0]);
      return;
    }

    setPwLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setPwErr(error.message || "Nu am putut schimba parola.");
      } else {
        setPwMsg("Parola a fost schimbata.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (err: any) {
      setPwErr(err.message || "Nu am putut schimba parola.");
    } finally {
      setPwLoading(false);
    }
  };


  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/public");
        },
      },
    });
  };

  return (
    <div className="pt-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-5">
          <div className="panel h-full flex flex-col">
            <div className="mb-4">
              <h5 className="text-lg font-semibold dark:text-white-light">
                Detalii cont
              </h5>
              <p className="text-white-dark">Informatii de baza</p>
            </div>

            <div className="rounded p-4 space-y-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-content-center rounded-md border dark:border-dark/40">
                  <IconUser />
                </span>
                <div>
                  <p className="text-xs text-white-dark mb-0.5">Nume</p>
                  <p className="font-semibold break-all">{name || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-content-center rounded-md border dark:border-dark/40">
                  <IconMail />
                </span>
                <div>
                  <p className="text-xs text-white-dark mb-0.5">
                    Adresa de e-mail
                  </p>
                  <p className="font-semibold break-all">{email || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-content-center rounded-md border dark:border-dark/40">
                  <IconAward />
                </span>
                <div>
                  <p className="text-xs text-white-dark mb-0.5">Tip cont</p>
                  <p className="font-semibold">{role || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-content-center rounded-md border dark:border-dark/40">
                  <IconCode />
                </span>
                <div>
                  <p className="text-xs text-white-dark mb-0.5">ID cont</p>
                  <p className="font-semibold">{id || "-"}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#ebedf2] dark:border-dark/40 flex items-center justify-end">
              <button
                className="btn btn-outline-danger"
                type="button"
                onClick={handleLogout}
              >
                Delogare
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="panel h-full flex flex-col">
            <div className="mb-4">
              <h5 className="text-lg font-semibold dark:text-white-light">
                Securitate
              </h5>
              <p className="text-white-dark">
                Schimba parola contului tau.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleChangePassword}>
              <div>
                <label className="text-white-dark block text-sm font-medium mb-2">
                  Parola curenta
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-white-dark block text-sm font-medium mb-2">
                  Parola noua
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-white-dark block text-sm font-medium mb-2">
                  Confirma parola noua
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>

              {passwordErrors.length > 0 ? (
                <ul className="list-disc list-inside text-danger">
                  {passwordErrors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white-dark">
                  Minim 8 caractere. Parola curenta este necesara.
                </p>
              )}

              <div className="mt-2 flex items-center justify-end">
                <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                  {pwLoading ? "Se actualizeaza..." : "Schimba parola"}
                </button>
              </div>

              {pwMsg && <p className="text-success">{pwMsg}</p>}
              {pwErr && <p className="text-danger">{pwErr}</p>}
            </form>

            <div className="mt-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContulMeuComponent;
