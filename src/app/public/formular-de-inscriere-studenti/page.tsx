'use client';
import IconHome from '@faComponents/icon/icon-home';
import { Formik, Form, Field } from 'formik';
import Link from 'next/link';
import React from 'react';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

const FormularInscriereStudenti = () => {
    const submitForm = () => {
        const toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
        });
        toast.fire({
            icon: 'success',
            title: 'Cererea a fost trimisă cu succes',
            padding: '10px 20px',
        });
    };

    // validări de bază
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
        dataEliberarii: Yup.date().max(new Date(), 'Data nu poate fi în viitor').required('Data eliberării este obligatorie'),
        copieBuletin: Yup.mixed()
            .required('Încărcarea copiei este obligatorie')
            .test('fileType', 'Format acceptat: PDF/JPG/PNG', (value: any) => {
                if (!value) return false;
                const file = Array.isArray(value) ? value[0] : value;
                const types = ['application/pdf', 'image/jpeg', 'image/png'];
                return file && types.includes(file.type);
            }),

        // 4) Studiile
        institutie: Yup.string().required('Instituția este obligatorie'),
        facultate: Yup.string().required('Facultatea este obligatorie'),
        specializare: Yup.string().required('Domeniul/Specializarea este obligatorie'),
        ciclu: Yup.string().oneOf(['Licență', 'Masterat'], 'Selectează o opțiune').required('Ciclul este obligatoriu'),

        // 5) Consimțăminte
        agree: Yup.bool().oneOf([true], 'Trebuie să fii de acord înainte de trimitere.'),
        terms: Yup.bool().oneOf([true], 'Trebuie să accepți Termenii și Condițiile.'),
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

            {/* <div className="panel"> */}
            {/* <div className="relative rounded-t-md bg-primary-light bg-[url('/assets/images/knowledge/pattern.png')] px-5 py-10 dark:bg-black md:px-10"> */}
            <div className="relative rounded-t-md bg-primary-light 
                bg-[url('/assets/images/knowledge/pattern.png')] 
                bg-[length:800px_auto]
                bg-repeat
                px-5 py-10 dark:bg-black md:px-10">

                {/* <div className="mb-5 text-lg font-semibold p-5">Formular de inscriere studenti</div> */}
                <div className="mb-2 text-center text-2xl font-bold p-10 dark:text-white md:text-5xl">Formular de Inscriere Studenti</div>

                <Formik
                    initialValues={{
                        // 1) Contact & Identificare
                        email: '',
                        telefon: '',
                        nume: '',
                        prenume: '',
                        gen: '',
                        mediuResedinta: '',

                        // 2) Date personale & adresă
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

                        // 5) Consimțăminte
                        agree: false,
                        terms: false,
                    }}
                    validationSchema={Schema}
                    validateOnBlur={true}
                    validateOnChange={true}
                    onSubmit={() => {}}
                >
                    {({ errors, touched, submitCount, values, setFieldValue }) => {
                        // ── Grupuri + progress per secțiune ────────────────────────────────
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
                            // culoare bară: gri (0%) -> primary (în progres) -> success (all valid) -> danger (erori)
                            let barClass = 'bg-primary';
                            if (progress === 0) barClass = 'bg-[#cfd3dd] dark:bg-dark/40';
                            if (anyError) barClass = 'bg-danger';
                            if (allValid && progress === 100) barClass = 'bg-success';
                            return { progress, barClass };
                        };

                        // helpers UI pentru inputuri
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

                        // Componentă bară progres stil cerut
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
                                {/* === 1) Contact & Identificare === */}
                                <div className="rounded-xl border border-white/10 panel p-10 shadow-sm ring-1 ring-black/5 dark:border-[#1b2e4b]">
                                    <div className="mb-2 text-base font-semibold">1) Contact & Identificare</div>
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
                                                <option value="">Selectează</option>
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
                                            <label htmlFor="mediuResedinta">Mediul de rezidență</label>
                                            <Field as="select" name="mediuResedinta" id="mediuResedinta" className="form-select">
                                                <option value="">Selectează</option>
                                                <option value="Urban">Urban</option>
                                                <option value="Rural">Rural</option>
                                            </Field>
                                            <Err name="mediuResedinta" />
                                        </div>
                                    </div>
                                </div>

                                {/* === 2) Date personale & adresă === */}
                                <div className="rounded-xl border border-white/10 panel p-10 shadow-sm ring-1 ring-black/5 dark:border-[#1b2e4b]">
                                    <div className="mb-2 text-base font-semibold">2) Date personale & adresă</div>
                                    <SectionProgress idx={2} />
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <div className={klass('cnp')}>
                                            <label htmlFor="cnp">CNP</label>
                                            <Field name="cnp" type="text" id="cnp" placeholder="13 cifre" className="form-input" />
                                            <Err name="cnp" />
                                        </div>
                                        <div className={klass('judet')}>
                                            <label htmlFor="judet">Județ</label>
                                            <Field name="judet" type="text" id="judet" placeholder="ex: Cluj" className="form-input" />
                                            <Err name="judet" />
                                        </div>
                                        <div className={klass('localitate')}>
                                            <label htmlFor="localitate">Localitate</label>
                                            <Field name="localitate" type="text" id="localitate" placeholder="ex: Cluj-Napoca" className="form-input" />
                                            <Err name="localitate" />
                                        </div>

                                        <div className={klass('strada')}>
                                            <label htmlFor="strada">Stradă</label>
                                            <Field name="strada" type="text" id="strada" placeholder="Stradă, nr., bloc, sc., ap." className="form-input" />
                                            <Err name="strada" />
                                        </div>
                                    </div>
                                </div>

                                {/* === 3) Act de identitate (CI) === */}
                                <div className="rounded-xl border border-white/10 panel p-10 shadow-sm ring-1 ring-black/5 dark:border-[#1b2e4b]">
                                    <div className="mb-2 text-base font-semibold">3) Act de identitate (CI)</div>
                                    <SectionProgress idx={3} />
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <div className={klass('serieCI')}>
                                            <label htmlFor="serieCI">Serie CI</label>
                                            <Field name="serieCI" type="text" id="serieCI" placeholder="PX" className="form-input uppercase" />
                                            <Err name="serieCI" />
                                        </div>
                                        <div className={klass('numarCI')}>
                                            <label htmlFor="numarCI">Număr CI</label>
                                            <Field name="numarCI" type="text" id="numarCI" placeholder="ex: 123456" className="form-input" />
                                            <Err name="numarCI" />
                                        </div>
                                        <div className={klass('eliberatDe')}>
                                            <label htmlFor="eliberatDe">Eliberat de</label>
                                            <Field name="eliberatDe" type="text" id="eliberatDe" placeholder="ex: SPCLEP Sector 1" className="form-input" />
                                            <Err name="eliberatDe" />
                                        </div>

                                        <div className={klass('dataEliberarii')}>
                                            <label htmlFor="dataEliberarii">Data eliberării</label>
                                            <Field name="dataEliberarii" type="date" id="dataEliberarii" className="form-input" />
                                            <Err name="dataEliberarii" />
                                        </div>
                                        <div className={klass('copieBuletin')}>
                                            <label htmlFor="copieBuletin">Încărcare copie buletin</label>
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

                                {/* === 4) Studiile (instituție & program) === */}
                                <div className="rounded-xl border border-white/10 panel p-10 shadow-sm ring-1 ring-black/5 dark:border-[#1b2e4b]">
                                    <div className="mb-2 text-base font-semibold">4) Studiile (instituție & program)</div>
                                    <SectionProgress idx={4} />
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <div className={klass('institutie')}>
                                            <label htmlFor="institutie">Instituție de învățământ — Denumire</label>
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
                                            <Field name="specializare" type="text" id="specializare" placeholder="ex: Informatică" className="form-input" />
                                            <Err name="specializare" />
                                        </div>

                                        <div className={klass('ciclu')}>
                                            <label htmlFor="ciclu">Ciclul</label>
                                            <Field as="select" name="ciclu" id="ciclu" className="form-select">
                                                <option value="">Selectează</option>
                                                <option value="Licență">Licență</option>
                                                <option value="Masterat">Masterat</option>
                                            </Field>
                                            <Err name="ciclu" />
                                        </div>
                                    </div>
                                </div>

                                {/* === 5) Consimțăminte & trimitere === */}
                                <div className="rounded-xl border border-white/10 panel p-10 shadow-sm ring-1 ring-black/5 dark:border-[#1b2e4b]">
                                    <div className="mb-2 text-base font-semibold">5) Consimțăminte & trimitere</div>
                                    <SectionProgress idx={5} />
                                    <div className="flex flex-col gap-5">
                                        <div className={klass('agree')}>
                                            <label htmlFor="agree" className="flex items-center gap-3 cursor-pointer">
                                                <Field id="agree" name="agree" type="checkbox" className="form-checkbox" />
                                                <span className="font-semibold text-white-dark">
                                                    Declar că datele sunt reale și sunt de acord cu prelucrarea datelor conform Politicii GDPR.
                                                </span>
                                            </label>
                                            <Err name="agree" />
                                        </div>

                                        <div className={klass('terms')}>
                                            <label htmlFor="terms" className="flex items-center gap-3 cursor-pointer">
                                                <Field id="terms" name="terms" type="checkbox" className="form-checkbox" />
                                                <span className="text-white-dark">
                                                    Sunt de acord cu <a href="/termeni" className="text-primary underline">Termenii și Condițiile</a>.
                                                </span>
                                            </label>
                                            <Err name="terms" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary !mt-6"
                                        onClick={() => {
                                            if (Object.keys(errors).length === 0) {
                                                submitForm();
                                            }
                                        }}
                                    >
                                        Trimite cererea
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
