/**
 * Finalize All 11 Remaining Drugs & Deep Normalize Spacing Across 816 Drugs
 */

const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'public', 'js', 'drugs-data.js');
const cachePath = path.resolve(__dirname, 'plumbs_eyd_translations_cache.json');
const appJsPath = path.resolve(__dirname, '..', 'public', 'js', 'app.js');
const swPath = path.resolve(__dirname, '..', 'public', 'service-worker.js');

const rawDb = fs.readFileSync(dbPath, 'utf8');
const matchIdx = rawDb.indexOf('export const VET_DRUG_DATABASE = ');
const jsonStr = rawDb.slice(matchIdx + 'export const VET_DRUG_DATABASE = '.length).trim().replace(/;$/, '');
const drugs = JSON.parse(jsonStr);

let CACHE = {};
if (fs.existsSync(cachePath)) {
  try {
    CACHE = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {
    CACHE = {};
  }
}

// 1. Spacing Normalizer Function
function normalizeSpacing(text) {
  if (!text || typeof text !== 'string') return text;
  let s = text;

  s = s.replace(/[\t\r\n]+/g, ' ');
  s = s.replace(/([A-Za-z0-9À-ÿ])\s+-\s+([A-Za-z0-9À-ÿ])/g, '$1-$2');
  s = s.replace(/([A-Za-z0-9À-ÿ])\(/g, '$1 (');
  s = s.replace(/\)([A-Za-z0-9À-ÿ])/g, ') $1');
  s = s.replace(/([A-Za-z0-9À-ÿ])\[/g, '$1 [');
  s = s.replace(/\]([A-Za-z0-9À-ÿ])/g, '] $1');
  s = s.replace(/\(\s+/g, '(');
  s = s.replace(/\s+\)/g, ')');
  s = s.replace(/\[\s+/g, '[');
  s = s.replace(/\s+\]/g, ']');
  s = s.replace(/,([A-Za-z0-9À-ÿ])/g, ', $1');
  s = s.replace(/;([A-Za-z0-9À-ÿ])/g, '; $1');
  s = s.replace(/:([A-Za-zÀ-ÿ])/g, ': $1');
  s = s.replace(/\.([A-ZÀ-ß])/g, '. $1');
  s = s.replace(/\s+([,.:;?!])/g, '$1');
  s = s.replace(/\s{2,}/g, ' ');

  // EYD Standardizations
  s = s.replace(/\bpernafasan\b/gi, 'pernapasan');
  s = s.replace(/\bpendarahan\b/gi, 'perdarahan');
  s = s.replace(/\bkehamilan\b/gi, 'kebuntingan');
  s = s.replace(/\bhewan hamil\b/gi, 'hewan bunting');
  s = s.replace(/\bmenyusui\b/gi, 'laktasi (menyusui)');
  s = s.replace(/\bpraktek\b/gi, 'praktik');
  s = s.replace(/\befektip\b/gi, 'efektif');
  s = s.replace(/\baktifitas\b/gi, 'aktivitas');
  s = s.replace(/\bpasca\s+operasi\b/gi, 'pascaoperasi');
  s = s.replace(/\bpasca\s+bedah\b/gi, 'pascabedah');
  s = s.replace(/\bpra\s+bedah\b/gi, 'prabedah');
  s = s.replace(/\bantar\s+sel\b/gi, 'antarsel');
  s = s.replace(/\bnon\s+steroid\b/gi, 'non-steroid');
  s = s.replace(/\bsub\s+kutan\b/gi, 'subkutan');
  s = s.replace(/\bintra\s+vena\b/gi, 'intravena');
  s = s.replace(/\bintra\s+muskular\b/gi, 'intramuskular');
  s = s.replace(/\bsuhu kamar\b/gi, 'suhu ruang');
  s = s.replace(/\btukak\b/gi, 'tukak (ulkus)');

  return s.trim();
}

function normalizeDeep(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') return normalizeSpacing(obj);
  if (Array.isArray(obj)) return obj.map(normalizeDeep);
  if (typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = normalizeDeep(v);
    }
    return res;
  }
  return obj;
}

// 2. Complete Specialist Translations for the 11 Drugs
const ELEVEN_DRUGS = {
  "dantrolene": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Pelemas Otot Skelet Kerja Langsung (Direct-Acting Muscle Relaxant)",
    prescriberHighlights: [
      "Pelemas otot rangka kerja langsung yang menghambat pelepasan kalsium dari retikulum sarkoplasma.",
      "Indikasi utama: Kuda: miositis pascaanestesi / rhabdomiolisis akut; Anjing & Kucing: obstruksi uretra fungsional (spasme sfingter uretra) dan rhabdomiolisis; Babi: hipertermia maligna.",
      "Perhatian ketat: Pasien dengan disfungsi hepar, penyakit jantung berat, atau gangguan paru.",
      "Efek samping: Kelemahan otot, sedasi transien, peningkatan frekuensi berkemih, gangguan saluran cerna; risiko hepatotoksisitas pada terapi kronis."
    ],
    indications: "Digunakan dalam kedokteran hewan untuk pencegahan dan penanganan hipertermia maligna pada babi, penanganan miositis pascaanestesi dan rhabdomiolisis akibat kelelahan pada kuda, serta spasme sfingter uretra eksternal (obstruksi uretra fungsional) pada anjing dan kucing.",
    contraindications: "Hepatotoksisitas berat atau penyakit hati aktif. Gunakan dengan sangat hati-hati pada pasien dengan disfungsi hepar kronis atau insufisiensi kardiorespirasi berat.",
    adverseEffects: "Kelemahan otot skelet, ataksia, sedasi, mual, muntah, dan peningkatan enzim hepar. Terapi kronis memerlukan pemantauan ketat terhadap profil fungsi hepar.",
    reproductiveNursingSafety: "Keamanan penggunaan selama masa kebuntingan belum sepenuhnya ditetapkan. Gunakan hanya jika manfaat klinis lebih besar daripada risiko janin.",
    overdosageAcuteToxicity: "Overdosis akut memicu kelemahan otot mendalam, sedasi, gangguan gastrointestinal, dan gagal hati. Lakukan penanganan suportif cairan dan pemantauan pernapasan.",
    pharmacokinetics: "Diabsorpsi lambat dan tidak sempurna dari saluran cerna pada hewan. Dimetabolisme oleh enzim mikrosomal hati menjadi metabolit aktif 5-hidroksidantrolen.",
    pharmacodynamics: "Menghambat kanal pelepasan kalsium ryanodine reseptor (RyR1) pada retikulum sarkoplasma otot rangka, memutus kopling eksitasi-kontraksi otot tanpa memengaruhi miokardium.",
    clientInformation: ["Berikan obat sesuai petunjuk dokter hewan. Hubungi klinik jika hewan tampak sangat lemah atau urin berubah warna."],
    monitoring: ["Pantau enzim hepar (ALT/AST) berkala pada terapi jangka panjang serta evaluasi peredaan tonus uretra/otot."],
    storageStability: "Simpan sediaan oral pada suhu ruang terkontrol (15°C–25°C) terlindung dari paparan cahaya langsung."
  },
  "diethylcarbamazine-citrate": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Antiparasit Antelmintik & Filarisida Profilaksis Cacing Jantung",
    prescriberHighlights: [
      "Sediaan oral profilaksis harian pencegah infeksi cacing jantung (Dirofilaria immitis) dan terapi askariasis pada anjing.",
      "Kontraindikasi mutlak: Anjing yang positif mikrofilaria aktif dalam darah karena memicu reaksi anafilaktik fatal.",
      "Efek samping jarang terjadi, dapat berupa muntah, diare, atau penurunan nafsu makan ringan pascapemberian.",
      "Pastikan hewan telah menjalani uji serologi darah dan terbukti negatif mikrofilaria sebelum terapi dimulai."
    ],
    indications: "Pencegahan infeksi Dirofilaria immitis (cacing jantung) dan penanganan infestasi cacing gelang (Toxocara canis, Toxascaris leonina) pada anjing.",
    contraindications: "Dilarang keras diberikan pada anjing dengan mikrofilaria sirkulasi darah positif karena memicu reaksi anafilaktoid akut akibat lisis masif larva cacing.",
    adverseEffects: "Mual, muntah, feses lembek, dan anoreksia. Reaksi syok fatal bila diberikan pada hewan dengan mikrofilaria aktif.",
    reproductiveNursingSafety: "Dapat digunakan selama masa kebuntingan bila anjing terbukti negatif uji cacing jantung.",
    overdosageAcuteToxicity: "Overdosis memicu muntah akut, ataksia, dan depresi pernapasan. Lakukan terapi cairan suportif.",
    pharmacokinetics: "Diabsorpsi cepat dari saluran cerna dengan konsentrasi puncak tercapai dalam 1–2 jam. Diekskresikan terutama melalui filtrasi ginjal.",
    pharmacodynamics: "Mengganggu metabolisme asam arakidonat dan membran sel parasit, memfasilitasi fagositosis mikrofilaria oleh sistem imun inang.",
    clientInformation: ["Wajib diberikan setiap hari tanpa terputus selama musim penularan nyamuk. Jangan menghentikan pengobatan tanpa konsultasi dokter hewan."],
    monitoring: ["Pemeriksaan darah serologi cacing jantung wajib dilakukan sebelum memulai dan diulang secara berkala."],
    storageStability: "Simpan pada suhu ruang terkontrol (15°C–25°C) dalam wadah tertutup rapat dan kering."
  },
  "dihydrotachysterol": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Analog Vitamin D Sintetis (Regulator Kalsium & Fosfat)",
    prescriberHighlights: [
      "Analog vitamin D sintetis yang digunakan untuk mengatasi hipokalsemia sekunder akibat hipoparatiroidisme atau gagal ginjal kronis.",
      "Meningkatkan konsentrasi kalsium serum lebih cepat dibanding ergokalsiferol dan efeknya cepat hilang setelah obat dihentikan.",
      "Kontraindikasi: Hiperkalsemia, toksisitas vitamin D, sindrom malabsorpsi, atau hiperfosfatemia.",
      "Efek samping: Hiperkalsemia (polidipsia, poliuria, muntah, anoreksia), kalsinosis ginjal, dan hiperfosfatemia.",
      "Pemantauan kalsium serum berkala bersifat wajib sepanjang terapi."
    ],
    indications: "Penanganan hipokalsemia sekunder akibat hipoparatiroidisme primer, hipokalsemia pascatiroidektomi, dan osteodistrofi ginjal pada anjing dan kucing.",
    contraindications: "Hiperkalsemia, hiperfosfatemia yang belum terkontrol, atau keracunan vitamin D.",
    adverseEffects: "Hiperkalsemia (ditandai dengan letargi, anoreksia, poliuria, polidipsia), nefrokalsinosis, dan insufisiensi ginjal akut.",
    reproductiveNursingSafety: "Keamanan selama kebuntingan belum ditetapkan; hiperkalsemia maternal dapat memicu malformasi janin.",
    overdosageAcuteToxicity: "Krisis hiperkalsemia akut. Hentikan terapi segera, berikan infus salin normal (NaCl 0.9%) dan furosemid untuk mempercepat ekskresi kalsium.",
    pharmacokinetics: "Diabsorpsi baik di saluran cerna dan dihidroksilasi di hepar menjadi metabolit aktif 25-hidroksidihidrotakisterol tanpa memerlukan aktivasi ginjal.",
    pharmacodynamics: "Menstimulasi absorpsi kalsium dan fosfat di usus halus serta mobilisasi kalsium dari tulang.",
    clientInformation: ["Berikan obat sesuai dosis teratur. Segera bawa ke dokter hewan bila hewan menunjukkan tanda muntah, sangat haus, atau sering buang air kecil."],
    monitoring: ["Uji kadar kalsium serum, fosfor, dan nitrogen urea darah (BUN) secara berkala."],
    storageStability: "Simpan pada suhu ruang sejuk terkontrol terlindung dari cahaya dan kelembapan."
  },
  "diphenoxylate-hcl-atropine-sulfate": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Antidiare Agonis Reseptor Opioid Sintetis Kombinasi Atropin",
    prescriberHighlights: [
      "Modulator motilitas saluran cerna golongan opioid yang dikombinasikan dengan atropin sulfat dosis sub-terapeutik untuk mencegah penyalahgunaan.",
      "Indikasi utama: Terapi simtomatik diare akut dan kronis non-infeksi serta sebagai antitusif pada anjing.",
      "Kontraindikasi: Diare yang dipicu oleh ingesti racun/toksin bakteri sampai racun tereliminasi, obstruksi usus, atau hipersensitivitas opioid.",
      "Efek samping: Konstipasi, kembung (bloat), sedasi ringan, letargi; berpotensi memicu ileus paralitik pada dosis tinggi.",
      "Penggunaan pada kucing kontroversial karena berisiko memicu eksitasi paradoksikal sistem saraf pusat."
    ],
    indications: "Pengobatan simtomatik diare akut dan kronis serta enteritis pada anjing bila terapi suportif awal belum mencukupi.",
    contraindications: "Diare infeksius yang disebabkan oleh enterotoksin bakteri patogen (Salmonella, Clostridium), obstruksi mekanik saluran cerna, atau megakolon.",
    adverseEffects: "Konstipasi, distensi abdomen, sedasi, letargi, dan penurunan nafsu makan.",
    reproductiveNursingSafety: "Keamanan selama kebuntingan dan laktasi belum ditetapkan; gunakan hanya jika sangat diperlukan.",
    overdosageAcuteToxicity: "Depresi pernapasan berat, koma, dan konstipasi parah. Nalokson merupakan antidot spesifik pembalik efek opioid.",
    pharmacokinetics: "Diserap cepat secara oral dan dimetabolisme di hati menjadi asam difenoksilat (difenoksin) yang aktif secara biologis.",
    pharmacodynamics: "Menstimulasi reseptor mu-opioid pada otot polos usus, menghambat motilitas peristaltik sirkular dan longitudinal serta memperpanjang waktu transit intestinal.",
    clientInformation: ["Berikan obat sesuai dosis teratur. Hentikan terapi bila diare telah teratasi atau bila perut hewan tampak kembung."],
    monitoring: ["Evaluasi konsistensi feses dan pantau tanda-tanda distensi abdomen atau ileus."],
    storageStability: "Simpan pada suhu ruang terkontrol (15°C–25°C) di wadah tertutup rapat."
  },
  "dobutamine": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Inotropik Positif Agonis Selektif Reseptor Beta-1 Adrenergik Parenteral",
    prescriberHighlights: [
      "Agen inotropik positif parenteral kerja cepat yang meningkatkan kontraktilitas miokardium dengan pengaruh minimal terhadap frekuensi denyut jantung.",
      "Indikasi utama: Manajemen darurat gagal jantung kongestif akut, syok kardiogenik, dan hipotensi refrakter saat anestesi umum.",
      "Kontraindikasi: Kardiomiopati obstruktif hipertrofik (HCM), stenosis aorta berat, atau hipersensitivitas.",
      "Efek samping: Takikardia, aritmia ventrikel, tremor wajah pada anjing, kejang pada kucing (bila dosis infus melebihi batas).",
      "Wajib diberikan melalui infus intravena kecepatan konstan (CRI) dengan pemantauan elektrokardiogram (EKG) ketat."
    ],
    indications: "Dukungan inotropik jangka pendek pada syok kardiogenik, dekompensasi gagal jantung kongestif berat, dan hipotensi intraoperatif pada anjing, kucing, dan kuda.",
    contraindications: "Kardiomiopati hipertrofik dengan obstruksi outflow ventrikel kiri, stenosis aorta, atau takiaritmia ventrikel yang tidak terkontrol.",
    adverseEffects: "Takikardia, aritmia atrium dan ventrikel, hipertensi atau hipotensi transien. Pada kucing dapat timbul tremor dan kejang pada dosis tinggi.",
    reproductiveNursingSafety: "Gunakan hanya pada kondisi darurat penyelamatan hidup induk.",
    overdosageAcuteToxicity: "Takiaritmia berat dan hipertensi. Hentikan atau kurangi laju infus CRI; waktu paruh eliminasi sangat singkat (1–2 menit).",
    pharmacokinetics: "Onset kerja dalam 2 menit pascapemberian IV dengan waktu paruh darah sekitar 2 menit. Dimetabolisme cepat di jaringan dan hepar.",
    pharmacodynamics: "Agonis selektif reseptor beta-1 adrenergik miokardium, memicu peningkatan inotropik (kekuatan pompa) dengan efek kronotropik (laju denyut) minimal.",
    clientInformation: ["Obat ini hanya diberikan di ruang rawat inap intensif veteriner melalui pemantauan infus berkelanjutan."],
    monitoring: ["Pemantauan terus-menerus terhadap elektrokardiogram (EKG), tekanan darah arteri, denyut jantung, dan laju pernapasan."],
    storageStability: "Simpan ampul/vial pada suhu ruang (15°C–25°C). Larutan rekonstitusi infus harus digunakan dalam 24 jam."
  },
  "docusate-sodium": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Pencahar Emolien / Pelembut Feses Surfaktan Anionik (Stool Softener)",
    prescriberHighlights: [
      "Surfaktan pencahar yang menurunkan tegangan permukaan cairan pencernaan, memfasilitasi penetrasi air dan lipid ke dalam massa feses.",
      "Indikasi utama: Mengatasi konstipasi ringan, mengobati feses keras/kering, impaksi feses, dan kondisi anorektal yang menyakitkan.",
      "Kontraindikasi: Obstruksi usus mekanik, sakit perut akut tanpa diagnosis pasti, atau pemberian bersamaan dengan minyak mineral.",
      "Efek samping: Kram saluran cerna ringan, feses encer, atau diare sementara pada dosis tinggi."
    ],
    indications: "Penanganan konstipasi, impaksi feses pada anjing dan kucing, serta impaksi sekum/kolon pada kuda.",
    contraindications: "Jangan diberikan bersamaan dengan minyak mineral (parafin cair) karena docusate meningkatkan absorpsi sistemik minyak mineral dan memicu granuloma hepar.",
    adverseEffects: "Kram perut ringan, diare, atau mual sementara bila diberikan dalam dosis berlebih.",
    reproductiveNursingSafety: "Umumnya aman digunakan selama masa kebuntingan pada dosis terapeutik anjuran.",
    overdosageAcuteToxicity: "Diare cair dan dehidrasi transien. Lakukan terapi cairan rehidrasi oral atau kristaloid bila diperlukan.",
    pharmacokinetics: "Bekerja secara lokal di lumen usus besar dengan absorpsi sistemik yang sangat minimal. Ekskresi dominan melalui feses.",
    pharmacodynamics: "Aktivitas surfaktan menurunkan tegangan antarmuka minyak-air feses, melunakkan massa tinja dan mempermudah defekasi.",
    clientInformation: ["Sediakan akses air minum yang melimpah selama terapi konstipasi. Hubungi dokter hewan bila hewan tidak dapat buang air besar dalam 24-48 jam."],
    monitoring: ["Pantau konsistensi dan frekuensi defekasi pasien."],
    storageStability: "Simpan sirup atau kapsul pada suhu ruang terkontrol (15°C–25°C) terlindung dari kelembapan."
  },
  "felbamate": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Antikonvulsan Dikarbat / Terapi Tambahan Epilepsi Refrakter",
    prescriberHighlights: [
      "Antikonvulsan oral yang memodulasi reseptor NMDA dan potensiasi GABA pada susunan saraf pusat.",
      "Indikasi utama: Terapi tambahan (add-on) atau monoterapi pada anjing dengan kejang parsial atau umum yang refrakter terhadap fenobarbital dan kalium bromida.",
      "Keunggulan: Tidak memicu sedasi mendalam yang lazim terjadi pada antikonvulsan konvensional.",
      "Efek samping: Keratokonjungtivitis sika (KCS / mata kering), hepatotoksisitas, dan diskrasia darah (leukopenia/trombositopenia).",
      "Pemeriksaan uji Schirmer (STT) dan profil hepar wajib dilakukan secara berkala."
    ],
    indications: "Pengendalian kejang refrakter dan epilepsi idiopatik pada anjing yang tidak merespons optimal terhadap kombinasi fenobarbital dan bromida.",
    contraindications: "Riwayat hipersensitivitas terhadap felbamate atau disfungsi hepar berat.",
    adverseEffects: "Keratokonjungtivitis sika (KCS), peningkatan enzim hepar (ALT/ALP), tremor ringan, anoreksia, atau muntah sementara.",
    reproductiveNursingSafety: "Keamanan penggunaan selama kebuntingan belum ditetapkan; hindari pada hewan bunting.",
    overdosageAcuteToxicity: "Sedasi, ataksia, muntah, dan toksisitas hepar akut. Lakukan dekontaminasi dan perawatan suportif simtomatik.",
    pharmacokinetics: "Diserap baik secara oral pada anjing dengan bioavailabilitas tinggi. Sebagian besar diekskresikan melalui urin dalam bentuk tidak berubah dan metabolit.",
    pharmacodynamics: "Antagonis reseptor NMDA (khususnya subunit NR2B) dan potensiasi aksi asam gama-aminobutirat (GABA), menekan fokus kejang epileptogenik.",
    clientInformation: ["Jangan menghentikan obat secara mendadak karena dapat memicu status epileptikus. Perhatikan tanda mata merah atau kotoran mata kering."],
    monitoring: ["Uji air mata Schirmer (STT) setiap bulan pada awal terapi, pemeriksaan darah lengkap (CBC) dan profil hepar berkala."],
    storageStability: "Simpan tablet pada suhu ruang terkontrol (15°C–25°C) di tempat kering terlindung dari cahaya."
  },
  "glyburide": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Antidiabetik Oral Golongan Sulfonilurea Generasi Kedua (Glibenklamid)",
    prescriberHighlights: [
      "Agen antidiabetik oral yang merangsang sekresi insulin dari sel beta pulau Langerhans pankreas yang masih berfungsi.",
      "Indikasi: Terapi alternatif pada kucing dengan diabetes melitus tipe 2 (non-insulin-dependent) bila glipizide tidak tersedia atau bila pemilik menolak terapi injeksi insulin.",
      "Kontraindikasi: Diabetes melitus tipe 1 (tergantung insulin), ketoasidosis diabetik, stres berat, bedah mayor, koma diabetik, infeksi sistemik berat.",
      "Efek samping: Hipoglikemia, muntah, ikterus, dan peningkatan enzim hepar (ALT).",
      "Pemantauan glukosa darah berkala wajib dilakukan untuk mencegah komplikasi hipoglikemia."
    ],
    indications: "Penanganan diabetes melitus non-insulin dependent pada kucing dengan fungsi sisa sel beta pankreas yang memadai.",
    contraindications: "Ketoasidosis diabetik, penyakit ginjal atau hepar berat, trauma mayor, dan kondisi infeksi akut.",
    adverseEffects: "Hipoglikemia (kelemahan, ataksia, tremor, kejang), gangguan pencernaan (muntah), dan kolestasis hepar.",
    reproductiveNursingSafety: "Kontraindikasi selama kebuntingan karena risiko hipoglikemia janin dan teratogenisitas.",
    overdosageAcuteToxicity: "Hipoglikemia berat yang mengancam nyawa. Berikan larutan glukosa intravena (dekstrosa 50% bolus pelan) diikuti infus glukosa kontinu.",
    pharmacokinetics: "Diserap baik secara oral dan terikat kuat pada protein plasma (>99%). Dimetabolisme di hati dan diekskresikan secara seimbang lewat empedu dan urin.",
    pharmacodynamics: "Menutup kanal kalium peka-ATP pada membran sel beta pankreas, memicu depolarisasi membran, influks kalsium, dan eksositosis vesikel insulin.",
    clientInformation: ["Berikan obat bersama makanan. Kenali tanda-tanda gula darah rendah (jalan sempoyongan, lemas, kejang). Sediakan sirup madu/glukosa di rumah untuk darurat."],
    monitoring: ["Pemeriksaan glukosa darah berkala, fruktosamin serum, dan profil fungsi hepar."],
    storageStability: "Simpan tablet pada suhu ruang terkontrol (15°C–25°C) terlindung dari paparan cahaya langsung."
  },
  "hydroxyzine": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Antihistamin H1 Generasi Pertama Golongan Piperazin (Antialergi & Sedatif)",
    prescriberHighlights: [
      "Antagonis reseptor H1 histamin dengan sifat antipruritus, antialergi, dan penenang (ansiolitik) ringan.",
      "Indikasi utama: Dermatitis atopik, pruritus alergi, urtikaria, gigitan serangga, dan sedasi prosedural minor pada anjing dan kucing.",
      "Kontraindikasi: Glaukoma sudut sempit, retensi urin atau hipertrofi prostat, dan obstruksi saluran cerna.",
      "Efek samping: Sedasi dan rasa kantuk ringan (paling umum); anjing (jarang): eksitasi paradoksikal atau tremor; kucing: letargi atau depresi.",
      "Dapat dimetabolisme di hepar menjadi metabolit aktif cetirizine."
    ],
    indications: "Pengendalian gejala pruritus alergi pada dermatitis atopik, reaksi alergi kutaneus akut, dan ansietas ringan pada anjing dan kucing.",
    contraindications: "Hipersensitivitas terhadap hydroxyzine atau cetirizine. Obstruksi saluran kemih atau usus, serta glaukoma sudut tertutup.",
    adverseEffects: "Sedasi, mulut kering (efek antikolinergik), penurunan nafsu makan ringan, atau inkoordinasi motorik transien.",
    reproductiveNursingSafety: "Kontraindikasi pada trimester awal kebuntingan (risiko teratogenik pada hewan laboratorium).",
    overdosageAcuteToxicity: "Depresi sistem saraf pusat mendalam, hipotensi, atau eksitasi antikolinergik akut. Berikan penanganan suportif.",
    pharmacokinetics: "Diserap cepat dari saluran cerna dengan konsentrasi puncak tercapai dalam 2-3 jam. Dimetabolisme di hepar menjadi cetirizine aktif.",
    pharmacodynamics: "Menghambat secara kompetitif pengikatan histamin pada reseptor H1 di sel efektor, mencegah vasodilatasi kapiler, edema, dan sensasi gatal.",
    clientInformation: ["Hewan mungkin tampak mengantuk pada awal terapi. Efek kantuk biasanya berkurang setelah beberapa hari pengobatan teratur."],
    monitoring: ["Pantau derajat peredaan rasa gatal (skor pruritus) dan tingkat sedasi hewan."],
    storageStability: "Simpan sediaan tablet atau kapsul pada suhu ruang terkontrol (15°C–25°C) di wadah tertutup rapat."
  },
  "loperamide": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Antidiare Agonis Reseptor Mu-Opioid Perifer (Modulator Motilitas Saluran Cerna)",
    prescriberHighlights: [
      "Antidiare perifer yang memperlambat transit motilitas usus, meningkatkan segmentasi dan absorpsi cairan/elektrolit mukosa.",
      "Indikasi utama: Terapi simtomatik diare akut non-infeksi pada anjing.",
      "KONTRAINDIKASI MUTLAK: Anjing dengan mutasi gen ABCB1-1 (MDR1) seperti Collie, Australian Shepherd, Shetland Sheepdog karena loperamide menembus sawar darah-otak dan memicu neurotoksisitas fatal.",
      "Kontraindikasi lain: Diare yang dipicu oleh racun/bakteri patogen, obstruksi usus, atau pankreatitis akut.",
      "Efek samping pada anjing: Konstipasi, kembung (bloat), dan sedasi. Penggunaan pada kucing kontroversial."
    ],
    indications: "Pengendalian simtomatik diare akut non-spesifik dan diare yang diinduksi kemoterapi pada anjing.",
    contraindications: "Anjing ras gembala dengan mutasi gen MDR1 (ABCB1). Diare infeksius yang dicurigai akibat enterotoksin bakteri invasif.",
    adverseEffects: "Konstipasi berkepanjangan, distensi abdomen, letargi, dan ileus paralitik pada dosis berlebih.",
    reproductiveNursingSafety: "Keamanan selama kebuntingan belum ditetapkan; hindari penggunaan kecuali manfaat klinis melampaui risiko.",
    overdosageAcuteToxicity: "Depresi pernapasan, ataksia berat, koma, dan ileus. Nalokson dapat digunakan untuk membalikkan depresi sistemik.",
    pharmacokinetics: "Bioavailabilitas sistemik rendah karena metabolisme lintas pertama (first-pass) di hepar dan pengeluaran kembali oleh P-glikoprotein ke lumen usus.",
    pharmacodynamics: "Agonis selektif reseptor mu-opioid pada pleksus mienterikus dinding usus, menurunkan motilitas propulsif dan meningkatkan tonus sfingter anal.",
    clientInformation: ["Dilarang keras diberikan pada anjing ras Collie atau silangannya tanpa uji genetik MDR1. Hentikan pengobatan bila feses sudah padat."],
    monitoring: ["Evaluasi frekuensi dan konsistensi defekasi serta pemantauan tanda distensi abdomen."],
    storageStability: "Simpan pada suhu ruang terkontrol (15°C–25°C) terlindung dari cahaya matahari langsung."
  },
  "mannitol": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Diuretik Osmotik Hipertonik Parenteral (Penurun Tekanan Intrakranial & Intraokular)",
    prescriberHighlights: [
      "Diuretik osmotik hipertonik parenteral yang menarik cairan dari kompartemen intraseluler dan jaringan interstitial ke dalam kompartemen intravaskular.",
      "Indikasi utama: Kondisi darurat trauma kepala akut dengan peningkatan tekanan intrakranial (edema serebral), glaukoma akut untuk menurunkan tekanan intraokular dengan cepat, dan gagal ginjal oligurik akut.",
      "Kontraindikasi: Anuria akibat penyakit ginjal terminal, perdarahan intrakranial aktif (kecuali saat kraniotomi), gagal jantung kongestif (CHF), dehidrasi berat, atau edema paru kongestif.",
      "Efek samping: Ketidakseimbangan cairan dan elektrolit, ekspansi volume sirkulasi akut yang memicu edema paru, dehidrasi seluler, dan takikardia.",
      "Wajib memastikan larutan jernih tanpa kristal sebelum diinfuskan (hangatkan bila mengkristal) dan gunakan filter in-line (5 mikron)."
    ],
    indications: "Pengurangan tekanan intrakranial dan edema serebral pada trauma kepala akut, reduksi tekanan intraokular pada glaukoma akut, serta induksi diuresis pada gagal ginjal oligurik fase awal.",
    contraindications: "Anuria persisten yang tidak merespons hidrasi, dehidrasi berat, edema paru kardiogenik, perdarahan intrakranial aktif, dan syok hipovolemik.",
    adverseEffects: "Ekspansi volume intravaskular transien yang dapat memperburuk gagal jantung, hipernatremia atau hiponatremia, dehidrasi, dan gagal ginjal akut pada dosis sangat tinggi.",
    reproductiveNursingSafety: "Gunakan hanya pada kondisi darurat penyelamatan jiwa bila indikasi klinis mengancam nyawa.",
    overdosageAcuteToxicity: "Kelebihan beban sirkulasi masif, edema paru akut, dan kolaps kardiovaskular. Hentikan infus dan berikan terapi diuretik loop (furosemid) serta dialisis bila diperlukan.",
    pharmacokinetics: "Tidak diabsorpsi oral (wajib IV). Difiltrasi bebas oleh glomerulus ginjal tanpa reabsorpsi tubulus yang berarti. Waktu paruh eliminasi sekitar 30-60 menit.",
    pharmacodynamics: "Menciptakan gradien osmotik transendotelial yang menarik air bebas dari parenkim otak dan humor akuos mata ke dalam lumen vaskular.",
    clientInformation: ["Obat darurat parenteral yang hanya diadministrasikan di bawah pengawasan langsung dokter hewan spesialis rawat intensif."],
    monitoring: ["Pantau status hidrasi, tekanan darah, elektrolit serum, osmolalitas plasma, dan volume produksi urin (output kateter)."],
    storageStability: "Simpan larutan pada suhu ruang terkontrol (15°C–25°C). Hindari pembekuan. Jika terbentuk kristal, hangatkan botol dalam air hangat dan kocok perlahan hingga kristal larut sempurna sebelum digunakan."
  }
};

// 3. Apply to CACHE and Drugs Database
Object.entries(ELEVEN_DRUGS).forEach(([id, trans]) => {
  CACHE[id] = trans;
});

// Write to cache file
fs.writeFileSync(cachePath, JSON.stringify(CACHE, null, 2), 'utf8');
console.log(`Updated cache file with 11 specialist translations.`);

// Apply to all 816 drugs and perform deep normalization
let plumbsUpdated = 0;
drugs.forEach(drug => {
  if (drug.plumbs && CACHE[drug.id]) {
    drug.plumbs.id = normalizeDeep(CACHE[drug.id]);
    plumbsUpdated++;
  }

  // Normalize plumbs.id if present
  if (drug.plumbs?.id) {
    drug.plumbs.id = normalizeDeep(drug.plumbs.id);
  }

  // Sync content.id for Plumb's-only monographs
  if (!drug.bsava && drug.content && drug.plumbs?.id) {
    const pid = drug.plumbs.id;
    drug.content.id = {
      drugClass: pid.drugClass || drug.drugClass,
      mechanismOfAction: pid.pharmacodynamics || (pid.prescriberHighlights?.[0] || drug.mechanismOfAction),
      indications: pid.indications || drug.indications,
      contraindications: pid.contraindications || drug.contraindications,
      sideEffects: pid.adverseEffects || drug.sideEffects,
      drugInteractions: drug.drugInteractions,
      pharmacokinetics: pid.pharmacokinetics || drug.pharmacokinetics,
      pharmacodynamics: pid.pharmacodynamics || drug.pharmacodynamics,
      learnMore: {
        counseling: (pid.clientInformation || []).join(' '),
        monitoring: (pid.monitoring || []).join(' '),
        overdose: pid.overdosageAcuteToxicity,
        storage: pid.storageStability,
        references: `Plumb's Veterinary Drug Handbook (7th Ed.) hal. ${drug.plumbs.sourcePage || '-'}`
      }
    };
  }

  // Normalize content.id
  if (drug.content?.id) {
    drug.content.id = normalizeDeep(drug.content.id);
  }

  // Normalize bsava
  if (drug.bsava) {
    for (const [k, v] of Object.entries(drug.bsava)) {
      if (typeof v === 'string') {
        drug.bsava[k] = normalizeSpacing(v);
      }
    }
  }

  // Normalize top-level string fields
  ['mechanismOfAction', 'indications', 'contraindications', 'sideEffects', 'drugInteractions', 'pharmacokinetics', 'pharmacodynamics'].forEach(k => {
    if (typeof drug[k] === 'string') {
      drug[k] = normalizeSpacing(drug[k]);
    }
  });
});

console.log(`Deep normalized and updated ${plumbsUpdated} Plumb's monographs across all 816 drugs.`);

// Write back to public/js/drugs-data.js
const headerComment = `/**
 * Veterinary Pharmacology Database
 * Comprehensive Clinical Compendium & Drug Directory
 * Sourced from:
 * - BSAVA Small Animal Formulary (Part A: Canine and Feline, 10th Edition by Fergus Allerton)
 * - Plumb's Veterinary Drug Handbook (7th Edition by Donald C. Plumb, Pharm.D.)
 *
 * Total Monographs: ${drugs.length}
 * Bilingual Support: Indonesian (id) & English (en) across both BSAVA and Plumb's
 * Indonesian Translation: Strict adherence to EYD Edisi V and KBBI
 * Typography: Fully normalized spacing, hyphens, and punctuation
 */

export const VET_DRUG_DATABASE = `;

fs.writeFileSync(dbPath, headerComment + JSON.stringify(drugs) + ';\n', 'utf8');
const stats = fs.statSync(dbPath);
console.log(`Successfully updated drugs-data.js: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

// 4. Bump version in public/js/app.js
let appJs = fs.readFileSync(appJsPath, 'utf8');
appJs = appJs.replace(/const DB_VERSION = "[^"]+";/, 'const DB_VERSION = "3.3_eyd_kbbi_spacing_clean";');
appJs = appJs.replace(/localStorage\.setItem\("vet_custom_drugs_db_version", "[^"]+"\);/g, 'localStorage.setItem("vet_custom_drugs_db_version", "3.3_eyd_kbbi_spacing_clean");');
fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('Bumped DB_VERSION to 3.3_eyd_kbbi_spacing_clean in app.js.');

// 5. Bump cache in public/service-worker.js
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/const CACHE_NAME = '[^']+';/, "const CACHE_NAME = 'katalog-obat-hewan-v5-eyd-clean';");
fs.writeFileSync(swPath, sw, 'utf8');
console.log('Bumped CACHE_NAME to katalog-obat-hewan-v5-eyd-clean in service-worker.js.');
