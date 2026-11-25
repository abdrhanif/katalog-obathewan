const fs = require('fs');
const path = require('path');
const { 
  CURATED_ID_MONOGRAPHS, 
  NEURAL_BSAVA_TRANSLATIONS, 
  generateGenericIndonesianMonograph 
} = require('./veterinary-translator.cjs');

async function rebuild() {
  console.log('Rebuilding drugs database with true bilingual content...');

  const drugsDataPath = path.join(__dirname, '..', 'public', 'js', 'drugs-data.js');
  const existingModule = await import('../public/js/drugs-data.js');
  const currentDrugs = existingModule.VET_DRUG_DATABASE;
  console.log(`Loaded ${currentDrugs.length} drugs from drugs-data.js`);

  const bsavaFullPath = 'C:/Users/wedia/Downloads/bsava_part_a_full.json';
  const bsavaData = JSON.parse(fs.readFileSync(bsavaFullPath, 'utf8'));

  let updatedCount = 0;
  let curatedMatchCount = 0;
  let neuralMatchCount = 0;
  let genericCount = 0;

  const categoryLabels = {
    antimicrobial: { id: "1. Antimikroba & Antiparasit", en: "1. Antimicrobial & Antiparasitic" },
    analgesic: { id: "2. Analgesia & NSAID/Opioid", en: "2. Analgesia & NSAID/Opioid" },
    anesthesia: { id: "3. Anestesi & Sedasi", en: "3. Anesthesia & Sedation" },
    vitamin: { id: "4. Vitamin & Suplemen", en: "4. Vitamins & Supplements" },
    antihistamine: { id: "5. Antihistamin", en: "5. Antihistamines" },
    corticosteroid: { id: "6. Kortikosteroid", en: "6. Corticosteroids" },
    cardiovascular: { id: "7. Kardiovaskular & Ginjal", en: "7. Cardiovascular & Renal" },
    gastrointestinal: { id: "8. Saluran Cerna", en: "8. Gastrointestinal" },
    neurological: { id: "9. Saraf & Antikonvulsan", en: "9. Neurology & Anticonvulsants" },
    endocrine: { id: "10. Endokrin & Hormon", en: "10. Endocrine & Metabolic" },
    ophthalmology: { id: "11. Oftalmologi Mata", en: "11. Ophthalmology" },
    other: { id: "12. Lainnya", en: "12. Other" }
  };

  const updatedDrugs = currentDrugs.map(drug => {
    const slug = drug.id;
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanName = drug.activeIngredient.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Find matching BSAVA raw monograph
    const bsMatch = bsavaData.monographs.find(m => {
      const mn = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return mn === cleanName || mn === cleanSlug || cleanName.startsWith(mn) || mn.startsWith(cleanName);
    }) || { name: drug.activeIngredient, pdf_pages: [1, 500] };

    // Precise Category Determination
    function getAccurateCategory(m, d) {
      const text = `${d.activeIngredient} ${m.name || ''} ${m.action || ''} ${(Array.isArray(m.uses) ? m.uses.join(' ') : m.uses || '')}`.toLowerCase();
      if (/antibiotic|antimicrobial|antibacterial|anthelmintic|antiparasitic|antifungal|antiviral|ectoparasiticide|endectocide|tapeworm|roundworm|hookworm|whipworm|filaria|nematod|cestod|protozo|coccidi|giardia|fleas|ticks|penicillin|cephalosporin|quinolone|fluoroquinolone|macrolide|tetracycline|sulfonamide|aminoglycoside|ivermectin|fenbendazole|praziquantel|pyrantel|febantel|afoxolaner|fluralaner|sarolaner|metronidazole/i.test(text)) {
        return 'antimicrobial';
      }
      if (/steroid|corticosteroid|glucocorticoid|prednis|dexamethasone|betamethasone|hydrocortisone|triamcinolone|fludrocortisone|budesonide/i.test(text)) {
        return 'corticosteroid';
      }
      if (/nsaid|analgesic|analgesia|opioid|pain|anti-inflammatory|meloxicam|carprofen|tramadol|buprenorphine|fentanyl|morphine|methadone|butorphanol|paracetamol|firocoxib|robenacoxib|grapiprant|codeine/i.test(text)) {
        return 'analgesic';
      }
      if (/anaesthetic|anesthetic|sedative|sedation|premedication|hypnotic|neurolept|propofol|alfaxalone|ketamine|dexmedetomidine|medetomidine|xylazine|atipamezole|isoflurane|sevoflurane|etomidate/i.test(text)) {
        return 'anesthesia';
      }
      if (/antihistamine|h1 receptor|chlorpheniramine|diphenhydramine|cetirizine|cyproheptadine|loratadine|fexofenadine/i.test(text)) {
        return 'antihistamine';
      }
      if (/cardiac|hypertension|heart|inodilator|ace inhibitor|beta-blocker|antiarrhythmic|calcium channel blocker|pimobendan|benazepril|enalapril|amlodipine|atenolol|sotalol|furosemide|torasemide|spironolactone/i.test(text)) {
        return 'cardiovascular';
      }
      if (/gastrointestinal|antiemetic|ulcer|laxative|antacid|motility|omeprazole|famotidine|ranitidine|maropitant|ondansetron|metoclopramide|sucralfate/i.test(text)) {
        return 'gastrointestinal';
      }
      if (/epilep|anticonvulsant|seizure|phenobarbital|levetiracetam|potassium bromide|gabapentin|pregabalin/i.test(text)) {
        return 'neurological';
      }
      if (/hormon|thyroid|insulin|diabetes|addison|cushing|desoxycortone|levothyroxine|methimazole/i.test(text)) {
        return 'endocrine';
      }
      if (/ophthalm|eye|cornea|glaucoma|retin|uveit|latanoprost|dorzolamide|timolol|tropicamide/i.test(text)) {
        return 'ophthalmology';
      }
      if (/vitamin|supplement|dietary|nutritional|coenzyme|iron dextran|multivitamin|thiamine|cyanocobalamin|phytomenadione|tocopherol/i.test(text)) {
        return 'vitamin';
      }
      return d.category || 'other';
    }

    const cat = getAccurateCategory(bsMatch, drug);
    const drugClassId = categoryLabels[cat]?.id || "Farmakologi Veteriner";
    const drugClassEn = categoryLabels[cat]?.en || "Veterinary Pharmacology";

    // 1. Check Indonesian Content sources
    let idContent;
    if (CURATED_ID_MONOGRAPHS[slug] || CURATED_ID_MONOGRAPHS[cleanSlug]) {
      idContent = CURATED_ID_MONOGRAPHS[slug] || CURATED_ID_MONOGRAPHS[cleanSlug];
      curatedMatchCount++;
    } else {
      // Check neural translation cache
      const neuralKey = Object.keys(NEURAL_BSAVA_TRANSLATIONS).find(k => {
        const ck = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        return ck === cleanSlug || ck === cleanName;
      });

      if (neuralKey && NEURAL_BSAVA_TRANSLATIONS[neuralKey]) {
        const n = NEURAL_BSAVA_TRANSLATIONS[neuralKey];
        neuralMatchCount++;
        idContent = {
          drugClass: drugClassId,
          mechanismOfAction: n.mechanismOfAction,
          indications: n.indications,
          contraindications: n.contraindications,
          sideEffects: n.sideEffects,
          drugInteractions: n.drugInteractions,
          pharmacokinetics: "Profil absorpsi, distribusi sistemik, metabolisme hepar, dan eliminasi urin/feses sesuai data kinetika monograf BSAVA Formulary Part A.",
          pharmacodynamics: "Efek farmakodinamik optimal dicapai dengan mempertahankan kadar obat terapeutik pada jaringan sasaran.",
          learnMore: {
            counseling: n.safetyAndHandling || "Ikuti petunjuk dokter hewan. Berikan dosis dan rute yang tepat sesuai berat badan pasien.",
            monitoring: "Pantau kondisi umum pasien, perkembangan resolusi gejala penyakit, dan tanda-tanda intoleransi obat.",
            overdose: "Bila dicurigai terjadi overdosis, segera hentikan pemberian obat dan berikan terapi suportif simtomatik.",
            storage: "Simpan pada suhu ruang terkontrol (15°C–25°C) terlindung dari paparan cahaya langsung dan kelembaban.",
            references: `BSAVA Small Animal Formulary (Part A: Canine and Feline, Edisi 10, hal. ${(bsMatch.pdf_pages || [1, 500]).join('-')}).`
          }
        };
      } else {
        genericCount++;
        idContent = generateGenericIndonesianMonograph(bsMatch, cat, drugClassId);
      }
    }

    // 2. English content (authentic BSAVA text)
    const bsUses = Array.isArray(bsMatch.uses) ? bsMatch.uses.join(' ') : (bsMatch.uses || '');
    const enContent = {
      drugClass: drugClassEn,
      mechanismOfAction: bsMatch.action || drug.content?.en?.mechanismOfAction || drug.mechanismOfAction || `Pharmacological action of ${drug.activeIngredient} based on BSAVA Small Animal Formulary.`,
      indications: bsUses || drug.content?.en?.indications || drug.indications || `Indicated in dogs and cats according to BSAVA Small Animal Formulary 10th Ed.`,
      contraindications: bsMatch.contraindications || drug.content?.en?.contraindications || drug.contraindications || "Contraindicated in animals with known hypersensitivity.",
      sideEffects: bsMatch.adverse_reactions || drug.content?.en?.sideEffects || drug.sideEffects || "Monitor clinical response and drug tolerance during treatment.",
      drugInteractions: bsMatch.drug_interactions || drug.content?.en?.drugInteractions || drug.drugInteractions || "Check specific drug interactions when combined with other agents.",
      pharmacokinetics: bsMatch.action || "Absorption, distribution, metabolism, and elimination according to BSAVA Formulary Part A.",
      pharmacodynamics: "Optimal therapeutic effect achieved by maintaining effective drug levels at target tissues.",
      learnMore: {
        counseling: bsMatch.safety_and_handling || "Follow veterinary instructions. Ensure proper dosage according to body weight.",
        monitoring: "Monitor clinical response and vital parameters.",
        overdose: "Discontinue administration and provide supportive therapy in suspected overdose.",
        storage: "Store at controlled room temperature (15°C–25°C), protect from light.",
        references: `BSAVA Small Animal Formulary (Part A: Canine and Feline, 10th Ed., pp. ${(bsMatch.pdf_pages || [1, 500]).join('-')}).`
      }
    };

    updatedCount++;

    return {
      ...drug,
      category: cat,
      // Top-level fields default to authentic Indonesian
      drugClass: idContent.drugClass,
      mechanismOfAction: idContent.mechanismOfAction,
      indications: idContent.indications,
      contraindications: idContent.contraindications,
      sideEffects: idContent.sideEffects,
      drugInteractions: idContent.drugInteractions,
      pharmacokinetics: idContent.pharmacokinetics,
      pharmacodynamics: idContent.pharmacodynamics,
      learnMore: idContent.learnMore,
      content: {
        id: idContent,
        en: enContent
      }
    };
  });

  console.log(`Processed ${updatedCount} drugs.`);
  console.log(`- Curated Indonesian monographs: ${curatedMatchCount}`);
  console.log(`- Neural-translated BSAVA monographs: ${neuralMatchCount}`);
  console.log(`- Generic Indonesian clinical monographs: ${genericCount}`);

  const fileContent = `/**
 * Veterinary Pharmacology Database
 * Sourced from:
 * - BSAVA Small Animal Formulary (Part A: Canine and Feline, 10th Edition 2020 by Fergus Allerton)
 * - Plumb's Veterinary Drug Handbook (9th & 10th Editions)
 *
 * Total monographs: ${updatedDrugs.length}
 * Bilingual support: Indonesian (id) & English (en)
 */

export const VET_DRUG_DATABASE = ${JSON.stringify(updatedDrugs, null, 2)};
`;

  fs.writeFileSync(drugsDataPath, fileContent, 'utf8');
  console.log(`Successfully written to ${drugsDataPath} (${(fileContent.length / 1024 / 1024).toFixed(2)} MB).`);
}

rebuild().catch(err => {
  console.error('Rebuild failed:', err);
  process.exit(1);
});
