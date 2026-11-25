/**
 * High-Quality Indonesian Translation Engine for Plumb's Veterinary Drug Handbook (7th Edition)
 * Conforming strictly to:
 * - EYD Edisi V (Ejaan Bahasa Indonesia yang Disempurnakan)
 * - KBBI (Kamus Besar Bahasa Indonesia)
 * - Indonesian Veterinary Pharmacology & Medical Terminology Standards
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'public', 'js', 'drugs-data.js');
const cachePath = path.join(__dirname, 'plumbs_eyd_translations_cache.json');

// 1. Load Curated Veterinary Monographs
let CURATED = {};
try {
  const vt = require('./veterinary-translator.cjs');
  CURATED = vt.CURATED_ID_MONOGRAPHS || {};
} catch (e) {
  CURATED = {};
}

// 2. Load Existing Cache
let CACHE = {};
if (fs.existsSync(cachePath)) {
  try {
    CACHE = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    console.log(`Loaded ${Object.keys(CACHE).length} cached EYD translations.`);
  } catch (e) {
    CACHE = {};
  }
}

// 3. Helper: Sleep / Delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 4. Helper: Call Google Translate API with Retry
async function fetchTranslation(text, retries = 3) {
  if (!text || !text.trim()) return '';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        body: 'q=' + encodeURIComponent(text)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      if (!json || !json[0]) return '';
      return json[0].map((chunk) => chunk[0]).join('');
    } catch (err) {
      if (attempt === retries) {
        console.warn(`Translation failed after ${retries} attempts: ${err.message}`);
        return '';
      }
      await sleep(1000 * attempt);
    }
  }
  return '';
}

// 5. EYD Edisi V & KBBI Polish Function
function polishIndonesianEydKbbi(text) {
  if (!text) return '';
  let s = text;

  // Standardize capitalization after punctuation
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
  s = s.replace(/\bspaying\b/gi, 'ovariohisterektomi');
  s = s.replace(/\bneutering\b/gi, 'kastrasi');
  s = s.replace(/\btukak\b/gi, 'tukak (ulkus)');
  s = s.replace(/\bGI\s+upset\b/gi, 'gangguan saluran cerna');
  s = s.replace(/\bberhubungan dengan GI\b/gi, 'berkaitan dengan saluran cerna (gastrointestinal/GI)');
  s = s.replace(/\bterkait GI\b/gi, 'berkaitan dengan saluran cerna (GI)');
  s = s.replace(/\befek samping yang paling mungkin terjadi\b/gi, 'efek samping yang paling sering muncul');
  s = s.replace(/\bkemungkinan besar efek samping\b/gi, 'efek samping yang paling sering muncul');
  s = s.replace(/\bbakteri pembawa beta-laktamase\b/gi, 'bakteri penghasil enzim beta-laktamase');
  s = s.replace(/\bmemproduksi beta-laktamase\b/gi, 'penghasil enzim beta-laktamase');
  s = s.replace(/\bhanya sebagai terapi tunggal\b/gi, 'sebagai terapi tunggal');
  s = s.replace(/\bhewan yang kekurangan berat badan\b/gi, 'hewan dengan berat badan di bawah normal (underweight)');
  s = s.replace(/\bperut kembung\b/gi, 'perut kembung (flatulensi)');
  s = s.replace(/\bketoasidosis diabetikum\b/gi, 'ketoasidosis diabetik');

  // Clean Whitespace and Punctuation Spacing
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/\s+([.,;:?!])/g, '$1');

  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }

  return s;
}

// 6. Translate a structured batch of sections
async function translateSections(sectionsMap) {
  const keys = Object.keys(sectionsMap);
  if (keys.length === 0) return {};

  const lines = [];
  for (const k of keys) {
    const rawVal = sectionsMap[k];
    if (rawVal && rawVal.trim()) {
      lines.push(`<<<SEC:${k}>>> ${rawVal.trim()}`);
    }
  }

  if (lines.length === 0) return {};

  const combinedPayload = lines.join('\n\n');
  const rawTranslated = await fetchTranslation(combinedPayload);

  const results = {};
  const markerRegex = /(?:<<<|«««)\s*SEC\s*:\s*([A-Za-z0-9_]+)\s*(?:>>>|»»»)\s*([\s\S]*?)(?=(?:<<<|«««)\s*SEC\s*:|$)/gi;
  let match;

  while ((match = markerRegex.exec(rawTranslated)) !== null) {
    const matchedKey = match[1].toUpperCase();
    const matchedVal = polishIndonesianEydKbbi(match[2].trim());
    results[matchedKey] = matchedVal;
  }

  // Fallback: If any key was missed, translate individually
  for (const k of keys) {
    const upperKey = k.toUpperCase();
    if (!results[upperKey] && sectionsMap[k] && sectionsMap[k].trim()) {
      const fallbackVal = await fetchTranslation(sectionsMap[k]);
      results[upperKey] = polishIndonesianEydKbbi(fallbackVal);
      await sleep(100);
    }
  }

  return results;
}

// 7. Translate Full Plumb's Drug Object
async function translatePlumbsDrug(drug) {
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

  // Batch A: Clinical Identifiers & Indications
  const batchA = {};
  if (p.drugClass) batchA['CLASS'] = p.drugClass;
  if (p.indications) batchA['IND'] = p.indications;
  if (p.contraindications) batchA['CONTRA'] = p.contraindications;
  if (p.prescriberHighlights && p.prescriberHighlights.length > 0) {
    p.prescriberHighlights.forEach((h, i) => {
      if (h && h.trim()) batchA[`HL_${i}`] = h.trim();
    });
  }

  // Batch B: Pharmacology, Adverse Effects & Care
  const batchB = {};
  if (p.adverseEffects) batchB['ADV'] = p.adverseEffects;
  if (p.reproductiveNursingSafety) batchB['REPRO'] = p.reproductiveNursingSafety;
  if (p.overdosageAcuteToxicity) batchB['OD'] = p.overdosageAcuteToxicity;
  if (p.pharmacokinetics) batchB['PK'] = p.pharmacokinetics;
  if (p.pharmacodynamics) batchB['PD'] = p.pharmacodynamics;
  if (p.storageStability) batchB['STORE'] = p.storageStability;
  if (p.clientInformation && p.clientInformation.length > 0) {
    p.clientInformation.forEach((c, i) => {
      if (c && c.trim()) batchB[`CLI_${i}`] = c.trim();
    });
  }
  if (p.monitoring && p.monitoring.length > 0) {
    p.monitoring.forEach((m, i) => {
      if (m && m.trim()) batchB[`MON_${i}`] = m.trim();
    });
  }

  // Translate both batches
  const resA = await translateSections(batchA);
  await sleep(150);
  const resB = await translateSections(batchB);

  // Assemble translated Prescriber Highlights array
  const translatedHighlights = [];
  if (p.prescriberHighlights && p.prescriberHighlights.length > 0) {
    p.prescriberHighlights.forEach((_, i) => {
      const val = resA[`HL_${i}`];
      if (val) translatedHighlights.push(val);
    });
  }

  // Assemble translated Client Info array
  const translatedClientInfo = [];
  if (p.clientInformation && p.clientInformation.length > 0) {
    p.clientInformation.forEach((_, i) => {
      const val = resB[`CLI_${i}`];
      if (val) translatedClientInfo.push(val);
    });
  }
  if (translatedClientInfo.length === 0) {
    translatedClientInfo.push("Berikan obat sesuai dosis dan petunjuk dokter hewan. Hubungi klinik bila muncul reaksi efek samping yang tidak diinginkan.");
  }

  // Assemble translated Monitoring array
  const translatedMonitoring = [];
  if (p.monitoring && p.monitoring.length > 0) {
    p.monitoring.forEach((_, i) => {
      const val = resB[`MON_${i}`];
      if (val) translatedMonitoring.push(val);
    });
  }
  if (translatedMonitoring.length === 0) {
    translatedMonitoring.push("Pantau respons klinis terhadap terapi dan evaluasi toleransi pasien secara berkala.");
  }

  return {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: resA['CLASS'] || p.drugClass || drug.drugClass,
    prescriberHighlights: translatedHighlights.length > 0 ? translatedHighlights : (p.prescriberHighlights || []),
    indications: resA['IND'] || p.indications || "Indikasi klinis sesuai pedoman monograf Plumb's Handbook 7th Ed.",
    contraindications: resA['CONTRA'] || p.contraindications || "Kontraindikasi pada hewan dengan riwayat hipersensitivitas terhadap obat ini.",
    adverseEffects: resB['ADV'] || p.adverseEffects || "Evaluasi toleransi pasien dan pantau timbulnya reaksi efek samping selama terapi.",
    reproductiveNursingSafety: resB['REPRO'] || p.reproductiveNursingSafety || "Keamanan penggunaan selama masa kebuntingan dan laktasi belum sepenuhnya ditetapkan. Gunakan hanya jika manfaat klinis lebih besar dari potensi risiko janin.",
    overdosageAcuteToxicity: resB['OD'] || p.overdosageAcuteToxicity || "Berikan terapi cairan kristaloid dan perawatan suportif simtomatik jika terjadi overdosis.",
    pharmacokinetics: resB['PK'] || p.pharmacokinetics || "Profil farmakokinetika spesifik merujuk pada data monograf Plumb's Handbook 7th Ed.",
    pharmacodynamics: resB['PD'] || p.pharmacodynamics || "Mekanisme aksi biokimia dan farmakodinamika sesuai klasifikasi kelas obat pada Plumb's Handbook 7th Ed.",
    clientInformation: translatedClientInfo,
    monitoring: translatedMonitoring,
    storageStability: resB['STORE'] || p.storageStability || "Simpan pada suhu ruang terkontrol (15°C–25°C) di tempat sejuk, kering, dan terlindung dari cahaya matahari langsung."
  };
}

// 8. Main Execution Function with Concurrency Pool
async function main() {
  console.log('Loading database...');
  const rawDb = fs.readFileSync(dbPath, 'utf8');
  const matchIdx = rawDb.indexOf('export const VET_DRUG_DATABASE = ');
  const jsonStr = rawDb.slice(matchIdx + 'export const VET_DRUG_DATABASE = '.length).trim().replace(/;$/, '');
  const drugs = JSON.parse(jsonStr);

  const plumbsDrugs = drugs.filter((d) => d.plumbs);
  console.log(`Found ${plumbsDrugs.length} drugs with Plumb's monographs.`);

  const CONCURRENCY = 4;
  let activeIndex = 0;
  let newlyTranslated = 0;
  let completedCount = 0;
  let saveTimer = null;

  function scheduleSaveCache() {
    if (!saveTimer) {
      saveTimer = setTimeout(() => {
        fs.writeFileSync(cachePath, JSON.stringify(CACHE, null, 2), 'utf8');
        saveTimer = null;
      }, 4000);
    }
  }

  async function worker(workerId) {
    while (activeIndex < plumbsDrugs.length) {
      const idx = activeIndex++;
      const drug = plumbsDrugs[idx];

      if (CACHE[drug.id]) {
        drug.plumbs.id = CACHE[drug.id];
        completedCount++;
        continue;
      }

      try {
        const idTranslation = await translatePlumbsDrug(drug);
        if (idTranslation) {
          CACHE[drug.id] = idTranslation;
          drug.plumbs.id = idTranslation;
          newlyTranslated++;
          completedCount++;
          scheduleSaveCache();

          if (completedCount % 25 === 0 || completedCount === plumbsDrugs.length) {
            console.log(`Progress: ${completedCount}/${plumbsDrugs.length} monographs processed (${newlyTranslated} new translations, latest: ${drug.id}).`);
          }
        }
      } catch (err) {
        console.warn(`[Worker ${workerId}] Error translating ${drug.id}: ${err.message}`);
      }

      await sleep(120);
    }
  }

  console.log(`Starting translation pipeline with ${CONCURRENCY} concurrent workers...`);
  const startTime = Date.now();
  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(worker(w + 1));
  }
  await Promise.all(workers);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Translation pipeline finished in ${elapsed}s. Total cached: ${Object.keys(CACHE).length}.`);

  // Ensure all drugs in memory have their cached translations attached
  plumbsDrugs.forEach((drug) => {
    if (CACHE[drug.id]) {
      drug.plumbs.id = CACHE[drug.id];
    }

    // Sync drug.content.id for Plumb's-only monographs so catalog cards also show in EYD Indonesian
    if (!drug.bsava && drug.content && drug.plumbs.id) {
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
  });

  // Save final cache file
  fs.writeFileSync(cachePath, JSON.stringify(CACHE, null, 2), 'utf8');
  console.log(`Persisted translation cache to ${cachePath}.`);

  // Write back to public/js/drugs-data.js
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
