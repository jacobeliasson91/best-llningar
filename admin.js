/* Admin: inloggning, beställningsrapporter och produkteditor. Laddas först när man klickar på "Admin". */
(function(){
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const kr = n => n.toLocaleString('sv-SE') + ' kr';
let sb, root, raw = [], report = [], prods = [], editing = null, newImg = null, pdlg = null;

const CSS = `#adminRoot .w{max-width:1100px;margin:0 auto;padding:24px 16px 60px}
/* Header: samma uppbyggnad som butiken, men mörkgrå så att man ser att man är i Admin */
#adminRoot .ah{position:sticky;top:0;z-index:5;background:#113b5d;color:#fff}
#adminRoot .ahin{max-width:1100px;margin:0 auto;padding:16px;display:flex;align-items:center;gap:20px}
#adminRoot .ah .logo{height:64px;width:auto;display:block}
#adminRoot .ah h1{color:#fff;font-size:2.25rem;font-weight:700;letter-spacing:-.01em;margin:0}
#adminRoot .ah .ahb{margin-left:auto;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.55);border-radius:4px;padding:8px 14px}
#adminRoot .ah .ahb:focus-visible{outline-color:#fff}
@media (max-width:560px){#adminRoot .ahin{gap:12px;padding:12px 16px}#adminRoot .ah .logo{height:48px}#adminRoot .ah h1{font-size:1.6rem}}
#adminRoot .at{background:#ececec;border-bottom:1px solid #e0e0e0}
#adminRoot .atin{max-width:1100px;margin:0 auto;padding:0 16px;display:flex;align-items:stretch}
#adminRoot .atl{display:flex;overflow-x:auto}
#adminRoot .at button{border:0;border-radius:0;background:transparent;color:#8a8a8a;font-size:1rem;font-weight:400;padding:10px 23px;white-space:nowrap}
#adminRoot .atl button:first-child{padding-left:0}
#adminRoot .atl button[aria-pressed=true]{color:#3a3a3a;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:6px}
#adminRoot .at #aout{margin-left:auto;padding-right:0}
#adminRoot .at button:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
#adminRoot .c{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:16px}
#adminRoot label{display:block;font-size:.85rem;color:var(--mute);margin:0 0 4px}
#adminRoot input:not([type=checkbox]):not([type=file]),#adminRoot select,#adminRoot textarea{width:100%;font:inherit;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:10px}
#adminRoot .g{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;align-items:end}
#adminRoot .m{color:var(--mute)}#adminRoot .e{color:#c0392b;min-height:1.2em;margin:8px 0 0}
#adminRoot table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
#adminRoot th,#adminRoot td{padding:10px 8px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}
#adminRoot th{font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;color:var(--mute);border-bottom:2px solid var(--ink)}
#adminRoot .r{text-align:right}#adminRoot tfoot td{font-weight:700;font-size:1.05rem;border:0}
#adminRoot .wr{overflow-x:auto}#adminRoot .row{display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}
#adminRoot .row:last-child{border:0}#adminRoot .row b{display:block}#adminRoot .row .t{flex:1;min-width:0}
#adminRoot .th{width:56px;height:56px;border-radius:8px;object-fit:cover;background:var(--line);flex:none;display:flex;align-items:center;justify-content:center;font-size:1.6rem}
#adminRoot .ck{display:flex;gap:8px;align-items:center;font-size:.95rem;color:var(--ink);margin-top:12px}
#adminRoot .ac{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}#adminRoot .danger{color:#c0392b}
#adminRoot .lg{max-width:380px;margin:8vh auto 0}
#adminRoot .pgbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px}
#adminRoot .pgbar label{display:flex;align-items:center;gap:8px;margin:0}
#adminRoot .pgbar select{width:auto;padding:6px 10px}
#adminRoot .pgb{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:16px}
#adminRoot .pgb button{min-width:40px;padding:7px 12px}
#adminRoot .pgb button:disabled{opacity:.45;cursor:default}
#adminRoot .pgb .gap{align-self:center;color:var(--mute);padding:0 2px}
#adminRoot details.o{border-bottom:1px solid var(--line)}#adminRoot details.o:last-child{border:0}
#adminRoot details.o summary{cursor:pointer;padding:12px 0;display:flex;gap:12px;justify-content:space-between;align-items:center;list-style:none}
#adminRoot details.o summary::-webkit-details-marker{display:none}#adminRoot details.o summary b{display:block}
#adminRoot details.o summary .rt{text-align:right;white-space:nowrap}#adminRoot .ok{color:var(--accent);font-weight:600}
#adminRoot details.o[open] summary{border-bottom:1px dashed var(--line)}
#adminRoot dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:12px 0}#adminRoot dt{color:var(--mute)}#adminRoot dd{margin:0;overflow-wrap:anywhere}
#adminRoot button:disabled{opacity:.45;cursor:default}
#adminRoot input[type=checkbox]{width:auto;flex:none;margin:0;accent-color:var(--accent)}
#adminRoot .dng{background:#c0392b;border-color:#c0392b;color:#fff;font-weight:600}
#adminRoot dialog .askt p{margin:0 0 8px}
#adminRoot .ok{margin:8px 0 0}`;

function load(src){ return new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }

/* Popup-fönster (samma utseende som butikens). Läggs inuti admin-lagret och tas bort när det stängs. */
function popup(title, bodyHtml, o){
  o = o || {};
  const d = document.createElement('dialog');
  d.innerHTML = '<div class="dh"><h2>' + esc(title) + '</h2><button type="button" class="dx" aria-label="Stäng">✕</button></div><div class="db">' + bodyHtml + '</div>';
  if (o.wide) d.style.width = 'min(640px,calc(100vw - 24px))';
  root.appendChild(d);
  d.querySelector('.dx').onclick = () => d.close();
  if (o.dismissable !== false) d.addEventListener('click', e => { if (e.target === d) d.close(); });   // klick utanför stänger (inte i redigeringsformuläret, så inget går förlorat av misstag)
  d.addEventListener('close', () => d.remove());
  d.showModal();
  return d;
}
/* Fråga innan något raderas. Med word måste man skriva ordet för att kunna bekräfta (används vid massradering). */
function ask(o){
  return new Promise(res => {
    let yes = false;
    const d = popup(o.title, '<div class="askt">' + o.html + '</div>' +
      (o.word ? '<label for="askw" style="margin-top:12px">Skriv <b>' + esc(o.word) + '</b> för att bekräfta</label><input id="askw" autocomplete="off" autocapitalize="characters">' : '') +
      '<div class="ac"><button type="button" id="askok" class="dng">' + esc(o.ok || 'Radera') + '</button><button type="button" id="askno">Avbryt</button></div>', { dismissable: false });
    const okb = d.querySelector('#askok');
    if (o.word){ const w = d.querySelector('#askw'); okb.disabled = true; w.oninput = () => { okb.disabled = w.value.trim().toUpperCase() !== o.word; }; w.focus(); }
    okb.onclick = () => { yes = true; d.close(); };
    d.querySelector('#askno').onclick = () => d.close();
    d.addEventListener('close', () => res(yes));
  });
}
const NOPERM = 'Inget raderades. Har du kört schema-radera.sql i Supabase?';

const closeAdmin = () => { document.documentElement.classList.remove('adm'); history.replaceState(null, '', location.pathname + location.search); };

window.openAdmin = async function(){
  document.documentElement.classList.add('adm');   // visa admin-lagret direkt ("Laddar…") medan resten startar
  if (!root){
    root = $('adminRoot'); const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    try { await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'); sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); }
    catch (e) { root.innerHTML = '<div class="w"><p class="e">Kunde inte starta (kontrollera SUPABASE_URL och SUPABASE_ANON_KEY i index.html).</p><button type="button" onclick="document.documentElement.classList.remove(\'adm\')">Stäng</button></div>'; return; }
  }
  if (!location.hash.startsWith('#admin')) history.replaceState(null, '', '#admin');
  const { data } = await sb.auth.getSession();
  data.session ? shell(data.session.user.email) : login();
};

const HEAD = `<header class="ah"><div class="ahin"><img class="logo" src="emblem.png" alt="Skabersjö IF"><h1>Admin</h1><button type="button" id="aclose" class="ahb">Till butiken</button></div></header>`;

function login(){
  root.innerHTML = HEAD + `<div class="w"><div class="c lg"><h2 style="margin:0 0 4px;font-size:1.25rem">Logga in</h2><p class="m">Endast för administratör.</p>
  <div style="margin-bottom:12px"><label for="aem">E-post</label><input id="aem" type="email" autocomplete="username"></div>
  <div style="margin-bottom:12px"><label for="apw">Lösenord</label><input id="apw" type="password" autocomplete="current-password"></div>
  <button type="button" id="ago" class="primary" style="width:100%">Logga in</button><p class="e" id="aerr" role="alert"></p></div></div>`;
  $('aclose').onclick = closeAdmin;
  $('apw').addEventListener('keydown', e => { if (e.key === 'Enter') $('ago').click(); });
  $('ago').onclick = async () => {
    const { data, error } = await sb.auth.signInWithPassword({ email: $('aem').value.trim(), password: $('apw').value });
    error ? $('aerr').textContent = 'Fel e-post eller lösenord.' : shell(data.user.email);
  };
}

function shell(email){
  root.innerHTML = HEAD + `<nav class="at"><div class="atin"><div class="atl"><button type="button" id="tP" aria-pressed="true">Produkter</button><button type="button" id="tH" aria-pressed="false">Orderhistorik</button><button type="button" id="tR" aria-pressed="false">Rapporter</button></div><button type="button" id="aout">Logga ut</button></div></nav><div class="w"><div id="aview"></div></div>`;
  $('aclose').onclick = closeAdmin;
  $('aout').onclick = async () => { await sb.auth.signOut(); login(); };
  const tab = t => { $('tR').setAttribute('aria-pressed', t === 'R'); $('tP').setAttribute('aria-pressed', t === 'P'); $('tH').setAttribute('aria-pressed', t === 'H'); };
  /* flik sparas i adressen (#admin/produkter), så en omladdning stannar kvar på samma sida */
  const go = t => { tab(t); history.replaceState(null, '', t === 'P' ? '#admin/produkter' : t === 'H' ? '#admin/orderhistorik' : '#admin/rapporter'); t === 'P' ? products() : t === 'H' ? orders() : reports(); };
  $('tR').onclick = () => go('R'); $('tP').onclick = () => go('P'); $('tH').onclick = () => go('H');
  go(location.hash === '#admin/rapporter' ? 'R' : location.hash === '#admin/orderhistorik' ? 'H' : 'P');   // Produkter är startsidan
}

/* ---------- RAPPORTER ---------- */
function reports(){
  $('aview').innerHTML = `<div class="c"><div class="g">
  <div><label for="rp">Period</label><select id="rp"><option value="1">Senaste månaden</option><option value="3" selected>Senaste 3 månaderna</option><option value="6">Senaste 6 månaderna</option><option value="12">Senaste 12 månaderna</option><option value="x">Eget datum…</option></select></div>
  <div class="cu" hidden><label for="rf">Från</label><input id="rf" type="date"></div><div class="cu" hidden><label for="rt">Till</label><input id="rt" type="date"></div>
  <div><label for="rteam">Lag / grupp</label><select id="rteam"><option value="">Alla</option></select></div>
  <div><button type="button" id="rrun" class="primary" style="width:100%">Visa</button></div></div>
  <label class="ck"><input type="checkbox" id="rsz"> Dela upp per storlek</label><p class="e" id="rerr" role="alert"></p></div>
  <div class="c"><div class="wr"><table><thead><tr><th class="r">Antal</th><th>Artikel</th><th id="rszh" hidden>Storlek</th><th class="r">À-pris</th><th class="r">Summa</th></tr></thead><tbody id="rrows"></tbody><tfoot id="rfoot"></tfoot></table></div>
  <div class="ac"><button type="button" id="rcsv">Ladda ner Excel (CSV)</button><button type="button" id="rdel" class="dng" style="margin-left:auto">Radera rapportens ordrar</button></div><p class="ok" id="rok" role="status"></p></div>`;
  $('rp').onchange = () => document.querySelectorAll('.cu').forEach(x => x.hidden = $('rp').value !== 'x');
  $('rrun').onclick = fetchReport; $('rteam').onchange = render; $('rsz').onchange = render; $('rcsv').onclick = csv; $('rdel').onclick = delReport;
  fetchReport();
}
function range(){
  const v = $('rp').value, end = new Date(), from = new Date();
  if (v === 'x') return [$('rf').value ? new Date($('rf').value) : new Date(0), $('rt').value ? new Date(new Date($('rt').value).getTime() + 864e5) : new Date(end.getTime() + 864e5)];
  from.setMonth(from.getMonth() - +v); return [from, end];
}
async function fetchReport(){
  $('rerr').textContent = ''; const [a, b] = range(); raw = [];
  for (let f = 0; ; f += 1000){
    const { data, error } = await sb.from('order_items').select('order_id,product_name,size,qty,unit_price,orders!inner(created_at,team)')
      .gte('orders.created_at', a.toISOString()).lt('orders.created_at', b.toISOString()).range(f, f + 999);
    if (error){ $('rerr').textContent = 'Kunde inte hämta data: ' + error.message; return; }
    raw.push(...data); if (data.length < 1000) break;
  }
  const teams = [...new Set(raw.map(r => r.orders.team))].sort((x, y) => x.localeCompare(y, 'sv')), sel = $('rteam').value;
  $('rteam').innerHTML = '<option value="">Alla</option>' + teams.map(t => '<option>' + esc(t) + '</option>').join('');
  $('rteam').value = teams.includes(sel) ? sel : ''; render();
}
function render(){
  const bySize = $('rsz').checked, t = $('rteam').value, g = {};
  raw.filter(r => !t || r.orders.team === t).forEach(r => {
    const k = r.product_name + '|' + r.unit_price + '|' + (bySize ? r.size || '' : '');
    (g[k] = g[k] || { name: r.product_name, size: bySize ? r.size || '–' : '', price: r.unit_price, q: 0 }).q += r.qty;
  });
  report = Object.values(g).sort((x, y) => x.name.localeCompare(y.name, 'sv') || x.size.localeCompare(y.size, 'sv', { numeric: true }) || x.price - y.price);
  $('rszh').hidden = !bySize;
  const tq = report.reduce((s, x) => s + x.q, 0), ts = report.reduce((s, x) => s + x.q * x.price, 0);
  $('rrows').innerHTML = report.length ? report.map(x => `<tr><td class="r">${x.q} st</td><td>${esc(x.name)}</td>${bySize ? '<td>' + esc(x.size) + '</td>' : ''}<td class="r">${kr(x.price)}</td><td class="r">${kr(x.q * x.price)}</td></tr>`).join('') : '<tr><td colspan="5" class="m">Inga beställningar under perioden.</td></tr>';
  $('rdel').disabled = !report.length;
  $('rfoot').innerHTML = report.length ? `<tr><td class="r">${tq} st</td><td colspan="${bySize ? 3 : 2}">Totalt</td><td class="r">${kr(ts)}</td></tr>` : '';
}
/* En rapport räknas ut live från ordrarna. Att radera en rapport = radera ordrarna bakom den (valt filter: period + lag). */
async function delReport(){
  const t = $('rteam').value, rows = raw.filter(r => !t || r.orders.team === t), ids = [...new Set(rows.map(r => r.order_id))];
  if (!ids.length) return;
  const pcs = rows.reduce((a, r) => a + r.qty, 0), sum = rows.reduce((a, r) => a + r.qty * r.unit_price, 0);
  const per = $('rp').value === 'x' ? ($('rf').value || 'början') + ' – ' + ($('rt').value || 'idag') : $('rp').selectedOptions[0].textContent.toLowerCase();
  const yes = await ask({ title: 'Radera rapportens ordrar?', ok: 'Radera ' + ids.length + ' ordrar', word: 'RADERA',
    html: '<p>Rapporten räknas ut från ordrarna, så att radera den betyder att <b>' + ids.length + ' ordrar</b> (' + pcs + ' st, ' + kr(sum) + ') tas bort för perioden <b>' + esc(per) + '</b>' + (t ? ', lag <b>' + esc(t) + '</b>' : ', alla lag') + '.</p><p>De försvinner också ur Orderhistorik och <b>kan inte återskapas</b>. Ladda gärna ner CSV först.</p>' });
  if (!yes) return;
  $('rdel').disabled = true; $('rok').textContent = '';
  let gone = 0, fail = '';
  for (let i = 0; i < ids.length; i += 40){
    const { data, error } = await sb.from('orders').delete().in('id', ids.slice(i, i + 40)).select('id');
    if (error){ fail = 'Kunde inte radera: ' + error.message; break; }
    if (!data || !data.length){ fail = NOPERM; break; }
    gone += data.length;
  }
  await fetchReport();
  if (fail) $('rerr').textContent = fail + (gone ? ' (' + gone + ' av ' + ids.length + ' ordrar hann raderas)' : '');
  if (gone) $('rok').textContent = gone + ' ordrar raderades.';
}
function csv(){
  const bs = $('rsz').checked, rows = [['Antal', 'Artikel'].concat(bs ? ['Storlek'] : [], ['À-pris (kr)', 'Summa (kr)'])]
    .concat(report.map(x => [x.q, x.name].concat(bs ? [x.size] : [], [x.price, x.q * x.price])));
  const a = document.createElement('a'); a.download = 'bestallningar.csv';
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(r => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8' })); a.click();
}

/* ---------- ORDERHISTORIK ---------- */
let ords = [], hPage = 1, hSize = 20;   // hSize 0 = alla
const when = d => new Date(d).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' });
async function orders(){
  $('aview').innerHTML = `<div class="c"><label for="hq">Sök på order-ID, namn, lag eller e-post</label><input id="hq" type="search" autocomplete="off"><p class="e" id="herr" role="alert"></p><p class="ok" id="hok" role="status"></p><div class="pgbar"><span class="m" id="hcount"></span><label>Rader per sida <select id="hsz"><option value="20">20</option><option value="50">50</option><option value="100">100</option><option value="0">Alla</option></select></label></div></div><div class="c"><div id="hlist"><p class="m">Hämtar…</p></div><div class="pgb" id="hpg"></div></div>`;
  ords = []; hPage = 1;
  $('hsz').value = String(hSize);
  for (let f = 0; ; f += 500){
    const { data, error } = await sb.from('orders').select('id,order_no,created_at,name,team,contact,note,order_items(product_name,size,qty,unit_price,ready)')
      .order('created_at', { ascending: false }).range(f, f + 499);
    if (error){ $('hlist').innerHTML = ''; $('herr').textContent = 'Kunde inte hämta ordrar: ' + error.message; return; }
    ords.push(...data); if (data.length < 500) break;
  }
  $('hlist').onclick = async e => {
    const b = e.target.closest('button[data-del]'); if (!b) return;
    const o = ords.find(x => x.id === b.dataset.del); if (!o) return;
    const it = o.order_items || [], tot = it.reduce((a, i) => a + i.qty * i.unit_price, 0);
    const yes = await ask({ title: 'Radera order #' + o.order_no + '?', ok: 'Radera order',
      html: '<p><b>' + esc(o.name) + '</b>, ' + esc(o.team) + ' · ' + when(o.created_at) + '<br>' + it.reduce((a, i) => a + i.qty, 0) + ' st, ' + kr(tot) + '</p><p>Ordern försvinner också ur Rapporter och <b>kan inte återskapas</b>.</p>' });
    if (!yes) return;
    $('herr').textContent = ''; $('hok').textContent = '';
    const { data, error } = await sb.from('orders').delete().eq('id', o.id).select('id');
    if (error) return $('herr').textContent = 'Kunde inte radera: ' + error.message;
    if (!data || !data.length) return $('herr').textContent = NOPERM;
    ords = ords.filter(x => x.id !== o.id); drawOrders(); $('hok').textContent = 'Order #' + o.order_no + ' raderades.';
  };
  $('hq').oninput = () => { hPage = 1; drawOrders(); };
  $('hsz').onchange = () => { hSize = +$('hsz').value; hPage = 1; drawOrders(); };
  $('hpg').onclick = e => { const b = e.target.closest('button[data-p]'); if (!b || b.disabled) return; hPage = +b.dataset.p; drawOrders(); $('hq').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  drawOrders();
}
function drawOrders(){
  const q = $('hq').value.trim().toLowerCase();
  const list = ords.filter(o => !q || [o.order_no, o.name, o.team, o.contact].join(' ').toLowerCase().includes(q));
  const size = hSize || list.length || 1, pages = Math.max(1, Math.ceil(list.length / size));
  hPage = Math.min(Math.max(1, hPage), pages);
  const a = (hPage - 1) * size, shown = list.slice(a, a + size);
  $('hcount').textContent = list.length ? 'Visar ' + (a + 1) + '–' + (a + shown.length) + ' av ' + list.length + (list.length !== ords.length ? ' (filtrerat från ' + ords.length + ')' : '') + ' ordrar, senaste först' : '0 av ' + ords.length + ' ordrar';
  $('hpg').innerHTML = pages > 1 ? pageButtons(hPage, pages) : '';
  $('hlist').innerHTML = list.length ? shown.map(o => {
    const it = o.order_items || [], n = it.filter(i => i.ready).length, tot = it.reduce((s, i) => s + i.qty * i.unit_price, 0);
    const st = !it.length ? '' : n === it.length ? '<span class="ok">Alla klara</span>' : n ? '<span class="m">' + n + ' av ' + it.length + ' klara</span>' : '<span class="m">Ej klara</span>';
    return `<details class="o"><summary><span><b>Order #${esc(o.order_no)} – ${esc(o.team)}</b><span class="m">${when(o.created_at)} · ${esc(o.name)}</span></span><span class="rt">${kr(tot)}<br>${st}</span></summary>
    <dl><dt>Order-ID</dt><dd>#${esc(o.order_no)}</dd><dt>Lagd</dt><dd>${when(o.created_at)}</dd><dt>Beställare</dt><dd>${esc(o.name)}, ${esc(o.team)}</dd><dt>E-post</dt><dd>${esc(o.contact)}</dd>${o.note ? '<dt>Kommentar</dt><dd>' + esc(o.note) + '</dd>' : ''}</dl>
    <div class="wr"><table><thead><tr><th class="r">Antal</th><th>Artikel</th><th>Storlek</th><th class="r">À-pris</th><th class="r">Summa</th><th>Status</th></tr></thead><tbody>${it.map(i => `<tr><td class="r">${i.qty} st</td><td>${esc(i.product_name)}</td><td>${esc(i.size || '–')}</td><td class="r">${kr(i.unit_price)}</td><td class="r">${kr(i.qty * i.unit_price)}</td><td>${i.ready ? '<span class="ok">✔ Klar</span>' : '<span class="m">Ej klar</span>'}</td></tr>`).join('')}</tbody>
    <tfoot><tr><td colspan="4" class="r">Totalt</td><td class="r">${kr(tot)}</td><td></td></tr></tfoot></table></div><div class="ac"><button type="button" class="dng" data-del="${esc(o.id)}">Radera order</button></div></details>`;
  }).join('') : '<p class="m">Inga ordrar hittades.</p>';
}

function pageButtons(cur, pages){
  const nums = [...new Set([1, cur - 1, cur, cur + 1, pages].filter(n => n >= 1 && n <= pages))].sort((x, y) => x - y);
  let out = '<button type="button" data-p="' + (cur - 1) + '"' + (cur === 1 ? ' disabled' : '') + '>‹ Föregående</button>', last = 0;
  nums.forEach(n => { if (n - last > 1) out += '<span class="gap">…</span>'; out += '<button type="button" data-p="' + n + '"' + (n === cur ? ' class="primary" aria-current="page"' : '') + '>' + n + '</button>'; last = n; });
  return out + '<button type="button" data-p="' + (cur + 1) + '"' + (cur === pages ? ' disabled' : '') + '>Nästa ›</button>';
}

/* ---------- PRODUKTER ---------- */
async function products(){
  editing = null; $('aview').innerHTML = '<p class="m">Hämtar…</p>';
  const { data, error } = await sb.from('products').select('*').order('id');
  if (error){ $('aview').innerHTML = '<p class="e">Kunde inte hämta produkter: ' + esc(error.message) + '<br>Har du kört schema-produkter.sql?</p>'; return; }
  prods = data;
  $('aview').innerHTML = `<div class="c"><div class="ac" style="margin:0 0 8px"><button type="button" id="pnew" class="primary">+ Ny produkt</button>
  ${prods.length ? '' : '<button type="button" id="pimp">Importera produkterna som ligger i koden</button>'}</div>
  <div id="plist">${prods.map(p => `<div class="row"><${p.img ? 'img src="' + esc(p.img) + '" alt=""' : 'div'} class="th">${p.img ? '>' : esc(p.emoji) + '</div>'}
  <div class="t"><b>${p.brand ? esc(p.brand) + ' – ' : ''}${esc(p.name)}</b><span class="m">${esc(p.cat)} · ${kr(p.price)}${p.active ? '' : ' · dold'}</span></div><button type="button" data-e="${p.id}">Redigera</button></div>`).join('') || '<p class="m">Inga produkter i databasen ännu.</p>'}</div></div>`;
  $('pnew').onclick = () => form({ cat: 'Kläder', active: true });
  if ($('pimp')) $('pimp').onclick = importStd;
  $('plist').onclick = e => { const id = e.target.dataset.e; if (id) form(prods.find(p => p.id == id)); };
}
async function importStd(){
  const rows = STANDARD.map(p => ({ name: p.name, cat: p.cat, price: p.price, descr: p.desc || '', emoji: p.emoji || '🛍️', color: p.color || '#e6eadf', sizes: p.sizes || null }));
  const { error } = await sb.from('products').insert(rows); error ? alert('Fel: ' + error.message) : products();
}
function form(p){
  editing = p; newImg = null;
  pdlg = popup(p.id ? 'Redigera produkt' : 'Ny produkt', `<div class="g">
  <div><label for="fv">Varumärke</label><input id="fv" value="${esc(p.brand)}" placeholder="t.ex. Adidas"></div>
  <div><label for="fn">Namn</label><input id="fn" value="${esc(p.name)}"></div>
  <div><label for="fc">Kategori</label><select id="fc"><option${p.cat === 'Kläder' ? ' selected' : ''}>Kläder</option><option${p.cat === 'Material' ? ' selected' : ''}>Material</option></select></div>
  <div><label for="fp">Pris (kr)</label><input id="fp" type="number" min="0" inputmode="numeric" value="${p.price == null ? '' : p.price}"></div></div>
  <div style="margin-top:12px"><label for="fd">Beskrivning</label><textarea id="fd" rows="2">${esc(p.descr)}</textarea></div>
  <div style="margin-top:12px"><label for="fs">Storlekar, separerade med komma (lämna tomt = standard för kläder, inga för material)</label><input id="fs" value="${esc((p.sizes || []).join(', '))}"></div>
  <div style="margin-top:12px"><label for="fi">Bild</label><div class="row" style="border:0"><${p.img ? 'img src="' + esc(p.img) + '"' : 'div'} class="th" id="fprev" alt="">${p.img ? '' : '</div>'}<input id="fi" type="file" accept="image/*"></div></div>
  <div style="margin-top:12px"><label for="fb">Åter i lager (valfritt, visas på produktkortet tills datumet passerat)</label><div class="row" style="border:0;padding:0"><input id="fb" type="date" value="${esc(p.back_in_stock || '')}" style="flex:1"><button type="button" id="fbx">Rensa</button></div></div>
  <label class="ck"><input type="checkbox" id="fa"${p.active !== false ? ' checked' : ''}> Visa i butiken</label>
  <p class="e" id="ferr" role="alert"></p>
  <div class="ac"><button type="button" id="fsave" class="primary">Spara</button><button type="button" id="fcancel">Avbryt</button>${p.id ? '<button type="button" id="fdel" class="danger" style="margin-left:auto">Ta bort produkt</button>' : ''}</div>`, { wide: true, dismissable: false });
  $('fbx').onclick = () => { $('fb').value = ''; };
  $('fcancel').onclick = () => pdlg.close();
  $('fi').onchange = async e => { const f = e.target.files[0]; if (!f) return; newImg = await shrink(f); $('fprev').outerHTML = '<img class="th" id="fprev" alt="" src="' + URL.createObjectURL(newImg) + '">'; };
  $('fsave').onclick = save; if ($('fdel')) $('fdel').onclick = del;
}
function shrink(file){   /* förminskar bilden till max 900 px så sidan går snabbt */
  return new Promise((ok, no) => { const im = new Image(); im.onload = () => {
    const k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); c.toBlob(b => b ? ok(b) : no(), 'image/jpeg', .85); };
    im.onerror = no; im.src = URL.createObjectURL(file); });
}
const oldPath = u => u && u.includes('/product-images/') ? decodeURIComponent(u.split('/product-images/')[1]) : null;
async function save(){
  const err = m => $('ferr').textContent = m, name = $('fn').value.trim(), price = parseInt($('fp').value, 10);
  if (!name) return err('Ange ett namn.'); if (isNaN(price) || price < 0) return err('Ange ett pris i hela kronor.');
  $('fsave').disabled = true; err('Sparar…');
  const sizes = $('fs').value.split(',').map(x => x.trim()).filter(Boolean);
  const row = { brand: $('fv').value.trim() || null, name, cat: $('fc').value, price, descr: $('fd').value.trim(), sizes: sizes.length ? sizes : null, active: $('fa').checked, back_in_stock: $('fb').value || null };
  try {
    if (newImg){
      const path = Date.now() + '.jpg', up = await sb.storage.from('product-images').upload(path, newImg, { contentType: 'image/jpeg' });
      if (up.error) throw up.error;
      row.img = sb.storage.from('product-images').getPublicUrl(path).data.publicUrl;
      const o = oldPath(editing.img); if (o) sb.storage.from('product-images').remove([o]);
    }
    const r = editing.id ? await sb.from('products').update(row).eq('id', editing.id) : await sb.from('products').insert(row);
    if (r.error) throw r.error;
    pdlg.close(); products(); if (window.loadProdukter) loadProdukter();
  } catch (e) { err('Kunde inte spara: ' + (e.message || e)); $('fsave').disabled = false; }
}
async function del(){
  const yes = await ask({ title: 'Ta bort produkten?', ok: 'Ta bort produkt', html: '<p><b>' + esc(editing.name) + '</b> tas bort från butiken. Gamla beställningar och rapporter påverkas inte.</p>' });
  if (!yes) return;
  const { error } = await sb.from('products').delete().eq('id', editing.id);
  if (error) return $('ferr').textContent = 'Kunde inte ta bort: ' + error.message;
  const o = oldPath(editing.img); if (o) sb.storage.from('product-images').remove([o]);
  pdlg.close(); products(); if (window.loadProdukter) loadProdukter();
}
})();
