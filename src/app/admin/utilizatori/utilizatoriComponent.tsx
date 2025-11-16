"use client";

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import IconX from "@/components/icon/icon-x";
import IconDatabase from "@/components/icon/icon-database";
import IconEdit from "@/components/icon/icon-edit";
import IconLock from "@/components/icon/icon-lock";
import IconPlus from "@faComponents/icon/icon-plus";
import IconSend from "@faComponents/icon/icon-send";

type AppRole = "admin" | "tutore" | "student";

type AdminUserDTO = {
  id: string;
  email: string;
  name: string | null;
  role: AppRole | string | null;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  image?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
};

const PAGE_SIZES = [10, 20, 50];

export default function UtilizatoriComponent() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AppRole>("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalSaving, setRoleModalSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserDTO | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>("tutore");

  const [resetSavingId, setResetSavingId] = useState<string | null>(null);

  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banSaving, setBanSaving] = useState(false);
  const [banReason, setBanReason] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState<AppRole>("tutore");

  async function fetchUsers() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/users", { method: "GET" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Cannot fetch users");
      }


      const data: AdminUserDTO[] = await res.json();

      setUsers(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const list = users.filter((u) => {
      const matchSearch =
        !search ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.name || "").toLowerCase().includes(search.toLowerCase());
      const matchRole =
        roleFilter === "all" ? true : (u.role as string) === roleFilter;
      return matchSearch && matchRole;
    });

    const sorted = [...list].sort((a, b) => {
      const { columnAccessor, direction } = sortStatus;
      const dir = direction === "asc" ? 1 : -1;
      if (columnAccessor === "name") {
        return ((a.name || "").localeCompare(b.name || "")) * dir;
      }
      if (columnAccessor === "email") {
        return a.email.localeCompare(b.email) * dir;
      }
      if (columnAccessor === "role") {
        return ((a.role as string) || "").localeCompare((b.role as string) || "") * dir;
      }
      if (columnAccessor === "createdAt") {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      }
      return 0;
    });

    return sorted;
  }, [users, search, roleFilter, sortStatus]);

  const totalRecords = filtered.length;
  const pageRecords = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return filtered.slice(from, to);
  }, [filtered, page, pageSize]);

  function openRoleModal(user: AdminUserDTO) {
    setSelectedUser(user);
    setSelectedRole((user.role as AppRole) || "student");
    setRoleModalOpen(true);
  }

  async function handleSaveRole() {
    if (!selectedUser) return;
    setRoleModalSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Cannot update user");
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: selectedRole } : u
        )
      );
      setRoleModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Unknown error");
    } finally {
      setRoleModalSaving(false);
    }
  }

  async function handleSendReset(user: AdminUserDTO) {
    setResetSavingId(user.id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/resend-reset`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Cannot send reset link");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Unknown error");
    } finally {
      setResetSavingId(null);
    }
  }

  function openBanModal(user: AdminUserDTO) {
    setSelectedUser(user);
    setBanReason("");
    setBanModalOpen(true);
  }

  async function handleBanUnban() {
    if (!selectedUser) return;
    setBanSaving(true);
    setErrorMsg(null);
    try {
      const isBanned = !!selectedUser.banned;
      const url = isBanned
        ? `/api/admin/users/${selectedUser.id}/unban`
        : `/api/admin/users/${selectedUser.id}/ban`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: isBanned ? undefined : JSON.stringify({ reason: banReason }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Cannot update user status");
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                banned: isBanned ? false : true,
                banReason: isBanned ? null : banReason,
              }
            : u
        )
      );
      setBanModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Unknown error");
    } finally {
      setBanSaving(false);
    }
  }

  async function handleCreateUser() {
    setCreateSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: createEmail,
          name: createName,
          role: createRole,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Cannot create user");
      }
      setCreateModalOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreateRole("student");
      await fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Unknown error");
    } finally {
      setCreateSaving(false);
    }
  }

  return (
    <div className="panel mt-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Utilizatori</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestioneaza conturile aplicatiei.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 flex items-center rounded bg-danger-light p-3.5 text-danger dark:bg-danger-dark-light">
          <span className="pr-2">
            <strong className="mr-1">Eroare:</strong> {errorMsg}
          </span>
          <button
            type="button"
            className="ml-auto hover:opacity-80"
            onClick={() => setErrorMsg(null)}
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total utilizatori: {users.length}
        </div>
        <div className="flex flex-wrap items-center gap-3 md:ml-auto">
          <input
            type="text"
            className="form-input w-56"
            placeholder="Cauta dupa nume sau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select w-40"
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as "all" | AppRole)
            }
          >
            <option value="all">Toate rolurile</option>
            <option value="admin">Admin</option>
            <option value="tutore">Tutore</option>
            <option value="student">Student</option>
          </select>
          <button
            className="btn btn-primary flex items-center gap-1"
            onClick={() => setCreateModalOpen(true)}
          >
            <IconPlus className="h-4 w-4" />
            Create user
          </button>
        </div>
      </div>

      <div className="datatables">
        {pageRecords.length > 0 ? (
          <DataTable
            className="table-hover"
            records={pageRecords}
            fetching={loading}
            columns={[
              {
                accessor: "name",
                title: "Nume",
                sortable: true,
                render: (u) => (
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {u.name || "-"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {u.id}
                    </span>
                  </div>
                ),
              },
              {
                accessor: "email",
                title: "Email",
                sortable: true,
                render: (u) => (
                  <div className="flex flex-col">
                    <span>{u.email}</span>
                    <span className="text-xs text-gray-400">
                      {u.emailVerified ? "email verificat" : "email neverificat"}
                    </span>
                  </div>
                ),
              },
              {
                accessor: "role",
                title: "Rol",
                sortable: true,
                render: (u) => (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : u.role === "tutore"
                        ? "bg-info/10 text-info"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {u.role || "-"}
                  </span>
                ),
              },
              {
                accessor: "status",
                title: "Status",
                render: (u) =>
                  u.banned ? (
                    <span className="inline-flex items-center rounded-full bg-danger/10 px-3 py-1 text-xs font-medium text-danger">
                      Blocat
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                      Activ
                    </span>
                  ),
              },
              {
                accessor: "actions",
                title: "",
                textAlignment: "right",
                render: (u) => (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openRoleModal(u)}
                      className="btn btn-outline-primary btn-sm flex items-center gap-0.5"
                    >
                      <IconEdit className="h-4 w-4" />
                      Modificare rol
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendReset(u)}
                      className="btn btn-outline-secondary btn-sm px-2"
                      disabled={resetSavingId === u.id}
                    >
                      {resetSavingId === u.id
                        ? "Se trimite..."
                        : "Trimite resetare parola"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openBanModal(u)}
                      className={`btn btn-sm w-20 flex items-center gap-0.5 ${
                        u.banned ? "btn-success" : "btn-danger"
                      }`}
                    >
                      <IconLock className="h-4 w-4" />
                      {u.banned ? "Deblocare" : "Blocare"}
                    </button>
                  </div>
                ),
              },
            ]}
            totalRecords={totalRecords}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            minHeight={200}
            paginationText={({ from, to, totalRecords }) =>
              `Afisez ${from}-${to} din ${totalRecords} inregistrari`
            }
          />
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded border border-dashed border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-[#1b2333]/40">
            <IconDatabase className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {loading ? "Se incarca..." : "Nu exista utilizatori."}
            </span>
          </div>
        )}
      </div>

      <Transition appear show={roleModalOpen} as={Fragment}>
        <Dialog
          as="div"
          open={roleModalOpen}
          onClose={() => (!roleModalSaving ? setRoleModalOpen(false) : null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[black]/60 z-[999]" />
          </Transition.Child>
          <div className="fixed inset-0 z-[999] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  as="div"
                  className="panel my-10 w-full max-w-md overflow-hidden rounded-xl border border-slate-100/70 p-0 text-black shadow-xl dark:border-slate-800/60 dark:bg-[#0e1726] dark:text-white-dark"
                >
                  {/* header */}
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-6 py-4 dark:bg-[#121c2c]">
                    <h5 className="text-base font-semibold tracking-tight">Schimba rolul</h5>
                    <button
                      type="button"
                      className="text-slate-400 transition hover:text-slate-600 dark:text-slate-300 dark:hover:text-white"
                      onClick={() => (!roleModalSaving ? setRoleModalOpen(false) : null)}
                    >
                      <IconX className="h-5 w-5" />
                    </button>
                  </div>

                  {/* content */}
                  <div className="px-6 py-5 space-y-5">
                    {/* user info box */}
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-900/20">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {selectedUser?.name ?? "Utilizator fara nume"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {selectedUser?.email}
                          </p>
                        </div>
                        {selectedUser?.role ? (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            selectedUser.role=== "admin"
                            ? "bg-primary/10 text-primary"
                            : selectedUser.role === "tutore"
                            ? "bg-info/10 text-info"
                            : "bg-success/10 text-success"
                        }`}>
                          {selectedUser.role && selectedUser.role.toLowerCase()}
                        </span>
                        ) : null}
                      </div>
                    </div>

                    {/* select noul rol */}
                    <div className="space-y-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Alege rolul pe care vrei sa i-l atribui acestui utilizator.
                      </p>
                      <select
                        className="form-select w-full"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as AppRole)}
                      >
                        <option value="admin">Admin</option>
                        <option value="tutore">Tutore</option>
                      </select>
                    </div>
                  </div>

                  {/* footer */}
                  <div className="flex items-center justify-end gap-3 border-t border-white-light/10 px-6 py-4 dark:border-slate-800/60">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-5 py-2"
                      onClick={() => (!roleModalSaving ? setRoleModalOpen(false) : null)}
                      disabled={roleModalSaving}
                    >
                      Anuleaza
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-5 py-2"
                      onClick={handleSaveRole}
                      disabled={roleModalSaving}
                    >
                      {roleModalSaving ? "Se salveaza..." : "Salveaza"}
                    </button>
                  </div>
                </Dialog.Panel>

              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={banModalOpen} as={Fragment}>
        <Dialog
          as="div"
          open={banModalOpen}
          onClose={() => (!banSaving ? setBanModalOpen(false) : null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[black]/60 z-[999]" />
          </Transition.Child>
          <div className="fixed inset-0 z-[999] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  as="div"
                  className="panel my-10 w-full max-w-md overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark shadow-xl bg-white dark:bg-[#0e1726]"
                >
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-6 py-4 dark:bg-[#121c2c]">
                    <h5 className="text-xl font-semibold">
                      {selectedUser?.banned ? "Deblocheaza utilizator" : "Blocheaza utilizator"}
                    </h5>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={() => (!banSaving ? setBanModalOpen(false) : null)}
                    >
                      <IconX />
                    </button>
                  </div>
                  <div className="px-6 py-6 space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedUser?.email}
                    </p>
                    {!selectedUser?.banned && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Motiv (optional)</label>
                        <textarea
                          className="form-textarea w-full"
                          rows={3}
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-3 border-t border-white-light/10 px-6 py-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-5 py-2"
                      onClick={() => (!banSaving ? setBanModalOpen(false) : null)}
                      disabled={banSaving}
                    >
                      Anuleaza
                    </button>
                    <button
                      type="button"
                      className={selectedUser?.banned ? "btn btn-success px-5 py-2" : "btn btn-danger px-5 py-2"}
                      onClick={handleBanUnban}
                      disabled={banSaving}
                    >
                      {banSaving
                        ? "Se salveaza..."
                        : selectedUser?.banned
                        ? "Deblocheaza"
                        : "Blocheaza"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={createModalOpen} as={Fragment}>
        <Dialog
          as="div"
          open={createModalOpen}
          onClose={() => (!createSaving ? setCreateModalOpen(false) : null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[black]/60 z-[999]" />
          </Transition.Child>
          <div className="fixed inset-0 z-[999] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  as="div"
                  className="panel my-10 w-full max-w-md overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark shadow-xl bg-white dark:bg-[#0e1726]"
                >
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-6 py-4 dark:bg-[#121c2c]">
                    <h5 className="text-xl font-semibold">Creeaza utilizator</h5>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={() => (!createSaving ? setCreateModalOpen(false) : null)}
                    >
                      <IconX />
                    </button>
                  </div>
                  <div className="px-6 py-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nume</label>
                      <input
                        type="text"
                        className="form-input w-full"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        className="form-input w-full"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rol</label>
                      <select
                        className="form-select w-full"
                        value={createRole}
                        onChange={(e) =>
                          setCreateRole(e.target.value as AppRole)
                        }
                      >
                        <option value="tutore">Tutore</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 border-t border-white-light/10 px-6 py-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-5 py-2"
                      onClick={() => (!createSaving ? setCreateModalOpen(false) : null)}
                      disabled={createSaving}
                    >
                      Anuleaza
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-5 py-2"
                      onClick={handleCreateUser}
                      disabled={createSaving || !createEmail}
                    >
                      {createSaving ? "Se salveaza..." : "Salveaza"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
