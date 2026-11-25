#!/usr/bin/env node
/**
 * Scrape monographs out of "Plumb's Veterinary Drug Handbook" (7th ed.) PDF text
 * into structured JSON (A-Z).
 *
 * Pipeline:
 *   1. pdftotext -layout  -> raw page text (cached in scratch dir)
 *   2. normalize Latin-1 -> UTF-8, split into pages/lines
 *   3. detect monograph heading blocks ("ACEPROMAZINE MALEATE" + "(pron) TradeNames" + CLASS)
 *   4. split each monograph body on the canonical Plumb's section headings
 *   5. structure Doses per species, Drug Interactions as a list, dosage forms, references
 *
 * Usage:
 *   node scripts/scrape-plumbs-handbook.cjs [--text <txt>] [--out <json>] [--diag] [--quiet]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PDF = path.join(ROOT, 'Veternary Drug Handbook.pdf');
const DEFAULT_TEXT = path.join(
  process.env.TMPDIR || process.env.TEMP || ROOT,
  'plumbs-vdh-7e.txt',
);

function argOf(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const TEXT_PATH = argOf('--text', DEFAULT_TEXT);
const OUT_PATH = argOf('--out', path.join(ROOT, 'data', 'plumbs-veterinary-drug-handbook-7e.json'));
const DIAG = process.argv.includes('--diag');
const QUIET = process.argv.includes('--quiet');

function log(...a) {
  if (!QUIET) console.log(...a);
}

/* ------------------------------------------------------------------ *
 * 1. text acquisition
 * ------------------------------------------------------------------ */
function ensureTextFile() {
  if (fs.existsSync(TEXT_PATH)) return;
  if (!fs.existsSync(PDF)) throw new Error(`PDF not found: ${PDF}`);
  log(`extracting text with pdftotext -> ${TEXT_PATH}`);
  // native (non-MSYS) path for the external binary
  const out = TEXT_PATH.replace(/\\/g, '/');
  execFileSync('pdftotext', ['-layout', PDF.replace(/\\/g, '/'), out], { stdio: 'inherit' });
}

/* ------------------------------------------------------------------ *
 * 2. normalization / page+line model
 * ------------------------------------------------------------------ */
const SECTION_REGISTRY = [
  // [regex on trimmed line, canonical key, kind]
  [/^Prescriber Highlights$/i, 'prescriberHighlights', 'list'],
  [/^Uses\/Indications$/i, 'indications', 'text'],
  [/^Indications\/Pharmacology$/i, 'indicationsActions', 'text'],
  [/^Indications\/Actions$/i, 'indicationsActions', 'text'],
  [/^Pharmacology\/Actions$/i, 'pharmacodynamics', 'text'],
  [/^Pharmacokinetics$/i, 'pharmacokinetics', 'text'],
  [/^Contraindications\/Precautions\/Warnings$/i, 'contraindications', 'text'],
  [/^Precautions\/Adverse Effects$/i, 'adverseEffectsPrecautions', 'text'],
  [/^Adverse Effects$/i, 'adverseEffects', 'text'],
  [/^Reproductive\/Nursing Safety$/i, 'reproductiveNursingSafety', 'text'],
  [/^Overdosage\/Acute Toxicity$/i, 'overdosageAcuteToxicity', 'text'],
  [/^Drug Interactions$/i, 'drugInteractions', 'interactions'],
  [/^Drug Interactions\/Laboratory Considerations$/i, 'drugInteractions', 'interactions'],
  [/^Laboratory Considerations$/i, 'laboratoryConsiderations', 'text'],
  [/^Doses$/i, 'doses', 'doses'],
  [/^Suggested Dosages\/Use$/i, 'doses', 'doses'],
  [/^Suggested Dosages\/Precautions\/Adverse Effects$/i, 'doses', 'doses'],
  [/^Monitoring$/i, 'monitoring', 'list'],
  [/^Client Information$/i, 'clientInformation', 'list'],
  [/^Chemistry\/Synonyms$/i, 'chemistry', 'text'],
  [/^Chemistry$/i, 'chemistry', 'text'],
  [/^Storage\/Stability$/i, 'storageStability', 'text'],
  [/^Compatibility\/Compounding Considerations$/i, 'compatibilityCompounding', 'text'],
  [/^Dosage Forms\/Regulatory Status$/i, 'dosageForms', 'dosageForms'],
  [/^Dosage Forms\/Regulatory Status\/Withdrawal Times$/i, 'dosageForms', 'dosageForms'],
  [/^Combination Products:$/i, 'combinationProducts', 'list'],
  [/^References$/i, 'references', 'references'],
];

const LABELED_PRODUCT_HEAD = /^(VETERINARY|HUMAN)[- ](?:LABELED|APPROVED) PRODUCTS\s*:/i;

/**
 * Fallback spellings for section headings. Plumb's uses a handful of one-off variants
 * ("Pharmacology", "Overdosage", "Dosage Forms/Approval", ...); these are checked after the
 * canonical registry, so the canonical names always win.
 */
const SECTION_REGISTRY_FALLBACK = [
  [/^Pharmacology$/i, 'pharmacodynamics', 'text'],
  [/^Pharmacokinetics\/Pharmacodynamics$/i, 'pharmacokineticsPharmacodynamics', 'text'],
  [/^Indications$/i, 'indications', 'text'],
  [/^Indications\/Pharmacology\/Suggested Dosage$/i, 'indicationsActions', 'text'],
  [/^Indications\/Dosages\/Precautions$/i, 'indicationsDosagesPrecautions', 'text'],
  [/^Suggested (?:Uses\/)?Dos/i, 'doses', 'doses'],
  [/^Labeled Dose Protocol$/i, 'doses', 'doses'],
  [/^Drug\/Lab(?:oratory)? Interactions$/i, 'drugInteractions', 'interactions'],
  [/^Overdos/i, 'overdosageAcuteToxicity', 'text'],
  [/^Contraindications/i, 'contraindications', 'text'],
  [/^Precautions/i, 'adverseEffectsPrecautions', 'text'],
  [/^Treatment Monitoring$/i, 'monitoring', 'list'],
  [/^Monitoring(?:\/Client Information| Parameters)?$/i, 'monitoring', 'list'],
  [/^Client [Ii]nformation$/i, 'clientInformation', 'list'],
  [/^Chemistry/i, 'chemistry', 'text'],
  [/^(?:Storage|Stability)/i, 'storageStability', 'text'],
  [/^Compatibility/i, 'compatibilityCompounding', 'text'],
  [/^Dosage Forms/i, 'dosageForms', 'dosageForms'],
];

function matchSection(line) {
  const t = line.trim();
  if (!t) return null;
  const indent = line.length - line.trimStart().length;
  if (indent > 1 && !/^Prescriber Highlights$/i.test(t)) return null;
  for (const [re, key, kind] of SECTION_REGISTRY) if (re.test(t)) return { key, kind };
  const labeled = LABELED_PRODUCT_HEAD.exec(t);
  if (labeled) {
    return {
      key: 'labeledProducts',
      kind: 'labeled',
      bucket: /^VETERINARY/i.test(labeled[1]) ? 'veterinaryLabeled' : 'humanLabeled',
    };
  }
  for (const [re, key, kind] of SECTION_REGISTRY_FALLBACK) if (re.test(t)) return { key, kind };
  return null;
}

function buildLines(rawLatin1) {
  const text = rawLatin1
    .replace(/\u00ad/g, '-') // glyph used by this PDF for hyphen-minus / dash
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ');
  const pages = text.split('\f');
  const lines = [];
  pages.forEach((pageText, p) => {
    pageText.split('\n').forEach((t) => {
      lines.push({ t: t.replace(/\s+$/, ''), page: p + 1 });
    });
  });
  return lines;
}

/* ------------------------------------------------------------------ *
 * 3. heading detection
 * ------------------------------------------------------------------ */
const ALL_CAPS = /^[A-Z][A-Z0-9 ,/&().;'+-]{2,90}$/;
const stripParens = (t) => t.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
const TITLE_CASE = /^[A-Z][A-Za-z0-9 ,/&().'-]{2,40}$/;
// headings that can only open a monograph (used to reject in-body caps lines, e.g. drug-interaction entries)
const START_SECTIONS = new Set([
  'prescriberHighlights',
  'indications',
  'indicationsActions',
  'pharmacodynamics',
  'pharmacokinetics',
  'contraindications',
  'adverseEffectsPrecautions',
]);

/** Plumb's prints headings in caps; a few PDF-rendered ones are title case ("Piroxicam"). */
function isCapsTitle(t) {
  const s = t.trim();
  if (!s || s.length > 90) return false;
  const bare = stripParens(s);
  return Boolean(bare) && ALL_CAPS.test(bare);
}
function isMixedTitle(t) {
  const s = t.trim();
  if (!s || !TITLE_CASE.test(s) || /[.,;:]$/.test(s)) return false;
  if (/\bsee\b/i.test(s)) return false; // cross-reference line, e.g. "Etretinate-see Acitretin"
  const words = s.split(/\s+/);
  return words.length <= 3 && words.every((w) => /^[A-Z]/.test(w));
}

// "(ase-pro-ma-zeen) PromAce®" - syllable pronunciation; a few PDF typos drop the "("
function isPronLine(t) {
  const m = /^\s*\(([^)]{2,90})\)/.exec(t);
  if (m) {
    const inner = m[1].trim();
    // e.g. "(kroe-ta-mye-ton, per-meth-rin)", "(gloo-kose-a-meen/kon-droy-tin sul-fayt)",
    // "(pen-i-sill-in Vee)"; a few drugs have a single-syllable entry such as "(zink)"
    if (/^[a-z][A-Za-z0-9'’,.;&/\s-]*$/.test(inner) && (inner.includes('-') || /^[a-z]{2,14}$/.test(inner))) return true;
    return false;
  }
  return /^\s*[A-Za-z][A-Za-z'-]*(?:-[A-Za-z']+)+\)/.test(t);
}
const PRON_LINE = { test: isPronLine };

/** alias lines inside a heading block may start with a digit ("2-PAM CHLORIDE") */
function isCapsAlias(t) {
  const s = t.trim();
  if (!s || s.length > 70) return false;
  if (!/^[0-9A-Z][A-Z0-9 ,/&().;'+-]{1,90}$/.test(s)) return false;
  if (!isCapsTitle(s)) return !/[a-z]/.test(s) && (s.match(/[A-Z]/g) || []).length >= 2;
  return true;
}

/**
 * Does this line mark the end of a monograph, so the next caps line starts a new one?
 * Used to validate headings that have no pronunciation line (otherwise in-body caps lines
 * such as the class line "ANTIPARASITIC" would be mistaken for headings).
 */
function isMonographBoundary(line) {
  const t = line.t.trim();
  const indent = line.t.length - line.t.trimStart().length;
  if (/^References$/i.test(t)) return true;
  if (/^(HUMAN|VETERINARY)[- ](LABELED|APPROVED) PRODUCTS/i.test(t)) return true;
  if (/^Dosage Forms\/Regulatory Status/i.test(t)) return true;
  if (/^Combination Products:$/i.test(t)) return true;
  // reference citation; some reference blocks are letter-spaced by the PDF ("(1 9 9 3 )")
  if (indent >= 5) {
    const compact = t.replace(/\s+/g, '');
    if (/[(‘'"]\d{4}[a-z]?[)’'"]/.test(compact)) return true;
    if (/\d{4}[a-z]?[.,]/.test(compact)) return true;
  }
  return false;
}

function findHeadingBlocks(lines) {
  const blocks = [];
  for (let i = 1; i < lines.length - 3; i++) {
    const prev = lines[i - 1].t.trim();
    const cur = lines[i].t.trim();
    const capsHead = isCapsTitle(cur);
    if (prev !== '' || !(capsHead || isMixedTitle(cur))) continue;
    if (!capsHead && matchSection(cur)) continue; // "Prescriber Highlights" etc. are sections, not headings
    // heading block = title lines (main name + salt/alias names); the PDF sometimes puts a
    // blank line between them (e.g. "PHENOBARBITAL SODIUM" \n blank \n "PHENOBARBITAL")
    const names = [cur];
    let j = i + 1;
    let gaps = 0;
    while (j < lines.length && names.length < 12) {
      const t = lines[j].t.trim();
      if (t === '') {
        if (++gaps > 2) break;
        j++;
        continue;
      }
      if (isPronLine(lines[j].t)) break;
      if (!isCapsAlias(t)) break;
      names.push(t);
      gaps = 0;
      j++;
    }
    let k = j;
    while (k < lines.length && lines[k].t.trim() === '') k++;
    if (k >= lines.length) continue;
    const hasPron = isPronLine(lines[k].t);
    if (!hasPron) {
      // some monographs have no pronunciation line: accept only a caps heading that follows the
      // end of the previous monograph, and whose first section can only open a monograph
      if (!capsHead) continue;
      let back = i - 1;
      while (back > 0 && lines[back].t.trim() === '') back--;
      if (!isMonographBoundary(lines[back])) continue;
      let opener = null;
      for (let z = k; z < Math.min(k + 200, lines.length); z++) {
        const sec = matchSection(lines[z].t);
        if (sec) {
          opener = sec.key;
          break;
        }
      }
      if (!opener || !START_SECTIONS.has(opener)) continue;
    }
    if (names.some((n) => /^(VETERINARY|HUMAN)[- ]/.test(n))) continue;
    // a caps heading printed just above (separated by a blank line) belongs to the same monograph
    let above = i - 2;
    while (above > 0 && lines[above].t.trim() === '') above--;
    if (above > 0) {
      const t = lines[above].t.trim();
      if (isCapsTitle(t) && !/^(VETERINARY|HUMAN)[- ]/.test(t) && t !== names[0] && !isPronLine(t)) names.push(t);
    }
    blocks.push({ startLine: i, endLine: j - 1, names, pronLine: hasPron ? k : -1, page: lines[i].page });
    i = j;
  }
  return blocks;
}

/* ------------------------------------------------------------------ *
 * text helpers
 * ------------------------------------------------------------------ */
const joinWrapped = (out, line) => {
  const prev = out.length ? out[out.length - 1] : null;
  const t = line.trim();
  if (prev == null) return out.concat(t);
  if (/[a-z]-$/.test(prev) && /^[a-z]/.test(t)) {
    out[out.length - 1] = prev.slice(0, -1) + t; // de-hyphenate word split across lines
  } else if (/[.,;:)]$/.test(prev) && /^[A-Z0-9(]/.test(t) === false) {
    out[out.length - 1] = `${prev} ${t}`;
  } else {
    out[out.length - 1] = `${prev} ${t}`;
  }
  return out;
};

/** group lines into paragraphs; blank lines and indent jumps start a new one */
function toParagraphs(lines) {
  const paras = [];
  let cur = [];
  let prevIndent = null;
  const flush = () => {
    if (cur.length) {
      const text = cur
        .reduce((acc, l, idx) => (idx === 0 ? [l.trim()] : joinWrapped(acc, l)), [])
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) paras.push(text);
      cur = [];
    }
  };
  for (const l of lines) {
    const raw = l.t;
    if (raw.trim() === '') {
      flush();
      prevIndent = null;
      continue;
    }
    const indent = raw.length - raw.trimStart().length;
    if (cur.length && prevIndent !== null && indent >= 3 && indent > prevIndent + 1) flush();
    cur.push(raw);
    prevIndent = indent;
  }
  flush();
  return paras;
}

function toText(lines) {
  return toParagraphs(lines).join('\n\n');
}

/** indented bullet blocks -> array of strings (wrapped continuation lines merged) */
function toBullets(lines) {
  const bullets = [];
  for (const l of lines) {
    const t = l.t.trim();
    if (!t) continue;
    const prev = bullets[bullets.length - 1];
    // a wrapped continuation starts lowercase (or is a lone fragment) and the previous
    // bullet did not end with sentence-ending punctuation
    const continuation = Boolean(prev) && /^[a-z(]/.test(t) && !/[.!?:;)]$/.test(prev);
    if (continuation) bullets[bullets.length - 1] = `${prev} ${t}`;
    else bullets.push(t);
  }
  return bullets;
}

/* ------------------------------------------------------------------ *
 * 4/5. monograph assembly
 * ------------------------------------------------------------------ */
const SPECIES_MAP = [
  [/^DOGS?( ?[/&,+]\s*CATS?|, ?CATS?)?$/, ['canine']],
  [/^CATS?( ?[/&,+]\s*DOGS?|, ?DOGS?)?$/, ['feline']],
  [/^(DOGS & CATS|DOGS\/CATS|DOGS, CATS|DOGS AND CATS)$/, ['canine', 'feline']],
  [/^(HORSES?|FOALS?|PONIES|PONY|EQUINE)$/, ['equine']],
  [/^(CATTLE|CALVES|BOVINE|COWS)$/, ['bovine']],
  [/^(SWINE|PIGS?|PORCINE)$/, ['porcine']],
  [/^(SHEEP|GOATS?|SHEEP & GOATS|SHEEP, GOATS|RUMINANTS?|OVINE|CAPRINE)$/, ['ovine', 'caprine']],
  [/^(LLAMAS?|CAMELIDS?( \(NWC\))?|ALPACAS?)$/, ['camelid']],
  [/^(BIRDS?|AVIAN|PSITTACINES?|RAPTORS?|POULTRY|CHICKENS?|RATITES?)$/, ['avian']],
  [/^(REPTILES?|SNAKES?|TURTLES?|CHELONIANS?|LIZARDS?)$/, ['reptilian']],
  [/^FERRETS?$/, ['ferret']],
  [/^(RABBITS?|RODENTS?|SMALL MAMMALS|GUINEA PIGS?|MICE|RATS?|HAMSTERS?|GERBILS?|CHINCHILLAS?|RABBITS?[/,].*)$/, ['rabbit', 'rodent']],
  [/^(ZOO.*|EXOTIC.*|WILDLIFE.*|FISH|AMPHIBIANS?|INVERTEBRATES?)$/, ['exotic']],
];

function canonicalSpecies(label) {
  const t = label.trim().toUpperCase().replace(/\s+/g, ' ');
  for (const [re, val] of SPECIES_MAP) if (re.test(t)) return val;
  return null;
}

const SPECIES_HEADER = /^( {0,3})([A-Z][A-Z0-9 &/,.()'-]{1,60}):/;
const DOSE_ITEM = /^\s{2,}([a-z]|\d{1,2}|[ivx]{1,4})\)\s+/;
/** text after the "a) " / "2) " label marker (the label is the first ")" in the line) */
const afterDoseLabel = (trimmed) => trimmed.slice(trimmed.indexOf(')') + 1).trim();

function parseDoses(lines) {
  const notes = [];
  const groups = [];
  let cur = null;
  let curItem = null;
  const pushGroup = (label) => {
    cur = { speciesLabel: label, species: canonicalSpecies(label), items: [] };
    groups.push(cur);
    curItem = null;
  };
  for (const l of lines) {
    const t = l.t.trim();
    if (!t) continue;
    const m = SPECIES_HEADER.exec(l.t);
    if (m && canonicalSpecies(m[2]) && !DOSE_ITEM.test(l.t)) {
      const label = m[2];
      const rest = t.slice(t.indexOf(':') + 1).trim();
      pushGroup(label);
      if (rest) curItem = { label: '', text: rest }, cur.items.push(curItem);
      continue;
    }
    if (!cur) {
      const dm = DOSE_ITEM.exec(l.t);
      if (dm) {
        pushGroup('GENERAL');
        curItem = { label: `${dm[1]})`, text: afterDoseLabel(t) };
        cur.items.push(curItem);
      } else {
        notes.push(t);
      }
      continue;
    }
    const dm = DOSE_ITEM.exec(l.t);
    if (dm) {
      curItem = { label: `${dm[1]})`, text: afterDoseLabel(t) };
      cur.items.push(curItem);
    } else if (curItem) {
      curItem.text = `${curItem.text} ${t}`.replace(/\s+/g, ' ').trim();
    } else {
      cur.notes = cur.notes || [];
      cur.notes.push(t);
    }
  }
  return { notes, groups };
}

/**
 * Drug-interaction list entries look like " ACETAMINOPHEN: ..." or
 * " ANTIBIOTICS, OTHER (aminoglycosides, penicillins--extended-spectrum: ..." — the drug name
 * is the uppercase run before the first colon, which may include unbalanced parentheses.
 */
const INTERACTION_ENTRY = /^\s{1,3}([A-Z][^:]{1,150}):\s*(.*)$/;

function parseInteractions(lines) {
  const preamble = [];
  const list = [];
  let cur = null;
  for (const l of lines) {
    const t = l.t.trim();
    if (!t) continue;
    const m = INTERACTION_ENTRY.exec(l.t);
    // the text before the colon must be a drug name: the part before any "(" is all caps
    const nameHead = m ? m[1].split('(')[0].trim() : '';
    const looksLikeEntry =
      Boolean(m) && Boolean(nameHead) && !/[a-z]/.test(nameHead) && nameHead.length >= 3;
    if (looksLikeEntry) {
      cur = { drug: m[1].trim().replace(/\s+/g, ' '), description: m[2].trim() };
      list.push(cur);
    } else if (cur) {
      cur.description = `${cur.description} ${t}`.replace(/\s+/g, ' ').trim();
    } else {
      preamble.push(t);
    }
  }
  return { text: toText(lines), list, note: preamble.join(' ') };
}

function parseDosageForms(lines, defaultBucket = 'notes') {
  const out = { notes: [], veterinaryLabeled: [], humanLabeled: [] };
  let bucket = out[defaultBucket] || out.notes;
  let cur = null;
  for (const l of lines) {
    const t = l.t.trim();
    if (!t) {
      cur = null;
      continue;
    }
    if (/^VETERINARY[- ](?:LABELED|APPROVED) PRODUCTS/i.test(t)) {
      bucket = out.veterinaryLabeled;
      const rest = t.split(/:/).slice(1).join(':').trim();
      if (rest) out.veterinaryLabeled.push(rest);
      cur = null;
      continue;
    }
    if (/^HUMAN[- ](?:LABELED|APPROVED) PRODUCTS/i.test(t)) {
      bucket = out.humanLabeled;
      const rest = t.split(/:/).slice(1).join(':').trim();
      if (rest) out.humanLabeled.push(rest);
      cur = null;
      continue;
    }
    const indent = l.t.length - l.t.trimStart().length;
    // indented lines, and lowercase fragments whose preceding entry was cut mid-sentence,
    // continue the current product entry
    const continues =
      cur != null &&
      bucket.length > 0 &&
      (indent > 3 || (/^[a-z(]/.test(t) && !/[.!?:]$/.test(bucket[bucket.length - 1])));
    if (continues) {
      bucket[bucket.length - 1] = `${cur} ${t}`.replace(/\s+/g, ' ').trim();
      cur = bucket[bucket.length - 1];
    } else {
      bucket.push(t);
      cur = bucket[bucket.length - 1];
    }
  }
  out.all = [...out.notes, ...out.veterinaryLabeled, ...out.humanLabeled];
  return out;
}

function parseChemistry(lines) {
  const text = toText(lines);
  const synonyms = new Set();
  const m = /may also be known as\s*:\s*([\s\S]+)$/i.exec(text) || /synonyms?\s*(?:include|are)?\s*:?\s*([\s\S]+)$/i.exec(text);
  const src = m ? m[1] : '';
  src
    .split(/,|;|\band\b/)
    .map((s) => s.replace(/[®©™]/g, '').replace(/[.\s]+$/, '').trim())
    .filter((s) => s && s.length < 60 && /^[A-Za-z0-9][\w\s\-/'.()]*$/.test(s))
    .forEach((s) => synonyms.add(s));
  const quoted = [...text.matchAll(/"([^"]{2,30})"/g)].map((x) => x[1].trim());
  quoted.forEach((q) => synonyms.add(q));
  return { text, synonyms: [...synonyms] };
}

function parseReferences(lines) {
  return lines
    .map((l) => l.t.trim())
    .filter((t) => t && t.length > 8)
    .map((t) => t.replace(/\s+/g, ' '))
    .map((t) => {
      const m = /^([^(]+)\((\d{4}[a-z]?)\)\.?\s*(.*)$/.exec(t);
      return m ? { authors: m[1].trim(), year: m[2], citation: m[3].trim(), raw: t } : { raw: t };
    });
}

const CATEGORY_RULES = [
  ['antimicrobial', /antibiotic|antimicrobial|antibacterial|anthelmintic|antiparasitic|antifungal|antiviral|ectoparasiticide|endectocide|penicillin|cephalosporin|quinolone|macrolide|tetracycline|sulfonamide|aminoglycoside|antiprotozoal|coccidiostat|antimycotic|bactericidal|bacteriostatic/i],
  ['anesthesia', /anaesthetic|anesthetic|sedative|sedation|tranquilizer|neurolept|hypnotic|premedicant|preanesthetic|propofol|alfaxalone|ketamine|dexmedetomidine|medetomidine|xylazine|atipamezole|isoflurane|sevoflurane|etomidate|muscle relaxant|neuromuscular blocking/i],
  ['analgesic', /nsaid|analgesic|analgesia|opioid|pain|anti-inflammatory|meloxicam|carprofen|tramadol|buprenorphine|fentanyl|morphine|methadone|butorphanol|opiate|coxib|grapiprant|acetaminophen/i],
  ['corticosteroid', /steroid|corticosteroid|glucocorticoid|prednis|dexamethasone|betamethasone|hydrocortisone|triamcinolone|fludrocortisone|budesonide|cortisone/i],
  ['cardiac', /cardiac|hypertension|heart|inodilator|ace inhibitor|beta-blocker|antiarrhythmic|calcium channel|diuretic|antiarrhythmic|angiotensin|vasodilator|positive inotrope/i],
  ['antihistamine', /antihistamine|h1 receptor|chlorpheniramine|diphenhydramine|cetirizine|cyproheptadine|loratadine|trimeprazine|tripelennamine|clemastine/i],
  ['behavior', /behavior|behaviour|antidepressant|ssri|tricyclic|anxiolytic|anticonvulsant|antiepileptic|benzodiazepine|phenobarbital|selegiline|clomipramine|fluoxetine|trazodone/i],
  ['endocrine', /insulin|thyroid|antithyroid|hormone|estrogen|progesterone|prostaglandin|glucocorticoid replacement|corticotropin|gonadotropin|diabetes|antidiabetic|trilostane|cabergoline|desmopressin|oxytocin/i],
  ['vitamin', /vitamin|supplement|mineral|electrolyte|calcium|potassium|sodium|thiamine|cyanocobalamin|cobalamin|tocopherol|iron|zinc|amino acid|nutrition/i],
  ['gastrointestinal', /antiemetic|antiulcer|prokinetic|antidiarrheal|laxative|antacid|gastric|gi protectant|emetic|antispasmodic|pancreatic|hepatic|urate|antiflatulent/i],
  ['ophthalmic', /ophthalmic|ocular|eye|miotic|mydriatic|glaucoma|tear film|topical ophthalmic/i],
  ['dermatologic', /topical dermatolog|shampoo|ectoparasitic|keratolytic|antiseborrheic|otic|ear preparation|emollient|antipruritic/i],
  ['antidote', /antidote|antagonist|chelator|antivenin|decontaminant|poisoning|toxicity|reversal agent/i],
  ['respiratory', /bronchodilator|mucolytic|expectorant|cough|respiratory stimulant|methylxanthine/i],
];

function classifyCategory(m) {
  const hay = [m.name, m.drugClass, m.indicationsActions, m.indications, m.pharmacodynamics].filter(Boolean).join(' ');
  for (const [cat, re] of CATEGORY_RULES) if (re.test(hay)) return cat;
  return 'other';
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[®©™]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function parseMonograph(block, next, lines) {
  const head = block.names[0];
  const aliases = block.names.slice(1);
  const hardEnd = next ? next.startLine : lines.length;
  let pronunciation = '';
  const tradeNames = [];
  const classLines = [];

  const cleanName = (s) => s.replace(/[®©™]/g, '').trim();
  const isClassLine = (t) => {
    const bare = stripParens(t);
    return bare.length <= 70 && ALL_CAPS.test(bare);
  };
  let cursor = block.endLine + 1;

  if (block.pronLine >= 0) {
    const pronRaw = lines[block.pronLine].t.trim();
    const pronMatch = /^\(?([^)]*)\)\s*(.*)$/.exec(pronRaw);
    if (pronMatch) {
      pronunciation = pronMatch[1].trim();
      pronMatch[2]
        .split(',')
        .map(cleanName)
        .filter(Boolean)
        .forEach((n) => tradeNames.push(n));
    }
    cursor = block.pronLine + 1;
    // class/category line(s) follow the pronunciation line until blank / section heading
    while (cursor < hardEnd) {
      const t = lines[cursor].t.trim();
      if (!t) break;
      if (matchSection(lines[cursor].t) || /^Prescriber Highlights$/i.test(t)) break;
      if (t.length > 70 || /[.]$/.test(t) || /^Note[:s]/i.test(t)) break;
      classLines.push(t);
      cursor++;
    }
  } else {
    // no pronunciation line: harvest trade names / class from the short label lines that follow
    let blanks = 0;
    for (let i = block.endLine + 1; i < hardEnd; i++) {
      const t = lines[i].t.trim();
      if (!t) {
        if (++blanks > 2) break;
        cursor = i + 1;
        continue;
      }
      if (matchSection(lines[i].t) || /^Prescriber Highlights$/i.test(t)) break;
      if (t.length > 70 || /[.,]$/.test(t)) break; // prose -> not a label block
      blanks = 0;
      if (isClassLine(t)) classLines.push(t);
      else tradeNames.push(cleanName(t));
      cursor = i + 1;
    }
  }

  const bodyStart = Math.max(cursor, block.endLine + 1);
  const bodyEnd = hardEnd;

  // split body into sections
  const sections = {};
  const extraSections = {};
  let curKey = null;
  let curKind = 'text';
  let curBucket = 'notes';
  let buf = [];
  const concatDosageForms = (target, add) => {
    target.notes = [...(target.notes || []), ...(add.notes || [])];
    target.veterinaryLabeled = [...(target.veterinaryLabeled || []), ...(add.veterinaryLabeled || [])];
    target.humanLabeled = [...(target.humanLabeled || []), ...(add.humanLabeled || [])];
    target.all = [...target.veterinaryLabeled, ...target.humanLabeled, ...target.notes];
  };
  const flushSection = () => {
    if (!curKey || !buf.length) {
      buf = [];
      return;
    }
    let parsed;
    if (curKind === 'interactions') parsed = parseInteractions(buf);
    else if (curKind === 'doses') parsed = parseDoses(buf);
    else if (curKind === 'references') parsed = parseReferences(buf);
    else if (curKind === 'list') parsed = toBullets(buf);
    else if (curKind === 'dosageForms') parsed = parseDosageForms(buf, 'notes');
    else if (curKind === 'labeled') parsed = parseDosageForms(buf, curBucket);
    else parsed = toText(buf);

    if (sections[curKey] === undefined) sections[curKey] = parsed;
    // VETERINARY- then HUMAN-LABELED PRODUCTS concatenate; any other repeat is kept aside
    else if (curKind === 'labeled' && sections[curKey].veterinaryLabeled) concatDosageForms(sections[curKey], parsed);
    else extraSections[curKey] = parsed;
    buf = [];
  };

  let hitReferences = false;
  for (let i = bodyStart; i < bodyEnd && !hitReferences; i++) {
    const line = lines[i].t;
    const sec = matchSection(line);
    if (sec) {
      flushSection();
      curKey = sec.key;
      curKind = sec.kind;
      curBucket = sec.bucket || 'notes';
      if (sec.kind === 'references') {
        // references of *this* monograph: consume, then stop
        const refBuf = [];
        for (let k = i + 1; k < bodyEnd; k++) refBuf.push(lines[k]);
        sections.references = parseReferences(refBuf);
        hitReferences = true;
        buf = [];
        curKey = null;
        break;
      }
      if (sec.kind === 'labeled') {
        // keep inline text that follows "VETERINARY-/HUMAN-LABELED PRODUCTS:" on the same line
        const rest = line.trim().split(':').slice(1).join(':').trim();
        if (rest) buf.push({ t: rest, page: lines[i].page });
      }
      continue;
    }
    if (curKey) buf.push(lines[i]);
  }
  flushSection();

  // the labeled-product blocks and the dosageForms section are one logical unit
  if (sections.dosageForms && sections.labeledProducts) {
    concatDosageForms(sections.dosageForms, sections.labeledProducts);
    delete sections.labeledProducts;
  } else if (sections.labeledProducts) {
    sections.dosageForms = sections.labeledProducts;
    delete sections.labeledProducts;
  }

  // monographs without any canonical section headings (e.g. "Barbiturate Pharmacology") -> keep prose body
  if (!Object.keys(sections).length) {
    const bodyLines = [];
    for (let i = bodyStart; i < bodyEnd; i++) bodyLines.push(lines[i]);
    sections.discussion = toText(bodyLines);
  }

  const doses = sections.doses || null;
  const species = new Set();
  if (doses && doses.groups) {
    doses.groups.forEach((g) => (g.species || []).forEach((s) => species.add(s)));
  }
  if (!species.size) {
    const hay = [
      sections.indications,
      sections.indicationsActions,
      sections.contraindications,
      sections.doses ? JSON.stringify(sections.doses) : '',
    ]
      .filter(Boolean)
      .join(' ');
    [
      [/\bdogs?\b|\bcanine\b/i, 'canine'],
      [/\bcats?\b|\bfeline\b/i, 'feline'],
      [/\bhorses?\b|\bequine\b/i, 'equine'],
      [/\bcattle\b|\bbovine\b|\bcalves\b/i, 'bovine'],
      [/\bswine\b|\bpigs?\b|\bporcine\b/i, 'porcine'],
      [/\bsheep\b|\bgoats?\b|\bruminants?\b/i, 'ovine'],
      [/\bbirds?\b|\bavian\b/i, 'avian'],
      [/\breptiles?\b/i, 'reptilian'],
      [/\bferrets?\b/i, 'ferret'],
      [/\brabbits?\b|\brodents?\b/i, 'rabbit'],
    ].forEach(([re, code]) => {
      if (re.test(hay)) species.add(code);
    });
  }

  const m = {
    id: slugify(head),
    name: head,
    aliases,
    letter: head[0].toUpperCase(),
    pronunciation,
    brandNames: tradeNames,
    drugClass: classLines.join(' ').replace(/\s+/g, ' ').trim() || null,
    sourcePage: block.page,
    endPage: next ? lines[Math.max(next.startLine - 1, block.startLine)].page : lines[lines.length - 1].page,
    species: [...species],
  };

  if (sections.prescriberHighlights) m.prescriberHighlights = sections.prescriberHighlights;
  if (sections.indications) m.indications = sections.indications;
  if (sections.indicationsActions) m.indicationsActions = sections.indicationsActions;
  if (sections.pharmacodynamics) m.pharmacodynamics = sections.pharmacodynamics;
  if (sections.pharmacokinetics) m.pharmacokinetics = sections.pharmacokinetics;
  if (sections.pharmacokineticsPharmacodynamics) m.pharmacokineticsPharmacodynamics = sections.pharmacokineticsPharmacodynamics;
  if (sections.contraindications) m.contraindications = sections.contraindications;
  if (sections.indicationsDosagesPrecautions) m.indicationsDosagesPrecautions = sections.indicationsDosagesPrecautions;
  if (sections.adverseEffects) m.adverseEffects = sections.adverseEffects;
  if (sections.adverseEffectsPrecautions) m.adverseEffectsPrecautions = sections.adverseEffectsPrecautions;
  if (sections.reproductiveNursingSafety) m.reproductiveNursingSafety = sections.reproductiveNursingSafety;
  if (sections.overdosageAcuteToxicity) m.overdosageAcuteToxicity = sections.overdosageAcuteToxicity;
  if (sections.drugInteractions) m.drugInteractions = sections.drugInteractions;
  if (sections.laboratoryConsiderations) m.laboratoryConsiderations = sections.laboratoryConsiderations;
  if (sections.doses) m.doses = sections.doses;
  if (sections.monitoring) m.monitoring = sections.monitoring;
  if (sections.clientInformation) m.clientInformation = sections.clientInformation;
  if (sections.chemistry) m.chemistry = parseChemistryFromStored(sections.chemistry);
  if (sections.storageStability) m.storageStability = sections.storageStability;
  if (sections.compatibilityCompounding) m.compatibilityCompounding = sections.compatibilityCompounding;
  if (sections.dosageForms) m.dosageForms = sections.dosageForms;
  if (sections.combinationProducts) m.combinationProducts = sections.combinationProducts;
  if (sections.references) m.references = sections.references;
  if (sections.discussion) m.discussion = sections.discussion;
  if (Object.keys(extraSections).length) m.extraSections = extraSections;

  const labeledText = m.dosageForms
    ? [...m.dosageForms.veterinaryLabeled, ...m.dosageForms.humanLabeled, ...m.dosageForms.notes].join(' ')
    : '';
  m.flags = {
    fdaApproved: /FDA[- ]approved/i.test(`${labeledText} ${m.indications || ''}`),
    extralabelFoodAnimal: /withdrawal (?:period|time)|extra-?label use in food/i.test(labeledText),
    arciRacingClass: /ARCI|racing commissioners/i.test(labeledText),
    controlledOrRestricted: /\(C(?:II|III|IV|V)\)|controlled substance/i.test(labeledText),
  };
  m.category = classifyCategory(m);
  m.sectionKeys = [...new Set(Object.keys(sections))];

  // keep a compact combined body for full-text search in the app
  m.content = {
    uses: m.indications || m.indicationsActions || '',
    mechanismOfAction: m.pharmacodynamics || '',
    pharmacokinetics: m.pharmacokinetics || '',
    contraindications: m.contraindications || '',
    sideEffects: m.adverseEffects || '',
    drugInteractions: m.drugInteractions ? m.drugInteractions.text : '',
  };
  return m;
}

function parseChemistryFromStored(text) {
  const synonyms = new Set();
  const m = /may also be known as\s*:\s*([\s\S]+)$/i.exec(text) || /synonyms?\s*(?:include|are)?\s*:?\s*([\s\S]+)$/i.exec(text);
  const src = m ? m[1] : '';
  src
    .split(/,|;|\band\b/)
    .map((s) => s.replace(/[®©™]/g, '').replace(/[.\s]+$/, '').trim())
    .filter((s) => s && s.length < 60 && /^[A-Za-z0-9][\w\s\-/'.()]*$/.test(s))
    .forEach((s) => synonyms.add(s));
  [...text.matchAll(/"([^"]{2,30})"/g)].forEach((x) => synonyms.add(x[1].trim()));
  return { text, synonyms: [...synonyms] };
}

/* ------------------------------------------------------------------ *
 * TOC (validation)
 * ------------------------------------------------------------------ */
function tocNames(lines) {
  const start = lines.findIndex((l) => /^SYSTEMIC MONOGRAPHS$/.test(l.t.trim()));
  const end = lines.findIndex((l, i) => i > start && /^APPENDIX$/.test(l.t.trim()));
  const names = [];
  for (let i = start + 1; i < (end > -1 ? end : start + 800); i++) {
    const t = lines[i].t.trim();
    if (/^[A-Z][A-Za-z0-9 ,/&().'’-]{3,70}$/.test(t) && !/^[A-Z ]+$/.test(t)) names.push(t);
  }
  return names;
}

/* ------------------------------------------------------------------ *
 * main
 * ------------------------------------------------------------------ */
function main() {
  ensureTextFile();
  const raw = fs.readFileSync(TEXT_PATH, 'latin1');
  const lines = buildLines(raw);
  log(`lines: ${lines.length}, pages: ${lines.length ? lines[lines.length - 1].page : 0}`);

  const blocks = findHeadingBlocks(lines);
  log(`monograph heading blocks: ${blocks.length}`);

  const monographs = [];
  const seen = new Map();
  const skipped = [];
  const JUNK_NAME = /(\bDVM\b|\bDICVP\b|\bPharmD\b|\bDABT\b|\bPhD\b|\bDACV\w*\b)/;
  blocks.forEach((b, idx) => {
    const m = parseMonograph(b, blocks[idx + 1], lines);
    if (!m.name) return;
    if (JUNK_NAME.test(m.name)) {
      skipped.push(`${m.name} (p${m.sourcePage})`);
      return;
    }
    // heading with no body: keep it as a group/section intro (e.g. "GOLD SALTS, INJECTABLE",
    // "Antiseptics") instead of inventing an empty monograph
    if (m.sectionKeys.length === 1 && m.sectionKeys[0] === 'discussion' && !m.discussion) {
      delete m.discussion;
      m.sectionKeys = [];
    }
    m.sectionIntro = Boolean(
      !m.sectionKeys.length || (!m.pronunciation && !m.doses && m.sectionKeys.length <= 3 && !m.discussion),
    );
    m.kind = m.sectionIntro ? 'section-intro' : 'drug';
    const prev = seen.get(m.id);
    if (prev) {
      // same substance appears twice (systemic monograph + appendix ophthalmic/topical entry):
      // merge the sections the first entry lacks instead of dropping one of them.
      const merged = [];
      for (const k of Object.keys(m)) {
        if (k === 'id' || k === 'name' || k === 'letter' || k === 'sectionKeys' || k === 'flags' || k === 'category' || k === 'content' || k === 'sourcePage' || k === 'endPage') continue;
        if (prev[k] === undefined) {
          prev[k] = m[k];
          merged.push(k);
        }
      }
      prev.aliases = [...new Set([...(prev.aliases || []), ...(m.aliases || [])])];
      prev.brandNames = [...new Set([...(prev.brandNames || []), ...(m.brandNames || [])])];
      prev.species = [...new Set([...(prev.species || []), ...(m.species || [])])];
      prev.sectionKeys = [...new Set([...(prev.sectionKeys || []), ...(m.sectionKeys || [])])];
      prev.endPage = Math.max(prev.endPage || 0, m.endPage || 0);
      prev.alsoAt = (prev.alsoAt || []).concat({ name: m.name, page: m.sourcePage, endPage: m.endPage, mergedSections: merged });
      return;
    }
    seen.set(m.id, m);
    monographs.push(m);
  });

  const byLetter = {};
  monographs.forEach((m) => {
    const k = /^[A-Z]$/.test(m.letter) ? m.letter : '#';
    byLetter[k] = (byLetter[k] || 0) + 1;
  });

  const out = {
    metadata: {
      title: "Plumb's Veterinary Drug Handbook",
      edition: '7th Edition (2011)',
      author: 'Donald C. Plumb, Pharm.D.',
      publisher: 'PharmaVet Inc. / Wiley-Blackwell',
      isbn: '978-0-4709-5965-7',
      sourceFile: path.basename(PDF),
      sourcePages: lines[lines.length - 1].page,
      extractedAt: new Date().toISOString(),
      monographCount: monographs.length,
      drugMonographs: monographs.filter((m) => m.kind === 'drug').length,
      sectionIntros: monographs.filter((m) => m.kind === 'section-intro').length,
      byLetter,
      language: 'en',
      fieldLabelsId: {
        name: 'Nama generik (monograf)',
        aliases: 'Sinonim nama monograf',
        pronunciation: 'Cara pelafalan',
        brandNames: 'Nama dagang',
        drugClass: 'Kelas farmakologi',
        category: 'Kategori terapi',
        species: 'Spesies target',
        prescriberHighlights: 'Poin penting prescriber',
        indications: 'Indikasi (Uses/Indications)',
        indicationsActions: 'Indikasi & aksi (monograf lampiran)',
        pharmacodynamics: 'Farmakodinamik (Pharmacology/Actions)',
        pharmacokinetics: 'Farmakokinetik',
        pharmacokineticsPharmacodynamics: 'Farmakokinetik/Farmakodinamik',
        indicationsDosagesPrecautions: 'Indikasi/Dosis/Precaution',
        contraindications: 'Kontraindikasi/Precautions/Warnings',
        adverseEffects: 'Efek samping (Adverse Effects)',
        reproductiveNursingSafety: 'Keamanan reproduksi & laktasi',
        overdosageAcuteToxicity: 'Overdosis & toksisitas akut',
        drugInteractions: 'Interaksi obat',
        laboratoryConsiderations: 'Pertimbangan laboratorium',
        doses: 'Dosis per spesies',
        monitoring: 'Pemantauan',
        clientInformation: 'Informasi untuk klien',
        chemistry: 'Kimia & sinonim',
        storageStability: 'Penyimpanan & stabilitas',
        compatibilityCompounding: 'Kompatibilitas & compounding',
        dosageForms: 'Sediaan & status regulasi',
        references: 'Referensi',
        flags: 'Penanda regulasi',
      },
      sectionKeys: SECTION_REGISTRY.map(([, key]) => key),
    },
    monographs,
    index: {
      // book order is systemic monographs A-Z followed by the appendix sections, so this is a
      // convenience ordering by printable name on top of that
      alphabetical: [...monographs]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((m) => ({ id: m.id, name: m.name, letter: m.letter, kind: m.kind, page: m.sourcePage })),
      byLetter: Object.fromEntries(
        Object.entries(byLetter).map(([k]) => [
          k,
          monographs.filter((m) => m.letter === k).map((m) => ({ id: m.id, name: m.name, page: m.sourcePage })),
        ]),
      ),
      byCategory: monographs.reduce((acc, m) => {
        (acc[m.category] = acc[m.category] || []).push(m.id);
        return acc;
      }, {}),
      bySpecies: monographs.reduce((acc, m) => {
        m.species.forEach((s) => (acc[s] = acc[s] || []).push(m.id));
        return acc;
      }, {}),
    },
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  log(`wrote ${OUT_PATH} (${(fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(1)} MB)`);
  log(`monographs: ${monographs.length} | letters: ${Object.entries(byLetter).map(([k, v]) => `${k}:${v}`).join(' ')}`);

  if (DIAG) {
    const toc = tocNames(lines);
    const key = (s) =>
      s
        .toLowerCase()
        .replace(/[®©™]/g, '')
        .replace(/\b(hcl|sodium|potassium|calcium|maleate|citrate|sulfate|phosphate|acetate|hydrochloride|bitartrate)\b/g, '')
        .replace(/[^a-z0-9]+/g, '');
    const have = new Set();
    monographs.forEach((m) => {
      have.add(key(m.name));
      (m.aliases || []).forEach((a) => have.add(key(a)));
      (m.brandNames || []).forEach((a) => have.add(key(a)));
      m.id.split('-').length > 1 && have.add(key(m.id));
    });
    const missing = toc.filter((n) => !have.has(key(n)) && !have.has(key(n.split(',')[0])));
    log(`\nTOC names: ${toc.length} | not matched as monographs: ${missing.length}`);
    log(missing.join('\n'));
    log(`\nskipped stray heading blocks: ${skipped.length}`);
    if (skipped.length) log(skipped.join(', '));
    const thin = monographs.filter((m) => m.sectionKeys.length <= 2);
    log(`\nmonographs with <=2 sections (${thin.length}):`);
    log(thin.map((m) => `${m.name} (p${m.sourcePage}) -> ${m.sectionKeys.join(',')}`).join('\n'));
    log(`\nwithout Doses section: ${monographs.filter((m) => !m.doses).length}`);
    log(`without indications: ${monographs.filter((m) => !m.indications && !m.indicationsActions).length}`);
    log(`without doses+indications: ${monographs.filter((m) => !m.doses && !m.indications).map((m) => m.name).join(', ')}`);
    const mixed = monographs.filter((m) => m.name !== m.name.toUpperCase());
    log(`\nblocks whose primary name is not all-caps (false-positive candidates): ${mixed.length}`);
    log(mixed.map((m) => `${m.name} (p${m.sourcePage}) cls=${m.drugClass}`).join('\n'));
    fs.writeFileSync(
      path.join(path.dirname(OUT_PATH), 'plumbs-headings.txt'),
      monographs.map((m) => `${m.letter}\t${m.name}\t p${m.sourcePage}\t${m.sectionKeys.length} sections`).join('\n'),
      'utf8',
    );
  }
}

main();
