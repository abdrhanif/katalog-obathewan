const fs = require('fs');
const path = require('path');

// Translation rules
const PHRASE_RULES = [
  // Prescriber highlights sentence templates
  [/Bactericidal aminopenicillin with same spectrum as ampicillin \(ineffective against bacteria that produce beta-lactamase\)/gi, 'Aminopenisilin bakterisidal dengan spektrum yang sama seperti ampisilin (tidak efektif terhadap bakteri penghasil beta-laktamase).'],
  [/Most likely adverse effects are GI-related, but hypersensitivity reactions, although rare, can be severe/gi, 'Efek samping yang paling sering muncul terkait saluran cerna (GI), namun reaksi hipersensitivitas, meskipun jarang, dapat bersifat berat.'],
  [/Give with meals \(preferably right before\); drug is not very useful if feeding ad libitum/gi, 'Berikan bersama pakan (sebaiknya tepat sebelum makan); obat kurang efektif jika pakan diberikan bebas (ad libitum).'],
  [/Expense may be an issue, but generics are now available/gi, 'Biaya obat dapat menjadi pertimbangan, namun sediaan generik kini telah tersedia.'],
  [/Unlikely to be effective when used as sole therapy/gi, 'Kemungkinan tidak efektif jika digunakan sebagai terapi tunggal.'],
  [/Antihyperglycemic agent that reduces the rate & amount of glucose absorbed from the gut after a meal/gi, 'Agen antihiperglikemik yang menurunkan laju & jumlah glukosa yang diserap dari usus setelah makan'],
  [/Dose-dependent loose stools, diarrhea & flatulence are the adverse effects most likely to be noted/gi, 'Feses lembek tergantung dosis, diare & perut kembung (flatulensi) adalah efek samping yang paling sering teramati.'],
  [/Safe use during pregnancy has not been established/gi, 'Keamanan penggunaan selama masa kebuntingan belum ditetapkan.'],
  [/Store at room temperature/gi, 'Simpan pada suhu ruang terkontrol (15–25°C)'],
  [/Protect from light and moisture/gi, 'Lindungi dari paparan cahaya langsung dan kelembapan.'],
  [/Protect from freezing/gi, 'Hindari pembekuan.'],
  [/Shake well before use/gi, 'Kocok merata sebelum digunakan.'],
  [/Shake well before using/gi, 'Kocok merata sebelum digunakan.'],
  [/Keep out of reach of children/gi, 'Jauhkan dari jangkauan anak-anak.'],
  [/Give with food to minimize GI upset/gi, 'Berikan bersama pakan untuk meminimalkan gangguan saluran cerna.'],
  [/Give with food/gi, 'Berikan bersama pakan.'],
  [/Complete the full course of therapy/gi, 'Tuntaskan seluruh durasi terapi.'],
  [/Use with caution in patients with/gi, 'Gunakan dengan hati-hati pada pasien dengan'],
  [/Contraindicated in patients with/gi, 'Dikontraindikasikan pada pasien dengan'],
  [/Contraindicated in animals with/gi, 'Dikontraindikasikan pada hewan dengan'],
  [/is contraindicated in/gi, 'dikontraindikasikan pada'],
  [/is indicated for/gi, 'diindikasikan untuk'],
  [/indicated for the treatment of/gi, 'diindikasikan untuk pengobatan'],
  [/indicated for/gi, 'diindikasikan untuk'],
  [/may be useful for/gi, 'dapat bermanfaat untuk'],
  [/may be useful in/gi, 'dapat bermanfaat pada'],
  [/adverse effects reported include/gi, 'efek samping yang dilaporkan meliputi'],
  [/most common adverse effects are/gi, 'efek samping yang paling umum adalah'],
  [/crosses the placental barrier/gi, 'menembus sawar plasenta'],
  [/excreted in maternal milk/gi, 'diekskresikan ke dalam air susu induk']
];

const WORD_RULES = [
  [/\bnon-steroidal anti-inflammatory drugs?\b/gi, 'obat antiinflamasi non-steroid (NSAID)'],
  [/\bnon-steroidal anti-inflammatory\b/gi, 'antiinflamasi non-steroid (NSAID)'],
  [/\bcentral nervous system\b/gi, 'sistem saraf pusat (SSP)'],
  [/\bcomplete blood count\b/gi, 'hitung darah lengkap (CBC)'],
  [/\bserum biochemistry panel\b/gi, 'panel biokimia serum'],
  [/\bdiabetic ketoacidosis\b/gi, 'ketoasidosis diabetik'],
  [/\binflammatory bowel disease\b/gi, 'penyakit radang usus (IBD)'],
  [/\bcolonic ulceration\b/gi, 'ulserasi kolon'],
  [/\bintestinal obstruction\b/gi, 'obstruksi usus'],
  [/\bexcessive gas formation\b/gi, 'pembentukan gas berlebih'],
  [/\brenal dysfunction\b/gi, 'disfungsi ginjal'],
  [/\brenal failure\b/gi, 'gagal ginjal'],
  [/\bsevere liver disease\b/gi, 'penyakit hepar berat'],
  [/\bhepatic disease\b/gi, 'penyakit hepar'],
  [/\bhepatic dysfunction\b/gi, 'disfungsi hepar'],
  [/\bknown hypersensitivity\b/gi, 'riwayat hipersensitivitas'],
  [/\bunderweight animals\b/gi, 'hewan dengan berat badan kurang (underweight)'],
  [/\bsoft stools?\b/gi, 'feses lunak'],
  [/\bloose stools?\b/gi, 'feses lembek'],
  [/\bweight loss\b/gi, 'penurunan berat badan'],
  [/\bpregnancy and lactation\b/gi, 'kebuntingan dan laktasi'],
  [/\bpregnant or lactating\b/gi, 'bunting atau laktasi'],
  [/\bpregnant animals?\b/gi, 'hewan bunting'],
  [/\blactating animals?\b/gi, 'hewan laktasi'],
  [/\bdogs and cats\b/gi, 'anjing dan kucing'],
  [/\bdogs or cats\b/gi, 'anjing atau kucing'],
  [/\bdogs\b/gi, 'anjing'],
  [/\bcats\b/gi, 'kucing'],
  [/\bhorses\b/gi, 'kuda'],
  [/\bcattle\b/gi, 'sapi'],
  [/\bbirds\b/gi, 'burung'],
  [/\bswine\b/gi, 'babi'],
  [/\brabbits\b/gi, 'kelinci'],
  [/\bferrets\b/gi, 'musang (ferret)'],
  [/\bvomiting\b/gi, 'muntah'],
  [/\bdiarrhea\b/gi, 'diare'],
  [/\bnausea\b/gi, 'mual'],
  [/\banorexia\b/gi, 'anoreksia (hilang nafsu makan)'],
  [/\blethargy\b/gi, 'letargi (lemas)'],
  [/\bdepression\b/gi, 'depresi'],
  [/\bweakness\b/gi, 'kelemahan fisik'],
  [/\bataxia\b/gi, 'ataksia (hilang koordinasi gerak)'],
  [/\bseizures\b/gi, 'kejang'],
  [/\btremors\b/gi, 'tremor'],
  [/\bpruritus\b/gi, 'pruritus (gatal)'],
  [/\berythema\b/gi, 'eritema (kemerahan kulit)'],
  [/\burticaria\b/gi, 'urtikaria (biduran)'],
  [/\brash\b/gi, 'ruam kulit'],
  [/\balopecia\b/gi, 'alopesia (kebotakan bulu)'],
  [/\bcough\b/gi, 'batuk'],
  [/\bdyspnea\b/gi, 'dispnea (sesak napas)'],
  [/\btachypnea\b/gi, 'takipnea (napas cepat)'],
  [/\btachycardia\b/gi, 'takikardia (detak jantung cepat)'],
  [/\bbradycardia\b/gi, 'bradikardia (detak jantung lambat)'],
  [/\bhypotension\b/gi, 'hipotensi (tekanan darah rendah)'],
  [/\bhypertension\b/gi, 'hipertensi (tekanan darah tinggi)'],
  [/\bdehydration\b/gi, 'dehidrasi'],
  [/\banemia\b/gi, 'anemia'],
  [/\bthrombocytopenia\b/gi, 'trombositopenia'],
  [/\bleukopenia\b/gi, 'leukopenia'],
  [/\bneutropenia\b/gi, 'neutropenia'],
  [/\binfection\b/gi, 'infeksi'],
  [/\binfections\b/gi, 'infeksi'],
  [/\bsepsis\b/gi, 'sepsis'],
  [/\binflammation\b/gi, 'peradangan (inflamasi)'],
  [/\bpain\b/gi, 'nyeri'],
  [/\bedema\b/gi, 'edema (pembengkakan cairan)'],
  [/\bulceration\b/gi, 'ulserasi (tukak/luka)'],
  [/\bnecrosis\b/gi, 'nekrosis (kematian jaringan)'],
  [/\bazotemia\b/gi, 'azotemia'],
  [/\bhypoglycemia\b/gi, 'hipoglikemia'],
  [/\bhyperglycemia\b/gi, 'hiperglikemia'],
  [/\bhypokalemia\b/gi, 'hipokalemia'],
  [/\bhyperkalemia\b/gi, 'hiperkalemia'],
  [/\bhypocalcemia\b/gi, 'hipokalsemia'],
  [/\bhypercalcemia\b/gi, 'hiperkalsemia'],
  [/\bflatulence\b/gi, 'perut kembung (flatulensi)'],
  [/\bliver\b/gi, 'hepar'],
  [/\bkidneys?\b/gi, 'ginjal'],
  [/\bstomach\b/gi, 'lambung'],
  [/\bgut\b/gi, 'saluran cerna'],
  [/\bheart\b/gi, 'jantung'],
  [/\blungs?\b/gi, 'paru-paru'],
  [/\bbladder\b/gi, 'vesika urinaria (kandung kemih)'],
  [/\bblood glucose concentrations?\b/gi, 'konsentrasi glukosa darah'],
  [/\bblood glucose\b/gi, 'glukosa darah'],
  [/\bdrug interactions?\b/gi, 'interaksi obat'],
  [/\badverse effects?\b/gi, 'efek samping'],
  [/\badverse reactions?\b/gi, 'reaksi merugikan'],
  [/\bclinical signs?\b/gi, 'gejala klinis'],
  [/\bbactericidal\b/gi, 'bakterisidal'],
  [/\bbacteriostatic\b/gi, 'bakteriostatik'],
  [/\bbroad-spectrum\b/gi, 'spektrum luas'],
  [/\bGram-positive\b/gi, 'Gram-positif'],
  [/\bGram-negative\b/gi, 'Gram-negatif'],
  [/\bsusceptible\b/gi, 'rentan'],
  [/\bhalf-life\b/gi, 'waktu paruh'],
  [/\bbioavailability\b/gi, 'bioavailabilitas'],
  [/\bpeak concentrations?\b/gi, 'konsentrasi puncak'],
  [/\boral\b/gi, 'oral'],
  [/\btablets?\b/gi, 'tablet'],
  [/\bcapsules?\b/gi, 'kapsul'],
  [/\binjection\b/gi, 'injeksi'],
  [/\bsuspension\b/gi, 'suspensi'],
  [/\bsolution\b/gi, 'larutan (solusio)'],
  [/\bonce daily\b/gi, '1 kali sehari (q24h)'],
  [/\btwice daily\b/gi, '2 kali sehari (q12h)'],
  [/\bthree times daily\b/gi, '3 kali sehari (q8h)'],
  [/\bfour times daily\b/gi, '4 kali sehari (q6h)'],
  [/\bas needed\b/gi, 'bila diperlukan (p.r.n.)'],
  [/\bwith food\b/gi, 'bersama pakan'],
  [/\bon an empty stomach\b/gi, 'dalam keadaan perut kosong (sebelum makan)'],
  [/\bwithout food\b/gi, 'tanpa makanan'],
  [/\bintravenous(?:ly)?\b/gi, 'intravena (IV)'],
  [/\bintramuscular(?:ly)?\b/gi, 'intramuskular (IM)'],
  [/\bsubcutaneous(?:ly)?\b/gi, 'subkutan (SC)'],
  [/\btopical(?:ly)?\b/gi, 'topikal (luar)']
];

function translateToIndonesian(text) {
  if (!text || typeof text !== 'string') return text;
  let res = text;
  PHRASE_RULES.forEach(([rx, rep]) => {
    res = res.replace(rx, rep);
  });
  WORD_RULES.forEach(([rx, rep]) => {
    res = res.replace(rx, rep);
  });
  return res.replace(/\s+/g, ' ').trim();
}

// Test on sample monograph
const sampleAcarbose = {
  highlights: [
    'Antihyperglycemic agent that reduces the rate & amount of glucose absorbed from the gut after a meal; may be useful for mild reductions in blood glucose in dogs or cats. Unlikely to be effective when used as sole therapy.',
    'Dose-dependent loose stools, diarrhea & flatulence are the adverse effects most likely to be noted.',
    'Give with meals (preferably right before); drug is not very useful if feeding ad libitum.',
    'Expense may be an issue, but generics are now available.'
  ],
  indications: 'May be useful for mild reductions in blood glucose concentrations (250-350 mg/dL range) in dogs and cats with non-insulin-dependent diabetes mellitus and as adjunctive treatment of insulin dependent diabetes mellitus.',
  adverseEffects: 'Adverse effects reported in cats include flatulence, soft stools and diarrhea; in dogs, diarrhea and weight loss. Adverse effects are more likely at higher doses.'
};

console.log('=== TRANSLATED HIGHLIGHTS ===');
sampleAcarbose.highlights.forEach(h => console.log('• ' + translateToIndonesian(h)));

console.log('\n=== TRANSLATED INDICATIONS ===');
console.log(translateToIndonesian(sampleAcarbose.indications));

console.log('\n=== TRANSLATED ADVERSE EFFECTS ===');
console.log(translateToIndonesian(sampleAcarbose.adverseEffects));
