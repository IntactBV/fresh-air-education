"use client";
import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";

// Iconițe Vristo deja existente în proiect
import IconBook from "@/components/icon/icon-book";
import IconEdit from "@/components/icon/icon-edit";
import IconAward from "@/components/icon/icon-award";
import IconArchive from "@/components/icon/icon-archive";
import IconCalendar from "@/components/icon/icon-calendar";

interface UploadedDoc {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  sizeKB: number;
}

const mockStudent = {
  fullName: "Popescu Andrei-Ionuț",
  cnp: "1234567890123",
  faculty: "FMI — Universitatea București",
  year: "Anul 3",
  program: "Informatică",
  email: "andrei.popescu@student.univ.ro",
};

function bytesToKB(b: number) {
  return Math.round(b / 1024);
}

function formatDate(dt: string) {
  try {
    const d = new Date(dt);
    return d.toLocaleDateString("ro-RO", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dt;
  }
}

const ACCEPTED_MIMES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_SIZE = 10 * 1024 * 1024;

export default function PaginaDocumenteleMele() {
  const [studentCert, setStudentCert] = useState<UploadedDoc | null>(null);
  const [declaratieSemnata, setDeclaratieSemnata] = useState<UploadedDoc | null>(null);
  const [adminCert, setAdminCert] = useState<UploadedDoc | null>({
    id: "adm-1",
    name: "Adeverinta-finalizare-stagiu.pdf",
    url: "/static/docs/adeverinta-finalizare-exemplu.pdf",
    uploadedAt: new Date().toISOString(),
    sizeKB: 256,
  });

  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputStudentRef = useRef<HTMLInputElement>(null);
  const inputDeclaratieRef = useRef<HTMLInputElement>(null);

  const declaratieAutoURL = useMemo(() => {
    return "/static/docs/declaratie-pe-propria-raspundere-exemplu.pdf";
  }, []);

  function validateFile(file?: File): string | null {
    if (!file) return "Nu s-a selectat niciun fișier.";
    if (!ACCEPTED_MIMES.includes(file.type)) return "Format neacceptat. Te rugăm să încarci PDF, PNG sau JPG.";
    if (file.size > MAX_SIZE) return "Fișierul depășește limita de 10MB.";
    return null;
  }

  async function fakeUpload(file: File): Promise<{ url: string }>{
    await new Promise((r) => setTimeout(r, 700));
    const blobUrl = URL.createObjectURL(file);
    return { url: blobUrl };
  }

  async function handleUpload(section: "student" | "declaratie", file?: File) {
    setError(null);
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      setUploading(section);
      const res = await fakeUpload(file!);
      const doc: UploadedDoc = {
        id: `${section}-${Date.now()}`,
        name: file!.name,
        url: res.url,
        uploadedAt: new Date().toISOString(),
        sizeKB: bytesToKB(file!.size),
      };
      if (section === "student") setStudentCert(doc);
      if (section === "declaratie") setDeclaratieSemnata(doc);
    } catch (e) {
      setError("Încărcarea a eșuat. Încearcă din nou.");
    } finally {
      setUploading(null);
    }
  }

  function handleRemove(section: "student" | "declaratie") {
    if (section === "student") setStudentCert(null);
    if (section === "declaratie") setDeclaratieSemnata(null);
  }

  function PanelHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
    return (
      <div className="flex items-center gap-3">
        <div className="shrink-0 inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
    );
  }

  function DocMeta({ doc }: { doc: UploadedDoc }) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="badge bg-success/10 text-success">Încărcat</span>
        <span>
          {formatDate(doc.uploadedAt)} · {doc.sizeKB} KB
        </span>
      </div>
    );
  }

  // Butoane pe un rând nou, aliniate la dreapta
  function ButtonRowRight({ children }: { children: React.ReactNode }) {
    return (
      <div className="mt-4 md:mt-6 flex flex-wrap justify-end gap-2 md:gap-3">
        {children}
      </div>
    );
  }

  function PrimaryButton({ disabled, onClick, children }: any) {
    return (
      <button disabled={disabled} onClick={onClick} className="btn btn-primary min-w-[180px]">
        {children}
      </button>
    );
  }
  function OutlineButton({ href, onClick, children, variant = "primary" }: any) {
    const base = variant === "danger" ? "btn-outline-danger" : variant === "info" ? "btn-outline-info" : "btn-outline-primary";
    const props = href ? { href, target: "_blank", rel: "noreferrer" } : { onClick };
    const Tag: any = href ? "a" : "button";
    return (
      <Tag className={`btn min-w-[180px] ${base}`} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconArchive className="text-primary" />
          <div>
            <h1 className="text-xl font-semibold leading-tight">Documentele mele</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Încarcă, vizualizează și descarcă documentele tale oficiale pentru stagiul de practică.</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <IconCalendar />
          <span>Ultima actualizare: {formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <div className="flex items-start gap-2">
            <span className="font-semibold">Eroare:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 1) Adeverință de student — UN RAND COMPLET, O SINGURĂ COLONĂ */}
      <div className="panel w-full">
        <div className="panel-heading">
          <PanelHeader
            icon={<IconBook />}
            title="Adeverință de student"
            subtitle="Document emis de facultate. Îl poți încărca în format PDF sau imagine."
          />
        </div>
        <div className="panel-body flex flex-col gap-7 pt-2 md:pt-4">
          {/* conținut */}
          <div className="space-y-3">
            {studentCert ? (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium">{studentCert.name}</div>
                <DocMeta doc={studentCert} />
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">Nu există un fișier încărcat încă.</div>
            )}
          </div>
          {/* butoane la dreapta, pe ultimul rând */}
          <ButtonRowRight>
            <PrimaryButton disabled={uploading === "student"} onClick={() => inputStudentRef.current?.click()}>
              {uploading === "student" ? "Se încarcă…" : "Încarcă adeverința"}
            </PrimaryButton>
            {studentCert && <OutlineButton href={studentCert.url}>Vezi / Descarcă</OutlineButton>}
            {studentCert && <OutlineButton onClick={() => handleRemove("student")} variant="danger">Șterge</OutlineButton>}
          </ButtonRowRight>
          <input
            ref={inputStudentRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              await handleUpload("student", file);
              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      {/* 2) Declarație pe propria răspundere — UN RAND COMPLET, O SINGURĂ COLONĂ */}
      <div className="panel w-full">
        <div className="panel-heading">
          <PanelHeader
            icon={<IconEdit />}
            title="Declarație pe propria răspundere"
            subtitle="Se generează automat din datele tale. Poți descărca modelul și/sau încărca varianta semnată."
          />
        </div>
        <div className="panel-body flex flex-col gap-7 pt-2 md:pt-4">
          {/* Date folosite la generare */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-xs">
            <div className="font-medium text-sm mb-2">Date folosite la generare</div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-slate-600 dark:text-slate-300">
              <li><span className="text-slate-500 dark:text-slate-400">Nume complet:</span> {mockStudent.fullName}</li>
              <li><span className="text-slate-500 dark:text-slate-400">CNP:</span> {mockStudent.cnp}</li>
              <li><span className="text-slate-500 dark:text-slate-400">Facultate:</span> {mockStudent.faculty}</li>
              <li><span className="text-slate-500 dark:text-slate-400">Program:</span> {mockStudent.program}</li>
              <li><span className="text-slate-500 dark:text-slate-400">An studiu:</span> {mockStudent.year}</li>
              <li><span className="text-slate-500 dark:text-slate-400">Email:</span> {mockStudent.email}</li>
            </ul>
          </div>

          {/* Declarație semnată */}
          <div className="space-y-3">
            {declaratieSemnata ? (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium">{declaratieSemnata.name}</div>
                <DocMeta doc={declaratieSemnata} />
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">Nu ai încărcat încă declarația semnată.</div>
            )}
          </div>

          {/* butoane la dreapta, pe ultimul rând */}
          <ButtonRowRight>
            <OutlineButton href={declaratieAutoURL}>Descarcă declarația generată</OutlineButton>
            <PrimaryButton onClick={() => alert("Regenerare simulată")}>Re-generează</PrimaryButton>
            <PrimaryButton disabled={uploading === "declaratie"} onClick={() => inputDeclaratieRef.current?.click()}>
              {uploading === "declaratie" ? "Se încarcă…" : "Încarcă declarația semnată"}
            </PrimaryButton>
            {declaratieSemnata && <OutlineButton href={declaratieSemnata.url}>Vezi / Descarcă</OutlineButton>}
            {declaratieSemnata && <OutlineButton onClick={() => handleRemove("declaratie")} variant="danger">Șterge</OutlineButton>}
          </ButtonRowRight>

          <input
            ref={inputDeclaratieRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              await handleUpload("declaratie", file);
              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      {/* 3) Adeverință de finalizare a stagiului — UN RAND COMPLET, O SINGURĂ COLONĂ */}
      <div className="panel w-full">
        <div className="panel-heading">
          <PanelHeader
            icon={<IconAward />}
            title="Adeverință de finalizare a stagiului"
            subtitle="Încărcată de administrator după validare. Doar vizualizare pentru student."
          />
        </div>
        <div className="panel-body flex flex-col gap-7 pt-2 md:pt-4">
          {/* Conținut */}
          <div className="space-y-3">
            {adminCert ? (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium">{adminCert.name}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="badge bg-info/10 text-info">Disponibil</span>
                  <span>{formatDate(adminCert.uploadedAt)} · {adminCert.sizeKB} KB</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">Momentan nu există adeverință de finalizare disponibilă.</div>
            )}
          </div>

          {/* butoane la dreapta, pe ultimul rând */}
          <ButtonRowRight>
            {adminCert && <OutlineButton href={adminCert.url}>Vezi / Descarcă</OutlineButton>}
          </ButtonRowRight>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        <p className="mb-1">Notă:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Formatele acceptate: PDF, PNG, JPG. Dimensiune maximă: 10MB per fișier.</li>
          <li>Asigură-te că documentele sunt lizibile și conțin toate paginile necesare.</li>
          <li>Declarația pe propria răspundere se completează automat pe baza datelor tale. Dacă datele sunt greșite, actualizează-le în secțiunea „Datele mele”.</li>
        </ul>
      </div>
    </div>
  );
}