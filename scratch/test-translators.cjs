async function test() {
  const query = 'Aminopenicillin antibiotic used for treating bacterial infections in dogs and cats.';

  // 1. MyMemory
  try {
    const res = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(query) + '&langpair=en|id');
    const json = await res.json();
    console.log('MyMemory:', json.responseData?.translatedText);
  } catch (e) {
    console.log('MyMemory err:', e.message);
  }

  // 2. LibreTranslate mirrors
  const libreMirrors = [
    'https://translate.argosopentech.com/translate',
    'https://translate.fedilab.app/translate',
    'https://libretranslate.de/translate',
    'https://lt.vern.cc/translate'
  ];
  for (const url of libreMirrors) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, source: 'en', target: 'id', format: 'text' })
      });
      if (res.ok) {
        const json = await res.json();
        console.log(`Libre (${url}):`, json.translatedText);
        break;
      }
    } catch (e) {
      // ignore
    }
  }

  // 3. SimplyTranslate instances
  const simplyInstances = [
    'https://simplytranslate.org/api/translate/?engine=google&from=en&to=id&text='
  ];
  for (const url of simplyInstances) {
    try {
      const res = await fetch(url + encodeURIComponent(query));
      if (res.ok) {
        const json = await res.json();
        console.log('SimplyTranslate:', json.translated_text);
        break;
      }
    } catch (e) {}
  }
}

test();
