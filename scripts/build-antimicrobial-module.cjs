const fs = require('fs');
const path = require('path');

const srcJsonPath = 'c:/Users/wedia/Downloads/guide_antimicrobial_use_dogs_cats.json';
const src = JSON.parse(fs.readFileSync(srcJsonPath, 'utf8'));

const aliasMap = {
  'Amoxycillin': ['amoxicillin', 'amoxycillin', 'amox'],
  'Ampicillin': ['ampicillin', 'ampi'],
  'Penicillin': ['penicillin', 'penicillin-g', 'procaine penicillin', 'penicillin g'],
  'Amoxycillin clavulanic acid': ['amoxicillin-clavulanate', 'co-amoxiclav', 'amoxycillin clavulanate', 'clavulanic', 'clavulanate', 'augmentin', 'clavamox'],
  'Cefazolin': ['cefazolin', 'cephazolin', 'cefalotin'],
  'Cephalexin': ['cephalexin', 'cefalexin', 'keflex', 'cephaseptin'],
  'Cefovecin': ['cefovecin', 'convenia'],
  'Ceftazidime': ['ceftazidime', 'fortum'],
  'Cefotaxime': ['cefotaxime', 'claforan'],
  'Doxycycline': ['doxycycline', 'doxy'],
  'Trimethoprim sulphonamide': ['trimethoprim-sulphonamide', 'trimethoprim', 'sulfamethoxazole', 'co-trimoxazole', 'tms', 'bactrim'],
  'Gentamicin': ['gentamicin', 'gentamycin'],
  'Metronidazole': ['metronidazole', 'flagyl'],
  'Nitrofurantoin': ['nitrofurantoin', 'furadantin'],
  'Clindamycin': ['clindamycin', 'antirobe'],
  'Chloramphenicol': ['chloramphenicol'],
  'Polymyxin B': ['polymyxin-b', 'polymyxin b', 'surolan'],
  'Enrofloxacin': ['enrofloxacin', 'baytril'],
  'Marbofloxacin': ['marbofloxacin', 'marbocyl', 'zeniquin'],
  'Pradofloxacin': ['pradofloxacin', 'veraflox'],
  'Ciprofloxacin': ['ciprofloxacin', 'cipro']
};

const enrichedClasses = src.antibiotic_pharmacotherapy_by_class.map(item => {
  const aliases = aliasMap[item.antibiotic] || [item.antibiotic.toLowerCase()];
  
  // Specific interactions extraction
  const interactions = [];
  if (item.antibiotic.includes('Amoxycillin') || item.antibiotic === 'Ampicillin' || item.antibiotic === 'Penicillin') {
    interactions.push('Sinergis dengan aminoglikosida (Gentamicin). Efek bakterisid dapat dihambat bila dikombinasikan dengan antibiotik bakteriostatik (Tetracycline, Chloramphenicol).');
  }
  if (item.antibiotic.includes('Cef') || item.antibiotic.includes('Ceph')) {
    interactions.push('Sinergis dengan aminoglikosida. Potensi nefrotoksisitas meningkat bila dikombinasikan dengan obat nefrotoksik atau diuretik kuat (Furosemide).');
  }
  if (item.drug_class === 'Aminoglycosides') {
    interactions.push('Sinergis kuat dengan beta-laktam. DILARANG dicampur dalam spuit atau botol infus yang sama dengan beta-laktam karena memicu inaktivasi kimia langsung.');
    interactions.push('Risiko nefrotoksisitas melonjak jika diberikan bersama NSAID (Meloxicam, Ketoprofen) atau Furosemide.');
  }
  if (item.drug_class === 'Fluoroquinolones') {
    interactions.push('Absorpsi oral terhambat drastis (>50%) oleh antasida, sucralfate, atau suplemen Kalsium, Magnesium, Besi, dan Zinc (kelasi kation).');
    interactions.push('Injeksi IV: Mengalami presipitasi/kelasi bila dicampur dengan cairan infus mengandung Kalsium (misal Ringer Laktat) atau Magnesium.');
    interactions.push('Menghambat metabolisme hepatik teofilin (Theophylline), meningkatkan risiko toksisitas teofilin.');
    interactions.push('Antagonis dengan Chloramphenicol dan Rifampisin.');
  }
  if (item.antibiotic === 'Nitrofurantoin') {
    interactions.push('Antagonis dengan fluoroquinolones (Enrofloxacin, Marbofloxacin). Probenecid menghambat ekskresi ginjal nitrofurantoin.');
  }
  if (item.antibiotic === 'Clindamycin') {
    interactions.push('Antagonis kompetitif dengan Erythromycin dan Chloramphenicol (berikatan pada subunit ribosom 50S yang sama).');
    interactions.push('Memperkuat efek blokade neuromuskular dari obat anestesi.');
  }
  if (item.antibiotic === 'Chloramphenicol') {
    interactions.push('Inhibitor poten enzim sitokrom P450 hepar: Menurunkan klirens metabolik Phenobarbital dan Pentobarbital (risiko depresi SSP berat dan toksisitas).');
    interactions.push('Antagonis dengan penisilin, sefalosporin, dan fluoroquinolon.');
  }
  if (item.antibiotic.includes('Trimethoprim')) {
    interactions.push('Efek sinergis potensiasi antara Trimethoprim dan Sulfonamide menghambat sintesis asam folat berturutan.');
  }
  if (item.antibiotic === 'Metronidazole') {
    interactions.push('Phenobarbital mempercepat metabolisme metronidazole. Cimetidine memperlambat metabolisme metronidazole dan meningkatkan risiko efek samping SSP.');
  }
  if (item.antibiotic === 'Doxycycline') {
    interactions.push('Kation divalen/trivalen (kalsium, susu, zat besi, antasida) mengkelasi doksisiklin dan menurunkan absorpsi oral.');
    interactions.push('Phenobarbital dan Phenytoin dapat memperpendek waktu paruh eliminasi doksisiklin.');
  }

  // PK/PD classification
  let pkPdType = 'Time-dependent (T > MIC)';
  let pkPdGuidance = 'Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).';
  if (item.drug_class === 'Fluoroquinolones' || item.drug_class === 'Aminoglycosides' || item.antibiotic === 'Metronidazole') {
    pkPdType = 'Concentration-dependent (Cmax : MIC > 8)';
    pkPdGuidance = 'Optimasi pembunuhan bakteri dengan memaksimalkan konsentrasi puncak (Cmax/MIC > 8). Dosis tinggi interval panjang (sekali sehari / q24h) meningkatkan efikasi dan efek pasca-antibiotik (PAE).';
  }

  // First line recommendations & Stewardship tag
  let stewardshipLabel = 'Lini Pertama (Low Importance - ASTAG)';
  let stewardshipColor = 'green';
  let stewardshipBadge = 'ASTAG Low (Lini 1)';
  if (item.importance_rating === 'Medium') {
    stewardshipLabel = 'Lini Kedua / Terbatas (Medium Importance - ASTAG)';
    stewardshipColor = 'amber';
    stewardshipBadge = 'ASTAG Medium (Lini 2)';
  } else if (item.importance_rating === 'High') {
    stewardshipLabel = 'Kritis / Cadangan (High Importance - ASTAG: Hanya Kasus Luar Biasa Berdasarkan C&S)';
    stewardshipColor = 'red';
    stewardshipBadge = 'ASTAG High (Kritis - C&S Only)';
  }

  return {
    ...item,
    aliases,
    pkPdType,
    pkPdGuidance,
    stewardshipLabel,
    stewardshipColor,
    stewardshipBadge,
    interactions
  };
});

const moduleContent = `/**
 * Panduan Penggunaan Antimikroba pada Anjing dan Kucing
 * Berdasarkan Pedoman Ilmiah "Guide for Antimicrobial Use in Dogs and Cats"
 * (The University of Melbourne, NCAS, APCAH, Agriculture Victoria - Kampanye "Not All Bugs Need Drugs")
 * Dikombinasikan dengan sistem ASTAG (Antimicrobial Importance Rating System).
 */

export const ANTIMICROBIAL_STEWARDSHIP_DATA = {
  metadata: ${JSON.stringify(src.document_metadata, null, 2)},
  
  pkPdPrinciples: ${JSON.stringify(src.pharmacokinetics_and_pharmacodynamics, null, 2)},

  spectrumOfActivity: ${JSON.stringify(src.spectrum_of_activity, null, 2)},

  classes: ${JSON.stringify(enrichedClasses, null, 2)},

  mrspFactSheet: ${JSON.stringify(src.mrsp_dermatology_fact_sheet, null, 2)}
};

/**
 * Mencari profil antimikroba dari database berdasarkan nama obat, id, atau zat aktif
 */
export function findAntimicrobialProfile(drugQuery = "") {
  if (!drugQuery) return null;
  const q = drugQuery.toLowerCase().trim();

  return ANTIMICROBIAL_STEWARDSHIP_DATA.classes.find(item => {
    if (item.antibiotic.toLowerCase() === q) return true;
    if (item.aliases && item.aliases.some(a => q.includes(a) || a.includes(q))) return true;
    return false;
  }) || null;
}

/**
 * Memeriksa peringatan resiko klinis antimikroba spesifik (Dynamic Risk Alerts)
 */
export function checkAntimicrobialClinicalWarnings({
  species = "canine",
  drugQuery = "",
  doseRate = 0,
  formulation = "",
  weight = 0,
  breed = "",
  ageMonths = 24,
  isPregnant = false
} = {}) {
  const alerts = [];
  const s = (species || "").toLowerCase();
  const q = (drugQuery || "").toLowerCase();
  const form = (formulation || "").toLowerCase();
  const b = (breed || "").toLowerCase();
  const rate = parseFloat(doseRate) || 0;

  const profile = findAntimicrobialProfile(q);

  // 1. Enrofloxacin pada Kucing (Retinotoksisitas / Kebutaan)
  if ((s.includes("cat") || s.includes("kucing") || s.includes("feline")) && (q.includes("enrofloxacin") || q.includes("baytril"))) {
    if (rate > 5) {
      alerts.push({
        level: "fatal",
        title: "⛔ KONTRAINDIKASI FATAL (KUCING): RISIKO KEBUTAAN",
        badge: "Retinal Detachment",
        message: "Dosis Enrofloxacin > 5 mg/kg pada kucing memicu degenerasi retina akut, pelepasan retina (retinal detachment), dan kebutaan total permanen! Maksimal dosis adalah 5 mg/kg q24h slow IV, atau ganti dengan antimikroba lain."
      });
    } else {
      alerts.push({
        level: "warning",
        title: "⚠️ PERINGATAN RETINOTOKSISITAS KUCING (ENROFLOXACIN)",
        badge: "Feline Retinopathy",
        message: "Enrofloxacin memiliki risiko pelepasan retina pada kucing. Risiko melonjak pada kucing tua (geriatri) atau yang menderita gangguan ginjal. Jangan melebihi 5 mg/kg/hari dan pantau respon pupil."
      });
    }
  }

  // 2. Fluoroquinolone pada Anjing Sedang Tumbuh (Artropati / Kerusakan Kartilago)
  if ((s.includes("dog") || s.includes("anjing") || s.includes("canine")) && 
      (q.includes("enrofloxacin") || q.includes("marbofloxacin") || q.includes("pradofloxacin") || q.includes("ciprofloxacin"))) {
    alerts.push({
      level: "warning",
      title: "⚠️ RISIKO ARTHROPATHY & KARTILAGO (ANJING MUDA)",
      badge: "Cartilage Toxicity",
      message: "Fluoroquinolone merusak kartilago artikular sendi pada anjing dalam masa pertumbuhan (<8 bulan pada ras kecil, <12-18 bulan pada ras besar). Kontraindikasi untuk anakan sedang tumbuh."
    });
    alerts.push({
      level: "warning",
      title: "⚠️ BAHAYA TOXIC SHOCK & FASITIS (STREPTOCOCCUS CANIS)",
      badge: "S. canis Alert",
      message: "Penggunaan fluoroquinolone pada infeksi Streptococcus canis memicu Canine Toxic Shock Syndrome dan necrotizing fasciitis yang berakibat fatal. Selalu konfirmasi patogen."
    });
  }

  // 3. Ciprofloxacin Oral pada Anjing (Inkompetensi Farmakokinetik)
  if ((s.includes("dog") || s.includes("anjing") || s.includes("canine")) && q.includes("ciprofloxacin") && (form.includes("tab") || form.includes("oral") || form.includes("caps"))) {
    alerts.push({
      level: "warning",
      title: "⛔ HINDARI CIPROFLOXACIN ORAL PADA ANJING",
      badge: "Poor Bioavailability",
      message: "Bioavailabilitas oral Ciprofloxacin pada anjing sangat rendah dan tidak menentu (~50%). Umumnya gagal mencapai target terapetik untuk Staphylococcus dan Pseudomonas aeruginosa. Gunakan Enrofloxacin atau Marbofloxacin resmi veteriner."
    });
  }

  // 4. Trimethoprim Sulphonamide (TMS)
  if (q.includes("trimethoprim") || q.includes("sulphonamide") || q.includes("tms") || q.includes("bactrim")) {
    if (b.includes("doberman") || b.includes("pinscher")) {
      alerts.push({
        level: "fatal",
        title: "⛔ KONTRAINDIKASI MUTLAK: RAS DOBERMAN PINSCHER",
        badge: "Breed Idiosyncrasy",
        message: "Dilarang keras pada anjing ras Doberman Pinschers! Berisiko sangat tinggi mengalami reaksi hipersensitivitas imun idiosinkratik fatal, poliartritis, anemia aplastik, dan nekrosis hati."
      });
    }
    if (s.includes("dog") || s.includes("anjing")) {
      alerts.push({
        level: "warning",
        title: "⚠️ RISIKO KCS / DRY EYE & HIPOTIROIDISME (TMS)",
        badge: "Keratoconjunctivitis Sicca",
        message: "Pada anjing < 12 kg, terapi 1 minggu TMS menurunkan produksi air mata 15%. Dosis berlebih memicu KCS permanen. Jika terapi > 7 hari, wajib lakukan baseline & evaluasi berkala Schirmer Tear Test (STT)."
      });
    }
    if (s.includes("cat") || s.includes("kucing")) {
      alerts.push({
        level: "info",
        title: "ℹ️ HIPERSALIVASI KUCING (TABLET TMS)",
        badge: "Feline Salivation",
        message: "Kucing akan mengalami hipersalivasi parah (mulut berbusa) jika pelindung tablet TMS dipecah/digerus karena rasa obat sangat pahit. Berikan dalam cangkang kapsul utuh."
      });
    }
  }

  // 5. Clindamycin pada Kucing (Esophagitis / Striktur Esofagus)
  if ((s.includes("cat") || s.includes("kucing") || s.includes("feline")) && q.includes("clindamycin")) {
    if (form.includes("caps") || form.includes("kapsul") || form.includes("tab")) {
      alerts.push({
        level: "warning",
        title: "⚠️ RISIKO STRIKTUR ESOFAGUS (KUCING)",
        badge: "Esophageal Stricture",
        message: "Kapsul clindamycin generik yang tersangkut di esofagus kucing memicu esophagitis nekrotik dan striktur esofagus permanen. WAJIB disusul dorongan air minum 3-5 mL via spuit atau sedikit pakan basah."
      });
    }
  }

  // 6. Doxycycline pada Kucing & Pediatrik
  if (q.includes("doxycycline") || q.includes("doksisiklin")) {
    if (s.includes("cat") || s.includes("kucing") || s.includes("feline")) {
      alerts.push({
        level: "warning",
        title: "⚠️ RISIKO STRIKTUR ESOFAGUS KUCING (DOXYCYCLINE)",
        badge: "Esophageal Ulceration",
        message: "Tablet doksisiklin yang tersangkut di mukosa esofagus kucing memicu ulkus dan striktur esofagus fatal. Selalu berikan dorongan air minum (5-10 mL) sesudah tablet ditelan."
      });
    }
    if (ageMonths < 6 || isPregnant) {
      alerts.push({
        level: "warning",
        title: "⚠️ PEWARNAAN GIGI KUNING & GANGGUAN TULANG",
        badge: "Teeth Discolouration",
        message: "Doksisiklin mengikat kalsium pada gigi yang sedang tumbuh dan fetus, menyebabkan pewarnaan kuning kecokelatan permanen pada gigi dan displasia email."
      });
    }
  }

  // 7. Gentamicin (Aminoglikosida)
  if (q.includes("gentamicin") || q.includes("gentamisin")) {
    alerts.push({
      level: "warning",
      title: "⚠️ NEFROTOKSISITAS & OTOTOKSISITAS (GENTAMICIN)",
      badge: "Renal & Ear Safety",
      message: "Gentamicin bersifat nefrotoksik dan ototoksik. Pastikan hidrasi cairan dan elektrolit optimal. DILARANG bersamaan dengan NSAID (Meloxicam) atau Furosemide. Inaktif bila ada debris nanah/purulen."
    });
  }

  // 8. Metronidazole (SSP & Hepatotoksisitas)
  if (q.includes("metronidazole") || q.includes("flagyl")) {
    alerts.push({
      level: "warning",
      title: "⚠️ NEUROTOKSISITAS SSP & PERINGATAN HEPAR",
      badge: "CNS Toxicity",
      message: "Pada pasien gangguan fungsi hepar, turunkan dosis ke 7.5 mg/kg untuk mencegah akumulasi toksisitas SSP (ataksia, nistagmus, kejang). Kontraindikasi pada trimester 1 kebuntingan. Tidak diindikasikan pada diare akut tanpa bukti sepsis."
    });
  }

  // 9. Nitrofurantoin (Lower UTI Only)
  if (q.includes("nitrofurantoin")) {
    alerts.push({
      level: "warning",
      title: "⚠️ HANYA UNTUK ISK BAWAH (LOWER UTI)",
      badge: "No Tissue Levels",
      message: "Hanya mencapai konsentrasi terapetik di urine (bukan jaringan). Dilarang untuk pyelonephritis atau prostatitis. Antagonis dengan fluoroquinolones. Hindari pada gangguan ginjal."
    });
  }

  // 10. Chloramphenicol (Depresi Sumsum Tulang & Keamanan Operator)
  if (q.includes("chloramphenicol") || q.includes("kloramfenikol")) {
    alerts.push({
      level: "warning",
      title: "⚠️ DEPRESI SUMSUM TULANG & KEAMANAN OPERATOR",
      badge: "Aplastic Anemia Risk",
      message: "Kucing sangat sensitif terhadap depresi sumsum tulang reversibel (muncul dalam 2 minggu). Operator/dokter WAJIB memakai sarung tangan dan masker karena kontak manusia dapat memicu anemia aplastik idiosinkratik fatal."
    });
  }

  // 11. High Importance ASTAG Stewardship Badge
  if (profile && profile.importance_rating === "High") {
    alerts.push({
      level: "info",
      title: "🔴 ANTIMICROBIAL STEWARDSHIP: KATEGORI TINGGI (ASTAG HIGH)",
      badge: "Culture & Susceptibility Only",
      message: "Obat ini termasuk kategori High Importance (kritis). Menurut pedoman University of Melbourne & AgVic, obat ini HANYA boleh diresepkan untuk keadaan luar biasa berdasarkan hasil uji Kultur & Sensitivitas (C&S) ketika tidak ada alternatif lain yang memadai."
    });
  }

  return alerts;
}

/**
 * Menghasilkan ringkasan interaksi dan pedoman stewardship untuk UI
 */
export function getAntimicrobialSummaryCard(drugQuery = "") {
  const profile = findAntimicrobialProfile(drugQuery);
  if (!profile) return null;

  return {
    name: profile.antibiotic,
    drugClass: profile.drug_class,
    importanceRating: profile.importance_rating,
    stewardshipLabel: profile.stewardshipLabel,
    stewardshipBadge: profile.stewardshipBadge,
    stewardshipColor: profile.stewardshipColor,
    registeredForAnimals: profile.registered_for_animals,
    routes: profile.routes,
    recommendedDose: profile.drug_dose,
    pkPdType: profile.pkPdType,
    pkPdGuidance: profile.pkPdGuidance,
    adverseReactions: profile.adverse_reactions,
    clinicalPearls: profile.clinical_pearls,
    interactions: profile.interactions
  };
}
`;

fs.writeFileSync(path.join(__dirname, '../public/js/antimicrobial-guide-data.js'), moduleContent, 'utf8');
console.log('Successfully created public/js/antimicrobial-guide-data.js!');
