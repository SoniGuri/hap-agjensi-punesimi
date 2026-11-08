# Hap — Agjensi Punësimi

Website në shqip për kërkimin e vendeve të punës dhe menaxhimin e njoftimeve nga administratori.

## 1. Shkarko projektin

Në faqen e këtij repository zgjidh **Code → Download ZIP**. Nxirr skedarët nga ZIP-i dhe hap dosjen që përmban `package.json`.

Duhet të kesh të instaluar **Node.js 22.13 ose më të ri**, bashkë me npm. Komandat e mëposhtme janë për **Windows PowerShell**, të hapur brenda dosjes së projektit.

## 2. Instalo projektin

```powershell
npm run install:ci
```

Prit derisa instalimi të përfundojë.

## 3. Përgatit hyrjen e administratorit

Për një kopje të saposhkarkuar, ekzekuto:

```powershell
npm run setup:local
```

Terminali do të shfaqë emailin e adminit, një fjalëkalim të gjeneruar dhe kodin sekret për regjistrimin e adminëve të rinj. Ruaji këto të dhëna për t'i përdorur te faqja e hyrjes.

**Nëse dosja ka tashmë skedarin `.dev.vars`, kapërce këtë hap dhe përdor kredencialet që ke konfiguruar.**

## 4. Përgatit faqen dhe databazën

Ndërto projektin:

```powershell
npm run build
```

Pastaj, vetëm herën e parë për një databazë lokale të re, kopjo të gjithë bllokun më poshtë në PowerShell:

```powershell
Get-ChildItem drizzle/*.sql | Sort-Object Name | ForEach-Object {
  node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file $_.FullName
}
```

## 5. Nis faqen

```powershell
npm run dev
```

Hap adresën lokale që shfaq terminali, zakonisht **http://127.0.0.1:5173**. Mbaje terminalin hapur gjatë përdorimit të faqes.

Për ta ndalur, shtyp **Ctrl+C**. Herët e tjera mjafton të hapësh PowerShell në dosjen e projektit dhe të ekzekutosh `npm run dev`.

## 6. Përdor faqen

- Në faqen kryesore mund të kërkosh dhe filtrosh vendet e punës, të ruash pozicione dhe të shohësh përshkrimet e tyre.
- Zgjidh **Hyr si admin**, ose hap `/admin`, dhe fut emailin e fjalëkalimin e administratorit.
- Në panel kliko **Posto një punë**, plotëso njoftimin dhe zgjidh statusin **Publikuar** që të shfaqet në website.
- Mund të ruash njoftime si **Draft**, t'i ndryshosh ose t'i vendosësh **Mbyllur** për t'i hequr nga lista e punëve aktive.
- Për të krijuar një administrator tjetër, zgjidh **Krijo llogari admin** dhe plotëso emrin, emailin, fjalëkalimin, konfirmimin dhe kodin sekret të konfigurimit lokal.
- Kliko **Dil nga llogaria** për të mbyllur sesionin e administratorit.

Formulari i kandidatit e shkarkon aplikimin në pajisjen e përdoruesit; nuk e dërgon online te agjencia.
