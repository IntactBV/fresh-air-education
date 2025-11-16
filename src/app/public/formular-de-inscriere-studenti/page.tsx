// src/app/public/formular-de-inscriere-studenti/page.tsx
'use client';
import IconHome from '@faComponents/icon/icon-home';
import { Formik, Form, Field } from 'formik';
import Link from 'next/link';
import React from 'react';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

const FormularInscriereStudenti = () => {
    // validari de baza
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
        eliberatDe: Yup.string().required('Câmp obligatoriu'),
        dataEliberarii: Yup.date().max(new Date(), 'Data nu poate fi in viitor').required('Data eliberarii este obligatorie'),
        copieBuletin: Yup.mixed()
            .required('Incarcarea copiei este obligatorie')
            .test('fileType', 'Format acceptat: PDF/JPG/PNG', (value: any) => {
                if (!value) return false;
                const file = Array.isArray(value) ? value[0] : value;
                const types = ['application/pdf', 'image/jpeg', 'image/png'];
                return file && types.includes(file.type);
            }),

        // 4) Studiile
        institutie: Yup.string().required('Institutia este obligatorie'),
        facultate: Yup.string().required('Facultatea este obligatorie'),
        specializare: Yup.string().required('Domeniul/Specializarea este obligatorie'),
        ciclu: Yup.string().oneOf(['Licenta', 'Masterat'], 'Selecteaza o optiune').required('Ciclul este obligatoriu'),

        // 5) Consimtaminte
        agree: Yup.bool().oneOf([true], 'Trebuie sa fii de acord inainte de trimitere.'),
        terms: Yup.bool().oneOf([true], 'Trebuie sa accepti Termenii si Conditiile.'),
    });

    return (
        <div>
            {/* breadcrumb */}
            <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="/public" className="text-primary hover:underline">
                        <IconHome className="h-4 w-4" />
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Formular de inscriere studenti</span>
                </li>
            </ul>

            <div
                className="relative rounded-t-md bg-primary-light 
                bg-[url('/assets/images/knowledge/pattern.png')] 
                bg-[length:800px_auto]
                bg-repeat
                px-5 py-10 dark:bg-black md:px-10"
            >
                <div className="mb-2 text-center text-2xl font-bold p-10 dark:text-white md:text-5xl">
                    Formular de Inscriere Studenti
                </div>

                <Formik
                    initialValues={{
                        // 1) Contact & Identificare
                        email: '',
                        telefon: '',
                        nume: '',
                        prenume: '',
                        gen: '',
                        mediuResedinta: '',

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
                        copieBuletin: null as any,

                        // 4) Studiile
                        institutie: '',
                        facultate: '',
                        specializare: '',
                        ciclu: '',

                        // 5) Consimtaminte
                        agree: false,
                        terms: false,
                    }}
                    validationSchema={Schema}
                    validateOnBlur={true}
                    validateOnChange={true}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            const formData = new FormData();

                            // mapam la denumirile din backend (snake_case)
                            formData.append('email', values.email);
                            formData.append('telefon', values.telefon);
                            formData.append('nume', values.nume);
                            formData.append('prenume', values.prenume);
                            formData.append('gen', values.gen);
                            formData.append('mediu_resedinta', values.mediuResedinta);

                            formData.append('cnp', values.cnp);
                            formData.append('judet', values.judet);
                            formData.append('localitate', values.localitate);
                            formData.append('strada', values.strada);

                            formData.append('serie_ci', values.serieCI);
                            formData.append('numar_ci', values.numarCI);
                            formData.append('eliberat_de', values.eliberatDe);
                            formData.append('data_eliberarii', values.dataEliberarii);

                            formData.append('institutie', values.institutie);
                            formData.append('facultate', values.facultate);
                            formData.append('specializare', values.specializare);
                            formData.append('ciclu', values.ciclu);

                            formData.append('agree', values.agree ? 'true' : 'false');
                            formData.append('terms', values.terms ? 'true' : 'false');

                            if (values.copieBuletin) {
                                formData.append('copie_buletin', values.copieBuletin);
                            }

                            const res = await fetch('/api/student-applications', {
                                method: 'POST',
                                body: formData,
                            });

                            if (!res.ok) {
                                const data = await res.json().catch(() => ({}));
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Eroare',
                                    text: data?.error || 'A aparut o eroare la trimitere.',
                                });
                            } else {
                                const data = await res.json();
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Cererea a fost trimisa!',
                                    text: 'Un administrator va verifica inscrierea ta.',
                                    timer: 3000,
                                });
                                // daca vrei sa cureti formularul:
                                resetForm();
                            }
                        } catch (err) {
                            console.error(err);
                            Swal.fire({
                                icon: 'error',
                                title: 'Eroare',
                                text: 'A aparut o eroare la trimitere.',
                            });
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, touched, submitCount, values, setFieldValue, isSubmitting }) => {
                        const groups: Record<number, string[]> = {
                            1: ['email', 'telefon', 'nume', 'prenume', 'gen', 'mediuResedinta'],
                            2: ['cnp', 'judet', 'localitate', 'strada'],
                            3: ['serieCI', 'numarCI', 'eliberatDe', 'dataEliberarii', 'copieBuletin'],
                            4: ['institutie', 'facultate', 'specializare', 'ciclu'],
                            5: ['agree', 'terms'],
                        };

                        const isFilled = (name: string) => {
                            const v: any = (values as any)[name];
                            if (name === 'copieBuletin') return !!v;
                            if (typeof v === 'boolean') return v === true;
                            return v !== undefined && v !== null && String(v).trim() !== '';
                        };
                        const hasError = (name: string) =>
                            Boolean((errors as any)[name]) && (Boolean((touched as any)[name]) || isFilled(name));
                        const fieldOK = (name: string) => isFilled(name) && !hasError(name);

                        const groupStats = (i: number) => {
                            const fields = groups[i];
                            const total = fields.length;
                            const filled = fields.filter(isFilled).length;
                            const progress = total ? Math.round((filled / total) * 100) : 0;
                            const anyError = fields.some(hasError);
                            const allValid = fields.every(fieldOK);
                            let barClass = 'bg-primary';
                            if (progress === 0) barClass = 'bg-[#cfd3dd] dark:bg-dark/40';
                            if (anyError) barClass = 'bg-danger';
                            if (allValid && progress === 100) barClass = 'bg-success';
                            return { progress, barClass };
                        };

                        const klass = (name: string) => {
                            const hasErr = (errors as any)[name];
                            const isTouched = (touched as any)[name];
                            const showErr = (isTouched || submitCount > 0) && hasErr;
                            return showErr ? 'has-error' : isTouched && !hasErr ? 'has-success' : '';
                        };
                        const Err = ({ name }: { name: string }) => {
                            const hasErr = (errors as any)[name];
                            const isTouched = (touched as any)[name];
                            return (isTouched || submitCount > 0) && hasErr ? (
                                <div className="mt-1 text-danger">{String(hasErr)}</div>
                            ) : null;
                        };

                        const SectionProgress = ({ idx }: { idx: number }) => {
                            const { progress, barClass } = groupStats(idx);
                            return (
                                <div className="mb-5">
                                    <div className="w-full h-1 bg-[#ebedf2] dark:bg-dark/40 rounded-full">
                                        <div
                                            className={`${barClass} h-1 rounded-full`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        };

                        return (
                            <Form className="space-y-8">
                                {/* 1) Contact & Identificare */}
                                <div className="rounded-xl border border-white/10 panel p-10 shadow-sm ring-1 ring-black/5 dark:border-[#1b2e4b]">
                                    <div className="mb-2 text-base font-semibold">Contact & Identificare</div>
                                    <SectionProgress idx={1} />
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <div className={klass('email')}>
                                            <label htmlFor="email">Email</label>
                                            <Field name="email" type="email" id="email" placeholder="ex: nume@exemplu.ro" className="form-input" />
                                            <Err name="email" />
                                        </div>
                                        <div className={klass('telefon')}>
                                            <label htmlFor="telefon">Telefon</label>
                                            <Field name="telefon" type="tel" id="telefon" placeholder="ex: 07xx xxx xxx" className="form-input" />
                                            <Err name="telefon" />
                                        </div>
                                        <div className={klass('gen')}>
                                            <label htmlFor="gen">Gen</label>
                                            <Field as="select" name="gen" id="gen" className="form-select">
                                                <option value="">Selecteaza</option>
                                                <option value="Masculin">Masculin</option>
                                                <option value="Feminin">Feminin</option>
                                            </Field>
                                            <Err name="gen" />
                                        </div>

                                        <div className={klass('nume')}>
                                            <label htmlFor="nume">Nume</label>
                                            <Field name="nume" type="text" id="nume" placeholder="Introdu numele" className="form-input" />
                                            <Err name="nume" />
                                        </div>
                                        <div className={klass('prenume')}>
                                            <label htmlFor="prenume">Prenume</label>
                                            <Field name="prenume" type="text" id="prenume" placeholder="Introdu prenumele" className="form-input" />
                                            <Err name="prenume" />
                                        </div>
                                        <div className={klass('mediuResedinta')}>
                                            <label htmlFor="mediuResedinta">Mediul de rezidenta</label>
                                            <Field as="select" name="mediuResedinta" id="mediuResedinta" className="form-select">
                                                <option value="">Selecteaza</option>
                                                <option value="Urban">Urban</option>
                                                <option value="Rural">Rural</option>
                                            </Field>
                                            <Err name="mediuResedinta" />
                                        </div>
                                    </div>
                                </div>

                                {/* 2) Date personale & adresa */}
                                <div className="rounded-xl border border-white/10 panel p-10 shadow-sm ring-1 ring-black/5 dark:border-[#1b2e4b]">
                                    <div className="mb-2 text-base font-semibold">Date personale & adresa</div>
                                    <SectionProgress idx={2} />
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <div className={klass('cnp')}>
                                            <label htmlFor="cnp">CNP</label>
                                            <Field name="cnp" type="text" id="cnp" placeholder="13 cifre" className="form-input" />
                                            <Err name="cnp" />
                                        </div>
                                        <div className={klass('judet')}>
                                            <label htmlFor="judet">Judet</label>
                                            <Field name="judet" type="text" id="judet" placeholder="ex: Cluj" className="form-input" />
                                            <Err name="judet" />
                                        </div>
                                        <div className={klass('localitate')}>
                                            <label htmlFor="localitate">Localitate</label>
                                            <Field name="localitate" type="text" id="localitate" placeholder="ex: Cluj-Napoca" className="form-input" />
                                            <Err name="localitate" />
                                        </div>

                                        <div className={klass('strada')}>
                                            <label htmlFor="strada">Strada</label>
                                            <Field name="strada" type="text" id="strada" placeholder="Strada, nr., bloc, sc., ap." className="form-input" />
                                            <Err name="strada" />
                                        </div>
                                    </div>
                                </div>

                                {/* 3) Act de identitate (CI) */}
                                <div className="rounded-xl border border-white/10 panel p-10 shadow-sm ring-1 ring-black/5 dark:border-[#1b2e4b]">
                                    <div className="mb-2 text-base font-semibold">Act de identitate (CI)</div>
                                    <SectionProgress idx={3} />
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <div className={klass('serieCI')}>
                                            <label htmlFor="serieCI">Serie CI</label>
                                            <Field name="serieCI" type="text" id="serieCI" placeholder="PX" className="form-input uppercase" />
                                            <Err name="serieCI" />
                                        </div>
                                        <div className={klass('numarCI')}>
                                            <label htmlFor="numarCI">Numar CI</label>
                                            <Field name="numarCI" type="text" id="numarCI" placeholder="ex: 123456" className="form-input" />
                                            <Err name="numarCI" />
                                        </div>
                                        <div className={klass('eliberatDe')}>
                                            <label htmlFor="eliberatDe">Eliberat de</label>
                                            <Field name="eliberatDe" type="text" id="eliberatDe" placeholder="ex: SPCLEP Sector 1" className="form-input" />
                                            <Err name="eliberatDe" />
                                        </div>

                                        <div className={klass('dataEliberarii')}>
                                            <label htmlFor="dataEliberarii">Data eliberarii</label>
                                            <Field name="dataEliberarii" type="date" id="dataEliberarii" className="form-input" />
                                            <Err name="dataEliberarii" />
                                        </div>
                                        <div className={klass('copieBuletin')}>
                                            <label htmlFor="copieBuletin">Incarcare copie buletin</label>
                                            <input
                                                id="copieBuletin"
                                                name="copieBuletin"
                                                type="file"
                                                className="form-input file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    const file = e.currentTarget.files ? e.currentTarget.files[0] : null;
                                                    setFieldValue('copieBuletin', file);
                                                }}
                                            />
                                            <Err name="copieBuletin" />
                                        </div>
                                    </div>
                                </div>

                                {/* 4) Studiile */}
                                <div className="rounded-xl border border-white/10 panel p-10 shadow-sm ring-1 ring-black/5 dark:border-[#1b2e4b]">
                                    <div className="mb-2 text-base font-semibold">Studiile (institutie & program)</div>
                                    <SectionProgress idx={4} />
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <div className={klass('institutie')}>
                                            <label htmlFor="institutie">Institutie de invatamânt — Denumire</label>
                                            <Field name="institutie" type="text" id="institutie" placeholder="ex: Universitatea X" className="form-input" />
                                            <Err name="institutie" />
                                        </div>
                                        <div className={klass('facultate')}>
                                            <label htmlFor="facultate">Facultate</label>
                                            <Field name="facultate" type="text" id="facultate" placeholder="ex: Facultatea de ..." className="form-input" />
                                            <Err name="facultate" />
                                        </div>
                                        <div className={klass('specializare')}>
                                            <label htmlFor="specializare">Domeniul / Specializarea</label>
                                            <Field name="specializare" type="text" id="specializare" placeholder="ex: Informatica" className="form-input" />
                                            <Err name="specializare" />
                                        </div>

                                        <div className={klass('ciclu')}>
                                            <label htmlFor="ciclu">Ciclul</label>
                                            <Field as="select" name="ciclu" id="ciclu" className="form-select">
                                                <option value="">Selecteaza</option>
                                                <option value="Licenta">Licenta</option>
                                                <option value="Masterat">Masterat</option>
                                            </Field>
                                            <Err name="ciclu" />
                                        </div>
                                    </div>
                                </div>

                                {/* 5) Consimtaminte & trimitere */}
                                <div className="rounded-xl border border-white/10 panel p-10 shadow-sm ring-1 ring-black/5 dark:border-[#1b2e4b]">
                                    <div className="mb-2 text-base font-semibold">Consimtaminte & trimitere</div>
                                    <SectionProgress idx={5} />
                                    <div className="flex flex-col gap-5">
                                        <div className={klass('agree')}>
                                            <label htmlFor="agree" className="flex items-center gap-3 cursor-pointer">
                                                <Field id="agree" name="agree" type="checkbox" className="form-checkbox" />
                                                <span className="font-semibold text-white-dark">
                                                    Declar ca datele sunt reale si sunt de acord cu prelucrarea datelor conform Politicii GDPR.
                                                </span>
                                            </label>
                                            <Err name="agree" />
                                        </div>

                                        <div className={klass('terms')}>
                                            <label htmlFor="terms" className="flex items-center gap-3 cursor-pointer">
                                                <Field id="terms" name="terms" type="checkbox" className="form-checkbox" />
                                                <span className="text-white-dark">
                                                    Sunt de acord cu{' '}
                                                    <a href="/public/termeni-si-conditii" className="text-primary underline" target="_blank">
                                                        Termenii si Conditiile
                                                    </a>.
                                                </span>
                                            </label>
                                            <Err name="terms" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary !mt-6"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Se trimite...' : 'Trimite cererea'}
                                    </button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </div>
        </div>
    );
};

export default FormularInscriereStudenti;
