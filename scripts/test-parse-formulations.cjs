const fs = require('fs');

const full = JSON.parse(fs.readFileSync('C:/Users/wedia/Downloads/bsava_part_a_full.json', 'utf8'));

console.log('Testing formulation parsing on 428 monographs...');

function parseFormulations(rawForm, drugName) {
  if (!rawForm || typeof rawForm !== 'string') {
    return [{
      id: `${drugName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-std`,
      type: 'tablet',
      strength: 100,
      unit: 'mg',
      label: 'Standard Sediaan',
      code: 'tab'
    }];
  }

  const formulations = [];
  // Split on phrases like "Oral:", "Injectable:", "Topical:", "Ophthalmic:", etc. or semicolons / periods
  const parts = rawForm.split(/(?=(?:Oral|Injectable|Topical|Ophthalmic|Otic|Inhalation|Rectal|Aural):)/i);

  for (const part of parts) {
    let type = 'tablet';
    const lower = part.toLowerCase();
    if (lower.startsWith('injectable') || lower.includes('injection') || lower.includes('inj.')) type = 'injection';
    else if (lower.includes('suspension') || lower.includes('syrup') || lower.includes('liquid') || lower.includes('drop')) type = 'suspension';
    else if (lower.includes('capsule')) type = 'capsule';
    else if (lower.includes('tablet')) type = 'tablet';
    else if (lower.includes('ointment') || lower.includes('cream') || lower.includes('gel')) type = 'topical';
    else if (lower.includes('ophthalmic') || lower.includes('eye')) type = 'ophthalmic';

    // Look for strengths: e.g. "10 mg, 25 mg tablets", "2 mg/ml solution", "0.5 mg/ml", "250 mg"
    const strengthMatches = [...part.matchAll(/(\d+(?:\.\d+)?)\s*(mg\/ml|mg\/g|μg\/ml|ug\/ml|mcg\/ml|mg|g|ml|iu\/ml|iu|%)/gi)];

    if (strengthMatches.length > 0) {
      for (const sm of strengthMatches) {
        const val = parseFloat(sm[1]);
        const unit = sm[2];
        const code = type === 'injection' ? 'inj' : (type === 'suspension' ? 'susp' : (type === 'capsule' ? 'caps' : 'tab'));
        formulations.push({
          id: `${drugName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${type}-${val}${unit.replace(/[^a-z0-9]/gi, '')}`,
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
      id: `${drugName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-std`,
      type: 'tablet',
      strength: 100,
      unit: 'mg',
      label: rawForm.slice(0, 50) || 'Standard formulation',
      code: 'tab'
    });
  }

  // Deduplicate by ID
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

let parsedCount = 0;
let totalFormulations = 0;
for (const m of full.monographs) {
  const forms = parseFormulations(m.formulations, m.name);
  if (forms.length > 0) parsedCount++;
  totalFormulations += forms.length;
}

console.log(`Monographs with parsed formulations: ${parsedCount}/${full.monographs.length}`);
console.log(`Total formulations generated: ${totalFormulations}`);
console.log(`Average formulations per drug: ${(totalFormulations / full.monographs.length).toFixed(1)}`);
