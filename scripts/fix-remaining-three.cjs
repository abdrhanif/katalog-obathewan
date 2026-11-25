const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'public', 'js', 'drugs-data.js');
const rawDb = fs.readFileSync(dbPath, 'utf8');
const matchIdx = rawDb.indexOf('export const VET_DRUG_DATABASE = ');
const jsonStr = rawDb.slice(matchIdx + 'export const VET_DRUG_DATABASE = '.length).trim().replace(/;$/, '');
const drugs = JSON.parse(jsonStr);

// Clean, specialist EYD/KBBI translations for these 3 drugs:
const FIXES = {
  "moxidectin": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Antiparasit Endektosida Golongan Milbemycin / Makrosiklik Lakton",
    prescriberHighlights: [
      "Antiparasit endektosida golongan avermektin/milbemisin yang disetujui FDA untuk sapi, anjing, kucing, domba, dan kuda.",
      "Sangat efektif untuk pencegahan cacing jantung (Dirofilaria immitis) serta pengendalian nematoda saluran cerna dan ektoparasit (tungau).",
      "Kontraindikasi: Sapi perah masa laktasi/reproduksi, anak kuda di bawah usia 4 bulan, atau hewan dengan riwayat hipersensitivitas.",
      "Efek samping: Letargi, muntah, ataksia, penurunan nafsu makan, atau diare transien pascapemberian.",
      "Aman digunakan pada anjing dengan mutasi gen ABCB1-1 (MDR1) pada dosis pencegahan heartworm berlabel resmi."
    ],
    indications: "Pencegahan infeksi cacing jantung (Dirofilaria immitis), pengobatan infestasi tungau (demodikosis, scabies), dan nematoda saluran cerna pada anjing, kucing, serta hewan ternak.",
    contraindications: "Hipersensitivitas terhadap moksidektin. Dilarang digunakan pada anak kuda di bawah usia 4 bulan.",
    adverseEffects: "Letargi, ataksia ringan, muntah, atau hipersalivasi. Gejala neurotoksisitas dapat timbul bila diberikan dosis berlebih pada anjing ras sensitif.",
    reproductiveNursingSafety: "Keamanan pada hewan bunting dan laktasi belum sepenuhnya ditetapkan. Gunakan hanya jika manfaat klinis lebih besar daripada risiko janin.",
    overdosageAcuteToxicity: "Toksisitas akut memicu depresi sistem saraf pusat, ataksia, midriasis, dan kelemahan otot. Lakukan dekontaminasi dan terapi cairan intravena suportif.",
    pharmacokinetics: "Sangat lipofilik dengan volume distribusi luas dan waktu paruh eliminasi panjang, memungkinkan interval pemberian bulanan atau sustained-release.",
    pharmacodynamics: "Mengikat kanal ion klorida berpintu-glutamat pada neuron dan sel otot parasit invertebrata, memicu paralisis flaksid dan kematian parasit.",
    clientInformation: [
      "Berikan obat pencegahan heartworm secara teratur sesuai jadwal yang dianjurkan dokter hewan. Jangan melebihi dosis anjuran."
    ],
    monitoring: [
      "Lakukan pemeriksaan uji antigen/mikrofilaria cacing jantung sebelum memulai terapi pencegahan tahunan."
    ],
    storageStability: "Simpan pada suhu ruang terkontrol (15°C–25°C) terlindung dari paparan sinar matahari langsung."
  },
  "diethylcarbamazine-citrate": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Antiparasit Antelmintik & Pencegah Cacing Jantung (Filarisida)",
    prescriberHighlights: [
      "Sediaan profilaksis cacing jantung oral harian dan antelmintik untuk anjing.",
      "Wajib dipastikan anjing negatif uji antigen/mikrofilaria sebelum obat diberikan.",
      "Dilarang diberikan pada anjing dengan mikrofilaria aktif karena memicu reaksi anafilaktik akut yang fatal.",
      "Efek samping yang dilaporkan meliputi mual, muntah, dan anoreksia ringan."
    ],
    indications: "Pencegahan infeksi Dirofilaria immitis (cacing jantung) dan terapi infeksi cacing gelang (Toxocara canis, Toxascaris leonina) pada anjing.",
    contraindications: "Kontraindikasi mutlak pada anjing yang positif mikrofilaria cacing jantung. Hindari pada pasien dengan disfungsi hepar atau ginjal berat.",
    adverseEffects: "Mual, muntah, anoreksia, atau letargi. Reaksi anafilaksis berat terjadi jika diberikan pada anjing dengan mikrofilaria sirkulasi darah.",
    reproductiveNursingSafety: "Dapat digunakan selama kebuntingan bila indikasi klinis sesuai dan hewan terbukti negatif mikrofilaria.",
    overdosageAcuteToxicity: "Overdosis memicu muntah akut, tremor, dan depresi pernapasan. Lakukan penanganan suportif.",
    pharmacokinetics: "Diabsorpsi cepat dari saluran cerna dengan konsentrasi puncak tercapai dalam 1–2 jam. Diekskresikan terutama melalui filtrasi ginjal.",
    pharmacodynamics: "Mengganggu metabolisme asam arakidonat dan membran sel parasit, memfasilitasi fagositosis mikrofilaria oleh sistem imun inang.",
    clientInformation: [
      "Wajib diberikan setiap hari tanpa terputus selama musim penularan nyamuk. Jangan menghentikan pengobatan tanpa konsultasi dokter hewan."
    ],
    monitoring: [
      "Pemeriksaan darah serologi cacing jantung wajib dilakukan sebelum memulai dan diulang secara berkala."
    ],
    storageStability: "Simpan pada suhu ruang terkontrol (15°C–25°C) dalam wadah tertutup rapat dan kering."
  },
  "ramipril": {
    edition: "Plumb's Veterinary Drug Handbook Edisi ke-7 (Donald C. Plumb, Pharm.D.)",
    drugClass: "Inhibitor Enzim Konversi Angiotensin (ACE Inhibitor) Kardiovaskular",
    prescriberHighlights: [
      "ACE inhibitor pro-drug yang diubah menjadi ramiprilat aktif di hepar, digunakan untuk gagal jantung kongestif (CHF) dan hipertensi sistemik.",
      "Menurunkan resistensi vaskular perifer (afterload) dan beban awal jantung (preload) tanpa meningkatkan denyut jantung.",
      "Kontraindikasi: Stenosis aorta atau katup mitral obstruktif, dehidrasi berat, atau hipotensi sistemik.",
      "Efek samping yang dapat muncul: Hipotensi ringan, azotemia prerenal, nafsu makan menurun, atau letargi."
    ],
    indications: "Penanganan gagal jantung kongestif kronis akibat insufisiensi katup atrioventrikular atau kardiomiopati dilatasi pada anjing, serta kontrol hipertensi sistemik dan proteinuria ginjal.",
    contraindications: "Hipotensi berat, syok kardiogenik, stenosis arteri renalis bilateral, dan kebuntingan.",
    adverseEffects: "Hipotensi, peningkatan konsentrasi kreatinin dan nitrogen urea darah (azotemia), letargi, atau gangguan gastrointestinal ringan.",
    reproductiveNursingSafety: "Kontraindikasi selama kebuntingan karena risiko fetotoksisitas dan kematian janin pada hewan.",
    overdosageAcuteToxicity: "Hipotensi berat dan gagal ginjal akut. Berikan terapi infus cairan kristaloid untuk memulihkan tekanan darah.",
    pharmacokinetics: "Merupakan prodrug yang diserap cepat dan dihidrolisis di hepar menjadi metabolit aktif ramiprilat dengan waktu paruh jaringan panjang.",
    pharmacodynamics: "Menghambat pembentukan angiotensin II dan degradasi bradikinin, menyebabkan vasodilatasi sistemik dan penurunan retensi natrium/air.",
    clientInformation: [
      "Berikan obat sesuai dosis teratur. Segera hubungi dokter hewan jika hewan tampak sangat lemas, goyah saat berdiri, atau pingsan."
    ],
    monitoring: [
      "Periksa profil fungsi ginjal (BUN, kreatinin), elektrolit serum (terutama kalium), dan tekanan darah sebelum serta 7–14 hari setelah memulai terapi."
    ],
    storageStability: "Simpan pada suhu ruang terkontrol (15°C–25°C) terlindung dari kelembapan."
  }
};

Object.entries(FIXES).forEach(([id, trans]) => {
  const d = drugs.find(x => x.id === id);
  if (d && d.plumbs) {
    d.plumbs.id = trans;
    if (!d.bsava && d.content) {
      d.content.id = {
        drugClass: trans.drugClass,
        mechanismOfAction: trans.pharmacodynamics || trans.prescriberHighlights[0],
        indications: trans.indications,
        contraindications: trans.contraindications,
        sideEffects: trans.adverseEffects,
        drugInteractions: d.drugInteractions,
        pharmacokinetics: trans.pharmacokinetics,
        pharmacodynamics: trans.pharmacodynamics,
        learnMore: {
          counseling: trans.clientInformation.join(' '),
          monitoring: trans.monitoring.join(' '),
          overdose: trans.overdosageAcuteToxicity,
          storage: trans.storageStability,
          references: `Plumb's Veterinary Drug Handbook (7th Ed.) hal. ${d.plumbs.sourcePage || '-'}`
        }
      };
    }
    console.log(`Updated specialist EYD translation for: ${id}`);
  }
});

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
 */

export const VET_DRUG_DATABASE = `;

fs.writeFileSync(dbPath, headerComment + JSON.stringify(drugs) + ';\n', 'utf8');
const stats = fs.statSync(dbPath);
console.log(`Updated drugs-data.js: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
