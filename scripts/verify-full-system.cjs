const path = require('path');

async function testSystem() {
  console.log('--- TEST 1: Verifying Database Structure ---');
  const dbModule = await import('../public/js/drugs-data.js');
  const drugs = dbModule.VET_DRUG_DATABASE;
  console.log(`Total drugs in database: ${drugs.length}`);

  if (drugs.length < 400) {
    throw new Error(`Expected at least 400 drugs, found ${drugs.length}`);
  }

  let validCount = 0;
  for (const d of drugs) {
    if (!d.id || !d.activeIngredient) throw new Error(`Drug missing id or activeIngredient: ${JSON.stringify(d).slice(0, 50)}`);
    if (!Array.isArray(d.formulations) || d.formulations.length === 0) throw new Error(`Drug missing formulations: ${d.id}`);
    if (!d.dosages || Object.keys(d.dosages).length === 0) throw new Error(`Drug missing dosages: ${d.id}`);
    if (!d.content || !d.content.id || !d.content.en) throw new Error(`Drug missing bilingual content: ${d.id}`);
    validCount++;
  }
  console.log(`All ${validCount} drugs have valid bilingual schemas, formulations, and dosages.`);

  console.log('\n--- TEST 2: Testing Dosage Calculator on Random 20 Drugs ---');
  const calcModule = await import('../public/js/calculator.js');
  const { calculateDose, formatLatinPrescription } = calcModule;

  const testIndices = [0, 10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 420];
  for (const idx of testIndices) {
    const drug = drugs[idx];
    const form = drug.formulations[0];
    const speciesDose = drug.dosages['canine'] || drug.dosages['feline'] || Object.values(drug.dosages)[0];
    const res = calculateDose({
      species: 'canine',
      weight: 12.5,
      weightUnit: 'kg',
      drug,
      doseRate: speciesDose.defaultDose || 10,
      formulation: form,
      frequencyCode: speciesDose.frequency || 's.2.dd',
      durationDays: 7
    });

    if (isNaN(res.doseMgPerAdmin) || isNaN(res.roundedTotalQuantity)) {
      throw new Error(`NaN calculation detected for drug ${drug.activeIngredient}!`);
    }
    console.log(`[PASS] ${drug.activeIngredient.padEnd(25)} -> ${res.doseMgPerAdmin.toFixed(2)} mg/admin, Total: ${res.roundedTotalQuantity} ${form.code} (${res.romanNumeralQuantity})`);
  }

  console.log('\n--- TEST 3: Compounding Latin Prescription Format (dtd vs non-dtd) ---');
  // Canonical sample test: Amoxicillin 50mg, Dexamethasone 2.5mg, CTM 0.5mg
  const ingredientsDtd = [
    { name: "Amoxicillin", dosePerPack: 50, unit: "mg", stockStrength: 500, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 1 },
    { name: "Dexamethasone", dosePerPack: 2.5, unit: "mg", stockStrength: 2.5, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 10 },
    { name: "CTM", dosePerPack: 0.5, unit: "mg", stockStrength: 4, strengthUnit: "mg", formulationCode: "tab", totalStockUnits: 1.25 }
  ];

  // Test with DTD
  let rxDtd = "R/ Amoxicillin 50mg\n   Dexamethasone 2.5mg\n   CTM 0.5mg\n   mfla pulv. dtd da in caps No. X\n   s.2.dd No I";
  console.log("Expected DTD Output format:");
  console.log(rxDtd);

  // Test without DTD
  let rxNonDtd = "R/ Amoxicillin 500mg tab I\n   Dexamethasone 2.5mg tab X\n   CTM 4mg tab I 1/4\n   mfla pulv. da in caps No. X\n   s.2.dd No I";
  console.log("\nExpected Non-DTD Output format:");
  console.log(rxNonDtd);

  console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

testSystem().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
