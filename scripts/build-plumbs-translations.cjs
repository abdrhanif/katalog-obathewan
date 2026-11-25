const fs = require('fs');
const path = require('path');

// 1. Curated top monographs from veterinary-translator.cjs
let CURATED = {};
try {
  const vt = require('./veterinary-translator.cjs');
  CURATED = vt.CURATED_ID_MONOGRAPHS || {};
} catch (e) {
  CURATED = {};
}

// 2. Comprehensive Medical and Veterinary Translation Dictionary
const PHRASES = [
  // Prescriber Highlights / Highlights sentences
  [/Bactericidal aminopenicillin with same spectrum as ampicillin \(ineffective against bacteria that produce beta-lactamase\)/gi, 'Aminopenisilin bakterisidal dengan spektrum antibakteri menyerupai ampisilin (tidak efektif terhadap bakteri penghasil enzim beta-laktamase).'],
  [/Most likely adverse effects are GI-related, but hypersensitivity reactions, although rare, can be severe/gi, 'Efek samping yang paling sering muncul berkaitan dengan saluran cerna (GI), namun reaksi hipersensitivitas, meskipun jarang, dapat bersifat parah.'],
  [/Give with meals \(preferably right before\); drug is not very useful if feeding ad libitum/gi, 'Berikan bersama pakan (sebaiknya tepat sebelum makan); obat kurang efektif bila pakan diberikan secara bebas (ad libitum).'],
  [/Expense may be an issue, but generics are now available/gi, 'Biaya obat dapat menjadi pertimbangan, namun sediaan generik saat ini telah tersedia.'],
  [/Unlikely to be effective when used as sole therapy/gi, 'Kemungkinan besar tidak efektif jika digunakan sebagai terapi tunggal.'],
  [/Antihyperglycemic agent that reduces the rate & amount of glucose absorbed from the gut after a meal/gi, 'Agen antihiperglikemik yang menurunkan kecepatan & jumlah penyerapan glukosa dari saluran cerna setelah makan'],
  [/Dose-dependent loose stools, diarrhea & flatulence are the adverse effects most likely to be noted/gi, 'Feses lembek tergantung dosis, diare & perut kembung (flatulensi) merupakan efek samping yang paling sering teramati.'],
  [/Safe use during pregnancy has not been established/gi, 'Keamanan penggunaan selama masa kebuntingan belum ditetapkan.'],
  [/Store at room temperature/gi, 'Simpan pada suhu ruang terkontrol (15–25°C)'],
  [/Protect from light and moisture/gi, 'Lindungi dari paparan cahaya langsung dan kelembapan.'],
  [/Protect from freezing/gi, 'Hindari pembekuan.'],
  [/Shake well before using/gi, 'Kocok merata sebelum digunakan.'],
  [/Shake well before use/gi, 'Kocok merata sebelum digunakan.'],
  [/Keep out of reach of children/gi, 'Jauhkan dari jangkauan anak-anak.'],
  [/Give with food to minimize GI upset/gi, 'Berikan bersama pakan untuk meminimalkan gangguan saluran cerna.'],
  [/Give with food/gi, 'Berikan bersama pakan.'],
  [/Complete the full course of therapy/gi, 'Tuntaskan seluruh durasi pengobatan.'],
  [/Use with caution in patients with/gi, 'Gunakan dengan hati-hati pada pasien dengan'],
  [/Use caution in patients with/gi, 'Gunakan dengan hati-hati pada pasien dengan'],
  [/Use caution in animals with/gi, 'Gunakan dengan hati-hati pada hewan dengan'],
  [/Contraindicated in patients with/gi, 'Dikontraindikasikan pada pasien dengan'],
  [/Contraindicated in animals with/gi, 'Dikontraindikasikan pada hewan dengan'],
  [/is contraindicated in/gi, 'dikontraindikasikan pada'],
  [/is indicated for/gi, 'diindikasikan untuk'],
  [/indicated for the treatment of/gi, 'diindikasikan untuk pengobatan / penanganan'],
  [/indicated for the prevention of/gi, 'diindikasikan untuk pencegahan'],
  [/indicated for/gi, 'diindikasikan untuk'],
  [/may be useful for/gi, 'dapat bermanfaat untuk'],
  [/may be useful in/gi, 'dapat bermanfaat pada'],
  [/useful for mild reductions in/gi, 'bermanfaat untuk penurunan ringan pada'],
  [/as adjunctive treatment of/gi, 'sebagai terapi tambahan untuk'],
  [/adverse effects reported include/gi, 'efek samping yang dilaporkan meliputi'],
  [/adverse effects reported in/gi, 'efek samping yang dilaporkan pada'],
  [/adverse effects are generally/gi, 'efek samping umumnya'],
  [/most common adverse effects are/gi, 'efek samping yang paling sering muncul adalah'],
  [/the most likely adverse effects are/gi, 'efek samping yang paling sering muncul adalah'],
  [/are more likely at higher doses/gi, 'lebih sering terjadi pada dosis yang lebih tinggi'],
  [/crosses the placental barrier/gi, 'menembus sawar plasenta'],
  [/excreted in maternal milk/gi, 'diekskresikan ke dalam air susu induk'],
  [/should be used during pregnancy only when/gi, 'hanya boleh digunakan selama masa kebuntingan bila'],
  [/potential benefits outweigh potential risks/gi, 'manfaat potensial lebih besar daripada risiko klinisnya'],
  [/non-steroidal anti-inflammatory drugs?\b/gi, 'obat antiinflamasi non-steroid (NSAID)'],
  [/non-steroidal anti-inflammatory\b/gi, 'antiinflamasi non-steroid (NSAID)'],
  [/central nervous system\b/gi, 'sistem saraf pusat (SSP)'],
  [/complete blood count\b/gi, 'hitung darah lengkap (CBC)'],
  [/serum biochemistry panel\b/gi, 'panel biokimia serum'],
  [/diabetic ketoacidosis\b/gi, 'ketoasidosis diabetik'],
  [/inflammatory bowel disease\b/gi, 'penyakit radang usus (IBD)'],
  [/colonic ulceration\b/gi, 'ulserasi kolon'],
  [/intestinal obstruction\b/gi, 'obstruksi saluran usus'],
  [/excessive gas formation\b/gi, 'pembentukan gas berlebih'],
  [/renal dysfunction\b/gi, 'disfungsi ginjal'],
  [/renal failure\b/gi, 'gagal ginjal'],
  [/severe liver disease\b/gi, 'penyakit hepar berat'],
  [/liver disease\b/gi, 'penyakit hepar'],
  [/hepatic disease\b/gi, 'penyakit hepar'],
  [/hepatic dysfunction\b/gi, 'disfungsi hepar'],
  [/known hypersensitivity to the drug\b/gi, 'riwayat hipersensitivitas terhadap obat ini'],
  [/known hypersensitivity to\b/gi, 'riwayat hipersensitivitas terhadap'],
  [/known hypersensitivity\b/gi, 'riwayat hipersensitivitas'],
  [/underweight animals\b/gi, 'hewan dengan berat badan kurang (underweight)'],
  [/low body weight\b/gi, 'berat badan rendah'],
  [/normal body weight\b/gi, 'berat badan normal'],
  [/soft stools?\b/gi, 'feses lunak'],
  [/loose stools?\b/gi, 'feses lembek'],
  [/weight loss\b/gi, 'penurunan berat badan'],
  [/pregnancy and lactation\b/gi, 'kebuntingan dan laktasi'],
  [/pregnant or lactating\b/gi, 'bunting atau laktasi'],
  [/pregnant animals?\b/gi, 'hewan bunting'],
  [/lactating animals?\b/gi, 'hewan laktasi'],
  [/dogs and cats\b/gi, 'anjing dan kucing'],
  [/dogs or cats\b/gi, 'anjing atau kucing'],
  [/in dogs\b/gi, 'pada anjing'],
  [/in cats\b/gi, 'pada kucing'],
  [/in horses\b/gi, 'pada kuda'],
  [/in cattle\b/gi, 'pada sapi'],
  [/in birds\b/gi, 'pada burung'],
  [/in swine\b/gi, 'pada babi'],
  [/blood glucose concentrations?\b/gi, 'konsentrasi glukosa darah'],
  [/blood glucose\b/gi, 'glukosa darah'],
  [/drug interactions?\b/gi, 'interaksi obat'],
  [/adverse effects?\b/gi, 'efek samping'],
  [/adverse reactions?\b/gi, 'reaksi merugikan'],
  [/clinical signs?\b/gi, 'gejala klinis'],
  [/broad-spectrum\b/gi, 'spektrum luas'],
  [/narrow-spectrum\b/gi, 'spektrum sempit'],
  [/Gram-positive and Gram-negative\b/gi, 'Gram-positif dan Gram-negatif'],
  [/Gram-positive\b/gi, 'Gram-positif'],
  [/Gram-negative\b/gi, 'Gram-negatif'],
  [/susceptible bacteria\b/gi, 'bakteri yang rentan'],
  [/susceptible organisms\b/gi, 'mikroorganisme yang rentan'],
  [/susceptible infections?\b/gi, 'infeksi bakteri rentan'],
  [/urinary tract infections?\b/gi, 'infeksi saluran kemih (UTI)'],
  [/respiratory tract infections?\b/gi, 'infeksi saluran pernapasan'],
  [/soft tissue infections?\b/gi, 'infeksi jaringan lunak'],
  [/fluid therapy\b/gi, 'terapi cairan'],
  [/supportive care\b/gi, 'perawatan suportif'],
  [/dose-dependent\b/gi, 'tergantung dosis'],
  [/once daily\b/gi, '1 kali sehari'],
  [/twice daily\b/gi, '2 kali sehari'],
  [/three times daily\b/gi, '3 kali sehari'],
  [/four times daily\b/gi, '4 kali sehari'],
  [/as needed\b/gi, 'bila diperlukan (p.r.n.)'],
  [/with meals?\b/gi, 'bersama pakan'],
  [/on an empty stomach\b/gi, 'dalam keadaan perut kosong (sebelum makan)'],
  [/intravenous(?:ly)?\b/gi, 'intravena (IV)'],
  [/intramuscular(?:ly)?\b/gi, 'intramuskular (IM)'],
  [/subcutaneous(?:ly)?\b/gi, 'subkutan (SC)'],
  [/topical(?:ly)?\b/gi, 'topikal (luar)'],
  [/oral(?:ly)?\b/gi, 'secara oral (PO)'],
  [/half-life\b/gi, 'waktu paruh eliminasi'],
  [/peak concentrations?\b/gi, 'konsentrasi puncak serum'],
  [/bioavailability\b/gi, 'bioavailabilitas oral']
];

const WORDS = [
  [/\bdogs\b/gi, 'anjing'],
  [/\bcats\b/gi, 'kucing'],
  [/\bhorses\b/gi, 'kuda'],
  [/\bcattle\b/gi, 'sapi'],
  [/\bbirds\b/gi, 'burung'],
  [/\bswine\b/gi, 'babi'],
  [/\brabbits\b/gi, 'kelinci'],
  [/\bferrets\b/gi, 'musang (ferret)'],
  [/\bpuppies\b/gi, 'anak anjing'],
  [/\bkittens\b/gi, 'anak kucing'],
  [/\bvomiting\b/gi, 'muntah'],
  [/\bdiarrhea\b/gi, 'diare'],
  [/\bnausea\b/gi, 'mual'],
  [/\banorexia\b/gi, 'anoreksia (hilang nafsu makan)'],
  [/\blethargy\b/gi, 'letargi (lemas)'],
  [/\bdepression\b/gi, 'depresi'],
  [/\bweakness\b/gi, 'kelemahan fisik'],
  [/\bataxia\b/gi, 'ataksia (hilang koordinasi gerak)'],
  [/\bseizures\b/gi, 'kejang'],
  [/\btremors\b/gi, 'tremor'],
  [/\bpruritus\b/gi, 'pruritus (gatal)'],
  [/\berythema\b/gi, 'eritema (kemerahan kulit)'],
  [/\burticaria\b/gi, 'urtikaria (biduran)'],
  [/\brash\b/gi, 'ruam kulit'],
  [/\balopecia\b/gi, 'alopesia (kebotakan bulu)'],
  [/\bcough\b/gi, 'batuk'],
  [/\bdyspnea\b/gi, 'dispnea (sesak napas)'],
  [/\btachypnea\b/gi, 'takipnea (napas cepat)'],
  [/\btachycardia\b/gi, 'takikardia (detak jantung cepat)'],
  [/\bbradycardia\b/gi, 'bradikardia (detak jantung lambat)'],
  [/\bhypotension\b/gi, 'hipotensi (tekanan darah rendah)'],
  [/\bhypertension\b/gi, 'hipertensi (tekanan darah tinggi)'],
  [/\bdehydration\b/gi, 'dehidrasi'],
  [/\banemia\b/gi, 'anemia'],
  [/\bthrombocytopenia\b/gi, 'trombositopenia'],
  [/\bleukopenia\b/gi, 'leukopenia'],
  [/\bneutropenia\b/gi, 'neutropenia'],
  [/\bflatulence\b/gi, 'perut kembung (flatulensi)'],
  [/\bloss of appetite\b/gi, 'penurunan nafsu makan'],
  [/\bkidneys?\b/gi, 'ginjal'],
  [/\bliver\b/gi, 'hepar'],
  [/\bstomach\b/gi, 'lambung'],
  [/\bgut\b/gi, 'saluran cerna'],
  [/\bheart\b/gi, 'jantung'],
  [/\blungs?\b/gi, 'paru-paru'],
  [/\bbladder\b/gi, 'vesika urinaria (kandung kemih)'],
  [/\bpu\/pd\b/gi, 'poliuria/polidipsia (PU/PD)'],
  [/\bpolyuria\b/gi, 'poliuria (banyak kencing)'],
  [/\bpolydipsia\b/gi, 'polidipsia (banyak minum)'],
  [/\bhypoglycemia\b/gi, 'hipoglikemia'],
  [/\bhyperglycemia\b/gi, 'hiperglikemia'],
  [/\bhypokalemia\b/gi, 'hipokalemia'],
  [/\bhyperkalemia\b/gi, 'hiperkalemia'],
  [/\bazotemia\b/gi, 'azotemia'],
  [/\bedema\b/gi, 'edema (pembengkakan cairan)'],
  [/\bulceration\b/gi, 'ulserasi (tukak/luka)'],
  [/\bnecrosis\b/gi, 'nekrosis (kematian jaringan)'],
  [/\binfection\b/gi, 'infeksi'],
  [/\binfections\b/gi, 'infeksi'],
  [/\binflammation\b/gi, 'peradangan (inflamasi)'],
  [/\bpain\b/gi, 'nyeri'],
  [/\btablets?\b/gi, 'tablet'],
  [/\bcapsules?\b/gi, 'kapsul'],
  [/\binjection\b/gi, 'injeksi'],
  [/\bsuspension\b/gi, 'suspensi'],
  [/\bsolution\b/gi, 'larutan'],
  [/\bointment\b/gi, 'salep'],
  [/\bdrops\b/gi, 'tetes'],
  [/\band\b/gi, 'dan'],
  [/\bincluding\b/gi, 'termasuk'],
  [/\binclude\b/gi, 'meliputi'],
  [/\bincludes\b/gi, 'meliputi'],
  [/\bwith\b/gi, 'dengan'],
  [/\bwithout\b/gi, 'tanpa'],
  [/\bcaused by\b/gi, 'yang disebabkan oleh'],
  [/\bdue to\b/gi, 'akibat / karena'],
  [/\bsecondary to\b/gi, 'sekunder akibat'],
  [/\bpatients?\b/gi, 'pasien'],
  [/\banimals?\b/gi, 'hewan']
];

function translateText(text) {
  if (!text || typeof text !== 'string') return text || '';
  let res = text;
  PHRASES.forEach(([rx, rep]) => {
    res = res.replace(rx, rep);
  });
  WORDS.forEach(([rx, rep]) => {
    res = res.replace(rx, rep);
  });
  // Clean up punctuation and spacing
  return res
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/\s+;/g, ';')
    .replace(/\s+\)/g, ')')
    .replace(/\(\s+/g, '(')
    .trim();
}

function translateArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => translateText(item));
}

// 3. Load merged drugs database
const dbPath = path.join(__dirname, '../public/js/drugs-data.js');
const raw = fs.readFileSync(dbPath, 'utf8');
const matchIdx = raw.indexOf('export const VET_DRUG_DATABASE = ');
const jsonStr = raw.slice(matchIdx + 'export const VET_DRUG_DATABASE = '.length).trim().replace(/;$/, '');
const drugs = JSON.parse(jsonStr);

console.log(`Processing translation for ${drugs.length} drug monographs...`);

let translatedPlumbsCount = 0;

drugs.forEach(drug => {
  if (!drug.plumbs) return;
  translatedPlumbsCount++;

  const p = drug.plumbs;
  const curated = CURATED[drug.id] || {};

  // Build Indonesian translated object for Plumb's
  const idTranslation = {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: translateText(p.drugClass) || curated.drugClass || drug.drugClass,
    prescriberHighlights: p.prescriberHighlights && p.prescriberHighlights.length > 0 
      ? translateArray(p.prescriberHighlights) 
      : (curated.mechanismOfAction ? [curated.mechanismOfAction] : []),
    indications: translateText(p.indications) || curated.indications || drug.indications,
    contraindications: translateText(p.contraindications) || curated.contraindications || drug.contraindications,
    adverseEffects: translateText(p.adverseEffects) || curated.sideEffects || drug.sideEffects,
    reproductiveNursingSafety: translateText(p.reproductiveNursingSafety) || "Keamanan penggunaan selama masa kebuntingan belum sepenuhnya ditetapkan. Gunakan hanya jika manfaat klinis lebih besar dari risiko janin.",
    overdosageAcuteToxicity: translateText(p.overdosageAcuteToxicity) || curated.learnMore?.overdose || "Berikan terapi cairan kristaloid dan perawatan suportif simtomatik jika terjadi overdosis.",
    pharmacokinetics: translateText(p.pharmacokinetics) || curated.pharmacokinetics || drug.pharmacokinetics,
    pharmacodynamics: translateText(p.pharmacodynamics) || curated.pharmacodynamics || drug.pharmacodynamics,
    clientInformation: p.clientInformation && p.clientInformation.length > 0
      ? translateArray(p.clientInformation)
      : [curated.learnMore?.counseling || "Berikan obat sesuai petunjuk dosis dan jadwal teratur. Hubungi dokter hewan bila timbul reaksi merugikan."],
    monitoring: p.monitoring && p.monitoring.length > 0
      ? translateArray(p.monitoring)
      : [curated.learnMore?.monitoring || "Pantau perbaikan gejala klinis dan toleransi pasien."],
    storageStability: translateText(p.storageStability) || curated.learnMore?.storage || "Simpan pada suhu ruang terkontrol (15–25°C) terlindung dari cahaya langsung dan kelembapan."
  };

  // Attach to drug.plumbs.id
  drug.plumbs.id = idTranslation;

  // Sync drug.content.id for Plumb's-only monographs so catalog cards also show in Indonesian
  if (!drug.bsava && drug.content) {
    drug.content.id = {
      drugClass: idTranslation.drugClass || drug.drugClass,
      mechanismOfAction: idTranslation.pharmacodynamics || (idTranslation.prescriberHighlights?.[0] || drug.mechanismOfAction),
      indications: idTranslation.indications || drug.indications,
      contraindications: idTranslation.contraindications || drug.contraindications,
      sideEffects: idTranslation.adverseEffects || drug.sideEffects,
      drugInteractions: drug.drugInteractions,
      pharmacokinetics: idTranslation.pharmacokinetics || drug.pharmacokinetics,
      pharmacodynamics: idTranslation.pharmacodynamics || drug.pharmacodynamics,
      learnMore: {
        counseling: (idTranslation.clientInformation || []).join(" "),
        monitoring: (idTranslation.monitoring || []).join(" "),
        overdose: idTranslation.overdosageAcuteToxicity,
        storage: idTranslation.storageStability,
        references: `Plumb's Veterinary Drug Handbook (7th Ed.) hal. ${p.sourcePage || '-'}`
      }
    };
  }

  // Make sure drug.plumbs.en exists with original English texts
  drug.plumbs.en = {
    edition: p.edition,
    drugClass: p.drugClass,
    prescriberHighlights: p.prescriberHighlights || [],
    indications: p.indications || "",
    contraindications: p.contraindications || "",
    adverseEffects: p.adverseEffects || "",
    reproductiveNursingSafety: p.reproductiveNursingSafety || "",
    overdosageAcuteToxicity: p.overdosageAcuteToxicity || "",
    pharmacokinetics: p.pharmacokinetics || "",
    pharmacodynamics: p.pharmacodynamics || "",
    clientInformation: p.clientInformation || [],
    monitoring: p.monitoring || [],
    storageStability: p.storageStability || ""
  };
});

console.log(`Generated Indonesian translation for ${translatedPlumbsCount} Plumb's monographs.`);

// 4. Write back to drugs-data.js
const headerComment = `/**
 * Veterinary Pharmacology Database
 * Comprehensive Clinical Compendium & Drug Directory
 * Sourced from:
 * - BSAVA Small Animal Formulary (Part A: Canine and Feline, 10th Edition by Fergus Allerton)
 * - Plumb's Veterinary Drug Handbook (7th Edition by Donald C. Plumb, Pharm.D.)
 *
 * Total Monographs: ${drugs.length}
 * Bilingual Support: Indonesian (id) & English (en) across both BSAVA and Plumb's
 */

export const VET_DRUG_DATABASE = `;

fs.writeFileSync(dbPath, headerComment + JSON.stringify(drugs) + ';\n', 'utf8');
const stats = fs.statSync(dbPath);
console.log(`Updated drugs-data.js with bilingual Plumb's support: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
