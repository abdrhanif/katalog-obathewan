const fs = require('fs');
const path = require('path');

console.log('Starting comprehensive mobile responsiveness & bug fix...');

// =========================================================================
// 1. UPDATE public/css/styles.css
// =========================================================================
const cssPath = path.join(__dirname, '../public/css/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Ensure html & body prevent horizontal overflow and support smooth mobile touch
const mobileCssRules = `
/* Mobile Responsiveness & Touch Optimization */
html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  max-width: 100vw;
  width: 100%;
}

body {
  font-family: var(--font-primary);
  font-size: 0.95rem;
  line-height: 1.625;
  letter-spacing: -0.011em;
  color: #0f172a;
  background-color: #f8fafc;
  overflow-x: hidden;
  max-width: 100vw;
  width: 100%;
  -webkit-text-size-adjust: 100%;
  touch-action: manipulation;
}

/* Hide scrollbars cleanly for mobile horizontal swipe strips */
.no-scrollbar::-webkit-scrollbar {
  display: none !important;
}
.no-scrollbar {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}

/* Momentum scrolling on iOS Safari and Android */
.touch-scroll {
  -webkit-overflow-scrolling: touch;
}

/* Prevent iOS Safari auto-zoom on input focus by ensuring at least 16px on mobile */
@media (max-width: 640px) {
  input[type="text"],
  input[type="number"],
  input[type="email"],
  input[type="password"],
  select,
  textarea {
    font-size: 16px !important;
  }
}
`;

if (!css.includes('touch-action: manipulation')) {
  css = css.replace(/html\s*\{[\s\S]*?body\s*\{[\s\S]*?\}/, mobileCssRules.trim());
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✓ Updated public/css/styles.css with mobile viewport rules');
}

// =========================================================================
// 2. UPDATE public/index.html
// =========================================================================
const htmlPath = path.join(__dirname, '../public/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// A. Mobile Landing Header Optimization
const landingHeaderTarget = `<header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">`;

const landingHeaderReplacement = `<header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">`;

if (html.includes(landingHeaderTarget)) {
  html = html.replace(landingHeaderTarget, landingHeaderReplacement);
}

// Hide prototyping badge on very small screens to prevent wrapping
html = html.replace(
  '<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">Prototyping</span>',
  '<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 hidden sm:inline-block">Prototyping</span>'
);

// B. Mobile App Header & Navigation Tabs Optimization
const oldAppHeader = `  <!-- TOP NAVIGATION HEADER -->
  <header class="bg-teal-800 text-white shadow-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-inner">
          <i class="ph-bold ph-paw-print text-2xl"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-xl font-bold tracking-tight">Katalog Obat Hewan</h1>
          </div>
          <p class="text-xs text-teal-100">Veterinary Drug Compendium & Prescription Algorithm System</p>
        </div>
      </div>

      <!-- Navigation Tabs & Cart Badge -->
      <nav class="flex items-center space-x-1 sm:space-x-2 text-sm font-medium">
        <button id="nav-catalog" class="px-3 py-1.5 rounded-lg bg-teal-700 text-white flex items-center space-x-1.5 transition">
          <i class="ph ph-pill text-lg"></i>
          <span>Katalog Obat</span>
        </button>
        <button id="nav-calculator" class="px-3 py-1.5 rounded-lg hover:bg-teal-700/60 text-teal-100 flex items-center space-x-1.5 transition">
          <i class="ph ph-calculator text-lg"></i>
          <span>Kalkulator Dosis</span>
        </button>
        <button id="nav-rx" class="relative px-3 py-1.5 rounded-lg hover:bg-teal-700/60 text-teal-100 flex items-center space-x-1.5 transition">
          <i class="ph ph-file-text text-lg"></i>
          <span>Resep Veteriner</span>
          <span id="cart-badge" class="ml-1 bg-amber-500 text-slate-900 font-bold text-xs px-2 py-0.2 rounded-full hidden">0</span>
        </button>
        <button id="nav-history" class="relative px-3 py-1.5 rounded-lg hover:bg-teal-700/60 text-teal-100 flex items-center space-x-1.5 transition">
          <i class="ph ph-clock-counter-clockwise text-lg"></i>
          <span>Histori</span>
          <span id="history-badge" class="ml-1 bg-amber-500 text-slate-900 font-bold text-xs px-2 py-0.2 rounded-full hidden">0</span>
        </button>
        <button id="nav-settings" class="px-3 py-1.5 rounded-lg hover:bg-teal-700/60 text-teal-100 flex items-center space-x-1.5 transition">
          <i class="ph ph-gear text-lg"></i>
          <span>Pengaturan</span>
        </button>
        <div class="h-6 w-px bg-teal-600/70 mx-1 hidden md:block"></div>
        <button type="button" id="btn-view-landing" class="px-2.5 py-1.5 rounded-lg bg-teal-900/60 hover:bg-teal-900 text-teal-200 hover:text-white flex items-center space-x-1.5 transition text-xs font-semibold" title="Kembali ke Laman Landing">
          <i class="ph-bold ph-house text-base"></i>
          <span class="hidden xl:inline">Laman Landing</span>
        </button>
        <button type="button" id="btn-logout" class="px-2.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white flex items-center space-x-1.5 transition text-xs font-semibold" title="Keluar dari Aplikasi">
          <i class="ph-bold ph-sign-out text-base"></i>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </nav>
    </div>
  </header>`;

const newAppHeader = `  <!-- TOP NAVIGATION HEADER (MOBILE OPTIMIZED) -->
  <header class="bg-teal-800 text-white shadow-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">
      
      <!-- Top Row: Brand & Mobile Quick Actions -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center space-x-2.5 min-w-0">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-inner shrink-0">
            <i class="ph-bold ph-paw-print text-xl sm:text-2xl"></i>
          </div>
          <div class="min-w-0 truncate">
            <h1 class="text-base sm:text-xl font-bold tracking-tight truncate">Katalog Obat Hewan</h1>
            <p class="text-[10px] sm:text-xs text-teal-200 hidden sm:block truncate">Veterinary Drug Compendium & Prescription System</p>
          </div>
        </div>

        <!-- Quick actions (Landing & Logout) -->
        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" id="btn-view-landing" class="px-2.5 py-1.5 rounded-lg bg-teal-900/70 hover:bg-teal-900 text-teal-200 hover:text-white flex items-center gap-1 transition text-xs font-semibold shadow-xs" title="Kembali ke Laman Landing">
            <i class="ph-bold ph-house text-sm sm:text-base"></i>
            <span class="hidden md:inline">Landing</span>
          </button>
          <button type="button" id="btn-logout" class="px-2.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white flex items-center gap-1 transition text-xs font-semibold shadow-xs" title="Keluar dari Aplikasi">
            <i class="ph-bold ph-sign-out text-sm sm:text-base"></i>
            <span class="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs (Horizontally Swipeable on Mobile) -->
      <nav class="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar touch-scroll pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        <button id="nav-catalog" class="px-3 py-1.5 rounded-lg bg-teal-700 text-white flex items-center space-x-1.5 transition shrink-0 whitespace-nowrap">
          <i class="ph ph-pill text-base sm:text-lg"></i>
          <span>Katalog Obat</span>
        </button>
        <button id="nav-calculator" class="px-3 py-1.5 rounded-lg hover:bg-teal-700/60 text-teal-100 flex items-center space-x-1.5 transition shrink-0 whitespace-nowrap">
          <i class="ph ph-calculator text-base sm:text-lg"></i>
          <span>Kalkulator Dosis</span>
        </button>
        <button id="nav-rx" class="relative px-3 py-1.5 rounded-lg hover:bg-teal-700/60 text-teal-100 flex items-center space-x-1.5 transition shrink-0 whitespace-nowrap">
          <i class="ph ph-file-text text-base sm:text-lg"></i>
          <span>Resep Veteriner</span>
          <span id="cart-badge" class="ml-1 bg-amber-500 text-slate-900 font-bold text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full hidden">0</span>
        </button>
        <button id="nav-history" class="relative px-3 py-1.5 rounded-lg hover:bg-teal-700/60 text-teal-100 flex items-center space-x-1.5 transition shrink-0 whitespace-nowrap">
          <i class="ph ph-clock-counter-clockwise text-base sm:text-lg"></i>
          <span>Histori</span>
          <span id="history-badge" class="ml-1 bg-amber-500 text-slate-900 font-bold text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full hidden">0</span>
        </button>
        <button id="nav-settings" class="px-3 py-1.5 rounded-lg hover:bg-teal-700/60 text-teal-100 flex items-center space-x-1.5 transition shrink-0 whitespace-nowrap">
          <i class="ph ph-gear text-base sm:text-lg"></i>
          <span>Pengaturan</span>
        </button>
      </nav>
    </div>
  </header>`;

if (html.includes(oldAppHeader)) {
  html = html.replace(oldAppHeader, newAppHeader);
  console.log('✓ Upgraded App Navigation Header for mobile responsiveness');
}

// C. Fix Modal Login: Ensure scrollable on mobile keyboard popup and safe margins
const oldLoginModal = `  <!-- Modal: Authentication / Login -->
  <div id="modal-auth-login" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
      
      <!-- Modal Header -->
      <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
            <i class="ph-bold ph-lock-key text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-lg">Login Akun Praktisi</h3>
            <p class="text-xs text-slate-500">Akses Penuh Formularium & Kalkulator</p>
          </div>
        </div>
        <button type="button" id="btn-close-login-modal" class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition">
          <i class="ph-bold ph-x text-base"></i>
        </button>
      </div>

      <!-- Modal Body Form -->
      <form id="form-auth-login" class="p-6 space-y-4">`;

const newLoginModal = `  <!-- Modal: Authentication / Login (Mobile Scroll Safe) -->
  <div id="modal-auth-login" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 hidden overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto transform transition-all">
      
      <!-- Modal Header (Fixed) -->
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
            <i class="ph-bold ph-lock-key text-lg"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base sm:text-lg">Login Akun Praktisi</h3>
            <p class="text-[11px] sm:text-xs text-slate-500">Akses Penuh Formularium & Kalkulator</p>
          </div>
        </div>
        <button type="button" id="btn-close-login-modal" class="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition">
          <i class="ph-bold ph-x text-base"></i>
        </button>
      </div>

      <!-- Modal Body Form (Scrollable with mobile keyboard open) -->
      <form id="form-auth-login" class="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 touch-scroll">`;

if (html.includes(oldLoginModal)) {
  html = html.replace(oldLoginModal, newLoginModal);
  console.log('✓ Upgraded Login Modal with mobile scrollable container');
}

// D. Add Mobile Fast Login Helper inside Login Modal if Google popup is blocked
if (!html.includes('id="box-mobile-google-helper"')) {
  const mobileHelperHtml = `
        <!-- Mobile Google Fast Activation Helper (Shown if popup blocked on mobile) -->
        <div id="box-mobile-google-helper" class="hidden p-3 rounded-2xl bg-teal-50 border border-teal-300 space-y-2 text-xs">
          <div class="font-bold text-teal-900 flex items-center gap-1.5">
            <i class="ph-bold ph-shield-check text-teal-600 text-base"></i>
            <span>Aktivasi Sesi Akun Google (Mobile):</span>
          </div>
          <p class="text-[11px] text-teal-800 leading-relaxed">
            Popup Google diblokir oleh peramban HP Anda. Masukkan email Google Anda untuk aktivasi instan tanpa popup:
          </p>
          <div class="flex gap-2">
            <input 
              type="email" 
              id="input-mobile-google-email" 
              placeholder="nama.dokter@gmail.com" 
              value="drh.pengguna@gmail.com"
              class="flex-1 py-1.5 px-3 rounded-xl border border-teal-300 text-xs font-mono bg-white"
            >
            <button 
              type="button" 
              id="btn-confirm-mobile-google"
              class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shrink-0"
            >
              Masuk
            </button>
          </div>
        </div>
`;
  html = html.replace(
    '<!-- Divider -->\n        <div class="relative flex items-center justify-center">',
    mobileHelperHtml + '\n        <!-- Divider -->\n        <div class="relative flex items-center justify-center">'
  );
  console.log('✓ Added Mobile Google Fast Activation Helper into login modal');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✓ Updated public/index.html with mobile layout fixes');

// =========================================================================
// 3. UPDATE public/js/app.js (Dropdown touch handling & Google Auth mobile fallback)
// =========================================================================
const appPath = path.join(__dirname, '../public/js/app.js');
let appJs = fs.readFileSync(appPath, 'utf8');

// Update setupSearchableDrugSelector() to support touch/pointerdown on mobile
const oldDropdownListener = `      resultsBox.querySelectorAll(".btn-select-calc-drug").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const dId = btn.dataset.drugId;
          this.selectDrugInCalculator(dId);
          resultsBox.classList.add("hidden");
        });
      });`;

const newDropdownListener = `      resultsBox.querySelectorAll(".btn-select-calc-drug").forEach(btn => {
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
      });`;

if (appJs.includes(oldDropdownListener)) {
  appJs = appJs.replace(oldDropdownListener, newDropdownListener);
  console.log('✓ Fixed search dropdown touch/pointerdown handler for mobile devices');
}

// Update handleGoogleSignIn() to show inline mobile helper instead of window.prompt()
const oldGoogleFallback = `    // 2. Graceful fallback for local development or if Google OAuth consent screen is pending
    this.handleGoogleSimulatedSignIn();`;

const newGoogleFallback = `    // 2. Graceful fallback for mobile browsers or local development
    const mobileHelperBox = document.getElementById("box-mobile-google-helper");
    if (mobileHelperBox) {
      mobileHelperBox.classList.remove("hidden");
      const emailInp = document.getElementById("input-mobile-google-email");
      if (emailInp) {
        emailInp.focus();
        emailInp.select();
      }
      // Ensure login modal is open
      document.getElementById("modal-auth-login")?.classList.remove("hidden");
      this.showToast("Silakan konfirmasi email akun Google Anda untuk aktivasi.", "info");
      return;
    }

    this.handleGoogleSimulatedSignIn();`;

if (appJs.includes(oldGoogleFallback)) {
  appJs = appJs.replace(oldGoogleFallback, newGoogleFallback);
  console.log('✓ Wired mobile Google helper into handleGoogleSignIn');
}

// Bind mobile Google helper confirm button in setupAuthAndLandingEvents
const oldGoogleBindings = `    const handleGoogleClick = () => this.handleGoogleSignIn();
    document.getElementById("btn-hero-google-login")?.addEventListener("click", handleGoogleClick);
    document.getElementById("btn-modal-google-login")?.addEventListener("click", handleGoogleClick);
    document.getElementById("btn-pricing-google-login")?.addEventListener("click", handleGoogleClick);`;

const newGoogleBindings = `    const handleGoogleClick = () => this.handleGoogleSignIn();
    document.getElementById("btn-hero-google-login")?.addEventListener("click", handleGoogleClick);
    document.getElementById("btn-modal-google-login")?.addEventListener("click", handleGoogleClick);
    document.getElementById("btn-pricing-google-login")?.addEventListener("click", handleGoogleClick);

    // Mobile Google Helper confirm button
    document.getElementById("btn-confirm-mobile-google")?.addEventListener("click", () => {
      const email = document.getElementById("input-mobile-google-email")?.value.trim() || "drh.pengguna@gmail.com";
      let nameFormatted = "drh. Pengguna Google";
      try {
        const prefix = email.split("@")[0].replace(/[._]/g, " ");
        nameFormatted = "drh. " + prefix.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      } catch (_) {}

      this.applyUserSession({
        name: nameFormatted,
        email: email,
        photoURL: "",
        authProvider: "google"
      });

      document.getElementById("modal-auth-login")?.classList.add("hidden");
      this.showAppView();
      this.showToast(\`Selamat datang, \${nameFormatted}! Berhasil masuk via Akun Google.\`, "success");
    });`;

if (appJs.includes(oldGoogleBindings) && !appJs.includes('btn-confirm-mobile-google')) {
  appJs = appJs.replace(oldGoogleBindings, newGoogleBindings);
  console.log('✓ Bound mobile Google helper confirm event in setupAuthAndLandingEvents');
}

// Fix spectrum table min-width in renderAntimicrobialFullGuide
appJs = appJs.replace(
  '<table class="w-full text-[11px] text-left border-collapse">',
  '<table class="min-w-[700px] w-full text-[11px] text-left border-collapse">'
);

fs.writeFileSync(appPath, appJs, 'utf8');
console.log('✓ Updated public/js/app.js with mobile touch and auth fixes');

console.log('All mobile responsiveness fixes applied successfully!');
