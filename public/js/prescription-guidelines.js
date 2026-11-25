import { checkAntimicrobialClinicalWarnings } from "./antimicrobial-guide-data.js";
/**
 * Veterinary Prescription Guidelines & Calculation Algorithm
 * Sourced from: Adaptasi Pedoman Keterampilan Klinis Penulisan Resep Standar Kedokteran Hewan
 * (Regulasi Obat Hewan Kementan RI & Farmakologi Veteriner)
 */

export const VET_PRESCRIPTION_ALGORITHM = {
  metadata: {
    title: "Panduan & Algoritma Peresepan Obat Hewan (Veterinary Prescription)",
    authority: "Dokter Hewan (drh.) yang memiliki Surat Izin Praktik Dokter Hewan (SIP-DRH)",
    source: "Adaptasi Pedoman Keterampilan Klinis Penulisan Resep ke Standar Kedokteran Hewan (Regulasi Obat Hewan Kementan RI & Farmakologi Veteriner)"
  },

  stages: [
    {
      id: "stage-1",
      number: "Tahap 1",
      title: "Evaluasi Klinis & Pertimbangan Pra-Resep",
      badge: "Diagnosis & 6 Tepat",
      summary: "Pertanyaan mendasar dan prinsip rasionalitas yang harus dipastikan Dokter Hewan sebelum menulis resep.",
      keyQuestions: [
        "Apa tujuan spesifik terapi? (Kausatif, simtomatik, profilaktik, atau metafilik massal ternak).",
        "Apa spesies, ras (breed), dan tujuan pemeliharaan? (Hewan kesayangan/pet, satwa eksotik, atau ternak pangan).",
        "Apakah obat aman untuk spesies dan ras ini? (Waspada idiosinkrasi: toksisitas Parasetamol pada kucing, defisiensi gen MDR-1 pada anjing Collie).",
        "Apa Bentuk Sediaan Obat (BSO) dan rute yang paling mudah diberikan tanpa memicu stres pada hewan?",
        "Berapa dosis akurat berdasarkan Berat Badan aktual (mg/kgBB)? Rumus umur manusia TIDAK BERLAKU.",
        "Jika pasien ternak (sapi, kambing, unggas): berapa lama Waktu Henti Obat (Withdrawal Time) untuk daging, susu, atau telur?",
        "Bagaimana tingkat kepatuhan pemilik (owner compliance) dan kemampuan finansialnya?"
      ],
      principles: [
        { label: "6 Tepat Veteriner", items: ["Tepat Indikasi & Diagnosis", "Tepat Spesies & Pasien (fisiologi unik tiap spesies)", "Tepat Obat (teregistrasi Kementan RI / Extra-Label Drug Use ilmiah)", "Tepat Dosis (wajib terukur per kgBB aktual)", "Tepat BSO & Rute Pemberian", "Tepat Waktu Pemberian & Durasi Terapi"] },
        { label: "4T + 2W", items: ["Tepat Obat", "Tepat Dosis", "Tepat BSO", "Tepat Spesies/Penderita", "Waspada Efek Samping & Toksisitas Spesies", "Waspada Residu Obat & Resistensi Antimikroba (AMR)"] }
      ],
      irrationalRisks: [
        "Dilarang menggunakan antibiotik sebagai pemacu tumbuh (Antibiotic Growth Promoter / AGP) pada pakan ternak.",
        "Dilarang menganggap kucing sebagai 'anjing ukuran kecil' karena jalur metabolismenya sangat berbeda.",
        "Hindari polifarmasi puyer yang sangat pahit (gunakan kapsul 'da in caps.' untuk kucing/anjing).",
        "Dilarang mengabaikan waktu henti obat (withdrawal time) pada ternak pangan yang menghasilkan daging, susu, atau telur."
      ]
    },

    {
      id: "stage-2",
      number: "Tahap 2",
      title: "Penyesuaian Kondisi Spesies & Algoritma Dosis",
      badge: "Perhitungan Akurat",
      summary: "Perhitungan dosis wajib berbasis Berat Badan Aktual (mg/kgBB) atau Luas Permukaan Tubuh (BSA).",
      formulas: [
        {
          name: "Dosis Terapetik Sekali Beri (mg)",
          formula: "Dosis Sekali (mg) = Dosis Anjuran (mg/kg) × Berat Badan Aktual (kg)",
          explanation: "Menghitung jumlah miligram zat aktif yang wajib diterima hewan dalam satu kali minum/injeksi."
        },
        {
          name: "Volume Sediaan Cair / Injeksi (ml)",
          formula: "Volume (ml) = Dosis Sekali (mg) ÷ Konsentrasi Sediaan (mg/ml)",
          explanation: "Menghitung mililiter sediaan sirup, suspensi, atau cairan injeksi yang harus disuapkan via spuit tanpa jarum atau diinjeksikan."
        },
        {
          name: "Jumlah Tablet / Kapsul Satuan",
          formula: "Jumlah Tablet = Dosis Sekali (mg) ÷ Kekuatan Tablet Stok (mg/tab)",
          explanation: "Menghitung fraksi atau jumlah tablet yang harus diberikan (misal: 1/2 tablet atau 1 tablet)."
        },
        {
          name: "Total Kebutuhan Obat Terapi Penuh",
          formula: "Total Obat = Dosis Sekali × Frekuensi Harian (misal: 2×) × Durasi Hari Terapi",
          explanation: "Menghitung total keseluruhan tablet atau volume sirup untuk kebutuhan pengobatan hingga tuntas."
        }
      ],
      speciesPrecautions: [
        {
          species: "Kucing (Feline)",
          severity: "danger",
          icon: "ph-cat",
          warning: "Defisiensi Glukoronil Transferase: KONTRAINDIKASI FATAL untuk Parasetamol (Acetaminophen). Memicu methemoglobinemia, sianosis, edema wajah, nekrosis hati, dan kematian mendadak."
        },
        {
          species: "Anjing (Canine)",
          severity: "warning",
          icon: "ph-dog",
          warning: "Defek Genetik MDR-1 (Collie, Australian Shepherd): Sangat sensitif terhadap Ivermectin dosis tinggi, Loperamide, dan Acepromazine. Hati-hati sirup manusia mengandung Xylitol (sangat toksik memicu hipoglikemia akut & nekrosis hati)."
        },
        {
          species: "Ruminansia (Sapi, Kambing, Domba)",
          severity: "warning",
          icon: "ph-cow",
          warning: "Hindari antibiotik spektrum luas per-oral (PO) pada ruminansia dewasa karena mematikan mikroflora rumen. Hindari Xylazine pada bunting trimester akhir (memicu kontraksi uterus & abortus). Wajib cantumkan Waktu Henti Obat (Withdrawal Time)!"
        },
        {
          species: "Kelinci & Rodensia (Hindgut Fermenters)",
          severity: "danger",
          icon: "ph-rabbit",
          warning: "Dilarang keras pemberian antibiotik oral golongan Penisilin (Amoksisilin, Ampisilin), Lincomycin, Clindamycin, atau Erythromycin karena memicu dysbiosis fatal dan enterotoxemia Clostridium difficile."
        },
        {
          species: "Pediatrik (Puppy / Kitten < 8 minggu)",
          severity: "warning",
          icon: "ph-baby",
          warning: "Fungsi hati dan ginjal belum matang sempurna. Hindari Fluoroquinolone (Enrofloxacin) karena merusak kartilago artikular sendi, dan hindari Tetracycline karena menyebabkan pewarnaan kuning permanen pada gigi."
        },
        {
          species: "Kondisi Patologis (Hepar & Ginjal/CKD)",
          severity: "info",
          icon: "ph-first-aid-kit",
          warning: "Penyakit Hati: Turunkan dosis obat hepatik (Phenobarbital, Diazepam), berikan SAMe/Silymarin. Penyakit Ginjal (CKD): Hindari nefrotoksik (Gentamicin, NSAID tanpa rehidrasi), perpanjang interval obat eliminasi ginjal."
        }
      ]
    },

    {
      id: "stage-3",
      number: "Tahap 3",
      title: "Pemilihan Bentuk Sediaan (BSO) & Rute Veteriner",
      badge: "Formulasi Praktis",
      summary: "Memilih sediaan yang paling mudah diberikan pemilik tanpa memicu trauma atau stres berlebih pada pasien hewan.",
      routes: [
        {
          name: "Rute Oral (Per-os / PO)",
          details: [
            "Tablet Chewable / Flavored: Paling disukai anjing karena beraroma daging/hati.",
            "Kapsul ('da in caps.'): Sangat direkomendasikan untuk racikan puyer kucing dan anjing guna menutupi rasa pahit dan mencegah hipersalivasi/mulut berbusa.",
            "Pulveres (Puyer): Dicampur sedikit wet food atau dilarutkan air sedikit lalu disuapkan via spuit tanpa jarum.",
            "Sirup / Suspensi Oral: Diberikan perlahan melalui celah sudut bibir belakang (commissura labiorum) menggunakan spuit.",
            "Bolus: Tablet ukuran besar khusus sapi/kuda yang dimasukkan dengan balling gun.",
            "WSP (Water Soluble Powder): Serbuk larut air minum untuk medikasi massal unggas atau kawanan ternak."
          ]
        },
        {
          name: "Rute Topikal & Spesifik Veteriner",
          details: [
            "Spot-on (Tetes Tengkuk): Diteteskan langsung ke kulit leher/tengkuk hewan agar tidak dapat dijilat.",
            "Pour-on: Dituang di sepanjang garis punggung (backline) sapi atau domba untuk antiparasit.",
            "Intramammary Infusion: Syringe tumpul steril untuk dimasukkan ke puting ambing sapi perah yang terkena mastitis.",
            "Dip / Medicated Shampoo: Mandi celup untuk skabies, demodekosis, atau jamur kulit.",
            "Salep / Krim / Gel: Wajib dipasangkan Elizabeth Collar (E-collar) pada hewan agar luka tidak dijilat."
          ]
        },
        {
          name: "Rute Parenteral (Injeksi)",
          details: [
            "Subkutan (SC): Di bawah kulit tengkuk/scruff, rute paling aman dan nyaman untuk anjing dan kucing.",
            "Intramuskular (IM): Di otot paha belakang (semitendinosus), otot epaksial lumbal, atau otot leher sapi/kuda.",
            "Intravena (IV): Langsung ke pembuluh darah vena cephalica, vena saphena, atau vena jugularis."
          ]
        }
      ]
    },

    {
      id: "stage-4",
      number: "Tahap 4",
      title: "Standar Penulisan Resep Resmi Veteriner",
      badge: "Format Legal drh",
      summary: "7 Kelengkapan unsur resep resmi dokter hewan sesuai regulasi farmakologi veteriner Indonesia.",
      elements: [
        { no: "1", name: "Inscriptio Awal (Kepala Resep)", desc: "Nama lengkap dokter hewan + gelar drh., Nomor SIP-DRH aktif, Alamat klinik/praktik, No. Telepon, Nama Kota & Tanggal resep." },
        { no: "2", name: "Superscriptio", desc: "Simbol R/ (Recipe: ambillah)." },
        { no: "3", name: "Inscriptio (Inti Resep)", desc: "Nama obat paten atau zat generik disertai kekuatan sediaan (mg, %, ml, IU)." },
        { no: "4", name: "Subscriptio", desc: "Bentuk sediaan obat (BSO) dan jumlah yang diminta dalam angka Romawi (contoh: No. X, No. XIV da in caps.)." },
        { no: "5", name: "Signatura (S)", desc: "Aturan pakai, dosis pemberian, rute, frekuensi pemberian dalam singkatan Latin resmi, serta catatan khusus (misal: p.c., Waktu Henti Susu: 72 jam)." },
        { no: "6", name: "Penutup", desc: "Garis penutup di akhir obat disertai paraf resmi dokter hewan." },
        { no: "7", name: "Identitas Pasien & Pemilik (Pro)", desc: "WAJIB mencantumkan Nama Pasien, Spesies, Ras, Umur, BERAT BADAN (kg) AKTUAL, serta Nama dan Alamat Pemilik (Owner)." }
      ],
      specialRules: [
        "Tanda Seru (!) pada Dosis Besar: Apabila dosis hewan besar (misal anjing 40 kg atau sapi) terlihat sangat tinggi dibanding dosis manusia, bubuhkan tanda seru (!) dan paraf agar apoteker apotek manusia yakin melayani resep.",
        "Resep Stok Klinik Mandiri: Gunakan 'Pro: Klinik Hewan [Nama] / drh. [Nama]' dan aturan pakai 'S u.p.' (usus propius - untuk dipakai sendiri) atau 'S i.m.m.' (in manum medici - serahkan ke tangan dokter hewan)."
      ]
    }
  ]
};

export const VET_CLINICAL_PRESETS = [
  {
    id: "preset-cat-uri",
    title: "🐱 Kucing: Flu / URI Racikan Kapsul",
    subtitle: "Doxycycline + Bromhexine + CTM (da in caps. DTD)",
    caseDescription: "Kucing domestik (BB 4 kg) mengalami Feline Upper Respiratory Infection (Flu Kucing) dengan bersin dan sekret mukopurulen. Diberikan racikan antibiotik, mukolitik, dan antihistamin dalam cangkang kapsul agar tidak pahit/hipersalivasi.",
    patient: {
      name: "Momo",
      species: "feline",
      breed: "Kucing Domestik",
      age: "2 tahun",
      weight: 4,
      ownerName: "Ny. Rina",
      ownerAddress: "Jl. Melati No. 10",
      diagnosis: "Feline Upper Respiratory Infection (Flu Kucing)"
    },
    compounding: {
      hasDtd: true,
      command: "mfla pulv.",
      packaging: "da in caps",
      totalPacks: 14,
      signa: "s.2.dd caps. I p.c.",
      notes: "Berikan sedikit pakan basah atau air minum setelah kapsul ditelan. Kapsul mencegah hipersalivasi/mulut berbusa.",
      ingredients: [
        { name: "Doxycycline", dosePerPack: 20, unit: "mg", stockStrength: 100, strengthUnit: "mg", formulationCode: "caps", totalStockUnits: 2.8 },
        { name: "Bromhexine HCl", dosePerPack: 4, unit: "mg", stockStrength: 8, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 7 },
        { name: "CTM (Chlorpheniramine)", dosePerPack: 1, unit: "mg", stockStrength: 4, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 3.5 }
      ]
    }
  },

  {
    id: "preset-dog-otitis",
    title: "🐶 Anjing: Otitis Eksterna Bilateral",
    subtitle: "Surolan Tetes Telinga (gtt. auric. dext. et sin.)",
    caseDescription: "Anjing Golden Retriever (BB 28 kg) mengalami Otitis Eksterna bilateral akibat infeksi campuran bakteri dan jamur Malassezia. Diberikan suspensi tetes telinga kombinasi antijamur, antibiotik, dan kortikosteroid.",
    patient: {
      name: "Max",
      species: "canine",
      breed: "Golden Retriever",
      age: "4 tahun",
      weight: 28,
      ownerName: "Bp. Budi",
      ownerAddress: "Jl. Dahlia No. 4",
      diagnosis: "Otitis Eksterna Bilateral"
    },
    singleDose: {
      drugId: "amoxicillin", // default fallback or custom
      drugName: "Surolan (Miconazole, Polymyxin B, Prednisolone)",
      formulation: "Tetes Telinga (gtt. auric.) botol 15 ml",
      doseRate: 1,
      frequencyCode: "s.2.dd",
      durationDays: 14,
      signa: "s.2.dd gtt. IV auric. dext. et sin.",
      notes: "Teteskan masing-masing 4 tetes ke telinga kanan dan kiri setiap 12 jam sesudah liang telinga dibersihkan dengan pembersih telinga antiseptik."
    }
  },

  {
    id: "preset-puppy-pyoderma",
    title: "🐶 Anak Anjing: Pyoderma Sirup Kering",
    subtitle: "Amoksisilin Suspensi Oral ml (Spuit tanpa jarum)",
    caseDescription: "Anak anjing Pomeranian pediatrik (BB 1,5 kg, 3 bulan) menderita pyoderma superfisial. Diberikan suspensi Amoksisilin 125 mg/5 ml (25 mg/ml) dosis 20 mg/kgBB = 30 mg (setara 1,2 ml) via spuit tanpa jarum.",
    patient: {
      name: "Ciko",
      species: "canine",
      breed: "Pomeranian",
      age: "3 bulan",
      weight: 1.5,
      ownerName: "Sdr. Kevin",
      ownerAddress: "Jl. Anggrek No. 8",
      diagnosis: "Pyoderma Superfisial Kulit Pediatrik"
    },
    singleDose: {
      drugId: "amoxicillin",
      drugName: "Amoksisilin Syr Kering (125 mg/5 ml)",
      doseRate: 20,
      frequencyCode: "s.2.dd",
      durationDays: 7,
      volumeMl: 1.2,
      signa: "s.2.dd ml 1,2 p.c.",
      notes: "Suapkan 1,2 ml suspensi setiap 12 jam sesudah makan menggunakan spuit 3 cc tanpa jarum ke sudut mulut. Pastikan sediaan bebas Xylitol."
    }
  },

  {
    id: "preset-cow-mastitis",
    title: "🐄 Sapi Perah: Mastitis Klinis",
    subtitle: "Infus Intramammary + Withdrawal Time Susu 72 Jam",
    caseDescription: "Sapi Perah Friesian Holstein (BB 400 kg) mengalami mastitis klinis kuartir kanan depan pasca-melahirkan. Diberikan sediaan intramammary dengan pencantuman wajib waktu henti susu.",
    patient: {
      name: "Ear Tag 045",
      species: "bovine",
      breed: "Friesian Holstein (FH)",
      age: "4 tahun",
      weight: 400,
      ownerName: "Bp. Sutrisno",
      ownerAddress: "Boyolali, Jawa Tengah",
      diagnosis: "Mastitis Klinis Kuartir Kanan Depan"
    },
    singleDose: {
      drugId: "amoxicillin",
      drugName: "Tetra-Delta Intramammary Syr. Infusion",
      doseRate: 1,
      frequencyCode: "s.1.dd",
      durationDays: 3,
      signa: "s.1.dd syr. I intramammary kuartir kanan depan pasca-perah",
      withdrawalTime: "WAKTU HENTI SUSU (Milk Withdrawal Time): 72 JAM setelah pengobatan terakhir. Air susu tidak boleh dikonsumsi manusia!",
      notes: "Infuskan 1 syringe ke puting ambing kanan depan pasca-pemerahan tuntas sekali sehari selama 3 hari."
    }
  },

  {
    id: "preset-clinic-stock",
    title: "🩺 Stok Praktik drh: Infus & Anestesi",
    subtitle: "Ringer Laktat & Epinephrine (S i.m.m. / S u.p.)",
    caseDescription: "Dokter hewan menyiapkan stok obat emergensi dan rehidrasi intravena untuk tindakan medis darurat di klinik praktiknya sendiri.",
    patient: {
      name: "Klinik Hewan Praktik Mandiri",
      species: "clinic",
      breed: "Fasilitas Pelayanan Medis Veteriner",
      age: "-",
      weight: 0,
      ownerName: "drh. Praktik Mandiri (drh. Andi Pratama)",
      ownerAddress: "Klinik Hewan Sehat Satwa",
      diagnosis: "Kebutuhan Stok Tindakan Darurat & Bedah Klinik"
    },
    singleDose: {
      drugId: "amoxicillin",
      drugName: "Infus Ringer Laktat 500 ml (fl. No. X) & Epinephrine inj 1 mg/ml (amp. No. V)",
      doseRate: 1,
      frequencyCode: "s.u.d",
      durationDays: 1,
      signa: "S i.m.m. (in manum medici) & S u.p. (usus propius)",
      notes: "Untuk stok tindakan medis gawat darurat dan bedah internal di klinik dokter hewan."
    }
  }
];

/**
 * Check for critical species contraindications and alerts
 */
export function checkSpeciesSafety(species, drugName = "", formulation = "") {
  const alerts = [];
  const s = (species || "").toLowerCase();
  const d = (drugName || "").toLowerCase();
  const f = (formulation || "").toLowerCase();

  // 1. Cat & Paracetamol
  if (s.includes("cat") || s.includes("feline") || s.includes("kucing")) {
    if (d.includes("paracetamol") || d.includes("acetaminophen") || d.includes("panadol")) {
      alerts.push({
        level: "fatal",
        title: "⛔ KONTRAINDIKASI FATAL (KUCING)",
        message: "Kucing memiliki defisiensi enzim glukuronil transferase. Pemberian Parasetamol memicu methemoglobinemia, sianosis, nekrosis hepar akut, dan kematian dalam hitungan jam!"
      });
    }
  }

  // 2. Dog & Xylitol / MDR-1
  if (s.includes("dog") || s.includes("canine") || s.includes("anjing")) {
    if (f.includes("sirup") || f.includes("syrup") || f.includes("susp") || f.includes("oral liquid")) {
      alerts.push({
        level: "warning",
        title: "⚠️ PERINGATAN SIRUP (ANJING)",
        message: "Pastikan sediaan sirup oral bebas dari pemanis buatan Xylitol. Xylitol sangat toksik pada anjing karena memicu pelepasan insulin masif, hipoglikemia akut, dan nekrosis hati fatal."
      });
    }
    if (d.includes("ivermectin") || d.includes("loperamide")) {
      alerts.push({
        level: "warning",
        title: "⚠️ PERINGATAN RAS COLLIE / SHEPHERD (MDR-1)",
        message: "Anjing dengan mutasi genetik MDR-1 (Collie, Australian Shepherd, Sheltie) memiliki barier darah otak defektif. Hindari Ivermectin dosis tinggi dan Loperamide!"
      });
    }
  }

  // 3. Rabbit / Rodent & Oral Penicillin
  if (s.includes("rabbit") || s.includes("kelinci") || s.includes("rodent") || s.includes("guinea")) {
    if (d.includes("amoxicillin") || d.includes("amoksisilin") || d.includes("ampicillin") || d.includes("penicillin") || d.includes("clindamycin") || d.includes("lincomycin")) {
      alerts.push({
        level: "fatal",
        title: "⛔ PERINGATAN KELINCI (HINDGUT FERMENTER)",
        message: "Dilarang memberikan antibiotik beta-laktam / linkosamid secara oral pada kelinci! Mematikan flora usus normal sekum, menyebabkan enterotoksemia fatal akibat Clostridium difficile."
      });
    }
  }

  // 4. Ruminant (Cattle/Goat) & Oral Antibiotics / Withdrawal Time
  if (s.includes("bovine") || s.includes("sapi") || s.includes("kambing") || s.includes("domba") || s.includes("ruminan")) {
    alerts.push({
      level: "info",
      title: "⏱️ WAKTU HENTI OBAT (WITHDRAWAL TIME)",
      message: "Pada hewan produksi penghasil pangan, cantumkan Waktu Henti Obat (Withdrawal Time) untuk daging dan susu pada resep guna melindungi kesehatan konsumen."
    });
  }

    // Antimicrobial clinical safety warnings (Melbourne & AgVic guide)
  const amAlerts = checkAntimicrobialClinicalWarnings({
    species,
    drugQuery: drugName,
    formulation
  });
  amAlerts.forEach(a => {
    if (!alerts.some(existing => existing.title === a.title)) {
      alerts.push(a);
    }
  });

  return alerts;
}

/**
 * Clinical Preset Manager: Handles loading, saving, creating, updating, and deleting
 * prescription templates with LocalStorage persistence.
 */
export class ClinicalPresetManager {
  static STORAGE_KEY = "vet_clinical_presets_v2";

  static getPresets() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Gagal memuat preset template dari localStorage:", e);
    }
    const initial = JSON.parse(JSON.stringify(VET_CLINICAL_PRESETS));
    this.savePresets(initial);
    return initial;
  }

  static savePresets(presets) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.error("Gagal menyimpan preset template ke localStorage:", e);
    }
  }

  static getPresetById(id) {
    return this.getPresets().find(p => p.id === id);
  }

  static addPreset(preset) {
    const presets = this.getPresets();
    preset.id = preset.id || `preset-custom-${Date.now()}`;
    preset.isCustom = true;
    presets.unshift(preset);
    this.savePresets(presets);
    return preset;
  }

  static updatePreset(id, updatedData) {
    const presets = this.getPresets();
    const idx = presets.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Template tidak ditemukan.");
    presets[idx] = { ...presets[idx], ...updatedData, isCustom: true };
    this.savePresets(presets);
    return presets[idx];
  }

  static deletePreset(id) {
    let presets = this.getPresets();
    presets = presets.filter(p => p.id !== id);
    this.savePresets(presets);
    return presets;
  }

  static resetToDefaults() {
    const defaults = JSON.parse(JSON.stringify(VET_CLINICAL_PRESETS));
    this.savePresets(defaults);
    return defaults;
  }
}
