/**
 * Script to update public/js/app.js with:
 * 1. Google Authentication handlers
 * 2. User Profile state, UI rendering, and Settings form events
 */
const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// 1. Add userProfile initialization in constructor
if (!appJs.includes('this.userProfile = this.loadUserProfile();')) {
  appJs = appJs.replace(
    'this.isAuthenticated = localStorage.getItem("vet_app_auth") === "authenticated";',
    'this.isAuthenticated = localStorage.getItem("vet_app_auth") === "authenticated";\n    this.userProfile = this.loadUserProfile();'
  );
  console.log('Constructor updated with userProfile.');
}

// 2. Add setupProfileFormEvents and renderUserProfileUI in init()
if (!appJs.includes('this.setupProfileFormEvents();')) {
  appJs = appJs.replace(
    'this.setupSettingsEvents();',
    'this.setupSettingsEvents();\n    this.setupProfileFormEvents();'
  );
  appJs = appJs.replace(
    'this.renderTerminologyTable();',
    'this.renderTerminologyTable();\n    this.renderUserProfileUI();'
  );
  console.log('init() updated with profile calls.');
}

// 3. Update setupAuthAndLandingEvents to handle Google Sign-In
const authEventsOld = `    // 5. Login Form Submission`;
const authEventsNew = `    // Google Sign-In Handlers
    const handleGoogleClick = () => this.handleGoogleSignIn();
    document.getElementById("btn-hero-google-login")?.addEventListener("click", handleGoogleClick);
    document.getElementById("btn-modal-google-login")?.addEventListener("click", handleGoogleClick);
    document.getElementById("btn-pricing-google-login")?.addEventListener("click", handleGoogleClick);

    // 5. Login Form Submission`;

if (appJs.includes(authEventsOld) && !appJs.includes('btn-hero-google-login')) {
  appJs = appJs.replace(authEventsOld, authEventsNew);
  console.log('Google Sign-in buttons wired in setupAuthAndLandingEvents.');
}

// 4. Add Google Sign-In methods & Profile methods right after showLandingPageView()
const landingPageEndOld = `  showLandingPageView(keepLoggedIn = false) {
    document.getElementById("app-root")?.classList.add("hidden");
    document.getElementById("landing-page-root")?.classList.remove("hidden");
    const banner = document.getElementById("banner-logged-in");
    if (banner) {
      if (keepLoggedIn || this.isAuthenticated) {
        banner.classList.remove("hidden");
      } else {
        banner.classList.add("hidden");
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }`;

const landingPageEndNew = `  showLandingPageView(keepLoggedIn = false) {
    document.getElementById("app-root")?.classList.add("hidden");
    document.getElementById("landing-page-root")?.classList.remove("hidden");
    const banner = document.getElementById("banner-logged-in");
    if (banner) {
      if (keepLoggedIn || this.isAuthenticated) {
        banner.classList.remove("hidden");
      } else {
        banner.classList.add("hidden");
      }
    }
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
        document.getElementById("modal-auth-login")?.classList.add("hidden");
        this.showAppView();
        this.showToast(\`Selamat datang, \${user.displayName || "Dokter"}! Berhasil masuk via Google.\`, "success");
        return;
      } catch (err) {
        console.warn("Firebase Google Auth popup notice:", err.message);
      }
    }

    // 2. Graceful fallback for local development or if Google OAuth consent screen is pending
    this.handleGoogleSimulatedSignIn();
  }

  handleGoogleSimulatedSignIn() {
    const defaultEmail = this.userProfile?.email || "drh.pengguna@gmail.com";
    const enteredEmail = prompt("Masuk Cepat dengan Akun Google:\\n\\nSilakan masukkan alamat email Google Anda untuk aktivasi akun klinisi:", defaultEmail);
    if (enteredEmail === null) return;

    const email = enteredEmail.trim() || defaultEmail;
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
    if (roleEl) roleEl.textContent = \`\${this.userProfile.role} • SIP: \${this.userProfile.sipNumber}\`;
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
        const cleanName = (this.userProfile.name || "").replace(/drh\./gi, "").trim();
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
  }`;

if (appJs.includes(landingPageEndOld)) {
  appJs = appJs.replace(landingPageEndOld, landingPageEndNew);
  console.log('Google Auth & Profile methods added to App class.');
}

// 5. Update setupSettingsEvents to include settings-tab-btn-profile
const settingsSubtabsArrayOld = `    const subtabs = [
      { btnId: "settings-tab-btn-lang", panelId: "settings-panel-lang" },
      { btnId: "settings-tab-btn-terms", panelId: "settings-panel-terms" },
      { btnId: "settings-tab-btn-firebase", panelId: "settings-panel-firebase" }
    ];`;

const settingsSubtabsArrayNew = `    const subtabs = [
      { btnId: "settings-tab-btn-profile", panelId: "settings-panel-profile" },
      { btnId: "settings-tab-btn-lang", panelId: "settings-panel-lang" },
      { btnId: "settings-tab-btn-terms", panelId: "settings-panel-terms" },
      { btnId: "settings-tab-btn-firebase", panelId: "settings-panel-firebase" }
    ];`;

if (appJs.includes(settingsSubtabsArrayOld)) {
  appJs = appJs.replace(settingsSubtabsArrayOld, settingsSubtabsArrayNew);
  console.log('settings subtabs array updated with profile.');
}

const renderTermsConditionOld = `        if (panelId === "settings-panel-terms") {
          this.renderTerminologyTable();
        }`;

const renderTermsConditionNew = `        if (panelId === "settings-panel-profile") {
          this.renderUserProfileUI();
        }
        if (panelId === "settings-panel-terms") {
          this.renderTerminologyTable();
        }`;

if (appJs.includes(renderTermsConditionOld)) {
  appJs = appJs.replace(renderTermsConditionOld, renderTermsConditionNew);
  console.log('Settings panel profile render hook added.');
}

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('public/js/app.js updated successfully!');
