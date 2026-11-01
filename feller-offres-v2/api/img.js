// Proxy d'images produit (Feller / Schneider / grossiste) : export PDF + secours quand une photo ne s'affiche pas dans le navigateur.
// Hôtes limités à la liste ci-dessous (pas de proxy ouvert), GET seulement, cache CDN 7 jours.
// Feller : si la photo n'existe pas sous ce nom (mam.feller.ch 404), on demande au catalogue en ligne quelle photo il utilise pour l'article (?f=).
const ALLOWED = ['mam.feller.ch', 'media.w-f.ch', 'www.se.com', 'se.com', 'download.schneider-electric.com', 'download.se.com', 'online-katalog.feller.ch', 'www.sonepar.ch'];
const UA = { 'user-agent': 'Mozilla/5.0 (offres-feller)' };
async function fellerImage(f) {
  try {
    const r = await fetch('https://online-katalog.feller.ch/products/' + encodeURIComponent(f) + '?lng=fr', { headers: { ...UA, accept: 'application/json' } });
    if (!r.ok) return null; const j = await r.json(); let exact = null, any = null;
    const walk = o => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(walk);
      if (typeof o.image === 'string' && /^https:\/\/mam\.feller\.ch\//.test(o.image)) { if (!any) any = o.image; const id = o.fnr || o.articleNumber || o.number || o.id; if (id && String(id) === f) exact = o.image; }
      Object.values(o).forEach(walk); };
    walk(j); return exact || any;
  } catch (e) { return null; }
}
module.exports = async (req, res) => {
  const u = String((req.query && req.query.u) || '');
  const f = String((req.query && req.query.f) || '').slice(0, 80);
  let url; try { url = new URL(u); } catch (e) { return res.status(400).send('url'); }
  if (url.protocol !== 'https:' || !ALLOWED.includes(url.hostname)) return res.status(403).send('host');
  try {
    let r = await fetch(url.toString(), { headers: UA, redirect: 'follow' });
    if (!r.ok && url.hostname === 'mam.feller.ch') {
      const alt = await fellerImage(f || decodeURIComponent(url.pathname.split('/').pop() || ''));
      if (alt && alt !== url.toString()) r = await fetch(alt, { headers: UA, redirect: 'follow' });
    }
    if (!r.ok) { res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400'); return res.status(r.status).send('upstream'); }
    const ct = r.headers.get('content-type') || 'image/jpeg';
    if (!/^image\//.test(ct)) return res.status(415).send('type');
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 3 * 1024 * 1024) return res.status(413).send('size');
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(buf);
  } catch (e) { return res.status(502).send('fetch'); }
};
