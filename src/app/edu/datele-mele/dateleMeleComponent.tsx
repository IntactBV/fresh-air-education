'use client';

import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import IconUser from '@/components/icon/icon-user';
import IconMapPin from '@/components/icon/icon-map-pin';
import IconBook from '@faComponents/icon/icon-book';
import IconCreditCard from '@faComponents/icon/icon-credit-card';

// ===== Validari (Yup) =====
const phoneRegex = /^(\+4)?0?\s?7\d{2}\s?\d{3}\s?\d{3}$/;
const cnpRegex = /^\d{13}$/;
const serieRegex = /^[A-Z]{2}$/; // ex: 'PX'

const Schema = Yup.object().shape({
  // 1) Contact & Identificare
  email: Yup.string().email('Email invalid').required('Emailul este obligatoriu'),
  telefon: Yup.string().matches(phoneRegex, 'Telefon invalid').required('Telefonul este obligatoriu'),
  nume: Yup.string().required('Numele este obligatoriu'),
  prenume: Yup.string().required('Prenumele este obligatoriu'),
  gen: Yup.string().oneOf(['Masculin', 'Feminin'], 'Selecteaza o optiune').required('Genul este obligatoriu'),
  mediuResedinta: Yup.string().oneOf(['Urban', 'Rural'], 'Selecteaza o optiune').required('Mediul de rezidenta este obligatoriu'),

  // 2) Date personale & adresa
  cnp: Yup.string().matches(cnpRegex, 'CNP invalid (13 cifre)').required('CNP-ul este obligatoriu'),
  judet: Yup.string().required('Judetul este obligatoriu'),
  localitate: Yup.string().required('Localitatea este obligatorie'),
  strada: Yup.string().required('Strada este obligatorie'),

  // 3) Act de identitate (CI)
  serieCI: Yup.string().matches(serieRegex, 'Serie CI invalida (ex: PX)').required('Seria CI este obligatorie'),
  numarCI: Yup.string().required('Numarul CI este obligatoriu'),
  eliberatDe: Yup.string().required('Camp obligatoriu'),
  dataEliberarii: Yup.date()
    .max(new Date(), 'Data nu poate fi in viitor')
    .required('Data eliberarii este obligatorie'),

  // 4) Studiile
  institutie: Yup.string().required('Institutia este obligatorie'),
  facultate: Yup.string().required('Facultatea este obligatorie'),
  specializare: Yup.string().required('Domeniul/Specializarea este obligatorie'),
  ciclu: Yup.string().oneOf(['Licenta', 'Masterat'], 'Selecteaza o optiune').required('Ciclul este obligatoriu'),
});

// valori default (vor fi suprascrise dupa fetch)
const emptyValues = {
  // 1) Contact & Identificare
  email: '',
  telefon: '',
  nume: '',
  prenume: '',
  gen: '' as 'Masculin' | 'Feminin' | '',
  mediuResedinta: '' as 'Urban' | 'Rural' | '',

  // 2) Date personale & adresa
  cnp: '',
  judet: '',
  localitate: '',
  strada: '',

  // 3) Act de identitate (CI)
  serieCI: '',
  numarCI: '',
  eliberatDe: '',
  dataEliberarii: '',
  copieBuletin: null as File | null,
  copieBuletinNume: '',
  copieBuletinBlobId: '' as string | null,

  // 4) Studiile
  institutie: '',
  facultate: '',
  specializare: '',
  ciclu: '' as 'Licenta' | 'Masterat' | '',
};

export default function DateleMeleComponent() {
  const [tab, setTab] = useState<'contact' | 'adresa' | 'ci' | 'studii'>('contact');
  const [initialValues, setInitialValues] = useState(emptyValues);
  const [loading, setLoading] = useState(true);

  // fetch datele studentului
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/edu/my-data', { cache: 'no-store' });
        if (!res.ok) {
          // daca nu are application sau e eroare, lasam form-ul gol
          setLoading(false);
          return;
        }
        const data = await res.json();
        setInitialValues({
          email: data.email ?? '',
          telefon: data.telefon ?? '',
          nume: data.nume ?? '',
          prenume: data.prenume ?? '',
          gen: data.gen ?? '',
          mediuResedinta: data.mediuResedinta ?? '',
          cnp: data.cnp ?? '',
          judet: data.judet ?? '',
          localitate: data.localitate ?? '',
          strada: data.strada ?? '',
          serieCI: data.serieCI ?? '',
          numarCI: data.numarCI ?? '',
          eliberatDe: data.eliberatDe ?? '',
          dataEliberarii: data.dataEliberarii ?? '',
          copieBuletin: null,
          copieBuletinNume: data.copieBuletinNume ?? '',
          copieBuletinBlobId: data.copieBuletinBlobId ?? '',
          institutie: data.institutie ?? '',
          facultate: data.facultate ?? '',
          specializare: data.specializare ?? '',
          ciclu: data.ciclu ?? '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Se incarca datele tale…</div>;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={Schema}
      onSubmit={async (vals, { setSubmitting }) => {
        try {
          const res = await fetch('/api/edu/my-data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: vals.email,
              telefon: vals.telefon,
              nume: vals.nume,
              prenume: vals.prenume,
              gen: vals.gen,
              mediuResedinta: vals.mediuResedinta,
              cnp: vals.cnp,
              judet: vals.judet,
              localitate: vals.localitate,
              strada: vals.strada,
              serieCI: vals.serieCI,
              numarCI: vals.numarCI,
              eliberatDe: vals.eliberatDe,
              dataEliberarii: vals.dataEliberarii,
              institutie: vals.institutie,
              facultate: vals.facultate,
              specializare: vals.specializare,
              ciclu: vals.ciclu,
              // daca am urcat fișierul anterior, in vals avem copieBuletinBlobId
              copieBuletinBlobId: vals.copieBuletinBlobId || null,
            }),
          });

          if (!res.ok) {
            alert('Nu s-au putut salva datele.');
          } else {
            // poti pune un toast aici
          }
        } catch (err) {
          console.error(err);
          alert('Eroare la salvare.');
        } finally {
          setSubmitting(false);
        }
      }}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {({ errors, setFieldValue, submitCount, values, isSubmitting }) => {
        const klass = (name: string) => {
          const hasErr = (errors as any)[name];
          return submitCount > 0 && hasErr ? 'has-error' : '';
        };
        const Err = ({ name }: { name: string }) => {
          const msg = (errors as any)[name];
          return submitCount > 0 && msg ? <div className="mt-1 text-danger">{String(msg)}</div> : null;
        };

        // upload pentru copie buletin
        const handleUploadCopie = async (file: File | null) => {
          if (!file) return;
          const fd = new FormData();
          // pastram același nume de Camp ca in formularul public
          fd.append('copie_buletin', file);

          const res = await fetch('/api/edu/my-data/upload', {
            method: 'POST',
            body: fd,
          });

          if (!res.ok) {
            alert('Nu s-a putut incarca fisierul.');
            return;
          }

          const data = await res.json();
          // setam in formular id-ul blob-ului și numele
          setFieldValue('copieBuletinBlobId', data.blobId);
          setFieldValue('copieBuletinNume', data.filename);
          // nu mai pastram obiectul File in state
          setFieldValue('copieBuletin', null);
        };

        return (
          <Form className="space-y-6" noValidate>
            {/* Tabs header */}
            <div>
              <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
                <li className="inline-block">
                  <button
                    type="button"
                    onClick={() => setTab('contact')}
                    className={`group flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                      tab === 'contact' ? '!border-primary text-primary' : ''
                    }`}
                  >
                    <IconUser className="shrink-0 group-hover:!text-primary" />
                    Contact & Identificare
                  </button>
                </li>
                <li className="inline-block">
                  <button
                    type="button"
                    onClick={() => setTab('adresa')}
                    className={`group flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                      tab === 'adresa' ? '!border-primary text-primary' : ''
                    }`}
                  >
                    <IconMapPin className="shrink-0 group-hover:!text-primary" />
                    Date personale & adresa
                  </button>
                </li>
                <li className="inline-block">
                  <button
                    type="button"
                    onClick={() => setTab('ci')}
                    className={`group flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                      tab === 'ci' ? '!border-primary text-primary' : ''
                    }`}
                  >
                    <IconCreditCard className="shrink-0 group-hover:!text-primary" />
                    Act de identitate (CI)
                  </button>
                </li>
                <li className="inline-block">
                  <button
                    type="button"
                    onClick={() => setTab('studii')}
                    className={`group flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                      tab === 'studii' ? '!border-primary text-primary' : ''
                    }`}
                  >
                    <IconBook className="shrink-0 group-hover:!text-primary" />
                    Studiile
                  </button>
                </li>
              </ul>
            </div>

            {/* === 1) Contact & Identificare === */}
            {tab === 'contact' && (
              <div className="panel rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
                <h6 className="mb-5 text-lg font-bold">Contact & Identificare</h6>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className={klass('email')}>
                    <label htmlFor="email">Email</label>
                    <Field id="email" name="email" type="email" placeholder="nume@exemplu.ro" className="form-input" />
                    <Err name="email" />
                  </div>
                  <div className={klass('telefon')}>
                    <label htmlFor="telefon">Telefon</label>
                    <Field id="telefon" name="telefon" type="tel" placeholder="07xx xxx xxx" className="form-input" />
                    <Err name="telefon" />
                  </div>
                  <div className={klass('gen')}>
                    <label htmlFor="gen">Gen</label>
                    <Field as="select" id="gen" name="gen" className="form-select">
                      <option value="">Selecteaza</option>
                      <option value="Masculin">Masculin</option>
                      <option value="Feminin">Feminin</option>
                    </Field>
                    <Err name="gen" />
                  </div>
                  <div className={klass('nume')}>
                    <label htmlFor="nume">Nume</label>
                    <Field id="nume" name="nume" type="text" placeholder="Nume" className="form-input" />
                    <Err name="nume" />
                  </div>
                  <div className={klass('prenume')}>
                    <label htmlFor="prenume">Prenume</label>
                    <Field id="prenume" name="prenume" type="text" placeholder="Prenume" className="form-input" />
                    <Err name="prenume" />
                  </div>
                  <div className={klass('mediuResedinta')}>
                    <label htmlFor="mediuResedinta">Mediul de rezidenta</label>
                    <Field as="select" id="mediuResedinta" name="mediuResedinta" className="form-select">
                      <option value="">Selecteaza</option>
                      <option value="Urban">Urban</option>
                      <option value="Rural">Rural</option>
                    </Field>
                    <Err name="mediuResedinta" />
                  </div>
                </div>
                <div className="mt-6">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Se salveaza...' : 'Salveaza'}
                  </button>
                </div>
              </div>
            )}

            {/* === 2) Date personale & adresa === */}
            {tab === 'adresa' && (
              <div className="panel rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
                <h6 className="mb-5 text-lg font-bold">Date personale & adresa</h6>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className={klass('cnp')}>
                    <label htmlFor="cnp">CNP</label>
                    <Field id="cnp" name="cnp" type="text" placeholder="13 cifre" className="form-input" />
                    <Err name="cnp" />
                  </div>
                  <div className={klass('judet')}>
                    <label htmlFor="judet">Judet</label>
                    <Field id="judet" name="judet" type="text" placeholder="ex: Cluj" className="form-input" />
                    <Err name="judet" />
                  </div>
                  <div className={klass('localitate')}>
                    <label htmlFor="localitate">Localitate</label>
                    <Field id="localitate" name="localitate" type="text" placeholder="ex: Cluj-Napoca" className="form-input" />
                    <Err name="localitate" />
                  </div>

                  <div className={`md:col-span-3 ${klass('strada')}`}>
                    <label htmlFor="strada">Strada</label>
                    <Field
                      id="strada"
                      name="strada"
                      type="text"
                      placeholder="Strada, nr., bloc, sc., ap."
                      className="form-input"
                    />
                    <Err name="strada" />
                  </div>
                </div>
                <div className="mt-6">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Se salveaza...' : 'Salveaza'}
                  </button>
                </div>
              </div>
            )}

            {/* === 3) Act de identitate (CI) === */}
            {tab === 'ci' && (
              <div className="panel rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
                <h6 className="mb-5 text-lg font-bold">Act de identitate (CI)</h6>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className={klass('serieCI')}>
                    <label htmlFor="serieCI">Serie CI</label>
                    <Field id="serieCI" name="serieCI" type="text" placeholder="PX" className="form-input uppercase" />
                    <Err name="serieCI" />
                  </div>
                  <div className={klass('numarCI')}>
                    <label htmlFor="numarCI">Numar CI</label>
                    <Field id="numarCI" name="numarCI" type="text" placeholder="ex: 123456" className="form-input" />
                    <Err name="numarCI" />
                  </div>
                  <div className={klass('eliberatDe')}>
                    <label htmlFor="eliberatDe">Eliberat de</label>
                    <Field id="eliberatDe" name="eliberatDe" type="text" placeholder="ex: SPCLEP Cluj" className="form-input" />
                    <Err name="eliberatDe" />
                  </div>

                  <div className={klass('dataEliberarii')}>
                    <label htmlFor="dataEliberarii">Data eliberarii</label>
                    <Field id="dataEliberarii" name="dataEliberarii" type="date" className="form-input" />
                    <Err name="dataEliberarii" />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="copieBuletin">Copie buletin (PDF/JPG/PNG)</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        id="copieBuletin"
                        name="copieBuletin"
                        type="file"
                        className="form-input file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={async (e) => {
                          const file = e.currentTarget.files ? e.currentTarget.files[0] : null;
                          if (file) {
                            await handleUploadCopie(file);
                          }
                        }}
                      />

                      {/* Afișare nume fișier existent */}
                      {values.copieBuletinNume ? (
                        <span className="text-sm text-white-dark">
                          Fișier salvat: <strong>{values.copieBuletinNume}</strong>
                        </span>
                      ) : (
                        <span className="text-xs text-white-dark/60">Nu ai incarcat inca un fișier.</span>
                      )}
                    </div>

                    <Err name="copieBuletin" />
                  </div>
                </div>
                <div className="mt-6">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Se salveaza...' : 'Salveaza'}
                  </button>
                </div>
              </div>
            )}

            {/* === 4) Studiile === */}
            {tab === 'studii' && (
              <div className="panel rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
                <h6 className="mb-5 text-lg font-bold">Studiile (institutie & program)</h6>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className={klass('institutie')}>
                    <label htmlFor="institutie">Institutie de invatamant — Denumire</label>
                    <Field id="institutie" name="institutie" type="text" placeholder="ex: Universitatea X" className="form-input" />
                    <Err name="institutie" />
                  </div>
                  <div className={klass('facultate')}>
                    <label htmlFor="facultate">Facultate</label>
                    <Field id="facultate" name="facultate" type="text" placeholder="ex: Facultatea de ..." className="form-input" />
                    <Err name="facultate" />
                  </div>
                  <div className={klass('specializare')}>
                    <label htmlFor="specializare">Domeniul / Specializarea</label>
                    <Field id="specializare" name="specializare" type="text" placeholder="ex: Informatica" className="form-input" />
                    <Err name="specializare" />
                  </div>

                  <div className={klass('ciclu')}>
                    <label htmlFor="ciclu">Ciclul</label>
                    <Field as="select" id="ciclu" name="ciclu" className="form-select">
                      <option value="">Selecteaza</option>
                      <option value="Licenta">Licenta</option>
                      <option value="Masterat">Masterat</option>
                    </Field>
                    <Err name="ciclu" />
                  </div>
                </div>
                <div className="mt-6">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Se salveaza...' : 'Salveaza'}
                  </button>
                </div>
              </div>
            )}
          </Form>
        );
      }}
    </Formik>
  );
}
