async function test() {
  // Test Bing / Edge translator endpoint
  try {
    const res = await fetch('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ Text: 'Bactericidal antibiotic for dogs' }])
    });
    console.log('Bing status:', res.status);
    const json = await res.json();
    console.log('Bing:', json);
  } catch (e) {
    console.log('Bing err:', e.message);
  }

  // Test Google with client=gtx vs client=dict-chrome-ex vs client=webapp
  const clients = ['gtx', 'webapp', 'tw-ob', 't'];
  for (const c of clients) {
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=${c}&sl=en&tl=id&dt=t&q=hello`);
      if (res.status === 200) {
        const j = await res.json();
        console.log(`Google (${c}) SUCCESS:`, j[0][0][0]);
      } else {
        console.log(`Google (${c}) status:`, res.status);
      }
    } catch (e) {
      console.log(`Google (${c}) err:`, e.message);
    }
  }
}

test();
