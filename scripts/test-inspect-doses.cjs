const fs = require('fs');

const full = JSON.parse(fs.readFileSync('C:/Users/wedia/Downloads/bsava_part_a_full.json', 'utf8'));

console.log('Inspecting doses from 20 monographs...');

for (let i = 0; i < 20; i++) {
  const m = full.monographs[i];
  console.log(`\n--- [${i}] ${m.name} ---`);
  if (!m.doses || m.doses.length === 0) {
    console.log('No doses');
    continue;
  }
  for (const d of m.doses) {
    console.log(`  Species: ${d.species}`);
    for (const r of (d.regimens || []).slice(0, 2)) {
      console.log(`    Indication: ${r.indication}`);
      console.log(`    Regimen: ${(r.regimen || '').slice(0, 120)}`);
    }
  }
}
