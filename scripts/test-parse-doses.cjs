const fs = require('fs');

const full = JSON.parse(fs.readFileSync('C:/Users/wedia/Downloads/bsava_part_a_full.json', 'utf8'));

function parseDoseRegimen(regimenStr, defaultIndication = '') {
  if (!regimenStr || typeof regimenStr !== 'string') return null;

  // Check if "Do not use" or "Not recommended" or "Not applicable"
  if (/do not use|not recommended|not applicable|no information/i.test(regimenStr)) {
    return {
      contraindicated: true,
      notes: regimenStr
    };
  }

  // Look for dose number range: e.g. "0.01–0.02 mg/kg", "15–30 mg/kg", "10 mg/kg", "5-10 mg/kg"
  // Note the en-dash '–' or hyphen '-'
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
    // If no /kg dose found, check if plain mg
    const plainMgMatch = regimenStr.match(/(\d+(?:\.\d+)?)\s*(?:[–\-–—]\s*(\d+(?:\.\d+)?))?\s*(mg|μg|ug|mcg|g|ml)/i);
    if (plainMgMatch) {
      minDose = parseFloat(plainMgMatch[1]);
      maxDose = plainMgMatch[2] ? parseFloat(plainMgMatch[2]) : minDose;
      defaultDose = parseFloat(((minDose + maxDose) / 2).toFixed(3));
      unit = plainMgMatch[3].toLowerCase();
    }
  }

  // Route extraction
  let route = 'PO';
  if (/\bi\.?v\.?|\biv\b|\bintravenous/i.test(regimenStr)) route = 'IV';
  else if (/\bi\.?m\.?|\bim\b|\bintramuscular/i.test(regimenStr)) route = 'IM';
  else if (/\bs\.?c\.?|\bsc\b|\bsubcutaneous/i.test(regimenStr)) route = 'SC';
  else if (/\bp\.?o\.?|\bpo\b|\boral/i.test(regimenStr)) route = 'PO';
  else if (/\btopical|\bcutaneous/i.test(regimenStr)) route = 'Topical';
  else if (/\bophthalmic|\beye/i.test(regimenStr)) route = 'Ophthalmic';

  // Frequency extraction
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

let parsedCount = 0;
let canineCount = 0;
let felineCount = 0;

for (const m of full.monographs) {
  let hasCanine = false;
  let hasFeline = false;
  if (m.doses) {
    for (const d of m.doses) {
      const sp = (d.species || '').toLowerCase();
      const firstReg = (d.regimens && d.regimens[0]) ? d.regimens[0] : null;
      if (firstReg) {
        const parsed = parseDoseRegimen(firstReg.regimen, firstReg.indication);
        if (parsed && !parsed.contraindicated) {
          if (sp.includes('dog')) hasCanine = true;
          if (sp.includes('cat')) hasFeline = true;
        }
      }
    }
  }
  if (hasCanine || hasFeline) parsedCount++;
  if (hasCanine) canineCount++;
  if (hasFeline) felineCount++;
}

console.log(`Monographs with parsed doses: ${parsedCount}/${full.monographs.length}`);
console.log(`Canine doses: ${canineCount}, Feline doses: ${felineCount}`);
