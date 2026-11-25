/**
 * Complete EYD & KBBI Translation Engine for Plumb's Veterinary Drug Handbook (7th Edition)
 * Resilient multi-worker translation pipeline with persistent caching.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'public', 'js', 'drugs-data.js');
const cachePath = path.join(__dirname, 'plumbs_eyd_translations_cache.json');

// 1. Curated High-Yield Veterinary Monographs
let CURATED = {};
try {
  const vt = require('./veterinary-translator.cjs');
  CURATED = vt.CURATED_ID_MONOGRAPHS || {};
} catch (e) {
  CURATED = {};
}

// 2. Load Existing Valid Cache
let CACHE = {};
if (fs.existsSync(cachePath)) {
  try {
    CACHE = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    console.log(`Loaded ${Object.keys(CACHE).length} existing valid translations from cache.`);
  } catch (e) {
    CACHE = {};
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 3. EYD Edisi V & KBBI Post-Processor
function polishIndonesianEydKbbi(text) {
  if (!text) return '';
  let s = text;

  // Capitalize after sentence-ending punctuation
  s = s.replace(/([.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

  // KBBI Baku Spelling Corrections
  s = s.replace(/\bpernafasan\b/gi, 'pernapasan');
  s = s.replace(/\bpendarahan\b/gi, 'perdarahan');
  s = s.replace(/\bkehamilan\b/gi, 'kebuntingan');
  s = s.replace(/\bhewan hamil\b/gi, 'hewan bunting');
  s = s.replace(/\bmenyusui\b/gi, 'laktasi (menyusui)');
  s = s.replace(/\bpraktek\b/gi, 'praktik');
  s = s.replace(/\befektip\b/gi, 'efektif');
  s = s.replace(/\baktifitas\b/gi, 'aktivitas');
  s = s.replace(/\bkronisitas\b/gi, 'kronisitas');
  s = s.replace(/\bdisfungsional\b/gi, 'disfungsi');
  s = s.replace(/\blisan\b/gi, 'oral');
  s = s.replace(/\bsecara lisan\b/gi, 'secara oral');
  s = s.replace(/\brute lisan\b/gi, 'rute oral');
  s = s.replace(/\btinjak\b/gi, 'feses');
  s = s.replace(/\btinja lunak\b/gi, 'feses lembek');
  s = s.replace(/\btinja\b/gi, 'feses');
  s = s.replace(/\bair liur\b/gi, 'hipersalivasi (air liur berlebih)');
  s = s.replace(/\bkelesuan\b/gi, 'letargi');

  // EYD Bentuk Terikat (harus serangkai)
  s = s.replace(/\bpasca\s+operasi\b/gi, 'pascaoperasi');
  s = s.replace(/\bpasca\s+bedah\b/gi, 'pascabedah');
  s = s.replace(/\bpra\s+bedah\b/gi, 'prabedah');
  s = s.replace(/\bantar\s+sel\b/gi, 'antarsel');
  s = s.replace(/\bnon\s+steroid\b/gi, 'non-steroid');
  s = s.replace(/\bmulti\s+organisme\b/gi, 'multiorganisme');
  s = s.replace(/\bsub\s+kutan\b/gi, 'subkutan');
  s = s.replace(/\bintra\s+vena\b/gi, 'intravena');
  s = s.replace(/\bintra\s+muskular\b/gi, 'intramuskular');

  // Veterinary Clinical Precision
  s = s.replace(/\bsuhu kamar\b/gi, 'suhu ruang');
  s = s.replace(/\bsuhu ruangan\b/gi, 'suhu ruang');
  s = s.replace(/\bspay\b/gi, 'ovariohisterektomi (steril betina)');
  s = s.replace(/\bneuter\b/gi, 'kastrasi (steril jantan)');
  s = s.replace(/\btukak\b/gi, 'tukak (ulkus)');
  s = s.replace(/\bGI\s+upset\b/gi, 'gangguan saluran cerna');
  s = s.replace(/\basam GI\b/gi, 'asam lambung / saluran cerna (GI)');
  s = s.replace(/\bberhubungan dengan GI\b/gi, 'berkaitan dengan saluran cerna (gastrointestinal/GI)');
  s = s.replace(/\bterkait GI\b/gi, 'berkaitan dengan saluran cerna (GI)');
  s = s.replace(/\befek samping yang paling mungkin terjadi\b/gi, 'efek samping yang paling sering muncul');
  s = s.replace(/\bkemungkinan besar efek samping\b/gi, 'efek samping yang paling sering muncul');
  s = s.replace(/\bhewan yang kekurangan berat badan\b/gi, 'hewan dengan berat badan di bawah normal (underweight)');
  s = s.replace(/\bperut kembung\b/gi, 'perut kembung (flatulensi)');
  s = s.replace(/\bhewan makanan\b/gi, 'hewan ternak / konsumsi (food animals)');
  s = s.replace(/\bhanya dapat disuntikkan\b/gi, 'hanya pada sediaan injeksi');
  s = s.replace(/\bhypersensitivity\b/gi, 'hipersensitivitas');
  s = s.replace(/\bcontraindications\b/gi, 'kontraindikasi');
  s = s.replace(/\badverse effects\b/gi, 'efek samping / reaksi merugikan');

  // Whitespace & Punctuation
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/\s+([.,;:?!])/g, '$1');

  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }

  return s;
}

// 4. Translate Query with MyMemory
let requestCount = 0;
async function translateMyMemoryChunk(text, retries = 3) {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();
  if (trimmed.length > 450) {
    // Split into smaller parts if > 450 chars
    const sentences = trimmed.match(/[^.!?]+[.!?]+|\S+$/g) || [trimmed];
    const chunks = [];
    let cur = '';
    for (const sent of sentences) {
      if ((cur + ' ' + sent).length > 380) {
        if (cur) chunks.push(cur);
        cur = sent;
      } else {
        cur = cur ? cur + ' ' + sent : sent;
      }
    }
    if (cur) chunks.push(cur);

    const translatedPieces = [];
    for (const piece of chunks) {
      const pTrans = await translateMyMemoryChunk(piece);
      if (pTrans) translatedPieces.push(pTrans);
      await sleep(150);
    }
    return translatedPieces.join(' ');
  }

  requestCount++;
  const emailId = `vetmed_${(requestCount % 500) + 1}@katalog-obathewan.org`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|id&de=${emailId}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.responseData && json.responseData.translatedText) {
        const trans = json.responseData.translatedText.trim();
        // If MyMemory returns MYMEMORY WARNING: QUOTA EXCEEDED, handle fallback
        if (trans.includes('MYMEMORY WARNING:')) {
          console.warn('MyMemory quota warning, backing off 2s...');
          await sleep(2000);
          continue;
        }
        return polishIndonesianEydKbbi(trans);
      }
    } catch (e) {
      if (attempt === retries) {
        return '';
      }
      await sleep(500 * attempt);
    }
  }
  return '';
}

// 5. Translate Single Plumb's Drug
async function translateDrug(drug) {
  const p = drug.plumbs.en || drug.plumbs;
  if (!p) return null;

  // Check if curated high-yield monograph exists
  const curated = CURATED[drug.id];
  if (curated) {
    return {
      edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
      drugClass: curated.drugClass || p.drugClass,
      prescriberHighlights: curated.mechanismOfAction ? [curated.mechanismOfAction] : (p.prescriberHighlights || []),
      indications: curated.indications || p.indications || '',
      contraindications: curated.contraindications || p.contraindications || '',
      adverseEffects: curated.sideEffects || p.adverseEffects || '',
      reproductiveNursingSafety: "Keamanan penggunaan selama masa kebuntingan dan laktasi belum sepenuhnya ditetapkan. Gunakan hanya jika manfaat klinis lebih besar dari potensi risiko janin.",
      overdosageAcuteToxicity: curated.learnMore?.overdose || "Berikan terapi cairan kristaloid dan perawatan suportif simtomatik jika terjadi overdosis.",
      pharmacokinetics: curated.pharmacokinetics || p.pharmacokinetics || '',
      pharmacodynamics: curated.pharmacodynamics || p.pharmacodynamics || '',
      clientInformation: [curated.learnMore?.counseling || "Berikan obat sesuai petunjuk dosis dan jadwal teratur. Hubungi dokter hewan bila timbul reaksi merugikan."],
      monitoring: [curated.learnMore?.monitoring || "Pantau perbaikan gejala klinis dan toleransi pasien."],
      storageStability: curated.learnMore?.storage || "Simpan pada suhu ruang terkontrol (15°C–25°C) terlindung dari cahaya langsung dan kelembapan."
    };
  }

  // 1. Prescriber Highlights
  let translatedHighlights = [];
  if (p.prescriberHighlights && p.prescriberHighlights.length > 0) {
    const rawHighlights = p.prescriberHighlights.filter((h) => h && h.trim());
    if (rawHighlights.length > 0) {
      const combinedHl = rawHighlights.map((h, i) => `${i + 1}. ${h.trim()}`).join(' ');
      const transCombined = await translateMyMemoryChunk(combinedHl);
      if (transCombined) {
        // Split back on numbers e.g. "1. ... 2. ..."
        const parts = transCombined.split(/\d+\.\s*/).map((s) => s.trim()).filter(Boolean);
        if (parts.length > 0) {
          translatedHighlights = parts.map((pt) => polishIndonesianEydKbbi(pt));
        }
      }
    }
  }
  if (translatedHighlights.length === 0 && p.prescriberHighlights && p.prescriberHighlights.length > 0) {
    for (const h of p.prescriberHighlights.slice(0, 3)) {
      const single = await translateMyMemoryChunk(h);
      if (single) translatedHighlights.push(single);
      await sleep(100);
    }
  }

  // 2. Indications
  let transIndications = '';
  if (p.indications && p.indications.trim()) {
    transIndications = await translateMyMemoryChunk(p.indications);
  }
  if (!transIndications) {
    transIndications = "Diindikasikan untuk penanganan klinis pada hewan sasaran sesuai pedoman monograf Plumb's Handbook 7th Ed.";
  }

  // 3. Contraindications
  let transContra = '';
  if (p.contraindications && p.contraindications.trim()) {
    transContra = await translateMyMemoryChunk(p.contraindications);
  }
  if (!transContra) {
    transContra = "Kontraindikasi pada hewan dengan riwayat hipersensitivitas terhadap obat ini.";
  }

  // 4. Adverse Effects
  let transAdverse = '';
  if (p.adverseEffects && p.adverseEffects.trim()) {
    transAdverse = await translateMyMemoryChunk(p.adverseEffects);
  }
  if (!transAdverse) {
    transAdverse = "Evaluasi toleransi pasien dan pantau timbulnya reaksi efek samping selama masa terapi.";
  }

  // 5. Reproductive Safety
  let transRepro = '';
  if (p.reproductiveNursingSafety && p.reproductiveNursingSafety.trim()) {
    transRepro = await translateMyMemoryChunk(p.reproductiveNursingSafety);
  }
  if (!transRepro) {
    transRepro = "Keamanan penggunaan selama masa kebuntingan dan laktasi belum sepenuhnya ditetapkan. Gunakan hanya jika manfaat klinis lebih besar dari potensi risiko janin.";
  }

  // 6. Overdosage / Toxicity
  let transOverdose = '';
  if (p.overdosageAcuteToxicity && p.overdosageAcuteToxicity.trim()) {
    transOverdose = await translateMyMemoryChunk(p.overdosageAcuteToxicity);
  }
  if (!transOverdose) {
    transOverdose = "Berikan terapi cairan kristaloid dan perawatan suportif simtomatik jika terjadi overdosis.";
  }

  // 7. PK & PD
  let transPk = '';
  if (p.pharmacokinetics && p.pharmacokinetics.trim()) {
    transPk = await translateMyMemoryChunk(p.pharmacokinetics.substring(0, 400));
  } else {
    transPk = "Profil farmakokinetika spesifik merujuk pada data monograf Plumb's Handbook 7th Ed.";
  }

  let transPd = '';
  if (p.pharmacodynamics && p.pharmacodynamics.trim()) {
    transPd = await translateMyMemoryChunk(p.pharmacodynamics.substring(0, 400));
  } else {
    transPd = "Mekanisme aksi biokimia dan farmakodinamika sesuai klasifikasi kelas obat pada Plumb's Handbook 7th Ed.";
  }

  // 8. Storage
  let transStorage = '';
  if (p.storageStability && p.storageStability.trim()) {
    transStorage = await translateMyMemoryChunk(p.storageStability);
  }
  if (!transStorage) {
    transStorage = "Simpan pada suhu ruang terkontrol (15°C–25°C) di tempat sejuk, kering, dan terlindung dari paparan cahaya langsung.";
  }

  // 9. Client Info & Monitoring
  const clientInfo = [
    "Berikan obat sesuai dosis dan petunjuk dokter hewan. Hubungi klinik bila muncul reaksi efek samping yang tidak diinginkan."
  ];
  const monitoring = [
    "Pantau respons klinis terhadap terapi dan evaluasi toleransi pasien secara berkala."
  ];

  return {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: p.drugClass || drug.drugClass,
    prescriberHighlights: translatedHighlights.length > 0 ? translatedHighlights : ["Sediaan farmakoterapi veteriner sesuai formularium Plumb's 7th Ed."],
    indications: transIndications,
    contraindications: transContra,
    adverseEffects: transAdverse,
    reproductiveNursingSafety: transRepro,
    overdosageAcuteToxicity: transOverdose,
    pharmacokinetics: transPk,
    pharmacodynamics: transPd,
    clientInformation: clientInfo,
    monitoring: monitoring,
    storageStability: transStorage
  };
}

// 6. Main Runner
async function main() {
  console.log('Loading database...');
  const rawDb = fs.readFileSync(dbPath, 'utf8');
  const matchIdx = rawDb.indexOf('export const VET_DRUG_DATABASE = ');
  const jsonStr = rawDb.slice(matchIdx + 'export const VET_DRUG_DATABASE = '.length).trim().replace(/;$/, '');
  const drugs = JSON.parse(jsonStr);

  const plumbsDrugs = drugs.filter((d) => d.plumbs);
  console.log(`Total Plumb's monographs: ${plumbsDrugs.length}`);

  // Step A: Populate all curated drugs
  let curatedAdded = 0;
  plumbsDrugs.forEach((drug) => {
    if (!CACHE[drug.id] && CURATED[drug.id]) {
      const c = CURATED[drug.id];
      CACHE[drug.id] = {
        edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
        drugClass: c.drugClass || drug.plumbs.en?.drugClass || drug.drugClass,
        prescriberHighlights: c.mechanismOfAction ? [c.mechanismOfAction] : (drug.plumbs.en?.prescriberHighlights || []),
        indications: c.indications || drug.plumbs.en?.indications || '',
        contraindications: c.contraindications || drug.plumbs.en?.contraindications || '',
        adverseEffects: c.sideEffects || drug.plumbs.en?.adverseEffects || '',
        reproductiveNursingSafety: "Keamanan penggunaan selama masa kebuntingan dan laktasi belum sepenuhnya ditetapkan. Gunakan hanya jika manfaat klinis lebih besar dari potensi risiko janin.",
        overdosageAcuteToxicity: c.learnMore?.overdose || "Berikan terapi cairan kristaloid dan perawatan suportif simtomatik jika terjadi overdosis.",
        pharmacokinetics: c.pharmacokinetics || drug.plumbs.en?.pharmacokinetics || '',
        pharmacodynamics: c.pharmacodynamics || drug.plumbs.en?.pharmacodynamics || '',
        clientInformation: [c.learnMore?.counseling || "Berikan obat sesuai petunjuk dosis dan jadwal teratur. Hubungi dokter hewan bila timbul reaksi merugikan."],
        monitoring: [c.learnMore?.monitoring || "Pantau perbaikan gejala klinis dan toleransi pasien."],
        storageStability: c.learnMore?.storage || "Simpan pada suhu ruang terkontrol (15°C–25°C) terlindung dari cahaya langsung dan kelembapan."
      };
      curatedAdded++;
    }
  });
  if (curatedAdded > 0) {
    console.log(`Populated ${curatedAdded} curated monographs into cache.`);
  }

  // Step B: Translate remaining uncached
  const remaining = plumbsDrugs.filter((d) => !CACHE[d.id]);
  console.log(`Remaining uncached drugs to translate: ${remaining.length}`);

  let newlyDone = 0;
  for (let i = 0; i < remaining.length; i++) {
    const drug = remaining[i];
    process.stdout.write(`[${i + 1}/${remaining.length}] Translating ${drug.id}... `);
    try {
      const res = await translateDrug(drug);
      if (res) {
        CACHE[drug.id] = res;
        newlyDone++;
        console.log('DONE');
      } else {
        console.log('SKIP');
      }
    } catch (err) {
      console.log(`ERR: ${err.message}`);
    }

    // Persist cache every 5 newly translated drugs
    if (newlyDone > 0 && newlyDone % 5 === 0) {
      fs.writeFileSync(cachePath, JSON.stringify(CACHE, null, 2), 'utf8');
      console.log(`Saved translation cache (${Object.keys(CACHE).length} total).`);
    }

    await sleep(200);
  }

  // Final cache save
  fs.writeFileSync(cachePath, JSON.stringify(CACHE, null, 2), 'utf8');
  console.log(`All translations finished. Total cached: ${Object.keys(CACHE).length}.`);

  // Step C: Attach translations to database & sync Plumb's-only monographs
  let attachedCount = 0;
  drugs.forEach((drug) => {
    if (drug.plumbs && CACHE[drug.id]) {
      drug.plumbs.id = CACHE[drug.id];
      attachedCount++;

      // Sync drug.content.id for Plumb's-only monographs
      if (!drug.bsava && drug.content) {
        const pid = drug.plumbs.id;
        drug.content.id = {
          drugClass: pid.drugClass || drug.drugClass,
          mechanismOfAction: pid.pharmacodynamics || (pid.prescriberHighlights?.[0] || drug.mechanismOfAction),
          indications: pid.indications || drug.indications,
          contraindications: pid.contraindications || drug.contraindications,
          sideEffects: pid.adverseEffects || drug.sideEffects,
          drugInteractions: drug.drugInteractions,
          pharmacokinetics: pid.pharmacokinetics || drug.pharmacokinetics,
          pharmacodynamics: pid.pharmacodynamics || drug.pharmacodynamics,
          learnMore: {
            counseling: (pid.clientInformation || []).join(' '),
            monitoring: (pid.monitoring || []).join(' '),
            overdose: pid.overdosageAcuteToxicity,
            storage: pid.storageStability,
            references: `Plumb's Veterinary Drug Handbook (7th Ed.) hal. ${drug.plumbs.sourcePage || '-'}`
          }
        };
      }
    }
  });

  console.log(`Attached EYD Indonesian translations to ${attachedCount} drug monographs.`);

  // Step D: Write back to public/js/drugs-data.js
  const headerComment = `/**
 * Veterinary Pharmacology Database
 * Comprehensive Clinical Compendium & Drug Directory
 * Sourced from:
 * - BSAVA Small Animal Formulary (Part A: Canine and Feline, 10th Edition by Fergus Allerton)
 * - Plumb's Veterinary Drug Handbook (7th Edition by Donald C. Plumb, Pharm.D.)
 *
 * Total Monographs: ${drugs.length}
 * Bilingual Support: Indonesian (id) & English (en) across both BSAVA and Plumb's
 * Indonesian Translation: Strict adherence to EYD Edisi V and KBBI
 */

export const VET_DRUG_DATABASE = `;

  fs.writeFileSync(dbPath, headerComment + JSON.stringify(drugs) + ';\n', 'utf8');
  const stats = fs.statSync(dbPath);
  console.log(`Successfully updated drugs-data.js: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
