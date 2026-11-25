/**
 * Script to update Landing Page in public/index.html:
 * 1. Hide username and password credentials from hero, pricing, and modal.
 * 2. Add supporting veterinary images, illustrations, and infographics.
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. New Landing Page HTML with images and hidden credentials
const updatedLandingPageHtml = `  <!-- ============================================================= -->
  <!-- LANDING PAGE ROOT                                             -->
  <!-- ============================================================= -->
  <div id="landing-page-root" class="min-h-screen flex flex-col bg-slate-50 text-slate-800">

    <!-- Active Session Banner (Shown if user is already authenticated) -->
    <div id="banner-logged-in" class="hidden bg-teal-950 text-teal-100 text-xs px-4 py-2.5 border-b border-teal-800/80 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sesi aktif terdeteksi: Anda sedang login sebagai <b>Dokter Hewan / Klinisi</b>.</span>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" id="btn-landing-back-to-app" class="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm">
            <span>Buka Aplikasi Utama</span>
            <i class="ph-bold ph-arrow-right"></i>
          </button>
          <button type="button" id="btn-landing-logout-banner" class="text-teal-300 hover:text-white underline text-xs">Logout</button>
        </div>
      </div>
    </div>

    <!-- 1. LANDING STICKY NAVIGATION -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <!-- Brand Logo -->
        <a href="#" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md group-hover:bg-teal-700 transition">
            <i class="ph-bold ph-paw-print text-2xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-slate-900 text-lg tracking-tight">Katalog Obat Hewan</span>
              <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">Prototyping</span>
            </div>
            <p class="text-xs text-slate-500 hidden sm:block">Veterinary Pharmacology & Prescription System</p>
          </div>
        </a>

        <!-- Desktop Navigation Anchors -->
        <nav class="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#urgensi" class="hover:text-teal-600 transition">Urgensi</a>
          <a href="#fitur" class="hover:text-teal-600 transition">Fitur Unggulan</a>
          <a href="#dosis" class="hover:text-teal-600 transition">Dosis Presisi</a>
          <a href="#amr" class="hover:text-teal-600 transition">Bahaya AMR</a>
          <a href="#pricing" class="hover:text-teal-600 transition">Pricing & Kontak</a>
        </nav>

        <!-- Action CTAs -->
        <div class="flex items-center gap-2.5">
          <!-- WhatsApp Developer Link -->
          <a 
            href="https://wa.me/6289654043714?text=Halo%20Developer%20Katalog%20Obat%20Hewan,%20saya%20tertarik%20dengan%20aplikasi%20ini%20dan%20ingin%20berdiskusi..." 
            target="_blank" 
            rel="noopener noreferrer"
            class="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition shadow-xs"
            title="Hubungi Pengembang di WhatsApp (+62 896 5404 3714)"
          >
            <i class="ph-bold ph-whatsapp-logo text-base text-emerald-600"></i>
            <span class="hidden sm:inline">Hubungi WA</span>
          </a>

          <!-- Login Button -->
          <button 
            type="button" 
            class="btn-open-login-modal px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm shadow-teal-600/20"
          >
            <i class="ph-bold ph-sign-in text-sm"></i>
            <span>Login Aplikasi</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 2. HERO SECTION (WITH VETERINARY CLINICAL VISUAL) -->
    <section class="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-slate-200/60">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          <!-- Hero Text Column (7 Cols on desktop) -->
          <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide shadow-xs">
              <span class="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              <span>Platform Komputasi Klinis & Formularium Veteriner Indonesia</span>
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Presisi Dosis Pasien Hewan, Standarisasi Peresepan, dan Mitigasi Resistensi Antimikroba
            </h1>

            <p class="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Platform komputasi farmakologi veteriner berbasis <b>BSAVA Small Animal Formulary 10th Edition</b> & <b>Plumb's</b>. Dilengkapi kalkulator dosis otomatis per kgBB, meja peracikan pulveres/kapsul (d.t.d.), algoritma 4 tahap penulisan resep, dan mitigasi resistensi antimikroba (AMR).
            </p>

            <!-- CTA Buttons -->
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
            </div>

            <div class="flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500 pt-1">
              <i class="ph-bold ph-shield-check text-teal-600 text-base"></i>
              <span>Formularium tervalidasi untuk dokter hewan praktisi (SIP/SNT) & mahasiswa profesi kedokteran hewan</span>
            </div>

          </div>

          <!-- Hero Image & Interactive Badge Column (5 Cols on desktop) -->
          <div class="lg:col-span-5 relative">
            <div class="relative mx-auto max-w-md lg:max-w-none">
              
              <!-- Glow backdrop decoration -->
              <div class="absolute -inset-2 bg-gradient-to-tr from-teal-500/20 to-emerald-400/20 rounded-3xl blur-xl"></div>
              
              <!-- Main Hero Image -->
              <div class="relative rounded-3xl overflow-hidden border-2 border-slate-200/80 shadow-2xl bg-white">
                <img 
                  src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80" 
                  alt="Pemeriksaan klinis pasien hewan di meja praktik veteriner" 
                  class="w-full h-80 sm:h-96 object-cover hover:scale-105 transition duration-500"
                  loading="eager"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div class="absolute bottom-4 left-4 right-4 text-white">
                  <div class="flex items-center gap-2 text-xs font-bold text-teal-300 mb-1">
                    <i class="ph-bold ph-activity text-sm"></i>
                    <span>Praktik Klinis Pasien Kecil & Eksotik</span>
                  </div>
                  <p class="text-xs text-slate-200">Perhitungan dosis presisi per kgBB aktual mencegah kegagalan terapi dan toksisitas organ.</p>
                </div>
              </div>

              <!-- Floating Live Badge 1 (Top Left) -->
              <div class="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/90 text-xs space-y-1 hidden sm:block max-w-[220px]">
                <div class="flex items-center gap-1.5 text-teal-700 font-bold">
                  <i class="ph-bold ph-check-circle text-base"></i>
                  <span>Dosis Terkomputasi</span>
                </div>
                <div class="text-[11px] text-slate-700 font-mono font-semibold">
                  Amoxicillin 15 mg/kg &bull; s.2.dd
                </div>
                <div class="text-[10px] text-slate-400">Canine 10 kg &rarr; 150 mg per adm</div>
              </div>

              <!-- Floating Live Badge 2 (Bottom Right) -->
              <div class="absolute -bottom-4 -right-4 sm:-right-6 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs text-white space-y-1 hidden sm:block max-w-[210px]">
                <div class="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <i class="ph-bold ph-shield-star text-base"></i>
                  <span>BSAVA & Plumb's</span>
                </div>
                <div class="text-[11px] text-slate-300">
                  433 Monograf Terverifikasi
                </div>
                <div class="text-[10px] text-slate-400">Bilingual Indonesia & Inggris</div>
              </div>

            </div>
          </div>

        </div>

        <!-- Metrics Grid -->
        <div class="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1 hover:border-teal-300 transition">
            <div class="text-2xl sm:text-3xl font-extrabold text-teal-700">433+</div>
            <div class="text-xs font-bold text-slate-800">Monograf Obat Lengkap</div>
            <div class="text-[11px] text-slate-500">Bilingual Indonesia & Inggris</div>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1 hover:border-teal-300 transition">
            <div class="text-2xl sm:text-3xl font-extrabold text-teal-700">100%</div>
            <div class="text-xs font-bold text-slate-800">Khusus Hewan Kecil</div>
            <div class="text-[11px] text-slate-500">Kucing & Anjing (Fisiologi Khusus)</div>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1 hover:border-teal-300 transition">
            <div class="text-2xl sm:text-3xl font-extrabold text-teal-700">2 Mode</div>
            <div class="text-xs font-bold text-slate-800">Meja Formula Racikan</div>
            <div class="text-[11px] text-slate-500">Dengan d.t.d. & Tanpa d.t.d.</div>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1 hover:border-teal-300 transition">
            <div class="text-2xl sm:text-3xl font-extrabold text-emerald-600">Rp 0</div>
            <div class="text-xs font-bold text-slate-800">Fase Prototyping</div>
            <div class="text-[11px] text-slate-500">Akses Terbuka & Gratis</div>
          </div>
        </div>

      </div>
    </section>

    <!-- 3. SECTION 1: URGENSI KENAPA HARUS ADA WEBSITE KATALOG OBAT HEWAN -->
    <section id="urgensi" class="py-16 lg:py-24 bg-white border-b border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        <div class="max-w-3xl mx-auto text-center space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <i class="ph-bold ph-shield-warning text-sm"></i>
            <span>Urgensi Klinis & Keselamatan Pasien</span>
          </div>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Mengapa Praktik Kedokteran Hewan Membutuhkan Formularium Digital Terpadu?
          </h2>
          <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
            Kompleksitas farmakoterapi veteriner tidak dapat disamakan dengan manusia. Keterbatasan waktu di meja praktik, disparitas metabolisme spesies, dan risiko toksisitas fatal menuntut hadirnya sistem referensi komputasi yang cepat, tepat, dan terverifikasi.
          </p>
        </div>

        <!-- Visual Highlight: Emergency Veterinary Care Banner -->
        <div class="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 text-white grid grid-cols-1 md:grid-cols-12 items-center">
          <div class="md:col-span-5 h-60 md:h-full relative">
            <img 
              src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80" 
              alt="Pasien anjing dalam perawatan darurat klinik hewan" 
              class="w-full h-full object-cover"
              loading="lazy"
            >
            <div class="absolute inset-0 bg-teal-900/20 mix-blend-multiply"></div>
          </div>
          <div class="md:col-span-7 p-6 sm:p-8 space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-800">
              Situasi Nyata di Meja Praktik
            </span>
            <h3 class="text-lg sm:text-xl font-bold text-white">
              Ketika 0.1 mL dan Detik Waktu Menentukan Nyawa Pasien
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Di tengah antrean pasien yang padat dan situasi gawat darurat (kejang, syok, trauma), membuka buku cetak setebal 1.500 halaman sangat tidak realistis. Dokter hewan memerlukan akses digital berkecepatan tinggi dengan validasi ganda untuk memastikan keselamatan setiap resep.
            </p>
          </div>
        </div>

        <!-- 4 Pillars Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          <!-- Pillar 1 -->
          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-md transition space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold shadow-xs">
              <i class="ph-bold ph-alarm"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900">
              1. Keterbatasan Waktu di Situasi Gawat Darurat (Time-Critical Emergencies)
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Saat pasien anjing atau kucing tiba di klinik dengan kondisi darurat seperti <i>status epilepticus</i>, syok anafilaksis, intoksikasi insektisida, atau edema paru kardiogenik, dokter hewan harus bertindak dalam hitungan detik. Membolak-balik indeks buku cetak setebal 1.000–1.500 halaman (BSAVA atau Plumb's) sangat memakan waktu. Akses digital instan dengan pencarian kurang dari 1 detik menjadi penentu keselamatan hidup pasien.
            </p>
          </div>

          <!-- Pillar 2 -->
          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-md transition space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl font-bold shadow-xs">
              <i class="ph-bold ph-dna"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900">
              2. Keunikan Fisiologi & Metabolisme Antar-Spesies yang Ekstrem
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Hewan bukan sekadar manusia versi mini, dan anjing bukanlah kucing besar. Jalur biotransformasi hepar dan ekskresi ginjal sangat berbeda:
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><b>Kucing:</b> Mengalami defisiensi enzim hepar <i>glucuronyl transferase</i> (UGT1A6). Paracetamol (asetaminofen) bersifat letal karena memicu methemoglobinemia, sianosis, dan nekrosis hepar masif.</li>
              <li><b>Anjing:</b> Ras tertentu (Collie, Australian Shepherd, Whippet) memiliki mutasi genetik <i>ABCB1/MDR1</i>, menyebabkan rusaknya sawar darah otak terhadap Ivermectin, Loperamide, dan Selamectin yang berujung neurotoksisitas fatal.</li>
            </ul>
          </div>

          <!-- Pillar 3 -->
          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-md transition space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold shadow-xs">
              <i class="ph-bold ph-pill"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900">
              3. Realitas Penggunaan Sediaan Manusia (Human-Labeled Extra-Label Drugs)
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Lebih dari 60% obat yang diresepkan di klinik hewan kecil Indonesia adalah sediaan farmasi manusia (<i>extra-label drug use</i>) akibat belum tersedianya sediaan khusus veteriner. Tablet manusia 500 mg untuk dewasa 60 kg harus dibagi atau diracik untuk anak anjing 1 kg atau kucing 2.5 kg. Menghitung pecahan desimal mikro secara manual memiliki risiko kesalahan perhitungan hingga 10x lipat (<i>tenfold dosing error</i>).
            </p>
          </div>

          <!-- Pillar 4 -->
          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-md transition space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold shadow-xs">
              <i class="ph-bold ph-translate"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900">
              4. Ketiadaan Standarisasi Digital Berbahasa Indonesia
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Seluruh pedoman veteriner terakreditasi internasional disusun dalam bahasa Inggris dengan merk dagang yang tidak beredar di Indonesia. Hal ini menyulitkan dokter hewan muda, koas, dan paramedis dalam menyesuaikan rekomendasi ilmiah global dengan sediaan riil yang beredar di pasar lokal. Platform ini menjembatani gap tersebut dengan data monograf bilingual dan panduan praktis.
            </p>
          </div>

        </div>

        <!-- Comparison Table: Buku Manual Cetak vs Katalog Obat Hewan Digital -->
        <div class="max-w-5xl mx-auto bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5">
          <div class="text-center space-y-1">
            <h4 class="text-base sm:text-lg font-bold text-slate-900">Perbandingan Efisiensi Klinis</h4>
            <p class="text-xs text-slate-500">Buku Manual Cetak Konvensional vs Platform Katalog Obat Hewan Digital</p>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead>
                <tr class="border-b border-slate-300/80 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th class="py-2.5 px-3">Parameter Klinis</th>
                  <th class="py-2.5 px-3 text-rose-700 bg-rose-50/50 rounded-l-xl">Buku Manual Cetak (Plumb's / BSAVA)</th>
                  <th class="py-2.5 px-3 text-teal-800 bg-teal-50 rounded-r-xl">Katalog Obat Hewan Digital</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td class="py-3 px-3 font-semibold">Kecepatan Akses Informasi</td>
                  <td class="py-3 px-3 text-rose-700">Lambat (3–5 menit mencari indeks manual)</td>
                  <td class="py-3 px-3 text-teal-700 font-bold">Instan (&lt; 1 detik dengan pencarian cerdas)</td>
                </tr>
                <tr>
                  <td class="py-3 px-3 font-semibold">Perhitungan Dosis Pasien</td>
                  <td class="py-3 px-3 text-rose-700">Manual (kalkulator fisik, risiko salah desimal)</td>
                  <td class="py-3 px-3 text-teal-700 font-bold">Otomatis per kg/lbs aktual pasien</td>
                </tr>
                <tr>
                  <td class="py-3 px-3 font-semibold">Peracikan Kapsul/Puyer (d.t.d.)</td>
                  <td class="py-3 px-3 text-rose-700">Rumus manual bertingkat, rawan salah gerus</td>
                  <td class="py-3 px-3 text-teal-700 font-bold">Meja komputasi d.t.d. & non-d.t.d. terintegrasi</td>
                </tr>
                <tr>
                  <td class="py-3 px-3 font-semibold">Peringatan Bahaya Spesies</td>
                  <td class="py-3 px-3 text-rose-700">Harus membaca teks monograf panjang</td>
                  <td class="py-3 px-3 text-teal-700 font-bold">Alert otomatis muncul saat memilih spesies</td>
                </tr>
                <tr>
                  <td class="py-3 px-3 font-semibold">Bahasa & Sediaan Lokal</td>
                  <td class="py-3 px-3 text-rose-700">Bahasa Inggris murni & merk luar negeri</td>
                  <td class="py-3 px-3 text-teal-700 font-bold">Bilingual Indonesia/Inggris & sediaan klinik riil</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>

    <!-- 4. SECTION 2: FITUR-FITUR LENGKAP -->
    <section id="fitur" class="py-16 lg:py-24 bg-slate-50/80 border-b border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        <div class="max-w-3xl mx-auto text-center space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <i class="ph-bold ph-squares-four text-sm"></i>
            <span>Fitur Komprehensif</span>
          </div>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Enam Pilar Fitur Cerdas untuk Dokter Hewan Praktisi
          </h2>
          <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
            Dirancang secara spesifik mengikuti alur kerja dokter hewan berizin praktik (SIP/SNT), mulai dari diagnosis, penentuan dosis, peracikan, hingga penulisan lembar resep resmi.
          </p>
        </div>

        <!-- 6 Feature Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          <!-- Fitur 1 -->
          <div class="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl font-bold shadow-xs">
              <i class="ph-bold ph-book-open"></i>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">Monograf Terverifikasi</span>
              <h3 class="text-base font-bold text-slate-900 mt-2">Direktori 430+ Monograf Obat Hewan</h3>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Standar BSAVA 10th Ed & Plumb's dengan fitur bilingual instan (Indonesia 🇮🇩 & Inggris 🇬🇧). Meliputi mekanisme kerja, indikasi rinci anjing & kucing, rentang dosis per indikasi, kontraindikasi, efek samping, dan parameter pemantauan klinis.
            </p>
          </div>

          <!-- Fitur 2 -->
          <div class="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl font-bold shadow-xs">
              <i class="ph-bold ph-calculator"></i>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">Komputasi Presisi</span>
              <h3 class="text-base font-bold text-slate-900 mt-2">Kalkulator Dosis Pasien Otomatis</h3>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Mendukung satuan kg dan lbs dengan konversi instan. Menghitung dosis per pemberian, dosis harian, serta konversi otomatis ke sediaan riil (pecahan tablet, mililiter sirup, atau volume injeksi). Dilengkapi <i>Safety Alerts</i> kontraindikasi spesies.
            </p>
          </div>

          <!-- Fitur 3 -->
          <div class="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl font-bold shadow-xs">
              <i class="ph-bold ph-flask"></i>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">Peracikan Farmasi</span>
              <h3 class="text-base font-bold text-slate-900 mt-2">Veterinary Compounding Desk</h3>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Meja kalkulasi peracikan pulveres atau kapsul dengan dua aturan farmakope resmi: <b>Dengan d.t.d.</b> (<i>da tales doses</i>) untuk dosis per bungkus, dan <b>Tanpa d.t.d.</b> untuk pembagian dosis total. Menghitung pembulatan tablet stok rasional secara otomatis.
            </p>
          </div>

          <!-- Fitur 4 -->
          <div class="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl font-bold shadow-xs">
              <i class="ph-bold ph-list-numbers"></i>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Alur Praktik SIP</span>
              <h3 class="text-base font-bold text-slate-900 mt-2">Algoritma 4 Tahap & Template Klinis</h3>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Panduan alur penulisan resep resmi: (1) Diagnosis & Dosis, (2) Pemilihan BSO & Rute, (3) Perhitungan Kebutuhan Total, (4) Format Resep Standar. Termasuk preset resep cepat untuk gastroenteritis, otitis, dermatitis, dsb. yang dapat diedit dan disimpan.
            </p>
          </div>

          <!-- Fitur 5 -->
          <div class="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-bold shadow-xs">
              <i class="ph-bold ph-translate"></i>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Standarisasi Resep</span>
              <h3 class="text-base font-bold text-slate-900 mt-2">Database 79+ Terminologi Latin Resep</h3>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Kamus interaktif singkatan resep dokter hewan (s.2.dd, p.r.n., a.c., p.c., d.t.d., m.f.l.a., iter, dll.) lengkap dengan kepanjangan bahasa Latin, terjemahan Indonesia/Inggris, etimologi farmasi, dan panduan klinis penggunaannya.
            </p>
          </div>

          <!-- Fitur 6 -->
          <div class="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center text-2xl font-bold shadow-xs">
              <i class="ph-bold ph-receipt"></i>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">Dokumentasi Terapi</span>
              <h3 class="text-base font-bold text-slate-900 mt-2">Generator E-Resep & Histori Terapi</h3>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Keranjang resep terintegrasi yang menghasilkan lembar e-resep resmi dokter hewan ber-SIP siap cetak (<i>print-ready slip</i>) atau salin cepat ke Rekam Medis Elektronik (RME), beserta pencatatan riwayat pembuatan obat pasien terdahulu.
            </p>
          </div>

        </div>

        <!-- Pharmacy Preparation Visual Showcase -->
        <div class="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <img 
            src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80" 
            alt="Sediaan farmakologi dan obat tablet veteriner" 
            class="w-full md:w-56 h-44 object-cover rounded-2xl shadow-xs"
            loading="lazy"
          >
          <div class="space-y-2">
            <span class="text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              Integrasi Farmakope Veteriner
            </span>
            <h4 class="text-base font-bold text-slate-900">Dari Perhitungan Presisi Hingga Sediaan Siap Konsumsi</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Katalog Obat Hewan memperhitungkan ketersediaan sediaan komersial nyata di apotek klinik (misal tablet 250mg, 500mg, sirup 125mg/5mL, atau vial injeksi) sehingga dokter hewan tidak perlu lagi mengira-ngira fraksi pecahan tablet yang aman untuk diberikan.
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- 5. SECTION 3: PENTINGNYA PEMBERIAN OBAT YANG TEPAT DOSIS -->
    <section id="dosis" class="py-16 lg:py-24 bg-white border-b border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        <div class="max-w-3xl mx-auto text-center space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <i class="ph-bold ph-scales text-sm"></i>
            <span>Farmakologi Klinis Presisi</span>
          </div>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Akurasi Dosis: Garis Tipis Antara Kesembuhan dan Toksisitas Fatal
          </h2>
          <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
            Hewan memiliki rentang toleransi terapeutik yang jauh lebih sempit dibanding manusia. Perhitungan miligram per kilogram berat badan aktual bukan sekadar formalitas matematis, melainkan batas keselamatan hidup pasien.
          </p>
        </div>

        <!-- Visual Infographic: Jendela Terapeutik (Therapeutic Window) -->
        <div class="max-w-5xl mx-auto bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2.5 py-0.5 rounded-md border border-teal-800">
                Konsep Farmakologi
              </span>
              <h3 class="text-lg font-bold text-white mt-1">Jendela Terapeutik Sempit pada Pasien Veteriner</h3>
            </div>
            <div class="text-xs text-slate-400">
              Rentang Konsentrasi Plasma Obat
            </div>
          </div>

          <!-- Infographic Spectrum Bar -->
          <div class="space-y-2">
            <div class="grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <div class="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300">
                <span class="block text-sm font-extrabold">ZONA TOKSIK (OVERDOSE)</span>
                <span class="text-[10px] font-normal text-rose-200">Gagal Ginjal Akut &bull; Nekrosis Hepar</span>
              </div>
              <div class="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300">
                <span class="block text-sm font-extrabold">JENDELA TERAPEUTIK</span>
                <span class="text-[10px] font-normal text-emerald-200">Efektif Mematikan Patogen / Sembuh</span>
              </div>
              <div class="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-300">
                <span class="block text-sm font-extrabold">ZONA SUBTERAPEUTIK</span>
                <span class="text-[10px] font-normal text-amber-200">Gagal Terapi &bull; Seleksi Mutan AMR</span>
              </div>
            </div>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed text-center sm:text-left">
            Kalkulator dosis otomatis di Katalog Obat Hewan memastikan obat berada tepat di dalam <b>Jendela Terapeutik</b>, menghindari zona merah toksik akibat sediaan manusia yang terlalu pekat dan zona kuning subterapeutik akibat taksiran kasar.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          <!-- Point 1 -->
          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
              1
            </div>
            <h3 class="text-base font-bold text-slate-900">
              Indeks Terapeutik Sempit pada Pasien Hewan Kecil
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              Pada pasien anak anjing, anak kucing, atau ras miniatur (1–3 kg), volume distribusi cairan tubuh (<i>Vd</i>) sangat terbatas. Selisih volume sekecil <b>0.1 mL</b> pada obat inotropik (Pimobendan, Digoxin), anestetika (Ketamine, Propofol), sedativa (Xylazine), atau kemoterapi setara dengan deviasi dosis <b>20–30%</b>, yang dapat memicu aritmia fatal, henti napas mendadak, atau hipotensi refrakter.
            </p>
          </div>

          <!-- Point 2 -->
          <div class="p-6 rounded-3xl bg-rose-50/60 border border-rose-200 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xl">
              2
            </div>
            <h3 class="text-base font-bold text-slate-900">
              Bahaya Overdosing (Kerusakan Organ Permanen)
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              Kelebihan dosis memicu konsekuensi patologis berat yang sering kali ireversibel:
            </p>
            <ul class="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li><b>NSAID (Meloxicam, Carprofen):</b> Mengikis mukosa lambung hingga perforasi dan menyebabkan gagal ginjal akut (<i>acute kidney injury</i>).</li>
              <li><b>Aminoglikosida (Gentamicin):</b> Merusak tubulus proksimal ginjal dan sel rambut koklea (nefrotoksisitas & ototoksisitas permanen).</li>
              <li><b>Kortikosteroid:</b> Dosis berlebih memicu <i>iatrogenic Cushing's</i>, supresi imun fatal, dan sepsis sekunder.</li>
            </ul>
          </div>

          <!-- Point 3 -->
          <div class="p-6 rounded-3xl bg-amber-50/60 border border-amber-200 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
              3
            </div>
            <h3 class="text-base font-bold text-slate-900">
              Bahaya Underdosing (Kegagalan Terapi & Kejang)
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              Dosis yang terlalu rendah gagal mencapai <i>Minimum Inhibitory Concentration</i> (MIC) pada infeksi bakteri, menyebabkan infeksi berlanjut menjadi sepsis. Pada antikonvulsan (Phenobarbital, Levetiracetam), dosis subterapeutik gagal menstabilkan membran saraf, memicu serangan kejang berulang (<i>status epilepticus</i>) yang menyebabkan kerusakan otak permanen.
            </p>
          </div>

        </div>

      </div>
    </section>

    <!-- 6. SECTION 4: BAHAYA & MITIGASI ANTIMICROBIAL RESISTANCE (AMR) -->
    <section id="amr" class="py-16 lg:py-24 bg-slate-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        <div class="max-w-3xl mx-auto text-center space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <i class="ph-bold ph-biohazard text-sm"></i>
            <span>One Health Global Threat</span>
          </div>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Mitigasi Resistensi Antimikroba (AMR): Peran Krusial Dokter Hewan dalam Paradigma One Health
          </h2>
          <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
            Krisis resistensi antimikroba bukan hanya ancaman medis manusia, melainkan bahaya zoonotik global yang berhulu dari peresepan antibiotik yang tidak tepat di sektor kesehatan hewan.
          </p>
        </div>

        <!-- One Health Infographic Diagram & Microbiology Image -->
        <div class="max-w-5xl mx-auto rounded-3xl bg-slate-800/90 border border-slate-700 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Diagram Triad SVG -->
          <div class="lg:col-span-7 space-y-4">
            <span class="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2.5 py-1 rounded-md border border-teal-800">
              Konsep Triad One Health
            </span>
            <h3 class="text-lg sm:text-xl font-bold text-white">
              Transmisi Zoonotik Superbugs Antara Hewan, Manusia, dan Lingkungan
            </h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Bakteri super resisten seperti <i>Methicillin-Resistant Staphylococcus pseudintermedius</i> (MRSP) pada anjing/kucing dan <i>ESBL-producing Enterobacteriaceae</i> dapat berpindah bolak-balik antara hewan kesayangan dan pemiliknya melalui kontak fisik dan air liur.
            </p>

            <div class="grid grid-cols-3 gap-2.5 pt-2 text-center text-xs">
              <div class="p-3 rounded-2xl bg-slate-900 border border-slate-700 space-y-1">
                <i class="ph-bold ph-paw-print text-xl text-teal-400"></i>
                <div class="font-bold text-slate-200">Hewan</div>
                <div class="text-[10px] text-slate-400">Pet & Ternak</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-900 border border-slate-700 space-y-1">
                <i class="ph-bold ph-user text-xl text-blue-400"></i>
                <div class="font-bold text-slate-200">Manusia</div>
                <div class="text-[10px] text-slate-400">Keluarga & Vet</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-900 border border-slate-700 space-y-1">
                <i class="ph-bold ph-plant text-xl text-emerald-400"></i>
                <div class="font-bold text-slate-200">Lingkungan</div>
                <div class="text-[10px] text-slate-400">Klinik & Rumah</div>
              </div>
            </div>
          </div>

          <!-- Microbiology Lab Visual -->
          <div class="lg:col-span-5 h-64 lg:h-full rounded-2xl overflow-hidden border border-slate-700 relative">
            <img 
              src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80" 
              alt="Uji mikrobiologi kultur bakteri resisten antibiotik" 
              class="w-full h-full object-cover"
              loading="lazy"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
            <div class="absolute bottom-3 left-3 right-3 text-[11px] text-slate-300">
              <span class="font-bold text-rose-400 block">Kultur & Sensitivitas (Uji MIC):</span>
              Dosis subterapeutik memicu mutasi bakteri menjadi galur kebal.
            </div>
          </div>

        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          <!-- AMR Card 1 -->
          <div class="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl">
              <i class="ph-bold ph-warning-octagon"></i>
            </div>
            <h3 class="text-base font-bold text-white">
              Bahaya Dosis Subterapeutik & Overprescribing
            </h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Memberikan antibiotik spektrum luas (seperti Cefovecin atau Fluorokuinolon) untuk infeksi virus non-spesifik, atau memberikan dosis subterapeutik akibat penimbangan berat badan yang keliru, menciptakan <b>tekanan seleksi mutan (selective pressure)</b>. Bakteri yang tidak terbunuh sempurna akan bermutasi, mempertebal dinding sel, atau membentuk pompa efluks yang membuat mereka kebal permanen.
            </p>
          </div>

          <!-- AMR Card 2 -->
          <div class="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xl">
              <i class="ph-bold ph-check-square-offset"></i>
            </div>
            <h3 class="text-base font-bold text-white">
              Prinsip 6 Tepat Stewardship Antimikroba Veteriner
            </h3>
            <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li><b>1. Tepat Indikasi:</b> Hanya berikan jika terbukti infeksi bakteri (bukan viral/alergi).</li>
              <li><b>2. Tepat Pasien & Spesies:</b> Pertimbangkan fungsi hepar, ginjal, dan kontraindikasi spesies.</li>
              <li><b>3. Tepat Pilihan Obat:</b> Prioritaskan antibiotik lini pertama spektrum sempit.</li>
              <li><b>4. Tepat Dosis:</b> Hitung presisi per kgBB aktual agar melampaui batas MIC bakteri.</li>
              <li><b>5. Tepat Sediaan & Rute:</b> Pastikan bioavailabilitas optimal di lokasi target infeksi.</li>
              <li><b>6. Tepat Durasi & Frekuensi:</b> Tuntaskan siklus terapi tanpa henti dini.</li>
            </ul>
          </div>

        </div>

      </div>
    </section>

    <!-- 7. SECTION 5: PRICING & KONTAK PENGEMBANG -->
    <section id="pricing" class="py-16 lg:py-24 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div class="max-w-3xl mx-auto text-center space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <i class="ph-bold ph-tag text-sm"></i>
            <span>Akses & Dukungan Komunitas</span>
          </div>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Fase Prototyping Terbuka: 100% Gratis untuk Komunitas Kedokteran Hewan
          </h2>
          <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
            Aplikasi ini didedikasikan untuk kemajuan dan keselamatan terapi kedokteran hewan di Indonesia. Seluruh fitur dapat diakses secara gratis selama fase uji coba terbuka ini.
          </p>
        </div>

        <!-- Featured Pricing Card -->
        <div class="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border-2 border-teal-600 shadow-xl space-y-8 relative overflow-hidden">
          <div class="absolute -right-12 -top-12 w-40 h-40 bg-teal-50 rounded-full pointer-events-none"></div>
          
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
            <div>
              <span class="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Fase Prototyping & Validasi Klinis
              </span>
              <h3 class="text-2xl font-extrabold text-slate-900 mt-2">Akses Penuh Dokter Hewan</h3>
              <p class="text-xs text-slate-500 mt-1">Seluruh modul monograf, kalkulator, peracikan, dan resep aktif.</p>
            </div>
            <div class="text-left sm:text-right">
              <div class="text-4xl font-black text-slate-900">Rp 0</div>
              <div class="text-xs font-bold text-emerald-600">100% Gratis Selama Prototyping</div>
            </div>
          </div>

          <!-- Feature List -->
          <div class="space-y-3">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Fitur yang Termasuk:</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 font-medium">
              <div class="flex items-center gap-2">
                <i class="ph-bold ph-check text-teal-600 text-sm"></i>
                <span>433+ Monograf Obat Lengkap</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="ph-bold ph-check text-teal-600 text-sm"></i>
                <span>Bilingual Indonesia & Inggris</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="ph-bold ph-check text-teal-600 text-sm"></i>
                <span>Kalkulator Dosis Otomatis (kg/lbs)</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="ph-bold ph-check text-teal-600 text-sm"></i>
                <span>Meja Racikan d.t.d. & Non-d.t.d.</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="ph-bold ph-check text-teal-600 text-sm"></i>
                <span>Algoritma 4 Tahap & Template Klinis</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="ph-bold ph-check text-teal-600 text-sm"></i>
                <span>79+ Glosarium Terminologi Latin</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="ph-bold ph-check text-teal-600 text-sm"></i>
                <span>Generator E-Resep Siap Cetak</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="ph-bold ph-check text-teal-600 text-sm"></i>
                <span>Histori Peracikan & Pembuatan Obat</span>
              </div>
            </div>
          </div>

          <!-- Dual CTAs -->
          <div class="pt-4 border-t border-slate-100 space-y-3">
            <!-- Login CTA (No plain text credentials) -->
            <button 
              type="button" 
              class="btn-open-login-modal w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
            >
              <i class="ph-bold ph-key text-base"></i>
              <span>Masuk / Akses Aplikasi</span>
            </button>

            <!-- WhatsApp CTA -->
            <a 
              href="https://wa.me/6289654043714?text=Halo%20Pengembang%20Katalog%20Obat%20Hewan,%20saya%20tertarik%20dengan%20aplikasi%20ini%20dan%20ingin%20berdiskusi..." 
              target="_blank" 
              rel="noopener noreferrer" 
              class="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <i class="ph-bold ph-whatsapp-logo text-lg"></i>
              <span>Klik Di Sini untuk Menghubungi Pengembang (+62 896 5404 3714)</span>
            </a>
          </div>

          <!-- Note Callout -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <i class="ph-bold ph-chats-circle text-teal-600"></i>
              Saran & Umpan Balik Klinis:
            </div>
            <p>
              Apakah Anda menemukan dosis yang perlu disesuaikan, ingin menambahkan data sediaan obat lokal, atau mengusulkan fitur kalkulator baru? Silakan hubungi langsung pengembang melalui tombol WhatsApp di atas.
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- 8. FOOTER -->
    <footer class="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <i class="ph-bold ph-paw-print text-2xl"></i>
            </div>
            <div>
              <span class="font-bold text-white text-base">Katalog Obat Hewan</span>
              <p class="text-xs text-slate-500">Platform Formularium & Komputasi Klinis Dokter Hewan Indonesia</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-5 text-xs font-semibold">
            <a href="#urgensi" class="hover:text-white transition">Urgensi</a>
            <a href="#fitur" class="hover:text-white transition">Fitur</a>
            <a href="#dosis" class="hover:text-white transition">Dosis Presisi</a>
            <a href="#amr" class="hover:text-white transition">Bahaya AMR</a>
            <a href="#pricing" class="hover:text-white transition">Pricing</a>
            <a 
              href="https://wa.me/6289654043714" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <i class="ph-bold ph-whatsapp-logo"></i>
              <span>WhatsApp Developer (+62 896 5404 3714)</span>
            </a>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-2 leading-relaxed">
          <p>
            <b>Disclaimer Medis Veteriner:</b> Aplikasi ini dikembangkan sebagai alat bantu komputasi klinis dan referensi ilmiah bagi dokter hewan berizin praktik (SIP/SNT) serta tenaga medis veteriner terakreditasi. Keputusan terapeutik akhir selalu berada di tangan dokter hewan pemeriksa berdasarkan penilaian klinis langsung pada pasien.
          </p>
          <p>
            &copy; 2026 Katalog Obat Hewan. All rights reserved. Berbasis standar BSAVA Small Animal Formulary & Plumb's Veterinary Drug Handbook.
          </p>
        </div>
      </div>
    </footer>

  </div>
  <!-- /LANDING PAGE ROOT -->`;

// 2. New Login Modal HTML with hidden credentials
const updatedLoginModalHtml = `  <!-- ========================================== -->
  <!-- MODAL: LOGIN / AUTHENTICATION (PROTOTYPING)-->
  <!-- ========================================== -->
  <div id="modal-auth-login" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
      <!-- Modal Header -->
      <div class="px-6 py-5 bg-gradient-to-r from-teal-800 to-teal-700 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-600/80 flex items-center justify-center text-white shadow-inner">
            <i class="ph-bold ph-lock-key text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-base">Masuk ke Katalog Obat Hewan</h3>
            <p class="text-xs text-teal-100">Autentikasi Akses Dokter Hewan</p>
          </div>
        </div>
        <button type="button" id="btn-close-login-modal" class="text-teal-200 hover:text-white p-1 rounded-lg hover:bg-teal-600/50 transition">
          <i class="ph-bold ph-x text-lg"></i>
        </button>
      </div>

      <!-- Modal Body Form -->
      <form id="form-auth-login" class="p-6 space-y-5">
        
        <!-- Info Akses (No plain text credentials) -->
        <div class="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
          <i class="ph-bold ph-info text-teal-700 text-base shrink-0 mt-0.5"></i>
          <div class="leading-relaxed">
            Silakan masukkan kredensial akun Anda untuk membuka akses penuh formularium, kalkulator dosis, dan meja racikan obat.
          </div>
        </div>

        <!-- Error Alert -->
        <div id="login-error-msg" class="hidden p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <i class="ph-bold ph-warning-circle text-base text-rose-600 shrink-0 mt-0.5"></i>
          <div>
            <b>Autentikasi Gagal:</b> Username atau password yang Anda masukkan tidak sesuai. Silakan periksa kembali atau hubungi pengembang.
          </div>
        </div>

        <!-- Username Input -->
        <div class="space-y-1.5">
          <label for="login-username" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Username <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <i class="ph ph-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
            <input 
              type="text" 
              id="login-username" 
              name="username" 
              required 
              autocomplete="username"
              placeholder="Masukkan username..." 
              class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 text-sm"
            >
          </div>
        </div>

        <!-- Password Input -->
        <div class="space-y-1.5">
          <label for="login-password" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Password <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <i class="ph ph-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
            <input 
              type="password" 
              id="login-password" 
              name="password" 
              required 
              autocomplete="current-password"
              placeholder="••••••••" 
              class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 text-sm"
            >
            <button 
              type="button" 
              id="btn-toggle-password-visibility" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title="Lihat / Sembunyikan Password"
            >
              <i class="ph ph-eye text-base" id="icon-toggle-password"></i>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-2 space-y-2">
          <button 
            type="submit" 
            class="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
          >
            <i class="ph-bold ph-sign-in text-base"></i>
            <span>Masuk ke Aplikasi Lengkap</span>
          </button>
          
          <button 
            type="button" 
            id="btn-cancel-login-modal" 
            class="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition"
          >
            Batal
          </button>
        </div>

        <div class="pt-2 border-t border-slate-100 text-center">
          <a 
            href="https://wa.me/6289654043714?text=Halo%20Developer%20Katalog%20Obat%20Hewan,%20saya%20ingin%20meminta%20akses%20akun%20uji%20coba..." 
            target="_blank" 
            rel="noopener noreferrer" 
            class="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
          >
            <i class="ph-bold ph-whatsapp-logo"></i>
            <span>Butuh akses? Hubungi Developer WhatsApp (+62 896 5404 3714)</span>
          </a>
        </div>
      </form>
    </div>
  </div>`;

// 3. Replace old landing page root with updated one
const landingRootStart = html.indexOf('<div id="landing-page-root"');
const landingRootEnd = html.indexOf('<!-- /LANDING PAGE ROOT -->') + '<!-- /LANDING PAGE ROOT -->'.length;

if (landingRootStart !== -1 && landingRootEnd !== -1) {
  html = html.substring(0, landingRootStart) + updatedLandingPageHtml + html.substring(landingRootEnd);
  console.log('Replaced landing-page-root section successfully.');
} else {
  console.error('Could not locate landing-page-root tags.');
  process.exit(1);
}

// 4. Replace old modal-auth-login with updated one
const modalStart = html.indexOf('<!-- ========================================== -->\n  <!-- MODAL: LOGIN / AUTHENTICATION (PROTOTYPING)-->');
const modalEndMarker = '<!-- 1. "Learn More" Comprehensive Drug Monograph Modal -->';
const modalEnd = html.indexOf(modalEndMarker);

if (modalStart !== -1 && modalEnd !== -1) {
  html = html.substring(0, modalStart) + updatedLoginModalHtml + '\n\n  ' + html.substring(modalEnd);
  console.log('Replaced modal-auth-login section successfully.');
} else {
  console.error('Could not locate modal-auth-login tags.');
  process.exit(1);
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('public/index.html updated successfully with images and hidden credentials!');
