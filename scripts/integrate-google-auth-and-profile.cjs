/**
 * Script to integrate:
 * 1. Google Authentication on Landing Page (Hero, Modal, Pricing)
 * 2. User Profile Data Panel in Settings Tab
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// A. Insert Firebase Compat SDKs before app.js
if (!indexHtml.includes('firebase-auth-compat.js')) {
  indexHtml = indexHtml.replace(
    '<script type="module" src="js/app.js"></script>',
    `<!-- Firebase SDKs for Google Authentication -->
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
  <script type="module" src="js/app.js"></script>`
  );
  console.log('Firebase SDKs added.');
}

// B. Add Google Login Button in Hero Section
const heroCtaOld = `            <!-- CTA Buttons -->
            <div class="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button 
                type="button" 
                class="btn-open-login-modal w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-teal-600/30 hover:-translate-y-0.5"
              >
                <i class="ph-bold ph-key text-lg"></i>
                <span>Masuk / Akses Aplikasi</span>
              </button>
              
              <a 
                href="https://wa.me/6289654043714?text=Halo%20Developer%20Katalog%20Obat%20Hewan,%20saya%20tertarik%20dengan%20aplikasi%20ini%20dan%20ingin%20berdiskusi%20lebih%20lanjut..." 
                target="_blank" 
                rel="noopener noreferrer"
                class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 border border-slate-300 transition shadow-sm hover:border-slate-400"
              >
                <i class="ph-bold ph-whatsapp-logo text-lg text-emerald-600"></i>
                <span>Hubungi Pengembang (+62 896 5404 3714)</span>
              </a>
            </div>`;

const heroCtaNew = `            <!-- CTA Buttons with Google Sign-In -->
            <div class="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button 
                type="button" 
                id="btn-hero-google-login" 
                class="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2.5 border border-slate-300 transition shadow-sm hover:border-teal-500 hover:shadow-md"
              >
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Masuk via Google</span>
              </button>

              <button 
                type="button" 
                class="btn-open-login-modal w-full sm:w-auto px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-teal-600/30 hover:-translate-y-0.5"
              >
                <i class="ph-bold ph-key text-base"></i>
                <span>Masuk Akun</span>
              </button>
              
              <a 
                href="https://wa.me/6289654043714?text=Halo%20Developer%20Katalog%20Obat%20Hewan,%20saya%20tertarik%20dengan%20aplikasi%20ini%20dan%20ingin%20berdiskusi..." 
                target="_blank" 
                rel="noopener noreferrer"
                class="w-full sm:w-auto px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 border border-emerald-200 transition shadow-xs"
              >
                <i class="ph-bold ph-whatsapp-logo text-base text-emerald-600"></i>
                <span>WhatsApp</span>
              </a>
            </div>`;

if (indexHtml.includes(heroCtaOld)) {
  indexHtml = indexHtml.replace(heroCtaOld, heroCtaNew);
  console.log('Hero CTA updated with Google button.');
}

// C. Add Google Login in Pricing Section
const pricingCtaOld = `          <!-- Dual CTAs -->
          <div class="pt-4 border-t border-slate-100 space-y-3">
            <!-- Login CTA (No plain text credentials) -->
            <button 
              type="button" 
              class="btn-open-login-modal w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
            >
              <i class="ph-bold ph-key text-base"></i>
              <span>Masuk / Akses Aplikasi</span>
            </button>`;

const pricingCtaNew = `          <!-- Dual CTAs -->
          <div class="pt-4 border-t border-slate-100 space-y-3">
            <!-- Google Sign-In in Pricing -->
            <button 
              type="button" 
              id="btn-pricing-google-login" 
              class="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border-2 border-slate-200 hover:border-teal-500 shadow-sm flex items-center justify-center gap-2.5 transition"
            >
              <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Masuk Cepat dengan Akun Google</span>
            </button>

            <!-- Login CTA (No plain text credentials) -->
            <button 
              type="button" 
              class="btn-open-login-modal w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
            >
              <i class="ph-bold ph-key text-base"></i>
              <span>Masuk dengan Kredensial Akun</span>
            </button>`;

if (indexHtml.includes(pricingCtaOld)) {
  indexHtml = indexHtml.replace(pricingCtaOld, pricingCtaNew);
  console.log('Pricing section updated with Google button.');
}

// D. Add Google Login Button at top of Login Modal
const modalFormOld = `      <!-- Modal Body Form -->
      <form id="form-auth-login" class="p-6 space-y-5">
        
        <!-- Info Akses (No plain text credentials) -->`;

const modalFormNew = `      <!-- Modal Body Form -->
      <form id="form-auth-login" class="p-6 space-y-4">
        
        <!-- Google Login Button in Modal -->
        <button 
          type="button" 
          id="btn-modal-google-login" 
          class="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-xs hover:border-slate-400 flex items-center justify-center gap-2.5 transition"
        >
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Lanjutkan dengan Akun Google</span>
        </button>

        <div class="relative flex items-center justify-center">
          <div class="border-t border-slate-200 w-full"></div>
          <span class="bg-white px-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider relative shrink-0">atau masuk manual</span>
          <div class="border-t border-slate-200 w-full"></div>
        </div>

        <!-- Info Akses (No plain text credentials) -->`;

if (indexHtml.includes(modalFormOld)) {
  indexHtml = indexHtml.replace(modalFormOld, modalFormNew);
  console.log('Login modal updated with Google button.');
}

// E. Update Settings Tabs & Insert Profile Subpanel
const settingsSubtabsOld = `      <!-- Settings Sub-Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button type="button" id="settings-tab-btn-lang" class="settings-subtab-btn px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition whitespace-nowrap">
          <i class="ph-bold ph-globe"></i>
          <span>Preferensi Bahasa</span>
        </button>
        <button type="button" id="settings-tab-btn-terms" class="settings-subtab-btn px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition whitespace-nowrap">
          <i class="ph-bold ph-translate"></i>
          <span>Terminologi Latin</span>
        </button>
        <button type="button" id="settings-tab-btn-firebase" class="settings-subtab-btn px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition whitespace-nowrap">
          <i class="ph-bold ph-cloud-check"></i>
          <span>Firebase Hosting</span>
        </button>
      </div>`;

const settingsSubtabsNew = `      <!-- Settings Sub-Navigation Tabs (Profile First) -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button type="button" id="settings-tab-btn-profile" class="settings-subtab-btn px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition whitespace-nowrap">
          <i class="ph-bold ph-user-circle text-base"></i>
          <span>Data Profil Dokter</span>
        </button>
        <button type="button" id="settings-tab-btn-lang" class="settings-subtab-btn px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition whitespace-nowrap">
          <i class="ph-bold ph-globe text-base"></i>
          <span>Preferensi Bahasa</span>
        </button>
        <button type="button" id="settings-tab-btn-terms" class="settings-subtab-btn px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition whitespace-nowrap">
          <i class="ph-bold ph-translate text-base"></i>
          <span>Terminologi Latin</span>
        </button>
        <button type="button" id="settings-tab-btn-firebase" class="settings-subtab-btn px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition whitespace-nowrap">
          <i class="ph-bold ph-cloud-check text-base"></i>
          <span>Firebase Hosting</span>
        </button>
      </div>`;

if (indexHtml.includes(settingsSubtabsOld)) {
  indexHtml = indexHtml.replace(settingsSubtabsOld, settingsSubtabsNew);
  console.log('Settings subtabs updated with Profile button.');
}

// F. Insert Profile Subpanel before settings-panel-lang
const profilePanelHtml = `      <!-- SUB-PANEL 0: USER PROFILE DATA -->
      <div id="settings-panel-profile" class="space-y-6">
        
        <!-- Profile Header Summary Card -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="relative shrink-0">
              <div id="profile-avatar-container" class="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-md overflow-hidden border-2 border-white">
                <span id="profile-avatar-initials">DR</span>
                <img id="profile-avatar-img" class="w-full h-full object-cover hidden" alt="Avatar Pengguna">
              </div>
              <div id="profile-provider-badge-icon" class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-xs">
                <i class="ph-bold ph-shield-check text-teal-600"></i>
              </div>
            </div>
            
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 id="profile-header-name" class="text-lg sm:text-xl font-bold text-slate-900">drh. Pratama Wijaya, M.Si</h3>
                <span id="profile-header-provider-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                  Akun Dokter Hewan
                </span>
              </div>
              <p id="profile-header-role" class="text-xs text-slate-500 font-medium">Praktisi Hewan Kecil &bull; SIP Aktif</p>
              <p id="profile-header-email" class="text-xs text-slate-400 font-mono">pratama.vet@gmail.com</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Tersinkronisasi Otomatis ke E-Resep</span>
            </span>
          </div>
        </div>

        <!-- Profile Edit Form Card -->
        <div class="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <i class="ph-bold ph-identification-card text-teal-600"></i>
              <span>Data Identitas & Fasilitas Praktik Klinis</span>
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Data profil ini secara otomatis digunakan sebagai identitas resmi (Inscriptio & Subscriptio) pada cetak resep dokter hewan.
            </p>
          </div>

          <form id="form-user-profile" class="space-y-6">
            
            <!-- Grid 1: Personal & Legal Data -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              
              <div class="space-y-1.5">
                <label for="prof-input-name" class="block font-bold text-slate-700">
                  Nama Lengkap & Gelar <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="prof-input-name" 
                  required 
                  placeholder="Contoh: drh. Pratama Wijaya, M.Si" 
                  class="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800 text-xs sm:text-sm"
                >
              </div>

              <div class="space-y-1.5">
                <label for="prof-input-sip" class="block font-bold text-slate-700">
                  Nomor SIP / SNT Resmi <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="prof-input-sip" 
                  required 
                  placeholder="Contoh: 503/014/SIP-DRH/2026" 
                  class="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-semibold text-slate-800 text-xs sm:text-sm"
                >
              </div>

              <div class="space-y-1.5">
                <label for="prof-input-role" class="block font-bold text-slate-700">
                  Peran / Spesialisasi
                </label>
                <select id="prof-input-role" class="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 text-xs sm:text-sm bg-white">
                  <option value="Dokter Hewan Praktisi (Small Animal)">Dokter Hewan Praktisi Hewan Kecil (Kucing & Anjing)</option>
                  <option value="Dokter Hewan Eksotik & Satwa Liar">Dokter Hewan Hewan Eksotik & Satwa Liar</option>
                  <option value="Dokter Hewan Kuda & Ternak Besar">Dokter Hewan Kuda & Ternak Besar</option>
                  <option value="Mahasiswa Koas / PPDH">Mahasiswa Koas / PPDH Kedokteran Hewan</option>
                  <option value="Dosen & Peneliti Farmakologi">Dosen / Peneliti Farmakologi Veteriner</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label for="prof-input-email" class="block font-bold text-slate-700">
                  Email Akun / Kontak
                </label>
                <input 
                  type="email" 
                  id="prof-input-email" 
                  placeholder="dokter@gmail.com" 
                  class="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs sm:text-sm"
                >
              </div>

              <div class="space-y-1.5">
                <label for="prof-input-phone" class="block font-bold text-slate-700">
                  Nomor WhatsApp / HP Dokter
                </label>
                <input 
                  type="text" 
                  id="prof-input-phone" 
                  placeholder="+62 812-xxxx-xxxx" 
                  class="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-800 text-xs sm:text-sm"
                >
              </div>

              <div class="space-y-1.5">
                <label for="prof-input-avatar" class="block font-bold text-slate-700">
                  URL Foto Profil (Opsional)
                </label>
                <input 
                  type="url" 
                  id="prof-input-avatar" 
                  placeholder="https://..." 
                  class="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs sm:text-sm"
                >
              </div>

            </div>

            <!-- Grid 2: Clinic Facility Data -->
            <div class="border-t border-slate-100 pt-5 space-y-4">
              <h4 class="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <i class="ph-bold ph-buildings"></i>
                <span>Data Fasilitas Praktik (Klinik / Rumah Sakit Hewan)</span>
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                
                <div class="space-y-1.5 sm:col-span-2">
                  <label for="prof-input-clinic" class="block font-bold text-slate-700">
                    Nama Klinik / Praktik Bersama / RSH <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="prof-input-clinic" 
                    required 
                    placeholder="Contoh: Klinik Hewan Sehat Vet Care" 
                    class="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800 text-xs sm:text-sm"
                  >
                </div>

                <div class="space-y-1.5">
                  <label for="prof-input-clinic-phone" class="block font-bold text-slate-700">
                    Telepon Fasilitas / Darurat
                  </label>
                  <input 
                    type="text" 
                    id="prof-input-clinic-phone" 
                    placeholder="(021) 789-0123 / 0811-xxxx" 
                    class="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-800 text-xs sm:text-sm"
                  >
                </div>

                <div class="space-y-1.5 sm:col-span-3">
                  <label for="prof-input-address" class="block font-bold text-slate-700">
                    Alamat Lengkap Praktik
                  </label>
                  <input 
                    type="text" 
                    id="prof-input-address" 
                    placeholder="Contoh: Jl. Kesehatan Hewan No. 8, Jakarta Selatan" 
                    class="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs sm:text-sm"
                  >
                </div>

              </div>
            </div>

            <!-- Footer Actions -->
            <div class="border-t border-slate-100 pt-5 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <button 
                  type="submit" 
                  class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition hover:-translate-y-0.5"
                >
                  <i class="ph-bold ph-floppy-disk text-base"></i>
                  <span>Simpan Perubahan Profil</span>
                </button>
                <button 
                  type="button" 
                  id="btn-prof-reset-default" 
                  class="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition"
                >
                  Reset Default
                </button>
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-400">
                <i class="ph-bold ph-check text-emerald-500"></i>
                <span>Tersimpan di peramban & tersinkronisasi ke cetak resep</span>
              </div>
            </div>

          </form>
        </div>

      </div>
`;

// Make sure settings-panel-lang is hidden by default and settings-panel-profile is active
if (!indexHtml.includes('id="settings-panel-profile"')) {
  indexHtml = indexHtml.replace(
    '<div id="settings-panel-lang" class="space-y-6">',
    profilePanelHtml + '\n      <!-- SUB-PANEL 1: LANGUAGE PREFERENCE -->\n      <div id="settings-panel-lang" class="hidden space-y-6">'
  );
  console.log('Settings Profile Subpanel added.');
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('public/index.html updated successfully with Google Login & Profile panel!');
