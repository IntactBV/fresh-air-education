import * as Yup from 'yup';

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

// validari de baza
const phoneRegex = /^(\+4)?0?\s?7\d{2}\s?\d{3}\s?\d{3}$/;
const cnpRegex = /^\d{13}$/;

export const studentApplicationSchema = Yup.object().shape({
    // 1) Contact & Identificare
    email: Yup.string().trim().email('Email invalid').required('Emailul este obligatoriu'),
    telefon: Yup.string().trim().matches(phoneRegex, 'Telefon invalid').required('Telefonul este obligatoriu'),
    nume: Yup.string().trim().required('Numele este obligatoriu'),
    prenume: Yup.string().trim().required('Prenumele este obligatoriu'),
    gen: Yup.string().trim().oneOf(['Masculin', 'Feminin', 'Neutru'], 'Selecteaza genul').required('Genul este obligatoriu'),
    mediuResedinta: Yup.string().trim().oneOf(['Urban', 'Rural'], 'Selecteaza mediul de rezidenta').required('Mediul de rezidenta este obligatoriu'),

    // 2) Date personale & adresa
    cnp: Yup.string().trim().matches(cnpRegex, 'CNP invalid (13 cifre)').required('CNP-ul este obligatoriu'),
    judet: Yup.string().trim().required('Judetul este obligatoriu'),
    localitate: Yup.string().trim().required('Localitatea este obligatorie'),
    strada: Yup.string().trim().required('Strada este obligatorie'),

    // 3) Act de identitate (CI)
    serieCI: Yup.string().trim().required('Seria CI este obligatorie'),
    numarCI: Yup.string().trim().required('Numarul CI este obligatoriu'),
    eliberatDe: Yup.string().trim().required('Completeaza emitentul actului de identitate'),
    dataEliberarii: Yup.date().transform((value, original) => original === '' ? undefined : value).typeError('Data eliberarii este invalida').max(new Date(), 'Data nu poate fi in viitor').required('Data eliberarii este obligatorie'),
    copieBuletin: Yup.mixed()
        .required('Copia actului de identitate este obligatorie')
        .test('fileSize', 'Copia actului de identitate: documentul este prea mare. Limita este de 10 MB per document.', (value: File | null) => !value || value.size <= MAX_DOCUMENT_BYTES)
        .test('fileEmpty', 'Copia actului de identitate: documentul este gol. Selecteaza un fisier cu continut.', (value: File | null) => !value || value.size > 0)
        .test('fileType', 'Copia actului de identitate: format acceptat: PDF/JPG/PNG', (value: any) => {
            if (!value) return true;
            const file = Array.isArray(value) ? value[0] : value;
            const types = ['application/pdf', 'image/jpeg', 'image/png'];
            return file && types.includes(file.type);
        }),

    // 4) Studiile
    institutie: Yup.string().trim().required('Institutia este obligatorie'),
    facultate: Yup.string().trim().required('Facultatea este obligatorie'),
    specializare: Yup.string().trim().required('Specializarea este obligatorie'),
    ciclu: Yup.string().trim().oneOf([
        'Licenta',
        'Licenta2',
        'Licenta3',
        'Masterat',
        'Masterat2',
        'Doctorat'
    ], 'Selecteaza ciclul de studii').required('Ciclul este obligatoriu'),

    adeverintaStudent: Yup.mixed()
        .nullable()
        .test('fileSize', 'Adeverinta de student: documentul este prea mare. Limita este de 10 MB per document.', (value: File | null) => !value || value.size <= MAX_DOCUMENT_BYTES)
        .test('fileEmpty', 'Adeverinta de student: documentul este gol. Selecteaza un fisier cu continut.', (value: File | null) => !value || value.size > 0)
        .test('fileType', 'Adeverinta de student: format acceptat: PDF/JPG/PNG', (value: any) => {
            if (!value) return true; // optional
            const file = Array.isArray(value) ? value[0] : value;
            const types = ['application/pdf', 'image/jpeg', 'image/png'];
            return file && types.includes(file.type);
        }),

    conventieSemnata: Yup.mixed()
        .nullable()
        .test('fileSize', 'Conventia semnata: documentul este prea mare. Limita este de 10 MB per document.', (value: File | null) => !value || value.size <= MAX_DOCUMENT_BYTES)
        .test('fileEmpty', 'Conventia semnata: documentul este gol. Selecteaza un fisier cu continut.', (value: File | null) => !value || value.size > 0)
        .test('fileType', 'Conventia semnata: format acceptat: PDF/JPG/PNG', (value: any) => {
            if (!value) return true; // optional
            const file = Array.isArray(value) ? value[0] : value;
            const types = ['application/pdf', 'image/jpeg', 'image/png'];
            return file && types.includes(file.type);
        }),

    extrasCont: Yup.mixed()
        .nullable()
        .test('fileSize', 'Extrasul de cont: documentul este prea mare. Limita este de 10 MB per document.', (value: File | null) => !value || value.size <= MAX_DOCUMENT_BYTES)
        .test('fileEmpty', 'Extrasul de cont: documentul este gol. Selecteaza un fisier cu continut.', (value: File | null) => !value || value.size > 0)
        .test('fileType', 'Extrasul de cont: format acceptat: PDF/JPG/PNG', (value: any) => {
            if (!value) return true; // optional
            const file = Array.isArray(value) ? value[0] : value;
            const types = ['application/pdf', 'image/jpeg', 'image/png'];
            return file && types.includes(file.type);
        }),

    // 5) Consimtaminte
    agree: Yup.bool().oneOf([true], 'Trebuie sa fii de acord inainte de trimitere.'),
    terms: Yup.bool().oneOf([true], 'Trebuie sa accepti Termenii si Conditiile.'),
});


export const applicationFieldNames: Record<string, string> = {
    mediuResedinta: 'mediu_resedinta', serieCI: 'serie_ci', numarCI: 'numar_ci',
    eliberatDe: 'eliberat_de', dataEliberarii: 'data_eliberarii', copieBuletin: 'copie_buletin',
    adeverintaStudent: 'adeverinta_student', conventieSemnata: 'conventie_semnata', extrasCont: 'extras_cont',
};

export function submissionErrorMessage(status: number): string {
    if (status === 413) return 'Documentele depasesc limita de incarcare a serverului. Redu dimensiunea fisierelor si incearca din nou.';
    if (status === 408 || status === 504) return 'Serverul nu a raspuns la timp. Contacteaza echipa proiectului pentru a verifica daca cererea a fost inregistrata inainte de a o retrimite.';
    if (status === 429) return 'Prea multe incercari de trimitere. Asteapta cateva minute si incearca din nou.';
    return 'Cererea nu a putut fi procesata de server. Datele completate au fost pastrate. Daca problema persista, contacteaza echipa proiectului.';
}
