async function testLoad() {
  const start = Date.now();
  try {
    const res = await fetch('http://localhost:5173/');
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('TIME:', Date.now() - start, 'ms');
    console.log('HTML PREVIEW:', text.slice(0, 200));
  } catch (err) {
    console.error('ERROR:', err);
  }
}
testLoad();
