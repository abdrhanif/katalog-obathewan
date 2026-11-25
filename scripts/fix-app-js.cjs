const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../public/js/app.js');
let code = fs.readFileSync(appPath, 'utf8');

// Find where `renderTerminologyTable` is
const termSplit = 'renderTerminologyTable(query = "") {';
const termIndex = code.indexOf(termSplit);
if (termIndex === -1) {
  console.error('Could not find renderTerminologyTable');
  process.exit(1);
}

// Find the end of renderTerminologyTable method
const termEndTarget = 'tbody.innerHTML = terms.map(term => `';
const tableMapIndex = code.indexOf(termEndTarget, termIndex);
const methodEndIndex = code.indexOf('  }\n', tableMapIndex);

// Find where helperMethods start
const helperMarker = '/* ------------------------------------------------------------- */\n  /* ANTIMICROBIAL STEWARDSHIP & INTERACTIONS METHODS';
const helperStartIndex = code.indexOf(helperMarker);

if (helperStartIndex !== -1) {
  // Everything before the premature class close (after renderTerminologyTable)
  const partBefore = code.slice(0, methodEndIndex + 4);
  
  // Extract the helper methods up to the end of the helper functions
  const methodsCode = code.slice(helperStartIndex, code.lastIndexOf('  }\n\n});') + 4);

  const cleanCode = partBefore + '\n\n' + methodsCode + '\n}\n\n// Instantiate on DOM load\nwindow.addEventListener("DOMContentLoaded", () => {\n  window.vetApp = new App();\n});\n';

  fs.writeFileSync(appPath, cleanCode, 'utf8');
  console.log('Successfully fixed app.js placement!');
} else {
  console.error('Could not find helper methods marker');
}
