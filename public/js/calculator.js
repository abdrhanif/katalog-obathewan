import { checkAntimicrobialClinicalWarnings } from "./antimicrobial-guide-data.js";
/**
 * Veterinary Dosage Calculator Engine
 * Accurately computes dosages based on species, weight, medication formulation, and frequency.
 */

export function toRomanNumeral(num) {
  if (num <= 0) return num.toString();
  const lookup = [
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" }
  ];

  let intPart = Math.floor(num);
  let roman = "";
  for (const item of lookup) {
    while (intPart >= item.value) {
      roman += item.numeral;
      intPart -= item.value;
    }
  }

  // Handle common fractional tablets (e.g. 0.5 = 1/2)
  const remainder = num - Math.floor(num);
  if (remainder >= 0.75) {
    roman += " 3/4";
  } else if (remainder >= 0.5) {
    roman += " 1/2";
  } else if (remainder >= 0.25) {
    roman += " 1/4";
  }

  return roman.trim() || num.toString();
}

export function parseFrequency(freqCode) {
  const code = (freqCode || "").toLowerCase().trim();
  if (code.includes("4.dd") || code.includes("qid") || code.includes("q6h")) {
    return { timesPerDay: 4, shorthand: "s.4.dd", text: "4 times daily (every 6 hours)" };
  }
  if (code.includes("3.dd") || code.includes("tid") || code.includes("q8h")) {
    return { timesPerDay: 3, shorthand: "s.3.dd", text: "3 times daily (every 8 hours)" };
  }
  if (code.includes("2.dd") || code.includes("bid") || code.includes("q12h")) {
    return { timesPerDay: 2, shorthand: "s.2.dd", text: "2 times daily (every 12 hours)" };
  }
  if (code.includes("1.dd") || code.includes("sid") || code.includes("q24h")) {
    return { timesPerDay: 1, shorthand: "s.1.dd", text: "Once daily (every 24 hours)" };
  }
  if (code.includes("simm") || code.includes("s.i.m.m") || code.includes("manus")) {
    return { timesPerDay: 1, shorthand: "s.i.m.m.", text: "In manus medici (Serahkan ke tangan dokter / Tindakan klinik)" };
  }
  if (code.includes("suc") || code.includes("s.u.c") || code.includes("cognitus")) {
    return { timesPerDay: 1, shorthand: "s.u.c.", text: "Signa usus cognitus (Pemakaian telah diketahui)" };
  }
  if (code.includes("prn") || code.includes("p.r.n.")) {
    return { timesPerDay: 1, shorthand: "p.r.n.", text: "Pro re nata (Bila perlu / as needed)" };
  }
  return { timesPerDay: 1, shorthand: freqCode || "s.1.dd", text: "As directed" };
}

export function calculateDose({
  species,
  weight,
  weightUnit = "kg",
  drug,
  doseRate, // mg/kg
  formulation,
  frequencyCode = "s.2.dd",
  durationDays = 7
}) {
  if (!drug || !formulation) {
    throw new Error("Drug and formulation are required.");
  }

  // Convert weight to kg
  const weightInKg = weightUnit.toLowerCase() === "lbs" ? weight * 0.45359237 : weight;
  if (!weightInKg || weightInKg <= 0) {
    throw new Error("Please enter a valid patient weight greater than 0.");
  }

  const rate = parseFloat(doseRate);
  if (!rate || rate <= 0) {
    throw new Error("Please enter a valid dosage rate (mg/kg).");
  }

  // Calculate single administration dose (mg)
  const doseMgPerAdmin = weightInKg * rate;

  const freq = parseFrequency(frequencyCode);
  const dailyDoseMg = doseMgPerAdmin * freq.timesPerDay;

  let unitQuantityPerAdmin = 0;
  let unitDisplay = "";
  let totalUnitsNeeded = 0;
  let roundedTotalQuantity = 0;

  if (formulation.type === "tablet" || formulation.type === "capsule") {
    unitQuantityPerAdmin = doseMgPerAdmin / formulation.strength;
    // Suggest practical rounded tablet portions (e.g., quarter, half, or whole)
    unitDisplay = `${unitQuantityPerAdmin.toFixed(2)} ${formulation.code || "tab"}`;
    totalUnitsNeeded = unitQuantityPerAdmin * freq.timesPerDay * durationDays;
    roundedTotalQuantity = Math.ceil(totalUnitsNeeded);
  } else if (formulation.type === "suspension" || formulation.type === "syrup") {
    // Volume (mL) = mg / (mg/mL)
    unitQuantityPerAdmin = doseMgPerAdmin / formulation.strength;
    unitDisplay = `${unitQuantityPerAdmin.toFixed(2)} mL`;
    totalUnitsNeeded = unitQuantityPerAdmin * freq.timesPerDay * durationDays;
    roundedTotalQuantity = Math.ceil(totalUnitsNeeded); // bottle / mL total
  } else if (formulation.type === "injection") {
    unitQuantityPerAdmin = doseMgPerAdmin / (formulation.strength || 1);
    unitDisplay = `${unitQuantityPerAdmin.toFixed(2)} mL`;
    totalUnitsNeeded = unitQuantityPerAdmin * freq.timesPerDay * durationDays;
    roundedTotalQuantity = Math.ceil(totalUnitsNeeded * 10) / 10;
  } else {
    const strength = formulation.strength || 1;
    unitQuantityPerAdmin = doseMgPerAdmin / strength;
    unitDisplay = `${unitQuantityPerAdmin.toFixed(2)} ${formulation.code || "unit"}`;
    totalUnitsNeeded = unitQuantityPerAdmin * freq.timesPerDay * durationDays;
    roundedTotalQuantity = Math.max(1, Math.ceil(totalUnitsNeeded));
  }

  // Clinical Safety Warnings
  const warnings = [];
  if (species === "feline" && drug.id === "enrofloxacin" && rate > 5) {
    warnings.push("CRITICAL FELINE WARNING: Enrofloxacin dose exceeds 5 mg/kg/day! Higher doses cause irreversible retinal degeneration and permanent blindness in cats.");
  }
  if (species === "exotic" && (drug.id === "amoxicillin" || drug.id === "amoxicillin-clavulanate") && formulation.type !== "injection") {
    warnings.push("CONTRAINDICATION WARNING: Oral beta-lactam penicillins cause fatal clostridial enterotoxemia in hindgut-fermenting small mammals (rabbits, guinea pigs, hamsters).");
  }
  if (species === "feline" && drug.id === "meloxicam" && rate > 0.1) {
    warnings.push("FELINE SAFETY WARNING: Meloxicam in cats must be micro-dosed (0.05 mg/kg). Doses > 0.1 mg/kg significantly elevate risk of acute renal failure.");
  }
  if (drug.id === "pimobendan" && (!frequencyCode.includes("a.c.") && !freq.text.toLowerCase().includes("empty stomach"))) {
    warnings.push("ADMINISTRATION TIP: Pimobendan MUST be given on an empty stomach at least 1 hour before feeding. Absorption is reduced by >50% if given with food.");
  }
  if (drug.id === "doxycycline" && species === "feline" && (formulation.type === "tablet" || formulation.type === "capsule")) {
    warnings.push("ESOPHAGEAL SAFETY WARNING: Always flush feline patients with 5-10 mL water immediately after oral doxycycline tablets/capsules to prevent severe esophageal stricture.");
  }

  // Antimicrobial Guide Warnings (Melbourne & AgVic)
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

  const romanQty = toRomanNumeral(roundedTotalQuantity);

  return {
    patientWeightKg: parseFloat(weightInKg.toFixed(2)),
    patientWeightInput: weight,
    patientWeightUnit: weightUnit,
    drugId: drug.id,
    drugName: drug.activeIngredient,
    doseRate: rate,
    doseMgPerAdmin: parseFloat(doseMgPerAdmin.toFixed(2)),
    dailyDoseMg: parseFloat(dailyDoseMg.toFixed(2)),
    unitQuantityPerAdmin: parseFloat(unitQuantityPerAdmin.toFixed(2)),
    unitDisplay,
    frequencyCode: freq.shorthand,
    frequencyText: freq.text,
    durationDays,
    totalUnitsNeeded: parseFloat(totalUnitsNeeded.toFixed(2)),
    roundedTotalQuantity,
    romanNumeralQuantity: romanQty,
    formulation,
    warnings,
    isInjection: formulation.type === "injection"
  };
}
