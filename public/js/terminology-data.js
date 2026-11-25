/**
 * Veterinary Prescription Terminology and Latin Shorthand Database
 * Sourced from: Adaptasi Pedoman Keterampilan Klinis Penulisan Resep Standar Kedokteran Hewan
 * (Regulasi Obat Hewan Kementan RI & Farmakologi Veteriner)
 * Covers 79 standard Latin abbreviations, dispensing terms, frequencies, formulations, and routes.
 */

export const INITIAL_PRESCRIPTION_TERMS = [
  {
    "code": "ad us. vet.",
    "latin": "ad usum veterinarium",
    "english": "untuk pemakaian kedokteran hewan",
    "category": "Keterangan Khusus Veteriner",
    "usage": "Ditulis pada resep atau label obat khusus hewan (misal: R/ Enrofloxacin 10% inj. ad us. vet. fl. No. I)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "da in caps.",
    "latin": "da in capsulis",
    "english": "berikan / masukkan ke dalam kapsul",
    "category": "Perintah Peracikan (Sangat penting untuk Kucing/Anjing)",
    "usage": "m.f.l.a. pulv. d.t.d. No. X da in caps. (Buat puyer 10 bagian dan masukkan masing-masing ke dalam cangkang kapsul agar tidak pahit saat diberikan ke kucing)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "aa",
    "latin": "ana",
    "english": "sama banyak",
    "category": "Takaran / Peracikan",
    "usage": "R/ Hydrocortisone 1% cream, Miconazole 2% cream aa tube No. I",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "a.c.",
    "latin": "ante coenam",
    "english": "sebelum makan (sebelum pemberian pakan)",
    "category": "Waktu Penggunaan",
    "usage": "S 2 d.d. susp. ml II a.c. (Tandai 2 kali sehari 2 ml suspensi Sukralfat sebelum hewan diberi pakan)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI) • Crucial for drugs like pimobendan that have reduced absorption with food."
  },
  {
    "code": "p.c.",
    "latin": "post coenam",
    "english": "sesudah makan (sesudah pemberian pakan)",
    "category": "Waktu Penggunaan",
    "usage": "S 2 d.d. caps. I p.c. (Tandai 2 kali sehari 1 kapsul sesudah hewan makan)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI) • Essential for NSAIDs (meloxicam) and irritant antibiotics to reduce gastric ulceration."
  },
  {
    "code": "d.c.",
    "latin": "durante coenam",
    "english": "selama makan (dicampur bersama pakan)",
    "category": "Waktu Penggunaan",
    "usage": "S 1 d.d. pulv. I d.c. (Tandai 1 kali sehari 1 bungkus puyer dicampurkan ke dalam pakan basah/wet food)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "a.n.",
    "latin": "ante noctem",
    "english": "malam hari",
    "category": "Waktu Penggunaan",
    "usage": "S 1 d.d. tab. I a.n. (Tandai 1 kali sehari 1 tablet pada malam hari)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "ad libit.",
    "latin": "ad libitum",
    "english": "secukupnya / tersedia terus-menerus",
    "category": "Takaran / Pemberian Air Minum",
    "usage": "Larutkan 1 g/2 liter air minum, berikan secara ad libit. pada unggas",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "aplic. in loc. dol.",
    "latin": "applicandum in loco dolenti",
    "english": "oleskan pada tempat yang sakit / luka",
    "category": "Aturan Pakai Topikal",
    "usage": "S 2 d.d. aplic. in loc. dol. (pasangkan E-collar agar tidak dijilat)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "u.e.",
    "latin": "usus externus",
    "english": "untuk obat luar",
    "category": "Aturan Pakai Topikal / Alkes / Spot-on",
    "usage": "S u.e. (teteskan pada kulit tengkuk / gunakan saat dimandikan)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "u.p.",
    "latin": "usus propius",
    "english": "untuk dipakai sendiri (keperluan praktik Dokter Hewan)",
    "category": "Keterangan Khusus Dokter Hewan",
    "usage": "S u.p. (Digunakan oleh dokter hewan untuk stok obat injeksi/emergensi di klinik)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "m.i.",
    "latin": "mihi ipsi",
    "english": "dipakai sendiri",
    "category": "Keterangan Khusus Dokter Hewan",
    "usage": "S m.i. (Tandai: untuk penggunaan internal praktik dokter hewan)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "i.m.m.",
    "latin": "in manum medici",
    "english": "serahkan ke tangan dokter (hewan)",
    "category": "Aturan Pakai Parenteral / Injeksi / Infus",
    "usage": "S i.m.m. (Tandai: serahkan cairan infus/injeksi kepada dokter hewan untuk tindakan medis)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "c.",
    "latin": "cum",
    "english": "dengan",
    "category": "Keterangan Tambahan",
    "usage": "Berikan c. cibo (dengan pakan)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "C",
    "latin": "cochlear",
    "english": "sendok makan (15 ml)",
    "category": "Takaran Cairan (Lebih disarankan menulis dalam satuan 'ml' menggunakan spuit)",
    "usage": "S 2 d.d. C I (15 ml) (Untuk anjing ras besar)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "cth",
    "latin": "cochlear theae",
    "english": "sendok teh (5 ml)",
    "category": "Takaran Cairan (Pada hewan kecil lebih akurat ditulis 'ml' dengan spuit tanpa jarum)",
    "usage": "S 2 d.d. cth 1/2 (2,5 ml per oral dengan spuit)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "clysm.",
    "latin": "clysma",
    "english": "enema / obat pompa rektal",
    "category": "Bentuk Sediaan Obat",
    "usage": "R/ Diazepam rectal clysm. 5 mg tube No. II (Sediakan untuk penanganan kejang/epilepsi anjing di rumah)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "collyr.",
    "latin": "collyrium",
    "english": "obat cuci mata",
    "category": "Bentuk Sediaan Obat",
    "usage": "Digunakan untuk irigasi mata hewan sebelum pemberian tetes mata antibiotik",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "comp.",
    "latin": "compositus",
    "english": "(obat) campuran / kombinasi",
    "category": "Nama / Jenis Sediaan",
    "usage": "R/ Sulfadiazine-Trimethoprim comp. bol. No. II",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "conc.",
    "latin": "concentratus",
    "english": "pekat (harus diencerkan terlebih dahulu)",
    "category": "Sifat Sediaan",
    "usage": "R/ Amitraz 12.5% sol. conc. fl. No. I (S u.e. encerkan 4 ml dalam 1 liter air untuk mandi celup/dipping demodekosis anjing)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "d.i.d.",
    "latin": "da in dimidio",
    "english": "berikan separuhnya",
    "category": "Perintah ke Apoteker",
    "usage": "Digunakan bila pemilik hewan menebus separuh jumlah obat terlebih dahulu",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "d.t.d.",
    "latin": "da tales doses",
    "english": "berikan dalam dosis demikian",
    "category": "Perintah Peracikan",
    "usage": "m.f.l.a. pulv. d.t.d. No. XIV da in caps. (Buat 14 kapsul di mana tiap kapsul mengandung takaran dosis yang tertulis di atas)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI) • Instruction to compounding pharmacist: formulate X individual doses."
  },
  {
    "code": "d.d.",
    "latin": "de die",
    "english": "kali sehari",
    "category": "Frekuensi Pemberian",
    "usage": "1 d.d. (q24h), 2 d.d. (q12h), 3 d.d. (q8h)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "1 d.d.",
    "latin": "semel de die",
    "english": "sekali sehari (setara dengan s.i.d. / q24h di literatur veteriner)",
    "category": "Frekuensi Pemberian",
    "usage": "S 1 d.d. tab. I (Tandai 1 kali sehari 1 tablet)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "2 d.d.",
    "latin": "bis de die",
    "english": "2 kali sehari (setara dengan b.i.d. / q12h di literatur veteriner)",
    "category": "Frekuensi Pemberian",
    "usage": "S 2 d.d. caps. I (Tandai 2 kali sehari 1 kapsul tiap 12 jam)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "3 d.d.",
    "latin": "ter de die",
    "english": "3 kali sehari (setara dengan t.i.d. / q8h di literatur veteriner)",
    "category": "Frekuensi Pemberian",
    "usage": "S 3 d.d. gtt. II opht. (Tandai 3 kali sehari 2 tetes mata)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "dext.",
    "latin": "dexter",
    "english": "kanan",
    "category": "Lokasi Anatomis",
    "usage": "S 2 d.d. gtt. III auric. dext. (Tandai 2 kali sehari 3 tetes pada telinga kanan)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "sin.",
    "latin": "sinister",
    "english": "kiri",
    "category": "Lokasi Anatomis",
    "usage": "S 2 d.d. gtt. III auric. sin. (Tandai 2 kali sehari 3 tetes pada telinga kiri)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "dext. et sin.",
    "latin": "dexter et sinister",
    "english": "kanan dan kiri",
    "category": "Lokasi Anatomis",
    "usage": "S 3 d.d. gtt. I opht. dext. et sin. (Tandai 3 kali sehari 1 tetes pada mata kanan dan kiri)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "emuls.",
    "latin": "emulsum",
    "english": "emulsi",
    "category": "Bentuk Sediaan Obat",
    "usage": "R/ Simethicone / Dimethicone emuls. 100 ml fl. No. I (Untuk kasus bloat/timpani pada kelinci atau kambing)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "f.l.a.",
    "latin": "fac lege artis",
    "english": "buat menurut cara semestinya",
    "category": "Perintah Peracikan",
    "usage": "m.f.l.a. ung. (Campur dan buatlah salep menurut aturan kefarmasian)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "g",
    "latin": "gramma",
    "english": "gram",
    "category": "Satuan Berat",
    "usage": "R/ Tepung Kaolin 10 g (Ingat: jangan ditulis 'gr')",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "gtt.",
    "latin": "guttae",
    "english": "tetes",
    "category": "Bentuk Sediaan / Takaran",
    "usage": "S 2 d.d. gtt. IV auric. dext. et sin. (Untuk otitis eksterna anjing/kucing)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "h.",
    "latin": "hora",
    "english": "jam",
    "category": "Waktu Penggunaan",
    "usage": "S o. 12 h. caps. I (Tandai setiap 12 jam 1 kapsul)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "inj.",
    "latin": "injectio",
    "english": "injeksi / suntikan",
    "category": "Bentuk Sediaan Obat",
    "usage": "R/ Atropin sulfat inj. 0,25 mg/ml amp. No. V",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI) • Sterile solution for parenteral administration."
  },
  {
    "code": "iter",
    "latin": "iteretur",
    "english": "harap diulang",
    "category": "Perintah Pengulangan Resep",
    "usage": "Ditulis 'iter 2x' untuk terapi jangka panjang pada hewan (misal: obat jantung Pimobendan atau Furosemide pada anjing gagal jantung kongestif)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "ne iter",
    "latin": "ne iteretur",
    "english": "jangan diulang",
    "category": "Perintah Larangan Pengulangan",
    "usage": "Ditulis 'ne iter' untuk resep antibiotik, kortikosteroid, atau obat keras agar pemilik tidak mengulang tanpa kontrol ulang ke dokter hewan",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "lot.",
    "latin": "lotio",
    "english": "lotion (obat cair untuk kulit)",
    "category": "Bentuk Sediaan Obat",
    "usage": "S 2 d.d. lot. u.e.",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "m.f.l.a.",
    "latin": "misce fac lege artis",
    "english": "campur dan buatlah menurut keahlian",
    "category": "Perintah Peracikan",
    "usage": "m.f.l.a. pulv. d.t.d. No. X da in caps.",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "mane",
    "latin": "mane",
    "english": "pagi hari",
    "category": "Waktu Penggunaan",
    "usage": "S 1 d.d. tab. I mane (Diberikan pagi hari, misal untuk kortikosteroid Prednisolone pada anjing)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "m. et v.",
    "latin": "mane et vespere",
    "english": "pagi dan sore",
    "category": "Waktu Penggunaan",
    "usage": "S m. et v. caps. I p.c. (Tandai pagi dan sore masing-masing 1 kapsul sesudah makan)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "mg",
    "latin": "milligramma",
    "english": "miligram",
    "category": "Satuan Berat",
    "usage": "R/ Amoxicillin clavulanate 62,5 mg",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "o.",
    "latin": "omni",
    "english": "tiap / setiap",
    "category": "Frekuensi Waktu",
    "usage": "S o. 8 h. ml II p.o. (Tandai tiap 8 jam 2 ml per oral)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "P.I.M.",
    "latin": "periculum in mora",
    "english": "berbahaya bila ditunda (Darurat / Cito)",
    "category": "Tingkat Kegawatdaruratan",
    "usage": "Ditulis di kanan atas resep pada kasus keracunan akut, status epileptikus, atau syok anafilaksis hewan",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "p.r.n.",
    "latin": "pro re nata",
    "english": "bila perlu",
    "category": "Kondisi Penggunaan",
    "usage": "S p.r.n. 2 d.d. caps. I (bila muntah)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI) • Typically specified with maximum frequency, e.g. p.r.n. max s.3.dd."
  },
  {
    "code": "pulv.",
    "latin": "pulveres / pulvis",
    "english": "serbuk terbagi (puyer) / serbuk tak terbagi",
    "category": "Bentuk Sediaan Obat",
    "usage": "S 2 d.d. pulv. I (larutkan dengan sedikit air, suapkan dengan spuit)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "pulv. adspers.",
    "latin": "pulvis adspersorius",
    "english": "serbuk tabur / bedak",
    "category": "Bentuk Sediaan Obat",
    "usage": "R/ Carbaryl 5% pulv. adspers. box No. I (Bedak kutu untuk ditaburkan pada rambut hewan)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "q.s.",
    "latin": "quantum satis",
    "english": "secukupnya",
    "category": "Takaran / Bahan Tambahan",
    "usage": "R/ Saccharum lactis q.s. (Tambahkan gula susu secukupnya sebagai pengisi puyer)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "R/",
    "latin": "recipe",
    "english": "ambillah",
    "category": "Superscriptio (Pembuka Resep)",
    "usage": "R/ Meloxicam 1,5 mg/ml oral susp. fl. No. I",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "S",
    "latin": "signa",
    "english": "tandai",
    "category": "Signatura (Aturan Pakai)",
    "usage": "S 1 d.d. ml I p.c.",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "u.c.",
    "latin": "usus cognitus",
    "english": "aturan pakai sudah diketahui",
    "category": "Aturan Pakai",
    "usage": "S u.c. (Digunakan jika dokter hewan sudah memberikan instruksi tertulis terpisah secara rinci kepada pemilik hewan)",
    "notes": "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  },
  {
    "code": "s.2.dd",
    "latin": "signa bis de die",
    "english": "Twice daily (every 12 hours)",
    "category": "Frequency",
    "usage": "s.2.dd No I (Give 1 unit twice daily)",
    "notes": "Equivalent to BID. Standard for antimicrobial and anti-inflammatory administration."
  },
  {
    "code": "s.1.dd",
    "latin": "signa semel de die",
    "english": "Once daily (every 24 hours)",
    "category": "Frequency",
    "usage": "s.1.dd No I (Give 1 unit once daily)",
    "notes": "Equivalent to SID. Standard for drugs with long half-lives (e.g. meloxicam, enrofloxacin)."
  },
  {
    "code": "s.3.dd",
    "latin": "signa ter de die",
    "english": "Three times daily (every 8 hours)",
    "category": "Frequency",
    "usage": "s.3.dd No I (Give 1 unit three times daily)",
    "notes": "Equivalent to TID. Standard for rapid-clearance drugs."
  },
  {
    "code": "s.4.dd",
    "latin": "signa quater de die",
    "english": "Four times daily (every 6 hours)",
    "category": "Frequency",
    "usage": "s.4.dd No I (Give 1 unit four times daily)",
    "notes": "Equivalent to QID. Frequent dosing for eye drops or short-acting analgesics."
  },
  {
    "code": "s.u.d",
    "latin": "signa usus dexter / usus die",
    "english": "Use daily as directed",
    "category": "Frequency",
    "usage": "s.u.d No I",
    "notes": "Used when dosage is scheduled."
  },
  {
    "code": "s.o.s.",
    "latin": "si opus sit",
    "english": "If necessary / in emergency",
    "category": "Frequency",
    "usage": "s.o.s. No I",
    "notes": "Reserved for emergency medications (e.g., rectal diazepam for seizures)."
  },
  {
    "code": "q8h",
    "latin": "quaque 8 hora",
    "english": "Every 8 hours",
    "category": "Frequency",
    "usage": "q8h No I",
    "notes": "Strict 8-hour schedule for time-dependent antibiotics."
  },
  {
    "code": "q12h",
    "latin": "quaque 12 hora",
    "english": "Every 12 hours",
    "category": "Frequency",
    "usage": "q12h No I",
    "notes": "Strict 12-hour schedule."
  },
  {
    "code": "q24h",
    "latin": "quaque 24 hora",
    "english": "Every 24 hours",
    "category": "Frequency",
    "usage": "q24h No I",
    "notes": "Strict 24-hour schedule."
  },
  {
    "code": "p.o.",
    "latin": "per os",
    "english": "By mouth / orally",
    "category": "Route",
    "usage": "p.o. post cibum",
    "notes": "Standard oral administration."
  },
  {
    "code": "s.c.",
    "latin": "sub cutem",
    "english": "Subcutaneously (under the skin)",
    "category": "Route",
    "usage": "inj. s.c.",
    "notes": "Common injection route for vaccines, fluids, and antiemetics in veterinary medicine."
  },
  {
    "code": "i.m.",
    "latin": "intra musculum",
    "english": "Intramuscularly (into the muscle)",
    "category": "Route",
    "usage": "inj. i.m.",
    "notes": "Administered into epaxial, semimembranosus/semitendinosus, or quadriceps muscles."
  },
  {
    "code": "i.v.",
    "latin": "intra venam",
    "english": "Intravenously (into the vein)",
    "category": "Route",
    "usage": "inj. i.v. slow",
    "notes": "Direct vascular access via cephalic, saphenous, or jugular catheter."
  },
  {
    "code": "s.u.e.",
    "latin": "signa usus externus",
    "english": "For external use only",
    "category": "Route",
    "usage": "s.u.e. applicandum",
    "notes": "Topical sprays, shampoos, ear cleansers, ointments."
  },
  {
    "code": "auric.",
    "latin": "auricularis",
    "english": "In the ear(s)",
    "category": "Route",
    "usage": "gtt. auric. II",
    "notes": "Ear drops: AD (right ear), AS (left ear), AU (both ears)."
  },
  {
    "code": "ophth.",
    "latin": "ophthalmicus",
    "english": "In the eye(s)",
    "category": "Route",
    "usage": "gtt. ophth. I",
    "notes": "Eye drops: OD (right eye), OS (left eye), OU (both eyes)."
  },
  {
    "code": "tab",
    "latin": "tabula",
    "english": "Tablet",
    "category": "Formulation",
    "usage": "tab No XIV",
    "notes": "Solid compressed dosage form."
  },
  {
    "code": "caps",
    "latin": "capsula",
    "english": "Capsule",
    "category": "Formulation",
    "usage": "caps No X",
    "notes": "Gelatin shell enclosing powder or granules."
  },
  {
    "code": "pulv",
    "latin": "pulvis",
    "english": "Powder / sachet",
    "category": "Formulation",
    "usage": "pulv No VII",
    "notes": "Compoundable powdered medication mixed in food."
  },
  {
    "code": "syr",
    "latin": "syrupus",
    "english": "Syrup / oral liquid",
    "category": "Formulation",
    "usage": "syr flac I",
    "notes": "Sweetened liquid dosage form."
  },
  {
    "code": "susp",
    "latin": "suspensio",
    "english": "Suspension",
    "category": "Formulation",
    "usage": "susp flac I (shake well)",
    "notes": "Insoluble drug particles dispersed in liquid vehicle."
  },
  {
    "code": "gtt",
    "latin": "guttae",
    "english": "Drops",
    "category": "Formulation",
    "usage": "gtt III",
    "notes": "Liquid drops for ocular, aural, or oral dispensing."
  },
  {
    "code": "No",
    "latin": "numero",
    "english": "Number / quantity of units",
    "category": "Dispensing",
    "usage": "No X (Number 10), No I (Number 1)",
    "notes": "Followed by Roman numeral or Arabic digit."
  },
  {
    "code": "flac",
    "latin": "flacon / ampulla",
    "english": "Bottle / vial",
    "category": "Dispensing",
    "usage": "flac No I",
    "notes": "Specifies dispensing of an intact bottle or vial."
  },
  {
    "code": "c.c.",
    "latin": "cum cibo",
    "english": "With food",
    "category": "Instruction",
    "usage": "p.o. c.c.",
    "notes": "Given simultaneously with a meal."
  },
  {
    "code": "m.f.",
    "latin": "misce fiat",
    "english": "Mix to make",
    "category": "Compounding",
    "usage": "m.f. pulv",
    "notes": "Direction to mix ingredients into specified form."
  },
  {
    "code": "n.i.",
    "latin": "ne iteretur",
    "english": "Do not repeat / non-refillable",
    "category": "Prescription Directive",
    "usage": "n.i.",
    "notes": "Prescription cannot be refilled without new veterinary authorization."
  },
  {
    "code": "iter.",
    "latin": "iteretur",
    "english": "May be repeated / refilled",
    "category": "Prescription Directive",
    "usage": "iter. 1x",
    "notes": "Prescription allows specified refills."
  },
  {
    "code": "s.i.m.m.",
    "latin": "signa in manus medici (da in manus medici)",
    "english": "Tandai / serahkan ke dalam tangan dokter (diberikan langsung oleh dokter hewan)",
    "category": "Instruksi Khusus Penyerahan (Directives)",
    "usage": "R/ Ketamine 100 mg/ml inj. vial No. I - S. i. m. m. (Apotek menyerahkan sediaan langsung kepada dokter hewan pemeriksa untuk tindakan medis/operasi, tidak diserahkan ke pemilik hewan)",
    "notes": "Kaidah standar resep veteriner untuk obat anestesi, sedasi, narkotika/psikotropika, kemoterapi, vaksin, dan sediaan injeksi klinik."
  },
  {
    "code": "s.u.c.",
    "latin": "signa usus cognitus",
    "english": "Tandai pemakaian telah diketahui",
    "category": "Petunjuk Aturan Pakai",
    "usage": "S. u. c. (Digunakan bila instruksi dosis dan cara pakai telah dijelaskan secara lisan dan dipahami klien)",
    "notes": "Sering dipakai untuk obat luar/topikal atau penanganan khusus."
  }
];

export class TerminologyManager {
  constructor() {
    this.storageKey = "vet_prescription_terms";
    this.versionKey = "vet_prescription_terms_version";
    this.CURRENT_VERSION = "2.3_kementan_ri_simm_added";
    this.terms = this.loadTerms();
  }

  loadTerms() {
    const savedVersion = localStorage.getItem(this.versionKey);
    const saved = localStorage.getItem(this.storageKey);

    if (saved && savedVersion === this.CURRENT_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_PRESCRIPTION_TERMS.length) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved terminology:", e);
      }
    }

    // Refresh to latest comprehensive database
    localStorage.setItem(this.versionKey, this.CURRENT_VERSION);
    localStorage.setItem(this.storageKey, JSON.stringify(INITIAL_PRESCRIPTION_TERMS));
    return [...INITIAL_PRESCRIPTION_TERMS];
  }

  saveTerms() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.terms));
  }

  getAll() {
    return this.terms;
  }

  search(query) {
    if (!query || query.trim() === "") return this.terms;
    const q = query.toLowerCase().trim();
    return this.terms.filter(t => 
      t.code.toLowerCase().includes(q) ||
      t.latin.toLowerCase().includes(q) ||
      (t.english && t.english.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.usage && t.usage.toLowerCase().includes(q))
    );
  }

  findByCode(code) {
    if (!code) return null;
    const clean = code.trim().toLowerCase();
    return this.terms.find(t => t.code.toLowerCase() === clean);
  }

  addTerm(newTerm) {
    if (!newTerm.code || !newTerm.english) {
      throw new Error("Term must include at least code and description.");
    }
    const existingIndex = this.terms.findIndex(t => t.code.toLowerCase() === newTerm.code.trim().toLowerCase());
    if (existingIndex >= 0) {
      this.terms[existingIndex] = { ...this.terms[existingIndex], ...newTerm };
    } else {
      this.terms.push(newTerm);
    }
    this.saveTerms();
    return newTerm;
  }

  deleteTerm(code) {
    this.terms = this.terms.filter(t => t.code.toLowerCase() !== code.trim().toLowerCase());
    this.saveTerms();
  }

  resetToDefaults() {
    this.terms = [...INITIAL_PRESCRIPTION_TERMS];
    localStorage.setItem(this.versionKey, this.CURRENT_VERSION);
    this.saveTerms();
    return this.terms;
  }
}
