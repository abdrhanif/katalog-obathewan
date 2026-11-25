async function test() {
  try {
    const res = await fetch('https://duckduckgo.com/?q=duckduckgo+translate+api', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const match = html.match(/vqd=([0-9-]+)/);
    console.log('VQD match:', match ? match[1] : 'none');
    if (match) {
      const vqd = match[1];
      const trRes = await fetch(`https://duckduckgo.com/translation.js?query=translate&vqd=${vqd}&to=id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({ from: 'en', to: 'id', text: 'Danofloxacin is an antibiotic used in cattle.' })
      });
      console.log('Status:', trRes.status);
      const text = await trRes.text();
      console.log('Response:', text);
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

test();
