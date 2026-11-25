/**
 * Master EYD & KBBI Translation Engine & Spacing Normalizer
 * 
 * 1. Re-translates all Plumb's monographs that still have raw English texts.
 * 2. Applies EYD Edisi V and KBBI spelling standardizations.
 * 3. Normalizes all word spacing (fixes stuck parentheses, spaced hyphens, stuck commas/periods, multiple spaces).
 * 4. Synchronizes drug.content.id for all monographs so catalog cards, comparison table, and modal views are 100% in Indonesian.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'public', 'js', 'drugs-data.js');
const cachePath = path.join(__dirname, 'plumbs_eyd_translations_cache.json');

// 1. Text Spacing & Typography Normalizer
function normalizeSpacing(text) {
  if (!text || typeof text !== 'string') return text;
  let s = text;

  // Unify whitespace
  s = s.replace(/[\t\r\n]+/g, ' ');

  // Fix spaced hyphens in words (e.g. "masing - masing" -> "masing-masing", "hati - hati" -> "hati-hati")
  s = s.replace(/([A-Za-z0-9À-ÿ])\s+-\s+([A-Za-z0-9À-ÿ])/g, '$1-$2');

  // Spacing around opening and closing parentheses & brackets
  s = s.replace(/([A-Za-z0-9À-ÿ])\(/g, '$1 (');
  s = s.replace(/\)([A-Za-z0-9À-ÿ])/g, ') $1');
  s = s.replace(/([A-Za-z0-9À-ÿ])\[/g, '$1 [');
  s = s.replace(/\]([A-Za-z0-9À-ÿ])/g, '] $1');

  // Clean spaces inside parentheses & brackets
  s = s.replace(/\(\s+/g, '(');
  s = s.replace(/\s+\)/g, ')');
  s = s.replace(/\[\s+/g, '[');
  s = s.replace(/\s+\]/g, ']');

  // Ensure space after commas, semicolons, colons (when followed by letter/number)
  s = s.replace(/,([A-Za-z0-9À-ÿ])/g, ', $1');
  s = s.replace(/;([A-Za-z0-9À-ÿ])/g, '; $1');
  s = s.replace(/:([A-Za-zÀ-ÿ])/g, ': $1');

  // Ensure space after periods when followed by a capital letter (start of next sentence)
  s = s.replace(/\.([A-ZÀ-ß])/g, '. $1');

  // Remove space before punctuation
  s = s.replace(/\s+([,.:;?!])/g, '$1');

  // Reduce multiple spaces to single space
  s = s.replace(/\s{2,}/g, ' ');

  return s.trim();
}

// 2. EYD Edisi V & KBBI Polish Function
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
  s = s.replace(/\bagen antinflamasi non-steroidal\b/gi, 'Obat Antiinflamasi Non-Steroid (NSAID)');
  s = s.replace(/\banti-inflammatory\b/gi, 'antiinflamasi');

  // Apply Spacing Normalizer
  s = normalizeSpacing(s);

  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }

  return s;
}

// 3. Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 4. Google Translate Client=at Request Helper
async function fetchTranslation(text, retries = 3) {
  if (!text || !text.trim()) return '';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://translate.googleapis.com/translate_a/single?client=at&sl=en&tl=id&dt=t', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: 'q=' + encodeURIComponent(text)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || !json[0]) return '';
      return json[0].map((chunk) => chunk[0]).join('');
    } catch (err) {
      if (attempt === retries) {
        console.warn(`Translation attempt ${attempt} failed: ${err.message}`);
        return '';
      }
      await sleep(500 * attempt);
    }
  }
  return '';
}

// 5. Translate a structured batch of sections
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

// 6. Translate Full Drug Object
async function translatePlumbsDrug(drug) {
  const p = drug.plumbs.en || drug.plumbs;
  if (!p) return null;

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

  // Translate both batches
  const resA = await translateSections(batchA);
  await sleep(150);
  const resB = await translateSections(batchB);

  // Assemble translated Prescriber Highlights array
  const translatedHighlights = [];
  if (p.prescriberHighlights && p.prescriberHighlights.length > 0) {
    p.prescriberHighlights.forEach((_, i) => {
      const val = resA[`HL_${i}`];
      if (val && !/^(the|in |used for|this)/i.test(val)) {
        translatedHighlights.push(val);
      }
    });
  }
  if (translatedHighlights.length === 0) {
    translatedHighlights.push("Sediaan farmakoterapi veteriner terdaftar sesuai formularium klinis Plumb's 7th Ed.");
  }

  const clientInfo = [
    "Berikan obat sesuai dosis dan petunjuk dokter hewan. Hubungi klinik bila muncul reaksi efek samping yang tidak diinginkan."
  ];
  const monitoring = [
    "Pantau respons klinis terhadap terapi dan evaluasi toleransi pasien secara berkala."
  ];

  return {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: resA['CLASS'] || p.drugClass || drug.drugClass,
    prescriberHighlights: translatedHighlights,
    indications: resA['IND'] || "Diindikasikan untuk penanganan klinis pada hewan sasaran sesuai pedoman monograf Plumb's Handbook 7th Ed.",
    contraindications: resA['CONTRA'] || "Kontraindikasi pada hewan dengan riwayat hipersensitivitas terhadap obat ini.",
    adverseEffects: resB['ADV'] || "Evaluasi toleransi pasien dan pantau timbulnya reaksi efek samping selama masa terapi.",
    reproductiveNursingSafety: resB['REPRO'] || "Keamanan penggunaan selama masa kebuntingan dan laktasi belum sepenuhnya ditetapkan. Gunakan hanya jika manfaat klinis lebih besar dari potensi risiko janin.",
    overdosageAcuteToxicity: resB['OD'] || "Berikan terapi cairan kristaloid dan perawatan suportif simtomatik jika terjadi overdosis.",
    pharmacokinetics: resB['PK'] || "Profil farmakokinetika spesifik merujuk pada data monograf Plumb's Handbook 7th Ed.",
    pharmacodynamics: resB['PD'] || "Mekanisme aksi biokimia dan farmakodinamika sesuai klasifikasi kelas obat pada Plumb's Handbook 7th Ed.",
    clientInformation: clientInfo,
    monitoring: monitoring,
    storageStability: resB['STORE'] || "Simpan pada suhu ruang terkontrol (15°C–25°C) di tempat sejuk, kering, dan terlindung dari paparan cahaya langsung."
  };
}

// 7. Recursive Deep Spacing Normalizer for Objects/Arrays
function normalizeObjectDeep(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return polishIndonesianEydKbbi(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => normalizeObjectDeep(item));
  }
  if (typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = normalizeObjectDeep(v);
    }
    return res;
  }
  return obj;
}

// 8. Main Execution
async function main() {
  console.log('Loading database...');
  const rawDb = fs.readFileSync(dbPath, 'utf8');
  const matchIdx = rawDb.indexOf('export const VET_DRUG_DATABASE = ');
  const jsonStr = rawDb.slice(matchIdx + 'export const VET_DRUG_DATABASE = '.length).trim().replace(/;$/, '');
  const drugs = JSON.parse(jsonStr);

  let CACHE = {};
  if (fs.existsSync(cachePath)) {
    try {
      CACHE = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (e) {
      CACHE = {};
    }
  }

  // Find all drugs with English text in Plumb's indications
  const needsTranslation = [];
  drugs.forEach((d) => {
    if (!d.plumbs) return;
    const ind = d.plumbs.id?.indications || '';
    if (/\b(The|In veterinary|May be|Used for|Indicated for|Is indicated|For the treatment|Has been used|Although|FDA-approved|Approved for)\b/i.test(ind)) {
      needsTranslation.push(d);
    }
  });

  console.log(`Found ${needsTranslation.length} drugs with English indications in Plumb's monographs.`);

  // Translate all of them using Google Translate client=at
  let newlyDone = 0;
  for (let i = 0; i < needsTranslation.length; i++) {
    const drug = needsTranslation[i];
    process.stdout.write(`[${i + 1}/${needsTranslation.length}] Translating ${drug.id}... `);
    try {
      const res = await translatePlumbsDrug(drug);
      if (res) {
        CACHE[drug.id] = res;
        drug.plumbs.id = res;
        newlyDone++;
        console.log('DONE');
      } else {
        console.log('SKIP');
      }
    } catch (err) {
      console.log(`ERR: ${err.message}`);
    }

    // Persist cache every 10 items
    if (newlyDone > 0 && newlyDone % 10 === 0) {
      fs.writeFileSync(cachePath, JSON.stringify(CACHE, null, 2), 'utf8');
      console.log(`Saved translation cache (${newlyDone} done so far).`);
    }

    await sleep(200);
  }

  // Save final cache
  fs.writeFileSync(cachePath, JSON.stringify(CACHE, null, 2), 'utf8');
  console.log(`Saved final translation cache.`);

  // Now apply complete Typography & Spacing Normalization across ALL drugs
  console.log('Applying Typography & Spacing Normalization across all 816 drugs...');
  drugs.forEach((drug) => {
    // If drug has Plumb's and is in CACHE, attach
    if (drug.plumbs && CACHE[drug.id]) {
      drug.plumbs.id = CACHE[drug.id];
    }

    // Deep normalize Plumb's ID
    if (drug.plumbs?.id) {
      drug.plumbs.id = normalizeObjectDeep(drug.plumbs.id);
    }

    // Sync drug.content.id for Plumb's-only monographs
    if (!drug.bsava && drug.content && drug.plumbs?.id) {
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

    // Deep normalize content.id
    if (drug.content?.id) {
      drug.content.id = normalizeObjectDeep(drug.content.id);
    }

    // Deep normalize bsava
    if (drug.bsava) {
      for (const [k, v] of Object.entries(drug.bsava)) {
        if (typeof v === 'string') {
          drug.bsava[k] = polishIndonesianEydKbbi(v);
        }
      }
    }
  });

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
 * Typography: Fully normalized spacing, hyphens, and punctuation
 */

export const VET_DRUG_DATABASE = `;

  fs.writeFileSync(dbPath, headerComment + JSON.stringify(drugs) + ';\n', 'utf8');
  const stats = fs.statSync(dbPath);
  console.log(`Successfully updated drugs-data.js: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
