// Garde-fous coût / abus pour les fonctions IA (sans base de données) :
// - code d'accès comparé en temps constant, pause après un mauvais code, blocage d'une IP après 8 essais ratés (15 min) ;
// - limite par IP : 20 requêtes / minute et 300 / jour par instance (chat), 6 / minute et 60 / jour (lecture de plans) ;
// - plafond global optionnel : variable Vercel DAILY_LIMIT (nombre max d'appels IA par jour et par instance).
// Les compteurs vivent dans la mémoire de l'instance Vercel : protection « best effort », suffisante pour un outil à un utilisateur.
const crypto = require('crypto');
const mem = global.__offresLimits || (global.__offresLimits = { hits: new Map(), bad: new Map(), day: '', total: 0 });
const ipOf = req => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?').split(',')[0].trim();
const sameCode = (a, b) => { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && crypto.timingSafeEqual(x, y); };
module.exports = async function guard(req, res, { perMin = 20, perDay = 300 } = {}) {
  const now = Date.now(), ip = ipOf(req), today = new Date().toISOString().slice(0, 10);
  if (mem.day !== today) { mem.day = today; mem.total = 0; mem.hits.clear(); }
  const b = mem.bad.get(ip);
  if (b && b.n >= 8 && now - b.t < 15 * 60e3) { res.status(429).json({ error: 'Trop d\'essais de code. Réessaie dans 15 minutes.' }); return false; }
  if (!process.env.ACCESS_CODE || !sameCode(req.headers['x-access-code'], process.env.ACCESS_CODE)) {
    const nb = { n: (b && now - b.t < 15 * 60e3 ? b.n : 0) + 1, t: now }; mem.bad.set(ip, nb);
    await new Promise(r => setTimeout(r, Math.min(4000, 400 * nb.n)));
    res.status(401).json({ error: "Code d'accès incorrect" }); return false;
  }
  mem.bad.delete(ip);
  const h = (mem.hits.get(ip) || []).filter(t => now - t < 60e3);
  const dayCount = (mem.hits.get(ip + '|d') || 0);
  if (h.length >= perMin) { res.status(429).json({ error: 'Trop de demandes en une minute, patiente un instant.' }); return false; }
  if (dayCount >= perDay) { res.status(429).json({ error: 'Limite journalière atteinte (protection des coûts).' }); return false; }
  const cap = +process.env.DAILY_LIMIT || 0; if (cap && mem.total >= cap) { res.status(429).json({ error: 'Plafond journalier de l\'app atteint (DAILY_LIMIT).' }); return false; }
  h.push(now); mem.hits.set(ip, h); mem.hits.set(ip + '|d', dayCount + 1); mem.total++;
  return true;
};
