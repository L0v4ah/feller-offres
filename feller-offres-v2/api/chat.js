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
    piecesDetachees: (it.parts || []).slice(0, 8).map(x => `${x[2] > 1 ? x[2] + '× ' : ''}${x[3]} (${x[0]}, ELDAS ${x[1] || '—'})`).join('; ') || undefined,
    caracteristiques: (it.tech || []).filter(x => /montage|IP|Tension|Courant|raccordement|Compatible|Profondeur minimale/i.test(x[0]) && !/false/.test(x[1])).map(x => `${x[0]}: ${x[1]}${x[2] ? ' ' + x[2] : ''}`).join('; ').slice(0, 300),
    fiche: it.url || `https://online-katalog.feller.ch/fr/product?fnr=${encodeURIComponent(it.f)}`
  }));
}

const SYSTEM = `Tu es l'assistant technique et commercial de Nicola, Field Sales Engineer canal électricien chez Feller AG (Schneider Electric Suisse). Tu réponds en français, de façon directe, courte et experte, comme un collègue senior. Tu tutoies Nicola. Pas de markdown lourd : gras (**) et puces (-) seulement, pas de tableaux ni de titres.

Règles :
- Pour toute question sur l'existence, la référence, la compatibilité ou les caractéristiques d'un produit, utilise d'abord l'outil search_catalogue (plusieurs recherches avec des formulations différentes si besoin). Ne devine jamais une référence ou un N° ELDAS : cite uniquement ceux renvoyés par l'outil.
- Le catalogue couvre : appareillage Feller (EDIZIOdue, EDIZIO.liv, STANDARDdue, NEVO, ELEMENT, SNAPFIX, FLF), KNX, Wiser by Feller, Matter, réseaux/multimédia, matériel d'installation, et la distribution Schneider CH (Resi9, PrismaSeT, Pragma, Mureva, Clario iC40, disjoncteurs, différentiels). Il ne contient pas les bornes EVlink, les TGBT ni les onduleurs : dis-le et renvoie vers les configurateurs Schneider (https://www.se.com/ch/fr/work/products/tools/product-configurators/).
- Quand un produit existe, donne : désignation, N° Feller, N° ELDAS (9 chiffres), type de montage, points techniques utiles, et accessoires nécessaires si pertinent (kit frontal, cadre, boîte). Signale « pas encore disponible », « plus disponible » ou « remplacé par ».
- Pour les combinaisons, propose aussi le Module de combinaison Feller (https://online-katalog.feller.ch/fr/combinations). Pour Wiser : planification Wiser (https://www.feller.ch/fr/connected-buildings/wiser-by-feller/planification).
- Compatibilités tierces (Philips Hue, HomeKit, Google, Alexa, Matter, KNX) : réponse en une phrase, basée sur les champs « Compatible avec … » du catalogue ; si le catalogue ne le dit pas, dis « non confirmé par le catalogue » et donne le lien à vérifier. Rappel utile : Philips Hue = Zigbee / Matter ; un produit Feller Matter est compatible via Matter, un produit Wiser ne l'est pas directement.
- Mets en avant les nouveautés 2025-2026 quand elles répondent au besoin (champ nouveaute).
- Normes et pratique suisse (NIBT/OIBT, prises T13/T23, 230/400 V) : reste précis et prudent, recommande de vérifier la fiche technique pour les points critiques.
- FORMAT STRICT (Nicola lit sur mobile, entre deux clients) :
  1. Une phrase de réponse directe (oui / non / voici).
  2. Les références, une par ligne : « - Désignation courte · N° Feller · ELDAS 9 chiffres » (6 lignes max ; quantités si configuration).
  3. Si une information manque ou n'est pas dans le catalogue : une ligne « À vérifier : » avec le lien du catalogue Feller (https://online-katalog.feller.ch/fr/products?search=MOTS) ou Schneider (https://www.se.com/ch/fr/search/?q=MOTS). Ne jamais inventer ni broder.
  4. Une ligne « Ensuite : » avec l'action suivante.
  Maximum 120 mots hors lignes de références. Pas de paragraphe d'explication, pas de rappel de la question, pas de formule de politesse.

VOCABULAIRE DU CATALOGUE (pour formuler les recherches) :
- Schémas : 3/1 = va-et-vient, 3/1L = lumineux, 1/3+3/1P, 6/1 = permutateur, A-R = poussoir. Prises : T13, 2×T13, 3×T13, T23 (16 A), T25, USB A+C.
- Wiser by Feller : « Interrupteur à poussoir … Wiser … WLAN » (appareil principal avec passerelle Wi-Fi intégrée, 1 par installation ou par zone), « Interrupteur stores … Wiser », « Variateur Uni-LED … Wiser », « Poussoir scènes … Wiser », « Station secondaire … Wiser » (commande supplémentaire), « Commande pour interrupteur / stores / variateur » (set de commande sans la partie puissance), « Kit de montage 920-… Wiser » (kit frontal), « Capteur de température ambiante … Wiser ». Il n'y a pas de passerelle séparée : la version WLAN d'un appareil porte la passerelle. Cherche avec ces mots-là (ex. « Wiser interrupteur à poussoir WLAN EDIZIO.liv », « Wiser interrupteur stores EDIZIO.liv »).
- Montage : ENC = encastré, AP = apparent, FLF/FH = montage dans canal ; SNAPFIX = fixation EDIZIO.liv ; « bc » = blanc, « .61 » = blanc, « .60 » = noir.
- Distribution : « Coffret … Resi9 » (rangées × 12/18 UM), « Clario iC40 » disjoncteurs/différentiels, « PrismaSeT », « Pragma », « Mureva » (IP65).
- Fais des recherches COURTES (2 à 4 mots) et au maximum 6 recherches par réponse. Dès que tu as les références principales, réponds ; ne cherche pas tous les accessoires.

PHOTO (si le message contient une image) :
- Identifie ce qu'on voit : marque, famille, fonction, schéma (ex. « interrupteur Hager kallysto 3/1 blanc », « tableau Hager Volta 3 rangées », « borne Zaptec Go »), ou un plan électrique (compte alors les symboles par pièce : prises, interrupteurs, points lumineux, stores).
- Puis cherche l'équivalent Feller / Schneider avec search_catalogue (même fonction, même montage, même schéma) et donne : « Équivalent : … · ELDAS … ». Si c'est déjà un produit Feller/Schneider : donne sa référence actuelle et son remplaçant éventuel.
- Si tu n'es pas sûr de l'identification, dis-le en une ligne et propose les 2 hypothèses les plus probables.

REMPLACEMENT :
- Pièces détachées : la recherche renvoie piecesDetachees (composition d'un set complet ou d'une combinaison : intérieur/mécanisme, kit frontal, cadre de recouvrement, plaque de fixation, suppléments de montage, avec quantités). Quand Nicola demande une pièce détachée, une touche, un cadre ou « en détaché », cite ces pièces avec leur N° Feller et ELDAS, et propose-les dans propose_list avec les quantités de la composition.
- Pour une référence ancienne ou plus disponible, utilise le champ remplacePar renvoyé par la recherche ; sinon cherche la même fonction dans la ligne de design actuelle (EDIZIOdue → EDIZIO.liv SNAPFIX si le client veut moderniser). Réponds « Remplaçant : … · ELDAS … » puis les accessoires à prévoir (kit frontal, cadre) si la ligne change.

CONCURRENCE (le client utilise Hager, ABB, Legrand, Siemens, Zaptec, easee, Wallbox…) :
- Donne l'équivalent Schneider / Feller avec ELDAS, puis UN argument principal en une phrase, factuel et vérifiable, choisi parmi : Clario iC40 FI/LS 1 UM compact (place gagnée dans le tableau) ; Resi9 CX 13/18 modules et portes au choix (pleine, transparente, miroir, magnétique, YOU personnalisable) ; SNAPFIX montage sans vis (temps de pose) ; Feller fabriqué en Suisse à Horgen, SAV et formation locaux ; une seule marque appareillage + tableau + bornes (EVlink / Wallbox) avec gestion de charge Master/Extender dynamique ; disponibilité grossiste 24 h via ELDAS. Ne dénigre jamais le concurrent et n'invente pas de caractéristiques concurrentes : si Nicola veut un comparatif chiffré, dis ce qu'il faut vérifier sur la fiche du concurrent.

MÉTHODE DE VENTE (configurateur conversationnel) :
- Si la demande est un besoin (pas une référence précise), cadre d'abord avec l'outil ask_user : AU MAXIMUM 3 questions à choix, le choix recommandé en premier. N'écris jamais les questions de cadrage dans le texte, passe toujours par ask_user. Ne pose que les questions dont la réponse change la référence ; si le message contient déjà les réponses (ligne, montage, connecté…), ne les redemande pas. Questions types, dans cet ordre de priorité :
  1. Ligne de design : EDIZIOdue (classique), EDIZIO.liv (SNAPFIX, montage rapide), STANDARDdue (économique), NEVO (extérieur/humide), ELEMENT (design premium) ; couleur (blanc par défaut).
  2. Montage : encastré (ENC) ou apparent (AP) ; extérieur / local humide → IP44+ (NEVO).
  3. Niveau connecté : conventionnel · Wiser by Feller (smart home sans bus, modernisation) · KNX (bus, projets exigeants) · Matter/RF (autonome, compatible Apple/Google/Alexa).
  Pour les tableaux : encastré/apparent, nombre de rangées/modules, IP, Resi9 (habitat) vs PrismaSeT (tertiaire) vs Mureva (IP65).
- Une fois le cadrage fait, livre la configuration avec l'outil propose_list (items = la configuration recommandée avec quantités et accessoires nécessaires : kits frontaux, cadres, boîtes ; upsells = 2 à 3 options). N'écris pas la liste dans le texte quand tu utilises propose_list ; le texte sert aux hypothèses et aux points à vérifier. Options d'upsell pertinentes et justifiées en une ligne chacune (ex. prise USB-C de charge, variateur, détecteur de mouvement, capteur Wiser température/CO₂, poussoir de store, thermostat Matter, disjoncteur différentiel Clario iC40 compact, montée en gamme de ligne de design). Jamais plus de 3 upsells, jamais d'upsell sans lien avec le besoin.
- Toujours vérifier chaque référence proposée avec search_catalogue avant de l'écrire.

BORNES DE RECHARGE (projet e-mobilité) :
- Les bornes sont dans le catalogue (source grossiste) : « Station de charge Wallbox 11kW câble / 22kW prise T2 » (villa, Wi-Fi + app), « Station de charge EVlink Pro AC 22kW Master / Extender / câble 5m / FI type A1 ou B1 / Exten.dyn. » (collectif, entreprise ; 1 Master pilote jusqu'à 7 Extender ; Exten.dyn. = gestion dynamique), « EVlink Pro 2×CCS2 » (DC rapide), « Peak Controller » (gestion de charge villa), « Système gestion de charge EVlink ≤15 / ≤50 stations », « Carte RFID EVlink », « Modem EVlink » (4G), « Pied de support / Kit de montage EVlink Pro AC ». Cherche avec ces mots. Pour la configuration fine (couleurs, options, offre projet), renvoie aussi vers https://www.se.com/ch/fr/work/products/tools/product-configurators/ .
- Cadrage avec ask_user en 2 séries de 3 questions maximum : (a) contexte : villa / PPE-immeuble / entreprise-flotte / public ; nombre de places aujourd'hui et à terme ; puissance disponible au raccordement (A) ou à préciser. (b) technique : AC (11/22 kW) ou DC (charge rapide) ; câble attaché ou prise T2 ; connectivité (hors ligne, Wi-Fi, LAN, 4G) ; gestion de charge : aucune / statique / dynamique (mesure en tête d'installation) ; facturation et accès : libre, RFID, backend OCPP.
- Compatibilité gestion de charge (ne jamais mélanger) : Wallbox Schneider Charge (villa) → gestion dynamique avec le module « Peak Controller » (pince de mesure en tête d'installation) ; EVlink Pro AC → répartition statique incluse dans la borne Master qui pilote ses Extenders en Ethernet, gestion dynamique multi-bornes avec le « Régulateur de charge EVlink » (EcoStruxure EV Charging Expert 5 / 15 / 50 / 250 stations) + compteur en tête (PowerTag / PM) ; EVlink Pro DC se pilote aussi par EV Charging Expert. Le « régulateur anti-tripping 3P » concerne l'ancienne EVlink Home, pas la Wallbox actuelle. Fixation : au mur (kit de montage mural) ou sur pied (pied de support 1 ou 2 stations + kit de montage au sol, kit 2e station) ; accessoires câble : support mural pour câble, protection antivol, porte-câbles, boîte de raccordement IP66.
- Puis livre : architecture recommandée en 4-6 lignes, liste de matériel catalogue (disjoncteur par borne, différentiel type A-EV ou B selon la borne, compteur/mesure pour gestion dynamique, coffret, câblage à prévoir), points à vérifier (puissance de raccordement, OIBT/NIBT, avis d'installation au GRD, câble de données vers l'armoire pour la gestion dynamique), et 2 upsells max (ex. préparation des places futures : tubes et réserve de modules ; borne connectée pour facturation locataires).`;

const TOOLS = [{
  name: 'propose_list',
  description: "Livre une configuration / liste de matériel structurée (quantités + justification courte) que Nicola peut ajouter d'un clic à sa liste. À utiliser pour toute proposition de plusieurs références (configuration de pièce, tableau, projet bornes). Chaque eNo doit venir d'un résultat de search_catalogue.",
  input_schema: { type: 'object', properties: {
    title: { type: 'string', description: 'Titre court de la proposition' },
    summary: { type: 'string', description: '1 à 3 phrases : hypothèses prises et points à vérifier' },
    items: { type: 'array', items: { type: 'object', properties: { eNo: { type: 'string' }, qty: { type: 'integer' }, note: { type: 'string', description: 'À quoi sert cette référence, 5 mots' } }, required: ['eNo', 'qty'] } },
    upsells: { type: 'array', items: { type: 'object', properties: { eNo: { type: 'string' }, qty: { type: 'integer' }, note: { type: 'string', description: 'Argument de vente en une ligne' } }, required: ['eNo', 'qty'] } }
  }, required: ['title', 'items'] }
}, {
  name: 'ask_user',
  description: "Pose à Nicola 1 à 3 questions de cadrage à choix (réponses cliquables). À utiliser pour le cadrage au lieu d'écrire les questions dans le texte. Après l'appel, la réponse de l'utilisateur arrive au tour suivant.",
  input_schema: { type: 'object', properties: {
    intro: { type: 'string', description: 'Une phrase courte qui situe (facultatif)' },
    questions: { type: 'array', maxItems: 3, items: { type: 'object', properties: {
      q: { type: 'string', description: 'La question, courte' },
      options: { type: 'array', items: { type: 'string' }, description: '2 à 6 choix courts ; le choix recommandé en premier, suffixé par " (recommandé)" si pertinent' },
      multi: { type: 'boolean', description: 'true si plusieurs réponses possibles' }
    }, required: ['q', 'options'] } }
  }, required: ['questions'] }
}, {
  name: 'search_catalogue',
  description: 'Recherche dans le catalogue Feller/Schneider CH (13 800 articles avec N° ELDAS). Mots-clés en français : type de produit, schéma (3/1, 3/1L, A-R), prise (T13, T23, 3xT13), ligne de design, couleur, ENC/AP, référence Feller ou N° ELDAS.',
  input_schema: { type: 'object', properties: { query: { type: 'string', description: 'Mots-clés de recherche' }, limit: { type: 'integer', description: 'Nombre max de résultats (défaut 12)' } }, required: ['query'] }
}];

function withFinalNudge(messages) {
  const nudge = { type: 'text', text: 'Assez de recherches : réponds maintenant avec les références déjà trouvées, et dis ce qui reste à vérifier.' };
  const m = messages.map(x => ({ ...x }));
  const lastMsg = m[m.length - 1];
  if (lastMsg.role === 'user') lastMsg.content = Array.isArray(lastMsg.content) ? [...lastMsg.content, nudge] : [{ type: 'text', text: lastMsg.content }, nudge];
  else m.push({ role: 'user', content: [nudge] });
  return m;
}

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
  const MAX_STEPS = 7;
  const debug = [];
  async function callModel(msgs, toolChoice, maxTokens) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.MODEL || 'claude-sonnet-5-5', max_tokens: maxTokens, system: SYSTEM + context, tools: TOOLS, tool_choice: toolChoice, messages: msgs })
    });
    if (!r.ok) { const t = await r.text(); throw new Error('API ' + r.status + ' ' + t.slice(0, 300)); }
    return r.json();
  }
  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const last = step === MAX_STEPS - 1;
      const data = await callModel(last ? withFinalNudge(messages) : messages, last ? { type: 'none' } : { type: 'auto' }, 2000);
      const toolUses = (data.content || []).filter(c => c.type === 'tool_use');
      const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
      debug.push({ step, stop: data.stop_reason, tools: toolUses.map(t => t.name), textLen: text.length });
      const prop = toolUses.find(t => t.name === 'propose_list');
      if (prop) {
        const db = loadDb(); const mk = x => { const it = db.find(i => i.e === String(x.eNo).replace(/\D/g, '')); return it ? { f: it.f, e: it.e, d: it.d, q: Math.max(1, +x.qty || 1), note: x.note || '', img: it.img } : null; };
        const proposal = { title: prop.input.title || 'Proposition', summary: prop.input.summary || '', items: (prop.input.items || []).map(mk).filter(Boolean), upsells: (prop.input.upsells || []).map(mk).filter(Boolean) };
        const missing = (prop.input.items || []).length - proposal.items.length;
        return res.status(200).json({ answer: [text, missing > 0 ? `(${missing} référence(s) non trouvée(s) dans le catalogue ont été écartées.)` : ''].filter(Boolean).join('\n'), proposal, refs: [], searches, debug });
      }
      const askQ = toolUses.find(t => t.name === 'ask_user');
      if (askQ) {
        const qs = (askQ.input.questions || []).slice(0, 3).map(q => ({ q: q.q, options: (q.options || []).slice(0, 6), multi: !!q.multi }));
        return res.status(200).json({ answer: [text, askQ.input.intro].filter(Boolean).join('\n'), questions: qs, refs: [], searches, debug });
      }
      if (!toolUses.length || data.stop_reason !== 'tool_use') { answer = text; break; }
      messages.push({ role: 'assistant', content: data.content });
      const results = toolUses.map(tu => {
        const hits = search(tu.input.query || '', Math.min(15, tu.input.limit || 10));
        searches.push({ query: tu.input.query, n: hits.length });
        return { type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(hits.length ? hits : { info: 'Aucun article pour cette recherche. Essaie une autre formulation ou moins de mots.' }) };
      });
      messages.push({ role: 'user', content: results });
      answer = text;
    }
    if (!answer.trim()) {
      // dernier recours : réponse sans outil, à partir de ce qui a été trouvé
      const data = await callModel(withFinalNudge(messages), { type: 'none' }, 2000);
      answer = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
      debug.push({ step: 'final', stop: data.stop_reason, textLen: answer.length });
    }
  } catch (e) {
    return res.status(502).json({ error: 'Erreur API modèle', detail: String(e.message).slice(0, 300), debug });
  }
  const enos = [...new Set((answer.match(/\b\d{9}\b/g) || []))];
  const db = loadDb();
  const refs = enos.map(e => db.find(it => it.e === e)).filter(Boolean).map(it => ({ f: it.f, e: it.e, d: it.d }));
  return res.status(200).json({ answer, refs, searches, debug });
};
