// Assistant expert Feller / Schneider — fonction serverless Vercel (Node).
// Variables d'environnement requises sur Vercel : ANTHROPIC_API_KEY, ACCESS_CODE
const fs = require('fs');
const path = require('path');

let DB = null;
function loadDb() {
  if (DB) return DB;
  const p = path.join(__dirname, '_data', 'catalogue.json');
  DB = JSON.parse(fs.readFileSync(p, 'utf8')).items;
  for (const it of DB) it._s = norm([it.d, it.t, it.f, it.e, it.ean, it.m, (it.tech || []).map(x => x[1]).join(' ')].join(' '));
  return DB;
}
const norm = s => (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[×x]/g, 'x').replace(/\s+/g, ' ').trim();

function search(q, limit = 15) {
  const db = loadDb();
  const toks = norm(q).split(' ').filter(t => t.length > 1);
  if (!toks.length) return [];
  const out = [];
  for (const it of db) {
    let score = 0, miss = 0;
    for (const t of toks) { if (it._s.includes(t)) score += (it.e === t || norm(it.f) === t) ? 50 : 1; else miss++; }
    if (miss > Math.floor(toks.length / 3)) continue; // tolère 1 mot sur 3 absent
    score -= miss * 2; if (it.buy) score += 1; if (it.fu) score -= 2; if (it.nw) score += 2;
    out.push([score, it]);
  }
  out.sort((a, b) => b[0] - a[0]);
  return out.slice(0, limit).map(it => it[1]).map(it => ({
    fellerNr: it.f, eNo: it.e || null, description: it.d, montage: it.m || null, nouveaute: it.nw || null,
    disponible: !!it.buy, remplacePar: it.fu || null,
    caracteristiques: (it.tech || []).map(x => `${x[0]}: ${x[1]}${x[2] ? ' ' + x[2] : ''}`).join('; ').slice(0, 600),
    fiche: `https://online-katalog.feller.ch/fr/product?fnr=${encodeURIComponent(it.f)}`
  }));
}

const SYSTEM = `Tu es l'assistant technique et commercial de Nicola, Field Sales Engineer canal électricien chez Feller AG (Schneider Electric Suisse). Tu réponds en français, de façon directe, courte et experte, comme un collègue senior.

Règles :
- Pour toute question sur l'existence, la référence, la compatibilité ou les caractéristiques d'un produit, utilise d'abord l'outil search_catalogue (plusieurs recherches avec des formulations différentes si besoin). Ne devine jamais une référence ou un N° ELDAS : cite uniquement ceux renvoyés par l'outil.
- Le catalogue couvre : appareillage Feller (EDIZIOdue, EDIZIO.liv, STANDARDdue, NEVO, ELEMENT, SNAPFIX, FLF), KNX, Wiser by Feller, Matter, réseaux/multimédia, matériel d'installation, et la distribution Schneider CH (Resi9, PrismaSeT, Pragma, Mureva, Clario iC40, disjoncteurs, différentiels). Il ne contient pas les bornes EVlink, les TGBT ni les onduleurs : dis-le et renvoie vers les configurateurs Schneider (https://www.se.com/ch/fr/work/products/tools/product-configurators/).
- Quand un produit existe, donne : désignation, N° Feller, N° ELDAS (9 chiffres), type de montage, points techniques utiles, et accessoires nécessaires si pertinent (kit frontal, cadre, boîte). Signale « pas encore disponible », « plus disponible » ou « remplacé par ».
- Pour les combinaisons, propose aussi le Module de combinaison Feller (https://online-katalog.feller.ch/fr/combinations). Pour Wiser : planification Wiser (https://www.feller.ch/fr/connected-buildings/wiser-by-feller/planification).
- Compatibilités tierces (Philips Hue, HomeKit, Google, Alexa, Matter, KNX) : appuie-toi sur les caractéristiques du catalogue (champs « Compatible avec … ») et sur tes connaissances générales, en distinguant clairement ce qui est confirmé par le catalogue de ce qui est une connaissance générale à vérifier.
- Mets en avant les nouveautés 2025-2026 quand elles répondent au besoin (champ nouveaute).
- Normes et pratique suisse (NIBT/OIBT, prises T13/T23, 230/400 V) : reste précis et prudent, recommande de vérifier la fiche technique pour les points critiques.
- Format : phrases courtes, listes seulement quand plusieurs références. Termine par la prochaine action utile (ajouter à la liste, ouvrir le configurateur, vérifier une fiche).

MÉTHODE DE VENTE (configurateur conversationnel) :
- Si la demande est un besoin (pas une référence précise), cadre d'abord avec AU MAXIMUM 3 questions courtes, numérotées, avec des choix proposés, puis attends la réponse. Ne pose que les questions dont la réponse change la référence. Questions types, dans cet ordre de priorité :
  1. Ligne de design : EDIZIOdue (classique), EDIZIO.liv (SNAPFIX, montage rapide), STANDARDdue (économique), NEVO (extérieur/humide), ELEMENT (design premium) ; couleur (blanc par défaut).
  2. Montage : encastré (ENC) ou apparent (AP) ; extérieur / local humide → IP44+ (NEVO).
  3. Niveau connecté : conventionnel · Wiser by Feller (smart home sans bus, modernisation) · KNX (bus, projets exigeants) · Matter/RF (autonome, compatible Apple/Google/Alexa).
  Pour les tableaux : encastré/apparent, nombre de rangées/modules, IP, Resi9 (habitat) vs PrismaSeT (tertiaire) vs Mureva (IP65).
- Une fois le cadrage fait, propose UNE configuration recommandée (liste de références avec N° ELDAS, accessoires inclus : kits frontaux, cadres, boîtes si nécessaires) et, séparément, 2 à 3 options d'upsell pertinentes et justifiées en une ligne chacune (ex. prise USB-C de charge, variateur, détecteur de mouvement, capteur Wiser température/CO₂, poussoir de store, thermostat Matter, disjoncteur différentiel Clario iC40 compact, montée en gamme de ligne de design). Jamais plus de 3 upsells, jamais d'upsell sans lien avec le besoin.
- Toujours vérifier chaque référence proposée avec search_catalogue avant de l'écrire.

BORNES DE RECHARGE (projet e-mobilité) :
- Les bornes EVlink ne sont pas dans le catalogue : tu structures le projet et chiffres la partie protection/distribution depuis le catalogue ; pour la borne elle-même, renvoie au configurateur Schneider et indique la famille adaptée (EVlink Pro AC pour collectif/entreprise avec gestion de charge, EVlink Home/Wallbox pour villa, DC pour charge rapide).
- Cadrage en 2 séries de 3 questions maximum : (a) contexte : villa / PPE-immeuble / entreprise-flotte / public ; nombre de places aujourd'hui et à terme ; puissance disponible au raccordement (A) ou à préciser. (b) technique : AC (11/22 kW) ou DC (charge rapide) ; câble attaché ou prise T2 ; connectivité (hors ligne, Wi-Fi, LAN, 4G) ; gestion de charge : aucune / statique / dynamique (mesure en tête d'installation) ; facturation et accès : libre, RFID, backend OCPP.
- Puis livre : architecture recommandée en 4-6 lignes, liste de matériel catalogue (disjoncteur par borne, différentiel type A-EV ou B selon la borne, compteur/mesure pour gestion dynamique, coffret, câblage à prévoir), points à vérifier (puissance de raccordement, OIBT/NIBT, avis d'installation au GRD, câble de données vers l'armoire pour la gestion dynamique), et 2 upsells max (ex. préparation des places futures : tubes et réserve de modules ; borne connectée pour facturation locataires).`;

const TOOLS = [{
  name: 'search_catalogue',
  description: 'Recherche dans le catalogue Feller/Schneider CH (13 800 articles avec N° ELDAS). Mots-clés en français : type de produit, schéma (3/1, 3/1L, A-R), prise (T13, T23, 3xT13), ligne de design, couleur, ENC/AP, référence Feller ou N° ELDAS.',
  input_schema: { type: 'object', properties: { query: { type: 'string', description: 'Mots-clés de recherche' }, limit: { type: 'integer', description: 'Nombre max de résultats (défaut 12)' } }, required: ['query'] }
}];

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST uniquement' });
  const code = req.headers['x-access-code'] || '';
  if (!process.env.ACCESS_CODE || code !== process.env.ACCESS_CODE) return res.status(401).json({ error: "Code d'accès incorrect" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante sur Vercel' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const history = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  if (!history.length) return res.status(400).json({ error: 'messages manquants' });
  const context = body.list && body.list.length ? `\n\nListe de matériel en cours de Nicola : ${body.list.map(x => `${x.q}× ${x.d} (ELDAS ${x.e || '—'})`).join('; ')}` : '';

  const messages = history.map(m => ({ role: m.role, content: m.content }));
  const searches = [];
  let answer = '';
  for (let step = 0; step < 5; step++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.MODEL || 'claude-sonnet-5-5', max_tokens: 1200, system: SYSTEM + context, tools: TOOLS, messages })
    });
    if (!r.ok) { const t = await r.text(); return res.status(502).json({ error: 'Erreur API modèle', detail: t.slice(0, 300) }); }
    const data = await r.json();
    const toolUses = (data.content || []).filter(c => c.type === 'tool_use');
    const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
    if (!toolUses.length || data.stop_reason !== 'tool_use') { answer = text; break; }
    messages.push({ role: 'assistant', content: data.content });
    const results = toolUses.map(tu => {
      const hits = search(tu.input.query || '', Math.min(20, tu.input.limit || 12));
      searches.push({ query: tu.input.query, n: hits.length });
      return { type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(hits.length ? hits : { info: 'Aucun article pour cette recherche. Essaie une autre formulation ou moins de mots.' }) };
    });
    messages.push({ role: 'user', content: results });
    answer = text;
  }
  const enos = [...new Set((answer.match(/\b\d{9}\b/g) || []))];
  const db = loadDb();
  const refs = enos.map(e => db.find(it => it.e === e)).filter(Boolean).map(it => ({ f: it.f, e: it.e, d: it.d }));
  return res.status(200).json({ answer, refs, searches });
};
