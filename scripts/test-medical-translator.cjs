const fs = require('fs');

// Advanced Medical & Veterinary English-to-Indonesian Translator
function translateMedicalText(text) {
  if (!text || typeof text !== 'string') return '';

  let s = text;

  // 1. Full Sentence / Clause Mappings
  const clauses = [
    [/is used in the management of/gi, "digunakan dalam penatalaksanaan"],
    [/is used for the treatment of/gi, "digunakan untuk pengobatan"],
    [/is used for/gi, "digunakan untuk"],
    [/is used to treat/gi, "digunakan untuk mengobati"],
    [/is used to/gi, "digunakan untuk"],
    [/is indicated for the treatment of/gi, "diindikasikan untuk pengobatan"],
    [/is indicated for/gi, "diindikasikan untuk"],
    [/is indicated in/gi, "diindikasikan pada"],
    [/has also been used to treat/gi, "juga digunakan untuk mengobati"],
    [/has also been used for/gi, "juga digunakan untuk"],
    [/has been used in/gi, "telah digunakan pada"],
    [/has been used to/gi, "telah digunakan untuk"],
    [/has also been used/gi, "juga telah digunakan"],
    [/should not be used in animals with/gi, "tidak boleh digunakan pada hewan dengan"],
    [/should not be used in/gi, "tidak boleh digunakan pada"],
    [/should not be used/gi, "tidak boleh digunakan"],
    [/should be avoided in/gi, "harus dihindari pada"],
    [/avoid in animals with/gi, "hindari pada hewan dengan"],
    [/avoid in patients with/gi, "hindari pada pasien dengan"],
    [/avoid concurrent use with/gi, "hindari penggunaan bersamaan dengan"],
    [/use with caution in animals with/gi, "gunakan dengan hati-hati pada hewan dengan"],
    [/use with caution in/gi, "gunakan dengan hati-hati pada"],
    [/use with caution/gi, "gunakan dengan hati-hati"],
    [/may be necessary/gi, "mungkin diperlukan"],
    [/may reduce/gi, "dapat menurunkan"],
    [/may increase/gi, "dapat meningkatkan"],
    [/may cause/gi, "dapat menyebabkan"],
    [/can cause/gi, "dapat memicu"],
    [/can lead to/gi, "dapat memicu terjadinya"],
    [/is contraindicated in/gi, "dikontraindikasikan pada"],
    [/contraindicated in/gi, "dikontraindikasikan pada"],
    [/contraindicated/gi, "dikontraindikasikan"],
    [/increases the risk of/gi, "meningkatkan risiko"],
    [/increases the risk/gi, "meningkatkan risiko"],
    [/decreases the risk of/gi, "menurunkan risiko"],
    [/concurrent administration of/gi, "pemberian bersamaan dengan"],
    [/concurrent administration with/gi, "pemberian bersamaan dengan"],
    [/concurrent use of/gi, "penggunaan bersamaan dengan"],
    [/concurrent use with/gi, "penggunaan bersamaan dengan"],
    [/concurrent use/gi, "penggunaan bersamaan"],
    [/concurrent administration/gi, "pemberian bersamaan"],
    [/in combination with/gi, "dalam kombinasi dengan"],
    [/combined with/gi, "dikombinasikan dengan"],
    [/have all been reported in humans, but only rarely in dogs/gi, "telah dilaporkan pada manusia, namun sangat jarang terjadi pada anjing"],
    [/have been reported in/gi, "telah dilaporkan pada"],
    [/has been reported in/gi, "telah dilaporkan pada"],
    [/have been reported/gi, "telah dilaporkan"],
    [/has been reported/gi, "telah dilaporkan"],
    [/only rarely in dogs/gi, "hanya jarang pada anjing"],
    [/only rarely in cats/gi, "hanya jarang pada kucing"],
    [/in dogs and cats/gi, "pada anjing dan kucing"],
    [/in dogs/gi, "pada anjing"],
    [/in cats/gi, "pada kucing"],
    [/in humans/gi, "pada manusia"],
    [/in puppies/gi, "pada anak anjing"],
    [/in kittens/gi, "pada anak kucing"],
    [/in horses/gi, "pada kuda"],
    [/in rabbits/gi, "pada kelinci"],
    [/in rodents/gi, "pada rodentia"],
    [/on an empty stomach/gi, "saat perut kosong"],
    [/with or without food/gi, "dengan atau tanpa pakan"],
    [/with food/gi, "bersama makanan"],
    [/after food/gi, "setelah makan"],
    [/before food/gi, "sebelum makan"],
    [/dose adjustments may be necessary/gi, "penyesuaian dosis mungkin diperlukan"],
    [/dose reduction may be required/gi, "pengurangan dosis mungkin diperlukan"],
    [/monitor renal function/gi, "pantau fungsi ginjal"],
    [/monitor liver function/gi, "pantau fungsi hepar"],
    [/monitor blood pressure/gi, "pantau tekanan darah"],
    [/monitor heart rate/gi, "pantau denyut jantung"],
    [/to reduce intraocular pressure/gi, "untuk menurunkan tekanan intraokular"],
    [/intraocular pressure/gi, "tekanan intraokular"],
    [/reduces the extent of/gi, "mengurangi tingkat keparahan"],
    [/liver injury/gi, "kerusakan hepar"],
    [/paracetamol poisoning/gi, "keracunan parasetamol"],
    [/bacterial cell wall synthesis/gi, "sintesis dinding sel bakteri"],
    [/cell wall synthesis/gi, "sintesis dinding sel"],
    [/penicillin-binding proteins/gi, "penicillin-binding proteins (PBPs)"],
    [/thereby decreasing/gi, "sehingga menurunkan"],
    [/thereby causing/gi, "sehingga menyebabkan"],
    [/thereby inhibiting/gi, "sehingga menghambat"],
    [/thereby preventing/gi, "sehingga mencegah"],
    [/affecting cell division/gi, "mengganggu pembelahan sel"],
    [/depressant effect on the cns/gi, "efek depresan pada susunan saraf pusat (SSP)"],
    [/spontaneous activity/gi, "aktivitas spontan"],
    [/antiemetic properties/gi, "sifat antiemetik (antimuntah)"],
    [/peripheral vasodilatory action/gi, "aksi vasodilatasi perifer"],
    [/broad-spectrum/gi, "spektrum luas"],
    [/narrow-spectrum/gi, "spektrum sempit"],
    [/gram-positive and gram-negative/gi, "Gram-positif dan Gram-negatif"],
    [/gram-positive/gi, "Gram-positif"],
    [/gram-negative/gi, "Gram-negatif"],
    [/aerobic and anaerobic/gi, "aerob dan anaerob"],
    [/aerobic organisms/gi, "organisme aerob"],
    [/obligate anaerobes/gi, "anaerob obligat"],
    [/active against/gi, "aktif terhadap"],
    [/resistance is possible/gi, "resistensi dapat terjadi"],
    [/due to bacterial/gi, "akibat produksi enzim bakteri"],
    [/beta-lactamase production/gi, "produksi beta-laktamase"],
    [/beta-lactamase/gi, "beta-laktamase"],
    [/clostridial enterotoxaemia/gi, "enterotoksemia klostridial"],
    [/enterotoxaemia/gi, "enterotoksemia"],
    [/enterotoxemia/gi, "enterotoksemia"],
    [/fatal enterotoxaemia/gi, "enterotoksemia fatal"],
    [/hindgut-fermenting/gi, "hewan fermentor sekum"],
    [/guinea pigs/gi, "marmut"],
    [/chinchillas/gi, "chinchilla"],
    [/hamsters/gi, "hamster"],
    [/hypersensitivity reactions/gi, "reaksi hipersensitivitas"],
    [/hypersensitivity to/gi, "hipersensitivitas terhadap"],
    [/hypersensitivity/gi, "hipersensitivitas (alergi)"],
    [/anaphylactic reactions/gi, "reaksi anafilaksis"],
    [/anaphylaxis/gi, "anafilaksis"],
    [/gastrointestinal disturbances/gi, "gangguan saluran pencernaan"],
    [/gastrointestinal distress/gi, "gangguan saluran pencernaan"],
    [/gastrointestinal tract/gi, "saluran saluran pencernaan"],
    [/gastrointestinal/gi, "gastrointestinal (saluran cerna)"],
    [/gi distress/gi, "gangguan saluran cerna"],
    [/gi upset/gi, "gangguan lambung"],
    [/severe hepatic or renal impairment/gi, "gangguan fungsi hepar atau ginjal berat"],
    [/hepatic or renal impairment/gi, "gangguan fungsi hepar atau ginjal"],
    [/renal impairment/gi, "gangguan fungsi ginjal"],
    [/hepatic impairment/gi, "gangguan fungsi hepar"],
    [/renal failure/gi, "gagal ginjal"],
    [/liver disease/gi, "penyakit hepar"],
    [/heart failure/gi, "gagal jantung"],
    [/pulmonary obstruction/gi, "obstruksi paru"],
    [/pulmonary edema/gi, "edema paru"],
    [/metabolic acidosis/gi, "asidosis metabolik"],
    [/bone marrow suppression/gi, "supresi sumsum tulang"],
    [/polydipsia and polyuria/gi, "banyak minum (polidipsia) dan banyak kencing (poliuria)"],
    [/polydipsia/gi, "banyak minum (polidipsia)"],
    [/polyuria/gi, "banyak kencing (poliuria)"],
    [/polyphagia/gi, "nafsu makan meningkat (polifagia)"],
    [/hypokalaemia/gi, "penurunan kalium darah (hipokalemia)"],
    [/hypokalemia/gi, "penurunan kalium darah (hipokalemia)"],
    [/hyperkalaemia/gi, "peningkatan kalium darah (hiperkalemia)"],
    [/hyperkalemia/gi, "peningkatan kalium darah (hiperkalemia)"],
    [/hyponatraemia/gi, "hiponatremia"],
    [/hyponatremia/gi, "hiponatremia"],
    [/hypotension/gi, "tekanan darah rendah (hipotensi)"],
    [/hypertension/gi, "tekanan darah tinggi (hipertensi)"],
    [/bradycardia/gi, "penurunan denyut jantung (bradikardia)"],
    [/tachycardia/gi, "peningkatan denyut jantung (takikardia)"],
    [/arrhythmias/gi, "aritmia jantung"],
    [/sedation/gi, "sedasi (penenang)"],
    [/ataxia/gi, "sempoyongan (ataksia)"],
    [/vomiting/gi, "muntah"],
    [/diarrhoea/gi, "diare"],
    [/diarrhea/gi, "diare"],
    [/nausea/gi, "mual"],
    [/anorexia/gi, "penurunan nafsu makan (anoreksia)"],
    [/lethargy/gi, "lemas (letargi)"],
    [/pruritus/gi, "gatal (pruritus)"],
    [/urticaria/gi, "biduran (urtikaria)"],
    [/weakness/gi, "kelemahan fisik"],
    [/drowsiness/gi, "rasa kantuk"],
    [/restlessness/gi, "kegelisahan"],
    [/seizures/gi, "kejang"],
    [/tremors/gi, "tremor"],
    [/salivation/gi, "hipersalivasi (air liur berlebih)"],
    [/drooling/gi, "hipersalivasi"],
    [/loss of appetite/gi, "kehilangan nafsu makan"],
    [/weight loss/gi, "penurunan berat badan"],
    [/soft tissue infections/gi, "infeksi jaringan lunak"],
    [/urinary tract infections/gi, "infeksi saluran kemih (ISK)"],
    [/respiratory tract infections/gi, "infeksi saluran pernapasan"],
    [/skin infections/gi, "infeksi kulit"],
    [/ear infections/gi, "infeksi telinga (otitis)"],
    [/eye infections/gi, "infeksi mata"],
    [/wound infections/gi, "infeksi luka"],
    [/bacterial infections/gi, "infeksi bakteri"],
    [/fungal infections/gi, "infeksi jamur"],
    [/viral infections/gi, "infeksi virus"],
    [/parasitic infections/gi, "infeksi parasit"],
    [/blood concentrations/gi, "konsentrasi darah"],
    [/plasma concentrations/gi, "konsentrasi plasma darah"],
    [/serum concentrations/gi, "konsentrasi serum"],
    [/half-life/gi, "waktu paruh eliminasi"],
    [/bioavailability/gi, "bioavailabilitas"],
    [/protein binding/gi, "ikatan protein plasma"],
    [/excreted in urine/gi, "diekskresikan melalui urin"],
    [/excreted in the urine/gi, "diekskresikan melalui urin"],
    [/excreted in feces/gi, "diekskresikan melalui feses"],
    [/excreted in the faeces/gi, "diekskresikan melalui feses"],
    [/metabolized by the liver/gi, "dimetabolisme oleh organ hepar"],
    [/metabolized in the liver/gi, "dimetabolisme di organ hepar"],
    [/rapidly absorbed/gi, "diserap dengan cepat"],
    [/slowly absorbed/gi, "diserap secara lambat"],
    [/well absorbed/gi, "diserap dengan baik"],
    [/poorly absorbed/gi, "diserap dengan buruk"],
    [/administered orally/gi, "diberikan secara oral"],
    [/administered intravenously/gi, "diberikan secara intravena (IV)"],
    [/administered intramuscularly/gi, "diberikan secara intramuskular (IM)"],
    [/administered subcutaneously/gi, "diberikan secara subkutan (SC)"],
    [/oral administration/gi, "pemberian oral"],
    [/intravenous administration/gi, "pemberian intravena"],
    [/intramuscular administration/gi, "pemberian intramuskular"],
    [/subcutaneous administration/gi, "pemberian subkutan"],
    [/topical administration/gi, "pemberian topikal"],
    [/slow i\.v\./gi, "injeksi IV lambat"],
    [/i\.v\./gi, "IV"],
    [/i\.m\./gi, "IM"],
    [/s\.c\./gi, "SC"],
    [/p\.o\./gi, "oral (PO)"],
    [/q24h/gi, "setiap 24 jam (1x sehari)"],
    [/q12h/gi, "setiap 12 jam (2x sehari)"],
    [/q8h/gi, "setiap 8 jam (3x sehari)"],
    [/q6h/gi, "setiap 6 jam (4x sehari)"],
    [/once daily/gi, "sekali sehari"],
    [/twice daily/gi, "dua kali sehari"],
    [/three times daily/gi, "tiga kali sehari"],
    [/four times daily/gi, "empat kali sehari"],
    [/every 24 hours/gi, "setiap 24 jam"],
    [/every 12 hours/gi, "setiap 12 jam"],
    [/every 8 hours/gi, "setiap 8 jam"],
    [/every 6 hours/gi, "setiap 6 jam"],
    [/as needed/gi, "bila diperlukan (prn)"],
    [/as directed/gi, "sesuai petunjuk dokter"],
    [/pregnant animals/gi, "hewan bunting"],
    [/lactating animals/gi, "hewan menyusui"],
    [/breeding animals/gi, "hewan pembiak"],
    [/safety has not been established/gi, "keamanan belum dipastikan"],
    [/not established/gi, "belum dipastikan"],
    [/transient pain/gi, "rasa nyeri sementara"],
    [/transient/gi, "sementara (transien)"],
    [/injection site/gi, "lokasi penyuntikan"],
    [/at the injection site/gi, "pada lokasi penyuntikan"],
    [/local irritation/gi, "iritasi lokal"],
    [/tissue necrosis/gi, "nekrosis jaringan"],
    [/phlebitis/gi, "flebitis (radang pembuluh vena)"],
    [/extravasation/gi, "ekstravasasi cairan"],
    [/wash hands/gi, "cuci tangan"],
    [/wear gloves/gi, "kenakan sarung tangan medis"],
    [/protective clothing/gi, "pakaian pelindung"],
    [/store at room temperature/gi, "simpan pada suhu ruang (15°C–25°C)"],
    [/store in a refrigerator/gi, "simpan di lemari pendingin (2°C–8°C)"],
    [/do not freeze/gi, "jangan dibekukan"],
    [/protect from light/gi, "lindungi dari paparan cahaya langsung"],
    [/protect from moisture/gi, "lindungi dari kelembaban"]
  ];

  for (const [regex, replacement] of clauses) {
    s = s.replace(regex, replacement);
  }

  // Common linking words
  s = s.replace(/\bwhich\b/gi, "yang");
  s = s.replace(/\bthat\b/gi, "yang");
  s = s.replace(/\bwith\b/gi, "dengan");
  s = s.replace(/\band\b/gi, "dan");
  s = s.replace(/\bor\b/gi, "atau");
  s = s.replace(/\bbut\b/gi, "namun");
  s = s.replace(/\bif\b/gi, "jika");
  s = s.replace(/\bwhen\b/gi, "saat");
  s = s.replace(/\bfor\b/gi, "untuk");
  s = s.replace(/\bfrom\b/gi, "dari");
  s = s.replace(/\bto\b/gi, "ke");
  s = s.replace(/\bin\b/gi, "pada");
  s = s.replace(/\bon\b/gi, "pada");
  s = s.replace(/\bat\b/gi, "pada");
  s = s.replace(/\bby\b/gi, "oleh");
  s = s.replace(/\bboth\b/gi, "keduanya");
  s = s.replace(/\ball\b/gi, "semua");
  s = s.replace(/\bmost\b/gi, "sebagian besar");
  s = s.replace(/\bsome\b/gi, "beberapa");
  s = s.replace(/\bmany\b/gi, "banyak");
  s = s.replace(/\bother\b/gi, "lain");
  s = s.replace(/\bothers\b/gi, "lainnya");
  s = s.replace(/\bduring\b/gi, "selama");
  s = s.replace(/\bafter\b/gi, "setelah");
  s = s.replace(/\bbefore\b/gi, "sebelum");
  s = s.replace(/\bwithout\b/gi, "tanpa");
  s = s.replace(/\bunder\b/gi, "di bawah");
  s = s.replace(/\bover\b/gi, "lebih dari");
  s = s.replace(/\bbetween\b/gi, "antara");
  s = s.replace(/\babout\b/gi, "sekitar");
  s = s.replace(/\bapproximately\b/gi, "kurang lebih");
  s = s.replace(/\bhigh\b/gi, "tinggi");
  s = s.replace(/\blow\b/gi, "rendah");
  s = s.replace(/\blong\b/gi, "panjang");
  s = s.replace(/\bshort\b/gi, "pendek");
  s = s.replace(/\blarge\b/gi, "besar");
  s = s.replace(/\bsmall\b/gi, "kecil");
  s = s.replace(/\bacute\b/gi, "akut");
  s = s.replace(/\bchronic\b/gi, "kronis");
  s = s.replace(/\bsevere\b/gi, "berat");
  s = s.replace(/\bmild\b/gi, "ringan");
  s = s.replace(/\bmoderate\b/gi, "sedang");
  s = s.replace(/\brare\b/gi, "jarang");
  s = s.replace(/\bcommon\b/gi, "umum");
  s = s.replace(/\bpatient\b/gi, "pasien");
  s = s.replace(/\bpatients\b/gi, "pasien");
  s = s.replace(/\banimal\b/gi, "hewan");
  s = s.replace(/\banimals\b/gi, "hewan");
  s = s.replace(/\bdose\b/gi, "dosis");
  s = s.replace(/\bdoses\b/gi, "dosis");
  s = s.replace(/\bdosing\b/gi, "pemberian dosis");
  s = s.replace(/\btablet\b/gi, "tablet");
  s = s.replace(/\btablets\b/gi, "tablet");
  s = s.replace(/\bcapsule\b/gi, "kapsul");
  s = s.replace(/\bcapsules\b/gi, "kapsul");
  s = s.replace(/\bsuspension\b/gi, "suspensi");
  s = s.replace(/\binjection\b/gi, "injeksi");
  s = s.replace(/\bsolution\b/gi, "larutan");
  s = s.replace(/\bdrops\b/gi, "tetes");
  s = s.replace(/\bointment\b/gi, "salep");
  s = s.replace(/\bcream\b/gi, "krim");
  s = s.replace(/\btherapy\b/gi, "terapi");
  s = s.replace(/\btreatment\b/gi, "pengobatan");

  return s.trim();
}

console.log('Testing translation of Acetazolamide uses:');
const acUses = "Acetazolamide is used in the management of glaucoma to reduce intraocular pressure. It has also been used to treat episodic falling in Cavalier King Charles Spaniels.";
console.log('EN:', acUses);
console.log('ID:', translateMedicalText(acUses));

console.log('\nTesting translation of Acetazolamide adverse:');
const acAdv = "Weakness, GI distress, hypokalaemia, metabolic acidosis, bone marrow suppression, polydipsia and polyuria have all been reported in humans, but only rarely in dogs.";
console.log('EN:', acAdv);
console.log('ID:', translateMedicalText(acAdv));
