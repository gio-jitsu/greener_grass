// Genera la cartella public/ da pubblicare (es. su Vercel):
//  - copia le proposte grafiche come file separati
//  - crea public/index.html con menu a tendina che le mostra in un iframe (src reale, non srcdoc,
//    così i link interni "#/..." delle proposte funzionano).
// Uso: node build-index.js
const fs = require('fs');
const OUT = 'public';
const num = f => +(f.match(/grafica-(\d+)/) || [0, 1])[1];
const files = fs.readdirSync('.')
  .filter(f => /^proposta-grafica.*\.html$/.test(f))
  // la proposta 10 (scaletta) va per prima, le altre in ordine numerico
  .sort((a, b) => (num(a) === 10 ? 0 : num(a)) - (num(b) === 10 ? 0 : num(b)));
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
const items = files.map(f => {
  fs.copyFileSync(f, OUT + '/' + f);
  const html = fs.readFileSync(f, 'utf8');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [, f])[1].replace(/^.*?–\s*/, '');
  return { title, file: f };
});
const page = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pitcha l'Amico – Proposte grafiche</title>
<style>
  html, body { margin: 0; height: 100%; font-family: system-ui, sans-serif; }
  body { display: flex; flex-direction: column; background: #111; }
  header { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: #1b1b1f; color: #fff; flex-wrap: wrap; }
  header strong { font-size: 15px; }
  select { font: inherit; font-size: 15px; padding: 8px 10px; border-radius: 6px; border: 1px solid #555; background: #fff; color: #111; min-width: 260px; max-width: 100%; }
  button, a.open { font: inherit; padding: 8px 12px; border-radius: 6px; border: 1px solid #555; background: #2a2a30; color: #fff; cursor: pointer; text-decoration: none; }
  button:hover, a.open:hover { background: #3a3a42; }
  .count { opacity: .6; font-size: 13px; margin-left: auto; }
  iframe { flex: 1; width: 100%; border: 0; background: #fff; }
</style>
</head>
<body>
<header>
  <strong>Proposte grafiche</strong>
  <button id="prev" aria-label="Precedente">←</button>
  <select id="sel" aria-label="Scegli proposta"></select>
  <button id="next" aria-label="Successiva">→</button>
  <a class="open" id="open" target="_blank" rel="noopener">Apri a schermo intero ↗</a>
  <span class="count" id="count"></span>
</header>
<iframe id="frame" title="Anteprima proposta"></iframe>
<script>
const ITEMS = ${JSON.stringify(items)};
const sel = document.getElementById('sel'), frame = document.getElementById('frame'), count = document.getElementById('count'), open_ = document.getElementById('open');
ITEMS.forEach((it, i) => sel.add(new Option(it.title, i)));
function show(i) {
  i = Math.max(0, Math.min(ITEMS.length - 1, i));
  sel.value = i;
  frame.src = ITEMS[i].file;
  open_.href = ITEMS[i].file;
  count.textContent = (i + 1) + ' / ' + ITEMS.length;
  history.replaceState(null, '', '#' + (i + 1));
}
sel.onchange = () => show(+sel.value);
document.getElementById('prev').onclick = () => show(+sel.value - 1);
document.getElementById('next').onclick = () => show(+sel.value + 1);
show((parseInt(location.hash.slice(1)) || 1) - 1);
</script>
</body>
</html>
`;
fs.writeFileSync(OUT + '/index.html', page);
console.log(OUT + '/ generata con', items.length, 'proposte:\n- ' + items.map(i => i.title).join('\n- '));
