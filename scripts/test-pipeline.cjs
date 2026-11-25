const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'translation-cache.json');
let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch (e) {
    cache = {};
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

// Medical term post-processor to refine Indonesian veterinary terminology
function refineVetIndonesian(text) {
  if (!text) return '';
  return text
    .replace(/\bpra\s*-\s*anestesi\b/gi, 'pre-anestesi')
    .replace(/\bterengah\s*-\s*engah\b/gi, 'napas terengah-engah (panting)')
    .replace(/\bbeta\s*-\s*adrenergik\b/gi, 'beta-adrenergik')
    .replace(/\balpha\s*-\s*1\b/gi, 'alfa-1')
    .replace(/\balpha\s*-\s*2\b/gi, 'alfa-2')
    .replace(/\bbeta\s*-\s*1\b/gi, 'beta-1')
    .replace(/\bbeta\s*-\s*2\b/gi, 'beta-2')
    .replace(/\bcurah jantung\b/gi, 'curah jantung (cardiac output)')
    .replace(/\bhati\b/gi, 'hepar')
    .replace(/\bdisfungsi hati\b/gi, 'disfungsi hepar')
    .replace(/\bpenyakit hati\b/gi, 'penyakit hepar')
    .replace(/\bgangguan GI\b/gi, 'gangguan gastrointestinal (saluran cerna)')
    .replace(/\bGI\b/g, 'saluran cerna')
    .replace(/\bsedang hamil\b/gi, 'bunting')
    .replace(/\bhewan hamil\b/gi, 'hewan bunting')
    .replace(/\bmenyusui\b/gi, 'laktasi')
    .replace(/\banjing anoreksia\b/gi, 'anjing yang mengalami anoreksia')
    .replace(/\bkucing anoreksia\b/gi, 'kucing yang mengalami anoreksia')
    .replace(/\s+/g, ' ')
    .trim();
}

// Chunk text into <= 450 character segments by sentence
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
        // Hard split if a single sentence is excessively long
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

async function translateChunk(chunk) {
  const clean = chunk.trim();
  if (!clean) return '';
  if (cache[clean]) return cache[clean];

  const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(clean) + '&langpair=en|id&de=vetdev.indonesia@gmail.com';
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
      let trans = data.responseData.translatedText;
      // unescape html entities
      trans = trans.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      cache[clean] = trans;
      return trans;
    } else {
      console.warn('MyMemory non-200:', data.responseStatus, data.responseDetails);
      return clean;
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
    return clean;
  }
}

async function translateText(text) {
  if (!text || typeof text !== 'string') return '';
  const chunks = splitIntoChunks(text, 450);
  const translated = [];
  for (const chunk of chunks) {
    const t = await translateChunk(chunk);
    translated.push(t);
    // tiny delay to be polite
    await new Promise(r => setTimeout(r, 60));
  }
  return refineVetIndonesian(translated.join(' '));
}

async function testSample() {
  const bsavaFullPath = 'C:/Users/wedia/Downloads/bsava_part_a_full.json';
  const bsavaData = JSON.parse(fs.readFileSync(bsavaFullPath, 'utf8'));

  console.log('Testing translation pipeline on first 3 drugs...');
  for (let i = 0; i < 3; i++) {
    const m = bsavaData.monographs[i];
    console.log(`\n=== Translating ${m.name} ===`);
    const actionId = await translateText(m.action);
    const usesText = Array.isArray(m.uses) ? m.uses.join(' ') : (m.uses || '');
    const usesId = await translateText(usesText);
    const contraId = await translateText(m.contraindications);
    const adverseId = await translateText(m.adverse_reactions);

    console.log('Action EN:', m.action);
    console.log('Action ID:', actionId);
    console.log('Uses ID:', usesId.substring(0, 150) + '...');
    console.log('Contra ID:', contraId.substring(0, 150) + '...');
    console.log('Adverse ID:', adverseId.substring(0, 150) + '...');
  }

  saveCache();
  console.log(`\nCache saved with ${Object.keys(cache).length} entries.`);
}

testSample().catch(console.error);
