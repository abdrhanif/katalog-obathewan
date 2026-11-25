const fs = require('fs');
const path = require('path');

async function buildDatabase() {
  const drugsDataPath = path.join(__dirname, 'public', 'js', 'drugs-data.js');
  // Import existing 34 drugs
  const existingModule = await import('./public/js/drugs-data.js');
  const existingDrugs = existingModule.VET_DRUG_DATABASE;
  console.log(`Found ${existingDrugs.length} existing curated drugs.`);

  // Load BSAVA JSON
  const bsavaFullPath = 'C:/Users/wedia/Downloads/bsava_part_a_full.json';
  const bsavaData = JSON.parse(fs.readFileSync(bsavaFullPath, 'utf8'));
  console.log(`Found ${bsavaData.monographs.length} BSAVA monographs.`);

  function slugify(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function cleanBrandNames(list, aliases) {
    const set = new Set();
    if (Array.isArray(list)) {
      for (const item of list) {
        if (typeof item === 'string') {
          const cleaned = item.replace(/\*+/g, '').trim();
          if (cleaned) set.add(cleaned);
        }
      }
    }
    if (Array.isArray(aliases)) {
      for (const a of aliases) {
        if (typeof a === 'string' && a.trim()) set.add(a.trim());
      }
    }
    return Array.from(set);
  }

  function textify(val) {
    if (!val) return '';
    if (Array.isArray(val)) return val.join(' ');
    return String(val).trim();
  }

  function determineCategory(m) {
    const text = `${m.name} ${m.action || ''} ${textify(m.uses)} ${textify(m.aliases)}`.toLowerCase();

    if (/steroid|corticosteroid|glucocorticoid|prednis|dexamethasone|betamethasone|hydrocortisone|triamcinolone|fludrocortisone|budesonide/i.test(text)) {
      return 'corticosteroid';
    }
    if (/antihistamine|h1 receptor|chlorpheniramine|diphenhydramine|cetirizine|cyproheptadine|loratadine|fexofenadine/i.test(text)) {
      return 'antihistamine';
    }
    if (/vitamin|supplement|mineral|calcium|potassium|thiamine|cyanocobalamin|phytomenadione|tocopherol|iron|zinc|electrolyte/i.test(text)) {
      return 'vitamin';
    }
    if (/anaesthetic|anesthetic|sedative|sedation|premedication|hypnotic|neurolept|propofol|alfaxalone|ketamine|dexmedetomidine|medetomidine|xylazine|atipamezole|isoflurane|sevoflurane|etomidate/i.test(text)) {
      return 'anesthesia';
    }
    if (/nsaid|analgesic|analgesia|opioid|pain|anti-inflammatory|meloxicam|carprofen|tramadol|buprenorphine|fentanyl|morphine|methadone|butorphanol|paracetamol|firocoxib|robenacoxib|grapiprant|codeine/i.test(text)) {
      return 'analgesic';
    }
    if (/antibiotic|antimicrobial|antibacterial|anthelmintic|antiparasitic|antifungal|antiviral|ectoparasiticide|endectocide|penicillin|cephalosporin|quinolone|fluoroquinolone|macrolide|tetracycline|sulfonamide|aminoglycoside|ivermectin|fenbendazole|afoxolaner|fluralaner|sarolaner|metronidazole/i.test(text)) {
      return 'antimicrobial';
    }
    if (/cardiac|hypertension|heart|inodilator|ace inhibitor|beta-blocker|antiarrhythmic|calcium channel blocker|pimobendan|benazepril|enalapril|amlodipine|atenolol|sotalol|furosemide|torasemide|spironolactone/i.test(text)) {
      return 'cardiovascular';
    }
    if (/gastrointestinal|antiemetic|ulcer|laxative|antacid|motility|omeprazole|famotidine|ranitidine|maropitant|ondansetron|metoclopramide|sucralfate/i.test(text)) {
      return 'gastrointestinal';
    }
    if (/epilep|anticonvulsant|seizure|neuro|phenobarbital|levetiracetam|potassium bromide|gabapentin|pregabalin/i.test(text)) {
      return 'neurological';
    }
    if (/hormon|thyroid|insulin|diabetes|addison|cushing|desoxycortone|levothyroxine|methimazole/i.test(text)) {
      return 'endocrine';
    }
    if (/ophthalm|eye|cornea|glaucoma|retin|uveit|latanoprost|dorzolamide|timolol|tropicamide/i.test(text)) {
      return 'ophthalmology';
    }
    return 'other';
  }

  const categoryLabels = {
    antimicrobial: { id: "1. Antimikroba & Antiparasit", en: "1. Antimicrobial & Antiparasitic" },
    analgesic: { id: "2. Analgesia & NSAID/Opioid", en: "2. Analgesia & NSAID/Opioid" },
    anesthesia: { id: "3. Anestesi & Sedasi", en: "3. Anesthesia & Sedation" },
    vitamin: { id: "4. Vitamin & Suplemen", en: "4. Vitamins & Supplements" },
    antihistamine: { id: "5. Antihistamin", en: "5. Antihistamines" },
    corticosteroid: { id: "6. Kortikosteroid", en: "6. Corticosteroids" },
    cardiovascular: { id: "7. Kardiovaskular & Ginjal", en: "7. Cardiovascular & Renal" },
    gastrointestinal: { id: "8. Gastrointestinal & Saluran Cerna", en: "8. Gastrointestinal & Digestive" },
    neurological: { id: "9. Saraf & Antikonvulsan", en: "9. Neurology & Anticonvulsants" },
    endocrine: { id: "10. Endokrin & Metabolik", en: "10. Endocrine & Metabolic" },
    ophthalmology: { id: "11. Oftalmologi & Mata", en: "11. Ophthalmology & Ophthalmic" },
    other: { id: "12. Farmakologi Khusus Lainnya", en: "12. Other Specialized Pharmacology" }
  };

  function parseFormulations(rawForm, drugName) {
    if (!rawForm || typeof rawForm !== 'string') {
      return [{
        id: `${slugify(drugName)}-std-100`,
        type: 'tablet',
        strength: 100,
        unit: 'mg',
        label: '100 mg tablet standar',
        code: 'tab'
      }];
    }

    const formulations = [];
    const parts = rawForm.split(/(?=(?:Oral|Injectable|Topical|Ophthalmic|Otic|Inhalation|Rectal|Aural):)/i);

    for (const part of parts) {
      let type = 'tablet';
      const lower = part.toLowerCase();
      if (lower.startsWith('injectable') || lower.includes('injection') || lower.includes('inj.')) type = 'injection';
      else if (lower.includes('suspension') || lower.includes('syrup') || lower.includes('liquid') || lower.includes('drop') || lower.includes('solution')) type = 'suspension';
      else if (lower.includes('capsule')) type = 'capsule';
      else if (lower.includes('tablet')) type = 'tablet';
      else if (lower.includes('ointment') || lower.includes('cream') || lower.includes('gel')) type = 'topical';
      else if (lower.includes('ophthalmic') || lower.includes('eye')) type = 'ophthalmic';

      const strengthMatches = [...part.matchAll(/(\d+(?:\.\d+)?)\s*(mg\/ml|mg\/g|μg\/ml|ug\/ml|mcg\/ml|mg|g|ml|iu\/ml|iu|%)/gi)];

      if (strengthMatches.length > 0) {
        for (const sm of strengthMatches) {
          const val = parseFloat(sm[1]);
          const unit = sm[2];
          const code = type === 'injection' ? 'inj' : (type === 'suspension' ? 'susp' : (type === 'capsule' ? 'caps' : 'tab'));
          formulations.push({
            id: `${slugify(drugName)}-${type}-${val}${unit.replace(/[^a-z0-9]/gi, '')}`,
            type,
            strength: val,
            unit,
            label: `${val} ${unit} ${type}`,
            code
          });
        }
      }
    }

    if (formulations.length === 0) {
      formulations.push({
        id: `${slugify(drugName)}-std-100`,
        type: 'tablet',
        strength: 100,
        unit: 'mg',
        label: rawForm.slice(0, 45) || '100 mg tablet',
        code: 'tab'
      });
    }

    const unique = [];
    const seen = new Set();
    for (const f of formulations) {
      if (!seen.has(f.id)) {
        seen.add(f.id);
        unique.push(f);
      }
    }
    return unique;
  }

  function parseDoseRegimen(regimenStr, defaultIndication = '') {
    if (!regimenStr || typeof regimenStr !== 'string') return null;

    if (/do not use|not recommended|not applicable|no information/i.test(regimenStr)) {
      return {
        contraindicated: true,
        notes: regimenStr
      };
    }

    const doseMatch = regimenStr.match(/(\d+(?:\.\d+)?)\s*(?:[–\-–—]\s*(\d+(?:\.\d+)?))?\s*(mg\/kg|μg\/kg|ug\/kg|mcg\/kg|g\/kg|ml\/kg|iu\/kg|units\/kg)/i);

    let minDose = 1;
    let maxDose = 1;
    let defaultDose = 1;
    let unit = 'mg/kg';

    if (doseMatch) {
      minDose = parseFloat(doseMatch[1]);
      maxDose = doseMatch[2] ? parseFloat(doseMatch[2]) : minDose;
      defaultDose = parseFloat(((minDose + maxDose) / 2).toFixed(3));
      unit = doseMatch[3].toLowerCase();
      if (unit === 'ug/kg' || unit === 'mcg/kg') unit = 'μg/kg';
    } else {
      const plainMgMatch = regimenStr.match(/(\d+(?:\.\d+)?)\s*(?:[–\-–—]\s*(\d+(?:\.\d+)?))?\s*(mg|μg|ug|mcg|g|ml)/i);
      if (plainMgMatch) {
        minDose = parseFloat(plainMgMatch[1]);
        maxDose = plainMgMatch[2] ? parseFloat(plainMgMatch[2]) : minDose;
        defaultDose = parseFloat(((minDose + maxDose) / 2).toFixed(3));
        unit = plainMgMatch[3].toLowerCase();
      }
    }

    let route = 'PO';
    if (/\bi\.?v\.?|\biv\b|\bintravenous/i.test(regimenStr)) route = 'IV';
    else if (/\bi\.?m\.?|\bim\b|\bintramuscular/i.test(regimenStr)) route = 'IM';
    else if (/\bs\.?c\.?|\bsc\b|\bsubcutaneous/i.test(regimenStr)) route = 'SC';
    else if (/\bp\.?o\.?|\bpo\b|\boral/i.test(regimenStr)) route = 'PO';
    else if (/\btopical|\bcutaneous/i.test(regimenStr)) route = 'Topical';
    else if (/\bophthalmic|\beye/i.test(regimenStr)) route = 'Ophthalmic';

    let frequency = 's.1.dd';
    let frequencyText = 'Once daily (q24h)';
    if (/q8h|every 8 h|3 times|tid|t\.i\.d\./i.test(regimenStr)) {
      frequency = 's.3.dd';
      frequencyText = 'Three times daily (q8h)';
    } else if (/q12h|every 12 h|twice daily|bid|b\.i\.d\./i.test(regimenStr)) {
      frequency = 's.2.dd';
      frequencyText = 'Twice daily (q12h)';
    } else if (/q6h|every 6 h|4 times|qid|q\.i\.d\./i.test(regimenStr)) {
      frequency = 's.4.dd';
      frequencyText = 'Four times daily (q6h)';
    } else if (/q24h|every 24 h|once daily|sid|s\.i\.d\./i.test(regimenStr)) {
      frequency = 's.1.dd';
      frequencyText = 'Once daily (q24h)';
    } else if (/q48h|every 48 h|every other day/i.test(regimenStr)) {
      frequency = 's.every_other_day';
      frequencyText = 'Every other day (q48h)';
    }

    return {
      indication: defaultIndication || 'General clinical indication',
      minDose,
      maxDose,
      defaultDose,
      unit,
      route,
      frequency,
      frequencyText,
      defaultDurationDays: 7,
      notes: regimenStr.slice(0, 300)
    };
  }

  // Build merged array
  const finalDatabase = [];
  const processedIds = new Set();

  // 1. First process curated drugs (preserve their high-fidelity formulas & dosages)
  for (const drug of existingDrugs) {
    const curCat = drug.category || determineCategory({ name: drug.activeIngredient, action: drug.mechanismOfAction, uses: [drug.indications] });

    // Check if in BSAVA to merge extra brands or references
    const bsMatch = bsavaData.monographs.find(m => {
      const mn = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const dn = drug.activeIngredient.toLowerCase().replace(/[^a-z0-9]/g, '');
      const did = drug.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      return mn === dn || mn === did || (m.aliases && m.aliases.some(a => a.toLowerCase().replace(/[^a-z0-9]/g, '') === dn));
    });

    let extraBrands = [];
    let bsavaRef = '';
    if (bsMatch) {
      extraBrands = cleanBrandNames(bsMatch.trade_names, bsMatch.aliases);
      bsavaRef = `BSAVA Small Animal Formulary 10th Ed. Part A (pp. ${bsMatch.pdf_pages.join('-')})`;
    }

    const mergedBrands = Array.from(new Set([...drug.brandNames, ...extraBrands]));

    // Construct drug entry
    const entry = {
      ...drug,
      category: curCat,
      brandNames: mergedBrands,
      learnMore: {
        ...drug.learnMore,
        references: drug.learnMore.references + (bsavaRef ? ` | ${bsavaRef}` : '')
      },
      content: {
        id: {
          drugClass: drug.drugClass,
          mechanismOfAction: drug.mechanismOfAction,
          indications: drug.indications,
          contraindications: drug.contraindications,
          sideEffects: drug.sideEffects,
          drugInteractions: drug.drugInteractions,
          pharmacokinetics: drug.pharmacokinetics,
          pharmacodynamics: drug.pharmacodynamics,
          learnMore: { ...drug.learnMore }
        },
        en: {
          drugClass: drug.drugClass,
          mechanismOfAction: bsMatch ? textify(bsMatch.action) : drug.mechanismOfAction,
          indications: bsMatch ? textify(bsMatch.uses) : drug.indications,
          contraindications: bsMatch ? textify(bsMatch.contraindications) : drug.contraindications,
          sideEffects: bsMatch ? textify(bsMatch.adverse_reactions) : drug.sideEffects,
          drugInteractions: bsMatch ? textify(bsMatch.drug_interactions) : drug.drugInteractions,
          pharmacokinetics: drug.pharmacokinetics,
          pharmacodynamics: drug.pharmacodynamics,
          learnMore: {
            counseling: bsMatch ? textify(bsMatch.safety_and_handling) : drug.learnMore.counseling,
            monitoring: drug.learnMore.monitoring,
            overdose: drug.learnMore.overdose,
            storage: drug.learnMore.storage,
            references: bsavaRef || drug.learnMore.references
          }
        }
      }
    };

    finalDatabase.push(entry);
    processedIds.add(drug.id);
    if (bsMatch) {
      processedIds.add(slugify(bsMatch.name));
    }
  }

  console.log(`Processed ${existingDrugs.length} existing drugs with bilingual content.`);

  // 2. Now process remaining BSAVA monographs
  let addedBsava = 0;
  for (const m of bsavaData.monographs) {
    const slug = slugify(m.name);
    // Check if already matched
    if (processedIds.has(slug)) continue;

    // Check if name matches any existing
    const alreadyExists = finalDatabase.some(d => {
      const dn = d.activeIngredient.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mn = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return dn === mn;
    });
    if (alreadyExists) continue;

    const brandNames = cleanBrandNames(m.trade_names, m.aliases);
    const category = determineCategory(m);
    const formulations = parseFormulations(m.formulations, m.name);

    // Parse species and doses
    const speciesCovered = new Set();
    const dosages = {};

    if (m.doses && Array.isArray(m.doses)) {
      for (const d of m.doses) {
        const spStr = (d.species || '').toLowerCase();
        let targetSpecies = [];
        if (spStr.includes('dog')) {
          targetSpecies.push('canine');
          speciesCovered.add('canine');
        }
        if (spStr.includes('cat')) {
          targetSpecies.push('feline');
          speciesCovered.add('feline');
        }

        if (d.regimens && d.regimens.length > 0) {
          const firstReg = d.regimens[0];
          const parsedDose = parseDoseRegimen(firstReg.regimen, firstReg.indication);
          if (parsedDose && !parsedDose.contraindicated) {
            for (const sp of targetSpecies) {
              if (!dosages[sp]) {
                dosages[sp] = parsedDose;
              }
            }
          }
        }
      }
    }

    // Fallback species if none detected
    if (speciesCovered.size === 0) {
      speciesCovered.add('canine');
      speciesCovered.add('feline');
    }

    // Fallback dosage for calculator
    if (!dosages.canine && !dosages.feline) {
      dosages.canine = {
        indication: textify(m.uses).slice(0, 80) || 'Clinical indication (BSAVA Formulary)',
        minDose: 1,
        maxDose: 5,
        defaultDose: 2.5,
        unit: 'mg/kg',
        route: 'PO',
        frequency: 's.1.dd',
        frequencyText: 'Once daily (q24h)',
        defaultDurationDays: 7,
        notes: 'Dosis empiris klinis BSAVA. Periksa protokol spesifik pada monograf lengkap.'
      };
    }

    const actionText = textify(m.action);
    const usesText = textify(m.uses);
    const contraText = textify(m.contraindications) || 'Gunakan dengan hati-hati pada pasien dengan disfungsi hepar atau ginjal berat. Kontraindikasi pada riwayat hipersensitivitas terhadap zat aktif.';
    const adverseText = textify(m.adverse_reactions) || 'Efek samping jarang dilaporkan pada dosis terapeutik. Evaluasi respons klinis dan tanda-tanda intoleransi obat.';
    const interactText = textify(m.drug_interactions) || 'Tidak ada interaksi mayor yang dilaporkan khusus. Berhati-hati bila dikombinasikan dengan obat yang berikatan kuat dengan protein plasma.';
    const safetyText = textify(m.safety_and_handling) || 'Simpan di tempat kering dan sejuk, terlindung dari cahaya langsung.';
    const refText = (m.references_text ? textify(m.references_text) + ' | ' : '') + `BSAVA Small Animal Formulary (10th Ed. Part A, pp. ${m.pdf_pages.join('-')})`;

    // Drug class name
    let drugClassName = 'Sediaan Farmakologi Veteriner';
    if (category === 'antimicrobial') drugClassName = 'Agen Antimikroba / Antiparasit';
    else if (category === 'analgesic') drugClassName = 'Analgesik / Antiinflamasi';
    else if (category === 'anesthesia') drugClassName = 'Anestetik / Sedatif Veteriner';
    else if (category === 'vitamin') drugClassName = 'Vitamin & Suplemen Terapi';
    else if (category === 'antihistamine') drugClassName = 'Antihistamin H1-Antagonis';
    else if (category === 'corticosteroid') drugClassName = 'Kortikosteroid Antiinflamasi';
    else if (category === 'cardiovascular') drugClassName = 'Kardiovaskular & Modulator Vaskular';
    else if (category === 'gastrointestinal') drugClassName = 'Gastrointestinal & Protektor Cerna';
    else if (category === 'neurological') drugClassName = 'Neurologi & Antikonvulsan';
    else if (category === 'endocrine') drugClassName = 'Modulator Endokrin & Hormon';
    else if (category === 'ophthalmology') drugClassName = 'Preparat Oftalmologi Mata';

    const drugClassNameEn = categoryLabels[category]?.en || 'Veterinary Pharmacology Agent';

    const newDrug = {
      id: slug,
      activeIngredient: m.name,
      brandNames: brandNames.length > 0 ? brandNames : [m.name],
      drugClass: drugClassName,
      category,
      species: Array.from(speciesCovered),
      mechanismOfAction: actionText || `Mekanisme kerja sediaan ${m.name} berdasarkan formularium BSAVA.`,
      indications: usesText || `Indikasi terapeutik pada anjing dan kucing berdasarkan BSAVA Formulary 10th Ed.`,
      contraindications: contraText,
      sideEffects: adverseText,
      drugInteractions: interactText,
      pharmacokinetics: actionText ? `${actionText} Distribusi dan eliminasi sesuai kinetika monograf BSAVA.` : 'Profil farmakokinetik sesuai monograf BSAVA.',
      pharmacodynamics: actionText ? `${actionText}` : 'Efek farmakodinamik sesuai monograf BSAVA.',
      learnMore: {
        counseling: safetyText,
        monitoring: 'Monitor kondisi umum pasien, respons klinis terhadap terapi, dan pantau tanda-tanda adverse reactions.',
        overdose: 'Jika terjadi overdosis, hentikan pemberian obat dan berikan terapi suportif simtomatik.',
        storage: 'Simpan pada suhu ruang terkontrol (15–25°C), hindari kelembaban tinggi dan paparan cahaya matahari langsung.',
        references: refText
      },
      formulations,
      dosages,
      content: {
        id: {
          drugClass: drugClassName,
          mechanismOfAction: actionText,
          indications: usesText,
          contraindications: contraText,
          sideEffects: adverseText,
          drugInteractions: interactText,
          pharmacokinetics: actionText,
          pharmacodynamics: actionText,
          learnMore: {
            counseling: safetyText,
            monitoring: 'Monitor kondisi umum pasien, respons klinis, dan tanda-tanda intoleransi obat.',
            overdose: 'Jika terjadi overdosis, hentikan pemberian obat dan berikan terapi suportif.',
            storage: 'Simpan pada suhu ruang terkontrol (15–25°C), hindari paparan cahaya matahari langsung.',
            references: refText
          }
        },
        en: {
          drugClass: drugClassNameEn,
          mechanismOfAction: actionText,
          indications: usesText,
          contraindications: contraText,
          sideEffects: adverseText,
          drugInteractions: interactText,
          pharmacokinetics: actionText,
          pharmacodynamics: actionText,
          learnMore: {
            counseling: safetyText,
            monitoring: 'Monitor clinical resolution, patient condition, and adverse effects.',
            overdose: 'In case of overdose, discontinue administration and institute supportive care.',
            storage: 'Store at controlled room temperature (15–25°C), protect from light and moisture.',
            references: refText
          }
        }
      }
    };

    finalDatabase.push(newDrug);
    processedIds.add(slug);
    addedBsava++;
  }

  console.log(`Added ${addedBsava} new BSAVA monographs.`);
  console.log(`Total database count: ${finalDatabase.length} monographs.`);

  // Write to public/js/drugs-data.js
  const fileHeader = `/**
 * Veterinary Pharmacology Database
 * Sourced from:
 * - BSAVA Small Animal Formulary (Part A: Canine and Feline, 10th Edition 2020 by Fergus Allerton)
 * - Plumb's Veterinary Drug Handbook (9th & 10th Editions)
 *
 * Total monographs: ${finalDatabase.length}
 * Bilingual support: Indonesian (id) & English (en)
 */

export const VET_DRUG_DATABASE = ${JSON.stringify(finalDatabase, null, 2)};
`;

  fs.writeFileSync(drugsDataPath, fileHeader, 'utf8');
  console.log(`Successfully generated ${drugsDataPath} (${(fileHeader.length / 1024 / 1024).toFixed(2)} MB).`);
}

buildDatabase().catch(err => {
  console.error('Error building database:', err);
  process.exit(1);
});
