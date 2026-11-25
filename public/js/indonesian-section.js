/**
 * Controller for Indonesian Veterinary Drug Formulary Section
 * Manages 434 Indonesian veterinary formulary entries, Prohibited Substances (Negative List),
 * BPOM Special Surveillance (Precursors & OOT), and Prescription Standards.
 */

import {
  INDONESIAN_FORMULARY_METADATA,
  INDONESIAN_PROHIBITED_DRUGS,
  INDONESIAN_PRESCRIPTION_STANDARDS,
  INDONESIAN_SPECIAL_SURVEILLANCE,
  INDONESIAN_DRUGS
} from "./indonesian-formulary-data.js";

export class IndonesianFormularyController {
  constructor(appInstance) {
    this.app = appInstance;
    this.drugs = INDONESIAN_DRUGS || [];
    this.prohibited = INDONESIAN_PROHIBITED_DRUGS || [];
    this.standards = INDONESIAN_PRESCRIPTION_STANDARDS || [];
    this.surveillance = INDONESIAN_SPECIAL_SURVEILLANCE || [];
    this.metadata = INDONESIAN_FORMULARY_METADATA || {};

    this.searchQuery = "";
    this.selectedClass = "all";
    this.selectedSpecies = "all";
    this.selectedAccess = "all";
    this.currentPage = 1;
    this.itemsPerPage = 18;
    this.currentSubtab = "catalog"; // 'catalog', 'prohibited', 'surveillance', 'standards'
    this.activeModalDrug = null;
  }

  init() {
    this.setupSubtabs();
    this.populateFilterDropdowns();
    this.setupEventListeners();
    this.renderCurrentView();
    this.renderProhibitedTable();
    this.renderSurveillanceTable();
    this.renderStandardsCards();
  }

  setupSubtabs() {
    const tabs = [
      { btnId: "indo-subtab-catalog", paneId: "indo-pane-catalog", tabKey: "catalog" },
      { btnId: "indo-subtab-prohibited", paneId: "indo-pane-prohibited", tabKey: "prohibited" },
      { btnId: "indo-subtab-surveillance", paneId: "indo-pane-surveillance", tabKey: "surveillance" },
      { btnId: "indo-subtab-standards", paneId: "indo-pane-standards", tabKey: "standards" }
    ];

    tabs.forEach(({ btnId, paneId, tabKey }) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener("click", () => {
        this.currentSubtab = tabKey;
        tabs.forEach(t => {
          document.getElementById(t.paneId)?.classList.add("hidden");
          const b = document.getElementById(t.btnId);
          b?.classList.remove("bg-rose-600", "text-white", "shadow-sm");
          b?.classList.add("bg-white", "text-slate-700", "hover:bg-slate-100", "border-slate-200");
        });

        document.getElementById(paneId)?.classList.remove("hidden");
        btn.classList.add("bg-rose-600", "text-white", "shadow-sm");
        btn.classList.remove("bg-white", "text-slate-700", "hover:bg-slate-100", "border-slate-200");
      });
    });
  }

  populateFilterDropdowns() {
    const classSelect = document.getElementById("indo-filter-class");
    if (classSelect) {
      const classesSet = new Set();
      this.drugs.forEach(d => {
        if (d.majorClass) classesSet.add(d.majorClass);
      });
      const sortedClasses = Array.from(classesSet).sort((a, b) => {
        const numA = parseInt(a) || 999;
        const numB = parseInt(b) || 999;
        return numA - numB;
      });

      let optionsHtml = '<option value="all">Semua Kelas Terapi (' + sortedClasses.length + ' Kelas)</option>';
      sortedClasses.forEach(cls => {
        // Clean display name
        const cleanName = cls.replace(/^\d+\.\s*/, "");
        optionsHtml += `<option value="${this.escapeHtml(cls)}">${this.escapeHtml(cls)}</option>`;
      });
      classSelect.innerHTML = optionsHtml;
    }
  }

  setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById("indo-drug-search");
    let searchTimer = null;
    searchInput?.addEventListener("input", (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.currentPage = 1;
        this.renderDrugs();
      }, 250);
    });

    // Clear search
    document.getElementById("indo-drug-search-clear")?.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        this.searchQuery = "";
        this.currentPage = 1;
        this.renderDrugs();
      }
    });

    // Class Filter
    document.getElementById("indo-filter-class")?.addEventListener("change", (e) => {
      this.selectedClass = e.target.value;
      this.currentPage = 1;
      this.renderDrugs();
    });

    // Species Filter
    document.getElementById("indo-filter-species")?.addEventListener("change", (e) => {
      this.selectedSpecies = e.target.value;
      this.currentPage = 1;
      this.renderDrugs();
    });

    // Access Category Filter
    document.getElementById("indo-filter-access")?.addEventListener("change", (e) => {
      this.selectedAccess = e.target.value;
      this.currentPage = 1;
      this.renderDrugs();
    });

    // Reset All Filters
    document.getElementById("indo-btn-reset-filters")?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      this.searchQuery = "";
      this.selectedClass = "all";
      this.selectedSpecies = "all";
      this.selectedAccess = "all";
      const classSelect = document.getElementById("indo-filter-class");
      const speciesSelect = document.getElementById("indo-filter-species");
      const accessSelect = document.getElementById("indo-filter-access");
      if (classSelect) classSelect.value = "all";
      if (speciesSelect) speciesSelect.value = "all";
      if (accessSelect) accessSelect.value = "all";
      this.currentPage = 1;
      this.renderDrugs();
    });

    // Modal Close Listeners
    const modal = document.getElementById("modal-indo-detail");
    document.getElementById("btn-close-indo-modal")?.addEventListener("click", () => {
      modal?.classList.add("hidden");
    });
    document.getElementById("btn-modal-indo-close")?.addEventListener("click", () => {
      modal?.classList.add("hidden");
    });
    modal?.addEventListener("click", (e) => {
      if (e.target.id === "modal-indo-detail") modal.classList.add("hidden");
    });

    // Modal Action: Add to Prescription
    document.getElementById("btn-modal-indo-add-rx")?.addEventListener("click", () => {
      if (this.activeModalDrug) {
        this.addDrugToCart(this.activeModalDrug);
        modal?.classList.add("hidden");
      }
    });

    // Modal Action: Send to Calculator
    document.getElementById("btn-modal-indo-calc")?.addEventListener("click", () => {
      if (this.activeModalDrug) {
        modal?.classList.add("hidden");
        this.sendDrugToCalculator(this.activeModalDrug);
      }
    });
  }

  getFilteredDrugs() {
    return this.drugs.filter(drug => {
      // 1. Search Query
      if (this.searchQuery) {
        const q = this.searchQuery;
        const matchesInn = drug.inn.toLowerCase().includes(q);
        const matchesClass = (drug.effectiveClass || "").toLowerCase().includes(q);
        const matchesIndication = (drug.indication || "").toLowerCase().includes(q);
        const matchesForm = (drug.formulation || "").toLowerCase().includes(q);
        const matchesDose = (drug.dosage || "").toLowerCase().includes(q);
        const matchesRestrictions = (drug.restrictions || "").toLowerCase().includes(q);
        if (!matchesInn && !matchesClass && !matchesIndication && !matchesForm && !matchesDose && !matchesRestrictions) {
          return false;
        }
      }

      // 2. Class Filter
      if (this.selectedClass !== "all") {
        if (drug.majorClass !== this.selectedClass) return false;
      }

      // 3. Species Filter
      if (this.selectedSpecies !== "all") {
        if (!drug.speciesList.includes(this.selectedSpecies) && !drug.speciesList.includes("all")) {
          return false;
        }
      }

      // 4. Access Filter
      if (this.selectedAccess !== "all") {
        const cat = (drug.accessCategory || "").toLowerCase();
        if (this.selectedAccess === "narkotika" && !cat.includes("narkotika")) return false;
        if (this.selectedAccess === "psikotropika" && !cat.includes("psikotropika")) return false;
        if (this.selectedAccess === "prekursor_oot" && !cat.includes("prekursor") && !cat.includes("oot") && !cat.includes("tertentu")) return false;
        if (this.selectedAccess === "keras" && !cat.includes("keras") && (cat.includes("narkotika") || cat.includes("psikotropika"))) return false;
      }

      return true;
    });
  }

  renderCurrentView() {
    this.renderDrugs();
  }

  renderDrugs() {
    const container = document.getElementById("indo-drugs-grid");
    const countBadge = document.getElementById("indo-drug-count-badge");
    const emptyState = document.getElementById("indo-drugs-empty");
    if (!container) return;

    const filtered = this.getFilteredDrugs();

    if (countBadge) {
      countBadge.textContent = `${filtered.length} dari ${this.drugs.length} Obat Tersedia`;
    }

    if (filtered.length === 0) {
      container.innerHTML = "";
      emptyState?.classList.remove("hidden");
      this.renderPagination(0, 1);
      return;
    }

    emptyState?.classList.add("hidden");

    // Pagination slice
    const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const pageItems = filtered.slice(startIndex, startIndex + this.itemsPerPage);

    let html = "";
    pageItems.forEach(drug => {
      html += this.createDrugCardHtml(drug);
    });

    container.innerHTML = html;

    // Attach card event listeners
    this.attachCardEventListeners(container);

    this.renderPagination(filtered.length, totalPages);
  }

  createDrugCardHtml(drug) {
    // Access Category Badge
    let accessBadge = "";
    const lowerAccess = (drug.accessCategory || "").toLowerCase();
    if (lowerAccess.includes("narkotika")) {
      accessBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><i class="ph-bold ph-lock-key"></i> Narkotika</span>`;
    } else if (lowerAccess.includes("psikotropika")) {
      accessBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><i class="ph-bold ph-warning-circle"></i> Psikotropika</span>`;
    } else if (drug.restrictions && (drug.restrictions.toLowerCase().includes("kontraindikasi") || drug.restrictions.toLowerCase().includes("dilarang"))) {
      accessBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><i class="ph-bold ph-shield-warning"></i> Restriksi Ketat</span>`;
    } else {
      accessBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"><i class="ph ph-prescription"></i> Resep Drh</span>`;
    }

    // Species Badges
    const speciesBadges = this.formatSpeciesBadges(drug.rawSpecies, drug.speciesList);

    // Clean class string
    const classTitle = (drug.subClass || drug.majorClass || "Umum").replace(/^\d+(\.\d+)?\s*/, "");

    return `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 group hover:border-rose-300">
        <div>
          <!-- Top Row: Class & Access Badge -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full truncate border border-rose-100" title="${this.escapeHtml(drug.effectiveClass)}">
              ${this.escapeHtml(classTitle)}
            </span>
            ${accessBadge}
          </div>

          <!-- Drug Name (INN) -->
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-600 transition">
              ${this.escapeHtml(drug.inn)}
            </h3>
            ${drug.kodeTerapi ? `<span class="font-mono text-[10px] text-slate-400 font-semibold shrink-0">#${this.escapeHtml(drug.kodeTerapi)}</span>` : ""}
          </div>

          <!-- Sediaan / Formulation -->
          <div class="mt-1 text-xs text-slate-600 flex items-center gap-1.5">
            <i class="ph-bold ph-package text-slate-400"></i>
            <span class="font-medium">Sediaan:</span>
            <span class="text-slate-800 font-semibold truncate">${this.escapeHtml(drug.formulation || "Sediaan standar")}</span>
          </div>

          <!-- Target Species Tags -->
          <div class="mt-2.5 flex flex-wrap gap-1">
            ${speciesBadges}
          </div>

          <!-- Clinical Indications -->
          <div class="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span class="font-bold text-slate-700 block mb-0.5">Indikasi Klinis Utama:</span>
            <p class="text-slate-600 line-clamp-2 leading-relaxed" title="${this.escapeHtml(drug.indication)}">
              ${this.escapeHtml(drug.indication || "Sesuai panduan klinis veteriner.")}
            </p>
          </div>

          <!-- Clinical Standard Dosage Snippet -->
          <div class="mt-2 text-xs text-slate-700">
            <span class="font-bold text-emerald-800 flex items-center gap-1 mb-1">
              <i class="ph-bold ph-scales"></i> Panduan Dosis Standar:
            </span>
            <p class="font-mono text-[11px] text-slate-800 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 leading-snug line-clamp-3 whitespace-pre-line" title="${this.escapeHtml(drug.dosage)}">
              ${this.escapeHtml(drug.dosage || "Lihat detail monograf untuk dosis spesifik.")}
            </p>
          </div>

          <!-- Safety Warning Snippet if exists -->
          ${drug.restrictions ? `
            <div class="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 line-clamp-2" title="${this.escapeHtml(drug.restrictions)}">
              <span class="font-bold flex items-center gap-1"><i class="ph-bold ph-warning"></i> Restriksi:</span>
              <span class="text-amber-800">${this.escapeHtml(drug.restrictions)}</span>
            </div>
          ` : ""}
        </div>

        <!-- Footer Actions -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button 
            type="button" 
            class="btn-indo-detail text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
            data-drug-id="${drug.id}"
          >
            <i class="ph-bold ph-info"></i> Detail
          </button>

          <div class="flex items-center gap-1.5">
            <button 
              type="button" 
              class="btn-indo-calc text-xs font-semibold text-teal-700 hover:bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200 transition flex items-center gap-1"
              data-drug-id="${drug.id}"
              title="Hitung dosis di Kalkulator Dosis"
            >
              <i class="ph-bold ph-calculator"></i> Hitung
            </button>
            <button 
              type="button" 
              class="btn-indo-rx text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition flex items-center gap-1"
              data-drug-id="${drug.id}"
              title="Tambahkan sediaan ini ke Resep R/"
            >
              <i class="ph-bold ph-plus-circle"></i> + Resep
            </button>
          </div>
        </div>
      </div>
    `;
  }

  formatSpeciesBadges(rawSpecies, speciesList) {
    if (!rawSpecies || rawSpecies === "all" || rawSpecies === "-") {
      return `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">Multi-Spesies</span>`;
    }

    const speciesMap = {
      canine: { label: "Anjing", icon: "🐕", cls: "bg-blue-50 text-blue-700 border-blue-100" },
      feline: { label: "Kucing", icon: "🐈", cls: "bg-purple-50 text-purple-700 border-purple-100" },
      equine: { label: "Kuda", icon: "🐎", cls: "bg-amber-50 text-amber-800 border-amber-100" },
      bovine: { label: "Sapi", icon: "🐄", cls: "bg-emerald-50 text-emerald-800 border-emerald-100" },
      ovine_caprine: { label: "Kambing/Domba", icon: "🐐", cls: "bg-teal-50 text-teal-800 border-teal-100" },
      porcine: { label: "Babi", icon: "🐖", cls: "bg-pink-50 text-pink-700 border-pink-100" },
      avian: { label: "Unggas", icon: "🐓", cls: "bg-lime-50 text-lime-800 border-lime-100" },
      rabbit: { label: "Kelinci", icon: "🐇", cls: "bg-orange-50 text-orange-700 border-orange-100" },
      exotic: { label: "Eksotik", icon: "🦌", cls: "bg-indigo-50 text-indigo-700 border-indigo-100" }
    };

    let badges = "";
    const added = new Set();
    speciesList.forEach(key => {
      if (speciesMap[key] && !added.has(key)) {
        added.add(key);
        const item = speciesMap[key];
        badges += `<span class="px-1.5 py-0.5 rounded text-[10px] font-medium border ${item.cls}">${item.icon} ${item.label}</span>`;
      }
    });

    if (!badges) {
      badges = `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 truncate max-w-[150px]">${this.escapeHtml(rawSpecies)}</span>`;
    }

    return badges;
  }

  attachCardEventListeners(container) {
    // Detail button
    container.querySelectorAll(".btn-indo-detail").forEach(btn => {
      btn.addEventListener("click", () => {
        const drugId = btn.dataset.drugId;
        const drug = this.drugs.find(d => d.id === drugId);
        if (drug) this.openDetailModal(drug);
      });
    });

    // Add to Rx
    container.querySelectorAll(".btn-indo-rx").forEach(btn => {
      btn.addEventListener("click", () => {
        const drugId = btn.dataset.drugId;
        const drug = this.drugs.find(d => d.id === drugId);
        if (drug) this.addDrugToCart(drug);
      });
    });

    // Calc button
    container.querySelectorAll(".btn-indo-calc").forEach(btn => {
      btn.addEventListener("click", () => {
        const drugId = btn.dataset.drugId;
        const drug = this.drugs.find(d => d.id === drugId);
        if (drug) this.sendDrugToCalculator(drug);
      });
    });
  }

  renderPagination(totalItems, totalPages) {
    const paginationEl = document.getElementById("indo-pagination");
    if (!paginationEl) return;

    if (totalItems === 0 || totalPages <= 1) {
      paginationEl.classList.add("hidden");
      return;
    }

    paginationEl.classList.remove("hidden");

    let pagesHtml = "";
    pagesHtml += `
      <button type="button" id="indo-page-prev" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition" ${this.currentPage === 1 ? "disabled" : ""}>
        <i class="ph-bold ph-caret-left"></i> Sebelumnya
      </button>
      <div class="flex items-center gap-1 text-xs font-semibold text-slate-700">
        <span>Halaman</span>
        <span class="px-2 py-1 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">${this.currentPage}</span>
        <span>dari ${totalPages}</span>
      </div>
      <button type="button" id="indo-page-next" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition" ${this.currentPage === totalPages ? "disabled" : ""}>
        Berikutnya <i class="ph-bold ph-caret-right"></i>
      </button>
    `;

    paginationEl.innerHTML = pagesHtml;

    document.getElementById("indo-page-prev")?.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderDrugs();
        document.getElementById("section-indo")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    document.getElementById("indo-page-next")?.addEventListener("click", () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderDrugs();
        document.getElementById("section-indo")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  openDetailModal(drug) {
    this.activeModalDrug = drug;
    const modal = document.getElementById("modal-indo-detail");
    if (!modal) return;

    // Populate data
    document.getElementById("modal-indo-inn").textContent = drug.inn;
    document.getElementById("modal-indo-class").textContent = drug.effectiveClass || drug.majorClass || "Umum";
    document.getElementById("modal-indo-code").textContent = drug.kodeTerapi ? `#${drug.kodeTerapi}` : "";
    document.getElementById("modal-indo-formulation").textContent = drug.formulation || "Sediaan standar";
    document.getElementById("modal-indo-species").innerHTML = this.formatSpeciesBadges(drug.rawSpecies, drug.speciesList);
    document.getElementById("modal-indo-indication").textContent = drug.indication || "-";
    document.getElementById("modal-indo-dosage").textContent = drug.dosage || "Belum ada panduan dosis spesifik.";

    // Restrictions & Access
    const restrBox = document.getElementById("modal-indo-restrictions-box");
    const restrText = document.getElementById("modal-indo-restrictions");
    if (drug.restrictions) {
      restrBox?.classList.remove("hidden");
      if (restrText) restrText.textContent = drug.restrictions;
    } else {
      restrBox?.classList.add("hidden");
    }

    const accessBox = document.getElementById("modal-indo-access-box");
    const accessText = document.getElementById("modal-indo-access");
    if (drug.accessCategory) {
      accessBox?.classList.remove("hidden");
      if (accessText) accessText.textContent = drug.accessCategory;
    } else {
      accessBox?.classList.add("hidden");
    }

    // References & Max Rx
    document.getElementById("modal-indo-references").textContent = drug.references || "Formularium Obat Manusia untuk Penggunaan Veteriner (EBVM).";
    document.getElementById("modal-indo-max-rx").textContent = drug.maxPrescription ? `Batas Resep Maksimal: ${drug.maxPrescription}` : "Sesuai resep dokter hewan berizin.";

    modal.classList.remove("hidden");
  }

  addDrugToCart(drug) {
    if (!this.app.rxManager) return;

    const payload = {
      drugName: `${drug.inn} (${drug.formulation || 'Standar'})`,
      species: drug.rawSpecies || "Hewan",
      weightKg: 10,
      dosageForm: drug.formulation || "tablet / injeksi",
      directions: "s.2.dd No I (Sesuai panduan klinis)",
      quantityText: drug.maxPrescription || "No X",
      notes: `Formularium Obat Indonesia | ${drug.effectiveClass || drug.majorClass}`
    };

    this.app.rxManager.addCompoundedToCart(payload);
    this.app.updateCartBadge();
    this.app.showToast(`Berhasil menambahkan ${drug.inn} ke keranjang Resep Veteriner!`, "success");
  }

  sendDrugToCalculator(drug) {
    // Switch to calculator tab
    document.getElementById("nav-calculator")?.click();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Pre-populate custom drug or search input if possible
    const calcSearch = document.getElementById("calc-drug-search-input");
    if (calcSearch) {
      calcSearch.value = drug.inn;
      calcSearch.dispatchEvent(new Event("input"));
    }

    this.app.showToast(`Membuka Kalkulator Dosis untuk ${drug.inn}. Silakan atur bobot dan sediaan.`, "info");
  }

  renderProhibitedTable() {
    const tbody = document.getElementById("table-indo-prohibited-body");
    if (!tbody) return;

    let html = "";
    this.prohibited.forEach(item => {
      html += `
        <tr class="hover:bg-rose-50/40 transition">
          <td class="p-4 align-top font-bold text-rose-900 border-b border-slate-100 flex items-center gap-1.5">
            <i class="ph-bold ph-prohibit text-rose-600 text-base"></i>
            <span>${this.escapeHtml(item.molecule)}</span>
          </td>
          <td class="p-4 align-top text-xs text-slate-700 leading-relaxed border-b border-slate-100">
            ${this.escapeHtml(item.reason)}
          </td>
          <td class="p-4 align-top text-xs font-semibold text-rose-800 bg-rose-50/60 border-b border-slate-100">
            ${this.escapeHtml(item.impact)}
          </td>
          <td class="p-4 align-top text-[11px] font-mono text-slate-500 border-b border-slate-100">
            ${this.escapeHtml(item.reference)}
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  renderSurveillanceTable() {
    const tbody = document.getElementById("table-indo-surveillance-body");
    if (!tbody) return;

    let html = "";
    this.surveillance.forEach(item => {
      const isPrecursor = item.group.includes("PREKURSOR");
      const badge = isPrecursor
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">PREKURSOR</span>`
        : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">OOT BPOM</span>`;

      html += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-4 align-top border-b border-slate-100">${badge}</td>
          <td class="p-4 align-top font-bold text-slate-900 text-xs border-b border-slate-100">
            ${this.escapeHtml(item.activeIngredient)}
            <p class="text-[11px] font-normal text-slate-500 mt-0.5">${this.escapeHtml(item.status)}</p>
          </td>
          <td class="p-4 align-top text-xs text-slate-700 leading-relaxed border-b border-slate-100">
            <div class="flex items-start gap-1 text-slate-800">
              <i class="ph-bold ph-shield-check text-teal-600 shrink-0 mt-0.5"></i>
              <span>${this.escapeHtml(item.rules)}</span>
            </div>
          </td>
          <td class="p-4 align-top text-[11px] font-mono text-slate-500 border-b border-slate-100">
            ${this.escapeHtml(item.regulation)}
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  renderStandardsCards() {
    const container = document.getElementById("cards-indo-standards");
    if (!container) return;

    let html = "";
    this.standards.forEach(item => {
      html += `
        <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              <h4 class="font-bold text-sm text-slate-900">${this.escapeHtml(item.element)}</h4>
            </div>
            <p class="text-xs font-semibold text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-100 mb-2">
              ${this.escapeHtml(item.components)}
            </p>
          </div>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            <span class="font-medium text-slate-700">Fungsi Legalitas:</span> ${this.escapeHtml(item.function)}
          </p>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
