const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '../public/js/app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

console.log('Patching public/js/app.js for antimicrobial guide integration...');

// 1. Add imports at the top
if (!code.includes('ANTIMICROBIAL_STEWARDSHIP_DATA')) {
  code = code.replace(
    'import { VET_PRESCRIPTION_ALGORITHM, VET_CLINICAL_PRESETS, checkSpeciesSafety, ClinicalPresetManager } from "./prescription-guidelines.js";',
    `import { VET_PRESCRIPTION_ALGORITHM, VET_CLINICAL_PRESETS, checkSpeciesSafety, ClinicalPresetManager } from "./prescription-guidelines.js";\nimport { ANTIMICROBIAL_STEWARDSHIP_DATA, findAntimicrobialProfile, getAntimicrobialSummaryCard } from "./antimicrobial-guide-data.js";`
  );
  console.log('✓ Added antimicrobial imports to app.js');
}

// 2. Update renderCatalog() to include ASTAG badges on drug cards
const catalogTarget = `            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-xl font-bold text-slate-900">\${drug.activeIngredient}</h3>
                <span class="bg-teal-50 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-teal-200">
                  \${drugClass}
                </span>
              </div>`;

const catalogReplacement = `            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-xl font-bold text-slate-900">\${drug.activeIngredient}</h3>
                <span class="bg-teal-50 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-teal-200">
                  \${drugClass}
                </span>
                \${(() => {
                  const am = findAntimicrobialProfile(drug.activeIngredient || drug.id);
                  if (!am) return '';
                  const isHigh = am.importance_rating === 'High';
                  const isMed = am.importance_rating === 'Medium';
                  const cls = isHigh 
                    ? 'bg-rose-100 text-rose-900 border border-rose-300' 
                    : isMed 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300';
                  const dot = isHigh ? 'bg-rose-600' : isMed ? 'bg-amber-600' : 'bg-emerald-600';
                  return \`<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 \${cls}">
                    <span class="w-1.5 h-1.5 rounded-full \${dot}"></span>
                    \${am.stewardshipBadge}
                  </span>\`;
                })()}
              </div>`;

if (code.includes(catalogTarget)) {
  code = code.replace(catalogTarget, catalogReplacement);
  console.log('✓ Injected ASTAG badges into renderCatalog');
}

// 3. Update updateSpeciesSafetyAlerts() to call updateAntimicrobialCalculatorBox()
if (!code.includes('this.updateAntimicrobialCalculatorBox(drug, formulation);')) {
  code = code.replace(
    'const alerts = checkSpeciesSafety(\n      this.calcState.species,\n      drug?.activeIngredient || "",\n      formulation?.name || ""\n    );',
    `const alerts = checkSpeciesSafety(
      this.calcState.species,
      (drug?.id || '') + ' ' + (drug?.activeIngredient || ''),
      formulation?.name || formulation?.type || ''
    );
    this.updateAntimicrobialCalculatorBox(drug, formulation);`
  );
  console.log('✓ Wired updateAntimicrobialCalculatorBox into updateSpeciesSafetyAlerts');
}

// 4. Update openLearnMoreModal() to render #modal-antimicrobial-section
const modalTarget = `    document.getElementById("modal-interactions").textContent = c.drugInteractions || drug.drugInteractions;`;
const modalReplacement = `    document.getElementById("modal-interactions").textContent = c.drugInteractions || drug.drugInteractions;

    // Antimicrobial Stewardship Intelligence in Modal
    this.renderAntimicrobialModalSection(drug);`;

if (code.includes(modalTarget) && !code.includes('this.renderAntimicrobialModalSection(drug);')) {
  code = code.replace(modalTarget, modalReplacement);
  console.log('✓ Wired renderAntimicrobialModalSection into openLearnMoreModal');
}

// 5. Add helper methods to App class before the closing bracket
const helperMethods = `
  /* ------------------------------------------------------------- */
  /* ANTIMICROBIAL STEWARDSHIP & INTERACTIONS METHODS              */
  /* ------------------------------------------------------------- */
  updateAntimicrobialCalculatorBox(drug, formulation) {
    const box = document.getElementById("calc-antimicrobial-box");
    if (!box) return;

    if (!drug) {
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }

    const am = findAntimicrobialProfile((drug.id || "") + " " + (drug.activeIngredient || ""));
    if (!am) {
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }

    const isHigh = am.importance_rating === "High";
    const isMed = am.importance_rating === "Medium";
    const borderCol = isHigh ? "border-rose-300 bg-rose-50/50" : isMed ? "border-amber-300 bg-amber-50/40" : "border-teal-300 bg-teal-50/40";
    const badgeCol = isHigh ? "bg-rose-100 text-rose-900 border-rose-300" : isMed ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-emerald-100 text-emerald-900 border-emerald-300";

    box.className = \`p-5 rounded-2xl border transition-all duration-300 space-y-4 shadow-sm \${borderCol}\`;
    box.classList.remove("hidden");

    box.innerHTML = \`
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/80 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg shadow-sm">
            <i class="ph-bold ph-shield-check"></i>
          </div>
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-teal-800">Pedoman Antimikroba Bijak (Melbourne & AgVic)</div>
            <h4 class="font-bold text-slate-900 text-sm sm:text-base">\${am.antibiotic} (\${am.drug_class})</h4>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border \${badgeCol}">
            \${am.stewardshipBadge}
          </span>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-slate-800 border border-slate-200 shadow-xs">
            \${am.pkPdType.split('(')[0].trim()}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <!-- Left: PK/PD & Stewardship Dosing Rules -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-2.5">
          <div class="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <i class="ph-bold ph-chart-line-up text-teal-600"></i>
            <span>Strategi Dosis Berbasis PK/PD & Stewardship:</span>
          </div>
          <p class="text-slate-700 leading-relaxed text-[11px] font-medium">\${am.pkPdGuidance}</p>
          <div class="p-2 rounded-lg bg-teal-50 text-teal-900 text-[11px]">
            <b>Rekomendasi Dosis Panduan:</b> \${am.drug_dose || "-"} (\${(am.routes || []).join(", ")})
          </div>
          <div class="space-y-1 text-[11px]">
            <span class="font-bold text-slate-800 block">Mutiara Klinis Terpilih:</span>
            <ul class="list-disc pl-4 space-y-0.5 text-slate-600">
              \${(am.clinical_pearls || []).slice(0, 3).map(p => \`<li>\${p}</li>\`).join("")}
            </ul>
          </div>
        </div>

        <!-- Right: Drug Interactions & Cautions -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-2.5">
          <div class="font-bold text-rose-950 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <i class="ph-bold ph-arrows-clockwise text-rose-600"></i>
            <span>Interaksi Obat & Pantangan Campuran:</span>
          </div>
          \${am.interactions && am.interactions.length > 0 ? \`
            <ul class="space-y-1.5 text-[11px]">
              \${am.interactions.map(it => \`
                <li class="p-2 rounded-lg bg-rose-50/70 border border-rose-200/70 text-rose-950 leading-relaxed flex items-start gap-1.5">
                  <i class="ph-bold ph-warning-circle text-rose-600 shrink-0 mt-0.5"></i>
                  <span>\${it}</span>
                </li>
              \`).join("")}
            </ul>
          \` : \`
            <p class="text-slate-500 italic text-[11px]">Tidak ada interaksi mayor spesifik yang tercatat dalam panduan ini.</p>
          \`}

          <div class="pt-1">
            <span class="font-bold text-slate-800 block text-[11px]">Efek Samping Kunci:</span>
            <ul class="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
              \${(am.adverse_reactions || []).slice(0, 2).map(r => \`<li>\${r}</li>\`).join("")}
            </ul>
          </div>
        </div>
      </div>
    \`;
  }

  renderAntimicrobialModalSection(drug) {
    const amSection = document.getElementById("modal-antimicrobial-section");
    if (!amSection) return;

    if (!drug) {
      amSection.classList.add("hidden");
      amSection.innerHTML = "";
      return;
    }

    const am = findAntimicrobialProfile((drug.id || "") + " " + (drug.activeIngredient || ""));
    if (!am) {
      amSection.classList.add("hidden");
      amSection.innerHTML = "";
      return;
    }

    const isHigh = am.importance_rating === "High";
    const isMed = am.importance_rating === "Medium";
    const badgeCol = isHigh ? "bg-rose-100 text-rose-900 border border-rose-300" : isMed ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300";

    amSection.classList.remove("hidden");
    amSection.innerHTML = \`
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-teal-200 pb-2">
        <div class="flex items-center gap-2">
          <i class="ph-bold ph-shield-check text-teal-700 text-lg"></i>
          <h4 class="font-bold text-teal-900 text-xs sm:text-sm uppercase tracking-wide">
            Pedoman Antimikroba & Stewardship (Melbourne / AgVic)
          </h4>
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold \${badgeCol}">
          \${am.stewardshipBadge}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-lg bg-white border border-teal-100 space-y-1">
          <div class="font-bold text-teal-900 flex items-center gap-1">
            <i class="ph-bold ph-chart-line-up"></i> Karakteristik PK/PD:
          </div>
          <p class="font-semibold text-slate-800">\${am.pkPdType}</p>
          <p class="text-slate-600 text-[11px] leading-relaxed">\${am.pkPdGuidance}</p>
        </div>

        <div class="p-3 rounded-lg bg-white border border-teal-100 space-y-1">
          <div class="font-bold text-teal-900 flex items-center gap-1">
            <i class="ph-bold ph-stethoscope"></i> Rentang Dosis Rekomendasi:
          </div>
          <p class="font-mono text-teal-800 font-bold">\${am.drug_dose || "-"}</p>
          <p class="text-slate-500 text-[11px]">Rute: \${(am.routes || []).join(", ")} • Teregistrasi Hewan: \${am.registered_for_animals ? "Ya (Veteriner)" : "Off-Label / Manusia"}</p>
        </div>
      </div>

      <div class="space-y-2 text-xs">
        <div class="p-3 rounded-lg bg-rose-50/70 border border-rose-200">
          <div class="font-bold text-rose-900 flex items-center gap-1 mb-1">
            <i class="ph-bold ph-warning-octagon"></i> Reaksi Samping & Resiko Kritis:
          </div>
          <ul class="list-disc pl-4 space-y-1 text-rose-950 text-[11px]">
            \${(am.adverse_reactions || []).map(r => \`<li>\${r}</li>\`).join("")}
          </ul>
        </div>

        <div class="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
          <div class="font-bold text-emerald-900 flex items-center gap-1 mb-1">
            <i class="ph-bold ph-lightbulb"></i> Mutiara Klinis & Indikasi Pilihan (Clinical Pearls):
          </div>
          <ul class="list-disc pl-4 space-y-1 text-emerald-950 text-[11px]">
            \${(am.clinical_pearls || []).map(p => \`<li>\${p}</li>\`).join("")}
          </ul>
        </div>

        \${am.interactions && am.interactions.length > 0 ? \`
          <div class="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
            <div class="font-bold text-amber-900 flex items-center gap-1 mb-1">
              <i class="ph-bold ph-arrows-left-right"></i> Interaksi Obat Penting (University of Melbourne):
            </div>
            <ul class="list-disc pl-4 space-y-1 text-amber-950 text-[11px]">
              \${am.interactions.map(it => \`<li>\${it}</li>\`).join("")}
            </ul>
          </div>
        \` : ""}
      </div>
    \`;
  }

  renderAntimicrobialFullGuide() {
    const container = document.getElementById("antimicrobial-guideline-container");
    if (!container) return;

    const data = ANTIMICROBIAL_STEWARDSHIP_DATA;
    const spec = data.spectrumOfActivity;
    const mrsp = data.mrspFactSheet;

    container.innerHTML = \`
      <!-- Section 1: Interactive Spectrum of Activity Matrix -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Spectrum of Activity Matrix
              </span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 mt-1">Matriks Spektrum Aktivitas Antibiotik Veteriner</h3>
            <p class="text-xs text-slate-500 mt-0.5">Panduan sensitivitas empiris 21 patogen bakteri kunci anjing & kucing terhadap 12 kelompok antibiotik.</p>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <input 
              type="text" 
              id="am-spectrum-search" 
              placeholder="Cari bakteri / patogen..." 
              class="py-1.5 px-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 w-48"
            >
          </div>
        </div>

        <!-- Legend Pills -->
        <div class="flex flex-wrap gap-2 text-[11px] p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span class="font-bold text-slate-700">Keterangan Simbol:</span>
          <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">✓ = Pilihan Utama (Drug of Choice)</span>
          <span class="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-bold border border-teal-200">+ = Sensitivitas Baik</span>
          <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">± = Sensitivitas Variatif</span>
          <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold border border-rose-200">IR = Resisten Alami (Intrinsically Resistant)</span>
          <span class="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold border border-purple-200">§ = Resiko MDR Tinggi (Wajib C&S)</span>
        </div>

        <!-- Table Responsive -->
        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-[11px] text-left border-collapse">
            <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th class="py-2.5 px-3 whitespace-nowrap bg-slate-200 sticky left-0 z-10">Bakteri / Patogen</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-emerald-50 text-emerald-950">Penicillin</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-emerald-50 text-emerald-950">Amox / Ampi</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-emerald-50 text-emerald-950">Doxycycline</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-emerald-50 text-emerald-950">TMS</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-amber-50 text-amber-950">Amox-Clav</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-amber-50 text-amber-950">Cephalexin</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-amber-50 text-amber-950">Gentamicin</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-amber-50 text-amber-950">Metronidazole</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-amber-50 text-amber-950">Clindamycin</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-rose-50 text-rose-950">Cefovecin</th>
                <th class="py-2.5 px-2 text-center whitespace-nowrap bg-rose-50 text-rose-950">Enrofloxacin</th>
              </tr>
            </thead>
            <tbody id="am-spectrum-tbody" class="divide-y divide-slate-200 bg-white">
              \${spec.bacteria_susceptibility.map(b => \`
                <tr class="hover:bg-teal-50/40 transition">
                  <td class="py-2 px-3 font-semibold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200">
                    <div>\${b.organism}</div>
                    <span class="text-[9px] text-slate-400 font-normal uppercase">\${b.category}</span>
                  </td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Penicillin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Penicillin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Penicillin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Ampicillin / amoxycillin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Ampicillin / amoxycillin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Ampicillin / amoxycillin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Doxycycline'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Doxycycline'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Doxycycline'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Trimethoprim sulpha'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Trimethoprim sulpha'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Trimethoprim sulpha'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Amoxycillin clavulanate'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Amoxycillin clavulanate'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Amoxycillin clavulanate'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Cefazolin / cephalexin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Cefazolin / cephalexin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Cefazolin / cephalexin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Gentamicin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Gentamicin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Gentamicin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Metronidazole'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Metronidazole'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Metronidazole'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Clindamycin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Clindamycin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Clindamycin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Cefovecin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Cefovecin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Cefovecin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono \${b.activity['Enrofloxacin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Enrofloxacin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">\${b.activity['Enrofloxacin'] || '-'}</td>
                </tr>
              \`).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 2: Lembar Fakta MRSP (Methicillin-Resistant S. pseudintermedius) -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Resistensi Kritis
              </span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 mt-1">\${mrsp.title}</h3>
            <p class="text-xs text-slate-500 mt-0.5">Pedoman klinis penanganan infeksi MRSP pada anjing dan kucing & biosafety dokter hewan.</p>
          </div>
          <span class="px-3 py-1 rounded-xl bg-rose-100 text-rose-950 font-bold text-xs border border-rose-300">
            Resisten Terhadap Seluruh Beta-Laktam
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <!-- Fakta Kunci -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 class="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <i class="ph-bold ph-info text-teal-600"></i>
              <span>Fakta Kunci MRSP:</span>
            </h4>
            <ul class="space-y-1.5 text-slate-700 text-[11px] list-disc pl-4 leading-relaxed">
              \${mrsp.key_facts.map(f => \`<li>\${f}</li>\`).join("")}
            </ul>
          </div>

          <!-- Opsi Terapi & Peringatan Beta-Laktam -->
          <div class="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <h4 class="font-bold text-amber-950 flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
              <i class="ph-bold ph-first-aid text-amber-700"></i>
              <span>Prinsip Pengobatan:</span>
            </h4>
            <div class="p-2 rounded-lg bg-rose-100/80 border border-rose-300 text-rose-950 text-[11px] font-bold">
              ⛔ TIDAK EFEKTIF: \${mrsp.treatment_options.ineffective_beta_lactams.excluded_drugs.join(", ")}
            </div>
            <ul class="space-y-1.5 text-amber-950 text-[11px] list-disc pl-4 leading-relaxed">
              \${mrsp.treatment_options.general_principles.map(p => \`<li>\${p}</li>\`).join("")}
            </ul>
          </div>

          <!-- Biosecurity & Zoonosis -->
          <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <h4 class="font-bold text-emerald-950 flex items-center gap-1.5 border-b border-emerald-200 pb-1.5">
              <i class="ph-bold ph-hand-soap text-emerald-700"></i>
              <span>Biosekuriti & Risiko Zoonosis:</span>
            </h4>
            <ul class="space-y-1 text-emerald-950 text-[11px] list-disc pl-4 leading-relaxed">
              <li><b>Cuci Tangan:</b> Wajib cuci tangan/hand sanitiser sebelum & setelah memeriksa tiap pasien.</li>
              <li><b>APD:</b> Kenakan sarung tangan medis saat menangani lesi kulit.</li>
              <li><b>Isolasi:</b> Isolasi pasien MRSP dari ruang rawat inap umum.</li>
              <li><b>Edukasi Pemilik:</b> Ingatkan pemilik tentang risiko penularan pada lansia atau yang memiliki luka terbuka.</li>
            </ul>
          </div>
        </div>
      </div>
    \`;

    // Setup spectrum search filter
    const searchInp = document.getElementById("am-spectrum-search");
    searchInp?.addEventListener("input", (e) => {
      const q = (e.target.value || "").toLowerCase().trim();
      const rows = document.querySelectorAll("#am-spectrum-tbody tr");
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          r.classList.remove("hidden");
        } else {
          r.classList.add("hidden");
        }
      });
    });
  }
`;

// Insert helper methods right before the last closing brace of class App
const lastBraceIndex = code.lastIndexOf('}');
code = code.slice(0, lastBraceIndex) + '\n' + helperMethods + '\n' + code.slice(lastBraceIndex);

// Wire renderAntimicrobialFullGuide into renderPrescriptionAlgorithmCard()
if (!code.includes('this.renderAntimicrobialFullGuide();')) {
  code = code.replace(
    'renderPrescriptionAlgorithmCard() {',
    `renderPrescriptionAlgorithmCard() {\n    setTimeout(() => this.renderAntimicrobialFullGuide(), 0);`
  );
  console.log('✓ Wired renderAntimicrobialFullGuide into renderPrescriptionAlgorithmCard');
}

fs.writeFileSync(appJsPath, code, 'utf8');
console.log('✓ Successfully patched public/js/app.js with antimicrobial intelligence!');
