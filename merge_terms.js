import fs from "fs";
import { INITIAL_PRESCRIPTION_TERMS } from "./public/js/terminology-data.js";
const newTerms = JSON.parse(fs.readFileSync("parsed_terms.json", "utf8"));

console.log("Original terms count:", INITIAL_PRESCRIPTION_TERMS.length);
console.log("New terms count:", newTerms.length);

// Merge dictionary by code normalized
const map = new Map();

// First add new terms (rich veterinary terms from user JSON)
newTerms.forEach(t => {
  const code = t.singkatan.trim();
  map.set(code.toLowerCase(), {
    code: code,
    latin: t.kepanjangan.trim(),
    english: t.arti.trim(),
    category: t.kategori_kegunaan.trim(),
    usage: t.contoh_penggunaan.trim(),
    notes: "Standar Penulisan Resep Dokter Hewan (Kementan RI)"
  });
});

// Also preserve any unique technical codes from INITIAL_PRESCRIPTION_TERMS
INITIAL_PRESCRIPTION_TERMS.forEach(t => {
  const codeKey = t.code.toLowerCase();
  if (!map.has(codeKey)) {
    map.set(codeKey, t);
  } else {
    // If it exists, enhance notes with original notes
    const existing = map.get(codeKey);
    if (t.notes && !existing.notes.includes(t.notes)) {
      existing.notes += " • " + t.notes;
    }
  }
});

const merged = Array.from(map.values());
console.log("Total merged terms:", merged.length);
fs.writeFileSync("merged_terms.json", JSON.stringify(merged, null, 2), "utf8");
