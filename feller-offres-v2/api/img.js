// Proxy d'images produit (Feller / Schneider / grossiste) pour l'export PDF : les CDN d'origine n'autorisent pas la lecture cross-origin depuis le navigateur.
// Hôtes limités à la liste ci-dessous (pas de proxy ouvert), GET seulement, cache CDN 7 jours.
const ALLOWED = ['mam.feller.ch', 'media.w-f.ch', 'www.se.com', 'se.com', 'download.schneider-electric.com', 'online-katalog.feller.ch', 'www.sonepar.ch'];
module.exports = async (req, res) => {
  const u = String((req.query && req.query.u) || '');
  let url; try { url = new URL(u); } catch (e) { return res.status(400).send('url'); }
  if (url.protocol !== 'https:' || !ALLOWED.includes(url.hostname)) return res.status(403).send('host');
  try {
    const r = await fetch(url.toString(), { headers: { 'user-agent': 'Mozilla/5.0 (offres-feller)' }, redirect: 'follow' });
    if (!r.ok) return res.status(r.status).send('upstream');
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
