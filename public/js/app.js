/**
 * Main Application Controller for Katalog Obat Hewan
 * Coordinates Drug Catalog, Dosage Calculator, Medication Cart, Prescription Generation,
 * Latin Terminology Database, and Firebase setup.
 */

import { VET_DRUG_DATABASE } from "./drugs-data.js";
import { TerminologyManager } from "./terminology-data.js";
import { calculateDose, toRomanNumeral } from "./calculator.js";
import { PrescriptionManager } from "./cart-prescription.js";
import { initializeFirebaseApp } from "./firebase-config.js";
import { VET_PRESCRIPTION_ALGORITHM, VET_CLINICAL_PRESETS, checkSpeciesSafety, ClinicalPresetManager } from "./prescription-guidelines.js";
import { ANTIMICROBIAL_STEWARDSHIP_DATA, findAntimicrobialProfile, getAntimicrobialSummaryCard } from "./antimicrobial-guide-data.js";
import { IndonesianFormularyController } from "./indonesian-section.js";

class App {
  constructor() {
    // Custom database from localStorage if user previously uploaded a JSON file
    const DB_VERSION = "3.3_eyd_kbbi_spacing_clean";
    const savedCustomDb = localStorage.getItem("vet_custom_drugs_db");
    const savedVersion = localStorage.getItem("vet_custom_drugs_db_version");

    if (savedCustomDb && savedVersion === DB_VERSION) {
      try {
        const parsed = JSON.parse(savedCustomDb);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.drugs = parsed;
        } else {
          this.drugs = VET_DRUG_DATABASE;
        }
      } catch (e) {
        console.warn("Failed to load saved custom drugs database", e);
        this.drugs = VET_DRUG_DATABASE;
      }
    } else {
      // Clear outdated cache from prior sessions so latest combined database loads
      localStorage.removeItem("vet_custom_drugs_db");
      localStorage.removeItem("vet_custom_drugs_db_version");
      this.drugs = VET_DRUG_DATABASE;
    }

    this.termManager = new TerminologyManager();
    this.rxManager = new PrescriptionManager();

    // Language State ('id' = Indonesian, 'en' = English)
    this.currentLang = localStorage.getItem("vet_app_lang") || "id";
    this.stagedJsonData = null;

    this.currentSpeciesFilter = "all";
    this.currentCategoryFilter = "all";
    this.currentSourceFilter = "all"; // 'all', 'both', 'bsava', 'plumbs'
    this.activeMonographSource = "bsava"; // 'bsava', 'plumbs', 'compare'
    this.searchQuery = "";

    // Catalog Pagination State (10 items default, options for 5, 10, 25)
    this.currentPage = 1;
    this.pageSize = 10;

    // Calculator State
    this.calcState = {
      species: "canine",
      weight: 10,
      weightUnit: "kg",
      drugId: this.drugs[0]?.id || "amoxicillin",
      doseRate: 15,
      formulationId: null,
      frequencyCode: "s.2.dd",
      durationDays: 7
    };

    // Compounding State (Peracikan Obat)
    const savedCompounding = localStorage.getItem("vet_compounding_state");
    let loadedCompounding = null;
    if (savedCompounding) {
      try {
        const parsed = JSON.parse(savedCompounding);
        // Jika data tersimpan masih berisi sampel lama (Amoxicillin + Dexa + CTM), reset ke array kosong
        const isOldSample = Array.isArray(parsed?.ingredients) && 
          parsed.ingredients.length === 3 && 
          parsed.ingredients.some(i => i.name === "Amoxicillin") &&
          parsed.ingredients.some(i => i.name === "Dexamethasone") &&
          parsed.ingredients.some(i => i.name === "CTM");

        if (!isOldSample) {
          loadedCompounding = parsed;
        }
      } catch (e) {
        console.error("Failed to parse compounding state:", e);
      }
    }

    this.compoundingState = loadedCompounding || {
      hasDtd: true,
      command: "mfla pulv.",
      packaging: "da in caps",
      totalPacks: 10,
      signa: "s.2.dd No I",
      ingredients: []
    };

    this.activeLearnMoreDrug = null;
    this.isAuthenticated = true;
    this.userProfile = this.loadUserProfile();

    this.init();
  }

  async init() {
    this.setupAuthAndLandingEvents();
    this.setupNavigation();
    this.setupCatalogEvents();
    this.setupCalculatorEvents();
    this.setupCompoundingEvents();
    this.setupPrescriptionEvents();
    this.setupHistoryEvents();
    this.setupTerminologyEvents();
    this.setupSettingsEvents();
    this.setupProfileFormEvents();

    this.updateLanguageUI();
    this.renderCatalog();
    this.initCalculatorForm();
    this.initCalculatorSubtabs();
    this.renderTemplatesList();
    this.renderPrescriptionAlgorithmCard();
    this.updateSpeciesSafetyAlerts();
    this.initCompoundingForm();
    this.renderCompoundingCalculator();
    this.renderCartAndPrescription();
    this.updateHistoryBadge();
    this.renderHistorySection();
    this.renderTerminologyTable();
    this.saveUserProfile(this.userProfile);
    this.renderUserProfileUI();
    this.updateDatabaseBadges();

    // Initialize Indonesian Formulary Section
    this.indoController = new IndonesianFormularyController(this);
    this.indoController.init();

    // Initialize Firebase
    await initializeFirebaseApp();
  }

  /* ------------------------------------------------------------- */
  /* AUTHENTICATION & LANDING PAGE                                 */
  /* ------------------------------------------------------------- */
  setupAuthAndLandingEvents() {
    // 1. Direct "Buka Aplikasi" buttons (Open Application without Login)
    document.querySelectorAll(".btn-open-app-direct").forEach(btn => {
      btn.addEventListener("click", () => {
        this.showAppView();
      });
    });

    // 2. Direct Feature Launchpad shortcuts (Launch specific tabs directly)
    document.querySelectorAll(".btn-launch-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;
        this.showAppView();
        if (tabId) {
          setTimeout(() => {
            document.getElementById(tabId)?.click();
          }, 60);
        }
      });
    });

    // 3. Navigation between Landing and App
    document.getElementById("btn-view-landing")?.addEventListener("click", () => {
      this.showLandingPageView();
    });

    document.getElementById("btn-landing-back-to-app")?.addEventListener("click", () => {
      this.showAppView();
    });

    // 4. Initial View Decision
    const urlParams = new URLSearchParams(window.location.search);
    const forceLanding = urlParams.get("view") === "landing";
    const lastView = localStorage.getItem("vet_last_view");

    if (lastView === "app" && !forceLanding) {
      this.showAppView();
    } else {
      this.showLandingPageView();
    }
  }

  showAppView() {
    localStorage.setItem("vet_last_view", "app");
    document.getElementById("landing-page-root")?.classList.add("hidden");
    document.getElementById("app-root")?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showLandingPageView() {
    localStorage.setItem("vet_last_view", "landing");
    document.getElementById("app-root")?.classList.add("hidden");
    document.getElementById("landing-page-root")?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async handleGoogleSignIn() {
    // 1. Try Firebase Auth popup if available and running on authorized domain
    if (window.firebase && window.firebase.auth) {
      try {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        const result = await window.firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        this.applyUserSession({
          name: user.displayName || "drh. Pengguna Google",
          email: user.email || "vet.google@gmail.com",
          photoURL: user.photoURL || "",
          authProvider: "google"
        });
        this.showAppView();
        this.showToast(`Selamat datang, ${user.displayName || "Dokter"}! Berhasil masuk via Google.`, "success");
        return;
      } catch (err) {
        console.warn("Firebase Google Auth popup notice:", err.message);
      }
    }
  }

  applyUserSession(userData) {
    this.isAuthenticated = true;
    localStorage.setItem("vet_app_auth", "authenticated");

    this.saveUserProfile({
      name: userData.name || this.userProfile.name,
      email: userData.email || this.userProfile.email,
      photoURL: userData.photoURL || this.userProfile.photoURL,
      authProvider: userData.authProvider || "google"
    });

    this.renderUserProfileUI();
  }

  loadUserProfile() {
    const saved = localStorage.getItem("vet_user_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse user profile:", e);
      }
    }

    return {
      name: "drh. Pratama Wijaya, M.Si",
      sipNumber: "503/014/SIP-DRH/2026",
      role: "Dokter Hewan Praktisi (Small Animal)",
      email: "pratama.vet@gmail.com",
      phone: "+62 812-3456-7890",
      clinicName: "Klinik Hewan Sehat (Veterinary Care)",
      clinicAddress: "Jl. Kesehatan Hewan No. 8, Jakarta Selatan",
      clinicPhone: "+62 812-3456-7890",
      photoURL: "",
      authProvider: "credential"
    };
  }

  saveUserProfile(newProfile) {
    this.userProfile = { ...this.userProfile, ...newProfile };
    localStorage.setItem("vet_user_profile", JSON.stringify(this.userProfile));

    // Sync to prescription generator config
    if (this.rxManager) {
      this.rxManager.saveConfig({
        vetName: this.userProfile.name,
        licenseNumber: this.userProfile.sipNumber,
        clinicName: this.userProfile.clinicName,
        clinicAddress: this.userProfile.clinicAddress,
        clinicPhone: this.userProfile.clinicPhone || this.userProfile.phone
      });
    }
  }

  renderUserProfileUI() {
    if (!this.userProfile) return;

    // Header summary card
    const nameEl = document.getElementById("profile-header-name");
    const roleEl = document.getElementById("profile-header-role");
    const emailEl = document.getElementById("profile-header-email");
    const badgeEl = document.getElementById("profile-header-provider-badge");
    const initialsEl = document.getElementById("profile-avatar-initials");
    const imgEl = document.getElementById("profile-avatar-img");

    if (nameEl) nameEl.textContent = this.userProfile.name;
    if (roleEl) roleEl.textContent = `${this.userProfile.role} • SIP: ${this.userProfile.sipNumber}`;
    if (emailEl) emailEl.textContent = this.userProfile.email;
    if (badgeEl) {
      if (this.userProfile.authProvider === "google") {
        badgeEl.textContent = "Google Verified";
        badgeEl.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1";
        badgeEl.innerHTML = '<i class="ph-bold ph-check"></i> Google Verified';
      } else {
        badgeEl.textContent = "Akun Praktisi";
        badgeEl.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200";
      }
    }

    if (this.userProfile.photoURL) {
      if (imgEl) {
        imgEl.src = this.userProfile.photoURL;
        imgEl.classList.remove("hidden");
      }
      if (initialsEl) initialsEl.classList.add("hidden");
    } else {
      if (imgEl) imgEl.classList.add("hidden");
      if (initialsEl) {
        initialsEl.classList.remove("hidden");
        const cleanName = (this.userProfile.name || "").replace(/drh./gi, "").trim();
        const parts = cleanName.split(" ").filter(Boolean);
        initialsEl.textContent = (parts[0]?.[0] || "D") + (parts[1]?.[0] || "R");
      }
    }

    // Form inputs
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };

    setVal("prof-input-name", this.userProfile.name);
    setVal("prof-input-sip", this.userProfile.sipNumber);
    setVal("prof-input-role", this.userProfile.role);
    setVal("prof-input-email", this.userProfile.email);
    setVal("prof-input-phone", this.userProfile.phone);
    setVal("prof-input-avatar", this.userProfile.photoURL);
    setVal("prof-input-clinic", this.userProfile.clinicName);
    setVal("prof-input-clinic-phone", this.userProfile.clinicPhone);
    setVal("prof-input-address", this.userProfile.clinicAddress);
  }

  setupProfileFormEvents() {
    const form = document.getElementById("form-user-profile");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const updated = {
          name: document.getElementById("prof-input-name")?.value.trim() || this.userProfile.name,
          sipNumber: document.getElementById("prof-input-sip")?.value.trim() || this.userProfile.sipNumber,
          role: document.getElementById("prof-input-role")?.value || this.userProfile.role,
          email: document.getElementById("prof-input-email")?.value.trim() || this.userProfile.email,
          phone: document.getElementById("prof-input-phone")?.value.trim() || this.userProfile.phone,
          photoURL: document.getElementById("prof-input-avatar")?.value.trim() || "",
          clinicName: document.getElementById("prof-input-clinic")?.value.trim() || this.userProfile.clinicName,
          clinicPhone: document.getElementById("prof-input-clinic-phone")?.value.trim() || this.userProfile.clinicPhone,
          clinicAddress: document.getElementById("prof-input-address")?.value.trim() || this.userProfile.clinicAddress
        };

        this.saveUserProfile(updated);
        this.renderUserProfileUI();
        this.showToast("Data profil dokter berhasil disimpan dan disinkronkan ke lembar resep!", "success");
      });
    }

    document.getElementById("btn-prof-reset-default")?.addEventListener("click", () => {
      if (confirm("Reset data profil dokter ke pengaturan awal?")) {
        localStorage.removeItem("vet_user_profile");
        this.userProfile = this.loadUserProfile();
        this.saveUserProfile(this.userProfile);
        this.renderUserProfileUI();
        this.showToast("Data profil telah direset ke bawaan.", "info");
      }
    });
  }

  /* ------------------------------------------------------------- */
  /* NAVIGATION TABS                                               */
  /* ------------------------------------------------------------- */
  setupNavigation() {
    const tabs = [
      { btnId: "nav-catalog", secId: "section-catalog" },
      { btnId: "nav-indo", secId: "section-indo" },
      { btnId: "nav-calculator", secId: "section-calculator" },
      { btnId: "nav-rx", secId: "section-rx" },
      { btnId: "nav-history", secId: "section-history" },
      { btnId: "nav-settings", secId: "section-settings" }
    ];

    tabs.forEach(({ btnId, secId }) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener("click", () => {
        tabs.forEach(t => {
          document.getElementById(t.secId)?.classList.add("hidden");
          const b = document.getElementById(t.btnId);
          b?.classList.remove("bg-teal-700", "bg-rose-700", "text-white");
          b?.classList.add("text-teal-100", "hover:bg-teal-700/60");
        });

        document.getElementById(secId)?.classList.remove("hidden");
        if (secId === "section-indo") {
          btn.classList.add("bg-rose-700", "text-white");
        } else {
          btn.classList.add("bg-teal-700", "text-white");
        }
        btn.classList.remove("text-teal-100", "hover:bg-teal-700/60");

        if (secId === "section-indo") {
          this.indoController?.renderCurrentView();
        }
        if (secId === "section-rx") {
          this.renderCartAndPrescription();
        }
        if (secId === "section-history") {
          this.renderHistorySection();
        }
        if (secId === "section-settings") {
          this.updateDatabaseBadges();
        }
      });
    });

    // Banner CTA to Indonesian section
    document.getElementById("btn-banner-open-indo")?.addEventListener("click", () => {
      document.getElementById("nav-indo")?.click();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------- */
  /* 1. DRUG CATALOG, BILINGUAL & SEARCH                           */
  /* ------------------------------------------------------------- */
  setupCatalogEvents() {
    const searchInput = document.getElementById("drug-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.currentPage = 1;
        this.renderCatalog();
      });
    }

    const categoryChips = document.querySelectorAll(".category-chip");
    categoryChips.forEach(chip => {
      chip.addEventListener("click", () => {
        categoryChips.forEach(c => {
          c.classList.remove("bg-teal-600", "text-white", "shadow-sm");
          c.classList.add("bg-slate-100", "text-slate-700");
        });
        chip.classList.add("bg-teal-600", "text-white", "shadow-sm");
        chip.classList.remove("bg-slate-100", "text-slate-700");

        this.currentCategoryFilter = chip.dataset.category;
        this.currentPage = 1;
        this.renderCatalog();
      });
    });

    // Reference Source filter chips (BSAVA / Plumb's / Both)
    const sourceChips = document.querySelectorAll(".source-chip");
    sourceChips.forEach(chip => {
      chip.addEventListener("click", () => {
        sourceChips.forEach(c => {
          c.classList.remove("bg-teal-600", "text-white", "shadow-sm", "border-teal-600");
          c.classList.add("bg-slate-100", "text-slate-700", "border-slate-200");
        });
        chip.classList.add("bg-teal-600", "text-white", "shadow-sm", "border-teal-600");
        chip.classList.remove("bg-slate-100", "text-slate-700", "border-slate-200");

        this.currentSourceFilter = chip.dataset.source;
        this.currentPage = 1;
        this.renderCatalog();
      });
    });

    // Monograph Modal Source Switcher Tabs
    document.getElementById("modal-tab-bsava")?.addEventListener("click", () => {
      this.switchMonographSourceTab("bsava");
    });
    document.getElementById("modal-tab-plumbs")?.addEventListener("click", () => {
      this.switchMonographSourceTab("plumbs");
    });
    document.getElementById("modal-tab-compare")?.addEventListener("click", () => {
      this.switchMonographSourceTab("compare");
    });

    const speciesChips = document.querySelectorAll(".species-chip");
    speciesChips.forEach(chip => {
      chip.addEventListener("click", () => {
        speciesChips.forEach(c => {
          c.classList.remove("bg-teal-600", "text-white", "shadow-sm");
          c.classList.add("bg-slate-100", "text-slate-700");
        });
        chip.classList.add("bg-teal-600", "text-white", "shadow-sm");
        chip.classList.remove("bg-slate-100", "text-slate-700");

        this.currentSpeciesFilter = chip.dataset.species;
        this.renderCatalog();
      });
    });

    // Language toggle buttons in Catalog
    document.getElementById("btn-lang-id")?.addEventListener("click", () => this.setLanguage("id"));
    document.getElementById("btn-lang-en")?.addEventListener("click", () => this.setLanguage("en"));

    // Language toggle buttons in Modal
    document.getElementById("modal-btn-lang-id")?.addEventListener("click", () => this.setLanguage("id"));
    document.getElementById("modal-btn-lang-en")?.addEventListener("click", () => this.setLanguage("en"));

    // Language toggle buttons in Plumb's Pane
    document.getElementById("modal-plumbs-btn-id")?.addEventListener("click", () => this.setLanguage("id"));
    document.getElementById("modal-plumbs-btn-en")?.addEventListener("click", () => this.setLanguage("en"));

    // Modal Close
    document.getElementById("btn-close-learn-more")?.addEventListener("click", () => {
      document.getElementById("modal-learn-more")?.classList.add("hidden");
    });

    // Close modal on outside click
    document.getElementById("modal-learn-more")?.addEventListener("click", (e) => {
      if (e.target.id === "modal-learn-more") {
        document.getElementById("modal-learn-more")?.classList.add("hidden");
      }
    });

    // Jump from Learn More modal to calculator
    document.getElementById("btn-modal-calc-dose")?.addEventListener("click", () => {
      if (this.activeLearnMoreDrug) {
        this.selectDrugForCalculator(this.activeLearnMoreDrug.id);
        document.getElementById("modal-learn-more")?.classList.add("hidden");
      }
    });
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem("vet_app_lang", lang);
    this.updateLanguageUI();
    this.renderCatalog();

    if (this.activeLearnMoreDrug && !document.getElementById("modal-learn-more")?.classList.contains("hidden")) {
      this.openLearnMoreModal(this.activeLearnMoreDrug.id, this.activeMonographSource);
    }

    this.showToast(lang === "id" ? "Bahasa direktori: Bahasa Indonesia 🇮🇩" : "Directory language: English 🇬🇧", "info");
  }

  updateLanguageUI() {
    const isEn = this.currentLang === "en";

    // Catalog header toggle buttons
    const btnId = document.getElementById("btn-lang-id");
    const btnEn = document.getElementById("btn-lang-en");
    if (isEn) {
      btnEn?.classList.add("bg-teal-600", "text-white", "font-bold", "shadow-sm");
      btnEn?.classList.remove("text-slate-600");
      btnId?.classList.remove("bg-teal-600", "text-white", "font-bold", "shadow-sm");
      btnId?.classList.add("text-slate-600");
    } else {
      btnId?.classList.add("bg-teal-600", "text-white", "font-bold", "shadow-sm");
      btnId?.classList.remove("text-slate-600");
      btnEn?.classList.remove("bg-teal-600", "text-white", "font-bold", "shadow-sm");
      btnEn?.classList.add("text-slate-600");
    }

    // Settings tab buttons
    const setBtnId = document.getElementById("settings-lang-id-btn");
    const setBtnEn = document.getElementById("settings-lang-en-btn");
    if (isEn) {
      setBtnEn?.classList.add("border-2", "border-teal-600", "bg-teal-50", "text-teal-900");
      setBtnEn?.classList.remove("border-slate-200", "bg-white", "text-slate-700");
      setBtnId?.classList.remove("border-2", "border-teal-600", "bg-teal-50", "text-teal-900");
      setBtnId?.classList.add("border-slate-200", "bg-white", "text-slate-700");
    } else {
      setBtnId?.classList.add("border-2", "border-teal-600", "bg-teal-50", "text-teal-900");
      setBtnId?.classList.remove("border-slate-200", "bg-white", "text-slate-700");
      setBtnEn?.classList.remove("border-2", "border-teal-600", "bg-teal-50", "text-teal-900");
      setBtnEn?.classList.add("border-slate-200", "bg-white", "text-slate-700");
    }

    // Search placeholder
    const searchInput = document.getElementById("drug-search-input");
    if (searchInput) {
      searchInput.placeholder = isEn 
        ? "Search active ingredient, brand names, or indication..." 
        : "Cari zat aktif (Active Ingredient), merk obat, atau indikasi...";
    }

    // Category and species headings
    const lblCat = document.getElementById("lbl-category-heading");
    if (lblCat) lblCat.textContent = isEn ? "Category:" : "Kategori:";

    const lblSpec = document.getElementById("lbl-species-heading");
    if (lblSpec) lblSpec.textContent = isEn ? "Species:" : "Spesies:";

    const lblLang = document.getElementById("lbl-lang-indicator");
    if (lblLang) lblLang.textContent = isEn ? "Language:" : "Bahasa:";

    // Translate category chips (clean, without numbering)
    const categoryLabels = {
      all: { id: "Semua Kategori", en: "All Categories" },
      antimicrobial: { id: "Antimikroba & Antiparasit", en: "Antimicrobial & Antiparasitic" },
      analgesic: { id: "Analgesia & NSAID/Opioid", en: "Analgesia & NSAID/Opioid" },
      anesthesia: { id: "Anestesi & Sedasi", en: "Anesthesia & Sedation" },
      vitamin: { id: "Vitamin & Suplemen", en: "Vitamins & Supplements" },
      antihistamine: { id: "Antihistamin", en: "Antihistamines" },
      corticosteroid: { id: "Kortikosteroid", en: "Corticosteroids" },
      cardiovascular: { id: "Kardiovaskular & Ginjal", en: "Cardiovascular & Renal" },
      gastrointestinal: { id: "Saluran Cerna", en: "Gastrointestinal" },
      neurological: { id: "Saraf & Antikonvulsan", en: "Neurology & Anticonvulsants" },
      endocrine: { id: "Endokrin & Hormon", en: "Endocrine & Metabolic" },
      ophthalmology: { id: "Oftalmologi Mata", en: "Ophthalmology" },
      other: { id: "Lainnya", en: "Other" }
    };

    document.querySelectorAll(".category-chip").forEach(chip => {
      const cat = chip.dataset.category;
      if (categoryLabels[cat]) {
        chip.textContent = isEn ? categoryLabels[cat].en : categoryLabels[cat].id;
      }
    });

    // Translate species chips
    const speciesLabels = {
      all: { id: "Semua Spesies", en: "All Species" },
      canine: { id: "Anjing (Canine)", en: "Canine (Dog)" },
      feline: { id: "Kucing (Feline)", en: "Feline (Cat)" },
      equine: { id: "Kuda (Equine)", en: "Equine (Horse)" },
      bovine: { id: "Sapi (Bovine)", en: "Bovine (Cattle)" },
      exotic: { id: "Eksotis / Kelinci", en: "Exotics / Rabbits" }
    };

    document.querySelectorAll(".species-chip").forEach(chip => {
      const sp = chip.dataset.species;
      if (speciesLabels[sp]) {
        chip.textContent = isEn ? speciesLabels[sp].en : speciesLabels[sp].id;
      }
    });
  }

  renderCatalog() {
    const container = document.getElementById("drugs-grid");
    const paginationContainer = document.getElementById("catalog-pagination");
    if (!container) return;

    const lang = this.currentLang || "id";
    const isEn = lang === "en";

    let filtered = this.drugs.filter(drug => {
      const matchSpecies = this.currentSpeciesFilter === "all" || (drug.species && drug.species.includes(this.currentSpeciesFilter));
      
      let matchCategory = true;
      if (this.currentCategoryFilter !== "all") {
        if (drug.category) {
          matchCategory = drug.category === this.currentCategoryFilter;
        } else {
          const dc = (drug.drugClass || "").toLowerCase();
          matchCategory = dc.includes(this.currentCategoryFilter);
        }
      }

      let matchSource = true;
      if (this.currentSourceFilter === "both") {
        matchSource = drug.sources?.includes("bsava") && drug.sources?.includes("plumbs");
      } else if (this.currentSourceFilter === "bsava") {
        matchSource = drug.sources?.includes("bsava");
      } else if (this.currentSourceFilter === "plumbs") {
        matchSource = drug.sources?.includes("plumbs");
      }

      const q = this.searchQuery;
      let matchSearch = !q;
      if (q) {
        const id = (drug.id || "").toLowerCase();
        const active = (drug.activeIngredient || "").toLowerCase();
        const brands = (drug.brandNames || []).join(" ").toLowerCase();
        const dc = (drug.drugClass || "").toLowerCase();
        const ind = (drug.indications || "").toLowerCase();
        const moa = (drug.mechanismOfAction || "").toLowerCase();
        const enC = drug.content?.en;
        const enInd = (enC?.indications || "").toLowerCase();
        const enMoa = (enC?.mechanismOfAction || "").toLowerCase();

        matchSearch = active.includes(q) || brands.includes(q) || dc.includes(q) || ind.includes(q) || moa.includes(q) || enInd.includes(q) || enMoa.includes(q) || id.includes(q);
      }

      return matchSpecies && matchCategory && matchSource && matchSearch;
    });

    // Urutkan alfabetis A-Z (pada tampilan awal maupun hasil pencarian)
    filtered.sort((a, b) => {
      const nameA = (a.activeIngredient || a.name || a.id || "").trim();
      const nameB = (b.activeIngredient || b.name || b.id || "").trim();
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    });

    const countBadge = document.getElementById("drug-count-badge");
    if (countBadge) {
      countBadge.textContent = isEn ? `${filtered.length} Drugs Found` : `${filtered.length} Obat Ditemukan`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <i class="ph ph-magnifying-glass text-4xl text-slate-300 mx-auto mb-3"></i>
          <h3 class="font-bold text-slate-700">${isEn ? "No matching drugs found" : "Tidak ada obat yang cocok"}</h3>
          <p class="text-xs text-slate-500 mt-1">${isEn ? "Try another search keyword or switch category filter." : "Coba gunakan kata kunci lain atau pilih kategori lain."}</p>
        </div>
      `;
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    // Pagination calculations
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, totalItems);
    const pagedDrugs = filtered.slice(startIndex, endIndex);

    container.innerHTML = pagedDrugs.map(drug => {
      const c = (drug.content && drug.content[lang]) ? drug.content[lang] : drug;
      const drugClass = c.drugClass || drug.drugClass;
      const moa = c.mechanismOfAction || drug.mechanismOfAction;
      const indications = c.indications || drug.indications;
      const contra = c.contraindications || drug.contraindications;
      const sideEffects = c.sideEffects || drug.sideEffects;
      const interactions = c.drugInteractions || drug.drugInteractions;
      const pk = c.pharmacokinetics || drug.pharmacokinetics;
      const pd = c.pharmacodynamics || drug.pharmacodynamics;
      const brands = (drug.brandNames && drug.brandNames.length > 0) ? drug.brandNames.join(", ") : drug.activeIngredient;

      return `
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 hover:shadow-md transition">
          <!-- Card Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-xl font-bold text-slate-900">${drug.activeIngredient}</h3>
                <span class="bg-teal-50 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-teal-200">
                  ${drugClass}
                </span>
                ${(() => {
                  const hasBsava = drug.sources?.includes("bsava");
                  const hasPlumbs = drug.sources?.includes("plumbs");
                  return `
                    ${hasBsava ? `<span class="bg-sky-50 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1" title="Tersedia di BSAVA Small Animal Formulary 10th Ed."><i class="ph-bold ph-book-open"></i> BSAVA</span>` : ''}
                    ${hasPlumbs ? `<span class="bg-amber-50 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1" title="Tersedia di Plumb's Veterinary Drug Handbook 7th Ed."><i class="ph-bold ph-book-bookmark"></i> Plumb's</span>` : ''}
                    ${hasBsava && hasPlumbs ? `<span class="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200" title="Bandingkan langsung kedua referensi klinis">⚖️ Dual Source</span>` : ''}
                  `;
                })()}
                ${(() => {
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
                  return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${cls}">
                    <span class="w-1.5 h-1.5 rounded-full ${dot}"></span>
                    ${am.stewardshipBadge}
                  </span>`;
                })()}
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                ${isEn ? "Trade names:" : "Merk dagang:"} <span class="font-medium text-slate-700">${brands}</span>
              </p>
            </div>

            <div class="flex flex-wrap gap-1.5">
              ${(drug.species || []).map(sp => `
                <span class="badge-pill bg-slate-100 text-slate-600 border border-slate-200">${sp}</span>
              `).join("")}
            </div>
          </div>

          <!-- Pharmacology Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="space-y-1">
              <span class="font-bold text-teal-900 flex items-center gap-1">
                <i class="ph-bold ph-atom"></i> ${isEn ? "Mechanism of Action" : "Mekanisme Aksi (Mechanism of Action)"}
              </span>
              <p class="text-slate-600 leading-relaxed">${moa}</p>
            </div>

            <div class="space-y-1">
              <span class="font-bold text-teal-900 flex items-center gap-1">
                <i class="ph-bold ph-stethoscope"></i> ${isEn ? "Clinical Indications" : "Indikasi Utama"}
              </span>
              <p class="text-slate-600 leading-relaxed">${indications}</p>
            </div>

            <div class="space-y-1 md:col-span-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200">
              <span class="font-bold text-amber-900 flex items-center gap-1">
                <i class="ph-bold ph-warning-octagon"></i> ${isEn ? "Contraindications & Warnings" : "Kontraindikasi & Peringatan Klinis"}
              </span>
              <p class="text-amber-950 leading-relaxed mt-0.5">${contra}</p>
            </div>

            <div class="space-y-1">
              <span class="font-bold text-slate-800 flex items-center gap-1">
                <i class="ph-bold ph-first-aid"></i> ${isEn ? "Adverse Reactions / Side Effects" : "Efek Samping (Side Effects)"}
              </span>
              <p class="text-slate-600 leading-relaxed">${sideEffects}</p>
            </div>

            <div class="space-y-1">
              <span class="font-bold text-slate-800 flex items-center gap-1">
                <i class="ph-bold ph-arrows-clockwise"></i> ${isEn ? "Drug Interactions" : "Interaksi Obat"}
              </span>
              <p class="text-slate-600 leading-relaxed">${interactions}</p>
            </div>

            <div class="space-y-1">
              <span class="font-bold text-slate-800 flex items-center gap-1">
                <i class="ph-bold ph-chart-line-up"></i> ${isEn ? "Pharmacokinetics" : "Farmakokinetika"}
              </span>
              <p class="text-slate-600 leading-relaxed">${pk}</p>
            </div>

            <div class="space-y-1">
              <span class="font-bold text-slate-800 flex items-center gap-1">
                <i class="ph-bold ph-activity"></i> ${isEn ? "Pharmacodynamics" : "Farmakodinamika"}
              </span>
              <p class="text-slate-600 leading-relaxed">${pd}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <button 
                type="button" 
                data-drug-id="${drug.id}" 
                class="btn-open-learn-more px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <i class="ph-bold ph-book-open text-base"></i>
                <span>${isEn ? "Detail Monograph" : "Detail Monograf"}</span>
              </button>

              ${drug.sources?.includes("bsava") && drug.sources?.includes("plumbs") ? `
                <button 
                  type="button" 
                  data-drug-id="${drug.id}" 
                  class="btn-compare-sources px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 border border-amber-300 shadow-xs transition"
                  title="Bandingkan panduan BSAVA vs Plumb's secara berdampingan"
                >
                  <i class="ph-bold ph-scales text-base text-amber-700"></i>
                  <span>${isEn ? "Compare BSAVA vs Plumb's" : "Bandingkan BSAVA & Plumb's"}</span>
                </button>
              ` : ''}
            </div>

            <button 
              type="button" 
              data-drug-id="${drug.id}" 
              class="btn-calc-this-drug px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <i class="ph-bold ph-calculator text-base"></i>
              <span>${isEn ? `Calculate Dose (${drug.activeIngredient})` : `Hitung Dosis (${drug.activeIngredient})`}</span>
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Render Pagination Bar
    if (paginationContainer) {
      paginationContainer.innerHTML = `
        <div class="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <!-- Page size selector: 5, 10, 25 baris -->
          <div class="flex items-center gap-2.5">
            <span class="text-slate-500 font-medium">${isEn ? "Rows per page:" : "Tampilkan per halaman:"}</span>
            <div class="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 shadow-inner">
              ${[5, 10, 25].map(size => `
                <button 
                  type="button" 
                  data-size="${size}" 
                  class="btn-page-size px-3 py-1.5 rounded-lg font-bold text-xs transition ${this.pageSize === size ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'}"
                >
                  ${size} baris
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Page Summary -->
          <div class="text-slate-600 text-center font-medium">
            ${isEn 
              ? `Showing <span class="font-bold text-slate-900">${startIndex + 1}–${endIndex}</span> of <span class="font-bold text-teal-800">${totalItems}</span> drugs` 
              : `Menampilkan <span class="font-bold text-slate-900">${startIndex + 1}–${endIndex}</span> dari <span class="font-bold text-teal-800">${totalItems}</span> obat`
            }
          </div>

          <!-- Pagination Navigation -->
          <div class="flex items-center gap-1.5">
            <button 
              type="button" 
              id="btn-page-prev" 
              class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition" 
              ${this.currentPage <= 1 ? "disabled" : ""}
            >
              <i class="ph-bold ph-caret-left"></i>
              <span>${isEn ? "Prev" : "Sebelumnya"}</span>
            </button>

            <span class="px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-900 font-bold border border-teal-200 shadow-sm">
              ${isEn ? `Page ${this.currentPage} of ${totalPages}` : `Hal ${this.currentPage} dari ${totalPages}`}
            </span>

            <button 
              type="button" 
              id="btn-page-next" 
              class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition" 
              ${this.currentPage >= totalPages ? "disabled" : ""}
            >
              <span>${isEn ? "Next" : "Berikutnya"}</span>
              <i class="ph-bold ph-caret-right"></i>
            </button>
          </div>
        </div>
      `;

      // Page size event listeners
      paginationContainer.querySelectorAll(".btn-page-size").forEach(btn => {
        btn.addEventListener("click", () => {
          const newSize = parseInt(btn.dataset.size, 10);
          if (newSize && newSize !== this.pageSize) {
            this.pageSize = newSize;
            this.currentPage = 1;
            this.renderCatalog();
            document.getElementById("section-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });

      // Prev & Next event listeners
      const btnPrev = document.getElementById("btn-page-prev");
      btnPrev?.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderCatalog();
          document.getElementById("section-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      const btnNext = document.getElementById("btn-page-next");
      btnNext?.addEventListener("click", () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderCatalog();
          document.getElementById("section-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    // Attach button handlers
    container.querySelectorAll(".btn-open-learn-more").forEach(btn => {
      btn.addEventListener("click", () => {
        const drugId = btn.dataset.drugId;
        this.openLearnMoreModal(drugId);
      });
    });

    container.querySelectorAll(".btn-compare-sources").forEach(btn => {
      btn.addEventListener("click", () => {
        const drugId = btn.dataset.drugId;
        this.openLearnMoreModal(drugId, "compare");
      });
    });

    container.querySelectorAll(".btn-calc-this-drug").forEach(btn => {
      btn.addEventListener("click", () => {
        const drugId = btn.dataset.drugId;
        this.selectDrugForCalculator(drugId);
      });
    });
  }

  openLearnMoreModal(drugId, preferredTab) {
    const drug = this.drugs.find(d => d.id === drugId);
    if (!drug) return;

    this.activeLearnMoreDrug = drug;
    const lang = this.currentLang || "id";
    const isEn = lang === "en";
    const c = (drug.content && drug.content[lang]) ? drug.content[lang] : drug;

    // Update modal language buttons
    const btnId = document.getElementById("modal-btn-lang-id");
    const btnEn = document.getElementById("modal-btn-lang-en");
    if (isEn) {
      btnEn?.classList.add("bg-teal-600", "text-white", "font-bold");
      btnEn?.classList.remove("text-teal-200");
      btnId?.classList.remove("bg-teal-600", "text-white", "font-bold");
      btnId?.classList.add("text-teal-200");
    } else {
      btnId?.classList.add("bg-teal-600", "text-white", "font-bold");
      btnId?.classList.remove("text-teal-200");
      btnEn?.classList.remove("bg-teal-600", "text-white", "font-bold");
      btnEn?.classList.add("text-teal-200");
    }

    // Modal Header text
    document.getElementById("modal-drug-name").textContent = drug.activeIngredient;
    document.getElementById("modal-drug-class").textContent = c.drugClass || drug.drugClass;
    document.getElementById("modal-drug-brands").textContent = (isEn ? "Trade names: " : "Merk dagang: ") + (drug.brandNames || []).join(", ");

    const btnCalcText = document.getElementById("modal-btn-calc-text");
    if (btnCalcText) btnCalcText.textContent = isEn ? "Open in Dosage Calculator" : "Buka di Kalkulator Dosis";

    // Source Availability
    const hasBsava = drug.sources?.includes("bsava");
    const hasPlumbs = drug.sources?.includes("plumbs");

    const tabBsava = document.getElementById("modal-tab-bsava");
    const tabPlumbs = document.getElementById("modal-tab-plumbs");
    const tabCompare = document.getElementById("modal-tab-compare");
    const badgeInfo = document.getElementById("modal-source-badge-info");

    if (tabBsava) {
      tabBsava.style.display = hasBsava ? "inline-flex" : "none";
    }
    if (tabPlumbs) {
      tabPlumbs.style.display = hasPlumbs ? "inline-flex" : "none";
    }
    if (tabCompare) {
      tabCompare.style.display = (hasBsava && hasPlumbs) ? "inline-flex" : "none";
    }

    if (badgeInfo) {
      if (hasBsava && hasPlumbs) {
        badgeInfo.textContent = "(Tersedia di 2 Sumber: BSAVA 10th & Plumb's 7th)";
      } else if (hasBsava) {
        badgeInfo.textContent = "(Hanya Tersedia di BSAVA 10th Ed.)";
      } else {
        badgeInfo.textContent = "(Hanya Tersedia di Plumb's 7th Ed.)";
      }
    }

    // Determine target tab
    let targetTab = preferredTab;
    if (!targetTab) {
      if (hasBsava && hasPlumbs) {
        targetTab = "compare"; // Default to side-by-side comparison if both are present!
      } else if (hasPlumbs) {
        targetTab = "plumbs";
      } else {
        targetTab = "bsava";
      }
    } else {
      if (targetTab === "compare" && (!hasBsava || !hasPlumbs)) {
        targetTab = hasPlumbs ? "plumbs" : "bsava";
      }
    }

    // Populate Panes
    if (hasBsava) this.populateBsavaPane(drug, lang);
    if (hasPlumbs) this.populatePlumbsPane(drug, lang);
    if (hasBsava && hasPlumbs) this.populateComparePane(drug, lang);

    // Switch view
    this.switchMonographSourceTab(targetTab);

    document.getElementById("modal-learn-more")?.classList.remove("hidden");
  }

  switchMonographSourceTab(source) {
    this.activeMonographSource = source;
    const tabBsava = document.getElementById("modal-tab-bsava");
    const tabPlumbs = document.getElementById("modal-tab-plumbs");
    const tabCompare = document.getElementById("modal-tab-compare");

    const paneBsava = document.getElementById("modal-pane-bsava");
    const panePlumbs = document.getElementById("modal-pane-plumbs");
    const paneCompare = document.getElementById("modal-pane-compare");

    [tabBsava, tabPlumbs, tabCompare].forEach(btn => {
      btn?.classList.remove("bg-teal-600", "text-white", "font-bold", "shadow-xs");
      btn?.classList.add("text-slate-700", "font-medium");
    });

    if (source === "compare") {
      tabCompare?.classList.add("bg-teal-600", "text-white", "font-bold", "shadow-xs");
      tabCompare?.classList.remove("text-slate-700", "font-medium");
      paneBsava?.classList.add("hidden");
      panePlumbs?.classList.add("hidden");
      paneCompare?.classList.remove("hidden");
    } else if (source === "plumbs") {
      tabPlumbs?.classList.add("bg-teal-600", "text-white", "font-bold", "shadow-xs");
      tabPlumbs?.classList.remove("text-slate-700", "font-medium");
      paneBsava?.classList.add("hidden");
      panePlumbs?.classList.remove("hidden");
      paneCompare?.classList.add("hidden");
    } else {
      tabBsava?.classList.add("bg-teal-600", "text-white", "font-bold", "shadow-xs");
      tabBsava?.classList.remove("text-slate-700", "font-medium");
      paneBsava?.classList.remove("hidden");
      panePlumbs?.classList.add("hidden");
      paneCompare?.classList.add("hidden");
    }
  }

  populateBsavaPane(drug, lang) {
    const isEn = lang === "en";
    const c = (drug.content && drug.content[lang]) ? drug.content[lang] : drug;
    const b = drug.bsava || {};
    const lm = c.learnMore || drug.learnMore || b.learnMore || {};

    const hdrMoa = document.getElementById("modal-hdr-moa");
    if (hdrMoa) hdrMoa.innerHTML = `<i class="ph-bold ph-atom"></i> ${isEn ? "Mechanism of Action" : "Mekanisme Aksi (Mechanism of Action)"}`;

    const hdrInd = document.getElementById("modal-hdr-indications");
    if (hdrInd) hdrInd.innerHTML = `<i class="ph-bold ph-stethoscope"></i> ${isEn ? "Clinical Indications & Uses" : "Indikasi Klinis"}`;

    const hdrContra = document.getElementById("modal-hdr-contraindications");
    if (hdrContra) hdrContra.innerHTML = `<i class="ph-bold ph-warning-octagon"></i> ${isEn ? "Contraindications & Warnings" : "Kontraindikasi & Peringatan"}`;

    const hdrPk = document.getElementById("modal-hdr-pharmacokinetics");
    if (hdrPk) hdrPk.innerHTML = `<i class="ph-bold ph-arrows-split"></i> ${isEn ? "Pharmacokinetics" : "Farmakokinetika"}`;

    const hdrPd = document.getElementById("modal-hdr-pharmacodynamics");
    if (hdrPd) hdrPd.innerHTML = `<i class="ph-bold ph-chart-line-up"></i> ${isEn ? "Pharmacodynamics" : "Farmakodinamika"}`;

    const hdrInter = document.getElementById("modal-hdr-interactions");
    if (hdrInter) hdrInter.innerHTML = `<i class="ph-bold ph-arrows-clockwise"></i> ${isEn ? "Important Drug Interactions" : "Interaksi Obat Penting"}`;

    const hdrSpecial = document.getElementById("modal-hdr-special-instructions");
    if (hdrSpecial) hdrSpecial.textContent = isEn ? "Clinical Guidance & Monitoring" : "Petunjuk Khusus & Pemantauan";

    const lblCounsel = document.getElementById("modal-lbl-counseling");
    if (lblCounsel) lblCounsel.textContent = isEn ? "Client Counseling & Safety:" : "Konseling Klien / Administrasi:";

    const lblMonitor = document.getElementById("modal-lbl-monitoring");
    if (lblMonitor) lblMonitor.textContent = isEn ? "Laboratory Monitoring Parameters:" : "Parameter Monitoring Lab:";

    const lblOd = document.getElementById("modal-lbl-overdose");
    if (lblOd) lblOd.textContent = isEn ? "Toxicity & Overdose Management:" : "Manajemen Toksisitas / Overdosis:";

    const lblStorage = document.getElementById("modal-lbl-storage");
    if (lblStorage) lblStorage.textContent = isEn ? "Storage & Handling:" : "Penyimpanan:";

    const lblRef = document.getElementById("modal-lbl-references");
    if (lblRef) lblRef.textContent = isEn ? "References & Citations:" : "Referensi:";

    document.getElementById("modal-moa").textContent = b.mechanismOfAction || c.mechanismOfAction || drug.mechanismOfAction || "-";
    document.getElementById("modal-indications").textContent = b.indications || c.indications || drug.indications || "-";
    document.getElementById("modal-contraindications").textContent = b.contraindications || c.contraindications || drug.contraindications || "-";
    document.getElementById("modal-pharmacokinetics").textContent = b.pharmacokinetics || c.pharmacokinetics || drug.pharmacokinetics || "-";
    document.getElementById("modal-pharmacodynamics").textContent = b.pharmacodynamics || c.pharmacodynamics || drug.pharmacodynamics || "-";
    document.getElementById("modal-interactions").textContent = b.drugInteractions || c.drugInteractions || drug.drugInteractions || "-";

    // Antimicrobial Stewardship Intelligence in Modal
    this.renderAntimicrobialModalSection(drug);

    document.getElementById("modal-counseling").textContent = lm.counseling || "-";
    document.getElementById("modal-monitoring").textContent = lm.monitoring || "-";
    document.getElementById("modal-overdose").textContent = lm.overdose || "-";
    document.getElementById("modal-storage").textContent = lm.storage || "-";
    document.getElementById("modal-references").textContent = lm.references || "BSAVA Small Animal Formulary (10th Ed.)";
  }

  populatePlumbsPane(drug, lang) {
    const pBase = drug.plumbs;
    if (!pBase) return;

    const isEn = lang === "en";
    const p = (isEn ? pBase.en : pBase.id) || pBase;

    // Toggle button active states in Plumb's pane
    const btnPlumbsId = document.getElementById("modal-plumbs-btn-id");
    const btnPlumbsEn = document.getElementById("modal-plumbs-btn-en");
    if (isEn) {
      btnPlumbsEn?.classList.add("bg-amber-700", "text-white", "font-bold");
      btnPlumbsEn?.classList.remove("text-amber-800", "hover:text-amber-950");
      btnPlumbsId?.classList.remove("bg-amber-700", "text-white", "font-bold");
      btnPlumbsId?.classList.add("text-amber-800", "hover:text-amber-950");
    } else {
      btnPlumbsId?.classList.add("bg-amber-700", "text-white", "font-bold");
      btnPlumbsId?.classList.remove("text-amber-800", "hover:text-amber-950");
      btnPlumbsEn?.classList.remove("bg-amber-700", "text-white", "font-bold");
      btnPlumbsEn?.classList.add("text-amber-800", "hover:text-amber-950");
    }

    const pageTag = document.getElementById("modal-plumbs-page-tag");
    if (pageTag) {
      pageTag.textContent = pBase.sourcePage ? (isEn ? `Handbook Page: p. ${pBase.sourcePage}` : `Halaman Buku: hal. ${pBase.sourcePage}`) : "";
    }

    // Prescriber Highlights
    const hlBox = document.getElementById("modal-plumbs-highlights-box");
    const hlList = document.getElementById("modal-plumbs-highlights-list");
    const prescriberHighlights = p.prescriberHighlights || pBase.prescriberHighlights;
    if (hlList) {
      if (prescriberHighlights && prescriberHighlights.length > 0) {
        hlBox?.classList.remove("hidden");
        hlList.innerHTML = prescriberHighlights.map(h => `<li>${h}</li>`).join("");
      } else {
        hlBox?.classList.add("hidden");
      }
    }

    // Indications
    const elInd = document.getElementById("modal-plumbs-indications");
    if (elInd) elInd.textContent = p.indications || pBase.indications || "-";

    // Contraindications & Repro safety
    const elContra = document.getElementById("modal-plumbs-contraindications");
    if (elContra) elContra.textContent = p.contraindications || pBase.contraindications || "-";

    const reproBox = document.getElementById("modal-plumbs-repro-box");
    const elRepro = document.getElementById("modal-plumbs-repro");
    const reproSafety = p.reproductiveNursingSafety || pBase.reproductiveNursingSafety;
    if (reproSafety) {
      reproBox?.classList.remove("hidden");
      if (elRepro) elRepro.textContent = reproSafety;
    } else {
      reproBox?.classList.add("hidden");
    }

    // Adverse effects & Overdose
    const elAdv = document.getElementById("modal-plumbs-adverse");
    if (elAdv) elAdv.textContent = p.adverseEffects || pBase.adverseEffects || "-";

    const odBox = document.getElementById("modal-plumbs-overdose-box");
    const elOd = document.getElementById("modal-plumbs-overdose");
    const overdose = p.overdosageAcuteToxicity || pBase.overdosageAcuteToxicity;
    if (overdose) {
      odBox?.classList.remove("hidden");
      if (elOd) elOd.textContent = overdose;
    } else {
      odBox?.classList.add("hidden");
    }

    // PK & PD
    const elPk = document.getElementById("modal-plumbs-pk");
    if (elPk) elPk.textContent = p.pharmacokinetics || pBase.pharmacokinetics || "-";

    const elPd = document.getElementById("modal-plumbs-pd");
    if (elPd) elPd.textContent = p.pharmacodynamics || pBase.pharmacodynamics || "-";

    // Drug Interactions
    const noteEl = document.getElementById("modal-plumbs-interactions-note");
    const listEl = document.getElementById("modal-plumbs-interactions-list");
    const interactions = p.drugInteractions || pBase.drugInteractions;
    if (listEl) {
      if (interactions) {
        if (typeof interactions === "string") {
          if (noteEl) noteEl.textContent = "";
          listEl.innerHTML = `<p class="text-xs text-slate-700 leading-relaxed">${interactions}</p>`;
        } else {
          if (noteEl) noteEl.textContent = interactions.note || "";
          if (interactions.list && interactions.list.length > 0) {
            listEl.innerHTML = interactions.list.map(it => `
              <div class="p-2.5 rounded-lg bg-white border border-slate-200 text-xs shadow-xs">
                <span class="font-bold text-rose-800 uppercase tracking-wide">${it.drug}:</span>
                <span class="text-slate-700 ml-1 leading-relaxed">${it.description}</span>
              </div>
            `).join("");
          } else {
            listEl.innerHTML = `<p class="text-xs text-slate-700">${interactions.text || "-"}</p>`;
          }
        }
      } else {
        if (noteEl) noteEl.textContent = "";
        listEl.innerHTML = `<p class="text-xs text-slate-400 italic">${isEn ? "No specific interactions reported in Plumb's." : "Tidak ada interaksi khusus yang dilaporkan pada Plumb's."}</p>`;
      }
    }

    // Species Doses Container
    const dosesContainer = document.getElementById("modal-plumbs-doses-container");
    const doses = p.doses || pBase.doses;
    if (dosesContainer) {
      if (doses && doses.groups && doses.groups.length > 0) {
        dosesContainer.innerHTML = doses.groups.map(grp => `
          <div class="bg-white rounded-xl p-3 border border-teal-100 shadow-xs space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="bg-teal-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">${grp.speciesLabel || "Species"}</span>
              <span class="text-xs text-slate-500 font-medium">(${grp.items?.length || 0} ${isEn ? "clinical regimens" : "anjuran klinis"})</span>
            </div>
            <div class="space-y-1 pl-1">
              ${(grp.items || []).map(it => `
                <div class="text-xs text-slate-700 leading-relaxed">
                  <span class="font-bold text-teal-900">${it.label || "•"}</span> ${it.text}
                </div>
              `).join("")}
            </div>
          </div>
        `).join("");
      } else {
        dosesContainer.innerHTML = `<p class="text-xs text-slate-500 italic">${isEn ? "Refer to general dosage in calculator table." : "Lihat petunjuk dosis umum pada tabel kalkulator."}</p>`;
      }
    }

    // Client Info, Monitoring, Storage, Dosage Forms
    const elClient = document.getElementById("modal-plumbs-client-info");
    const clientInfo = p.clientInformation || pBase.clientInformation;
    if (elClient) {
      elClient.textContent = Array.isArray(clientInfo) ? clientInfo.join(" ") : (clientInfo || "-");
    }
    const elMon = document.getElementById("modal-plumbs-monitoring");
    const monitoring = p.monitoring || pBase.monitoring || pBase.laboratoryConsiderations;
    if (elMon) {
      elMon.textContent = Array.isArray(monitoring) ? monitoring.join(" ") : (monitoring || "-");
    }
    const elStore = document.getElementById("modal-plumbs-storage");
    const storage = p.storageStability || pBase.storageStability;
    if (elStore) {
      elStore.textContent = storage || "-";
    }
    const elForms = document.getElementById("modal-plumbs-forms");
    const dosageForms = p.dosageForms || pBase.dosageForms;
    if (elForms) {
      if (dosageForms && dosageForms.all && dosageForms.all.length > 0) {
        elForms.textContent = dosageForms.all.filter(f => f && f !== "None").join(" • ") || (isEn ? "Standard veterinary formulations" : "Sediaan formulasi standar veteriner");
      } else {
        elForms.textContent = "-";
      }
    }
  }

  populateComparePane(drug, lang) {
    const compareGrid = document.getElementById("modal-compare-grid");
    if (!compareGrid) return;

    const isEn = lang === "en";
    const b = drug.bsava || {};
    const pBase = drug.plumbs || {};
    const pLang = (isEn ? pBase.en : pBase.id) || pBase;

    const bMoa = b.mechanismOfAction || drug.mechanismOfAction || "-";
    const pMoa = pLang.pharmacodynamics || pLang.prescriberHighlights?.[0] || pBase.pharmacodynamics || pBase.prescriberHighlights?.[0] || "-";

    const bInd = b.indications || drug.indications || "-";
    const pInd = pLang.indications || pLang.prescriberHighlights?.[0] || pBase.indications || pBase.prescriberHighlights?.[0] || "-";

    const bContra = b.contraindications || drug.contraindications || "-";
    const pContra = pLang.contraindications || pBase.contraindications || "-";

    const bSe = b.sideEffects || drug.sideEffects || "-";
    const pSe = pLang.adverseEffects || pBase.adverseEffects || "-";

    const bInter = b.drugInteractions || drug.drugInteractions || "-";
    const pInter = (typeof pBase.drugInteractions === "string" ? pBase.drugInteractions : (pBase.drugInteractions?.text || (pBase.drugInteractions?.list || []).map(i => `${i.drug}: ${i.description}`).join("; "))) || "-";

    const bRef = b.learnMore?.references || "BSAVA Small Animal Formulary 10th Ed.";
    const pRef = `Plumb's Veterinary Drug Handbook 7th Ed. (${isEn ? "p." : "hal."} ${pBase.sourcePage || "-"})`;

    // Format Doses Comparison
    let bDosesHtml = "";
    if (drug.dosages) {
      bDosesHtml = Object.entries(drug.dosages).map(([sp, d]) => `
        <div class="bg-white p-2 rounded-lg border border-sky-200">
          <span class="font-bold uppercase text-[10px] text-sky-900">${sp}:</span> 
          <span class="font-semibold text-sky-800">${d.defaultDose || d.minDose} mg/kg</span> (${d.route || "PO"}, ${d.frequency || "s.2.dd"})
          <div class="text-[11px] text-slate-600 mt-0.5">${d.notes || d.indication || ""}</div>
        </div>
      `).join("");
    } else {
      bDosesHtml = `<p class='text-slate-500 italic'>${isEn ? "BSAVA standard dosing" : "Dosis standar BSAVA"}</p>`;
    }

    let pDosesHtml = "";
    const pDoses = pBase.doses;
    if (pDoses && pDoses.groups && pDoses.groups.length > 0) {
      pDosesHtml = pDoses.groups.slice(0, 3).map(g => `
        <div class="bg-white p-2 rounded-lg border border-amber-200">
          <span class="font-bold uppercase text-[10px] text-amber-900">${g.speciesLabel || "Species"}:</span>
          <div class="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
            ${g.items?.[0]?.text ? (g.items[0].text.substring(0, 150) + (g.items[0].text.length > 150 ? "..." : "")) : "-"}
          </div>
        </div>
      `).join("");
    } else {
      pDosesHtml = `<p class='text-slate-500 italic'>${isEn ? "See Plumb's tab for full regimens." : "Lihat tab Plumb's untuk anjuran lengkap."}</p>`;
    }

    const sections = [
      {
        title: isEn ? "1. Mechanism of Action" : "1. Mekanisme Kerja (Mechanism of Action)",
        icon: "ph-atom",
        iconColor: "text-teal-600",
        bsava: bMoa,
        plumbs: pMoa
      },
      {
        title: isEn ? "2. Clinical Indications & Primary Uses" : "2. Indikasi Klinis & Penggunaan Utama",
        icon: "ph-stethoscope",
        iconColor: "text-teal-600",
        bsava: bInd,
        plumbs: pInd
      },
      {
        title: isEn ? "3. Dosage Recommendations Comparison" : "3. Perbandingan Rekomendasi Dosis",
        icon: "ph-calculator",
        iconColor: "text-amber-600",
        bsavaCustom: bDosesHtml,
        plumbsCustom: pDosesHtml
      },
      {
        title: isEn ? "4. Contraindications & Safety Warnings" : "4. Kontraindikasi & Peringatan Keamanan",
        icon: "ph-warning-octagon",
        iconColor: "text-rose-600",
        bsava: bContra,
        plumbs: pContra
      },
      {
        title: isEn ? "5. Adverse Effects & Reactions" : "5. Efek Samping & Reaksi Merugikan (Adverse Reactions)",
        icon: "ph-first-aid",
        iconColor: "text-amber-600",
        bsava: bSe,
        plumbs: pSe
      },
      {
        title: isEn ? "6. Important Drug Interactions" : "6. Interaksi Obat Penting",
        icon: "ph-arrows-clockwise",
        iconColor: "text-teal-600",
        bsava: bInter,
        plumbs: pInter
      },
      {
        title: isEn ? "7. Source Citations & References" : "7. Sumber Sitasi & Halaman",
        icon: "ph-bookmark",
        iconColor: "text-slate-600",
        bsava: bRef,
        plumbs: pRef
      }
    ];

    compareGrid.innerHTML = sections.map(sec => `
      <div class="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <i class="ph-bold ${sec.icon} ${sec.iconColor} text-sm"></i>
          <span>${sec.title}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
          <div class="p-3.5 bg-sky-50/40 space-y-1">
            <span class="font-bold text-sky-950 flex items-center gap-1">
              <i class="ph-bold ph-book-open text-sky-700"></i> ${isEn ? "BSAVA Formulary (UK/Europe):" : "BSAVA Formulary (Inggris/Eropa):"}
            </span>
            ${sec.bsavaCustom ? sec.bsavaCustom : `<p class="text-slate-700 leading-relaxed mt-1">${sec.bsava}</p>`}
          </div>
          <div class="p-3.5 bg-amber-50/40 space-y-1">
            <span class="font-bold text-amber-950 flex items-center gap-1">
              <i class="ph-bold ph-book-bookmark text-amber-700"></i> ${isEn ? "Plumb's Handbook (US/Global):" : "Plumb's Handbook (AS/Global):"}
            </span>
            ${sec.plumbsCustom ? sec.plumbsCustom : `<p class="text-slate-700 leading-relaxed mt-1">${sec.plumbs}</p>`}
          </div>
        </div>
      </div>
    `).join("");
  }

  /* ------------------------------------------------------------- */
  /* SETTINGS & DATABASE MANAGEMENT (.JSON IMPORT / EXPORT)        */
  /* ------------------------------------------------------------- */
  setupSettingsEvents() {
    // Subtabs inside Settings (Preferensi Bahasa, Terminologi Latin, Firebase Hosting)
    const subtabs = [
      { btnId: "settings-tab-btn-profile", panelId: "settings-panel-profile" },
      { btnId: "settings-tab-btn-lang", panelId: "settings-panel-lang" },
      { btnId: "settings-tab-btn-terms", panelId: "settings-panel-terms" },
      { btnId: "settings-tab-btn-firebase", panelId: "settings-panel-firebase" }
    ];

    subtabs.forEach(({ btnId, panelId }) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener("click", () => {
        subtabs.forEach(st => {
          document.getElementById(st.panelId)?.classList.add("hidden");
          const b = document.getElementById(st.btnId);
          b?.classList.remove("bg-teal-600", "text-white", "shadow-sm");
          b?.classList.add("bg-white", "text-slate-700", "border", "border-slate-200");
        });

        document.getElementById(panelId)?.classList.remove("hidden");
        btn.classList.add("bg-teal-600", "text-white", "shadow-sm");
        btn.classList.remove("bg-white", "text-slate-700", "border", "border-slate-200");

        if (panelId === "settings-panel-profile") {
          this.renderUserProfileUI();
        }
        if (panelId === "settings-panel-terms") {
          this.renderTerminologyTable();
        }
      });
    });

    // Language buttons in settings
    document.getElementById("settings-lang-id-btn")?.addEventListener("click", () => this.setLanguage("id"));
    document.getElementById("settings-lang-en-btn")?.addEventListener("click", () => this.setLanguage("en"));

    // Reset database to default BSAVA
    document.getElementById("btn-reset-db-default")?.addEventListener("click", () => {
      if (confirm("Kembalikan database obat ke setelan bawaan formularium BSAVA 10th Ed. & Plumb's (433 Monograf)?")) {
        localStorage.removeItem("vet_custom_drugs_db");
        this.drugs = VET_DRUG_DATABASE;
        this.updateDatabaseBadges();
        this.initCalculatorForm();
        this.initCompoundingForm();
        this.renderCatalog();
        this.showToast("Database obat berhasil dikembalikan ke default (433 Monograf)!", "success");
      }
    });

    // Export database to JSON file
    document.getElementById("btn-export-db-json")?.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.drugs, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `katalog_obat_veteriner_${this.drugs.length}_monograf.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      this.showToast(`Database (${this.drugs.length} monograf) berhasil diekspor ke file JSON!`, "success");
    });

    // File input & Drag-and-drop
    const fileInput = document.getElementById("input-db-json-file");
    const dropzone = document.getElementById("json-dropzone");
    const btnSelect = document.getElementById("btn-select-json-file");

    btnSelect?.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput?.click();
    });

    dropzone?.addEventListener("click", () => {
      fileInput?.click();
    });

    dropzone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("border-teal-600", "bg-teal-100/40");
    });

    dropzone?.addEventListener("dragleave", () => {
      dropzone.classList.remove("border-teal-600", "bg-teal-100/40");
    });

    dropzone?.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("border-teal-600", "bg-teal-100/40");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleJsonFileSelect(e.dataTransfer.files[0]);
      }
    });

    fileInput?.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleJsonFileSelect(e.target.files[0]);
      }
    });

    // Apply JSON import
    document.getElementById("btn-apply-json-import")?.addEventListener("click", () => {
      if (!this.stagedJsonData || this.stagedJsonData.length === 0) {
        this.showToast("Tidak ada data obat valid untuk diimpor", "error");
        return;
      }
      this.drugs = this.stagedJsonData;
      try {
        localStorage.setItem("vet_custom_drugs_db", JSON.stringify(this.drugs));
        localStorage.setItem("vet_custom_drugs_db_version", "3.3_eyd_kbbi_spacing_clean");
      } catch (err) {
        console.warn("Could not save to localStorage (quota)", err);
      }
      this.updateDatabaseBadges();
      this.initCalculatorForm();
      this.initCompoundingForm();
      this.renderCatalog();
      document.getElementById("json-file-preview")?.classList.add("hidden");
      this.showToast(`Database berhasil diperbarui! ${this.drugs.length} monograf obat kini aktif.`, "success");
    });

    // Cancel JSON import
    document.getElementById("btn-cancel-json-import")?.addEventListener("click", () => {
      this.stagedJsonData = null;
      document.getElementById("json-file-preview")?.classList.add("hidden");
      if (fileInput) fileInput.value = "";
    });

    this.updateDatabaseBadges();
  }

  handleJsonFileSelect(file) {
    if (!file.name.endsWith(".json")) {
      this.showToast("Harap pilih file dengan format .json", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        let drugList = [];

        if (Array.isArray(parsed)) {
          drugList = parsed;
        } else if (parsed.monographs && Array.isArray(parsed.monographs)) {
          drugList = this.convertBsavaFormatToAppFormat(parsed.monographs);
        } else if (parsed.drugs && Array.isArray(parsed.drugs)) {
          drugList = parsed.drugs;
        } else {
          throw new Error("Format file JSON tidak dikenali sebagai database monograf obat.");
        }

        if (drugList.length === 0) {
          throw new Error("File tidak memuat data monograf obat.");
        }

        this.stagedJsonData = drugList;

        const previewBox = document.getElementById("json-file-preview");
        if (previewBox) {
          document.getElementById("preview-file-name").textContent = file.name;
          document.getElementById("preview-file-size").textContent = `${(file.size / 1024).toFixed(1)} KB`;
          document.getElementById("preview-file-count").textContent = `${drugList.length} Monograf`;
          document.getElementById("preview-file-status").textContent = "Siap Diimpor";
          previewBox.classList.remove("hidden");
        }
        this.showToast(`File ${file.name} berhasil dibaca (${drugList.length} obat ditemukan)`, "info");
      } catch (err) {
        this.showToast(`Gagal membaca file JSON: ${err.message}`, "error");
      }
    };
    reader.readAsText(file);
  }

  updateDatabaseBadges() {
    const count = this.drugs.length;
    const badge1 = document.getElementById("drug-count-badge");
    if (badge1) {
      const isEn = this.currentLang === "en";
      badge1.textContent = isEn ? `${count} Drugs Available` : `${count} Obat Tersedia`;
    }

    const badge2 = document.getElementById("settings-db-status-badge");
    if (badge2) badge2.textContent = `${count} Monograf Aktif (BSAVA & Plumb's)`;

    const statCount = document.getElementById("settings-stat-count");
    if (statCount) statCount.textContent = `${count} Obat`;
  }

  convertBsavaFormatToAppFormat(monographs) {
    return monographs.map(m => {
      const slug = (m.name || "drug").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const cleanSlug = slug.replace(/[^a-z0-9]/g, '');
      const existing = VET_DRUG_DATABASE.find(d => 
        (d.id && d.id === slug) || 
        (d.id && d.id.replace(/[^a-z0-9]/g, '') === cleanSlug) ||
        (d.activeIngredient && d.activeIngredient.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSlug)
      );

      const action = typeof m.action === "string" ? m.action : (Array.isArray(m.action) ? m.action.join(" ") : "");
      const uses = Array.isArray(m.uses) ? m.uses.join(" ") : (m.uses || "");
      const contra = typeof m.contraindications === "string" ? m.contraindications : (Array.isArray(m.contraindications) ? m.contraindications.join(" ") : "");
      const adverse = typeof m.adverse_reactions === "string" ? m.adverse_reactions : (Array.isArray(m.adverse_reactions) ? m.adverse_reactions.join(" ") : "");
      const interactions = typeof m.drug_interactions === "string" ? m.drug_interactions : (Array.isArray(m.drug_interactions) ? m.drug_interactions.join(" ") : "");

      // Indonesian Content: Use curated / pre-translated from database if available
      const idContent = existing?.content?.id || {
        drugClass: existing?.drugClass || "Monograf BSAVA Small Animal Formulary",
        mechanismOfAction: existing?.mechanismOfAction || `Aksi farmakologis ${m.name}: ${action}`,
        indications: existing?.indications || `Indikasi klinis: ${uses}`,
        contraindications: existing?.contraindications || `Kontraindikasi: ${contra || "Perhatikan riwayat hipersensitivitas dan fungsi organ vital."}`,
        sideEffects: existing?.sideEffects || `Efek samping: ${adverse || "Pantau toleransi dan respon klinis hewan."}`,
        drugInteractions: existing?.drugInteractions || `Interaksi obat: ${interactions || "Periksa interaksi dengan obat lain."}`,
        pharmacokinetics: existing?.pharmacokinetics || "Profil absorpsi dan ekskresi sesuai monograf BSAVA.",
        pharmacodynamics: existing?.pharmacodynamics || "Efek farmakodinamik optimal pada jaringan sasaran.",
        learnMore: existing?.learnMore || {
          counseling: typeof m.safety_and_handling === "string" ? m.safety_and_handling : "Ikuti petunjuk dokter hewan.",
          monitoring: "Monitor respon klinis dan parameter fisiologis pasien.",
          overdose: "Hentikan pemberian obat dan berikan terapi suportif jika dicurigai overdosis.",
          storage: "Simpan pada suhu ruang terkontrol, terlindung dari cahaya.",
          references: `BSAVA Small Animal Formulary Part A 10th Ed.`
        }
      };

      // English Content
      const enContent = existing?.content?.en || {
        drugClass: "BSAVA Small Animal Formulary Monograph",
        mechanismOfAction: action || `Pharmacological action of ${m.name} based on BSAVA Formulary.`,
        indications: uses || `Clinical indications based on BSAVA Formulary.`,
        contraindications: contra || "Contraindicated in animals with known hypersensitivity.",
        sideEffects: adverse || "Monitor adverse effects and clinical tolerance in animals.",
        drugInteractions: interactions || "Check specific drug interactions when combined with other agents.",
        pharmacokinetics: action || "Pharmacokinetic profile based on BSAVA monograph.",
        pharmacodynamics: action || "Pharmacodynamic action on target receptors.",
        learnMore: {
          counseling: typeof m.safety_and_handling === "string" ? m.safety_and_handling : "Follow veterinary instructions.",
          monitoring: "Monitor clinical response and vital signs.",
          overdose: "Discontinue administration and provide supportive therapy in suspected overdose.",
          storage: "Store at controlled room temperature, protect from light.",
          references: `BSAVA Small Animal Formulary Part A 10th Ed.`
        }
      };

      return {
        id: slug,
        activeIngredient: existing?.activeIngredient || m.name,
        brandNames: (existing?.brandNames && existing.brandNames.length > 0) ? existing.brandNames : (Array.isArray(m.trade_names) ? m.trade_names.map(t => String(t).replace(/\*+/g, "").trim()).filter(Boolean) : [m.name]),
        drugClass: idContent.drugClass,
        species: existing?.species || ["canine", "feline"],
        category: existing?.category || "other",
        mechanismOfAction: idContent.mechanismOfAction,
        indications: idContent.indications,
        contraindications: idContent.contraindications,
        sideEffects: idContent.sideEffects,
        drugInteractions: idContent.drugInteractions,
        pharmacokinetics: idContent.pharmacokinetics,
        pharmacodynamics: idContent.pharmacodynamics,
        learnMore: idContent.learnMore,
        formulations: existing?.formulations || [
          { id: `${slug}-std`, type: "tablet", strength: 100, unit: "mg", label: "100 mg tablet", code: "tab" }
        ],
        dosages: existing?.dosages || {
          canine: {
            indication: "BSAVA Regimen",
            minDose: 1,
            maxDose: 10,
            defaultDose: 5,
            unit: "mg/kg",
            route: "PO",
            frequency: "s.2.dd",
            frequencyText: "Twice daily (q12h)",
            defaultDurationDays: 7,
            notes: "Lihat rincian protokol dosis lengkap pada monograf BSAVA."
          }
        },
        content: {
          id: idContent,
          en: enContent
        }
      };
    });
  }

  /* ------------------------------------------------------------- */
  /* 2. VETERINARY DOSAGE CALCULATOR                               */
  /* ------------------------------------------------------------- */
  selectDrugForCalculator(drugId) {
    this.selectDrugInCalculator(drugId);

    if (this.switchCalculatorSubtab) {
      this.switchCalculatorSubtab("calculator");
    }

    // Switch to calculator tab
    document.getElementById("nav-calculator")?.click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  setupCalculatorEvents() {
    // Setup interactive searchable drug selector
    this.setupSearchableDrugSelector();

    // Species buttons in calculator
    const specBtns = document.querySelectorAll(".calc-spec-btn");
    specBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        specBtns.forEach(b => {
          b.classList.remove("border-2", "border-teal-600", "bg-teal-50", "text-teal-900");
          b.classList.add("border", "border-slate-200", "bg-white", "text-slate-700");
        });
        btn.classList.add("border-2", "border-teal-600", "bg-teal-50", "text-teal-900");
        btn.classList.remove("border", "border-slate-200", "bg-white", "text-slate-700");

        this.calcState.species = btn.dataset.species;
        this.updateDrugDosageDefaults();
        this.runCalculation();
        this.updateCompoundingDrugSelection();
      });
    });

    // Weight unit toggle (kg vs lbs)
    const btnKg = document.getElementById("btn-unit-kg");
    const btnLbs = document.getElementById("btn-unit-lbs");
    btnKg?.addEventListener("click", () => {
      this.calcState.weightUnit = "kg";
      btnKg.classList.add("bg-teal-600", "text-white");
      btnKg.classList.remove("text-slate-600");
      btnLbs?.classList.remove("bg-teal-600", "text-white");
      btnLbs?.classList.add("text-slate-600");
      this.runCalculation();
      this.updateCompoundingDrugSelection();
    });

    btnLbs?.addEventListener("click", () => {
      this.calcState.weightUnit = "lbs";
      btnLbs.classList.add("bg-teal-600", "text-white");
      btnLbs.classList.remove("text-slate-600");
      btnKg?.classList.remove("bg-teal-600", "text-white");
      btnKg?.classList.add("text-slate-600");
      this.runCalculation();
      this.updateCompoundingDrugSelection();
    });

    document.getElementById("calc-weight")?.addEventListener("input", (e) => {
      this.calcState.weight = parseFloat(e.target.value) || 0;
      this.runCalculation();
      this.updateCompoundingDrugSelection();
    });

    document.getElementById("calc-drug-select")?.addEventListener("change", (e) => {
      this.selectDrugInCalculator(e.target.value);
    });

    document.getElementById("calc-dose-rate")?.addEventListener("input", (e) => {
      this.calcState.doseRate = parseFloat(e.target.value) || 0;
      this.runCalculation();
    });

    document.getElementById("calc-formulation-select")?.addEventListener("change", (e) => {
      this.calcState.formulationId = e.target.value;
      this.runCalculation();
    });

    document.getElementById("calc-frequency-select")?.addEventListener("change", (e) => {
      this.calcState.frequencyCode = e.target.value;
      this.runCalculation();
    });

    document.getElementById("calc-duration")?.addEventListener("input", (e) => {
      this.calcState.durationDays = parseInt(e.target.value) || 1;
      this.runCalculation();
    });

    // Add to Cart button (Single Drug)
    document.getElementById("btn-add-to-cart")?.addEventListener("click", () => {
      this.handleAddCurrentCalcToCart();
    });

    // Add to Compounding Formula button
    document.getElementById("btn-add-to-compound-formula")?.addEventListener("click", () => {
      this.handleAddCalculatedToCompounding();
    });

    // Template editor modal trigger
    document.getElementById("btn-add-template-modal")?.addEventListener("click", () => {
      this.openTemplateEditor(null);
    });

    document.getElementById("btn-close-tpl-modal")?.addEventListener("click", () => {
      document.getElementById("modal-template-editor")?.classList.add("hidden");
    });

    document.getElementById("btn-cancel-tpl-modal")?.addEventListener("click", () => {
      document.getElementById("modal-template-editor")?.classList.add("hidden");
    });

    // Reset templates to defaults
    document.getElementById("btn-reset-templates-default")?.addEventListener("click", () => {
      if (confirm("Reset seluruh template kembali ke 5 preset standar veteriner? (Perubahan kustom akan direset)")) {
        ClinicalPresetManager.resetToDefaults();
        this.renderTemplatesList();
        this.showToast("Template telah direset ke standar veteriner.", "info");
      }
    });

    // Template search & filters
    document.getElementById("tpl-search-input")?.addEventListener("input", () => this.renderTemplatesList());
    document.getElementById("tpl-filter-species")?.addEventListener("change", () => this.renderTemplatesList());
    document.getElementById("tpl-filter-type")?.addEventListener("change", () => this.renderTemplatesList());

    // Template form submission
    document.getElementById("form-template-editor")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSaveTemplateForm();
    });
  }

  initCalculatorForm() {
    this.selectDrugInCalculator(this.calcState.drugId || this.drugs[0]?.id);
  }

  selectDrugInCalculator(drugId) {
    const drug = this.drugs.find(d => d.id === drugId) || this.drugs[0];
    if (!drug) return;

    this.calcState.drugId = drug.id;

    // Update hidden input
    const hiddenSelect = document.getElementById("calc-drug-select");
    if (hiddenSelect) {
      hiddenSelect.value = drug.id;
    }

    // Update search text input
    const searchInput = document.getElementById("calc-drug-search-input");
    const brandStr = drug.brandNames && drug.brandNames.length > 0 ? ` (${drug.brandNames[0]})` : "";
    if (searchInput) {
      searchInput.value = `${drug.activeIngredient}${brandStr}`;
    }

    // Show clear button
    const clearBtn = document.getElementById("btn-calc-drug-clear");
    if (clearBtn) {
      clearBtn.classList.remove("hidden");
    }

    // Update active badge
    const badge = document.getElementById("calc-drug-selected-badge");
    if (badge) {
      badge.textContent = drug.drugClass || "Zat Aktif";
      badge.classList.remove("hidden");
    }

    // Populate formulations, dosage defaults, run calculation
    this.populateFormulationsForSelectedDrug();
    this.updateDrugDosageDefaults();
    this.runCalculation();
    this.updateCompoundingDrugSelection();
  }

  setupSearchableDrugSelector() {
    const searchInput = document.getElementById("calc-drug-search-input");
    const resultsBox = document.getElementById("calc-drug-search-results");
    const clearBtn = document.getElementById("btn-calc-drug-clear");
    const wrapper = document.getElementById("calc-drug-search-wrapper");

    if (!searchInput || !resultsBox) return;

    const renderResults = (query = "") => {
      const q = query.trim().toLowerCase();
      let matched = this.drugs;

      if (q.length > 0) {
        matched = this.drugs.filter(d => {
          const name = (d.activeIngredient || "").toLowerCase();
          const brands = (d.brandNames || []).join(" ").toLowerCase();
          const dClass = (d.drugClass || "").toLowerCase();
          return name.includes(q) || brands.includes(q) || dClass.includes(q);
        });
      }

      // Sort alphabetically (A-Z)
      const sorted = [...matched].sort((a, b) => 
        (a.activeIngredient || "").localeCompare(b.activeIngredient || "", undefined, { sensitivity: "base" })
      );

      if (sorted.length === 0) {
        resultsBox.innerHTML = `
          <div class="p-4 text-center text-slate-400">
            <i class="ph ph-magnifying-glass text-lg mb-1 block"></i>
            Tidak ada obat yang cocok dengan "<b>${query}</b>"
          </div>
        `;
        resultsBox.classList.remove("hidden");
        return;
      }

      const itemsToRender = sorted.slice(0, 40);
      resultsBox.innerHTML = `
        <div class="py-1">
          <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100 flex justify-between">
            <span>Hasil Pencarian (${sorted.length} Obat A-Z)</span>
            ${sorted.length > 40 ? `<span class="text-teal-600">Menampilkan 40 teratas</span>` : ""}
          </div>
          ${itemsToRender.map(d => {
            const isSelected = d.id === this.calcState.drugId;
            const brands = (d.brandNames || []).slice(0, 2).join(", ");
            return `
              <button 
                type="button" 
                data-drug-id="${d.id}" 
                class="btn-select-calc-drug w-full text-left px-3.5 py-2 hover:bg-teal-50 flex items-center justify-between transition ${isSelected ? 'bg-teal-50/80 text-teal-900 font-semibold' : 'text-slate-800'}"
              >
                <div class="truncate mr-2">
                  <div class="font-bold text-xs truncate flex items-center gap-1.5">
                    ${isSelected ? '<i class="ph-bold ph-check text-teal-600 text-xs"></i>' : ''}
                    <span>${d.activeIngredient}</span>
                  </div>
                  ${brands ? `<div class="text-[10px] text-slate-500 truncate mt-0.5">${brands}</div>` : ''}
                </div>
                <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  ${d.drugClass || 'Veteriner'}
                </span>
              </button>
            `;
          }).join("")}
        </div>
      `;

      resultsBox.querySelectorAll(".btn-select-calc-drug").forEach(btn => {
        const handleSelect = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const dId = btn.dataset.drugId;
          this.selectDrugInCalculator(dId);
          resultsBox.classList.add("hidden");
          searchInput.blur();
        };

        btn.addEventListener("pointerdown", handleSelect);
        btn.addEventListener("click", handleSelect);
      });

      resultsBox.classList.remove("hidden");
    };

    // Input events
    searchInput.addEventListener("focus", () => {
      renderResults(searchInput.value);
    });

    searchInput.addEventListener("input", () => {
      if (searchInput.value.trim().length > 0) {
        clearBtn?.classList.remove("hidden");
      } else {
        clearBtn?.classList.add("hidden");
      }
      renderResults(searchInput.value);
    });

    // Clear button
    clearBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      searchInput.value = "";
      clearBtn.classList.add("hidden");
      renderResults("");
      searchInput.focus();
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (wrapper && !wrapper.contains(e.target)) {
        resultsBox.classList.add("hidden");
        const currentDrug = this.drugs.find(d => d.id === this.calcState.drugId);
        if (currentDrug && searchInput.value.trim() === "") {
          const brandStr = currentDrug.brandNames && currentDrug.brandNames.length > 0 ? ` (${currentDrug.brandNames[0]})` : "";
          searchInput.value = `${currentDrug.activeIngredient}${brandStr}`;
          clearBtn?.classList.remove("hidden");
        }
      }
    });

    // Close on escape key
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        resultsBox.classList.add("hidden");
      }
    });
  }

  populateFormulationsForSelectedDrug() {
    const drug = this.drugs.find(d => d.id === this.calcState.drugId);
    if (!drug) return;

    const formSelect = document.getElementById("calc-formulation-select");
    if (formSelect) {
      formSelect.innerHTML = drug.formulations.map(f => `
        <option value="${f.id}">
          ${f.label} [${f.type.toUpperCase()}]
        </option>
      `).join("");

      this.calcState.formulationId = drug.formulations[0]?.id;
    }
  }

  updateDrugDosageDefaults() {
    const drug = this.drugs.find(d => d.id === this.calcState.drugId);
    if (!drug) return;

    const speciesDose = drug.dosages[this.calcState.species] || drug.dosages["canine"] || Object.values(drug.dosages)[0];
    const doseRateInput = document.getElementById("calc-dose-rate");
    const hint = document.getElementById("calc-dose-range-hint");

    if (speciesDose && doseRateInput) {
      doseRateInput.value = speciesDose.defaultDose;
      this.calcState.doseRate = speciesDose.defaultDose;
      if (hint) {
        hint.textContent = `Rentang: ${speciesDose.minDose} - ${speciesDose.maxDose} mg/kg (${speciesDose.indication})`;
      }
      if (speciesDose.frequency) {
        this.calcState.frequencyCode = speciesDose.frequency;
        const freqSelect = document.getElementById("calc-frequency-select");
        if (freqSelect) freqSelect.value = speciesDose.frequency;
      }
    }
  }

  runCalculation() {
    const drug = this.drugs.find(d => d.id === this.calcState.drugId);
    if (!drug) return;

    const formulation = drug.formulations.find(f => f.id === this.calcState.formulationId) || drug.formulations[0];

    try {
      const result = calculateDose({
        species: this.calcState.species,
        weight: this.calcState.weight,
        weightUnit: this.calcState.weightUnit,
        drug,
        doseRate: this.calcState.doseRate,
        formulation,
        frequencyCode: this.calcState.frequencyCode,
        durationDays: this.calcState.durationDays
      });

      this.currentCalcResult = result;

      // Update Result UI
      document.getElementById("res-patient-summary").textContent = 
        `${result.patientWeightKg} kg • ${this.calcState.species.toUpperCase()}`;
      document.getElementById("res-dose-mg").textContent = result.doseMgPerAdmin.toFixed(2);
      document.getElementById("res-unit-admin").textContent = `= ${result.unitDisplay} per pemberian`;
      document.getElementById("res-daily-mg").textContent = `${result.dailyDoseMg.toFixed(2)} mg / hari`;
      document.getElementById("res-freq-text").textContent = result.frequencyText;
      document.getElementById("res-total-units").textContent = `${result.roundedTotalQuantity} ${formulation.code || "unit"}`;
      document.getElementById("res-roman-qty").textContent = `No ${result.romanNumeralQuantity}`;

      // Warnings
      const warnBox = document.getElementById("res-warnings-box");
      if (result.warnings.length > 0) {
        warnBox.classList.remove("hidden");
        warnBox.innerHTML = result.warnings.map(w => `<p><i class="ph-bold ph-warning"></i> ${w}</p>`).join("");
      } else {
        warnBox.classList.add("hidden");
      }

      this.updateSpeciesSafetyAlerts();
    } catch (e) {
      console.warn("Calculation notice:", e.message);
    }
  }

  initCalculatorSubtabs() {
    const btnCalc = document.getElementById("subtab-btn-calculator");
    const btnTpl = document.getElementById("subtab-btn-templates");
    const btnGuide = document.getElementById("subtab-btn-guidelines");

    const viewCalc = document.getElementById("subview-calc-main");
    const viewTpl = document.getElementById("subview-calc-templates");
    const viewGuide = document.getElementById("subview-calc-guidelines");

    const switchSubtab = (activeTab) => {
      // Buttons styling
      [btnCalc, btnTpl, btnGuide].forEach(b => {
        if (!b) return;
        b.classList.remove("bg-teal-700", "text-white", "shadow-sm");
        b.classList.add("bg-slate-100", "hover:bg-slate-200", "text-slate-700");
      });

      // Views visibility
      [viewCalc, viewTpl, viewGuide].forEach(v => v?.classList.add("hidden"));

      if (activeTab === "calculator") {
        btnCalc?.classList.add("bg-teal-700", "text-white", "shadow-sm");
        btnCalc?.classList.remove("bg-slate-100", "hover:bg-slate-200", "text-slate-700");
        viewCalc?.classList.remove("hidden");
      } else if (activeTab === "templates") {
        btnTpl?.classList.add("bg-teal-700", "text-white", "shadow-sm");
        btnTpl?.classList.remove("bg-slate-100", "hover:bg-slate-200", "text-slate-700");
        viewTpl?.classList.remove("hidden");
        this.renderTemplatesList();
      } else if (activeTab === "guidelines") {
        btnGuide?.classList.add("bg-teal-700", "text-white", "shadow-sm");
        btnGuide?.classList.remove("bg-slate-100", "hover:bg-slate-200", "text-slate-700");
        viewGuide?.classList.remove("hidden");
        this.renderPrescriptionAlgorithmCard();
      }
    };

    btnCalc?.addEventListener("click", () => switchSubtab("calculator"));
    btnTpl?.addEventListener("click", () => switchSubtab("templates"));
    btnGuide?.addEventListener("click", () => switchSubtab("guidelines"));

    document.getElementById("btn-quick-open-templates")?.addEventListener("click", () => switchSubtab("templates"));
    document.getElementById("btn-quick-open-guidelines")?.addEventListener("click", () => switchSubtab("guidelines"));

    this.switchCalculatorSubtab = switchSubtab;
  }

  renderTemplatesList() {
    const container = document.getElementById("templates-cards-grid");
    if (!container) return;

    const presets = ClinicalPresetManager.getPresets();

    // Update count badge
    const badge = document.getElementById("templates-count-badge");
    if (badge) badge.textContent = presets.length;

    // Filters
    const searchQuery = (document.getElementById("tpl-search-input")?.value || "").toLowerCase().trim();
    const speciesFilter = document.getElementById("tpl-filter-species")?.value || "all";
    const typeFilter = document.getElementById("tpl-filter-type")?.value || "all";

    const filtered = presets.filter(p => {
      // Species filter
      if (speciesFilter !== "all" && p.patient?.species !== speciesFilter) {
        return false;
      }
      // Type filter
      if (typeFilter === "compounding" && !p.compounding) return false;
      if (typeFilter === "single" && !p.singleDose) return false;

      // Search query
      if (searchQuery) {
        const title = (p.title || "").toLowerCase();
        const subtitle = (p.subtitle || "").toLowerCase();
        const desc = (p.caseDescription || "").toLowerCase();
        const diag = (p.patient?.diagnosis || "").toLowerCase();
        const drug = (p.singleDose?.drugName || "").toLowerCase();
        const matched = title.includes(searchQuery) || subtitle.includes(searchQuery) || desc.includes(searchQuery) || diag.includes(searchQuery) || drug.includes(searchQuery);
        if (!matched) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400 space-y-2">
          <i class="ph-bold ph-magnifying-glass text-3xl"></i>
          <p class="font-semibold text-sm">Tidak ada template yang cocok dengan filter pencarian.</p>
          <button type="button" id="btn-tpl-reset-filter" class="text-xs text-teal-600 hover:underline font-bold">Reset Filter & Cari Ulang</button>
        </div>
      `;
      document.getElementById("btn-tpl-reset-filter")?.addEventListener("click", () => {
        const search = document.getElementById("tpl-search-input");
        if (search) search.value = "";
        const spec = document.getElementById("tpl-filter-species");
        if (spec) spec.value = "all";
        const type = document.getElementById("tpl-filter-type");
        if (type) type.value = "all";
        this.renderTemplatesList();
      });
      return;
    }

    container.innerHTML = filtered.map(p => {
      const isComp = !!p.compounding;
      const speciesName = {
        canine: "Anjing",
        feline: "Kucing",
        bovine: "Sapi / Ruminan",
        equine: "Kuda",
        exotic: "Kelinci / Eksotik",
        avian: "Unggas",
        clinic: "Stok Klinik"
      }[p.patient?.species] || p.patient?.species || "Hewan";

      const speciesIcon = {
        canine: "ph-dog",
        feline: "ph-cat",
        bovine: "ph-cow",
        equine: "ph-horse",
        exotic: "ph-rabbit",
        avian: "ph-bird",
        clinic: "ph-first-aid-kit"
      }[p.patient?.species] || "ph-paw-print";

      return `
        <div class="bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
          <div class="space-y-2.5">
            <div class="flex items-start justify-between gap-2">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                <i class="ph-bold ${speciesIcon}"></i> ${speciesName}
              </span>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isComp ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'}">
                  ${isComp ? (p.compounding.hasDtd ? 'Racikan DTD' : 'Racikan non-DTD') : 'Obat Tunggal'}
                </span>
                ${p.isCustom ? `
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Kustom</span>
                ` : `
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">Standar</span>
                `}
              </div>
            </div>

            <div>
              <h4 class="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition leading-snug">${p.title}</h4>
              <p class="text-xs text-slate-500 font-medium mt-0.5">${p.subtitle || ""}</p>
            </div>

            <p class="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/80">
              ${p.caseDescription || "Template peresepan klinis terverifikasi."}
            </p>

            <!-- Regimen Summary -->
            <div class="text-[11px] space-y-1 text-slate-700 font-mono bg-slate-100/70 p-2.5 rounded-xl border border-slate-200">
              <div><span class="font-sans font-bold text-slate-900">Signa:</span> <span class="text-teal-800 font-semibold">${p.compounding?.signa || p.singleDose?.signa || "-"}</span></div>
              ${p.patient?.weight > 0 ? `<div><span class="font-sans font-bold text-slate-900">BB Acuan:</span> ${p.patient.weight} kg (${p.patient.name || "-"})</div>` : ""}
              ${isComp ? `
                <div><span class="font-sans font-bold text-slate-900">Bahan (${p.compounding.ingredients?.length || 0}):</span> <span class="text-slate-600 font-sans">${p.compounding.ingredients?.map(i => i.name).join(", ") || "-"}</span></div>
              ` : `
                <div><span class="font-sans font-bold text-slate-900">Sediaan:</span> <span class="text-slate-600 font-sans">${p.singleDose?.drugName || "-"}</span></div>
              `}
              ${p.singleDose?.withdrawalTime ? `<div class="text-[10px] text-rose-700 font-sans font-bold">${p.singleDose.withdrawalTime}</div>` : ""}
            </div>
          </div>

          <!-- Card Actions -->
          <div class="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
            <button 
              type="button" 
              data-tpl-id="${p.id}" 
              class="btn-use-tpl flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <i class="ph-bold ph-lightning text-amber-300"></i> Gunakan Template
            </button>
            <button 
              type="button" 
              data-tpl-id="${p.id}" 
              class="btn-edit-tpl p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition" 
              title="Edit Template"
            >
              <i class="ph-bold ph-pencil-simple text-base"></i>
            </button>
            <button 
              type="button" 
              data-tpl-id="${p.id}" 
              class="btn-delete-tpl p-2 rounded-xl border border-slate-300 hover:bg-rose-50 text-rose-600 hover:border-rose-300 transition" 
              title="Hapus Template"
            >
              <i class="ph-bold ph-trash text-base"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Wire Card Buttons
    container.querySelectorAll(".btn-use-tpl").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.tplId;
        this.applyClinicalPreset(id);
        if (this.switchCalculatorSubtab) {
          this.switchCalculatorSubtab("calculator");
        }
      });
    });

    container.querySelectorAll(".btn-edit-tpl").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.tplId;
        this.openTemplateEditor(id);
      });
    });

    container.querySelectorAll(".btn-delete-tpl").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.tplId;
        this.deleteTemplate(id);
      });
    });
  }

  openTemplateEditor(presetId = null) {
    const modal = document.getElementById("modal-template-editor");
    if (!modal) return;

    const heading = document.getElementById("tpl-modal-heading");
    const idInput = document.getElementById("tpl-input-id");
    const titleInput = document.getElementById("tpl-input-title");
    const subtitleInput = document.getElementById("tpl-input-subtitle");
    const descInput = document.getElementById("tpl-input-desc");
    const speciesInput = document.getElementById("tpl-input-species");
    const weightInput = document.getElementById("tpl-input-weight");
    const patNameInput = document.getElementById("tpl-input-patient-name");
    const patBreedInput = document.getElementById("tpl-input-patient-breed");
    const typeSelect = document.getElementById("tpl-input-type");
    const signaInput = document.getElementById("tpl-input-signa");
    const notesInput = document.getElementById("tpl-input-notes");

    // Compounding group
    const grpComp = document.getElementById("tpl-group-compounding");
    const compMethod = document.getElementById("tpl-comp-method");
    const compPkg = document.getElementById("tpl-comp-packaging");
    const compPacks = document.getElementById("tpl-comp-total-packs");
    const compIngText = document.getElementById("tpl-comp-ingredients-text");

    // Single dose group
    const grpSingle = document.getElementById("tpl-group-single");
    const singleDrug = document.getElementById("tpl-single-drug-name");
    const singleDose = document.getElementById("tpl-single-doserate");
    const singleFreq = document.getElementById("tpl-single-freq");
    const singleDur = document.getElementById("tpl-single-duration");
    const singleWdt = document.getElementById("tpl-single-wdt");

    const toggleTypeFields = () => {
      if (typeSelect.value === "compounding") {
        grpComp?.classList.remove("hidden");
        grpSingle?.classList.add("hidden");
      } else {
        grpComp?.classList.add("hidden");
        grpSingle?.classList.remove("hidden");
      }
    };
    typeSelect.onchange = toggleTypeFields;

    if (presetId) {
      const p = ClinicalPresetManager.getPresetById(presetId);
      if (!p) return;

      if (heading) heading.textContent = `Edit Template: ${p.title}`;
      if (idInput) idInput.value = p.id;
      if (titleInput) titleInput.value = p.title || "";
      if (subtitleInput) subtitleInput.value = p.subtitle || "";
      if (descInput) descInput.value = p.caseDescription || "";
      if (speciesInput) speciesInput.value = p.patient?.species || "feline";
      if (weightInput) weightInput.value = p.patient?.weight ?? 4;
      if (patNameInput) patNameInput.value = p.patient?.name || "";
      if (patBreedInput) patBreedInput.value = p.patient?.breed || "";
      if (signaInput) signaInput.value = p.compounding?.signa || p.singleDose?.signa || "";
      if (notesInput) notesInput.value = p.compounding?.notes || p.singleDose?.notes || "";

      if (p.compounding) {
        typeSelect.value = "compounding";
        if (compMethod) compMethod.value = p.compounding.hasDtd ? "dtd" : "nondtd";
        if (compPkg) compPkg.value = p.compounding.packaging || "da in caps";
        if (compPacks) compPacks.value = p.compounding.totalPacks || 14;
        if (compIngText) {
          compIngText.value = (p.compounding.ingredients || []).map(i => `${i.name} | ${i.dosePerPack || 0} | ${i.stockStrength || 100}`).join("\n");
        }
      } else {
        typeSelect.value = "single";
        if (singleDrug) singleDrug.value = p.singleDose?.drugName || "";
        if (singleDose) singleDose.value = p.singleDose?.doseRate || 20;
        if (singleFreq) singleFreq.value = p.singleDose?.frequencyCode || "s.2.dd";
        if (singleDur) singleDur.value = p.singleDose?.durationDays || 7;
        if (singleWdt) singleWdt.value = p.singleDose?.withdrawalTime || "";
      }
      toggleTypeFields();
    } else {
      if (heading) heading.textContent = "Tambah Template Obat Baru";
      if (idInput) idInput.value = "";
      document.getElementById("form-template-editor")?.reset();
      typeSelect.value = "compounding";
      toggleTypeFields();
    }

    modal.classList.remove("hidden");
  }

  deleteTemplate(presetId) {
    const p = ClinicalPresetManager.getPresetById(presetId);
    if (!p) return;
    if (confirm(`Yakin ingin menghapus template "${p.title}"?`)) {
      ClinicalPresetManager.deletePreset(presetId);
      this.renderTemplatesList();
      this.showToast(`Template "${p.title}" telah dihapus.`, "info");
    }
  }

  handleSaveTemplateForm() {
    const id = document.getElementById("tpl-input-id")?.value;
    const title = document.getElementById("tpl-input-title")?.value?.trim();
    const subtitle = document.getElementById("tpl-input-subtitle")?.value?.trim();
    const desc = document.getElementById("tpl-input-desc")?.value?.trim();
    const species = document.getElementById("tpl-input-species")?.value;
    const weight = parseFloat(document.getElementById("tpl-input-weight")?.value) || 0;
    const patName = document.getElementById("tpl-input-patient-name")?.value?.trim();
    const patBreed = document.getElementById("tpl-input-patient-breed")?.value?.trim();
    const type = document.getElementById("tpl-input-type")?.value;
    const signa = document.getElementById("tpl-input-signa")?.value?.trim();
    const notes = document.getElementById("tpl-input-notes")?.value?.trim();

    if (!title || !signa) {
      alert("Judul template dan Signa wajib diisi!");
      return;
    }

    const tplData = {
      title,
      subtitle,
      caseDescription: desc,
      patient: {
        name: patName || "Pasien",
        species,
        breed: patBreed || "-",
        age: "-",
        weight,
        ownerName: "Pemilik",
        ownerAddress: "-",
        diagnosis: desc || title
      }
    };

    if (type === "compounding") {
      const hasDtd = document.getElementById("tpl-comp-method")?.value === "dtd";
      const packaging = document.getElementById("tpl-comp-packaging")?.value || "da in caps";
      const totalPacks = parseInt(document.getElementById("tpl-comp-total-packs")?.value) || 10;
      const ingLines = (document.getElementById("tpl-comp-ingredients-text")?.value || "").split("\n").filter(l => l.trim().length > 0);

      const ingredients = ingLines.map(line => {
        const parts = line.split("|").map(s => s.trim());
        return {
          name: parts[0] || "Obat",
          dosePerPack: parseFloat(parts[1]) || 10,
          unit: "mg",
          stockStrength: parseFloat(parts[2]) || 100,
          strengthUnit: "mg"
        };
      });

      tplData.compounding = {
        hasDtd,
        command: "mfla pulv.",
        packaging,
        totalPacks,
        signa,
        notes,
        ingredients: ingredients.length > 0 ? ingredients : [
          { name: "Zat Aktif Racikan", dosePerPack: 10, unit: "mg", stockStrength: 50, strengthUnit: "mg" }
        ]
      };
    } else {
      const drugName = document.getElementById("tpl-single-drug-name")?.value?.trim() || "Amoksisilin";
      const doseRate = parseFloat(document.getElementById("tpl-single-doserate")?.value) || 20;
      const freq = document.getElementById("tpl-single-freq")?.value || "s.2.dd";
      const dur = parseInt(document.getElementById("tpl-single-duration")?.value) || 7;
      const wdt = document.getElementById("tpl-single-wdt")?.value?.trim() || "";

      tplData.singleDose = {
        drugId: "amoxicillin",
        drugName,
        doseRate,
        frequencyCode: freq,
        durationDays: dur,
        signa,
        withdrawalTime: wdt,
        notes
      };
    }

    try {
      if (id) {
        ClinicalPresetManager.updatePreset(id, tplData);
        this.showToast(`Template "${title}" berhasil diperbarui!`, "success");
      } else {
        ClinicalPresetManager.addPreset(tplData);
        this.showToast(`Template "${title}" berhasil ditambahkan!`, "success");
      }
      document.getElementById("modal-template-editor")?.classList.add("hidden");
      this.renderTemplatesList();
    } catch (err) {
      alert(err.message);
    }
  }

  applyClinicalPreset(presetId) {
    const preset = ClinicalPresetManager.getPresetById(presetId) || VET_CLINICAL_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    // 1. Sync Patient info to Rx Tab
    const patName = document.getElementById("rx-patient-name");
    const patBreed = document.getElementById("rx-patient-species");
    const patWeight = document.getElementById("rx-patient-weight");
    const ownerName = document.getElementById("rx-owner-name");

    if (preset.patient) {
      if (patName) patName.value = preset.patient.name;
      if (patBreed) patBreed.value = `${preset.patient.species.toUpperCase()} / ${preset.patient.breed} (${preset.patient.diagnosis || ""})`;
      if (patWeight) patWeight.value = preset.patient.weight || 10;
      if (ownerName) ownerName.value = `${preset.patient.ownerName} (${preset.patient.ownerAddress || ""})`;

      // Also sync to calculator state
      if (preset.patient.weight > 0) {
        this.calcState.weight = preset.patient.weight;
        const weightInput = document.getElementById("calc-weight");
        if (weightInput) weightInput.value = preset.patient.weight;
      }

      // Activate species button in calculator
      const specBtns = document.querySelectorAll(".calc-spec-btn");
      specBtns.forEach(b => {
        const isMatch = b.dataset.species === preset.patient.species;
        if (isMatch) {
          b.classList.add("border-2", "border-teal-600", "bg-teal-50", "text-teal-900");
          b.classList.remove("border", "border-slate-200", "bg-white", "text-slate-700");
        } else {
          b.classList.remove("border-2", "border-teal-600", "bg-teal-50", "text-teal-900");
          b.classList.add("border", "border-slate-200", "bg-white", "text-slate-700");
        }
      });
      if (preset.patient.species !== "clinic") {
        this.calcState.species = preset.patient.species;
      }
    }

    // 2. Compounding Preset Case
    if (preset.compounding) {
      this.compoundingState.hasDtd = preset.compounding.hasDtd;
      this.compoundingState.command = preset.compounding.command;
      this.compoundingState.packaging = preset.compounding.packaging;
      this.compoundingState.totalPacks = preset.compounding.totalPacks;
      this.compoundingState.signa = preset.compounding.signa;
      this.compoundingState.ingredients = JSON.parse(JSON.stringify(preset.compounding.ingredients));

      // Sync Compounding Desk DOM
      const cmdSelect = document.getElementById("comp-command");
      if (cmdSelect) cmdSelect.value = preset.compounding.command;
      const packSelect = document.getElementById("comp-packaging");
      if (packSelect) packSelect.value = preset.compounding.packaging;
      const totalInput = document.getElementById("comp-total-packs");
      if (totalInput) totalInput.value = preset.compounding.totalPacks;
      const signaInput = document.getElementById("comp-signa");
      if (signaInput) signaInput.value = preset.compounding.signa;

      this.setCompoundingDtdMode(preset.compounding.hasDtd);
      this.renderCompoundingCalculator();

      if (this.switchCalculatorSubtab) {
        this.switchCalculatorSubtab("calculator");
      }

      const desk = document.getElementById("container-compound-calc");
      desk?.scrollIntoView({ behavior: "smooth", block: "start" });
      this.showToast(`Template racikan "${preset.title}" berhasil dimuat!`, "success");
      return;
    }

    // 3. Single Dose Preset Case
    if (preset.singleDose) {
      if (preset.singleDose.drugId) {
        this.selectDrugInCalculator(preset.singleDose.drugId);
      }
      if (preset.singleDose.doseRate) {
        this.calcState.doseRate = preset.singleDose.doseRate;
        const doseInput = document.getElementById("calc-dose-rate");
        if (doseInput) doseInput.value = preset.singleDose.doseRate;
      }
      if (preset.singleDose.frequencyCode) {
        this.calcState.frequencyCode = preset.singleDose.frequencyCode;
        const freqSelect = document.getElementById("calc-frequency-select");
        if (freqSelect) freqSelect.value = preset.singleDose.frequencyCode;
      }
      if (preset.singleDose.durationDays) {
        this.calcState.durationDays = preset.singleDose.durationDays;
        const durInput = document.getElementById("calc-duration");
        if (durInput) durInput.value = preset.singleDose.durationDays;
      }

      this.runCalculation();
      this.updateSpeciesSafetyAlerts();

      if (this.switchCalculatorSubtab) {
        this.switchCalculatorSubtab("calculator");
      }

      const form = document.getElementById("dosage-calc-form");
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
      this.showToast(`Template dosis "${preset.title}" berhasil dimuat!`, "success");
    }
  }

  renderPrescriptionAlgorithmCard() {
    setTimeout(() => this.renderAntimicrobialFullGuide(), 0);
    const card = document.getElementById("prescription-algorithm-card");
    if (!card) return;

    card.innerHTML = `
      <div class="border-b border-slate-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Standar Praktik Dokter Hewan (drh.)
            </span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 mt-1">5 Tahap Algoritma Peresepan & Stewardship Antimikroba</h3>
          <p class="text-xs text-slate-500 mt-0.5">Panduan klinis resmi dokter hewan (drh.) ber-SIP dalam evaluasi klinis, perhitungan dosis, pemilihan BSO, penulisan resep resmi, dan stewardship resistensi antimikroba (AMR).</p>
        </div>
        <button type="button" id="btn-close-algorithm-guide" class="text-xs px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition flex items-center gap-1.5 shadow-sm">
          <i class="ph-bold ph-arrow-left"></i> Kembali ke Kalkulator
        </button>
      </div>

      <!-- 5 Stages Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        ${VET_PRESCRIPTION_ALGORITHM.stages.map(st => `
          <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3.5 hover:shadow-sm transition">
            <div class="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">${st.number.replace("Tahap ", "")}</span>
                <h4 class="font-bold text-slate-900 text-sm">${st.title}</h4>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100/70 text-teal-900 border border-teal-200">${st.badge}</span>
            </div>

            <p class="text-slate-600 leading-relaxed">${st.summary}</p>

            ${st.keyQuestions ? `
              <div class="space-y-1.5 pt-1">
                <span class="font-bold text-teal-900 block flex items-center gap-1"><i class="ph-bold ph-question"></i> 7 Pertanyaan Kunci Pra-Resep:</span>
                <ul class="space-y-1 pl-4 list-disc text-slate-600 leading-relaxed text-[11px]">
                  ${st.keyQuestions.slice(0, 5).map(q => `<li>${q}</li>`).join("")}
                  <li class="italic text-slate-500">+ Pertimbangan waktu henti obat ternak & kepatuhan pemilik</li>
                </ul>
              </div>
            ` : ""}

            ${st.formulas ? `
              <div class="space-y-2 pt-1">
                <span class="font-bold text-teal-900 block flex items-center gap-1"><i class="ph-bold ph-function"></i> Rumus Perhitungan Klinis Akurat:</span>
                <div class="space-y-1.5">
                  ${st.formulas.map(f => `
                    <div class="p-2 rounded-lg bg-white border border-slate-200">
                      <div class="font-bold text-slate-800 text-[11px]">${f.name}:</div>
                      <div class="font-mono text-teal-700 font-semibold text-[11px] mt-0.5">${f.formula}</div>
                    </div>
                  `).join("")}
                </div>
              </div>
            ` : ""}

            ${st.speciesPrecautions ? `
              <div class="space-y-1.5 pt-1">
                <span class="font-bold text-rose-900 block flex items-center gap-1"><i class="ph-bold ph-warning-octagon"></i> Peringatan Toksisitas Kritis Spesies:</span>
                <div class="space-y-1 text-[11px]">
                  ${st.speciesPrecautions.slice(0, 4).map(sp => `
                    <div class="p-1.5 rounded-lg ${sp.severity === 'danger' ? 'bg-rose-50 text-rose-900 border border-rose-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}">
                      <span class="font-bold">${sp.species}:</span> ${sp.warning}
                    </div>
                  `).join("")}
                </div>
              </div>
            ` : ""}

            ${st.routes ? `
              <div class="space-y-1.5 pt-1">
                <span class="font-bold text-teal-900 block flex items-center gap-1"><i class="ph-bold ph-path"></i> Panduan Pemilihan Rute & BSO:</span>
                <ul class="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
                  <li><b>Oral:</b> Tablet kunyah (anjing), Kapsul da in caps (kucing agar tidak pahit), Sirup bebas Xylitol via spuit.</li>
                  <li><b>Topikal:</b> Spot-on tengkuk, Pour-on ternak, Infus Intramammary mastitis sapi perah.</li>
                  <li><b>Parenteral:</b> Injeksi SC tengkuk (aman), IM paha belakang/epaksial, IV vascular catheter.</li>
                </ul>
              </div>
            ` : ""}

            ${st.elements ? `
              <div class="space-y-1.5 pt-1">
                <span class="font-bold text-teal-900 block flex items-center gap-1"><i class="ph-bold ph-certificate"></i> 7 Kelengkapan Unsur Resep Resmi drh:</span>
                <div class="grid grid-cols-2 gap-1 text-[11px]">
                  ${st.elements.map(el => `
                    <div class="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      <span class="font-bold text-teal-800">${el.no}.</span> ${el.name}
                    </div>
                  `).join("")}
                </div>
                <div class="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-[11px] mt-2">
                  <b>Kaidah Khusus:</b> Tanda seru (!) untuk dosis hewan besar yang melebihi dosis manusia; Signa <code>S u.p.</code> / <code>S i.m.m.</code> untuk stok klinik dokter hewan.
                </div>
              </div>
            ` : ""}

            ${st.principles ? `
              <div class="space-y-2 pt-1">
                ${st.principles.map(p => `
                  <div class="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span class="font-bold text-teal-900 block text-[11px] flex items-center gap-1">
                      <i class="ph-bold ph-shield-check text-teal-600"></i> ${p.label}:
                    </span>
                    <ul class="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
                      ${p.items.map(it => `<li>${it}</li>`).join("")}
                    </ul>
                  </div>
                `).join("")}
              </div>
            ` : ""}

            ${st.irrationalRisks ? `
              <div class="space-y-1 pt-1 p-2 rounded-xl bg-rose-50/70 border border-rose-200">
                <span class="font-bold text-rose-900 block text-[11px] flex items-center gap-1">
                  <i class="ph-bold ph-x-circle text-rose-600"></i> Pantangan Praktik Peresepan:
                </span>
                <ul class="space-y-0.5 pl-4 list-disc text-rose-950 text-[11px]">
                  ${st.irrationalRisks.map(r => `<li>${r}</li>`).join("")}
                </ul>
              </div>
            ` : ""}
          </div>
        `).join("")}
      </div>
    `;

    document.getElementById("btn-close-algorithm-guide")?.addEventListener("click", () => {
      if (this.switchCalculatorSubtab) {
        this.switchCalculatorSubtab("calculator");
      }
    });
  }

  updateSpeciesSafetyAlerts() {
    const container = document.getElementById("calc-safety-alert-container");
    if (!container) return;

    const drug = this.drugs.find(d => d.id === this.calcState.drugId);
    const formulation = drug?.formulations?.find(f => f.id === this.calcState.formulationId) || drug?.formulations?.[0];

    const alerts = checkSpeciesSafety(
      this.calcState.species,
      (drug?.id || '') + ' ' + (drug?.activeIngredient || ''),
      formulation?.name || formulation?.type || ''
    );
    this.updateAntimicrobialCalculatorBox(drug, formulation);

    if (alerts.length === 0) {
      container.innerHTML = "";
      container.classList.add("hidden");
      return;
    }

    container.classList.remove("hidden");
    container.innerHTML = alerts.map(a => {
      const isFatal = a.level === "fatal";
      const bg = isFatal ? "bg-rose-50 border-rose-300 text-rose-950" : "bg-amber-50 border-amber-300 text-amber-950";
      const icon = isFatal ? "ph-warning-octagon text-rose-600" : "ph-warning text-amber-600";

      return `
        <div class="p-3 rounded-xl border flex items-start gap-2.5 text-xs shadow-sm ${bg}">
          <i class="ph-bold ${icon} text-lg shrink-0 mt-0.5"></i>
          <div>
            <div class="font-bold text-xs uppercase tracking-wider">${a.title}</div>
            <p class="mt-0.5 leading-relaxed text-[11px]">${a.message}</p>
          </div>
        </div>
      `;
    }).join("");
  }

  handleAddCurrentCalcToCart() {
    if (!this.currentCalcResult) {
      alert("Silakan lengkapi perhitungan dosis terlebih dahulu.");
      return;
    }

    this.rxManager.addToCart(this.currentCalcResult);
    this.updateCartBadge();
    
    // Switch to Prescription tab
    document.getElementById("nav-rx")?.click();
  }

  updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    const count = this.rxManager.getCartItems().length;
    if (badge) {
      if (count > 0) {
        badge.classList.remove("hidden");
        badge.textContent = count;
      } else {
        badge.classList.add("hidden");
      }
    }
  }

  handleAddCalculatedToCompounding() {
    if (!this.currentCalcResult) {
      this.runCalculation();
    }

    if (!this.currentCalcResult) {
      this.showToast("Silakan periksa input kalkulator dosis terlebih dahulu.", "error");
      return;
    }

    const res = this.currentCalcResult;
    const totalPacks = this.compoundingState.totalPacks || 10;
    const stockStrength = (res.formulation && res.formulation.strength) ? res.formulation.strength : 100;
    const strengthUnit = (res.formulation && res.formulation.unit) ? res.formulation.unit : "mg";
    const formulationCode = (res.formulation && res.formulation.code) ? res.formulation.code : "tab";

    let newIng;
    if (this.compoundingState.hasDtd) {
      const dosePerPack = parseFloat(res.doseMgPerAdmin.toFixed(2));
      const totalMg = dosePerPack * totalPacks;
      const totalStockUnits = parseFloat((totalMg / stockStrength).toFixed(2));
      newIng = {
        name: res.drugName,
        dosePerPack,
        unit: "mg",
        stockStrength,
        strengthUnit,
        formulationCode,
        totalStockUnits
      };
    } else {
      const totalMg = res.doseMgPerAdmin * totalPacks;
      const totalStockUnits = Math.max(0.5, parseFloat((totalMg / stockStrength).toFixed(2)));
      const dosePerPack = parseFloat(((totalStockUnits * stockStrength) / totalPacks).toFixed(3));
      newIng = {
        name: res.drugName,
        dosePerPack,
        unit: "mg",
        stockStrength,
        strengthUnit,
        formulationCode,
        totalStockUnits
      };
    }

    this.compoundingState.ingredients.push(newIng);
    this.renderCompoundingCalculator();

    this.showToast(`Berhasil menambahkan ${newIng.name} ke formula racikan!`, "success");

    // Visual feedback & scroll to compounding desk
    const desk = document.getElementById("container-compound-calc");
    if (desk) {
      desk.scrollIntoView({ behavior: "smooth", block: "start" });
      desk.classList.add("ring-2", "ring-purple-500", "transition-all");
      setTimeout(() => {
        desk.classList.remove("ring-2", "ring-purple-500");
      }, 1500);
    }
  }

  /* ------------------------------------------------------------- */
  /* 2B. COMPOUNDING / MEJA PERACIKAN OBAT (INTEGRATED)            */
  /* ------------------------------------------------------------- */
  setupCompoundingEvents() {
    // Segmented DTD button clicks
    document.getElementById("btn-mode-dtd")?.addEventListener("click", () => {
      this.setCompoundingDtdMode(true);
    });

    document.getElementById("btn-mode-nondtd")?.addEventListener("click", () => {
      this.setCompoundingDtdMode(false);
    });

    // Hidden radio change events
    const dtdRadios = document.querySelectorAll("input[name='comp-dtd-mode']");
    dtdRadios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.setCompoundingDtdMode(e.target.value === "dtd");
      });
    });

    // Compounding configuration changes
    document.getElementById("comp-command")?.addEventListener("change", (e) => {
      this.compoundingState.command = e.target.value;
      this.renderCompoundingCalculator();
    });

    document.getElementById("comp-packaging")?.addEventListener("change", (e) => {
      this.compoundingState.packaging = e.target.value;
      this.renderCompoundingCalculator();
    });

    document.getElementById("comp-total-packs")?.addEventListener("input", (e) => {
      this.compoundingState.totalPacks = Math.max(1, parseInt(e.target.value) || 1);
      this.renderCompoundingCalculator();
    });

    document.getElementById("comp-signa")?.addEventListener("input", (e) => {
      this.compoundingState.signa = e.target.value.trim() || "s.2.dd No I";
      this.renderCompoundingCalculator();
    });

    // Drug Selection in Compounding Desk
    document.getElementById("comp-select-drug")?.addEventListener("change", () => {
      this.updateCompoundingDrugSelection(true);
    });

    // Stock selection change
    document.getElementById("comp-select-stock")?.addEventListener("change", () => {
      if (!this.compoundingState.hasDtd) {
        this.updateCompoundingDrugSelection(false);
      }
    });

    // Add ingredient button
    document.getElementById("btn-add-comp-ingredient")?.addEventListener("click", () => {
      this.handleAddCompIngredient();
    });

    // Sample formula button
    document.getElementById("btn-sample-dtd")?.addEventListener("click", () => {
      this.loadSampleFormula();
      this.showToast("Contoh formula racikan (Amox + Dexa + CTM) dimuat!", "success");
    });

    // Clear ingredients
    document.getElementById("btn-clear-comp-ingredients")?.addEventListener("click", () => {
      if (this.compoundingState.ingredients.length === 0) return;
      if (confirm("Kosongkan semua bahan dari formula racikan?")) {
        this.compoundingState.ingredients = [];
        try {
          localStorage.setItem("vet_compounding_state", JSON.stringify(this.compoundingState));
        } catch (e) {}
        this.renderCompoundingCalculator();
        this.showToast("Bahan racikan telah dikosongkan.", "info");
      }
    });

    // Add to cart
    document.getElementById("btn-add-compound-cart")?.addEventListener("click", () => {
      this.handleAddCompoundToCart();
    });
  }

  setCompoundingDtdMode(isDtd) {
    this.compoundingState.hasDtd = isDtd;

    const btnDtd = document.getElementById("btn-mode-dtd");
    const btnNonDtd = document.getElementById("btn-mode-nondtd");
    const iconDtd = document.getElementById("icon-mode-dtd");
    const iconNonDtd = document.getElementById("icon-mode-nondtd");
    const radioDtd = document.getElementById("radio-mode-dtd");
    const radioNonDtd = document.getElementById("radio-mode-nondtd");

    if (isDtd) {
      if (radioDtd) radioDtd.checked = true;
      if (btnDtd) {
        btnDtd.className = "py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-teal-600 text-white shadow-sm";
      }
      if (iconDtd) iconDtd.className = "ph-bold ph-check-circle text-sm";
      if (btnNonDtd) {
        btnNonDtd.className = "py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900";
      }
      if (iconNonDtd) iconNonDtd.className = "ph ph-circle text-sm";
    } else {
      if (radioNonDtd) radioNonDtd.checked = true;
      if (btnNonDtd) {
        btnNonDtd.className = "py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-amber-600 text-white shadow-sm";
      }
      if (iconNonDtd) iconNonDtd.className = "ph-bold ph-check-circle text-sm";
      if (btnDtd) {
        btnDtd.className = "py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900";
      }
      if (iconDtd) iconDtd.className = "ph ph-circle text-sm";
    }

    // Convert dosages of existing ingredients
    const totalPacks = this.compoundingState.totalPacks || 10;
    this.compoundingState.ingredients.forEach(ing => {
      if (isDtd) {
        ing.dosePerPack = parseFloat(((ing.totalStockUnits * ing.stockStrength) / totalPacks).toFixed(2));
      } else {
        ing.totalStockUnits = Math.max(0.25, parseFloat(((ing.dosePerPack * totalPacks) / ing.stockStrength).toFixed(2)));
      }
    });

    this.updateCompoundingModeLabels();
    this.updateCompoundingDrugSelection(true);
    this.renderCompoundingCalculator();
    this.showToast(isDtd ? "Metode diubah ke: Dengan d.t.d. (Dosis per kapsul)" : "Metode diubah ke: Tanpa d.t.d. (Dosis adalah total tablet)", "info");
  }

  initCompoundingForm() {
    const compDrugSelect = document.getElementById("comp-select-drug");
    if (!compDrugSelect) return;

    const sortedDrugs = [...this.drugs].sort((a, b) => 
      (a.activeIngredient || "").localeCompare(b.activeIngredient || "", undefined, { sensitivity: "base" })
    );

    compDrugSelect.innerHTML = `
      <optgroup label="Database Obat Veteriner (${this.drugs.length} Monograf A-Z)">
        ${sortedDrugs.map(d => `<option value="${d.id}">${d.activeIngredient} (${d.brandNames[0] || d.drugClass})</option>`).join("")}
      </optgroup>
      <optgroup label="Zat Tambahan / Kustom">
        <option value="custom">+ Obat / Zat Aditif Manual...</option>
      </optgroup>
    `;

    this.updateCompoundingDrugSelection(true);
  }

  updateCompoundingDrugSelection(resetDose = true) {
    const compDrugSelect = document.getElementById("comp-select-drug");
    const stockSelect = document.getElementById("comp-select-stock");
    const doseInput = document.getElementById("comp-input-dose");
    const customNameInput = document.getElementById("comp-input-custom-name");
    if (!compDrugSelect || !stockSelect) return;

    const drugId = compDrugSelect.value;
    if (drugId === "custom") {
      customNameInput?.classList.remove("hidden");
      stockSelect.innerHTML = `
        <option value="500" data-unit="mg" data-code="tab">Tablet 500 mg</option>
        <option value="250" data-unit="mg" data-code="tab">Tablet 250 mg</option>
        <option value="100" data-unit="mg" data-code="tab">Tablet 100 mg</option>
        <option value="50" data-unit="mg" data-code="tab">Tablet 50 mg</option>
        <option value="25" data-unit="mg" data-code="tab">Tablet 25 mg</option>
        <option value="10" data-unit="mg" data-code="tab">Tablet 10 mg</option>
        <option value="4" data-unit="mg" data-code="tab">Tablet 4 mg (CTM/Medrol)</option>
        <option value="2.5" data-unit="mg" data-code="tab">Tablet 2.5 mg</option>
        <option value="2" data-unit="mg" data-code="tab">Tablet 2 mg</option>
        <option value="1" data-unit="mg" data-code="tab">Tablet 1 mg</option>
        <option value="0.5" data-unit="mg" data-code="tab">Tablet 0.5 mg</option>
      `;
      if (resetDose && doseInput) doseInput.value = 50;
      return;
    }

    customNameInput?.classList.add("hidden");
    const drug = this.drugs.find(d => d.id === drugId);
    if (!drug) return;

    // Filter to solid/tablet formulations or all formulations
    const tabletOrCapForms = drug.formulations.filter(f => f.type === "tablet" || f.type === "capsule" || f.type === "oral");
    const formsToDisplay = tabletOrCapForms.length > 0 ? tabletOrCapForms : drug.formulations;

    stockSelect.innerHTML = formsToDisplay.map(f => `
      <option value="${f.strength}" data-unit="${f.unit}" data-code="${f.code || 'tab'}">
        ${f.label} (${f.strength}${f.unit})
      </option>
    `).join("");

    // Calculate default dose based on patient species & weight
    const speciesDose = drug.dosages[this.calcState.species] || drug.dosages["canine"] || Object.values(drug.dosages)[0];
    if (speciesDose && doseInput && resetDose) {
      const patientWeight = this.calcState.weight || 10;
      const recDoseMg = parseFloat(((speciesDose.defaultDose || 10) * patientWeight).toFixed(2));
      if (this.compoundingState.hasDtd) {
        doseInput.value = recDoseMg;
      } else {
        const firstForm = formsToDisplay[0];
        const strength = firstForm?.strength || 100;
        const totalPacks = this.compoundingState.totalPacks || 10;
        const totalMg = recDoseMg * totalPacks;
        const totalTabs = Math.max(0.5, parseFloat((totalMg / strength).toFixed(2)));
        doseInput.value = totalTabs;
      }
    }
  }

  updateCompoundingModeLabels() {
    const hint = document.getElementById("comp-dtd-hint");
    const label = document.getElementById("comp-dose-input-label");
    const badge = document.getElementById("comp-mode-badge");
    const thDose = document.getElementById("th-comp-dose");
    const thTaken = document.getElementById("th-comp-taken");

    if (this.compoundingState.hasDtd) {
      if (hint) hint.textContent = "Dosis per kapsul / puyer; total bahan baku = dosis × jumlah racikan.";
      if (label) label.textContent = "Dosis per Kapsul (mg)";
      if (thDose) thDose.textContent = "Dosis per Kapsul (mg)";
      if (thTaken) thTaken.textContent = "Bahan Baku Total Diambil (tab)";
      if (badge) {
        badge.textContent = "DENGAN D.T.D.";
        badge.className = "text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-teal-900 text-teal-200 border border-teal-700";
      }
    } else {
      if (hint) hint.textContent = "Jumlah total tablet bahan baku untuk seluruh racikan; apotek akan menggerus dan membagi rata No. X.";
      if (label) label.textContent = "Jumlah Tablet Total Diambil (tab)";
      if (thDose) thDose.textContent = "Jumlah Tablet Total Diambil (tab)";
      if (thTaken) thTaken.textContent = "Dosis per Kapsul Hasil Bagi (mg)";
      if (badge) {
        badge.textContent = "TANPA D.T.D.";
        badge.className = "text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-900 text-amber-200 border border-amber-700";
      }
    }
  }

  loadSampleFormula() {
    if (this.compoundingState.hasDtd) {
      this.compoundingState.ingredients = [
        { name: "Amoxicillin", dosePerPack: 50, unit: "mg", stockStrength: 500, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 1 },
        { name: "Dexamethasone", dosePerPack: 2.5, unit: "mg", stockStrength: 2.5, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 10 },
        { name: "CTM", dosePerPack: 0.5, unit: "mg", stockStrength: 4, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 1.25 }
      ];
    } else {
      this.compoundingState.ingredients = [
        { name: "Amoxicillin", dosePerPack: 50, unit: "mg", stockStrength: 500, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 1 },
        { name: "Dexamethasone", dosePerPack: 0.625, unit: "mg", stockStrength: 2.5, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 2.5 },
        { name: "CTM", dosePerPack: 0.1, unit: "mg", stockStrength: 0.5, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 2 }
      ];
    }
    this.compoundingState.totalPacks = 10;
    this.compoundingState.command = "mfla pulv.";
    this.compoundingState.packaging = "da in caps";
    this.compoundingState.signa = "s.2.dd No I";

    const inputPacks = document.getElementById("comp-total-packs");
    if (inputPacks) inputPacks.value = 10;
    const inputSigna = document.getElementById("comp-signa");
    if (inputSigna) inputSigna.value = "s.2.dd No I";

    this.renderCompoundingCalculator();
  }

  handleAddCompIngredient() {
    const compDrugSelect = document.getElementById("comp-select-drug");
    const customNameInput = document.getElementById("comp-input-custom-name");
    const doseInput = document.getElementById("comp-input-dose");
    const stockSelect = document.getElementById("comp-select-stock");

    let name = "";
    if (compDrugSelect?.value === "custom") {
      name = customNameInput?.value.trim() || "Zat Tambahan";
    } else {
      const drug = this.drugs.find(d => d.id === compDrugSelect?.value);
      name = drug?.activeIngredient || "Obat";
    }

    const val = parseFloat(doseInput?.value);
    const selectedOption = stockSelect?.options[stockSelect.selectedIndex];
    const stock = parseFloat(stockSelect?.value) || 500;
    const strengthUnit = selectedOption?.dataset?.unit || "mg";
    const formulationCode = selectedOption?.dataset?.code || "tab";

    if (!name) {
      alert("Silakan pilih atau masukkan nama bahan obat.");
      return;
    }
    if (isNaN(val) || val <= 0) {
      alert("Silakan masukkan dosis/jumlah tablet yang valid.");
      return;
    }

    const totalPacks = this.compoundingState.totalPacks;
    let newIng;

    if (this.compoundingState.hasDtd) {
      const dosePerPack = val;
      const totalMg = dosePerPack * totalPacks;
      const totalStockUnits = parseFloat((totalMg / stock).toFixed(2));
      newIng = {
        name,
        dosePerPack,
        unit: "mg",
        stockStrength: stock,
        strengthUnit,
        formulationCode,
        totalStockUnits
      };
    } else {
      const totalStockUnits = val;
      const totalMg = stock * totalStockUnits;
      const dosePerPack = parseFloat((totalMg / totalPacks).toFixed(3));
      newIng = {
        name,
        dosePerPack,
        unit: "mg",
        stockStrength: stock,
        strengthUnit,
        formulationCode,
        totalStockUnits
      };
    }

    this.compoundingState.ingredients.push(newIng);
    if (customNameInput) customNameInput.value = "";
    this.renderCompoundingCalculator();
  }

  renderCompoundingCalculator() {
    try {
      localStorage.setItem("vet_compounding_state", JSON.stringify(this.compoundingState));
    } catch (e) {}

    this.updateCompoundingModeLabels();
    const tbody = document.getElementById("comp-ingredients-tbody");
    const totalPacks = this.compoundingState.totalPacks;

    // Recalculate dynamic values based on current totalPacks and mode
    this.compoundingState.ingredients.forEach(ing => {
      if (this.compoundingState.hasDtd) {
        const totalMg = ing.dosePerPack * totalPacks;
        ing.totalStockUnits = parseFloat((totalMg / ing.stockStrength).toFixed(2));
      } else {
        const totalMg = ing.stockStrength * ing.totalStockUnits;
        ing.dosePerPack = parseFloat((totalMg / totalPacks).toFixed(3));
      }
    });

    if (tbody) {
      if (this.compoundingState.ingredients.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="py-6 text-center text-slate-400 italic font-sans text-xs">
              Belum ada bahan obat yang ditambahkan. Pilih obat dari database monograf di atas untuk menambahkan bahan racikan.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = this.compoundingState.ingredients.map((ing, idx) => {
          if (this.compoundingState.hasDtd) {
            const totalMg = ing.dosePerPack * totalPacks;
            const tabsNeeded = (totalMg / ing.stockStrength).toFixed(2).replace(/\.00$/, "");
            return `
              <tr class="hover:bg-slate-50 transition">
                <td class="py-2.5 px-3 font-sans font-bold text-slate-900">${ing.name}</td>
                <td class="py-2.5 px-3 font-semibold text-teal-800">${ing.dosePerPack} ${ing.unit || "mg"} / caps</td>
                <td class="py-2.5 px-3 text-slate-600 font-sans">Tablet ${ing.stockStrength} ${ing.strengthUnit || "mg"}</td>
                <td class="py-2.5 px-3 font-bold text-amber-700">${tabsNeeded} tab (${totalMg} mg)</td>
                <td class="py-2.5 px-3 text-right">
                  <button data-idx="${idx}" class="btn-del-comp-ing text-slate-400 hover:text-rose-600 transition">
                    <i class="ph ph-trash text-base"></i>
                  </button>
                </td>
              </tr>
            `;
          } else {
            const totalMg = (ing.stockStrength * ing.totalStockUnits).toFixed(2).replace(/\.00$/, "");
            const romanQty = toRomanNumeral(ing.totalStockUnits);
            return `
              <tr class="hover:bg-slate-50 transition">
                <td class="py-2.5 px-3 font-sans font-bold text-slate-900">${ing.name}</td>
                <td class="py-2.5 px-3 font-semibold text-teal-800">${ing.totalStockUnits} tab (${romanQty})</td>
                <td class="py-2.5 px-3 text-slate-600 font-sans">Tablet ${ing.stockStrength} ${ing.strengthUnit || "mg"}</td>
                <td class="py-2.5 px-3 font-bold text-emerald-700">${ing.dosePerPack} mg / caps</td>
                <td class="py-2.5 px-3 text-right">
                  <button data-idx="${idx}" class="btn-del-comp-ing text-slate-400 hover:text-rose-600 transition">
                    <i class="ph ph-trash text-base"></i>
                  </button>
                </td>
              </tr>
            `;
          }
        }).join("");

        tbody.querySelectorAll(".btn-del-comp-ing").forEach(btn => {
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.idx);
            this.compoundingState.ingredients.splice(idx, 1);
            this.renderCompoundingCalculator();
          });
        });
      }
    }

    // Prescription Preview
    const previewEl = document.getElementById("comp-rx-preview-text");
    if (previewEl) {
      if (this.compoundingState.ingredients.length === 0) {
        previewEl.textContent = "// Tambahkan bahan obat untuk melihat format resep";
      } else {
        const tempCompItem = {
          isCompounded: true,
          hasDtd: this.compoundingState.hasDtd,
          compoundingInstruction: this.compoundingState.command,
          packaging: this.compoundingState.packaging,
          totalPacks: this.compoundingState.totalPacks,
          signa: this.compoundingState.signa,
          ingredients: this.compoundingState.ingredients
        };
        const generated = this.rxManager.generatePrescriptionLine(tempCompItem);
        previewEl.textContent = generated.raw;
      }
    }

    // Work Order Breakdown
    const workOrderEl = document.getElementById("comp-work-order-list");
    if (workOrderEl) {
      if (this.compoundingState.ingredients.length === 0) {
        workOrderEl.innerHTML = `<p class="italic text-slate-400">Belum ada bahan racikan yang dimasukkan.</p>`;
      } else {
        const romanPacks = toRomanNumeral(totalPacks);
        const steps = this.compoundingState.ingredients.map((ing, i) => {
          if (this.compoundingState.hasDtd) {
            const totalMg = ing.dosePerPack * totalPacks;
            const tabs = (totalMg / ing.stockStrength).toFixed(2).replace(/\.00$/, "");
            return `<div class="flex items-start gap-1.5"><span class="text-teal-400 font-bold">${i+1}.</span> <span>Ambil <b>${tabs} tablet</b> ${ing.name} ${ing.stockStrength}mg <span class="text-slate-400">(= ${totalMg} mg)</span></span></div>`;
          } else {
            const totalMg = (ing.stockStrength * ing.totalStockUnits).toFixed(2).replace(/\.00$/, "");
            const romanQty = toRomanNumeral(ing.totalStockUnits);
            return `<div class="flex items-start gap-1.5"><span class="text-teal-400 font-bold">${i+1}.</span> <span>Ambil <b>${ing.totalStockUnits} tablet (${romanQty})</b> ${ing.name} ${ing.stockStrength}mg <span class="text-slate-400">(= ${totalMg} mg)</span></span></div>`;
          }
        }).join("");

        const compoundingSummary = this.compoundingState.hasDtd
          ? `➔ Gerus halus seluruh tablet di atas sampai homogen, bagi rata menjadi <b>${totalPacks} bagian</b> (${this.compoundingState.packaging} No. ${romanPacks}). Tiap kapsul berisi: ${this.compoundingState.ingredients.map(i => `${i.name} ${i.dosePerPack}mg`).join(", ")}.`
          : `➔ Gerus seluruh tablet di atas, campur hingga homogen, bagi rata menjadi <b>${totalPacks} bagian</b> (${this.compoundingState.packaging} No. ${romanPacks}). Tiap kapsul berisi: ${this.compoundingState.ingredients.map(i => `${i.name} ${i.dosePerPack}mg`).join(", ")}.`;

        workOrderEl.innerHTML = `
          ${steps}
          <div class="mt-2 pt-2 border-t border-slate-700/60 text-teal-300 font-sans text-xs">
            ${compoundingSummary}
          </div>
          <div class="text-amber-300 font-mono text-xs pt-1">
            Signa: <b>${this.compoundingState.signa}</b>
          </div>
        `;
      }
    }
  }

  handleAddCompoundToCart() {
    if (this.compoundingState.ingredients.length === 0) {
      alert("Silakan tambahkan minimal satu bahan obat racikan.");
      return;
    }

    const payload = {
      hasDtd: this.compoundingState.hasDtd,
      compoundingInstruction: this.compoundingState.command,
      packaging: this.compoundingState.packaging,
      totalPacks: this.compoundingState.totalPacks,
      signa: this.compoundingState.signa,
      ingredients: JSON.parse(JSON.stringify(this.compoundingState.ingredients)),
      title: `Racikan (${this.compoundingState.hasDtd ? "d.t.d." : "non-dtd"}): ${this.compoundingState.ingredients.map(i => i.name).join(" + ")}`
    };

    this.rxManager.addCompoundedToCart(payload);
    this.updateCartBadge();
    this.renderCartAndPrescription();

    // Switch to Prescription Tab
    document.getElementById("nav-rx")?.click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ------------------------------------------------------------- */
  /* 3. RESEP VETERINER / PRESCRIPTION ALGORITHM                   */
  /* ------------------------------------------------------------- */
  setupPrescriptionEvents() {
    document.getElementById("btn-clear-cart")?.addEventListener("click", () => {
      if (confirm("Kosongkan semua obat dari keranjang resep?")) {
        this.rxManager.clearCart();
        this.renderCartAndPrescription();
      }
    });

    const updatePatientDetails = () => {
      this.renderPrescriptionSlip();
    };

    document.getElementById("rx-patient-name")?.addEventListener("input", updatePatientDetails);
    document.getElementById("rx-owner-name")?.addEventListener("input", updatePatientDetails);
    document.getElementById("rx-patient-species")?.addEventListener("input", updatePatientDetails);
    document.getElementById("rx-patient-weight")?.addEventListener("input", updatePatientDetails);

    // Copy formatted plain text
    document.getElementById("btn-copy-rx")?.addEventListener("click", () => {
      const patientInfo = this.getPatientFormData();
      const compiled = this.rxManager.compilePrescription(patientInfo);
      navigator.clipboard.writeText(compiled.plainText).then(() => {
        this.showToast("Teks resep berhasil disalin ke clipboard!", "success");
      });
    });

    // Save Prescription to History
    document.getElementById("btn-save-rx")?.addEventListener("click", () => {
      if (this.rxManager.getCartItems().length === 0) {
        this.showToast("Keranjang resep masih kosong! Tambahkan obat terlebih dahulu.", "error");
        return;
      }

      const patientInfo = this.getPatientFormData();
      const compiled = this.rxManager.compilePrescription(patientInfo);
      const savedRecord = this.rxManager.saveToHistory(compiled);

      this.rxManager.clearCart();
      this.updateCartBadge();
      this.renderCartAndPrescription();
      this.updateHistoryBadge();

      this.showToast(`Resep ${savedRecord.patient.rxNumber} berhasil disimpan ke History Pembuatan Obat!`, "success");

      // Navigate to History tab
      setTimeout(() => {
        document.getElementById("nav-history")?.click();
      }, 350);
    });
  }

  getPatientFormData() {
    return {
      patientName: document.getElementById("rx-patient-name")?.value || "Milo",
      ownerName: document.getElementById("rx-owner-name")?.value || "Budi Santoso",
      species: document.getElementById("rx-patient-species")?.value || "Canine",
      weight: document.getElementById("rx-patient-weight")?.value || "25"
    };
  }

  renderCartAndPrescription() {
    this.updateCartBadge();
    const itemsContainer = document.getElementById("cart-items-container");
    const items = this.rxManager.getCartItems();

    if (!itemsContainer) return;

    if (items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <i class="ph ph-shopping-bag text-3xl text-slate-300 mx-auto mb-2"></i>
          <p class="text-xs font-semibold text-slate-600">Keranjang Resep Kosong</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Gunakan tab Kalkulator Dosis untuk menghitung dan menambahkan obat.</p>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = items.map(item => {
        if (item.isCompounded) {
          const modeLabel = item.hasDtd ? "Dengan d.t.d." : "Tanpa d.t.d.";
          const ingList = item.ingredients.map(i => {
            if (item.hasDtd) {
              return `${i.name} ${i.dosePerPack}${i.unit || "mg"}`;
            } else {
              return `${i.name} ${i.stockStrength}${i.strengthUnit || "mg"} tab ${toRomanNumeral(i.totalStockUnits)}`;
            }
          }).join(", ");

          return `
            <div class="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-sm text-slate-900">${item.title || "Obat Racikan"}</span>
                    <span class="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                      ${modeLabel} • No. ${toRomanNumeral(item.totalPacks)}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 mt-1 font-mono">
                    ${ingList}
                  </p>
                  <p class="text-[11px] text-slate-500 mt-0.5">
                    Instruksi: <span class="font-mono font-semibold text-slate-800">${item.compoundingInstruction} ${item.packaging}</span> • Signa: <span class="font-mono font-semibold text-teal-800">${item.signa}</span>
                  </p>
                </div>
                <button data-item-id="${item.id}" class="btn-remove-cart-item text-slate-400 hover:text-rose-600 transition">
                  <i class="ph ph-trash text-lg"></i>
                </button>
              </div>
            </div>
          `;
        }

        // Single medication
        return `
          <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-sm text-slate-900">${item.drugName}</span>
                  <span class="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    ${item.formulation ? `${item.formulation.strength}${item.formulation.unit} ${item.formulation.code}` : ""}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">
                  ${item.doseMgPerAdmin} mg per admin (${item.unitDisplay || ""}) • Signa: <span class="font-mono font-semibold text-slate-800">${item.frequencyCode || item.customDirectives}</span>
                </p>
              </div>
              <button data-item-id="${item.id}" class="btn-remove-cart-item text-slate-400 hover:text-rose-600 transition">
                <i class="ph ph-trash text-lg"></i>
              </button>
            </div>
          </div>
        `;
      }).join("");

      itemsContainer.querySelectorAll(".btn-remove-cart-item").forEach(btn => {
        btn.addEventListener("click", () => {
          this.rxManager.removeFromCart(btn.dataset.itemId);
          this.renderCartAndPrescription();
        });
      });
    }

    this.renderPrescriptionSlip();
  }

  generatePrescriptionPaperSlipHtml(compiled) {
    const config = compiled.config || this.rxManager.config;
    const patient = compiled.patient || {};
    const rxItems = compiled.rxItems || [];

    return `
      <div class="text-center border-b-2 border-slate-900 pb-3">
        <h2 class="text-lg font-bold tracking-wide uppercase">${config.clinicName}</h2>
        <p class="text-xs font-medium text-slate-700 mt-0.5">${config.vetName} | ${config.licenseNumber}</p>
        <p class="text-[11px] text-slate-600">${config.clinicAddress} • Telp: ${config.clinicPhone}</p>
      </div>

      <div class="flex justify-between text-xs py-2 border-b border-dashed border-slate-400">
        <div>
          <span>Tanggal: <b>${patient.date}</b></span><br>
          <span>No. Resep: <b>${patient.rxNumber}</b></span>
        </div>
        <div class="text-right">
          <span>Pemilik: <b>${patient.ownerName}</b></span><br>
          <span>Pasien: <b>${patient.patientName} (${patient.species}, ${patient.weight} kg)</b></span>
        </div>
      </div>

      <div class="py-4 space-y-4">
        ${rxItems.length === 0 ? `
          <p class="italic text-center text-xs text-slate-400 py-6">Belum ada obat yang dimasukkan ke dalam resep.</p>
        ` : rxItems.map(item => `
          <div class="pl-2 border-l-2 border-slate-900 font-serif">
            <div class="text-sm font-bold tracking-wide whitespace-pre-wrap">${item.line1}</div>
            <div class="text-xs text-slate-800 ml-4 font-mono font-medium">${item.line2}</div>
          </div>
        `).join("")}
      </div>

      <div class="border-t-2 border-slate-900 pt-3 flex justify-between items-end text-xs">
        <div>
          <p class="font-bold">Pro: ${patient.patientName}</p>
          <p class="text-[11px] text-slate-600">Species: ${patient.species} (${patient.weight} kg)</p>
        </div>
        <div class="text-center">
          <p class="text-[11px] text-slate-600">Tanda Tangan Dokter Hewan,</p>
          <div class="h-12"></div>
          <p class="font-bold border-t border-slate-800 px-4">(${config.vetName})</p>
        </div>
      </div>
    `;
  }

  renderPrescriptionSlip() {
    const previewContainer = document.getElementById("rx-paper-preview");
    if (!previewContainer) return;

    const patientInfo = this.getPatientFormData();
    const compiled = this.rxManager.compilePrescription(patientInfo);
    previewContainer.innerHTML = this.generatePrescriptionPaperSlipHtml(compiled);
  }

  /* ------------------------------------------------------------- */
  /* 4. HISTORY PEMBUATAN OBAT / ARSIP RESEP                       */
  /* ------------------------------------------------------------- */
  updateHistoryBadge() {
    const badge = document.getElementById("history-badge");
    const count = this.rxManager.getHistory().length;
    if (badge) {
      if (count > 0) {
        badge.classList.remove("hidden");
        badge.textContent = count;
      } else {
        badge.classList.add("hidden");
      }
    }
  }

  setupHistoryEvents() {
    const searchInput = document.getElementById("history-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.historySearchQuery = e.target.value;
        this.renderHistorySection(e.target.value);
      });
    }

    document.getElementById("btn-clear-all-history")?.addEventListener("click", () => {
      if (this.rxManager.getHistory().length === 0) {
        this.showToast("History masih kosong.", "info");
        return;
      }
      if (confirm("Apakah Anda yakin ingin menghapus SELURUH riwayat resep tersimpan? Tindakan ini tidak dapat dibatalkan.")) {
        this.rxManager.clearAllHistory();
        this.updateHistoryBadge();
        this.renderHistorySection();
        this.showToast("Seluruh riwayat resep telah dibersihkan.", "info");
      }
    });

    // History Modal Controls
    const closeModal = () => {
      document.getElementById("modal-history-detail")?.classList.add("hidden");
      this.activeModalHistoryRecord = null;
    };

    document.getElementById("btn-close-history-modal")?.addEventListener("click", closeModal);
    document.getElementById("btn-modal-history-close")?.addEventListener("click", closeModal);

    document.getElementById("btn-modal-history-print")?.addEventListener("click", () => {
      if (this.activeModalHistoryRecord) {
        this.printHistoryPrescription(this.activeModalHistoryRecord.id);
      }
    });

    document.getElementById("btn-modal-history-copy")?.addEventListener("click", () => {
      if (this.activeModalHistoryRecord) {
        navigator.clipboard.writeText(this.activeModalHistoryRecord.plainText).then(() => {
          this.showToast("Teks resep berhasil disalin ke clipboard!", "success");
        });
      }
    });
  }

  renderHistorySection(filterQuery = "") {
    const container = document.getElementById("history-items-container");
    const counterText = document.getElementById("history-counter-text");
    if (!container) return;

    let history = this.rxManager.getHistory();
    const totalCount = history.length;

    const query = (filterQuery || this.historySearchQuery || "").toLowerCase().trim();
    if (query) {
      history = history.filter(item => {
        const p = item.patient || {};
        const medNames = (item.rxItems || []).map(r => r.title || r.line1 || "").join(" ").toLowerCase();
        return (
          (p.rxNumber && p.rxNumber.toLowerCase().includes(query)) ||
          (p.patientName && p.patientName.toLowerCase().includes(query)) ||
          (p.ownerName && p.ownerName.toLowerCase().includes(query)) ||
          (p.species && p.species.toLowerCase().includes(query)) ||
          medNames.includes(query)
        );
      });
    }

    if (counterText) {
      counterText.textContent = `${history.length} dari ${totalCount} resep tersimpan`;
    }

    if (history.length === 0) {
      if (totalCount === 0) {
        container.innerHTML = `
          <div class="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
            <div class="w-14 h-14 mx-auto rounded-full bg-teal-50 flex items-center justify-center text-teal-600 text-2xl">
              <i class="ph-bold ph-clock-counter-clockwise"></i>
            </div>
            <h3 class="text-base font-bold text-slate-800">Belum Ada Riwayat Resep Tersimpan</h3>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              Seluruh resep yang Anda buat di tab <b>Kalkulator Dosis</b> dan disimpan pada tab <b>Resep Veteriner</b> akan diarsipkan di sini dan siap untuk dicetak kapan saja.
            </p>
            <div class="pt-2">
              <button type="button" id="btn-hist-go-calc" class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition inline-flex items-center gap-1.5">
                <i class="ph-bold ph-calculator"></i> Mulai Buat Resep di Kalkulator
              </button>
            </div>
          </div>
        `;
        document.getElementById("btn-hist-go-calc")?.addEventListener("click", () => {
          document.getElementById("nav-calculator")?.click();
        });
      } else {
        container.innerHTML = `
          <div class="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <p class="text-sm font-semibold text-slate-700">Tidak ada resep yang cocok dengan pencarian "${query}".</p>
            <button type="button" id="btn-hist-reset-search" class="mt-2 text-xs text-teal-600 hover:underline font-bold">
              Reset Pencarian
            </button>
          </div>
        `;
        document.getElementById("btn-hist-reset-search")?.addEventListener("click", () => {
          const input = document.getElementById("history-search-input");
          if (input) input.value = "";
          this.historySearchQuery = "";
          this.renderHistorySection();
        });
      }
      return;
    }

    container.innerHTML = history.map(record => {
      const p = record.patient || {};
      const itemCount = (record.rxItems || []).length;
      return `
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-teal-300 transition-all space-y-4">
          <!-- Card Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                <i class="ph-bold ph-receipt"></i>
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-900 text-sm font-mono">${p.rxNumber || "RX-UNTITLED"}</h3>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Tersimpan
                  </span>
                </div>
                <p class="text-[11px] text-slate-400">Disimpan pada: ${record.savedAt}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <button data-id="${record.id}" class="btn-hist-view px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition">
                <i class="ph-bold ph-eye"></i>
                <span>Lihat Lembar</span>
              </button>
              <button data-id="${record.id}" class="btn-hist-copy px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition" title="Salin Teks Formal">
                <i class="ph ph-copy"></i>
              </button>
              <button data-id="${record.id}" class="btn-hist-print px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
                <i class="ph-bold ph-printer"></i>
                <span>Cetak Resep</span>
              </button>
              <button data-id="${record.id}" class="btn-hist-delete p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition" title="Hapus Riwayat Resep">
                <i class="ph ph-trash text-base"></i>
              </button>
            </div>
          </div>

          <!-- Patient & Medication Information Grid -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            <!-- Patient Info (4 cols) -->
            <div class="md:col-span-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data Pasien & Pemilik</div>
              <div class="font-bold text-slate-800 text-sm flex items-center gap-1">
                <i class="ph-bold ph-paw text-teal-600"></i> ${p.patientName}
                <span class="text-xs font-normal text-slate-500">(${p.species || "Canine"})</span>
              </div>
              <div class="text-slate-600">Pemilik: <span class="font-semibold text-slate-800">${p.ownerName}</span></div>
              <div class="text-slate-600">Berat Badan: <span class="font-semibold text-slate-800">${p.weight} kg</span></div>
            </div>

            <!-- Prescribed Medications List (8 cols) -->
            <div class="md:col-span-8 space-y-2">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between">
                <span>Daftar Formula / Obat (${itemCount} Item)</span>
                <span class="text-teal-700 font-semibold font-mono">${record.config?.vetName || "drh. Pratama Wijaya"}</span>
              </div>
              <div class="space-y-1.5">
                ${(record.rxItems || []).map(item => `
                  <div class="p-2.5 rounded-xl border ${item.isCompounded ? "border-purple-200 bg-purple-50/40" : "border-slate-200 bg-white"} font-mono text-xs">
                    <div class="font-bold text-slate-900 whitespace-pre-wrap">${item.line1}</div>
                    <div class="text-teal-700 font-semibold mt-0.5 ml-3">${item.line2}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Attach card event listeners
    container.querySelectorAll(".btn-hist-print").forEach(btn => {
      btn.addEventListener("click", () => {
        this.printHistoryPrescription(btn.dataset.id);
      });
    });

    container.querySelectorAll(".btn-hist-view").forEach(btn => {
      btn.addEventListener("click", () => {
        this.viewHistoryPrescription(btn.dataset.id);
      });
    });

    container.querySelectorAll(".btn-hist-copy").forEach(btn => {
      btn.addEventListener("click", () => {
        const rec = this.rxManager.getHistoryById(btn.dataset.id);
        if (rec) {
          navigator.clipboard.writeText(rec.plainText).then(() => {
            this.showToast("Teks resep berhasil disalin ke clipboard!", "success");
          });
        }
      });
    });

    container.querySelectorAll(".btn-hist-delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const rec = this.rxManager.getHistoryById(btn.dataset.id);
        const name = rec?.patient?.rxNumber || "resep ini";
        if (confirm(`Yakin ingin menghapus ${name} dari history?`)) {
          this.rxManager.deleteHistoryItem(btn.dataset.id);
          this.updateHistoryBadge();
          this.renderHistorySection();
          this.showToast("Resep berhasil dihapus dari history.", "info");
        }
      });
    });
  }

  printHistoryPrescription(recordId) {
    const record = this.rxManager.getHistoryById(recordId);
    if (!record) return;

    const printContainer = document.getElementById("prescription-print-modal");
    if (printContainer) {
      printContainer.innerHTML = this.generatePrescriptionPaperSlipHtml(record);
    }
    window.print();
  }

  viewHistoryPrescription(recordId) {
    const record = this.rxManager.getHistoryById(recordId);
    if (!record) return;

    this.activeModalHistoryRecord = record;
    const modal = document.getElementById("modal-history-detail");
    const paper = document.getElementById("modal-history-paper-content");
    const subtitle = document.getElementById("modal-history-subtitle");

    if (subtitle) {
      subtitle.textContent = `No. Resep: ${record.patient?.rxNumber || ""} • Disimpan: ${record.savedAt}`;
    }
    if (paper) {
      paper.innerHTML = this.generatePrescriptionPaperSlipHtml(record);
    }
    modal?.classList.remove("hidden");
  }

  showToast(message, type = "info") {
    let container = document.getElementById("app-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "app-toast-container";
      container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const colors = {
      success: "bg-teal-900 text-white border-teal-700 shadow-teal-900/30",
      error: "bg-rose-900 text-white border-rose-700 shadow-rose-900/30",
      info: "bg-slate-900 text-white border-slate-700 shadow-slate-900/30"
    };
    const icons = {
      success: "ph-check-circle",
      error: "ph-warning-circle",
      info: "ph-info"
    };

    const colorClass = colors[type] || colors.info;
    const iconClass = icons[type] || icons.info;

    toast.className = `p-3.5 rounded-xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold pointer-events-auto transition-all transform duration-300 translate-y-3 opacity-0 ${colorClass}`;
    toast.innerHTML = `
      <i class="ph-bold ${iconClass} text-lg shrink-0 text-teal-300"></i>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-3", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-y-3", "opacity-0");
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  /* ------------------------------------------------------------- */
  /* 4. DATABASE TERMINOLOGI LATIN                                 */
  /* ------------------------------------------------------------- */
  setupTerminologyEvents() {
    const searchInput = document.getElementById("term-search-input");
    searchInput?.addEventListener("input", (e) => {
      this.renderTerminologyTable(e.target.value);
    });

    document.getElementById("btn-add-term-modal")?.addEventListener("click", () => {
      const code = prompt("Masukkan singkatan resep (contoh: s.u.c):");
      if (!code) return;
      const latin = prompt("Masukkan kepanjangan Latin (contoh: signa usus cognitus):") || "";
      const english = prompt("Masukkan arti/terjemahan:") || "";
      const category = prompt("Kategori (Frequency/Route/Formulation/Instruction):") || "General";
      const usage = prompt("Contoh penggunaan:") || "";

      try {
        this.termManager.addTerm({ code, latin, english, category, usage, notes: "Custom user added" });
        this.renderTerminologyTable();
        alert("Singkatan berhasil ditambahkan ke database!");
      } catch (err) {
        alert(err.message);
      }
    });
  }

  renderTerminologyTable(query = "") {
    const tbody = document.getElementById("terms-table-body");
    if (!tbody) return;

    const terms = this.termManager.search(query);

    const countBadge = document.getElementById("terms-count-badge");
    if (countBadge) {
      countBadge.textContent = `${terms.length} Istilah`;
    }

    tbody.innerHTML = terms.map(term => `
      <tr class="hover:bg-teal-50/40 transition">
        <td class="py-2.5 px-3 font-bold text-teal-800">${term.code}</td>
        <td class="py-2.5 px-3 italic text-slate-700">${term.latin}</td>
        <td class="py-2.5 px-3 text-slate-900 font-sans">${term.english}</td>
        <td class="py-2.5 px-3">
          <span class="badge-pill bg-slate-100 text-slate-600 border border-slate-200">${term.category}</span>
        </td>
        <td class="py-2.5 px-3 text-slate-500">${term.usage}</td>
      </tr>
    `).join("");
  }


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

    box.className = `p-5 rounded-2xl border transition-all duration-300 space-y-4 shadow-sm ${borderCol}`;
    box.classList.remove("hidden");

    box.innerHTML = `
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/80 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg shadow-sm">
            <i class="ph-bold ph-shield-check"></i>
          </div>
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-teal-800">Pedoman Antimikroba Bijak (Melbourne & AgVic)</div>
            <h4 class="font-bold text-slate-900 text-sm sm:text-base">${am.antibiotic} (${am.drug_class})</h4>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeCol}">
            ${am.stewardshipBadge}
          </span>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-slate-800 border border-slate-200 shadow-xs">
            ${am.pkPdType.split('(')[0].trim()}
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
          <p class="text-slate-700 leading-relaxed text-[11px] font-medium">${am.pkPdGuidance}</p>
          <div class="p-2 rounded-lg bg-teal-50 text-teal-900 text-[11px]">
            <b>Rekomendasi Dosis Panduan:</b> ${am.drug_dose || "-"} (${(am.routes || []).join(", ")})
          </div>
          <div class="space-y-1 text-[11px]">
            <span class="font-bold text-slate-800 block">Mutiara Klinis Terpilih:</span>
            <ul class="list-disc pl-4 space-y-0.5 text-slate-600">
              ${(am.clinical_pearls || []).slice(0, 3).map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>
        </div>

        <!-- Right: Drug Interactions & Cautions -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-2.5">
          <div class="font-bold text-rose-950 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <i class="ph-bold ph-arrows-clockwise text-rose-600"></i>
            <span>Interaksi Obat & Pantangan Campuran:</span>
          </div>
          ${am.interactions && am.interactions.length > 0 ? `
            <ul class="space-y-1.5 text-[11px]">
              ${am.interactions.map(it => `
                <li class="p-2 rounded-lg bg-rose-50/70 border border-rose-200/70 text-rose-950 leading-relaxed flex items-start gap-1.5">
                  <i class="ph-bold ph-warning-circle text-rose-600 shrink-0 mt-0.5"></i>
                  <span>${it}</span>
                </li>
              `).join("")}
            </ul>
          ` : `
            <p class="text-slate-500 italic text-[11px]">Tidak ada interaksi mayor spesifik yang tercatat dalam panduan ini.</p>
          `}

          <div class="pt-1">
            <span class="font-bold text-slate-800 block text-[11px]">Efek Samping Kunci:</span>
            <ul class="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
              ${(am.adverse_reactions || []).slice(0, 2).map(r => `<li>${r}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    `;
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
    amSection.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-teal-200 pb-2">
        <div class="flex items-center gap-2">
          <i class="ph-bold ph-shield-check text-teal-700 text-lg"></i>
          <h4 class="font-bold text-teal-900 text-xs sm:text-sm uppercase tracking-wide">
            Pedoman Antimikroba & Stewardship (Melbourne / AgVic)
          </h4>
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeCol}">
          ${am.stewardshipBadge}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-lg bg-white border border-teal-100 space-y-1">
          <div class="font-bold text-teal-900 flex items-center gap-1">
            <i class="ph-bold ph-chart-line-up"></i> Karakteristik PK/PD:
          </div>
          <p class="font-semibold text-slate-800">${am.pkPdType}</p>
          <p class="text-slate-600 text-[11px] leading-relaxed">${am.pkPdGuidance}</p>
        </div>

        <div class="p-3 rounded-lg bg-white border border-teal-100 space-y-1">
          <div class="font-bold text-teal-900 flex items-center gap-1">
            <i class="ph-bold ph-stethoscope"></i> Rentang Dosis Rekomendasi:
          </div>
          <p class="font-mono text-teal-800 font-bold">${am.drug_dose || "-"}</p>
          <p class="text-slate-500 text-[11px]">Rute: ${(am.routes || []).join(", ")} • Teregistrasi Hewan: ${am.registered_for_animals ? "Ya (Veteriner)" : "Off-Label / Manusia"}</p>
        </div>
      </div>

      <div class="space-y-2 text-xs">
        <div class="p-3 rounded-lg bg-rose-50/70 border border-rose-200">
          <div class="font-bold text-rose-900 flex items-center gap-1 mb-1">
            <i class="ph-bold ph-warning-octagon"></i> Reaksi Samping & Resiko Kritis:
          </div>
          <ul class="list-disc pl-4 space-y-1 text-rose-950 text-[11px]">
            ${(am.adverse_reactions || []).map(r => `<li>${r}</li>`).join("")}
          </ul>
        </div>

        <div class="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
          <div class="font-bold text-emerald-900 flex items-center gap-1 mb-1">
            <i class="ph-bold ph-lightbulb"></i> Mutiara Klinis & Indikasi Pilihan (Clinical Pearls):
          </div>
          <ul class="list-disc pl-4 space-y-1 text-emerald-950 text-[11px]">
            ${(am.clinical_pearls || []).map(p => `<li>${p}</li>`).join("")}
          </ul>
        </div>

        ${am.interactions && am.interactions.length > 0 ? `
          <div class="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
            <div class="font-bold text-amber-900 flex items-center gap-1 mb-1">
              <i class="ph-bold ph-arrows-left-right"></i> Interaksi Obat Penting (University of Melbourne):
            </div>
            <ul class="list-disc pl-4 space-y-1 text-amber-950 text-[11px]">
              ${am.interactions.map(it => `<li>${it}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
      </div>
    `;
  }

  renderAntimicrobialFullGuide() {
    const container = document.getElementById("antimicrobial-guideline-container");
    if (!container) return;

    const data = ANTIMICROBIAL_STEWARDSHIP_DATA;
    const spec = data.spectrumOfActivity;
    const mrsp = data.mrspFactSheet;

    container.innerHTML = `
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
          <table class="min-w-[700px] w-full text-[11px] text-left border-collapse">
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
              ${spec.bacteria_susceptibility.map(b => `
                <tr class="hover:bg-teal-50/40 transition">
                  <td class="py-2 px-3 font-semibold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200">
                    <div>${b.organism}</div>
                    <span class="text-[9px] text-slate-400 font-normal uppercase">${b.category}</span>
                  </td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Penicillin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Penicillin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Penicillin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Ampicillin / amoxycillin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Ampicillin / amoxycillin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Ampicillin / amoxycillin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Doxycycline'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Doxycycline'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Doxycycline'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Trimethoprim sulpha'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Trimethoprim sulpha'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Trimethoprim sulpha'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Amoxycillin clavulanate'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Amoxycillin clavulanate'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Amoxycillin clavulanate'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Cefazolin / cephalexin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Cefazolin / cephalexin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Cefazolin / cephalexin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Gentamicin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Gentamicin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Gentamicin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Metronidazole'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Metronidazole'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Metronidazole'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Clindamycin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Clindamycin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Clindamycin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Cefovecin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Cefovecin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Cefovecin'] || '-'}</td>
                  <td class="py-2 px-2 text-center font-bold font-mono ${b.activity['Enrofloxacin'] === '✓' ? 'bg-emerald-100 text-emerald-900' : b.activity['Enrofloxacin'] === 'IR' ? 'bg-rose-50 text-rose-700' : ''}">${b.activity['Enrofloxacin'] || '-'}</td>
                </tr>
              `).join("")}
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
            <h3 class="text-lg font-bold text-slate-900 mt-1">${mrsp.title}</h3>
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
              ${mrsp.key_facts.map(f => `<li>${f}</li>`).join("")}
            </ul>
          </div>

          <!-- Opsi Terapi & Peringatan Beta-Laktam -->
          <div class="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <h4 class="font-bold text-amber-950 flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
              <i class="ph-bold ph-first-aid text-amber-700"></i>
              <span>Prinsip Pengobatan:</span>
            </h4>
            <div class="p-2 rounded-lg bg-rose-100/80 border border-rose-300 text-rose-950 text-[11px] font-bold">
              ⛔ TIDAK EFEKTIF: ${mrsp.treatment_options.ineffective_beta_lactams.excluded_drugs.join(", ")}
            </div>
            <ul class="space-y-1.5 text-amber-950 text-[11px] list-disc pl-4 leading-relaxed">
              ${mrsp.treatment_options.general_principles.map(p => `<li>${p}</li>`).join("")}
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
    `;

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

}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.vetApp = new App();
});
