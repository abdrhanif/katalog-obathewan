function normalizeSpacing(text) {
  if (!text || typeof text !== 'string') return text;
  let s = text;

  // 1. Unify whitespace
  s = s.replace(/[\t\r\n]+/g, ' ');

  // 2. Remove spaces around hyphens in words (e.g. "masing - masing" -> "masing-masing")
  s = s.replace(/([A-Za-z0-9À-ÿ])\s+-\s+([A-Za-z0-9À-ÿ])/g, '$1-$2');

  // 3. Spacing around opening and closing parentheses & brackets
  s = s.replace(/([A-Za-z0-9À-ÿ])\(/g, '$1 (');
  s = s.replace(/\)([A-Za-z0-9À-ÿ])/g, ') $1');
  s = s.replace(/([A-Za-z0-9À-ÿ])\[/g, '$1 [');
  s = s.replace(/\]([A-Za-z0-9À-ÿ])/g, '] $1');

  // 4. Clean spaces inside parentheses & brackets
  s = s.replace(/\(\s+/g, '(');
  s = s.replace(/\s+\)/g, ')');
  s = s.replace(/\[\s+/g, '[');
  s = s.replace(/\s+\]/g, ']');

  // 5. Ensure space after commas, semicolons, colons (when followed by letter/number)
  s = s.replace(/,([A-Za-z0-9À-ÿ])/g, ', $1');
  s = s.replace(/;([A-Za-z0-9À-ÿ])/g, '; $1');
  s = s.replace(/:([A-Za-zÀ-ÿ])/g, ': $1');

  // 6. Ensure space after periods when followed by a capital letter (start of sentence)
  s = s.replace(/\.([A-ZÀ-ß])/g, '. $1');

  // 7. Remove space before punctuation
  s = s.replace(/\s+([,.:;?!])/g, '$1');

  // 8. Reduce multiple spaces to single space
  s = s.replace(/\s{2,}/g, ' ');

  return s.trim();
}

const testCases = [
  'anjing(PO)pada kucing',
  'masing - masing hewan ,hati - hati',
  'dosis ( 0.5 mg/kg )secara IV;dapat diulang',
  'efek:muntah,diare   dan letargi.Hewan harus dipantau.'
];

testCases.forEach(t => {
  console.log('IN :', t);
  console.log('OUT:', normalizeSpacing(t));
});
