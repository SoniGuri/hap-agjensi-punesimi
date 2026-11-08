# Hap — Agjensi Punësimi

Website në shqip me faqe kryesore, kërkim dhe filtra pune, hyrje me email e fjalëkalim dhe panel për krijimin, ndryshimin, publikimin dhe mbylljen e njoftimeve.

## Çfarë përmban kjo dosje

- Kodi burimor dhe përmirësimet për mobile.
- API-ja, autentifikimi në server dhe migrimet e databazës.
- package-lock.json, skedarët e konfigurimit dhe testet.
- .env.example me emrat e konfigurimeve, pa vlera private.

Hyrja lokale e adminit është përgatitur në .dev.vars, me hash fjalëkalimi. Ky skedar përjashtohet nga Git. Nuk përfshihen databaza reale, sesionet, node_modules ose skedarët e ndërtuar. Kopjimi i projektit nuk ndryshon website-in e publikuar.

## Teknologjitë

Node.js 22.13+; npm; Vinext / React; Cloudflare Workers dhe D1; Drizzle për skemën dhe migrimet. Git nevojitet për ngarkim në GitHub.

## Nisja në kompjuter

Hap terminalin në këtë dosje:

```powershell
npm run install:ci
npm run build
```

Konfigurimi lokal i adminit është gati në .dev.vars me kredencialet e zgjedhura në bisedë. Nuk nevojitet setup:local për këtë kopje. Ky konfigurim nuk ndryshon website-in e publikuar. Pas një klonimi të ri nga GitHub, ku .dev.vars nuk përfshihet, npm run setup:local krijon një konfigurim të ri lokal me fjalëkalim rastësor.

Për një databazë lokale të re, apliko migrimet një herë, sipas rendit:

```powershell
Get-ChildItem drizzle/*.sql | Sort-Object Name | ForEach-Object {
  node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file $_.FullName
}
npm run dev
```

Hap adresën lokale që shfaq terminali. Paneli i administratorit është te /admin.

## Ngarkimi në GitHub

Krijo një repository bosh në GitHub. Pastaj ekzekuto këtu komandat më poshtë; zëvendëso USERNAME dhe REPOSITORY me të dhënat e tua:

```powershell
git init
git add .
git commit -m "Initial commit: Hap employment agency"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

Mund të përdorësh edhe GitHub Desktop: File > Add local repository; nëse kërkohet, krijoje repository-n në këtë dosje dhe pastaj zgjidh Publish repository.

## Publikimi

GitHub ruan kodin. Për funksionimin e plotë kërkohet një server Cloudflare Workers me databazë D1 dhe migrimet e dosjes drizzle. GitHub Pages nuk ekzekuton API-në, hyrjen e adminit ose databazën.

.hosting/hosting.json ruan lidhjen me projektin ekzistues Sites dhe binding-un DB; nuk përmban fjalëkalime. Në një host tjetër, përshtat konfigurimin e Worker-it dhe D1 sipas llogarisë tënde. Artefakti i serverit krijohet nga npm run build në dist/server/.

Konfigurimet private të nevojshme në host janë ADMIN_EMAIL, ADMIN_PASSWORD_HASH dhe ADMIN_REGISTRATION_CODE_HASH. Hash-i përdor formatin pbkdf2-sha256:100000:SALT_HEX:HASH_HEX. Mos ngarko .dev.vars ose vlera private në GitHub.

## Testet

```powershell
node --test scripts/admin.test.mjs scripts/password-auth.test.mjs
```

scripts/admin-api.test.mjs është për preview-n lokal në portin 5173, me kredencialet fikse të testimit të tij. Përdore vetëm në një mjedis testimi të veçantë; setup:local gjeneron një fjalëkalim tjetër.

## Shënime

Formularët e kandidatëve aktualisht shkarkojnë aplikimin në pajisje; dërgimi online i aplikimeve kërkon konfigurim shtesë. Fotografia dhe fontet ngarkohen nga Unsplash dhe Google Fonts.

## Regjistrimi i administratorëve

Te /admin zgjidh Krijo llogari admin. Regjistrimi kërkon emër, email, fjalëkalim me të paktën 8 karaktere, konfirmim dhe kodin sekret të dhënë në bisedë. Llogaritë ruhen në D1. Email-et e dyfishta refuzohen.

ADMIN_REGISTRATION_CODE_HASH është konfigurim privat i serverit. Kopja lokale e ka në .dev.vars dhe Git e përjashton. Në host vendose si secret, bashkë me konfigurimet ekzistuese të adminit. Apliko edhe migrimin 0002 për llogaritë e reja.

Për teste njësie: node --test scripts/admin.test.mjs scripts/password-auth.test.mjs scripts/registration.test.mjs. registration-api.test.mjs përdor vetëm konfigurimin fiks të testimit lokal.

## Dosja e konfigurimit

Konfigurimi burimor ruhet në .hosting/hosting.json. Ndërtimi e kopjon automatikisht në dist/.openai/hosting.json, format teknik i kërkuar nga Sites. Dosja dist është e gjeneruar dhe përjashtohet nga Git.
