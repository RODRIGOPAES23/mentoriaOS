import puppeteer from 'puppeteer';

const MENTOR_ID = '804a4290-8c97-4f63-8596-02f56366fee7';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// Injeta localStorage antes de navegar
await page.evaluateOnNewDocument((id) => {
  localStorage.setItem('mentorSelecionado', id);
}, MENTOR_ID);

await page.goto('https://mentoriaos.vercel.app/dashboard', {
  waitUntil: 'networkidle2',
  timeout: 30000,
});
await new Promise(r => setTimeout(r, 4000));

// Print 1: sidebar aberta
await page.screenshot({ path: 'print_sidebar_aberta.png' });
console.log('✅ sidebar aberta');

// Clica no toggle
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('aside button'));
  const toggle = btns.find(b => b.getAttribute('title') &&
    (b.getAttribute('title').includes('Recolher') || b.getAttribute('title').includes('Expandir')));
  if (toggle) toggle.click();
  else console.log('toggle não encontrado, btns:', btns.map(b => b.getAttribute('title')));
});
await new Promise(r => setTimeout(r, 700));

// Print 2: sidebar fechada
await page.screenshot({ path: 'print_sidebar_fechada.png' });
console.log('✅ sidebar fechada');

await browser.close();
console.log('done');
