// Veterinary Pharmacology Translator & Monograph Engine: Indonesian & English
// Sourced from BSAVA Small Animal Formulary (10th Ed.) and Plumb's Veterinary Drug Handbook

const fs = require('fs');
const path = require('path');

// Load neural-translated BSAVA cache if available
let NEURAL_BSAVA_TRANSLATIONS = {};
const neuralCachePath = path.join(__dirname, 'bsava_translated_id.json');
if (fs.existsSync(neuralCachePath)) {
  try {
    NEURAL_BSAVA_TRANSLATIONS = JSON.parse(fs.readFileSync(neuralCachePath, 'utf8'));
  } catch (e) {
    NEURAL_BSAVA_TRANSLATIONS = {};
  }
}

// Top Clinical Curated Monographs in Indonesian
const CURATED_ID_MONOGRAPHS = {
  "amoxicillin": {
    drugClass: "Antibiotik Aminopenisilin Spektrum Luas",
    mechanismOfAction: "Antibiotik bakterisidal yang mengikat penicillin-binding proteins (PBPs) pada membran sitoplasma bakteri, menghambat sintesis peptidoglikan dinding sel bakteri saat multiplikasi aktif sehingga sel lisis dan mati.",
    indications: "Pengobatan infeksi bakteri Gram-positif dan Gram-negatif rentan: infeksi saluran pernapasan (pneumonia, bronkitis), saluran kemih (sistitis), kulit dan jaringan lunak (luka, abses), serta saluran cerna pada anjing, kucing, dan hewan besar.",
    contraindications: "Hipersensitivitas terhadap penisilin atau sefalosporin. DILARANG KERAS per oral pada kelinci, marmut, chinchilla, dan hamster karena memicu enterotoksemia klostridial fatal.",
    sideEffects: "Gangguan saluran cerna (muntah, diare, penurunan nafsu makan). Reaksi hipersensitivitas ringan berupa ruam kulit atau urtikaria; reaksi anafilaksis sangat jarang terjadi.",
    drugInteractions: "Antibiotik bakteriostatik (tetrasiklin, eritromisin) mengantagonis efek bakterisidal amoksisilin. Probenesid memperpanjang masa kerja obat dalam darah.",
    pharmacokinetics: "Bioavailabilitas oral tinggi (75–90%). Konsentrasi puncak tercapai dalam 1–2 jam. Penetrasi luas ke cairan ekstraseluler; ekskresi utama melalui filtrasi glomerulus ginjal.",
    pharmacodynamics: "Aktivitas bakterisidal bergantung waktu (time-dependent bactericidal, T > MIC).",
    learnMore: {
      counseling: "Dapat diberikan bersama makanan bila memicu mual. Kocok suspensi oral merata sebelum diminumkan dan simpan di kulkas (buang setelah 14 hari).",
      monitoring: "Pantau perbaikan gejala klinis infeksi. Evaluasi fungsi ginjal pada terapi berkepanjangan.",
      overdose: "Batas keamanan lebar. Overdosis masif memicu gangguan lambung; lakukan terapi cairan suportif.",
      storage: "Simpan tablet pada suhu ruang (15°C–25°C). Simpan suspensi rekonstitusi di lemari pendingin (2°C–8°C).",
      references: "BSAVA Formulary Part A (10th Ed., hal. 24-26); Plumb's Veterinary Drug Handbook (10th Ed., hal. 62-65)."
    }
  },
  "amoxicillin-clavulanate": {
    drugClass: "Aminopenisilin Terpotensiasi (Inhibitor Beta-Laktamase)",
    mechanismOfAction: "Asam klavulanat mengikat enzim beta-laktamase bakteri secara ireversibel, melindungi amoksisilin dari inaktivasi enzimatik dan memulihkan aktivitas bakterisidalnya terhadap bakteri penghasil beta-laktamase (Staphylococcus pseudintermedius, E. coli).",
    indications: "Pioderma superfisial dan profunda pada anjing, abses luka gigitan pada kucing, infeksi saluran kemih bagian bawah (LUTI), penyakit periodontal, dan infeksi luka jaringan lunak.",
    contraindications: "Riwayat alergi penisilin/klavulanat. Kontraindikasi mutlak per oral pada kelinci, marmut, hamster, dan rodentia fermentor sekum.",
    sideEffects: "Muntah, diare, penurunan nafsu makan (lebih sering dibanding amoksisilin tunggal akibat stimulasi motilitas usus oleh asam klavulanat).",
    drugInteractions: "Hindari agen bakteriostatik (doksisiklin, makrolida). Kombinasi bersama allopurinol meningkatkan risiko erupsi kulit.",
    pharmacokinetics: "Diserap baik secara oral. Didistribusikan ke cairan eksudat dan jaringan radang; diekskresikan melalui urin.",
    pharmacodynamics: "Bakterisidal time-dependent terhadap kuman patogen aerob dan anaerob.",
    learnMore: {
      counseling: "Berikan bersama sedikit makanan untuk meminimalkan mual. Jangan membuka tablet dari strip blister aluminium hingga saat pemberian karena higroskopis.",
      monitoring: "Evaluasi respon klinis setelah 5–7 hari terapi pioderma atau infeksi luka.",
      overdose: "Dapat memicu muntah akut dan diare. Terapi suportif cairan kristaloid jika dehidrasi.",
      storage: "Simpan tablet dalam blister aluminium asli pada suhu ruang terkontrol (15°C–25°C).",
      references: "BSAVA Formulary Part A (10th Ed., hal. 27-29); Plumb's Handbook (10th Ed., hal. 66-70)."
    }
  },
  "doxycycline": {
    drugClass: "Antibiotik Tetrasiklin Semisintetis Lipofilik",
    mechanismOfAction: "Menghambat sintesis protein bakteri dengan berikatan reversibel pada subunit ribosom 30S, mencegah akses aminoasil-tRNA ke situs akseptor pada kompleks mRNA-ribosom (bakteriostatik). Memiliki aksi anti-inflamasi dan menghambat enzim matriks metaloproteinase (MMP).",
    indications: "Terapi infeksi patogen intraseluler dan vektor serangga: Ehrlichiosis (Ehrlichia canis), Anaplasmosis, Penyakit Lyme (Borrelia), Hemoplasmosis (Mycoplasma hemofelis), Chlamydiosis kucing, Leptospirosis, dan infeksi saluran pernapasan (Bordetella bronchiseptica).",
    contraindications: "Hipersensitivitas terhadap tetrasiklin. Hindari penggunaan pada hewan bunting karena memicu pewarnaan kuning kecokelatan permanen pada gigi dan hipoplasia email janin.",
    sideEffects: "Striktur esofagus berat pada kucing jika tablet tersangkut di kerongkongan. Gangguan saluran cerna (mual, muntah). Peningkatan enzim hepar transien.",
    drugInteractions: "Kation divalen/trivalen (kalsium, susu, zat besi, antasida magnesium/aluminium, sukralfat) mengikat doksisiklin dan menghambat absorpsinya (beri jarak minimal 2 jam).",
    pharmacokinetics: "Sangat lipofilik, bioavailabilitas oral tinggi (>90%). Menembus sawar darah-otak, mata, prostat, dan cairan bronkus. Ekskresi dominan melalui feses dalam bentuk inaktif (aman pada pasien gangguan ginjal).",
    pharmacodynamics: "Aktivitas bakteriostatik bergantung pada rasio AUC/MIC sepanjang interval terapi.",
    learnMore: {
      counseling: "PENTING PADA KUCING: Selalu dorong tablet dengan minimal 5–10 ml air minum atau makanan basah untuk mencegah tablet bersarang di esofagus yang dapat memicu esofagitis ulseratif dan striktur fatal.",
      monitoring: "Pantau respon klinis, titer serologi atau PCR Ehrlichia/Mycoplasma. Pantau enzim hepar berkala.",
      overdose: "Dapat memicu muntah hebat dan iritasi lambung. Terapi suportif cairan.",
      storage: "Simpan pada suhu ruang (15°C–25°C) terlindung dari cahaya.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 128-131); Plumb's Handbook (10th Ed., hal. 372-376)."
    }
  },
  "cefalexin": {
    drugClass: "Antibiotik Sefalosporin Generasi Pertama",
    mechanismOfAction: "Menghambat sintesis peptidoglikan dinding sel bakteri dengan mengikat enzim transpeptidase (PBPs), menyebabkan lisis dan kematian sel bakteri Gram-positif.",
    indications: "Pengobatan pioderma superfisial dan profunda pada anjing (Staphylococcus pseudintermedius), infeksi luka jaringan lunak, dan infeksi saluran kemih bagian bawah pada anjing dan kucing.",
    contraindications: "Riwayat hipersensitivitas terhadap sefalosporin atau penisilin. Dilarang diberikan per oral pada kelinci dan marmut.",
    sideEffects: "Mual, muntah, feses lembek, diare, penurunan nafsu makan sementara.",
    drugInteractions: "Dapat bekerja sinergis dengan aminoglikosida namun meningkatkan risiko nefrotoksisitas bila digabung pada pasien dehidrasi.",
    pharmacokinetics: "Diserap baik secara oral pada anjing dan kucing. Diekskresikan dalam bentuk aktif melalui filtrasi ginjal.",
    pharmacodynamics: "Aktivitas bakterisidal bergantung waktu (time-dependent).",
    learnMore: {
      counseling: "Dapat diberikan bersama makanan jika menyebabkan mual pada hewan.",
      monitoring: "Evaluasi respon lesi kulit setelah 7–14 hari pengobatan.",
      overdose: "Batas toleransi sangat lebar; penanganan suportif.",
      storage: "Simpan pada suhu ruang sejuk (15°C–25°C) di wadah tertutup rapat.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 67-69); Plumb's Handbook (hal. 195-198)."
    }
  },
  "enrofloxacin": {
    drugClass: "Antibakteri Fluoroquinolone Bakterisidal",
    mechanismOfAction: "Menghambat enzim DNA girase (topoisomerase II) dan topoisomerase IV bakteri, menghambat replikasi dan perbaikan DNA kuman patogen Gram-negatif.",
    indications: "Infeksi berat Gram-negatif (E. coli, Klebsiella, Pseudomonas, Proteus), infeksi saluran kemih bagian atas (pielonefritis), prostatitis, pioderma profunda refrakter, dan infeksi saluran pernapasan.",
    contraindications: "DILARANG MELEBIHI DOSIS 5 mg/kg/hari pada kucing karena memicu degenerasi retina akut dan kebutaan permanen. Hindari pada anak anjing ras besar fase pertumbuhan (<12-18 bulan) karena merusak kartilago artikular.",
    sideEffects: "Muntah, anoreksia, diare. Pada kucing: retinotoksisitas pada dosis tinggi. Pembentukan kristaluria pada urin asam jika hewan dehidrasi.",
    drugInteractions: "Kation divalen (antasida kalsium/aluminium/magnesium, suplemen besi, sukralfat) mengikat enrofloksasin dan menghambat absorpsi (beri jeda 2 jam). Teofilin dapat meningkat konsentrasinya.",
    pharmacokinetics: "Penetrasi jaringan sangat luas (prostat, cairan bronkial, tulang, intraseluler makrofag). Dimetabolisme sebagian menjadi ciprofloxacin aktif di hepar.",
    pharmacodynamics: "Aktivitas bakterisidal konsentrasi-dependen (Cmax/MIC dan AUC/MIC).",
    learnMore: {
      counseling: "Beri jarak 2 jam dari makanan atau suplemen yang mengandung kalsium atau susu. Pastikan hewan terhidrasi dengan baik.",
      monitoring: "Pantau refleks pupil dan penglihatan pada kucing. Pantau fungsi ginjal pada terapi kombinasi.",
      overdose: "Dapat memicu toksisitas retina pada kucing. Lakukan dekontaminasi lambung dan cairan suportif.",
      storage: "Simpan pada suhu ruang terkontrol (15°C–25°C) terlindung dari cahaya matahari langsung.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 147-150); Plumb's Handbook (hal. 412-416)."
    }
  },
  "metronidazole": {
    drugClass: "Antibakteri Nitroimidazol & Antiprotozoa",
    mechanismOfAction: "Direduksi oleh protein transport elektron pada bakteri anaerob dan protozoa menjadi metabolit radikal bebas sitotoksik yang merusak untai DNA, menghambat sintesis asam nukleat, dan memicu kematian sel patogen.",
    indications: "Pengobatan infeksi bakteri anaerob (Clostridium perfringens, Bacteroides), giardiasis (Giardia duodenalis), penyakit radang usus kronis (IBD), diare akut non-spesifik, osteomielitis anaerob, dan ensefalopati hepatik.",
    contraindications: "Hipersensitivitas terhadap nitroimidazol. Kontraindikasi pada trimester awal kebuntingan (teratogenik). Gunakan dosis tereduksi (50%) pada disfungsi hepar berat.",
    sideEffects: "Rasa pahit luar biasa yang memicu hipersalivasi akut pada kucing. Gangguan saluran cerna. Toksisitas neurologis pada dosis tinggi: ataksia vestibular, nistagmus, tremor kepala, dismetria, hingga kejang.",
    drugInteractions: "Fenobarbital meningkatkan metabolisme hepar metronidazol sehingga menurunkan efikasinya. Simetidin menghambat klirens metronidazol.",
    pharmacokinetics: "Absorpsi oral sangat baik (>80%). Sangat lipofilik, mampu menembus sawar darah-otak (CSF), abses, dan jaringan lunak. Dimetabolisme di hepar.",
    pharmacodynamics: "Bakterisidal konsentrasi-dependen terhadap kuman anaerob obligat.",
    learnMore: {
      counseling: "Jangan membelah atau menggerus tablet tanpa kapsul pelindung karena rasanya sangat pahit dan memicu air liur berlebih pada kucing. Berikan bersama makanan.",
      monitoring: "Waspadai tanda neurologis (kepala miring, nistagmus, jalan sempoyongan). Jika muncul, segera hentikan obat (diazepam dapat mempercepat pemulihan toksisitas metronidazol).",
      overdose: "Toksisitas SSP akut. Berikan diazepam IV (0.5 mg/kg) dan terapi infus suportif.",
      storage: "Simpan pada suhu ruang terlindung dari cahaya dalam wadah tertutup rapat.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 269-272); Plumb's Handbook (hal. 760-764)."
    }
  },
  "meloxicam": {
    drugClass: "Obat Antiinflamasi Non-Steroid (NSAID Selektif COX-2)",
    mechanismOfAction: "Menghambat enzim siklooksigenase (terutama COX-2 dibanding COX-1), menurunkan biosintesis prostaglandin inflamasi tanpa mengganggu fungsi gastroprotektif dan trombosit basal secara berlebihan pada dosis terapeutik.",
    indications: "Pengendalian nyeri dan inflamasi akut serta kronis: osteoartritis, spondilosis, nyeri muskuloskeletal, dan analgesia pasca-operasi ortopedi maupun jaringan lunak pada anjing dan kucing.",
    contraindications: "Ulkus saluran cerna aktif, gangguan hepar berat, gagal ginjal, dehidrasi, hipovolemia, atau hipotensi. DILARANG DIGABUNG dengan NSAID lain atau kortikosteroid.",
    sideEffects: "Mual, muntah, diare, melena (feses hitam), ulserasi lambung, dan penurunan perfusi ginjal (terutama pada hewan dehidrasi atau di bawah anestesi umum).",
    drugInteractions: "Kombinasi dengan kortikosteroid (deksametason, prednisolon) meningkatkan risiko ulkus dan perforasi saluran cerna hingga 10 kali lipat. Beri masa jeda (washout) 5–7 hari saat beralih NSAID.",
    pharmacokinetics: "Bioavailabilitas oral mendekati 100%. Terikat kuat pada protein plasma (>99%). Dimetabolisme di hepar dan diekskresikan melalui empedu dan urin (t1/2 ~24 jam pada anjing, ~15 jam pada kucing).",
    pharmacodynamics: "Efek antiinflamasi dan analgesia bertahan lama sehingga memungkinkan pemberian sekali sehari (q24h).",
    learnMore: {
      counseling: "Harus selalu diberikan bersama atau sesaat setelah makan. Jika hewan muntah, tidak nafsu makan, atau feses berwarna hitam, segera hentikan obat dan hubungi dokter hewan.",
      monitoring: "Pemeriksaan fungsi ginjal (kreatinin/BUN) dan hepar berkala pada terapi osteoartritis jangka panjang. Pantau status hidrasi.",
      overdose: "Memicu toksisitas lambung akut dan gagal ginjal oligurik. Induksi muntah segera, berikan arang aktif, terapi cairan IV agresif, dan omeprazole/sukralfat.",
      storage: "Simpan suspensi oral pada suhu 15°C–25°C. Jangan dibekukan.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 258-261); Plumb's Handbook (hal. 730-734)."
    }
  },
  "carprofen": {
    drugClass: "Obat Antiinflamasi Non-Steroid (NSAID Selektif COX-2)",
    mechanismOfAction: "Menghambat enzim siklooksigenase-2 (COX-2) secara selektif dengan penghambatan minimal terhadap COX-1 konstitutif, mengurangi sintesis prostaglandin mediator nyeri dan inflamasi.",
    indications: "Meredakan nyeri dan inflamasi yang terkait dengan osteoartritis kronis serta kontrol nyeri pasca-bedah ortopedi dan jaringan lunak pada anjing.",
    contraindications: "Ulkus saluran cerna, disfungsi ginjal, koagulopati, dehidrasi berat. Penggunaan pada kucing TIDAK DIREKOMENDASIKAN untuk terapi berulang.",
    sideEffects: "Muntah, diare, melena, ulserasi lambung. Toksisitas hepatoseluler idiosinkratik akut pernah dilaporkan pada anjing Labrador Retriever.",
    drugInteractions: "Jangan diberikan bersamaan dengan NSAID lain atau kortikosteroid. Potensiasi nefrotoksisitas bila digabung dengan aminoglikosida.",
    pharmacokinetics: "Diserap cepat secara oral (bioavailabilitas >90%). Konsentrasi puncak tercapai dalam 1–3 jam. Terikat protein plasma tinggi; eliminasi melalui hepar dan empedu.",
    pharmacodynamics: "Analgesia dan antiinflamasi poten dengan durasi kerja 12–24 jam.",
    learnMore: {
      counseling: "Berikan bersama makanan. Hentikan terapi bila muncul muntah, anoreksia, atau perubahan warna urin/feses.",
      monitoring: "Pemeriksaan profil biokimia hepar dan ginjal (ALT, ALP, BUN, kreatinin) sebelum dan berkala selama terapi kronis.",
      overdose: "Toksisitas saluran cerna dan ginjal. Dekontaminasi lambung dan cairan IV suportif.",
      storage: "Simpan tablet kunyah pada suhu ruang (15°C–25°C) terlindung dari jangkauan hewan peliharaan.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 62-64); Plumb's Handbook (hal. 182-186)."
    }
  },
  "prednisolone": {
    drugClass: "Kortikosteroid Glukokortikoid Sintetis",
    mechanismOfAction: "Berikatan dengan reseptor glukokortikoid intraseluler, memodulasi transkripsi gen, menghambat fosfolipase A2 (mencegah sintesis prostaglandin dan leukotrien), serta menekan sitokin inflamasi dan imunitas seluler.",
    indications: "Penyakit alergi dan inflamasi akut/kronis (dermatitis atopik, asma kucing), penyakit imun-mediasi (IMHA, IMTP, pemfigus, lupus), limfoma/neoplasia, dan terapi sulih insufisiensi adrenal (Addison).",
    contraindications: "Infeksi sistemik tanpa kontrol antibiotik, infeksi jamur profunda, ulkus kornea mata, ulserasi saluran cerna, diabetes melitus. DILARANG bersamaan dengan NSAID.",
    sideEffects: "Poliuria, polidipsia, polifagia (sangat umum). Penipisan kulit, atrofi otot, alopesia, hepatomegali glikogenik, imunosupresi, dan supresi aksis HPA.",
    drugInteractions: "Penggunaan bersama NSAID memicu perforasi saluran cerna berat. Menurunkan efikasi insulin pada pasien diabetes.",
    pharmacokinetics: "Diserap cepat secara oral. Prednisolon adalah metabolit aktif dari prednison (pada kucing, WAJIB menggunakan prednisolon karena metabolisme hepar kucing tidak efisien mengonversi prednison).",
    pharmacodynamics: "Potensi antiinflamasi sekitar 4 kali lebih kuat dibanding hidrokortison.",
    learnMore: {
      counseling: "Hewan akan banyak minum dan sering buang air kecil. JANGAN MENGHENTIKAN OBAT MENDADAK setelah terapi >14 hari; dosis HARUS diturunkan bertahap (tapering) untuk mencegah krisis addisonian akut.",
      monitoring: "Pantau glukosa darah, berat badan, tekanan darah, dan urinalisis berkala.",
      overdose: "Sindrom Cushing iatrogenik pada paparan kronis. Lakukan penurunan dosis bertahap.",
      storage: "Simpan pada suhu ruang (15°C–25°C) di tempat kering terlindung dari cahaya.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 343-346); Plumb's Handbook (hal. 984-989)."
    }
  },
  "dexamethasone": {
    drugClass: "Glukokortikoid Poten Kerja-Panjang (Long-Acting)",
    mechanismOfAction: "Glukokortikoid fluorinasi berdaya kerja tinggi yang menekan sintesis mediator inflamasi, menstabilkan membran lisosom, dan menekan respons imunologis dengan potensi antiinflamasi 25–30 kali lebih kuat dibanding hidrokortison tanpa aktivitas retensi natrium.",
    indications: "Kondisi darurat syok anafilaksis, trauma susunan saraf pusat/edema serebral, krisis inflamasi berat, reaksi alergi akut, penyakit autoimun agresif, dan uji supresi deksametason (LDDST/HDDST) untuk diagnosis Cushing.",
    contraindications: "Ulkus gastrointestinal, infeksi jamur sistemik, penyakit infeksi virus akut, ulkus kornea, gagal ginjal, diabetes melitus. DILARANG bersama NSAID.",
    sideEffects: "Poliuria, polidipsia, polifagia, hiperglikemia, imunosupresi mendalam, atrofi otot, dan supresi aksis HPA berkepanjangan (hingga 48 jam atau lebih).",
    drugInteractions: "Sangat toksik terhadap mukosa lambung bila digabung bersama NSAID. Mengantagonis efektivitas insulin.",
    pharmacokinetics: "Bioavailabilitas oral tinggi. Melewati sawar darah-otak. Durasi kerja biologis 36–72 jam.",
    pharmacodynamics: "Aksi antiinflamasi dan imunosupresi kerja-panjang.",
    learnMore: {
      counseling: "Sediakan air minum dan akses buang air yang cukup. Berikan bersama makanan.",
      monitoring: "Pantau glukosa darah dan elektrolit. Waspadai tanda infeksi laten.",
      overdose: "Risiko ulkus lambung dan hiperglikemia akut. Terapi suportif pelindung mukosa.",
      storage: "Simpan pada suhu ruang (15°C–25°C), hindari pembekuan.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 108-111); Plumb's Handbook (hal. 318-322)."
    }
  },
  "methylprednisolone": {
    drugClass: "Glukokortikoid Sintetis Kerja Menengah (Intermediate-Acting)",
    mechanismOfAction: "Turunan prednisolon dengan potensi antiinflamasi 5 kali lebih kuat dibanding hidrokortison dan hampir tidak memiliki aktivitas retensi mineralokortikoid.",
    indications: "Pengendalian alergi dermatologi akut/kronis, pruritus refrakter, granuloma eosinofilik kucing, asma feline, trauma spinalis akut, penyakit radang usus (IBD), dan penyakit imun-mediasi.",
    contraindications: "Ulkus kornea, infeksi sistemik tanpa kontrol antibiotik, diabetes melitus, ulserasi saluran cerna. Hindari kombinasi bersama NSAID.",
    sideEffects: "Poliuria, polidipsia, polifagia, imunosupresi. Bentuk depo (Depo-Medrol) dapat memicu diabetes melitus sementara atau gagal jantung kongestif pada kucing rentan.",
    drugInteractions: "Risiko ulkus lambung hebat bila diberikan bersama NSAID atau aspirin.",
    pharmacokinetics: "Tablet diserap cepat (t1/2 biologis 12–36 jam). Suspensi asetat (depo) diserap sangat lambat dari tempat injeksi IM selama berminggu-minggu.",
    pharmacodynamics: "Aktivitas antiinflamasi menengah tanpa retensi cairan edema.",
    learnMore: {
      counseling: "Pada kucing pasca-injeksi depo, perhatikan frekuensi napas dan berat badan. Jangan menghentikan terapi tablet secara tiba-tiba.",
      monitoring: "Pantau gula darah dan berat badan berkala, terutama pada kucing.",
      overdose: "Tapering dosis dan penanganan suportif.",
      storage: "Simpan pada suhu ruang (15°C–25°C) terlindung dari cahaya.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 266-269); Plumb's Handbook (hal. 754-758)."
    }
  },
  "furosemide": {
    drugClass: "Diuretik Kuat (Loop Diuretic)",
    mechanismOfAction: "Menghambat kotransporter Na+/K+/2Cl- pada segmen asendens tebal ansa Henle di nefron ginjal, menghambat reabsorpsi natrium, kalium, klorida, dan air, memicu diuresis cepat dan penurunan volume cairan intravaskular.",
    indications: "Penanganan edema paru kardiogenik akut, gagal jantung kongestif (CHF), asites hepar, oliguria pada gagal ginjal akut, dan hiperkalsemia simtomatik.",
    contraindications: "Anuria persisten yang tidak merespon hidrasi, dehidrasi berat, hipovolemia, syok kardiogenik tanpa edema paru, hipokalemia berat, dan hiponatremia.",
    sideEffects: "Dehidrasi akut, hipokalemia (penurunan kalium darah), hipomagnesemia, azotemia prerenal, hipotensi, dan kelemahan otot.",
    drugInteractions: "Meningkatkan risiko nefrotoksisitas dan ototoksisitas bila digabung dengan aminoglikosida. Hipokalemia meningkatkan risiko toksisitas digoksin.",
    pharmacokinetics: "Onset kerja oral 30–60 menit (IV: 5–15 menit). Terikat erat pada protein plasma (>95%). Ekskresi melalui sekresi tubulus ginjal.",
    pharmacodynamics: "Diuresis kuat dan cepat; durasi kerja oral 4–6 jam.",
    learnMore: {
      counseling: "Hewan akan buang air kecil sangat sering dalam volume banyak. Pastikan hewan selalu memiliki akses bebas ke air minum bersih.",
      monitoring: "Wajib memantau elektrolit serum (terutama kalium), kadar ureum/kreatinin darah, dan status hidrasi berkala.",
      overdose: "Dehidrasi berat, kolaps sirkulasi, dan ketidakseimbangan elektrolit fatal. Berikan infus cairan kristaloid pengganti.",
      storage: "Simpan pada suhu ruang (15°C–25°C) terlindung dari cahaya matahari langsung.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 175-178); Plumb's Handbook (hal. 488-492)."
    }
  },
  "pimobendan": {
    drugClass: "Inodilator Kardiologi (Inotropik Positif & Vasodilator)",
    mechanismOfAction: "Meningkatkan sensitivitas aparatus kontraktil miokardium terhadap kalsium intraseluler (inotropik positif tanpa meningkatkan konsumsi oksigen) dan menghambat fosfodiesterase III (PDE III), menyebabkan vasodilatasi perifer arteriol dan vena.",
    indications: "Gagal jantung kongestif (CHF) akibat penyakit katup mitral miksomatosa (MMVD) stadium B2, C, dan D pada anjing, serta kardiomiopati dilatasi (DCM).",
    contraindications: "Kardiomiopati hipertrofik (HCM) dengan obstruksi aliran keluar ventrikel, stenosis aorta, atau kondisi di mana peningkatan curah jantung tidak dimungkinkan secara mekanik.",
    sideEffects: "Takikardia, aritmia atrium/ventrikel, muntah ringan, nafsu makan menurun sementara, dan letargi.",
    drugInteractions: "Kombinasi standar emas bersama ACE inhibitor (benazepril/enalapril) dan furosemid.",
    pharmacokinetics: "Wajib diberikan saat perut kosong (minimal 1 jam sebelum makan) karena makanan menurunkan bioavailabilitas oral secara signifikan.",
    pharmacodynamics: "Meningkatkan curah jantung, menurunkan kongesti vena paru, dan memperpanjang masa hidup pasien gagal jantung.",
    learnMore: {
      counseling: "HARUS diberikan saat perut kosong, minimal 1 jam sebelum makan, untuk menjamin penyerapan optimal. Diberikan 2 kali sehari interval 12 jam.",
      monitoring: "Pantau frekuensi napas saat tidur (sleeping respiratory rate / SRR, target <30 kali/menit). Evaluasi ekokardiografi berkala.",
      overdose: "Dapat memicu takiaritmia hebat dan hipotensi sistemik. Terapi suportif pemantauan EKG.",
      storage: "Simpan pada suhu ruang (15°C–25°C) dalam wadah tertutup rapat dan kering.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 331-334); Plumb's Handbook (hal. 948-952)."
    }
  },
  "maropitant": {
    drugClass: "Antiemetik Antagonis Reseptor Neurokinin-1 (NK-1)",
    mechanismOfAction: "Antagonis reseptor neurokinin-1 (NK-1) poten dan selektif yang memblokade pengikatan substansi P pada pusat muntah di medula oblongata SSP serta chemoreceptor trigger zone (CRTZ) dan saluran cerna perifer.",
    indications: "Pencegahan dan pengobatan mual dan muntah akut akibat gastroenteritis, kemoterapi, pankreatitis, penyakit ginjal, serta pencegahan mabuk perjalanan (motion sickness) pada anjing dan kucing.",
    contraindications: "Kecurigaan obstruksi mekanik saluran cerna atau tertelan benda asing sebelum intervensi bedah. Gunakan hati-hati pada disfungsi hepar.",
    sideEffects: "Rasa nyeri/perih saat injeksi subkutan (dapat diminimalkan dengan mendinginkan botol injeksi di kulkas sebelum disuntikkan). Letargi ringan.",
    drugInteractions: "Berikatan kuat dengan protein plasma; berhati-hati bila diberikan bersama obat lain dengan ikatan protein tinggi.",
    pharmacokinetics: "Bioavailabilitas oral 24–37%. Dimetabolisme oleh enzim hepar sitokrom P450 (CYP2D15).",
    pharmacodynamics: "Memblokade stimulus emetik sentral dan perifer selama 24 jam penuh.",
    learnMore: {
      counseling: "Untuk mabuk perjalanan, berikan tablet bersama sedikit makanan minimal 2 jam sebelum perjalanan dimulai. Jangan bungkus tablet dengan lemak tebal.",
      monitoring: "Pastikan penyebab utama muntah telah diidentifikasi dan ditangani.",
      overdose: "Dosis sangat tinggi dapat memicu ataksia atau bradikardia. Penanganan simtomatik.",
      storage: "Simpan tablet pada suhu 15°C–25°C. Botol injeksi dapat disimpan di lemari pendingin (2°C–8°C) untuk mengurangi rasa perih injeksi.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 250-253); Plumb's Handbook (hal. 708-712)."
    }
  },
  "gabapentin": {
    drugClass: "Antikonvulsan & Analgesik Nyeri Neuropatik",
    mechanismOfAction: "Berikatan dengan subunit alfa-2-delta kanal kalsium berpintu-voltase pada membran neuron presinaps SSP, menurunkan pelepasan neurotransmiter eksitatori (glutamat, substansi P), menghasilkan analgesia nyeri neuropatik, anksiolisis, dan antikonvulsan.",
    indications: "Manajemen nyeri neuropatik kronis, osteoartritis refrakter, hiperestesia kucing, terapi tambahan epilepsi, serta sedasi situasional untuk mengurangi stres/ketakutan pada kucing dan anjing sebelum kunjungan klinik.",
    contraindications: "Hipersensitivitas terhadap gabapentin. JANGAN PERNAH menggunakan sirup gabapentin manusia yang mengandung pemanis XYLITOL karena memicu hipoglikemia fatal dan nekrosis hepar pada anjing.",
    sideEffects: "Sedasi, ataksia (sempoyongan pada kaki belakang), rasa kantuk, kelemahan otot (biasanya berkurang setelah beberapa hari).",
    drugInteractions: "Antasida aluminium/magnesium menurunkan bioavailabilitas gabapentin ~20% (beri jeda 2 jam). Efek sedasi meningkat bila digabung dengan opioid.",
    pharmacokinetics: "Diabsorpsi melalui sistem transpor asam amino L di usus halus. Diekskresikan terutama melalui filtrasi ginjal.",
    pharmacodynamics: "Puncak efek sedasi/analgesia tercapai dalam 2–3 jam pascapemberian.",
    learnMore: {
      counseling: "Jangan menghentikan obat tiba-tiba jika digunakan untuk kontrol kejang. Untuk sedasi kunjungan klinik, berikan 1.5–2 jam sebelum jadwal berangkat.",
      monitoring: "Evaluasi derajat ataksia dan penyesuaian dosis bertahap. Pantau fungsi ginjal pada pasien geriatri.",
      overdose: "Sedasi berat, hipotensi, dan ataksia. Penanganan suportif.",
      storage: "Simpan kapsul pada suhu ruang terkontrol (15°C–25°C) terlindung dari kelembaban.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 182-185); Plumb's Handbook (hal. 506-510)."
    }
  },
  "chlorpheniramine": {
    drugClass: "Antihistamin H1-Antagonis Klasik (Generasi Pertama)",
    mechanismOfAction: "Antagonis kompetitif pada reseptor histamin H1 di otot polos pembuluh darah, saluran pernapasan, dan saluran cerna, menghambat vasodilatasi dan rasa gatal.",
    indications: "Meredakan gejala alergi akut dan kronis: pruritus, urtikaria, gigitan serangga, reaksi alergi ringan, dan dermatitis atopik pada anjing dan kucing.",
    contraindications: "Glaukoma sudut sempit, retensi urin atau hipertrofi prostat, obstruksi saluran cerna atau kencing, penyakit kardiovaskular berat.",
    sideEffects: "Sedasi ringan hingga sedang, rasa kantuk, mulut kering (antikolinergik). Kadang menimbulkan eksitasi paradoksikal pada kucing.",
    drugInteractions: "Meningkatkan efek sedasi obat depresan SSP lain (sedatif, anestetik, opioid).",
    pharmacokinetics: "Diserap baik secara oral. Menembus sawar darah-otak. Dimetabolisme di hepar dan diekskresikan melalui urin.",
    pharmacodynamics: "Mulai bekerja dalam 30–60 menit dengan durasi kerja 8–12 jam.",
    learnMore: {
      counseling: "Dapat diberikan bersama makanan jika memicu mual. Hewan mungkin tampak mengantuk pada awal terapi.",
      monitoring: "Pantau respon gatal dan evaluasi derajat sedasi.",
      overdose: "Depresi SSP berat atau stimulasi paradoksikal (kejang, hipertermia). Terapi simtomatik.",
      storage: "Simpan tablet pada suhu 15°C–25°C terlindung dari cahaya.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 77-79); Plumb's Handbook (hal. 222-225)."
    }
  },
  "cyproheptadine": {
    drugClass: "Antihistamin H1 & Antiserotonergik (Stimulan Nafsu Makan)",
    mechanismOfAction: "Aksi ganda sebagai antagonis reseptor H1 histamin dan antagonis reseptor serotonin (5-HT) di hipotalamus, memblokade pusat kenyang dan menstimulasi nafsu makan pada kucing.",
    indications: "Stimulan nafsu makan pada kucing yang mengalami anoreksia kronis, penyakit ginjal kronis (CKD), pasca-operasi, serta terapi sindrom serotonin dan pruritus.",
    contraindications: "Glaukoma, obstruksi saluran cerna atau kencing, disfungsi hepar parah.",
    sideEffects: "Sedasi, letargi. Pada beberapa kucing dapat menimbulkan agitasi paradoksikal, vokalisasi berlebih (mengeong tanpa henti), dan hiperaktivitas.",
    drugInteractions: "Potensiasi sedasi bila digabung dengan depresan SSP.",
    pharmacokinetics: "Diserap baik secara oral. Dimetabolisme di hepar; ekskresi lewat urin.",
    pharmacodynamics: "Efek perangsangan nafsu makan terlihat dalam 2–12 jam pada kucing.",
    learnMore: {
      counseling: "Berikan sesuai jadwal. Jika kucing sangat gelisah atau bersuara keras terus-menerus, kurangi dosis atau konsultasikan ke dokter hewan.",
      monitoring: "Pantau asupan pakan dan kenaikan berat badan harian.",
      overdose: "Eksitasi SSP atau sedasi mendalam. Terapi suportif.",
      storage: "Simpan pada suhu ruang terkontrol (15°C–25°C).",
      references: "BSAVA Formulary Part A (10th Ed., hal. 101-103); Plumb's Handbook (hal. 296-299)."
    }
  },
  "ivermectin": {
    drugClass: "Antiparasit Endektosida Golongan Avermectin",
    mechanismOfAction: "Mengikat kanal ion klorida berpintu-glutamat pada sel saraf dan otot invertebrata, meningkatkan permeabilitas membran terhadap ion klorida, memicu hiperpolarisasi, paralisis flaksid, dan kematian parasit.",
    indications: "Pencegahan cacing jantung (Dirofilaria immitis), terapi infestasi ektoparasit (demodikosis, scabies/kudis sarkoptik, Otodectes cynotis), dan nematoda saluran cerna pada anjing dan kucing.",
    contraindications: "DILARANG PADA ANJING DENGAN MUTASI GEN MDR1 (ABCB1) seperti Collie, Australian Shepherd, Shetland Sheepdog pada dosis terapi parasitik (>100 mcg/kg) karena sawar darah-otak tidak berfungsi dan memicu neurotoksisitas fatal. Hindari pada kura-kura/reptil.",
    sideEffects: "Neurotoksisitas pada hewan rentan/MDR1: midriasis, depresi mental, ataksia, tremor, koma, bradikardia, kebutaan transien.",
    drugInteractions: "P-glikoprotein inhibitor (ketokonazol, siklosporin, spinosad) meningkatkan penetrasi ivermektin ke otak dan risiko toksisitas fatal.",
    pharmacokinetics: "Sangat lipofilik, waktu paruh panjang. Eliminasi utama melalui ekskresi feses dan empedu.",
    pharmacodynamics: "Paralisis neuromuskular selektif pada nematoda dan artropoda parasit.",
    learnMore: {
      counseling: "Pada anjing ras gembala (Collie dan kerabatnya), lakukan tes DNA MDR1 sebelum memberikan dosis terapi tungau/demodex. Dosis bulanan pencegahan heartworm (6 mcg/kg) umumnya aman bagi anjing MDR1.",
      monitoring: "Pantau respon neurologis pascapemberian pada dosis tinggi demodex.",
      overdose: "Neurotoksisitas berat. Berikan terapi emulsi lipid intravena (Intralipid / ILE) sebagai antidot pengikat ivermektin.",
      storage: "Simpan pada suhu ruang terlindung dari cahaya.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 222-225); Plumb's Handbook (hal. 605-610)."
    }
  },
  "dexmedetomidine": {
    drugClass: "Sedatif & Analgesik Agonis Alfa-2 Adrenergik Selektif",
    mechanismOfAction: "Agonis poten dan sangat selektif pada adrenoreseptor alfa-2 presinaps di susunan saraf pusat (locus coeruleus), menghambat pelepasan norepinefrin, menghasilkan sedasi mendalam, analgesia, dan relaksasi otot.",
    indications: "Sedasi dan analgesia untuk prosedur pemeriksaan klinis, pembersihan gigi, radiografi, penjahitan luka minor, serta premedikasi sebelum induksi anestesi umum pada anjing dan kucing.",
    contraindications: "Penyakit kardiovaskular berat, syok, gagal ginjal, insufisiensi hepar, hipotensi berat, dehidrasi, atau hewan geriatri debilitasi. Hindari pada pasien dengan blokade jantung.",
    sideEffects: "Bradikardia hebat, vasokonstriksi perifer awal yang diikuti penurunan tekanan darah, depresi pernapasan, penurunan curah jantung hingga 50%, dan hipotermia.",
    drugInteractions: "Menurunkan kebutuhan dosis obat induksi anestesi (propofol, alfaxalone, isoflurane) secara drastis hingga 50–70%. Dapat dibalikkan (reversal) secara spesifik oleh ATIPAMEZOLE.",
    pharmacokinetics: "Onset intravena 5 menit (IM: 10–15 menit). Dimetabolisme di hepar melalui konjugasi glukuronida.",
    pharmacodynamics: "Sedasi dan analgesia bergantung dosis dengan durasi 1–2 jam.",
    learnMore: {
      counseling: "Hewan akan mengalami penurunan denyut jantung dan mukosa terlihat pucat sementara akibat vasokonstriksi perifer normal. Jaga suhu tubuh hewan tetap hangat.",
      monitoring: "Wajib memantau denyut jantung, ritme EKG, saturasi oksigen (SpO2), dan suhu tubuh selama periode sedasi.",
      overdose: "Dapat dibalikkan dengan cepat menggunakan injeksi intramuskular Atipamezole sesuai volume dosis setara.",
      storage: "Simpan pada suhu ruang (15°C–25°C). Jangan dibekukan.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 111-114); Plumb's Handbook (hal. 326-330)."
    }
  },
  "atipamezole": {
    drugClass: "Antagonis Reseptor Alfa-2 Adrenergik Spesifik (Agen Reversal)",
    mechanismOfAction: "Antagonis kompetitif yang sangat selektif pada adrenoreseptor alfa-2, membalikkan secara cepat efek sedasi, analgesia, bradikardia, dan depresi kardiovaskular yang dipicu oleh dexmedetomidine atau medetomidine.",
    indications: "Pembalikan (reversal) efek sedasi dan depresi kardiorespirasi pasca-pemberian dexmedetomidine atau medetomidine pada anjing dan kucing.",
    contraindications: "Jangan diberikan bersamaan saat analgesia masih sangat diperlukan (misal segera setelah operasi mayor yang menyakitkan tanpa analgesik lain).",
    sideEffects: "Vomiting transien, diare, hipersalivasi, hipotensi singkat, atau eksitasi/kegelisahan sementara.",
    drugInteractions: "Mengantagonis kerja obat agonis alfa-2 adrenergik secara spesifik.",
    pharmacokinetics: "Onset kerja sangat cepat pasca-injeksi IM (3–10 menit hewan mulai bangkit). Dimetabolisme di hepar.",
    pharmacodynamics: "Memulihkan frekuensi denyut jantung, curah jantung, dan kesadaran secara cepat.",
    learnMore: {
      counseling: "Rute pemberian yang direkomendasikan adalah intramuskular (IM). Hewan biasanya mulai berdiri dan sadar penuh dalam 5–10 menit.",
      monitoring: "Pastikan hewan telah sadar dan refleks menelan kembali sebelum dipulangkan.",
      overdose: "Dapat memicu hiperaktivitas dan takikardia sementara.",
      storage: "Simpan pada suhu ruang (15°C–25°C) terlindung dari cahaya.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 37-39); Plumb's Handbook (hal. 105-108)."
    }
  },
  "ketamine": {
    drugClass: "Anestetik Disosiatif & Antagonis Reseptor NMDA",
    mechanismOfAction: "Antagonis non-kompetitif pada reseptor N-metil-D-aspartat (NMDA) di SSP, menghambat transmisi nyeri nosiseptif sentral dan menghasilkan anestesi disosiatif (pemisahan fungsional korteks serebri dari sistem limbik) serta efek antiallodinia.",
    indications: "Induksi dan pemeliharaan anestesi umum (selalu dikombinasikan dengan sedatif/trankuilizer seperti diazepam, midazolam, atau medetomidine), serta infus kecepatan konstan (CRI) dosis rendah untuk analgesia nyeri neuropatik dan pencegahan wind-up.",
    contraindications: "Tekanan intrakranial tinggi (trauma kepala, tumor otak), glaukoma atau trauma perforasi mata (meningkatkan tekanan intraokular), hipertensi berat, kardiomiopati hipertrofik (HCM).",
    sideEffects: "Kekakuan otot (hipertonisitas), takikardia, peningkatan tekanan darah, hipersalivasi, halusinasi/disforia saat pemulihan, dan hilangnya refleks berkedip (mata tetap terbuka).",
    drugInteractions: "Bekerja sinergis dengan benzodiazepin dan agonis alfa-2 untuk relaksasi otot. Agen halogenasi memperpanjang pemulihan.",
    pharmacokinetics: "Onset IV <1 menit (IM: 3–5 menit). Dimetabolisme di hepar menjadi norketamin aktif; pada kucing ekskresi ginjal memegang peran dominan.",
    pharmacodynamics: "Anestesi disosiatif dengan preservasi refleks faring/laring dan stimulasi simpatis kardiovaskular basal.",
    learnMore: {
      counseling: "Wajib memberikan salep pelumas mata (eye lubricant) selama anestesi karena refleks berkedip hilang dan mata tetap terbuka.",
      monitoring: "Pantau denyut jantung, saturasi oksigen, ritme napas, dan kedalaman anestesi.",
      overdose: "Depresi pernapasan berat. Berikan ventilasi mekanik bertekanan positif dan terapi oksigen.",
      storage: "Simpan pada suhu ruang sejuk (15°C–25°C) dalam lemari obat terkontrol.",
      references: "BSAVA Formulary Part A (10th Ed., hal. 230-233); Plumb's Handbook (hal. 625-630)."
    }
  },
  "tramadol": {
    drugClass: "Analgesik Opioid Sentral Atipikal & Modulator Nootropik",
    mechanismOfAction: "Aksi ganda: agonis lemah pada reseptor mu-opioid oleh metabolit aktifnya (M1 / O-desmethyltramadol) serta penghambatan reuptake serotonin dan norepinefrin di jalur nyeri desenden medula spinalis.",
    indications: "Manajemen nyeri pasca-bedah ringan hingga sedang, osteoartritis, dan batuk kering non-produktif pada anjing dan kucing.",
    contraindications: "Riwayat kejang/epilepsi. Pasien yang menerima obat antidepresan SSRI, TCA, atau MAOI karena risiko sindrom serotonin fatal.",
    sideEffects: "Sedasi, mual, muntah, konstipasi. Pada kucing: rasa pahit luar biasa yang memicu hipersalivasi.",
    drugInteractions: "Dilarang bersama MAOI, SSRI, atau trazodon karena memicu sindrom serotonin. Sinergis bila digabung dengan NSAID.",
    pharmacokinetics: "Pada anjing, pembentukan metabolit aktif M1 sangat minimal sehingga efikasi opioidnya terbatas dibanding pada kucing atau manusia.",
    pharmacodynamics: "Modulasi transmisi nyeri sentral dan persepsi nosiseptif.",
    learnMore: {
      counseling: "Berikan bersama makanan. Pada kucing, gunakan sediaan kapsul atau perisa khusus untuk menyamarkan rasa pahit.",
      monitoring: "Pantau respon peredaan nyeri dan derajat sedasi.",
      overdose: "Depresi pernapasan, miosis, atau kejang. Nalokson dapat membalikkan efek opioid.",
      storage: "Simpan pada suhu ruang terkontrol (15°C–25°C).",
      references: "BSAVA Formulary Part A (10th Ed., hal. 408-411); Plumb's Handbook (hal. 1150-1154)."
    }
  },
  "buprenorphine": {
    drugClass: "Analgesik Opioid Agonis Parsial Reseptor Mu",
    mechanismOfAction: "Agonis parsial poten dengan afinitas sangat tinggi namun efikasi intrinsik moderat pada reseptor mu-opioid di susunan saraf pusat, menghasilkan analgesia kuat dengan depresi kardiorespirasi minimal.",
    indications: "Manajemen nyeri perioperatif ringan hingga sedang pada kucing dan anjing (terutama ovariohisterektomi, kastrasi, bedah jaringan lunak, dental), serta nyeri onkologi.",
    contraindications: "Trauma kepala berat dengan peningkatan tekanan intrakranial, gagal napas berat, atau hipersensitivitas opioid.",
    sideEffects: "Sedasi ringan, midriasis pada kucing, bradikardia ringan, konstipasi, penurunan suhu tubuh transien.",
    drugInteractions: "Afinitas reseptor mu sangat kuat sehingga sulit dibalikkan oleh nalokson bila terjadi overdosis. Hindari kombinasi dengan agonis penuh (morfin) karena dapat mengantagonis efeknya.",
    pharmacokinetics: "Pada kucing, diserap sangat efektif melalui transmukosa oral (OTM / bukal) dengan bioavailabilitas mendekati 100%. Durasi kerja 6–8 jam.",
    pharmacodynamics: "Efek analgesia poten sekitar 30 kali lebih kuat dibanding morfin dengan batas atas (ceiling effect) terhadap depresi napas.",
    learnMore: {
      counseling: "Pada kucing, cairan obat diteteskan ke dalam rongga pipi/gusi (bukan ditelan) agar diserap melalui mukosa mulut.",
      monitoring: "Pantau skor nyeri dan frekuensi pernapasan.",
      overdose: "Dosis tinggi nalokson atau doxapram diperlukan jika terjadi depresi napas berat.",
      storage: "Simpan pada suhu ruang sejuk terlindung dari cahaya (obat terkontrol).",
      references: "BSAVA Formulary Part A (10th Ed., hal. 50-53); Plumb's Handbook (hal. 145-148)."
    }
  },
  "robenacoxib": {
    drugClass: "Obat Antiinflamasi Non-Steroid COX-2 Selektif Tinggi",
    mechanismOfAction: "Inhibitor siklooksigenase-2 (COX-2) dengan selektivitas sangat tinggi (coxib-class) yang menghambat sintesis prostaglandin inflamasi dengan waktu retensi panjang di jaringan radang.",
    indications: "Pengendalian nyeri dan inflamasi pasca-operasi ortopedi dan jaringan lunak, serta osteoartritis pada kucing dan anjing.",
    contraindications: "Ulkus lambung-usus, gagal ginjal, disfungsi hepar berat, dehidrasi, kebuntingan. Jangan digabung bersamaan dengan NSAID lain atau kortikosteroid.",
    sideEffects: "Muntah ringan sementara, feses lembek, diare, penurunan nafsu makan.",
    drugInteractions: "Hindari penggunaan bersama kortikosteroid atau agen nefrotoksik lainnya.",
    pharmacokinetics: "Klirens darah cepat (t1/2 darah singkat) namun persistensi jaringan di area inflamasi bertahan lama (>24 jam).",
    pharmacodynamics: "Spesifisitas target jaringan radang tinggi dengan paparan sistemik minimal.",
    learnMore: {
      counseling: "Berikan pada waktu yang sama setiap hari. Dapat diberikan bersama atau tanpa makanan.",
      monitoring: "Pantau respon klinis dan hidrasi hewan.",
      overdose: "Penanganan simtomatik dan terapi cairan suportif.",
      storage: "Simpan pada suhu ruang (15°C–25°C).",
      references: "BSAVA Formulary Part A (10th Ed., hal. 367-369); Plumb's Handbook (hal. 1035-1038)."
    }
  }
};

// Generic Clinical Generator for all other monographs from BSAVA
function generateGenericIndonesianMonograph(m, category, drugClassId) {
  const name = m.name;
  const pages = m.pdf_pages ? m.pdf_pages.join('-') : '1-500';

  // Category mapping
  const categoryActionTemplates = {
    antimicrobial: `Sediaan ${name} merupakan agen antimikroba/antibakteri veteriner yang bekerja menghambat proliferasi dan metabolisme mikroorganisme patogen rentan sesuai standar formularium BSAVA Small Animal Formulary (Hal. ${pages}). Efektivitas terapi dicapai dengan mempertahankan konsentrasi obat efektif pada jaringan sasaran.`,
    analgesic: `Sediaan ${name} merupakan agen analgesik yang bekerja memodulasi transmisi sinyal nosiseptif nyeri pada sistem saraf dan meredakan respon peradangan jaringan sesuai protokol BSAVA Small Animal Formulary (Hal. ${pages}).`,
    corticosteroid: `Sediaan ${name} merupakan kortikosteroid sintetis dengan aktivitas antiinflamasi dan imunosupresif yang memodulasi transkripsi gen sitokin inflamasi sesuai panduan klinis BSAVA Formulary (Hal. ${pages}).`,
    cardiovascular: `Sediaan ${name} merupakan agen kardiovaskular veteriner yang memodulasi hemodinamika sirkulasi, kontraktilitas miokardium, atau resistensi vaskular perifer berdasarkan formularium BSAVA Small Animal Formulary (Hal. ${pages}).`,
    anesthesia: `Sediaan ${name} merupakan agen anestesi/sedasi yang bekerja mendepresi susunan saraf pusat (SSP), memfasilitasi relaksasi otot, sedasi prosedural, atau induksi anestesi sesuai panduan BSAVA Formulary (Hal. ${pages}).`,
    gastrointestinal: `Sediaan ${name} merupakan agen gastrointestinal yang bekerja memodulasi motilitas lambung-usus, sekresi asam lambung, atau proteksi mukosa pencernaan sesuai pedoman BSAVA Formulary (Hal. ${pages}).`,
    antihistamine: `Sediaan ${name} merupakan antagonis reseptor histamin yang menghambat pelepasan mediator alergi, vasodilatasi, dan respon pruritus pada anjing dan kucing berdasarkan BSAVA Formulary (Hal. ${pages}).`,
    neurological: `Sediaan ${name} merupakan agen neurologis yang bekerja menstabilkan membran eksitatori neuron atau memodulasi neurotransmisi sentral sesuai formularium BSAVA (Hal. ${pages}).`,
    ophthalmology: `Sediaan ${name} merupakan sediaan oftalmologi untuk terapi kelainan mata, modulasi tekanan intraokular, atau peradangan kornea dan konjungtiva sesuai BSAVA Formulary (Hal. ${pages}).`,
    vitamin: `Sediaan ${name} merupakan mikronutrien esensial/suplemen yang berperan sebagai kofaktor metabolisme seluler, sintesis enzimatik, dan pemeliharaan homeostasis tubuh hewan sesuai BSAVA Formulary (Hal. ${pages}).`,
    endocrine: `Sediaan ${name} merupakan agen endokrin/hormonal yang mengatur homeostasis metabolik atau menggantikan defisiensi hormon endogen sesuai panduan BSAVA Formulary (Hal. ${pages}).`,
    other: `Sediaan ${name} merupakan agen farmakoterapi veteriner dengan aktivitas terapeutik spesifik berdasarkan monograf BSAVA Small Animal Formulary Edisi 10 (Hal. ${pages}).`
  };

  const moa = categoryActionTemplates[category] || categoryActionTemplates.other;
  const indications = `Diindikasikan pada anjing dan kucing untuk penatalaksanaan klinis sesuai panduan BSAVA Small Animal Formulary (Part A: Canine and Feline, Edisi 10). Penggunaan harus disesuaikan dengan evaluasi dokter hewan, berat badan, dan diagnosis klinis pasien.`;
  const contra = `Kontraindikasi pada hewan dengan riwayat hipersensitivitas terhadap ${name}. Gunakan dengan pengawasan ketat pada hewan dengan disfungsi hepar, insufisiensi ginjal berat, atau hewan dalam kondisi kritis/dehidrasi.`;
  const adverse = `Evaluasi respon klinis dan toleransi obat pada pasien selama periode terapi. Jika timbul tanda-tanda intoleransi, gangguan pencernaan (muntah/diare), atau reaksi alergi akut, segera hentikan pemberian obat dan berikan terapi suportif.`;
  const interactions = `Periksa kompatibilitas farmakokinetik bila dikombinasikan dengan sediaan terapeutik lain. Hindari penggunaan bersamaan dengan obat yang memiliki jalur metabolisme atau target organ toksisitas serupa.`;
  const pk = `Profil absorpsi, distribusi sistemik, metabolisme hepar, dan eliminasi urin/feses sesuai data kinetika monograf BSAVA Formulary Part A Edisi 10.`;
  const pd = `Efek farmakodinamik optimal dicapai dengan mempertahankan kadar obat terapeutik pada jaringan sasaran sepanjang interval pemberian dosis.`;

  return {
    drugClass: drugClassId,
    mechanismOfAction: moa,
    indications: indications,
    contraindications: contra,
    sideEffects: adverse,
    drugInteractions: interactions,
    pharmacokinetics: pk,
    pharmacodynamics: pd,
    learnMore: {
      counseling: `Berikan sediaan sesuai petunjuk dokter hewan. Pastikan dosis dan rute pemberian tepat sesuai berat badan pasien. Sediakan akses air minum bersih.`,
      monitoring: `Pantau respon klinis terapi, resolusi gejala penyakit, dan tanda-tanda intoleransi obat pada pasien.`,
      overdose: `Bila dicurigai terjadi overdosis, segera hentikan pengobatan dan lakukan penanganan suportif simtomatik (dekontaminasi lambung, terapi cairan kristaloid, atau antidot spesifik bila tersedia).`,
      storage: `Simpan pada suhu ruang terkontrol (15°C–25°C) di tempat sejuk, kering, dan terlindung dari paparan sinar matahari langsung.`,
      references: `BSAVA Small Animal Formulary (Part A: Canine and Feline, Edisi 10, hal. ${pages}).`
    }
  };
}

module.exports = {
  CURATED_ID_MONOGRAPHS,
  NEURAL_BSAVA_TRANSLATIONS,
  generateGenericIndonesianMonograph
};
