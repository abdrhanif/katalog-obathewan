# Katalog Obat Hewan (Veterinary Drug Catalog & Prescription System)

A comprehensive, clinical-grade veterinary pharmacology reference and prescription management application for veterinary practitioners.

Compiled from:
* **Plumb's Veterinary Drug Handbook** (10th Edition)
* **BSAVA Small Animal Formulary (Part A: Canine and Feline)** (10th Edition)

---

## 🌟 Key Features

### 1. Veterinary Drug Catalog & Monograph Summaries
* **Active Ingredient Search:** Rapid filtering by generic name, brand names, clinical indications, or mechanism of action.
* **Structured Clinical Fields:**
  * **Mechanism of Action** (MOA)
  * **Indications (Uses)** across multiple animal species
  * **Contraindications & Clinical Warnings** (e.g. feline fluoroquinolone toxicity, hindgut dysbiosis in exotics)
  * **Side Effects** & Adverse Reactions
  * **Drug Interactions** (e.g. NSAID + Steroid prohibitions)
  * **Pharmacokinetics** (Absorption, Distribution, Metabolism, Half-life)
  * **Pharmacodynamics** (Time-dependent vs concentration-dependent efficacy)
* **"Learn More" Full Monograph Drawer:** In-depth client counseling, therapeutic laboratory monitoring, overdose/toxicity management, and formal literature citations.
* **Multi-Species Coverage:** Canine, Feline, Equine, Bovine, Exotic small mammals, and Avian.

### 2. Veterinary Dosage Calculator
* Multi-species dosing adjustments (Dog, Cat, Horse, Cattle, Rabbit, Bird).
* Dual weight units: **kg** and **lbs** with automatic precision conversion.
* Formulation support: Tablets, capsules, oral drops, suspensions, and parenteral injectables.
* Automatic computation of:
  * Single administration dose (mg)
  * Daily dose (mg/day)
  * Admin volume / tablet fractions (e.g. 0.5 tab, 1.8 mL)
  * Total course requirement in Roman numerals (e.g. No XIV)
* Built-in safety warnings for species-specific limits (e.g. Feline Enrofloxacin <= 5 mg/kg ceiling).

### 3. Medication Cart & Veterinary Prescription Generation Algorithm
* Allows adding multiple calculated medications to a session cart.
* Implements the requested veterinary prescription algorithm:
  * `R/` = Standard prescription
  * `inj.` = Injection prescription
  * Syntax:
    ```
    R/ [Medication] [Dosage Strength] [Formulation] [Quantity]
    [Directions for Use]
    ```
    Example:
    ```
    R/ Amoxicillin 500mg tab I
    s.2.dd No I
    ```
* Customizable clinic header, veterinarian registration (SIP/license), and patient information.
* Single-click Copy formatted plain text and Print-ready prescription slip.

### 4. Veterinary Prescription Terminology Database
* Searchable directory of Latin prescription abbreviations (`s.1.dd`, `s.2.dd`, `s.3.dd`, `s.4.dd`, `p.r.n.`, `s.o.s.`, `p.o.`, `s.c.`, `i.m.`, `i.v.`, `a.c.`, `p.c.`, `d.t.d.`, `m.f.`, etc.).
* Ability to add custom terms and abbreviations directly from the interface.

### 5. 🇮🇩 Formularium Obat Hewan Indonesia (434 INN)
* **Katalog 434 Molekul Obat:** Standar Pelayanan Medis Veteriner Berbasis Bukti Ilmiah (*Evidence-Based Veterinary Medicine* / EBVM) dari data `formularium_lengkap.json`.
* **27 Golongan Terapi Mayor:** Analgesik, Anestetik, Antiinfeksi, Antineoplastik, Kardiovaskular, Saluran Cerna, Saluran Napas, Vitamin/Mineral, dll.
* **Negative List (Daftar Obat Dilarang untuk Ternak Pangan):** Standar *One Health* & Kesmavet (Chloramphenicol, Nitrofurans, Metronidazole, Fluoroquinolones, Sefalosporin Gen 3 & 4).
* **Pengawasan Khusus BPOM:** Ketentuan Prekursor Farmasi & Obat-Obat Tertentu (OOT) sesuai Peraturan BPOM No. 10 Tahun 2019 (Ketamin, Tramadol, DMP, dsb.).
* **Standar Kelengkapan Resep Dokter Hewan:** Panduan format legal Inscriptio, Invocatio, Prescriptio, Signatura, Patient ID, dan Subscriptio untuk peresepan obat manusia bagi hewan (*cascade / extra-label use*).
* **Integrasi Langsung:** Tombol satu-klik untuk memasukkan sediaan ke **Resep Veteriner** dan **Kalkulator Dosis**.

---

## 🚀 Firebase Setup & Deployment (`katalog-obathewan`)

This project is pre-configured for the Firebase project **`katalog-obathewan`** following **Firebase Agent Skills** specifications.

### Firebase Files Included
* **`.firebaserc`**: Project mapping targeting `katalog-obathewan`.
* **`firebase.json`**: Firebase Hosting configuration with Single Page App (SPA) URL rewrites and asset caching headers.
* **`.agents/skills/`**: Local Agent Skills installed (`firebase-basics`, `firebase-hosting-basics`, `firestore-rules-creation`).
* **`public/js/firebase-config.js`**: Web SDK integration module.

### How to Deploy to Firebase Hosting

1. **Verify or install Node.js / Firebase CLI:**
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```

2. **Login to Firebase:**
   ```bash
   npx -y firebase-tools@latest login
   ```

3. **Register Web App in project `katalog-obathewan`:**
   ```bash
   npx -y firebase-tools@latest apps:create WEB "Katalog Obat Hewan" --project katalog-obathewan
   ```

4. **Deploy to Firebase Hosting:**
   ```bash
   npx -y firebase-tools@latest deploy --only hosting --project katalog-obathewan
   ```

5. **Access your live application:**
   * Live URL: **https://katalog-obathewan.web.app**
   * Alternate URL: **https://katalog-obathewan.firebaseapp.com**
