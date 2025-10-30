'use client';

import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import IconUser from '@/components/icon/icon-user';
import IconMapPin from '@/components/icon/icon-map-pin';
import IconBook from '@faComponents/icon/icon-book';
import IconCreditCard from '@faComponents/icon/icon-credit-card';

/** ===== Validări (Yup) ===== */
const phoneRegex = /^(\+4)?0?\s?7\d{2}\s?\d{3}\s?\d{3}$/;
const cnpRegex = /^\d{13}$/;
const serieRegex = /^[A-Z]{2}$/; // ex: 'PX'

const Schema = Yup.object().shape({
  // 1) Contact & Identificare
  email: Yup.string().email('Email invalid').required('Emailul este obligatoriu'),
  telefon: Yup.string().matches(phoneRegex, 'Telefon invalid').required('Telefonul este obligatoriu'),
  nume: Yup.string().required('Numele este obligatoriu'),
  prenume: Yup.string().required('Prenumele este obligatoriu'),
  gen: Yup.string().oneOf(['Masculin', 'Feminin'], 'Selectează o opțiune').required('Genul este obligatoriu'),
  mediuResedinta: Yup.string().oneOf(['Urban', 'Rural'], 'Selectează o opțiune').required('Mediul de rezidență este obligatoriu'),

  // 2) Date personale & adresă
  cnp: Yup.string().matches(cnpRegex, 'CNP invalid (13 cifre)').required('CNP-ul este obligatoriu'),
  judet: Yup.string().required('Județul este obligatoriu'),
  localitate: Yup.string().required('Localitatea este obligatorie'),
  strada: Yup.string().required('Strada este obligatorie'),

  // 3) Act de identitate (CI)
  serieCI: Yup.string().matches(serieRegex, 'Serie CI invalidă (ex: PX)').required('Seria CI este obligatorie'),
  numarCI: Yup.string().required('Numărul CI este obligatoriu'),
  eliberatDe: Yup.string().required('Câmp obligatoriu'),
  dataEliberarii: Yup.date()
    .max(new Date(), 'Data nu poate fi în viitor')
    .required('Data eliberării este obligatorie'),

  copieBuletin: Yup.mixed()
    .test('fileOrExisting', 'Încărcarea copiei este obligatorie', function (value) {
      const { copieBuletinNume } = this.parent as any;
      return Boolean(value) || Boolean(copieBuletinNume);
    })
    .test('fileType', 'Format acceptat: PDF/JPG/PNG', (value: any) => {
      if (!value) return true; // dacă există deja un fișier salvat, e ok
      const file = Array.isArray(value) ? value[0] : value;
      const types = ['application/pdf', 'image/jpeg', 'image/png'];
      return file && types.includes(file.type);
    }),

  // 4) Studiile
  institutie: Yup.string().required('Instituția este obligatorie'),
  facultate: Yup.string().required('Facultatea este obligatorie'),
  specializare: Yup.string().required('Domeniul/Specializarea este obligatorie'),
  ciclu: Yup.string().oneOf(['Licență', 'Masterat'], 'Selectează o opțiune').required('Ciclul este obligatoriu'),
});

/** ===== Valori statice (prepopulate & editabile) ===== */
const initialValues = {
  // 1) Contact & Identificare
  email: 'andrei.popescu@example.ro',
  telefon: '0722 123 456',
  nume: 'Popescu',
  prenume: 'Andrei',
  gen: 'Masculin' as 'Masculin' | 'Feminin' | '',
  mediuResedinta: 'Urban' as 'Urban' | 'Rural' | '',

  // 2) Date personale & adresă
  cnp: '1980101123456',
  judet: 'Cluj',
  localitate: 'Cluj-Napoca',
  strada: 'Str. Memorandumului nr. 15, ap. 12',

  // 3) Act de identitate (CI)
  serieCI: 'PX',
  numarCI: '123456',
  eliberatDe: 'SPCLEP Cluj-Napoca',
  dataEliberarii: '2022-05-20', // yyyy-mm-dd
  copieBuletin: null as File | null,
  copieBuletinNume: 'CI_Popescu_Andrei.pdf',
  copieBuletinUrl: '/uploads/CI_Popescu_Andrei.pdf',

  // 4) Studiile
  institutie: 'Universitatea Babeș-Bolyai',
  facultate: 'Facultatea de Matematică și Informatică',
  specializare: 'Informatică',
  ciclu: 'Licență' as 'Licență' | 'Masterat' | '',
};

export default function DateleMeleComponent() {
  const [tab, setTab] = useState<'contact' | 'adresa' | 'ci' | 'studii'>('contact');

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Schema}
      onSubmit={(vals) => {
        console.log('Date salvate:', vals);
      }}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {({ errors, setFieldValue, submitCount, values }) => {
        const klass = (name: string) => {
        const hasErr = (errors as any)[name];
        return submitCount > 0 && hasErr ? 'has-error' : '';
        };
        const Err = ({ name }: { name: string }) => {
        const msg = (errors as any)[name];
        return submitCount > 0 && msg ? <div className="mt-1 text-danger">{String(msg)}</div> : null;
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
                    Date personale & adresă
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
                <h6 className="mb-5 text-lg font-bold">1) Contact & Identificare</h6>
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
                      <option value="">Selectează</option>
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
                    <label htmlFor="mediuResedinta">Mediul de rezidență</label>
                    <Field as="select" id="mediuResedinta" name="mediuResedinta" className="form-select">
                      <option value="">Selectează</option>
                      <option value="Urban">Urban</option>
                      <option value="Rural">Rural</option>
                    </Field>
                    <Err name="mediuResedinta" />
                  </div>
                </div>
                <div className="mt-6">
                  <button type="submit" className="btn btn-primary">Salvează</button>
                </div>
              </div>
            )}

            {/* === 2) Date personale & adresă === */}
            {tab === 'adresa' && (
              <div className="panel rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
                <h6 className="mb-5 text-lg font-bold">2) Date personale & adresă</h6>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className={klass('cnp')}>
                    <label htmlFor="cnp">CNP</label>
                    <Field id="cnp" name="cnp" type="text" placeholder="13 cifre" className="form-input" />
                    <Err name="cnp" />
                  </div>
                  <div className={klass('judet')}>
                    <label htmlFor="judet">Județ</label>
                    <Field id="judet" name="judet" type="text" placeholder="ex: Cluj" className="form-input" />
                    <Err name="judet" />
                  </div>
                  <div className={klass('localitate')}>
                    <label htmlFor="localitate">Localitate</label>
                    <Field id="localitate" name="localitate" type="text" placeholder="ex: Cluj-Napoca" className="form-input" />
                    <Err name="localitate" />
                  </div>

                  <div className={`md:col-span-3 ${klass('strada')}`}>
                    <label htmlFor="strada">Stradă</label>
                    <Field
                      id="strada"
                      name="strada"
                      type="text"
                      placeholder="Stradă, nr., bloc, sc., ap."
                      className="form-input"
                    />
                    <Err name="strada" />
                  </div>
                </div>
                <div className="mt-6">
                  <button type="submit" className="btn btn-primary">Salvează</button>
                </div>
              </div>
            )}

            {/* === 3) Act de identitate (CI) === */}
            {tab === 'ci' && (
              <div className="panel rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
                <h6 className="mb-5 text-lg font-bold">3) Act de identitate (CI)</h6>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className={klass('serieCI')}>
                    <label htmlFor="serieCI">Serie CI</label>
                    <Field id="serieCI" name="serieCI" type="text" placeholder="PX" className="form-input uppercase" />
                    <Err name="serieCI" />
                  </div>
                  <div className={klass('numarCI')}>
                    <label htmlFor="numarCI">Număr CI</label>
                    <Field id="numarCI" name="numarCI" type="text" placeholder="ex: 123456" className="form-input" />
                    <Err name="numarCI" />
                  </div>
                  <div className={klass('eliberatDe')}>
                    <label htmlFor="eliberatDe">Eliberat de</label>
                    <Field id="eliberatDe" name="eliberatDe" type="text" placeholder="ex: SPCLEP Sector 1" className="form-input" />
                    <Err name="eliberatDe" />
                  </div>

                  <div className={klass('dataEliberarii')}>
                    <label htmlFor="dataEliberarii">Data eliberării</label>
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
                        onChange={(e) => {
                            const file = e.currentTarget.files ? e.currentTarget.files[0] : null;
                            setFieldValue('copieBuletin', file);
                            if (file) {
                            // suprascrie numele stocat cu numele fișierului nou selectat
                            setFieldValue('copieBuletinNume', file.name);
                            }
                        }}
                        />

                        {/* Afișare nume fișier selectat sau existent */}
                        {values.copieBuletin ? (
                        <span className="text-sm text-white-dark">
                            Fișier selectat: <strong>{(values.copieBuletin as File).name}</strong>
                        </span>
                        ) : values.copieBuletinNume ? (
                        <span className="text-sm text-white-dark">
                            {initialValues.copieBuletinUrl ? (
                            <a
                                href={initialValues.copieBuletinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary underline"
                            >
                                {values.copieBuletinNume}
                            </a>
                            ) : (
                            <strong>{values.copieBuletinNume}</strong>
                            )}
                            <span className="ml-2 text-xs text-white-dark/70">
                            (poți încărca un fișier nou pentru a-l înlocui)
                            </span>
                        </span>
                        ) : null}
                    </div>

                    {/* eroare de validare pentru fișier */}
                    <Err name="copieBuletin" />
                    </div>
                </div>
                <div className="mt-6">
                  <button type="submit" className="btn btn-primary">Salvează</button>
                </div>
              </div>
            )}

            {/* === 4) Studiile === */}
            {tab === 'studii' && (
              <div className="panel rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
                <h6 className="mb-5 text-lg font-bold">4) Studiile (instituție & program)</h6>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className={klass('institutie')}>
                    <label htmlFor="institutie">Instituție de învățământ — Denumire</label>
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
                    <Field id="specializare" name="specializare" type="text" placeholder="ex: Informatică" className="form-input" />
                    <Err name="specializare" />
                  </div>

                  <div className={klass('ciclu')}>
                    <label htmlFor="ciclu">Ciclul</label>
                    <Field as="select" id="ciclu" name="ciclu" className="form-select">
                      <option value="">Selectează</option>
                      <option value="Licență">Licență</option>
                      <option value="Masterat">Masterat</option>
                    </Field>
                    <Err name="ciclu" />
                  </div>
                </div>
                <div className="mt-6">
                  <button type="submit" className="btn btn-primary">Salvează</button>
                </div>
              </div>
            )}
          </Form>
        );
      }}
    </Formik>
  );
}
