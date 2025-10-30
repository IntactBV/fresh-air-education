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

    // validări de bază (poți înăspri ulterior regex-urile după nevoie)
    const phoneRegex = /^(\+4)?0?\s?7\d{2}\s?\d{3}\s?\d{3}$/; // format RO mobil uzual
    const cnpRegex = /^\d{13}$/;

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
        numarCI: Yup.string().required('Numărul CI este obligatoriu'),
        eliberatDe: Yup.string().required('Câmp obligatoriu'),
        dataEliberarii: Yup.date()
            .max(new Date(), 'Data nu poate fi în viitor')
            .required('Data eliberării este obligatorie'),
        copieBuletin: Yup.mixed()
            .required('Încărcarea copiei este obligatorie')
            .test('fileType', 'Format acceptat: PDF/JPG/PNG', (value: any) => {
                if (!value) return false;
                const file = Array.isArray(value) ? value[0] : value;
                const types = ['application/pdf', 'image/jpeg', 'image/png'];
                return file && types.includes(file.type);
            }),

        // 4) Studiile (instituție & program)
        institutie: Yup.string().required('Instituția este obligatorie'),
        facultate: Yup.string().required('Facultatea este obligatorie'),
        specializare: Yup.string().required('Domeniul/Specializarea este obligatorie'),
        ciclu: Yup.string().oneOf(['Licență', 'Masterat'], 'Selectează o opțiune').required('Ciclul este obligatoriu'),

        // 5) Consimțăminte
        agree: Yup.bool().oneOf([true], 'Trebuie să fii de acord înainte de trimitere.'),
    });

    return (
        <div>
            {/* breadcrumb — păstrat intact */}
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

            <div className="panel">
                <div className="mb-5 text-lg font-semibold">Formular de inscriere studenti</div>
                <div className="mb-5">
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
                        }}
                        validationSchema={Schema}
                        onSubmit={() => {}}
                    >
                        {({ errors, submitCount, touched, values, setFieldValue }) => (
                            <Form className="space-y-8">
                                {/* === 1) Contact & Identificare === */}
                                <div>
                                    <div className="mb-2 text-base font-semibold">1) Contact & Identificare</div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <div className={submitCount ? (errors.email ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="email">Email</label>
                                            <Field name="email" type="email" id="email" placeholder="ex: nume@exemplu.ro" className="form-input" />
                                            {submitCount ? (errors.email ? <div className="mt-1 text-danger">{errors.email as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.telefon ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="telefon">Telefon</label>
                                            <Field name="telefon" type="tel" id="telefon" placeholder="ex: 07xx xxx xxx" className="form-input" />
                                            {submitCount ? (errors.telefon ? <div className="mt-1 text-danger">{errors.telefon as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.gen ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="gen">Gen</label>
                                            <Field as="select" name="gen" id="gen" className="form-select">
                                                <option value="">Selectează</option>
                                                <option value="Masculin">Masculin</option>
                                                <option value="Feminin">Feminin</option>
                                            </Field>
                                            {submitCount ? (errors.gen ? <div className="mt-1 text-danger">{errors.gen as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mt-5">
                                        <div className={submitCount ? (errors.nume ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="nume">Nume</label>
                                            <Field name="nume" type="text" id="nume" placeholder="Introdu numele" className="form-input" />
                                            {submitCount ? (errors.nume ? <div className="mt-1 text-danger">{errors.nume as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.prenume ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="prenume">Prenume</label>
                                            <Field name="prenume" type="text" id="prenume" placeholder="Introdu prenumele" className="form-input" />
                                            {submitCount ? (errors.prenume ? <div className="mt-1 text-danger">{errors.prenume as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.mediuResedinta ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="mediuResedinta">Mediul de rezidență</label>
                                            <Field as="select" name="mediuResedinta" id="mediuResedinta" className="form-select">
                                                <option value="">Selectează</option>
                                                <option value="Urban">Urban</option>
                                                <option value="Rural">Rural</option>
                                            </Field>
                                            {submitCount ? (errors.mediuResedinta ? <div className="mt-1 text-danger">{errors.mediuResedinta as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* === 2) Date personale & adresă === */}
                                <div>
                                    <div className="mb-2 text-base font-semibold">2) Date personale & adresă</div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                                        <div className={submitCount ? (errors.cnp ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="cnp">CNP</label>
                                            <Field name="cnp" type="text" id="cnp" placeholder="13 cifre" className="form-input" />
                                            {submitCount ? (errors.cnp ? <div className="mt-1 text-danger">{errors.cnp as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.judet ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="judet">Județ</label>
                                            <Field name="judet" type="text" id="judet" placeholder="ex: Cluj" className="form-input" />
                                            {submitCount ? (errors.judet ? <div className="mt-1 text-danger">{errors.judet as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.localitate ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="localitate">Localitate</label>
                                            <Field name="localitate" type="text" id="localitate" placeholder="ex: Cluj-Napoca" className="form-input" />
                                            {submitCount ? (errors.localitate ? <div className="mt-1 text-danger">{errors.localitate as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.strada ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="strada">Stradă</label>
                                            <Field name="strada" type="text" id="strada" placeholder="Stradă, nr., bloc, sc., ap." className="form-input" />
                                            {submitCount ? (errors.strada ? <div className="mt-1 text-danger">{errors.strada as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* === 3) Act de identitate (CI) === */}
                                <div>
                                    <div className="mb-2 text-base font-semibold">3) Act de identitate (CI)</div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                                        <div className={submitCount ? (errors.numarCI ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="numarCI">Număr CI</label>
                                            <Field name="numarCI" type="text" id="numarCI" placeholder="ex: 123456" className="form-input" />
                                            {submitCount ? (errors.numarCI ? <div className="mt-1 text-danger">{errors.numarCI as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.eliberatDe ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="eliberatDe">Eliberat de</label>
                                            <Field name="eliberatDe" type="text" id="eliberatDe" placeholder="ex: SPCLEP Sector 1" className="form-input" />
                                            {submitCount ? (errors.eliberatDe ? <div className="mt-1 text-danger">{errors.eliberatDe as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.dataEliberarii ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="dataEliberarii">Data eliberării</label>
                                            <Field name="dataEliberarii" type="date" id="dataEliberarii" className="form-input" />
                                            {submitCount ? (errors.dataEliberarii ? <div className="mt-1 text-danger">{errors.dataEliberarii as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.copieBuletin ? 'has-error' : 'has-success') : ''}>
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
                                            {submitCount ? (errors.copieBuletin ? <div className="mt-1 text-danger">{errors.copieBuletin as string}</div> : values.copieBuletin ? <div className="mt-1 text-success">Fișier încărcat</div> : '') : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* === 4) Studiile (instituție & program) === */}
                                <div>
                                    <div className="mb-2 text-base font-semibold">4) Studiile (instituție & program)</div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                                        <div className={submitCount ? (errors.institutie ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="institutie">Instituție de învățământ — Denumire</label>
                                            <Field name="institutie" type="text" id="institutie" placeholder="ex: Universitatea X" className="form-input" />
                                            {submitCount ? (errors.institutie ? <div className="mt-1 text-danger">{errors.institutie as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.facultate ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="facultate">Facultate</label>
                                            <Field name="facultate" type="text" id="facultate" placeholder="ex: Facultatea de ..." className="form-input" />
                                            {submitCount ? (errors.facultate ? <div className="mt-1 text-danger">{errors.facultate as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.specializare ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="specializare">Domeniul / Specializarea</label>
                                            <Field name="specializare" type="text" id="specializare" placeholder="ex: Informatică" className="form-input" />
                                            {submitCount ? (errors.specializare ? <div className="mt-1 text-danger">{errors.specializare as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>

                                        <div className={submitCount ? (errors.ciclu ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="ciclu">Ciclul</label>
                                            <Field as="select" name="ciclu" id="ciclu" className="form-select">
                                                <option value="">Selectează</option>
                                                <option value="Licență">Licență</option>
                                                <option value="Masterat">Masterat</option>
                                            </Field>
                                            {submitCount ? (errors.ciclu ? <div className="mt-1 text-danger">{errors.ciclu as string}</div> : <div className="mt-1 text-success">Arată bine!</div>) : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* === 5) Consimțăminte & trimitere === */}
                                <div>
                                    <div className="mb-2 text-base font-semibold">5) Consimțăminte & trimitere</div>

                                    {/* GDPR */}
                                    <div className={submitCount ? (errors.agree ? 'has-error' : 'has-success') : ''}>
                                        <label htmlFor="agree" className="flex items-center gap-3 cursor-pointer">
                                            <Field id="agree" name="agree" type="checkbox" className="form-checkbox" />
                                            <span className="font-semibold text-white-dark">
                                                Declar că datele sunt reale și sunt de acord cu prelucrarea datelor conform Politicii GDPR.
                                            </span>
                                        </label>
                                        {submitCount ? (errors.agree ? <div className="mt-1 text-danger">{errors.agree as string}</div> : '') : ''}
                                    </div>

                                    {/* Termeni & condiții */}
                                    <div className={`mt-4 ${submitCount ? (errors.terms ? 'has-error' : 'has-success') : ''}`}>
                                        <label htmlFor="terms" className="flex items-center gap-3 cursor-pointer">
                                            <Field id="terms" name="terms" type="checkbox" className="form-checkbox" />
                                            <span className="text-white-dark">
                                                Sunt de acord cu <a href="/termeni" className="text-primary underline">Termenii și Condițiile</a>.
                                            </span>
                                        </label>
                                        {submitCount ? (errors.terms ? <div className="mt-1 text-danger">{errors.terms as string}</div> : '') : ''}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary !mt-6"
                                        onClick={() => {
                                            if (Object.keys(touched).length !== 0 && Object.keys(errors).length === 0) {
                                                submitForm();
                                            }
                                        }}
                                    >
                                        Trimite cererea
                                    </button>
                                </div>

                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default FormularInscriereStudenti;
