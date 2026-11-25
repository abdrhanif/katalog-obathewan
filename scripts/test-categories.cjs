const fs = require('fs');

const full = JSON.parse(fs.readFileSync('C:/Users/wedia/Downloads/bsava_part_a_full.json', 'utf8'));

function determineCategory(m) {
  const text = `${m.name} ${m.action || ''} ${(m.uses || []).join(' ')} ${(m.aliases || []).join(' ')}`.toLowerCase();

  if (/steroid|corticosteroid|glucocorticoid|prednis|dexamethasone|betamethasone|hydrocortisone|triamcinolone|fludrocortisone|budesonide/i.test(text)) {
    return 'corticosteroid';
  }
  if (/antihistamine|h1 receptor|chlorpheniramine|diphenhydramine|cetirizine|cyproheptadine|loratadine|fexofenadine/i.test(text)) {
    return 'antihistamine';
  }
  if (/vitamin|supplement|mineral|calcium|potassium|thiamine|cyanocobalamin|phytomenadione|tocopherol|iron|zinc/i.test(text)) {
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

const catCounts = {};
for (const m of full.monographs) {
  const cat = determineCategory(m);
  catCounts[cat] = (catCounts[cat] || 0) + 1;
}

console.log('Category distribution for 428 monographs:');
console.table(catCounts);
