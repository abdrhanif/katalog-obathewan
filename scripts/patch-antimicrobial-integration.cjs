const fs = require('fs');
const path = require('path');

console.log('Starting antimicrobial guide integration...');

// =========================================================================
// 1. UPDATE public/js/prescription-guidelines.js
// =========================================================================
const pgPath = path.join(__dirname, '../public/js/prescription-guidelines.js');
let pgCode = fs.readFileSync(pgPath, 'utf8');

// Ensure import of checkAntimicrobialClinicalWarnings
if (!pgCode.includes('checkAntimicrobialClinicalWarnings')) {
  pgCode = `import { checkAntimicrobialClinicalWarnings } from "./antimicrobial-guide-data.js";\n` + pgCode;
}

// Add Stage 5 to VET_PRESCRIPTION_ALGORITHM if not present
if (!pgCode.includes('id: "stage-5"')) {
  const stage5Code = `    {
      id: "stage-5",
      number: "Tahap 5",
      title: "Prinsip Penggunaan Antimikroba Bijak (Antimicrobial Stewardship & ASTAG)",
      badge: "Resistensi & AMR",
      summary: "Kaidah pemilihan antibiotik rasional menurut pedoman The University of Melbourne & Agriculture Victoria guna mencegah resistensi antimikroba (AMR).",
      principles: [
        {
          label: "Sistem Lampu Lalu Lintas (Traffic Light ASTAG)",
          items: [
            "🟢 Low Importance (Lini 1): Pilihan empiris utama (Amoxycillin, Ampicillin, Penicillin, Doxycycline, TMS, Chloramphenicol).",
            "🟡 Medium Importance (Lini 2): Terbatas pada indikasi spesifik (Amox-Clav, Cefazolin, Cephalexin, Gentamicin, Metronidazole, Clindamycin).",
            "🔴 High Importance (Kritis): Cadangan ketat HANYA untuk kondisi luar biasa jika uji C&S membuktikan tidak ada alternatif (Cefovecin, Ceftazidime, Cefotaxime, Fluoroquinolones, Nitrofurantoin)."
          ]
        },
        {
          label: "Strategi Dosis Farmakodinamika (PK/PD)",
          items: [
            "Time-Dependent (T > MIC): Penisilin, Sefalosporin, TMS, Klindamisin -> Efikasi tergantung durasi kadar obat di atas MIC (50-80% interval). Jaga interval frekuensi teratur (q8h/q12h).",
            "Concentration-Dependent (Cmax : MIC > 8): Aminoglikosida (Gentamicin), Fluoroquinolon (Enrofloxacin), Metronidazole -> Efikasi tergantung puncak konsentrasi. Berikan dosis tinggi interval panjang (q24h sekali sehari)."
          ]
        },
        {
          label: "Kaidah Penanganan MRSP (Methicillin-Resistant S. pseudintermedius)",
          items: [
            "Resisten terhadap SELURUH antibiotik golongan beta-laktam (termasuk Amox-Clav, Sefalosporin, dan Karbapenem).",
            "PRIORITASKAN TERAPI TOPIKAL: MRSP tidak resisten terhadap antiseptik klorheksidin atau pemutih encer.",
            "Terapi sistemik HANYA jika topikal gagal dan wajib berpedoman pada hasil Kultur & Sensitivitas (C&S)."
          ]
        }
      ]
    }\n  ]`;

  pgCode = pgCode.replace(/\s*\]\s*;\s*export const VET_CLINICAL_PRESETS/, `,\n${stage5Code};\n\nexport const VET_CLINICAL_PRESETS`);
}

// Enhance checkSpeciesSafety with checkAntimicrobialClinicalWarnings
if (!pgCode.includes('checkAntimicrobialClinicalWarnings({')) {
  pgCode = pgCode.replace(
    'return alerts;\n}',
    `  // Antimicrobial clinical safety warnings (Melbourne & AgVic guide)
  const amAlerts = checkAntimicrobialClinicalWarnings({
    species,
    drugQuery: drugName,
    formulation
  });
  amAlerts.forEach(a => {
    if (!alerts.some(existing => existing.title === a.title)) {
      alerts.push(a);
    }
  });

  return alerts;\n}`
  );
}

fs.writeFileSync(pgPath, pgCode, 'utf8');
console.log('✓ Updated public/js/prescription-guidelines.js');


// =========================================================================
// 2. UPDATE public/js/calculator.js
// =========================================================================
const calcPath = path.join(__dirname, '../public/js/calculator.js');
let calcCode = fs.readFileSync(calcPath, 'utf8');

if (!calcCode.includes('checkAntimicrobialClinicalWarnings')) {
  calcCode = `import { checkAntimicrobialClinicalWarnings } from "./antimicrobial-guide-data.js";\n` + calcCode;
}

if (!calcCode.includes('checkAntimicrobialClinicalWarnings({')) {
  const insertTarget = '  const romanQty = toRomanNumeral(roundedTotalQuantity);';
  const amWarningInjection = `  // Antimicrobial Guide Warnings (Melbourne & AgVic)
  const amAlerts = checkAntimicrobialClinicalWarnings({
    species,
    drugQuery: (drug.id || '') + ' ' + (drug.activeIngredient || ''),
    doseRate: rate,
    formulation: formulation.name || formulation.type || '',
    weight: weightInKg
  });
  amAlerts.forEach(a => {
    warnings.push(a.title + ': ' + a.message);
  });

`;
  calcCode = calcCode.replace(insertTarget, amWarningInjection + insertTarget);
}

fs.writeFileSync(calcPath, calcCode, 'utf8');
console.log('✓ Updated public/js/calculator.js');


// =========================================================================
// 3. UPDATE public/index.html
// =========================================================================
const htmlPath = path.join(__dirname, '../public/index.html');
let htmlCode = fs.readFileSync(htmlPath, 'utf8');

// A. Insert #calc-antimicrobial-box after the 12-col grid in dosage-calc-form if not present
if (!htmlCode.includes('id="calc-antimicrobial-box"')) {
  const calcBoxHtml = `
        <!-- Dynamic Antimicrobial Stewardship, Risk & Interaction Panel (University of Melbourne & AgVic) -->
        <div id="calc-antimicrobial-box" class="hidden rounded-2xl border transition-all duration-300">
          <!-- Dynamically populated by app.js when an antimicrobial is selected -->
        </div>
`;
  htmlCode = htmlCode.replace(
    '<!-- 2B. MEJA FORMULA PERACIKAN OBAT (INTEGRATED COMPOUNDING DESK) -->',
    calcBoxHtml + '\n      <!-- 2B. MEJA FORMULA PERACIKAN OBAT (INTEGRATED COMPOUNDING DESK) -->'
  );
}

// B. Insert #modal-antimicrobial-section in Learn More modal if not present
if (!htmlCode.includes('id="modal-antimicrobial-section"')) {
  const modalSectionHtml = `
        <!-- Antimicrobial Stewardship Intelligence (University of Melbourne / AgVic) -->
        <div id="modal-antimicrobial-section" class="hidden p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-3">
          <!-- Dynamically populated if drug is antimicrobial -->
        </div>
`;
  htmlCode = htmlCode.replace(
    '<!-- Comprehensive Details / Counseling & Monitoring -->',
    modalSectionHtml + '\n        <!-- Comprehensive Details / Counseling & Monitoring -->'
  );
}

// C. Insert #antimicrobial-guideline-container in subview-calc-guidelines if not present
if (!htmlCode.includes('id="antimicrobial-guideline-container"')) {
  const guideContainerHtml = `
        <!-- Matriks Spektrum Aktivitas & Lembar Fakta MRSP (University of Melbourne / AgVic) -->
        <div id="antimicrobial-guideline-container" class="space-y-6">
          <!-- Dynamically populated with Spectrum Table & MRSP Guidelines -->
        </div>
`;
  htmlCode = htmlCode.replace(
    '</div>\n      </div>\n\n    </section>\n\n    <!-- ========================================== -->\n    <!-- 3. RESEP VETERINER / PRESCRIPTION SECTION  -->',
    `</div>\n${guideContainerHtml}      </div>\n\n    </section>\n\n    <!-- ========================================== -->\n    <!-- 3. RESEP VETERINER / PRESCRIPTION SECTION  -->`
  );
}

fs.writeFileSync(htmlPath, htmlCode, 'utf8');
console.log('✓ Updated public/index.html');

console.log('Base files updated successfully!');
