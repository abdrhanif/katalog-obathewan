/**
 * Medication Cart & Veterinary Prescription Generation Algorithm Engine
 * Compiles calculated medication doses into formal veterinary prescriptions.
 */

import { toRomanNumeral } from "./calculator.js";

export class PrescriptionManager {
  constructor() {
    this.cartStorageKey = "vet_medication_cart";
    this.configStorageKey = "vet_rx_config";
    this.historyStorageKey = "vet_prescription_history";
    this.cart = this.loadCart();
    this.config = this.loadConfig();
    this.history = this.loadHistory();
  }

  loadCart() {
    const saved = localStorage.getItem(this.cartStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse medication cart:", e);
      }
    }
    return [];
  }

  saveCart() {
    localStorage.setItem(this.cartStorageKey, JSON.stringify(this.cart));
  }

  loadConfig() {
    const saved = localStorage.getItem(this.configStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse rx config:", e);
      }
    }
    return {
      clinicName: "Klinik Hewan Sehat (Veterinary Care Clinic)",
      vetName: "drh. Pratama Wijaya, M.Si",
      licenseNumber: "SIP. 503/014/VET/2026",
      clinicAddress: "Jl. Kesehatan Hewan No. 8, Jakarta",
      clinicPhone: "+62 812-3456-7890",
      prescriptionPrefixStandard: "R/",
      prescriptionPrefixInjection: "inj.",
      numeralFormat: "roman", // "roman" or "arabic"
      includeDualLanguage: true, // Show Latin signa + English translation
      customNotesTemplate: "Pro: {{patientName}} ({{species}}, {{weight}} kg) | Owner: {{ownerName}}"
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(this.configStorageKey, JSON.stringify(this.config));
  }

  addToCart(calculationResult, customDirectives = {}) {
    const item = {
      id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      ...calculationResult,
      customDirectives: customDirectives.directions || calculationResult.frequencyCode,
      customQuantity: customDirectives.quantity || calculationResult.roundedTotalQuantity,
      timingNote: customDirectives.timingNote || ""
    };
    this.cart.push(item);
    this.saveCart();
    return item;
  }

  addCompoundedToCart(compoundedData) {
    const item = {
      id: "compound_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      isCompounded: true,
      ...compoundedData
    };
    this.cart.push(item);
    this.saveCart();
    return item;
  }

  removeFromCart(itemId) {
    this.cart = this.cart.filter(item => item.id !== itemId);
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCartItems() {
    return this.cart;
  }

  /**
   * Generates a single prescription line based on the user's veterinary prescription algorithm:
   *
   * Standard:
   * R/ [Medication] [Dosage Strength] [Formulation] [Quantity]
   * [Directions for Use]
   *
   * Compounded (Dengan dtd):
   * R/ Amoxicillin 50mg
   *    Dexamethasone 2.5mg
   *    CTM 0.5mg
   *    mfla pulv. dtd da in caps No. X
   * s.2.dd No I
   *
   * Compounded (Tanpa dtd):
   * R/ Amoxicillin 500mg tab I
   *    Dexamethasone 2.5mg tab II 1/2
   *    CTM 0.5mg tab II
   *    mfla pulv. da in caps No. X
   * s.2.dd No I
   */
  generatePrescriptionLine(item) {
    if (item.isCompounded) {
      const prefix = this.config.prescriptionPrefixStandard || "R/";
      const lines = [];
      const numPacks = item.totalPacks || 10;
      const numPacksFormatted = this.config.numeralFormat === "roman" ? toRomanNumeral(numPacks) : numPacks.toString();

      item.ingredients.forEach((ing, idx) => {
        const linePrefix = idx === 0 ? `${prefix} ` : "   ";
        if (item.hasDtd) {
          // With dtd format: R/ Amoxicillin 50mg
          const doseUnit = ing.unit || "mg";
          lines.push(`${linePrefix}${ing.name} ${ing.dosePerPack}${doseUnit}`);
        } else {
          // Without dtd format: R/ Amoxicillin 500mg tab I
          const strengthUnit = ing.strengthUnit || "mg";
          const formCode = ing.formulationCode || "tab";
          const qtyFormatted = this.config.numeralFormat === "roman" ? toRomanNumeral(ing.totalStockUnits) : ing.totalStockUnits.toString();
          lines.push(`${linePrefix}${ing.name} ${ing.stockStrength}${strengthUnit} ${formCode} ${qtyFormatted}`);
        }
      });

      // Compounding command line: e.g. mfla pulv. dtd da in caps No. X
      const dtdStr = item.hasDtd ? " dtd " : " ";
      const packagingStr = item.packaging ? `${item.packaging} ` : "";
      const mflaLine = `${item.compoundingInstruction || "mfla pulv."}${dtdStr}${packagingStr}No. ${numPacksFormatted}`.replace(/\s+/g, ' ').trim();
      lines.push(`   ${mflaLine}`);

      // Signa line: e.g. s.2.dd No I
      const signaCode = item.signa || "s.2.dd No I";
      const line2 = signaCode;

      return {
        line1: lines.join("\n"),
        line2: line2,
        raw: `${lines.join("\n")}\n${line2}`,
        isCompounded: true,
        title: `Racikan: ${item.ingredients.map(i => i.name).join(" + ")} (${item.totalPacks} caps/pulv)`
      };
    }

    const isInjection = item.isInjection || item.formulation.type === "injection";
    const prefix = isInjection ? this.config.prescriptionPrefixInjection : this.config.prescriptionPrefixStandard;

    const medName = item.drugName;
    const strength = `${item.formulation.strength}${item.formulation.unit}`;
    const formulationCode = item.formulation.code || (isInjection ? "flac" : "tab");

    const qtyNumber = item.customQuantity || item.roundedTotalQuantity || 1;
    const qtyFormatted = this.config.numeralFormat === "roman" ? toRomanNumeral(qtyNumber) : qtyNumber.toString();

    // Line 1: Header line
    // e.g. R/ Amoxicillin 500mg tab I   OR   inj. Enrofloxacin 100mg/mL flac I
    const line1 = `${prefix} ${medName} ${strength} ${formulationCode} ${qtyFormatted}`.trim();

    // Line 2: Directions for Use (Signa)
    // e.g. s.2.dd No I
    const signaCode = item.customDirectives || item.frequencyCode || "s.2.dd";
    const perAdminQty = item.unitQuantityPerAdmin || 1;
    const perAdminRoman = this.config.numeralFormat === "roman" ? toRomanNumeral(perAdminQty) : perAdminQty.toString();

    let line2 = `${signaCode} No ${perAdminRoman}`.trim();
    if (item.timingNote) {
      line2 += ` ${item.timingNote}`;
    }

    if (this.config.includeDualLanguage && item.frequencyText) {
      line2 += `  ; (${item.frequencyText}${item.unitDisplay ? ` - ${item.unitDisplay}` : ""})`;
    }

    return {
      line1,
      line2,
      raw: `${line1}\n${line2}`,
      isCompounded: false,
      title: `${medName} ${strength}`
    };
  }

  /**
   * Generates complete compiled formal prescription document
   */
  compilePrescription(patientInfo = {}) {
    const defaultPatient = {
      ownerName: "Budi Santoso",
      patientName: "Milo",
      species: "Canine",
      breed: "Golden Retriever",
      age: "3 years",
      weight: "25",
      gender: "Male (Neutered)",
      date: new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }),
      rxNumber: "RX-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000)
    };

    const patient = { ...defaultPatient, ...patientInfo };

    const rxItems = this.cart.map(item => this.generatePrescriptionLine(item));

    const plainText = [
      "============================================================",
      `            ${this.config.clinicName.toUpperCase()}`,
      `         ${this.config.vetName} | ${this.config.licenseNumber}`,
      `             ${this.config.clinicAddress}`,
      `                  Telp: ${this.config.clinicPhone}`,
      "============================================================",
      `Tanggal      : ${patient.date}`,
      `No. Resep    : ${patient.rxNumber}`,
      `Pemilik      : ${patient.ownerName}`,
      `Pasien       : ${patient.patientName} (${patient.species} - ${patient.breed})`,
      `Berat Badan  : ${patient.weight} kg | Umur: ${patient.age}`,
      "------------------------------------------------------------",
      "",
      ...rxItems.map(item => `${item.line1}\n${item.line2}\n`),
      "------------------------------------------------------------",
      `Pro  : ${patient.patientName} (${patient.species}, ${patient.weight} kg)`,
      `User : ${patient.ownerName}`,
      "",
      "                                   Tanda Tangan Dokter Hewan,",
      "",
      "",
      `                                   (${this.config.vetName})`,
      "============================================================"
    ].join("\n");

    return {
      patient,
      rxItems,
      plainText,
      totalMedications: this.cart.length,
      config: this.config
    };
  }

  /* ------------------------------------------------------------- */
  /* PRESCRIPTION HISTORY MANAGEMENT                               */
  /* ------------------------------------------------------------- */
  loadHistory() {
    const saved = localStorage.getItem(this.historyStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse prescription history:", e);
      }
    }
    return [];
  }

  saveHistory() {
    localStorage.setItem(this.historyStorageKey, JSON.stringify(this.history));
  }

  saveToHistory(compiledData) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }) + ", " + now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    }) + " WIB";

    const record = {
      id: "rx_hist_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      savedAt: formattedDate,
      timestamp: Date.now(),
      patient: compiledData.patient,
      rxItems: compiledData.rxItems,
      plainText: compiledData.plainText,
      totalMedications: compiledData.totalMedications,
      config: compiledData.config,
      rawCartSnapshot: JSON.parse(JSON.stringify(this.cart))
    };

    this.history.unshift(record);
    this.saveHistory();
    return record;
  }

  getHistory() {
    return this.history;
  }

  getHistoryById(id) {
    return this.history.find(item => item.id === id);
  }

  deleteHistoryItem(id) {
    this.history = this.history.filter(item => item.id !== id);
    this.saveHistory();
  }

  clearAllHistory() {
    this.history = [];
    this.saveHistory();
  }
}
