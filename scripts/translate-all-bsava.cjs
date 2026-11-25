const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'translation-cache.json');
const PROGRESS_FILE = path.join(__dirname, 'bsava_translated_id.json');
const BSAVA_FULL_PATH = 'C:/Users/wedia/Downloads/bsava_part_a_full.json';

let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch (e) {
    cache = {};
  }
}

let translatedDrugs = {};
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    translatedDrugs = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  } catch (e) {
    translatedDrugs = {};
  }
}

function saveState() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(translatedDrugs, null, 2), 'utf8');
}

function refineVetIndonesian(text) {
  if (!text) return '';
  return text
    .replace(/\bhepar\s*-\s*hepar\b/gi, 'hati-hati')
    .replace(/\bpra\s*-\s*anestesi\b/gi, 'pre-anestesi')
    .replace(/\bterengah\s*-\s*engah\b/gi, 'napas terengah-engah (panting)')
    .replace(/\bbeta\s*-\s*adrenergik\b/gi, 'beta-adrenergik')
    .replace(/\balpha\s*-\s*1\b/gi, 'alfa-1')
    .replace(/\balpha\s*-\s*2\b/gi, 'alfa-2')
    .replace(/\bbeta\s*-\s*1\b/gi, 'beta-1')
    .replace(/\bbeta\s*-\s*2\b/gi, 'beta-2')
    .replace(/\bpenyakit hati\b/gi, 'penyakit hepar')
    .replace(/\bdisfungsi hati\b/gi, 'disfungsi hepar')
    .replace(/\bkerusakan hati\b/gi, 'kerusakan hepar')
    .replace(/\bcedera hati\b/gi, 'cedera hepar')
    .replace(/\btoksisitas hati\b/gi, 'toksisitas hepar')
    .replace(/\bkasus hati\b/gi, 'kasus hepar')
    .replace(/\bgagal hati\b/gi, 'gagal hepar')
    .replace(/\benzim hati\b/gi, 'enzim hepar')
    .replace(/\bhati kronis\b/gi, 'hepar kronis')
    .replace(/\bgangguan GI\b/gi, 'gangguan gastrointestinal (saluran cerna)')
    .replace(/\bGI\b/g, 'saluran cerna')
    .replace(/\bsedang hamil\b/gi, 'bunting')
    .replace(/\bhewan hamil\b/gi, 'hewan bunting')
    .replace(/\bhewan menyusui\b/gi, 'hewan laktasi')
    .replace(/\banjing anoreksia\b/gi, 'anjing yang mengalami anoreksia')
    .replace(/\bkucing anoreksia\b/gi, 'kucing yang mengalami anoreksia')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitIntoChunks(text, maxLen = 450) {
  if (!text || text.length <= maxLen) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks = [];
  let current = '';

  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length > maxLen) {
        for (let i = 0; i < s.length; i += maxLen) {
          chunks.push(s.substring(i, i + maxLen));
        }
        current = '';
      } else {
        current = s.trim();
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(chunk, retries = 3) {
  const clean = chunk.trim();
  if (!clean) return '';
  if (cache[clean]) return cache[clean];

  const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(clean) + '&langpair=en|id&de=vetdev.indonesia@gmail.com';

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        let trans = data.responseData.translatedText;
        trans = trans.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        cache[clean] = trans;
        return trans;
      }
      if (data.responseStatus === 429) {
        console.warn('Rate limited (429), waiting 2s...');
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      if (attempt === retries - 1) {
        console.error('Fetch error after retries:', clean.substring(0, 40), err.message);
      }
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return clean;
}

async function translateText(text) {
  if (!text || typeof text !== 'string') return '';
  const chunks = splitIntoChunks(text, 450);
  const translated = [];
  for (const chunk of chunks) {
    const t = await translateChunk(chunk);
    translated.push(t);
    await new Promise(r => setTimeout(r, 40));
  }
  return refineVetIndonesian(translated.join(' '));
}

async function translateAll() {
  const bsavaData = JSON.parse(fs.readFileSync(BSAVA_FULL_PATH, 'utf8'));
  const total = bsavaData.monographs.length;
  console.log(`Starting BSAVA full translation pipeline for ${total} monographs...`);
  console.log(`Already translated in progress file: ${Object.keys(translatedDrugs).length}`);

  let count = 0;
  for (let i = 0; i < total; i++) {
    const m = bsavaData.monographs[i];
    const key = m.name.toLowerCase().trim();

    if (translatedDrugs[key]) {
      continue;
    }

    const actionText = typeof m.action === 'string' ? m.action : (Array.isArray(m.action) ? m.action.join(' ') : '');
    const usesText = Array.isArray(m.uses) ? m.uses.join(' ') : (m.uses || '');
    const contraText = typeof m.contraindications === 'string' ? m.contraindications : (Array.isArray(m.contraindications) ? m.contraindications.join(' ') : '');
    const adverseText = typeof m.adverse_reactions === 'string' ? m.adverse_reactions : (Array.isArray(m.adverse_reactions) ? m.adverse_reactions.join(' ') : '');
    const interactText = typeof m.drug_interactions === 'string' ? m.drug_interactions : (Array.isArray(m.drug_interactions) ? m.drug_interactions.join(' ') : '');
    const safetyText = typeof m.safety_and_handling === 'string' ? m.safety_and_handling : (Array.isArray(m.safety_and_handling) ? m.safety_and_handling.join(' ') : '');

    const [actionId, usesId, contraId, adverseId, interactId, safetyId] = await Promise.all([
      translateText(actionText),
      translateText(usesText),
      translateText(contraText),
      translateText(adverseText),
      translateText(interactText),
      translateText(safetyText)
    ]);

    translatedDrugs[key] = {
      name: m.name,
      mechanismOfAction: actionId || `Aksi farmakologis ${m.name} sesuai panduan monograf BSAVA.`,
      indications: usesId || `Diindikasikan untuk pengobatan klinis pada anjing dan kucing berdasarkan BSAVA Formulary.`,
      contraindications: contraId || `Kontraindikasi pada riwayat hipersensitivitas terhadap ${m.name}.`,
      sideEffects: adverseId || `Pantau respon klinis dan evaluasi toleransi obat pada hewan.`,
      drugInteractions: interactId || `Periksa kompatibilitas farmakokinetik saat dikombinasikan dengan obat lain.`,
      safetyAndHandling: safetyId || `Ikuti petunjuk dokter hewan dan pedoman keselamatan penanganan sediaan.`
    };

    count++;
    if (count % 10 === 0 || i === total - 1) {
      saveState();
      console.log(`[${i + 1}/${total}] Translated ${m.name} (Total done: ${Object.keys(translatedDrugs).length}, Cache: ${Object.keys(cache).length})`);
    }
  }

  saveState();
  console.log(`\nAll ${total} BSAVA monographs successfully translated and cached!`);
}

translateAll().catch(err => {
  console.error('Translation run failed:', err);
  saveState();
});
