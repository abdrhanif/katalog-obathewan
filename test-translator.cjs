// Comprehensive Veterinary Pharmacology Translator: English -> Indonesian
// Designed specifically for BSAVA Formulary & Veterinary Drug Monographs

const PHRASE_TRANSLATIONS = [
  // Mechanism & Action
  [/\bbinds to penicillin-binding proteins\b/gi, "berikatan dengan penicillin-binding proteins (PBPs)"],
  [/\binvolved in bacterial cell wall synthesis\b/gi, "yang terlibat dalam sintesis dinding sel bakteri"],
  [/\bthereby decreasing cell wall strength and causing cell lysis\b/gi, "sehingga menurunkan integritas dinding sel dan memicu lisis bakteri (bakterisidal)"],
  [/\binhibits bacterial cell wall synthesis\b/gi, "menghambat sintesis dinding sel bakteri"],
  [/\btime-dependent bactericidal action\b/gi, "aksi bakterisidal bergantung waktu (time-dependent bactericidal)"],
  [/\bconcentration-dependent bactericidal action\b/gi, "aksi bakterisidal bergantung konsentrasi (concentration-dependent)"],
  [/\bbroad-spectrum\b/gi, "spektrum luas"],
  [/\bgram-positive and gram-negative\b/gi, "Gram-positif dan Gram-negatif"],
  [/\bphenothiazine with depressant effect on the cns\b/gi, "fenotiazin dengan efek depresan pada susunan saraf pusat (SSP)"],
  [/\bthereby causing sedation and a reduction in spontaneous activity\b/gi, "sehingga menimbulkan sedasi dan penurunan aktivitas motorik spontan"],
  [/\bdecreases the viscosity of bronchial secretions\b/gi, "menurunkan kekentalan (viskositas) sekret bronkus (efek mukolitik)"],
  [/\bmaintains glutathione levels in the liver\b/gi, "mempertahankan cadangan glutation di organ hepar"],
  [/\bhas scavenging action on free oxygen radicals\b/gi, "memiliki aktivitas penangkap radikal bebas oksigen"],
  [/\binhibits viral replication\b/gi, "menghambat replikasi DNA virus"],
  [/\bsystemic carbonic anhydrase inhibitor\b/gi, "penghambat enzim karbonik anhidrase sistemik"],
  [/\bacts via alpha-1, -2 and beta-1 and -2 adrenoreceptors\b/gi, "bekerja melalui reseptor adrenergik alfa-1, alfa-2, beta-1, dan beta-2"],
  [/\bcauses peripheral vasoconstriction\b/gi, "menyebabkan vasokonstriksi pembuluh darah perifer"],
  [/\bincreases cardiac output and heart rate\b/gi, "meningkatkan curah jantung (cardiac output) dan denyut jantung"],
  [/\bcauses bronchodilation\b/gi, "menimbulkan relaksasi otot polos bronkus (bronkodilasi)"],
  [/\bdepolarizing neuromuscular blocking agent\b/gi, "agen penghambat neuromuskular depolarisasi"],
  [/\bnon-depolarizing neuromuscular blocking agent\b/gi, "agen penghambat neuromuskular non-depolarisasi"],
  [/\bcompetitive antagonist at\b/gi, "antagonis kompetitif pada"],
  [/\bagonist at\b/gi, "agonis pada"],
  [/\bmu-opioid receptor agonist\b/gi, "agonis reseptor opioid mu"],
  [/\bkappa-opioid receptor\b/gi, "reseptor opioid kappa"],
  [/\bnon-steroidal anti-inflammatory drug\b/gi, "obat antiinflamasi non-steroid (NSAID)"],
  [/\bpreferential cox-2 inhibitor\b/gi, "penghambat selektif COX-2 (siklooksigenase-2)"],
  [/\binhibits prostaglandin synthesis\b/gi, "menghambat sintesis prostaglandin inflamasi"],
  [/\banti-inflammatory, analgesic and antipyretic\b/gi, "antiinflamasi, analgesik (pereda nyeri), dan antipiretik (penurun demam)"],
  [/\bproton pump inhibitor\b/gi, "penghambat pompa proton (PPI) lambung"],
  [/\bh2-receptor antagonist\b/gi, "antagonis reseptor H2 histamin lambung"],
  [/\bangiotensin-converting enzyme \(ace\) inhibitor\b/gi, "penghambat enzim pengubah angiotensin (ACE inhibitor)"],
  [/\binodilator with positive inotropic\b/gi, "inodilator dengan efek inotropik positif"],
  [/\bloop diuretic that inhibits sodium and chloride reabsorption\b/gi, "diuretik kuat (loop diuretic) yang menghambat reabsorpsi natrium dan klorida di ansa Henle"],
  [/\bgaba analogue that modulates calcium channels\b/gi, "analog GABA yang memodulasi kanal kalsium berpintu-voltase pada susunan saraf"],

  // Indications & Uses
  [/\bsedation or pre-anaesthetic medication in dogs and cats\b/gi, "Sedasi atau medikasi pra-anestesi pada anjing dan kucing."],
  [/\braises the threshold for cardiac arrhythmias\b/gi, "meningkatkan ambang batas aritmia ventrikel jantung"],
  [/\bhas antiemetic properties\b/gi, "memiliki sifat antiemetik (antimuntah)"],
  [/\bcombining acp with an opioid drug improves sedation\b/gi, "kombinasi dengan opioid meningkatkan kualitas sedasi (neuroleptanalgesia) dan memberikan analgesia"],
  [/\bmanagement of thromboembolism in cats\b/gi, "penatalaksanaan tromboembolisme pada kucing karena aksi vasodilatasi perifer"],
  [/\breduces the extent of liver injury in cases of paracetamol poisoning\b/gi, "Mengurangi derajat kerusakan hepar pada kasus intoksikasi parasetamol dan hepatotoksisitas."],
  [/\btreatment of ocular herpesvirus infections in cats\b/gi, "Pengobatan keratitis akibat infeksi feline herpesvirus (FHV-1) pada kucing."],
  [/\bmanagement of glaucoma\b/gi, "penanganan glaukoma dan penurunan tekanan intraokular"],
  [/\bcardiopulmonary arrest \(cpa\)\b/gi, "henti jantung-paru (cardiopulmonary arrest)"],
  [/\bbronchoconstriction and anaphylaxis\b/gi, "bronkokonstriksi akut dan reaksi anafilaksis berat"],
  [/\btreatment of susceptible\b/gi, "Pengobatan infeksi yang disebabkan oleh bakteri rentan"],
  [/\brespiratory tract infections\b/gi, "infeksi saluran pernapasan"],
  [/\burinary tract infections\b/gi, "infeksi saluran kemih (ISK)"],
  [/\bskin and soft tissue infections\b/gi, "infeksi kulit dan jaringan lunak (pioderma, abses, luka terinfeksi)"],
  [/\bgastrointestinal infections\b/gi, "infeksi saluran pencernaan"],
  [/\bperiodontal disease\b/gi, "penyakit periodontal dan infeksi rongga mulut"],
  [/\bosteoarthritis and chronic pain\b/gi, "osteoartritis, nyeri muskuloskeletal kronis, dan peradangan sendi"],
  [/\bperioperative pain management\b/gi, "manajemen nyeri perioperatif (pra-, intra-, dan pascaoperasi)"],
  [/\binduction and maintenance of general anaesthesia\b/gi, "induksi dan pemeliharaan anestesi umum"],
  [/\bcongestive heart failure\b/gi, "gagal jantung kongestif (CHF) pada anjing dan kucing"],
  [/\bsystemic hypertension\b/gi, "hipertensi sistemik"],
  [/\bseizure control and epilepsy\b/gi, "kontrol kejang dan terapi rumatan epilepsi"],
  [/\ballergic dermatitis and pruritus\b/gi, "dermatitis alergi, atopi, dan rasa gatal (pruritus)"],
  [/\bimmune-mediated diseases\b/gi, "penyakit yang dimediasi sistem imun (IMHA, IMTP, lupus)"],
  [/\bhyperthyroidism in cats\b/gi, "hipertiroidisme pada kucing"],
  [/\bhypothyroidism in dogs\b/gi, "hipotiroidisme pada anjing"],

  // Contraindications
  [/\bcontraindicated in animals with known hypersensitivity\b/gi, "Dikontraindikasikan pada hewan dengan riwayat hipersensitivitas"],
  [/\bdo not administer orally to rabbits, guinea pigs, chinchillas, or hamsters\b/gi, "DILARANG diberikan per oral pada kelinci, marmut, chinchilla, atau hamster karena memicu enterotoksemia fatal"],
  [/\bcauses fatal enterotoxemia\b/gi, "menyebabkan enterotoksemia fatal akibat disbiosis klostridial"],
  [/\bdo not use in\b/gi, "Jangan digunakan pada"],
  [/\bdo not use\b/gi, "Jangan digunakan."],
  [/\buse with caution in animals with hepatic or renal impairment\b/gi, "Gunakan dengan sangat hati-hati pada pasien dengan disfungsi hepar atau gagal ginjal."],
  [/\buse with caution in\b/gi, "Gunakan dengan hati-hati pada"],
  [/\bavoid in patients with hypovolaemia, hypotension, shock, or severe cardiac disease\b/gi, "Hindari penggunaan pada pasien hipovolemia, hipotensi, syok sirkulasi, atau penyakit jantung dekompensata berat."],
  [/\bcontraindicated in patients with active gastrointestinal ulceration or bleeding\b/gi, "Kontraindikasi mutlak pada pasien dengan ulkus gastrointestinal aktif atau perdarahan saluran cerna."],
  [/\bdo not combine with nsaids or other corticosteroids\b/gi, "Jangan dikombinasikan bersamaan dengan NSAID lain atau kortikosteroid karena risiko perforasi lambung."],
  [/\bnot recommended in pregnant or lactating animals\b/gi, "Tidak direkomendasikan pada hewan bunting atau sedang menyusui kecuali pertimbangan manfaat klinis lebih besar."],

  // Adverse Reactions & Side Effects
  [/\bgastrointestinal disturbances: vomiting, diarrhea, nausea, anorexia\b/gi, "Gangguan saluran cerna: muntah, diare, mual, dan anoreksia."],
  [/\bgastrointestinal ulceration and erosion\b/gi, "iritasi, erosi, hingga ulkus lambung-usus"],
  [/\bhypotension and hypothermia\b/gi, "hipotensi dan penurunan suhu tubuh (hipotermia)"],
  [/\bbradycardia\b/gi, "penurunan denyut jantung (bradikardia)"],
  [/\brespiratory depression\b/gi, "depresi pernapasan pada dosis tinggi"],
  [/\bsedation, ataxia, and drowsiness\b/gi, "sedasi, ataksia (sempoyongan), dan rasa kantuk"],
  [/\bnephrotoxicity and ototoxicity\b/gi, "toksisitas ginjal (nefrotoksisitas) dan kerusakan pendengaran (ototoksisitas)"],
  [/\bhepatotoxicity and elevated liver enzymes\b/gi, "hepatotoksisitas dan peningkatan enzim hepar (ALT/ALP)"],
  [/\bpolyuria, polydipsia, and polyphagia\b/gi, "poliuria (banyak kencing), polidipsia (banyak minum), dan polifagia (meningkatnya nafsu makan)"],
  [/\bmild hypersensitivity reactions \(urticaria, fever, pruritus\)\b/gi, "reaksi hipersensitivitas ringan (urtikaria, demam, pruritus)"],

  // Drug Interactions
  [/\bbacteriostatic antibiotics .* may antagonize bactericidal action\b/gi, "Antibiotik bakteriostatik (tetrasiklin, makrolida) dapat mengantagonis efektivitas agen bakterisidal."],
  [/\bprobenecid competitively decreases renal excretion\b/gi, "Probenesid secara kompetitif menurunkan ekskresi ginjal sehingga memperpanjang waktu paruh obat."],
  [/\bsynergistic with aminoglycosides\b/gi, "Bekerja sinergis bila dikombinasikan dengan aminoglikosida."],
  [/\bconcurrent administration with other cns depressants\b/gi, "Pemberian bersama depresan SSP lain (anestetik, opioid) memperkuat derajat sedasi dan depresi napas."],
  [/\bconcurrent use with nsaids increases the risk of renal failure\b/gi, "Penggunaan bersama NSAID lain meningkatkan risiko gagal ginjal akut dan ulserasi lambung."],

  // Safety & Handling / Counseling
  [/\bcan be administered with or without food\b/gi, "Dapat diberikan bersama atau tanpa pakan; jika timbul muntah berikan bersama makanan kecil."],
  [/\bshake well before use\b/gi, "Kocok botol secara menyeluruh sebelum pemberian."],
  [/\bkeep refrigerated\b/gi, "Simpan di lemari pendingin (2°C–8°C). Jangan dibekukan."],
  [/\bstore in a dry, cool place protected from light\b/gi, "Simpan di tempat kering dan sejuk, terlindung dari paparan cahaya matahari langsung."],
  [/\bwear gloves when handling\b/gi, "Kenakan sarung tangan medis saat menangani obat atau membersihkan sisa sediaan."],
  [/\bwash hands thoroughly after handling\b/gi, "Cuci tangan dengan sabun dan air mengalir setelah pemberian obat."]
];

const WORD_DICTIONARY = [
  // Animals / Species
  [/\bdogs and cats\b/gi, "anjing dan kucing"],
  [/\bdogs\b/gi, "anjing"],
  [/\bcats\b/gi, "kucing"],
  [/\bhorses\b/gi, "kuda"],
  [/\bcalves\b/gi, "pedet sapi"],
  [/\brabbits\b/gi, "kelinci"],
  [/\bguinea pigs\b/gi, "marmut"],
  [/\bferrets\b/gi, "musang (ferret)"],
  [/\bpuppies\b/gi, "anak anjing (puppy)"],
  [/\bkittens\b/gi, "anak kucing (kitten)"],

  // Medical terms
  [/\btreatment of\b/gi, "pengobatan"],
  [/\bmanagement of\b/gi, "penanganan"],
  [/\bprevention of\b/gi, "pencegahan"],
  [/\bdiagnosis of\b/gi, "diagnosis"],
  [/\binfection\b/gi, "infeksi"],
  [/\binfections\b/gi, "infeksi"],
  [/\binflammation\b/gi, "inflamasi / peradangan"],
  [/\bpain\b/gi, "nyeri"],
  [/\bfever\b/gi, "demam"],
  [/\bvomiting\b/gi, "muntah"],
  [/\bdiarrhea\b/gi, "diare"],
  [/\bdiarrhoea\b/gi, "diare"],
  [/\bnausea\b/gi, "mual"],
  [/\banorexia\b/gi, "kehilangan nafsu makan (anoreksia)"],
  [/\blethargy\b/gi, "lemas / letargi"],
  [/\bpruritus\b/gi, "rasa gatal (pruritus)"],
  [/\baldosterone\b/gi, "aldosteron"],
  [/\bkidney disease\b/gi, "penyakit ginjal"],
  [/\brenal failure\b/gi, "gagal ginjal"],
  [/\bliver disease\b/gi, "penyakit hepar"],
  [/\bheart failure\b/gi, "gagal jantung"],
  [/\bcardiac disease\b/gi, "penyakit kardiovaskular"],
  [/\barrhythmias\b/gi, "aritmia jantung"],
  [/\bhypertension\b/gi, "tekanan darah tinggi (hipertensi)"],
  [/\bhypotension\b/gi, "tekanan darah rendah (hipotensi)"],
  [/\banaesthesia\b/gi, "anestesi"],
  [/\banesthesia\b/gi, "anestesi"],
  [/\bsedation\b/gi, "sedasi (penenang)"],
  [/\banalgesia\b/gi, "analgesia (pereda rasa sakit)"],
  [/\bantibiotic\b/gi, "antibiotik"],
  [/\bantibacterial\b/gi, "antibakteri"],
  [/\bantifungal\b/gi, "antijamur"],
  [/\bantiparasitic\b/gi, "antiparasit"],
  [/\banthelmintic\b/gi, "antelmintik (obat cacing)"],
  [/\bcorticosteroid\b/gi, "kortikosteroid"],
  [/\bglucocorticoid\b/gi, "glukokortikoid"],

  // Routes
  [/\borally\b/gi, "secara oral (p.o.)"],
  [/\bintravenously\b/gi, "secara intravena (i.v.)"],
  [/\bintramuscularly\b/gi, "secara intramuskular (i.m.)"],
  [/\bsubcutaneously\b/gi, "secara subkutan (s.c.)"],
  [/\btopically\b/gi, "secara topikal"],

  // Modifiers
  [/\bcontraindicated\b/gi, "dikontraindikasikan"],
  [/\brecommended\b/gi, "direkomendasikan"],
  [/\beffective\b/gi, "efektif"],
  [/\bcaution\b/gi, "kehati-hatian"],
  [/\bprolonged use\b/gi, "penggunaan jangka panjang"],
  [/\brapidly absorbed\b/gi, "diserap dengan cepat"],
  [/\bexcreted in urine\b/gi, "diekskresikan melalui urin"],
  [/\bmetabolized in the liver\b/gi, "dimetabolisme di organ hepar"],
  [/\bhalf-life\b/gi, "waktu paruh eliminasi"]
];

function translateToIndonesian(text) {
  if (!text || typeof text !== 'string') return '';

  let res = text;
  // Apply phrase replacements
  for (const [pattern, repl] of PHRASE_TRANSLATIONS) {
    res = res.replace(pattern, repl);
  }
  // Apply word replacements
  for (const [pattern, repl] of WORD_DICTIONARY) {
    res = res.replace(pattern, repl);
  }

  // Common sentence beginnings
  res = res.replace(/\bUsed for the treatment of\b/gi, "Digunakan untuk pengobatan");
  res = res.replace(/\bUsed for\b/gi, "Digunakan untuk");
  res = res.replace(/\bIndicated for\b/gi, "Diindikasikan untuk");
  res = res.replace(/\bIndicated in\b/gi, "Diindikasikan pada");
  res = res.replace(/\bAlso used in\b/gi, "Juga digunakan pada");
  res = res.replace(/\bNot indicated for\b/gi, "Tidak diindikasikan untuk");
  res = res.replace(/\bMay cause\b/gi, "Dapat menyebabkan");
  res = res.replace(/\bCan cause\b/gi, "Dapat memicu timbulnya");
  res = res.replace(/\bAssociated with\b/gi, "Berhubungan dengan");

  return res.trim();
}

console.log('Testing translation sample...');
const sampleEn = "Bactericidal antibiotic that inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins involved in bacterial cell wall synthesis, thereby decreasing cell wall strength and causing cell lysis. Treatment of susceptible Gram-positive and select Gram-negative bacterial infections: respiratory tract infections, urinary tract infections, skin and soft tissue infections in dogs and cats.";
console.log('EN:', sampleEn);
console.log('\nID:', translateToIndonesian(sampleEn));
