const fs = require('fs');

const full = JSON.parse(fs.readFileSync('C:/Users/wedia/Downloads/bsava_part_a_full.json', 'utf8'));
console.log('Total monographs:', full.monographs.length);

for (let i = 0; i < 5; i++) {
  const m = full.monographs[i];
  console.log('\n=== [' + i + '] ' + m.name + ' ===');
  console.log('Aliases:', m.aliases);
  console.log('Trade names:', m.trade_names);
  console.log('Distribution category:', m.distribution_category);
  console.log('Formulations:', m.formulations);
  console.log('Action:', typeof m.action, Array.isArray(m.action) ? 'array len ' + m.action.length : (m.action || '').slice(0, 100));
  console.log('Uses:', typeof m.uses, Array.isArray(m.uses) ? 'array len ' + m.uses.length : (m.uses || '').slice(0, 100));
  console.log('Contraindications:', typeof m.contraindications, Array.isArray(m.contraindications) ? 'array len ' + m.contraindications.length : '');
  console.log('Adverse reactions:', typeof m.adverse_reactions, Array.isArray(m.adverse_reactions) ? 'array len ' + m.adverse_reactions.length : '');
  console.log('Drug interactions:', typeof m.drug_interactions, Array.isArray(m.drug_interactions) ? 'array len ' + m.drug_interactions.length : '');
  console.log('Safety & handling:', typeof m.safety_and_handling, Array.isArray(m.safety_and_handling) ? 'array len ' + m.safety_and_handling.length : '');
  console.log('Doses count:', m.doses ? m.doses.length : 0);
  if (m.doses && m.doses[0]) {
    console.log('Sample dose 0:', JSON.stringify(m.doses[0]).slice(0, 250));
  }
}
