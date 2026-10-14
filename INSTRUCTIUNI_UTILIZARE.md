# Instructiuni de utilizare - Fresh Tech Education

Acest document descrie modul de utilizare al aplicatiei Fresh Tech Education, pe baza functionalitatilor existente in proiect. Aplicatia are o zona publica si trei zone autentificate: student, tutore si administrator.

## 1. Pornirea aplicatiei local

Aplicatia este construita cu Next.js si foloseste Yarn.

```bash
yarn install
yarn dev
```

Serverul de dezvoltare porneste pe:

```text
http://localhost:4080
```

Variabile de mediu necesare pentru functionarea completa:

- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME` pentru baza de date PostgreSQL.
- `DB_SSL_CA` in productie, deoarece conexiunea SSL este obligatorie cand `NODE_ENV=production`.
- `DB_POOL_MAX`, optional, pentru numarul maxim de conexiuni in pool.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` pentru trimiterea emailurilor.
- `NEXT_PUBLIC_APP_URL`, optional, pentru linkurile de resetare parola. Implicit este `http://localhost:4080`.

Comenzi utile:

```bash
yarn dev      # porneste serverul local pe portul 4080
yarn build    # build de productie
yarn start    # porneste buildul de productie
yarn lint     # ruleaza ESLint
```

## 2. Rute principale

- `/public` - pagina publica a programului Fresh Tech.
- `/public/formular-de-inscriere-studenti` - formular public de inscriere pentru studenti.
- `/autentificare` - autentificare cu email si parola.
- `/resetare-parola` - pagina pentru setarea/resetarea parolei.
- `/edu` - platforma studentului.
- `/tutore` - platforma tutorelui.
- `/admin` - platforma administratorului.

Rutele `/edu`, `/tutore` si `/admin` necesita sesiune activa. Daca utilizatorul nu este autentificat, este redirectionat la `/autentificare`.

## 3. Zona publica

Pagina publica prezinta programul Fresh Tech si include:

- buton pentru inscrierea studentilor;
- sectiune de resurse publice, cu metodologii/documentatii si anunturi publicate;
- articolul public "Program de practica";
- testimoniale;
- linkuri catre Termeni si conditii si Politica de confidentialitate.

### Inscriere student

Din `/public/formular-de-inscriere-studenti`, studentul completeaza:

- date de contact si identificare;
- date personale si adresa;
- date CI si copie buletin;
- informatii despre studii;
- documente suplimentare: adeverinta student, conventie-cadru semnata, extras de cont;
- consimtamant GDPR si acceptarea termenilor.

Formatele acceptate pentru fisierele incarcate in formular sunt PDF, JPG si PNG. Dupa trimitere, cererea ajunge in zona de administrare la "Cereri in asteptare".

## 4. Autentificare si cont

Utilizatorii se autentifica la `/autentificare` cu email si parola. Dupa autentificare, aplicatia redirectioneaza utilizatorul in functie de rol:

- `admin` -> `/admin`
- `tutore` -> `/tutore`
- `student` -> `/edu`

Pagina de autentificare include si fluxul de resetare parola. Linkurile de resetare sunt trimise pe email.

In pagina "Contul meu", fiecare utilizator poate:

- vedea numele, emailul, rolul si ID-ul contului;
- schimba parola, cu parola curenta si parola noua;
- se deloga din aplicatie.

Parola noua trebuie sa aiba minimum 8 caractere.

## 5. Functionalitati student

### Panou principal

Studentul vede un rezumat al resurselor disponibile si scurtaturi catre:

- Materiale;
- Datele mele;
- Documentele mele;
- Contul meu.

Panoul afiseaza si documente publice relevante, precum metodologii si anunturi.

### Materiale

In `/edu/materiale`, studentul poate:

- cauta materiale dupa nume;
- comuta intre vizualizare de tip lista si arbore;
- extinde/restrange categoriile;
- vedea un material in browser;
- descarca materialul.

Materialele vizibile depind de accesul configurat de administrator: public pentru toti studentii, restrictionat pe serie/student sau privat.

### Teme

In `/edu/teme`, studentul poate:

- incarca fisiere pentru teme;
- vedea fisierele incarcate;
- descarca fisierele;
- sterge fisierele proprii.

Limita maxima pentru un fisier de tema este 20MB.

### Datele mele

In `/edu/datele-mele`, studentul isi poate actualiza datele in patru taburi:

- Contact & Identificare;
- Date personale & adresa;
- Act de identitate (CI);
- Studiile.

Copie buletin accepta PDF, JPG sau PNG. Dupa modificari se foloseste butonul "Salveaza" din tabul curent.

### Documentele mele

In `/edu/documentele-mele`, studentul vede progresul documentelor disponibile si poate incarca documente necesare pentru program:

- adeverinta de student;
- extras de cont;
- conventie-cadru semnata;
- acord prelucrare date personale semnat;
- declaratie evitare dubla finantare semnata;
- declaratie eligibilitate membru semnata.

Pentru documentele cu model disponibil, studentul poate vedea/descarca modelul, il completeaza si incarca varianta semnata. Formatele acceptate sunt PDF, PNG si JPG, cu limita de 10MB.

Adeverinta de finalizare stagiu apare dupa ce este generata si asignata de admin/tutore.

## 6. Functionalitati tutore

Tutorele are un panou principal cu statistici despre studenti, absolventi si materiale.

### Studenti inscrisi

In `/tutore/studenti-inscrisi`, tutorele poate:

- vedea studentii inscrisi si absolventii;
- cauta dupa nume, email sau alte date afisate;
- filtra dupa serie si tutore;
- deschide pagina de detalii a unui student;
- consulta documentele si temele studentului.

In pagina de detalii student, tutorele poate vedea:

- datele studentului;
- documentele incarcate;
- temele incarcate;
- statusul studentului;
- seria si tutorele asignat.

In functie de drepturile disponibile in instalare, aceeasi interfata permite si actiuni precum asignarea seriei/tutorelui, generarea adeverintei de finalizare si marcarea ca absolvent.

### Serii studenti

In `/tutore/serii-studenti`, tutorele poate consulta si administra seriile de studenti:

- cautare dupa nume, descriere sau creator;
- creare serie;
- editare serie;
- stergere serie;
- acces rapid la studentii dintr-o serie.

Stergerea unei serii dezasigneaza studentii din acea serie si poate invalida accesul la materiale restrictionate pe seria respectiva.

### Materiale studenti

In `/tutore/materiale`, tutorele foloseste aceeasi interfata de materiale ca administratorul:

- incarca materiale;
- alege sau creeaza categoria;
- configureaza accesul;
- vede/descarca/sterge materiale;
- modifica ulterior accesul.

## 7. Functionalitati administrator

### Panou principal

Administratorul vede statistici si scurtaturi pentru:

- cereri in asteptare;
- studenti inscrisi;
- absolventi;
- materiale studenti;
- documente publice.

### Cereri in asteptare

In `/admin/cereri-in-asteptare`, administratorul gestioneaza cererile trimise din formularul public.

Lista include taburi pentru:

- In asteptare;
- Aprobate;
- Respinse.

Administratorul poate cauta dupa nume, email sau telefon si poate deschide detaliile unei cereri.

In pagina de detalii cerere, administratorul poate:

- verifica datele personale si de studii;
- vedea/descarca documentele incarcate;
- asigna o serie;
- asigna un tutore;
- aproba cererea;
- respinge cererea, optional cu motiv.

La aprobare, aplicatia creeaza studentul si contul asociat, apoi trimite emailuri de notificare si setare parola. La respingere, aplicatia trimite email de status catre candidat.

### Studenti inscrisi

In `/admin/studenti-inscrisi`, administratorul poate:

- vedea studentii activi/inactivi si absolventii;
- cauta si filtra dupa serie sau tutore;
- selecta unul sau mai multi studenti;
- asigna/dezasigna serie;
- asigna/dezasigna tutore;
- trimite email catre studentii selectati;
- deschide detaliile unui student.

In detaliile studentului, administratorul poate:

- vedea datele studentului;
- vedea si descarca documentele;
- vedea si descarca temele;
- modifica seria si tutorele;
- genera adeverinta de finalizare;
- administra sabloanele implicite pentru declaratii;
- marca studentul ca absolvent.

Marcarea ca absolvent este disponibila doar daca studentul este activ, are cont asociat si are documentele obligatorii incarcate.

### Serii studenti

In `/admin/serii-studenti`, administratorul poate:

- crea o serie;
- edita numele si descrierea;
- sterge seria;
- vedea numarul de studenti din serie;
- deschide lista studentilor filtrata pe seria selectata.

### Materiale studenti

In `/admin/materiale`, administratorul poate administra resursele educationale:

- incarca un fisier;
- alege o categorie existenta sau crea una noua;
- configura accesul;
- cauta materiale;
- extinde/restrange categoriile;
- vedea si descarca fisiere;
- sterge materiale.

Moduri de acces:

- Privat: nimeni nu are acces.
- Public: toti studentii au acces.
- Restrictionat: doar seriile sau studentii selectati au acces.

Accesul poate fi modificat ulterior prin butonul "Acces" al fiecarui material.

### Documente publice

In `/admin/documente-publice`, administratorul gestioneaza documentele PDF afisate pe site-ul public.

Exista doua sectiuni:

- Metodologii & documentatii;
- Anunturi.

Pentru fiecare document se pot face urmatoarele actiuni:

- incarcare PDF;
- completare titlu si descriere;
- publicare imediata sau salvare ascunsa;
- publicare/ascundere ulterioara;
- vizualizare/descarcare;
- stergere.

Doar documentele publicate apar pe pagina publica.

### Pagini publice editabile

Administratorul poate edita continutul paginilor:

- `/admin/program-de-practica`;
- `/admin/termeni-si-conditii`;
- `/admin/politica-de-confidentialitate`.

Editorul permite:

- titlu;
- afisare/ascundere titlu in pagina publica;
- status publicat/nepublicat;
- formatare text: headings, bold, italic, underline, liste, citate, aliniere, culori;
- inserare si administrare imagini;
- credit imagine;
- salvarea continutului.

Continutul publicat este afisat in zona `/public`.

### Utilizatori

In `/admin/utilizatori`, administratorul poate:

- vedea lista conturilor;
- cauta dupa nume sau email;
- filtra dupa rol;
- crea utilizatori noi cu rol `admin` sau `tutore`;
- modifica rolul unui utilizator;
- trimite link de resetare parola;
- bloca sau debloca un utilizator.

Studentii sunt creati in mod normal prin aprobarea cererilor de inscriere.

## 8. Recomandare de flux administrativ

1. Verifica cererile din "Cereri in asteptare".
2. Creeaza sau ajusteaza seriile necesare.
3. Aproba cererea si asigneaza seria/tutorele.
4. Incarca materialele si configureaza accesul pe serie sau student.
5. Urmareste documentele si temele studentului din pagina de detalii.
6. Genereaza documentele finale cand studentul indeplineste conditiile.
7. Marcheaza studentul ca absolvent dupa completarea documentelor obligatorii.

## 9. Observatii si limite

- Aplicatia trimite emailuri pentru resetare parola, status cerere si documente asignate; pentru asta SMTP trebuie configurat corect.
- Incarcarile de documente pentru studenti accepta PDF, PNG si JPG.
- Temele studentilor au limita de 20MB per fisier.
- Documentele din "Documentele mele" au limita de 10MB per fisier.
- Zona protejata verifica existenta unei sesiuni active; accesul efectiv la actiuni depinde si de rolurile gestionate de API.
- Interfata are comutator de tema in header: light, dark si system.
