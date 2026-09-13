async function check() {
  const html = await (await fetch('http://localhost:3000/')).text();
  const match = html.match(/href="(\/_next\/static\/css\/[^"]+)"/);
  if (match) {
    const cssUrl = 'http://localhost:3000' + match[1];
    const cssRes = await fetch(cssUrl);
    console.log('CSS URL:', match[1], 'Status:', cssRes.status, 'Size:', (await cssRes.text()).length);
  } else {
    console.log('No CSS tag found in HTML');
  }
}
check();
