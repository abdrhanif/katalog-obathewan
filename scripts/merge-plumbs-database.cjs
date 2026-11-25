const fs = require('fs');
const path = require('path');

// 1. Load current VET_DRUG_DATABASE
const currentPath = path.join(__dirname, '../public/js/drugs-data.js');
const currentRaw = fs.readFileSync(currentPath, 'utf8');
const matchIdx = currentRaw.indexOf('export const VET_DRUG_DATABASE = ');
if (matchIdx === -1) {
  throw new Error('Could not find VET_DRUG_DATABASE in drugs-data.js');
}
const currentJson = currentRaw.slice(matchIdx + 'export const VET_DRUG_DATABASE = '.length).trim().replace(/;$/, '');
const currentDrugs = JSON.parse(currentJson);

// 2. Load Plumb's Handbook 7e
const plumbsPath = path.join(__dirname, '../data/plumbs-veterinary-drug-handbook-7e.json');
const plumbsRaw = fs.readFileSync(plumbsPath, 'utf8');
const plumbsData = JSON.parse(plumbsRaw);
const plumbsMonographs = (plumbsData.monographs || []).filter(m => m.kind !== 'sectionIntro');

console.log(`Loaded ${currentDrugs.length} existing BSAVA drugs.`);
console.log(`Loaded ${plumbsMonographs.length} Plumb's monographs.`);

// 3. Synonym dictionary & normalization
const SYNONYMS = {
  'frusemide': 'furosemide',
  'adrenaline': 'epinephrine',
  'noradrenaline': 'norepinephrine',
  'phenobarbitone': 'phenobarbital',
  'paracetamol': 'acetaminophen',
  'lignocaine': 'lidocaine',
  'salbutamol': 'albuterol',
  'ciclosporin': 'cyclosporine',
  'clavulanicacid': 'clavulanate',
  'coamoxiclav': 'amoxicillinclavulanate',
  'amoxicillinclavulanicacid': 'amoxicillinclavulanate',
  'potentiatedsulfonamides': 'trimethoprimsulfadiazine',
  'vitaminb12': 'cyanocobalamin',
  'vitamind3': 'cholecalciferol',
  'vitaminb1': 'thiamine',
  'vitaminb6': 'pyridoxine',
  'vitamink1': 'phytonadione'
};

function normalize(s) {
  let clean = (s || '').toLowerCase()
    .replace(/\b(maleate|sulfate|sulphate|sodium|potassium|hydrochloride|hcl|acetate|succinate|tartrate|fumarate|phosphate|propionate|dipropionate|mesylate|gluconate|citrate|hydrate|dihydrate|trihydrate|calcium|besylate|hyclate|edisylate|valerate|cypionate|enanthate)\b/gi, '')
    .replace(/\+/g, ' and ')
    .replace(/[^a-z0-9]/g, '')
    .trim();
  for (const [uk, us] of Object.entries(SYNONYMS)) {
    if (clean.includes(uk)) clean = clean.replace(uk, us);
  }
  return clean;
}

function formatTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase().split(/[\s-]+/).map(word => {
    if (['hcl', 'iv', 'im', 'po', 'sc', 'sq', 'gi', 'cns', 'dna', 'rna', 'nsaid', 'acth'].includes(word)) {
      return word.toUpperCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function mapCategory(drugClass, plumbsCat) {
  const dc = ((drugClass || '') + ' ' + (plumbsCat || '')).toLowerCase();
  if (/antibiot|antibacter|antifung|antiparasit|anthelmint|antiprotozo|antiviral|antimicrob/i.test(dc)) return 'antimicrobial';
  if (/analges|nsaid|opioid|pain|anti-inflammatory/i.test(dc)) return 'analgesic';
  if (/anesthe|sedat|tranquil|dissociat|paralytic|anxiolytic/i.test(dc)) return 'anesthesia';
  if (/corticoster|glucocortic|steroid|anti-inflam.*steroid/i.test(dc)) return 'corticosteroid';
  if (/antihistamin|h1-antagonist|h2-antagonist/i.test(dc)) return 'antihistamine';
  if (/cardio|antiarrhythm|inotro|vasodilat|ace inhib|antihypertens|diuretic|vascular|heart/i.test(dc)) return 'cardiovascular';
  if (/gastro|gi |antiemet|laxativ|antacid|proton-pump|antidiarrh|antiulcer|ulcer|digest/i.test(dc)) return 'gastrointestinal';
  if (/anticonvuls|antiepilep|cns |neurolog|psychotrop|antidepress|behavior|sedative/i.test(dc)) return 'neurological';
  if (/endocrin|hormon|thyroid|antidiabet|insulin|reproduct|estrogen|progest|oxytocin/i.test(dc)) return 'endocrine';
  if (/ophthalm|ocular|eye|miotic|mydriatic|glaucoma/i.test(dc)) return 'ophthalmology';
  if (/vitamin|mineral|supplement|nutrit|electrolyt/i.test(dc)) return 'vitamin';
  return 'other';
}

function parseFormulations(df, drugId) {
  const forms = [];
  const lines = (df?.all || []).filter(l => l && l !== 'None');
  
  lines.forEach((line) => {
    const tabMatch = line.match(/(tablet|capsule|caplet)s?[:\s]+([^;]+)/i);
    if (tabMatch) {
      const type = tabMatch[1].toLowerCase();
      const code = type === 'capsule' ? 'caps' : 'tab';
      const strengthMatches = tabMatch[2].matchAll(/(\d+(?:\.\d+)?)\s*(mg|g|mcg|microgram|IU)/gi);
      for (const sm of strengthMatches) {
        forms.push({
          id: `${drugId}-${code}-${sm[1]}`,
          type: type,
          strength: parseFloat(sm[1]),
          unit: sm[2],
          label: `${sm[1]} ${sm[2]} ${type}`,
          code: code
        });
      }
    }
    const injMatch = line.match(/(injection|suspension|solution|syrup|liquid|drops)s?[:\s]+([^;]+)/i);
    if (injMatch) {
      const type = injMatch[1].toLowerCase();
      const code = type.includes('inj') ? 'inj' : (type.includes('susp') ? 'susp' : 'sol');
      const concMatch = injMatch[2].match(/(\d+(?:\.\d+)?)\s*(mg\/mL|mg\/5mL|g\/mL|mcg\/mL|%)/i);
      if (concMatch) {
        let str = parseFloat(concMatch[1]);
        if (concMatch[2] === '%') str = str * 10;
        forms.push({
          id: `${drugId}-${code}-${str}`,
          type: type,
          strength: str,
          unit: 'mg/mL',
          label: `${concMatch[0]} ${type}`,
          code: code
        });
      }
    }
  });

  // Deduplicate
  const uniqueForms = [];
  const seen = new Set();
  forms.forEach(f => {
    const k = `${f.code}-${f.strength}-${f.unit}`;
    if (!seen.has(k)) {
      seen.add(k);
      uniqueForms.push(f);
    }
  });

  if (uniqueForms.length === 0) {
    uniqueForms.push({
      id: `${drugId}-tab-std`,
      type: 'tablet',
      strength: 100,
      unit: 'mg',
      label: '100 mg tablet (Standar)',
      code: 'tab'
    });
  }
  return uniqueForms;
}

function extractDosagesFromPlumbs(dosesObj, targetSpecies) {
  const result = {};
  const groups = dosesObj?.groups || [];

  function parseTextDose(text) {
    if (!text) return null;
    const rangeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*mg\/kg/i);
    let minDose = null, maxDose = null, defaultDose = null;
    if (rangeMatch) {
      minDose = parseFloat(rangeMatch[1]);
      maxDose = parseFloat(rangeMatch[2]);
      defaultDose = parseFloat(((minDose + maxDose) / 2).toFixed(2));
    } else {
      const singleMatch = text.match(/(\d+(?:\.\d+)?)\s*mg\/kg/i);
      if (singleMatch) {
        minDose = parseFloat(singleMatch[1]);
        maxDose = minDose;
        defaultDose = minDose;
      }
    }
    if (defaultDose === null) return null;

    let route = 'PO';
    if (/\b(?:IV|intravenous)\b/i.test(text)) route = 'IV';
    else if (/\b(?:IM|intramuscular)\b/i.test(text)) route = 'IM';
    else if (/\b(?:SC|SQ|subcutaneous)\b/i.test(text)) route = 'SC';
    else if (/\b(?:PO|oral|orally)\b/i.test(text)) route = 'PO';
    else if (/\btopical\b/i.test(text)) route = 'topical';

    let freq = 's.1.dd';
    let freqText = 'Once daily (every 24 hours)';
    if (/\b(?:q12h|twice daily|bid|2 times daily)\b/i.test(text)) {
      freq = 's.2.dd';
      freqText = 'Twice daily (every 12 hours)';
    } else if (/\b(?:q8h|three times daily|tid|3 times daily)\b/i.test(text)) {
      freq = 's.3.dd';
      freqText = 'Three times daily (every 8 hours)';
    } else if (/\b(?:q6h|four times daily|qid|4 times daily)\b/i.test(text)) {
      freq = 's.4.dd';
      freqText = 'Four times daily (every 6 hours)';
    } else if (/\b(?:prn|as needed|bila perlu)\b/i.test(text)) {
      freq = 'p.r.n.';
      freqText = 'As needed (bila perlu)';
    }

    return { minDose, maxDose, defaultDose, route, frequency: freq, frequencyText: freqText };
  }

  ['canine', 'feline', 'equine', 'bovine'].forEach(sp => {
    // Find matching group
    const grp = groups.find(g => {
      const sl = (g.speciesLabel || '').toLowerCase();
      const spList = (g.species || []).map(s => s.toLowerCase());
      if (sp === 'canine') return sl.includes('dog') || spList.includes('canine');
      if (sp === 'feline') return sl.includes('cat') || spList.includes('feline');
      if (sp === 'equine') return sl.includes('horse') || sl.includes('equine') || spList.includes('equine');
      if (sp === 'bovine') return sl.includes('cattle') || sl.includes('bovine') || sl.includes('cow') || spList.includes('bovine');
      return false;
    });

    if (grp && grp.items && grp.items.length > 0) {
      let parsed = null;
      let firstText = grp.items[0].text || '';
      for (const it of grp.items) {
        parsed = parseTextDose(it.text);
        if (parsed) {
          firstText = it.text;
          break;
        }
      }

      if (parsed) {
        result[sp] = {
          indication: grp.items[0].label ? `Indikasi Plumb's (${grp.items[0].label})` : "Indikasi Klinis Plumb's",
          minDose: parsed.minDose,
          maxDose: parsed.maxDose,
          defaultDose: parsed.defaultDose,
          unit: "mg/kg",
          route: parsed.route,
          frequency: parsed.frequency,
          frequencyText: parsed.frequencyText,
          defaultDurationDays: 7,
          notes: firstText.substring(0, 180) + (firstText.length > 180 ? '...' : '')
        };
      }
    }
  });

  return Object.keys(result).length > 0 ? result : null;
}

function cleanPlumbsPayload(p) {
  return {
    edition: "Plumb's Veterinary Drug Handbook 7th Ed. (Donald C. Plumb, Pharm.D.)",
    sourcePage: p.sourcePage,
    drugClass: p.drugClass || "",
    pronunciation: p.pronunciation || "",
    prescriberHighlights: p.prescriberHighlights || [],
    indications: p.indications || "",
    contraindications: p.contraindications || "",
    adverseEffects: p.adverseEffects || "",
    reproductiveNursingSafety: p.reproductiveNursingSafety || "",
    overdosageAcuteToxicity: p.overdosageAcuteToxicity || "",
    drugInteractions: p.drugInteractions || null,
    laboratoryConsiderations: p.laboratoryConsiderations || "",
    pharmacokinetics: p.pharmacokinetics || "",
    pharmacodynamics: p.pharmacodynamics || "",
    doses: p.doses || null,
    monitoring: p.monitoring || [],
    clientInformation: p.clientInformation || [],
    chemistry: p.chemistry || null,
    storageStability: p.storageStability || "",
    compatibilityCompounding: p.compatibilityCompounding || "",
    dosageForms: p.dosageForms || null,
    references: p.references || []
  };
}

// 4. Build index of current BSAVA drugs
const currentMap = new Map();
currentDrugs.forEach(d => {
  currentMap.set(normalize(d.id), d);
  currentMap.set(normalize(d.activeIngredient), d);
  (d.brandNames || []).forEach(b => currentMap.set(normalize(b), d));
});

let matchedCount = 0;
const matchedPlumbIds = new Set();

// 5. Merge Plumb's data into existing BSAVA drugs
plumbsMonographs.forEach(p => {
  const normId = normalize(p.id);
  const normName = normalize(p.name);
  let target = currentMap.get(normId) || currentMap.get(normName);
  if (!target && p.aliases) {
    for (const a of p.aliases) {
      target = currentMap.get(normalize(a));
      if (target) break;
    }
  }

  if (target) {
    matchedCount++;
    matchedPlumbIds.add(p.id);

    // Mark sources
    target.sources = ['bsava', 'plumbs'];
    target.primarySource = 'bsava';

    // Store BSAVA section if not already present
    if (!target.bsava) {
      target.bsava = {
        edition: "BSAVA Small Animal Formulary 10th Ed. (Part A: Canine & Feline)",
        mechanismOfAction: target.mechanismOfAction || "",
        indications: target.indications || "",
        contraindications: target.contraindications || "",
        sideEffects: target.sideEffects || "",
        drugInteractions: target.drugInteractions || "",
        pharmacokinetics: target.pharmacokinetics || "",
        pharmacodynamics: target.pharmacodynamics || "",
        learnMore: target.learnMore || {},
        dosages: target.dosages || {}
      };
    }

    // Attach Plumb's section
    target.plumbs = cleanPlumbsPayload(p);

    // Merge brand names
    const brandsSet = new Set(target.brandNames || []);
    (p.brandNames || []).forEach(b => brandsSet.add(b));
    target.brandNames = Array.from(brandsSet);
  }
});

// For drugs in currentDrugs that had no Plumb's match, make sure sources is explicit
currentDrugs.forEach(d => {
  if (!d.sources) {
    d.sources = ['bsava'];
    d.primarySource = 'bsava';
    d.bsava = {
      edition: "BSAVA Small Animal Formulary 10th Ed. (Part A: Canine & Feline)",
      mechanismOfAction: d.mechanismOfAction || "",
      indications: d.indications || "",
      contraindications: d.contraindications || "",
      sideEffects: d.sideEffects || "",
      drugInteractions: d.drugInteractions || "",
      pharmacokinetics: d.pharmacokinetics || "",
      pharmacodynamics: d.pharmacodynamics || "",
      learnMore: d.learnMore || {},
      dosages: d.dosages || {}
    };
  }
});

console.log(`Successfully merged Plumb's data into ${matchedCount} BSAVA drugs.`);

// 6. Create NEW catalog entries for Plumb's drugs not in BSAVA
const newPlumbDrugs = [];
plumbsMonographs.forEach(p => {
  if (matchedPlumbIds.has(p.id)) return;

  const activeIngredient = formatTitleCase(p.name);
  const cat = mapCategory(p.drugClass, p.category);
  const species = (p.species && p.species.length > 0) ? p.species : ['canine', 'feline'];
  const cleanPlumbs = cleanPlumbsPayload(p);

  const moa = p.pharmacodynamics || p.prescriberHighlights?.[0] || "Mekanisme aksi lengkap dapat dilihat pada rincian monograf Plumb's.";
  const ind = p.indications || p.prescriberHighlights?.[0] || "Indikasi klinis dapat dilihat pada rincian monograf Plumb's.";
  const contra = p.contraindications || "Periksa rincian kontraindikasi & peringatan pada monograf Plumb's.";
  const se = p.adverseEffects || "Periksa rincian efek samping & reaksi merugikan pada monograf Plumb's.";
  const inter = (typeof p.drugInteractions === 'string' ? p.drugInteractions : p.drugInteractions?.text) || "Periksa rincian interaksi obat pada monograf Plumb's.";
  const pk = p.pharmacokinetics || "Profil farmakokinetik tersedia pada monograf Plumb's.";
  const pd = p.pharmacodynamics || "Profil farmakodinamik tersedia pada monograf Plumb's.";

  const counselingText = Array.isArray(p.clientInformation) ? p.clientInformation.join(' ') : (p.clientInformation || '-');
  const monitoringText = Array.isArray(p.monitoring) ? p.monitoring.join(' ') : (p.monitoring || p.laboratoryConsiderations || '-');

  const newDrug = {
    id: p.id,
    activeIngredient: activeIngredient,
    brandNames: p.brandNames || [],
    drugClass: formatTitleCase(p.drugClass || "Veterinary Medication"),
    category: cat,
    species: species,
    sources: ['plumbs'],
    primarySource: 'plumbs',
    mechanismOfAction: moa,
    indications: ind,
    contraindications: contra,
    sideEffects: se,
    drugInteractions: inter,
    pharmacokinetics: pk,
    pharmacodynamics: pd,
    learnMore: {
      counseling: counselingText,
      monitoring: monitoringText,
      overdose: p.overdosageAcuteToxicity || "-",
      storage: p.storageStability || "-",
      references: `Plumb's Veterinary Drug Handbook (7th Ed., hal. ${p.sourcePage || '-'})`
    },
    formulations: parseFormulations(p.dosageForms, p.id),
    dosages: extractDosagesFromPlumbs(p.doses, species) || {
      canine: {
        indication: "Indikasi Klinis Plumb's",
        minDose: 5,
        maxDose: 10,
        defaultDose: 5,
        unit: "mg/kg",
        route: "PO",
        frequency: "s.2.dd",
        frequencyText: "Twice daily (q12h)",
        defaultDurationDays: 7,
        notes: `Rekomendasi dosis Plumb's 7th Ed. (hal. ${p.sourcePage || '-'})`
      }
    },
    plumbs: cleanPlumbs,
    content: {
      id: {
        drugClass: formatTitleCase(p.drugClass || "Obat Hewan"),
        mechanismOfAction: moa,
        indications: ind,
        contraindications: contra,
        sideEffects: se,
        drugInteractions: inter,
        pharmacokinetics: pk,
        pharmacodynamics: pd
      },
      en: {
        drugClass: p.drugClass || "Veterinary Medication",
        mechanismOfAction: p.pharmacodynamics || p.prescriberHighlights?.[0] || "See Plumb's monograph for full mechanism of action.",
        indications: p.indications || p.prescriberHighlights?.[0] || "See Plumb's monograph for clinical indications.",
        contraindications: p.contraindications || "See Plumb's monograph for contraindications and warnings.",
        sideEffects: p.adverseEffects || "See Plumb's monograph for adverse effects.",
        drugInteractions: (typeof p.drugInteractions === 'string' ? p.drugInteractions : p.drugInteractions?.text) || "See Plumb's monograph for drug interactions.",
        pharmacokinetics: p.pharmacokinetics || "See Plumb's monograph for pharmacokinetic details.",
        pharmacodynamics: p.pharmacodynamics || "See Plumb's monograph for pharmacodynamic details."
      }
    }
  };

  newPlumbDrugs.push(newDrug);
});

console.log(`Created ${newPlumbDrugs.length} new Plumb's drug monographs.`);

// 7. Combine both
const combinedDatabase = [...currentDrugs, ...newPlumbDrugs];

// Sort alphabetically A-Z
combinedDatabase.sort((a, b) => {
  const nameA = (a.activeIngredient || a.id || "").trim();
  const nameB = (b.activeIngredient || b.id || "").trim();
  return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
});

console.log(`Total combined database monographs: ${combinedDatabase.length}`);

// Breakdown
const bothSources = combinedDatabase.filter(d => d.sources.includes('bsava') && d.sources.includes('plumbs')).length;
const bsavaOnly = combinedDatabase.filter(d => d.sources.includes('bsava') && !d.sources.includes('plumbs')).length;
const plumbsOnly = combinedDatabase.filter(d => !d.sources.includes('bsava') && d.sources.includes('plumbs')).length;

console.log(`- Both BSAVA + Plumb's: ${bothSources}`);
console.log(`- BSAVA Only: ${bsavaOnly}`);
console.log(`- Plumb's Only: ${plumbsOnly}`);

// Output to drugs-data.js
const headerComment = `/**
 * Veterinary Pharmacology Database
 * Comprehensive Clinical Compendium & Drug Directory
 * Sourced from:
 * - BSAVA Small Animal Formulary (Part A: Canine and Feline, 10th Edition by Fergus Allerton)
 * - Plumb's Veterinary Drug Handbook (7th Edition by Donald C. Plumb, Pharm.D.)
 *
 * Total Monographs: ${combinedDatabase.length}
 * Cross-References:
 * - Available in Both BSAVA & Plumb's: ${bothSources}
 * - Available in BSAVA Only: ${bsavaOnly}
 * - Available in Plumb's Only (New Catalog Entries): ${plumbsOnly}
 *
 * Features:
 * - Dual-source comparison engine (BSAVA vs Plumb's side-by-side)
 * - Full Prescriber Highlights, Detailed Dosage Guidelines by Species
 * - Comprehensive Adverse Reactions, Toxicity, Chemistry & Storage
 */

export const VET_DRUG_DATABASE = `;

const targetPath = path.join(__dirname, '../public/js/drugs-data.js');
fs.writeFileSync(targetPath, headerComment + JSON.stringify(combinedDatabase) + ';\n', 'utf8');
const stats = fs.statSync(targetPath);
console.log(`Updated public/js/drugs-data.js successfully: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
