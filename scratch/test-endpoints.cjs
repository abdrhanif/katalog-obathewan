async function main() {
  // Test 1: translate.google.com/m
  try {
    const res = await fetch('https://translate.google.com/m?sl=en&tl=id&q=' + encodeURIComponent('Used for treatment of infections in dogs and cats'), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const text = await res.text();
    const idx = text.indexOf('class="result-container">');
    if (idx !== -1) {
      const rest = text.slice(idx + 'class="result-container">'.length);
      const end = rest.indexOf('<');
      console.log('Test 1 (google.com/m):', rest.slice(0, end));
    } else {
      console.log('Test 1 (google.com/m): No result-container, status:', res.status, text.slice(0, 100));
    }
  } catch (e) {
    console.log('Test 1 err:', e.message);
  }

  // Test 2: mymemory
  try {
    const res = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent('Used for treatment of infections in dogs and cats') + '&langpair=en|id');
    const json = await res.json();
    console.log('Test 2 (mymemory):', json.responseData?.translatedText);
  } catch (e) {
    console.log('Test 2 err:', e.message);
  }

  // Test 3: Lingva instances
  const lingvaInstances = [
    'https://lingva.ml',
    'https://translate.plausibility.cloud',
    'https://lingva.lunar.icu',
    'https://lingva.garudalinux.org'
  ];
  for (const host of lingvaInstances) {
    try {
      const res = await fetch(`${host}/api/v1/en/id/${encodeURIComponent('bactericidal antibiotic')}`);
      const json = await res.json();
      console.log(`Lingva (${host}):`, json.translation);
      break;
    } catch (e) {
      // ignore
    }
  }
}

main();
