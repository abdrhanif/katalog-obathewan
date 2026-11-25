const fs = require('fs');
const path = require('path');

const srcPath = 'c:/Users/wedia/.gemini/antigravity-cli/scratch/formularium_lengkap.json';
const destPath = 'c:/Users/wedia/.gemini/antigravity/scratch/katalog-obathewan/public/js/indonesian-formulary-data.js';

const rawData = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

// 1. Parse Draf Formularium Obat
const sheetDraft = rawData.sheets["Draf Formularium Obat"];
let curMajor = "Umum";
let curSub = "";
const drugs = [];

sheetDraft.records.forEach((r, idx) => {
  const noVal = (r["No"] || "").trim();
  const innVal = (r["Nama Generik (INN)"] || "").trim();
  const subClassVal = (r["Kelas & Sub-Kelas Terapi"] || "").trim();

  if (/^\d+\.\s+[A-Za-z]/.test(noVal)) {
    curMajor = noVal;
    curSub = "";
  } else if (/^\d+\.\d+\s+[A-Za-z]/.test(noVal)) {
    curSub = noVal;
  }

  if (innVal) {
    const rawSpecies = (r["Spesies Sasaran"] || "").trim();
    const speciesList = [];
    const lowerSpec = rawSpecies.toLowerCase();
    if (lowerSpec.includes("anjing")) speciesList.push("canine");
    if (lowerSpec.includes("kucing")) speciesList.push("feline");
    if (lowerSpec.includes("kuda")) speciesList.push("equine");
    if (lowerSpec.includes("sapi")) speciesList.push("bovine");
    if (lowerSpec.includes("kambing") || lowerSpec.includes("domba")) speciesList.push("ovine_caprine");
    if (lowerSpec.includes("babi")) speciesList.push("porcine");
    if (lowerSpec.includes("unggas") || lowerSpec.includes("ayam") || lowerSpec.includes("burung")) speciesList.push("avian");
    if (lowerSpec.includes("kelinci")) speciesList.push("rabbit");
    if (lowerSpec.includes("kancil") || lowerSpec.includes("rusa") || lowerSpec.includes("eksotik")) speciesList.push("exotic");

    const slug = innVal.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + (idx + 1);

    drugs.push({
      id: slug,
      inn: innVal,
      kodeTerapi: (r["Kode Terapi"] || "").trim(),
      majorClass: curMajor,
      subClass: curSub || curMajor,
      effectiveClass: subClassVal || (curSub ? `${curMajor} - ${curSub}` : curMajor),
      formulation: (r["Bentuk & Kekuatan Sediaan"] || "").trim(),
      rawSpecies: rawSpecies,
      speciesList: speciesList.length > 0 ? speciesList : ["all"],
      dosage: (r["Panduan Dosis Klinis Standar"] || "").trim(),
      indication: (r["Indikasi Klinis Utama"] || "").trim(),
      restrictions: (r["Restriksi / Peringatan Keamanan"] || "").trim(),
      amegCategory: (r["Level Terapi / Kategori AMEG (EMA)"] || "").trim(),
      accessCategory: (r["Kategori Akses"] || "").trim(),
      references: (r["Referensi / Rujukan Daftar Pustaka"] || "").trim(),
      maxPrescription: (r["Resep maksimal/individu"] || "").trim()
    });
  }
});

// 2. Parse Pedoman & Restriksi
const prohibited = [
  {
    molecule: "Chloramphenicol",
    reason: "Menyebabkan anemia aplastik idiopatik non-dose dependent fatal pada manusia",
    impact: "Zero Tolerance: tidak ada batas residu aman (MRL)",
    reference: "Codex Alimentarius / WHO / WOAH"
  },
  {
    molecule: "Nitrofurans (Furazolidone, Nitrofurazone)",
    reason: "Sifat genotoksik karsinogenik dan mutagenik",
    impact: "Metabolit terikat jaringan dalam jangka waktu sangat panjang",
    reference: "FDA Extra-Label Drug Prohibitions / EMA"
  },
  {
    molecule: "Metronidazole / Nitroimidazole",
    reason: "Potensi mutagenik, teratogenik, dan karsinogenik",
    impact: "Akumulasi residu pada jaringan daging dan organ hepar",
    reference: "FDA 21 CFR § 530.41; Codex MRL"
  },
  {
    molecule: "Fluoroquinolones (pada unggas/ternak pangan)",
    reason: "Pemicu resistensi silang Campylobacter jejuni & Salmonella spp.",
    impact: "Kegagalan terapi antibiotik kritis pada infeksi manusia",
    reference: "WHO Highest Priority CIA / WOAH List"
  },
  {
    molecule: "Sefalosporin Generasi 3 & 4",
    reason: "Antibiotik cadangan kritis manusia untuk patogen MDR/ESBL",
    impact: "Penyebaran resistensi berbasis plasmid ke manusia",
    reference: "WHO CIA 6th Revision; EMA Veterinary Guidance"
  }
];

const prescriptionStandards = [
  {
    element: "Inscriptio (Identitas Dokter)",
    components: "Nama lengkap drh, Nomor SIPH/SIPP, Alamat klinik/praktik, Nomor kontak aktif",
    function: "Memastikan legalitas praktisi yang berhak meresepkan sediaan farmasi."
  },
  {
    element: "Invocatio (Tanda Resep)",
    components: "Tanda R/ pada bagian kiri penulisan setiap sediaan obat",
    function: "Perintah resmi peracikan/penyerahan obat kepada apoteker pengelola apotek."
  },
  {
    element: "Prescriptio / Ordinatio",
    components: "Nama generik/paten obat, bentuk sediaan, kekuatan dosis, dan jumlah total sediaan",
    function: "Mencegah kesalahan interpretasi potensi sediaan di fasilitas kefarmasian."
  },
  {
    element: "Signatura (Aturan Pakai)",
    components: "Dosis mg/kgBB, frekuensi pemberian, durasi pengobatan, rute pemberian",
    function: "Konfirmasi kesesuaian dosis veteriner dan petunjuk pemakaian bagi pemilik hewan."
  },
  {
    element: "Patient Identification",
    components: "Nama pemilik hewan, nama hewan, jenis spesies, ras, umur, dan Bobot Badan (kg)",
    function: "Krusial untuk verifikasi perhitungan dosis berdasarkan bobot badan aktual."
  },
  {
    element: "Subscriptio (Tanda Tangan)",
    components: "Paraf atau tanda tangan basah / tanda tangan elektronik tersertifikasi drh",
    function: "Keabsahan legalitas dan akuntabilitas medikolegal pelayanan obat."
  }
];

const specialSurveillance = [
  { group: "PREKURSOR FARMASI", activeIngredient: "Pseudoefedrin", status: "Kandungan kombinasi; tidak direkomendasikan untuk hewan", rules: "Resep drh; simpan terpisah; kartu stok; pelaporan berkala", regulation: "Peraturan BPOM tentang Pengelolaan Prekursor Farmasi" },
  { group: "PREKURSOR FARMASI", activeIngredient: "Efedrin", status: "Tersedia untuk hipotensi anestesi regional", rules: "Resep drh; simpan terpisah; kartu stok; pelaporan berkala", regulation: "Peraturan BPOM tentang Pengelolaan Prekursor Farmasi" },
  { group: "PREKURSOR FARMASI", activeIngredient: "Fenilpropanolamin (PPA)", status: "Obat saluran kemih (inkontinensia)", rules: "Resep drh; simpan terpisah; kartu stok; pelaporan berkala", regulation: "Peraturan BPOM tentang Pengelolaan Prekursor Farmasi" },
  { group: "PREKURSOR FARMASI", activeIngredient: "Ergotamin / Ergometrin", status: "Antimigren / Oksitosik veteriner", rules: "Resep drh; simpan terpisah; kartu stok; pelaporan berkala", regulation: "Peraturan BPOM tentang Pengelolaan Prekursor Farmasi" },
  { group: "OBAT-OBAT TERTENTU (OOT)", activeIngredient: "Tramadol HCl", status: "Analgesik non-narkotik", rules: "Resep khusus drh; simpan di lemari terpisah; kartu stok; tidak boleh iterasi", regulation: "Peraturan BPOM No. 10 Tahun 2019 tentang OOT" },
  { group: "OBAT-OBAT TERTENTU (OOT)", activeIngredient: "Ketamine HCl", status: "Anestetik umum disosiatif", rules: "Resep khusus drh; lemari terkunci ganda; pelaporan ketat; batas maksimal per resep", regulation: "Peraturan BPOM No. 10 Tahun 2019 tentang OOT" },
  { group: "OBAT-OBAT TERTENTU (OOT)", activeIngredient: "Dekstrometorfan (DMP)", status: "Antitusif saluran napas", rules: "Resep khusus drh; simpan terpisah; tidak boleh iterasi", regulation: "Peraturan BPOM No. 10 Tahun 2019 tentang OOT" },
  { group: "OBAT-OBAT TERTENTU (OOT)", activeIngredient: "Amitriptilin / Haloperidol / Klorpromazin", status: "Psikofarmaka veteriner", rules: "Resep khusus drh; simpan terpisah; pengawasan khusus perilaku hewan", regulation: "Peraturan BPOM No. 10 Tahun 2019 tentang OOT" }
];

const jsContent = `/**
 * Formularium Obat Penggunaan Veteriner Indonesia
 * Sumber Data: formularium_lengkap.json
 * Dikonversi secara otomatis untuk aplikasi Katalog Obat Hewan.
 */

export const INDONESIAN_FORMULARY_METADATA = ${JSON.stringify(rawData.metadata, null, 2)};

export const INDONESIAN_PROHIBITED_DRUGS = ${JSON.stringify(prohibited, null, 2)};

export const INDONESIAN_PRESCRIPTION_STANDARDS = ${JSON.stringify(prescriptionStandards, null, 2)};

export const INDONESIAN_SPECIAL_SURVEILLANCE = ${JSON.stringify(specialSurveillance, null, 2)};

export const INDONESIAN_DRUGS = ${JSON.stringify(drugs, null, 2)};
`;

fs.writeFileSync(destPath, jsContent, 'utf8');
console.log('Successfully wrote', drugs.length, 'drugs to', destPath);
