// Proxy de documents PDF officiels (Feller / Schneider) pour le lecteur intégré de l'app : les sites fabricants n'autorisent pas la lecture directe depuis un autre domaine (CORS).
// Hôtes limités, GET seulement, PDF seulement, 25 Mo max, cache CDN 7 jours. Pas de proxy ouvert.
const ALLOWED = ['online-katalog.feller.ch', 'mam.feller.ch', 'www.se.com', 'download.se.com', 'download.schneider-electric.com', 'res.cloudinary.com', 'www.productinfo.schneider-electric.com'];
const UA = { 'user-agent': 'Mozilla/5.0 (offres-feller)', accept: 'application/pdf,*/*' };
module.exports = async (req, res) => {
  const u = String((req.query && req.query.u) || '');
  let url; try { url = new URL(u); } catch (e) { return res.status(400).send('url'); }
  if (url.protocol !== 'https:' || !ALLOWED.includes(url.hostname)) return res.status(403).send('host');
  try {
    const r = await fetch(url.toString(), { headers: UA, redirect: 'follow' });
    if (!r.ok) { res.setHeader('Cache-Control', 'public, max-age=600'); return res.status(r.status).send('upstream'); }
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const buf = Buffer.from(await r.arrayBuffer());
    const isPdf = /pdf/.test(ct) || (buf.length > 4 && buf.subarray(0, 4).toString() === '%PDF');
    if (!isPdf) return res.status(415).send('type');
    if (buf.length > 25 * 1024 * 1024) return res.status(413).send('size');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(buf);
  } catch (e) { return res.status(502).send('fetch'); }
};
