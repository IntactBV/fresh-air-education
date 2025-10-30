'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

import IconMail from '@/components/icon/icon-mail';
import IconAt from '@/components/icon/icon-at';
import IconAward from '@/components/icon/icon-award';
import IconUser from '@/components/icon/icon-user';

type UserSummary = {
  name: string;
  email: string;
};

type Props = {
  user: UserSummary;
};

const ContulMeuComponent: React.FC<Props> = ({ user }) => {
  const email = user?.email ?? '';
  const name = user?.name ?? '';

  // state schimbare parolă
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const passwordErrors = useMemo(() => {
    const errors: string[] = [];
    if (newPassword && newPassword.length < 8) errors.push('Parola nouă trebuie să aibă minim 8 caractere.');
    if (newPassword && currentPassword && newPassword === currentPassword)
      errors.push('Parola nouă trebuie să fie diferită de parola curentă.');
    if (confirmNewPassword && newPassword !== confirmNewPassword)
      errors.push('Confirmarea parolei nu coincide.');
    return errors;
  }, [currentPassword, newPassword, confirmNewPassword]);

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
      // simulare apel API
      await new Promise((r) => setTimeout(r, 1000));
      setPwMsg('Parola a fost schimbată.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch {
      setPwErr('Nu am putut schimba parola.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    // simulare logout
    await new Promise((r) => setTimeout(r, 500));
    // TODO: redirect la /login
  };

  return (
    <div className="pt-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
        {/* ====== SECTIUNEA 1: Detalii cont (puțin mai îngustă) ====== */}
        <div className="lg:col-span-5">
          <div className="panel h-full flex flex-col">
            <div className="mb-4">
              <h5 className="text-lg font-semibold dark:text-white-light">Detalii cont</h5>
              <p className="text-white-dark">Informatii de baza</p>
            </div>

            <div className="rounded p-4 space-y-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-content-center rounded-md border dark:border-dark/40">
                  <IconAt />
                </span>
                <div>
                  <p className="text-xs text-white-dark mb-0.5">Nume utilizator</p>
                  <p className="font-semibold break-all">{email || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-content-center rounded-md border dark:border-dark/40">
                  <IconMail />
                </span>
                <div>
                  <p className="text-xs text-white-dark mb-0.5">Adresă de e-mail</p>
                  <p className="font-semibold break-all">{email || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-content-center rounded-md border dark:border-dark/40">
                  <IconUser />
                </span>
                <div>
                  <p className="text-xs text-white-dark mb-0.5">Nume</p>
                  <p className="font-semibold">{name || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-content-center rounded-md border dark:border-dark/40">
                  <IconAward />
                </span>
                <div>
                  <p className="text-xs text-white-dark mb-0.5">Tip cont</p>
                  <p className="font-semibold">student</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#ebedf2] dark:border-dark/40 flex items-center justify-end">
              <button className="btn btn-outline-danger" type="button" onClick={handleLogout}>
                Delogare
              </button>
            </div>
          </div>
        </div>

        {/* ====== SECTIUNEA 2: Securitate ====== */}
        <div className="lg:col-span-7">
          <div className="panel h-full flex flex-col">
            <div className="mb-4">
              <h5 className="text-lg font-semibold dark:text-white-light">Securitate</h5>
              <p className="text-white-dark">Schimbă parola</p>
            </div>

            {/* formular pe o coloană, vertical */}
            <form className="flex flex-col gap-4" onSubmit={handleChangePassword}>
              <div>
                <label className="text-white-dark block text-sm font-medium mb-2">Parola curentă</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-white-dark block text-sm font-medium mb-2">Parola nouă</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-white-dark block text-sm font-medium mb-2">Confirmă parola nouă</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>

              {passwordErrors.length > 0 ? (
                <ul className="list-disc list-inside text-danger">
                  {passwordErrors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white-dark">Minim 8 caractere. Evită reutilizarea parolelor.</p>
              )}

              <div className="mt-2 flex items-center justify-end">
                <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                  {pwLoading ? 'Se actualizează…' : 'Schimbă parola'}
                </button>
              </div>

              {/* feedback */}
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
