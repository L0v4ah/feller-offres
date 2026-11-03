// Lecture de plan / photo / cahier des charges → relevé structuré par pièce (bêta).
// Le mapping vers les références Feller / Schneider se fait côté client (catalogue + choix de ligne, couleur, montage, niveau connecté).
const KINDS = ['interrupteur', 'va_et_vient', 'inverseur', 'poussoir', 'variateur', 'store', 'prise_t13', 'prise_t13_2', 'prise_t13_3', 'prise_t23', 'prise_usb', 'prise_rj45', 'prise_tv', 'prise_ext', 'interrupteur_ext', 'detecteur_mouvement', 'detecteur_presence', 'thermostat', 'sonnette', 'interphone', 'boite_derivation', 'sortie_cable', 'autre'];
const OTHER = ['tableau', 'borne_recharge', 'luminaire', 'parafoudre', 'detecteur_fumee', 'ventilation', 'pac', 'photovoltaique', 'onduleur', 'reseau', 'autre'];

const SYSTEM = `Tu es un électricien chef de projet suisse qui fait le relevé de matériel d'appareillage pour une offre Feller / Schneider.
On te donne un plan électrique (photo ou PDF), une photo de chantier, ou un cahier des charges / descriptif d'architecte (CFC 232, 233...).
Ton travail : relever TOUT le matériel d'appareillage, pièce par pièce, et le rendre avec l'outil extract_project. Tu ne réponds qu'avec l'outil.

Lecture d'un plan :
- Utilise la légende si elle existe ; sinon les symboles usuels suisses (SN / SIA) : interrupteur = cercle avec un trait, deux traits = schéma 3 (va-et-vient), cercle avec flèche ou « P » = poussoir, variateur = interrupteur avec flèche ou « D », prise = demi-cercle ou rectangle avec traits, le chiffre ou les traits indiquent le nombre de prises (2, 3), « T23 » / « 16A » = prise T23, « USB », « RJ45 » / « EDV », « TV » / « R-TV », « ST » / flèches haut-bas = store, « PIR » / « BM » = détecteur de mouvement, « PM » = détecteur de présence, « Th » = thermostat, cloche = sonnette.
- Compte chaque symbole. Des symboles dessinés au même endroit (collés, alignés, dans un même cadre) = une COMBINAISON : donne-la dans combos avec la disposition (2x1 vertical, 1x2 horizontal, 3x1, 1x3, 2x2) et ses éléments. Ne les compte alors pas une deuxième fois dans items.
- Nomme les pièces comme sur le plan (Séjour, Cuisine, Chambre 1, SdB, Hall, Réduit…), une entrée par pièce, dans l'ordre du plan. Si un élément est hors pièce identifiable, pièce « Divers ». Si le document impose une ligne ou une couleur pour une pièce précise (ex. « séjour en EDIZIO.liv noir »), mets-la dans design / color de la pièce.
- Les luminaires, tableaux, bornes, ventilations, détecteurs de fumée vont dans other.

Lecture d'un cahier des charges :
- Relève les quantités écrites, pièce par pièce si le texte le permet, sinon par zone ou « Général ».
- Repère la marque / ligne de design demandée (EDIZIOdue, EDIZIO.liv, STANDARDdue, ELEMENT, NEVO, « ou équivalent »), la couleur, encastré/apparent, le niveau connecté (KNX, Wiser, Matter, classique), le type de bâtiment, les exigences IP (extérieur, humide), la marque concurrente citée (Hager, Gira…).
- Si le document cite des numéros d'article (Feller 3401.1.FMI.61, Schneider A9…, Hager, Legrand, N° ELDAS 9 chiffres…), recopie-les EXACTEMENT dans ref (et la marque dans brand) sur la ligne concernée : l'offre doit reprendre les mêmes références que la soumission.
- Si le devis est découpé en positions / chapitres (ex. « 232.1 Appareillage », « Pos. 4.2 Tableau »), reporte le numéro et le titre dans section de la pièce ou du lot, pour que l'offre suive la même structure.
- Un poussoir de sonnette, une sonnette, un carillon = kind sonnette (pas poussoir).
- Mets dans questions les points flous à clarifier avec l'architecte (maximum 6, courts).

Règles :
- qty = nombre d'appareils (une prise triple = 1 appareil prise_t13_3).
- Si tu n'es pas sûr d'un symbole, mets confidence « basse » et explique dans detail. N'invente pas de pièces.
- summary : 2 phrases maximum sur ce que tu as lu (type de document, nombre de pièces, ce qui manque).`;

const TOOL = {
  name: 'extract_project',
  description: "Relevé structuré du matériel d'appareillage par pièce.",
  input_schema: {
    type: 'object', required: ['summary', 'rooms'],
    properties: {
      doc_type: { type: 'string', enum: ['plan', 'photo_chantier', 'cahier_des_charges', 'liste', 'offre', 'autre'], description: 'offre = offre / devis d\'installateur avec lignes, quantités et prix' },
      summary: { type: 'string' },
      building: { type: 'string', description: 'villa, appartement, PPE, bureau, commerce, école…' },
      hints: { type: 'object', properties: {
        design: { type: 'string', description: 'EDIZIOdue, EDIZIO.liv, STANDARDdue, ELEMENT, NEVO ou vide' },
        color: { type: 'string', description: 'blanc, noir, gris clair, gris foncé, crema, aluminium… ou vide' },
        mount: { type: 'string', enum: ['ENC', 'AP', ''] },
        smart: { type: 'string', enum: ['classique', 'Wiser', 'KNX', 'Matter', ''] },
        competitor: { type: 'string' }
      } },
      rooms: { type: 'array', items: { type: 'object', required: ['name', 'items'], properties: {
        name: { type: 'string' },
        section: { type: 'string', description: 'position ou chapitre du devis (ex. 232.1 Appareillage) si le document en a' },
        design: { type: 'string', description: 'ligne imposée pour CETTE pièce si le document la précise (ex. EDIZIO.liv au séjour), sinon vide' },
        color: { type: 'string', description: 'couleur imposée pour CETTE pièce si précisée, sinon vide' },
        items: { type: 'array', items: { type: 'object', required: ['kind', 'qty'], properties: {
          kind: { type: 'string', enum: KINDS }, qty: { type: 'integer' }, detail: { type: 'string' }, confidence: { type: 'string', enum: ['haute', 'moyenne', 'basse'] },
          ref: { type: 'string', description: 'numéro d\'article cité tel quel dans le document, sinon vide' }, brand: { type: 'string', description: 'marque de la référence citée (Feller, Schneider, Hager…)' } } } },
        combos: { type: 'array', items: { type: 'object', required: ['layout', 'parts'], properties: {
          layout: { type: 'string', enum: ['2x1', '1x2', '3x1', '1x3', '2x2'] }, parts: { type: 'array', items: { type: 'string', enum: KINDS } }, qty: { type: 'integer' }, detail: { type: 'string' } } } }
      } } },
      other: { type: 'array', items: { type: 'object', required: ['kind', 'qty'], properties: { kind: { type: 'string', enum: OTHER }, qty: { type: 'integer' }, detail: { type: 'string' }, room: { type: 'string' }, section: { type: 'string' }, ref: { type: 'string' }, brand: { type: 'string' } } } },
      questions: { type: 'array', items: { type: 'string' } }
    }
  }
};


// Mode « offre / devis » : lecture ligne par ligne (structure du document conservée) pour reprise et vérification dans l'app.
const SYSTEM_OFFER = `Tu lis une offre, un devis ou une soumission d'installateur électricien suisse (photos de pages ou PDF), pour la reprendre ligne par ligne dans un outil d'offres Feller / Schneider.
Rends le contenu avec l'outil extract_offer, sans texte.
- Garde EXACTEMENT la structure du document : chaque position / chapitre (ex. « 01 Tableau », « 02a Entrée + couloir ») devient une section, dans l'ordre des pages. Une ligne de titre en gras avec un texte descriptif (« Démontage des appareils… ») = desc de la section.
- Chaque ligne du document = une entrée lines, dans l'ordre, même les lignes de main d'oeuvre, câbles, petit matériel, divers. Ne fusionne jamais deux lignes, n'invente rien. Si une ligne continue sur la page suivante, ne la duplique pas.
- text = le texte de la ligne recopié tel quel (désignation complète, sur une seule ligne).
- qty, unit_price, total = nombres (format suisse « 1 155,05 » → 1155.05 ; « 2,000 » → 2). unit = p, pce, m, h, forfait…
- type : materiel (appareil, prise, interrupteur, disjoncteur, combinaison, borne, luminaire…) ; cable (fil, câble, gaine, tube) ; main_oeuvre ; petit_materiel (petit matériel, matériel de raccordement, de fixation) ; divers (imprévus, déplacement, forfait) ; autre.
- brand = marque si lisible ou évidente (Feller pour EDIZIOdue / EDIZIO.liv / STANDARDdue / NEVO, Schneider pour Clario / Resi9 / Acti9, Hager, Legrand…). ref = numéro d'article s'il est écrit.
- suggest (lignes materiel seulement) = une courte requête catalogue pour l'équivalent Feller / Schneider, en français, avec fonction, calibre, pôles, courbe, sensibilité, type, ligne et couleur (ex. « Clario iC40 FI/LS 1P+N C13 30mA type A 1UM », « prise EDIZIOdue T13 blanc encastré »).
- total_read de chaque section = le total imprimé de la section s'il existe. totals = total brut, rabais (%), TVA (%), total net imprimés en fin d'offre.
- number = numéro de l'offre, issuer = entreprise émettrice si lisible, client / objet si lisibles. confidence basse sur une ligne mal lisible (photo floue, ombre).`;
const TOOL_OFFER = { name: 'extract_offer', description: "Offre / devis lu ligne par ligne.", input_schema: { type: 'object', required: ['sections'], properties: {
  number: { type: 'string' }, issuer: { type: 'string' }, client: { type: 'string' }, object: { type: 'string' }, summary: { type: 'string' },
  sections: { type: 'array', items: { type: 'object', required: ['title', 'lines'], properties: {
    code: { type: 'string' }, title: { type: 'string' }, desc: { type: 'string' }, total_read: { type: 'number' },
    lines: { type: 'array', items: { type: 'object', required: ['text', 'type'], properties: {
      text: { type: 'string' }, qty: { type: 'number' }, unit: { type: 'string' }, unit_price: { type: 'number' }, total: { type: 'number' },
      type: { type: 'string', enum: ['materiel', 'cable', 'main_oeuvre', 'petit_materiel', 'divers', 'autre'] },
      brand: { type: 'string' }, ref: { type: 'string' }, suggest: { type: 'string' }, confidence: { type: 'string', enum: ['haute', 'moyenne', 'basse'] } } } } } } },
  totals: { type: 'object', properties: { brut: { type: 'number' }, rabais_pct: { type: 'number' }, tva_pct: { type: 'number' }, net: { type: 'number' } } } } } };

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST uniquement' });
  if (!(await require('./_limit')(req, res, { perMin: 6, perDay: 60 }))) return;
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante sur Vercel' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const images = (Array.isArray(body.images) ? body.images : []).slice(0, 20).filter(s => typeof s === 'string' && s.startsWith('data:image/'));
  const text = typeof body.text === 'string' ? body.text.slice(0, 200000) : '';
  const note = typeof body.note === 'string' ? body.note.slice(0, 1000) : '';
  const learned = typeof body.learned === 'string' ? body.learned.slice(0, 3000) : '';
  if (!images.length && !text.trim()) return res.status(400).json({ error: 'Aucun contenu à lire (image ou texte).' });
  const content = [];
  images.forEach((src, i) => { const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(src); if (m) { content.push({ type: 'text', text: `Page / image ${i + 1}${body.name ? ' de « ' + String(body.name).slice(0, 80) + ' »' : ''} :` }); content.push({ type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } }); } });
  if (text.trim()) content.push({ type: 'text', text: `Texte du document${body.name ? ' « ' + String(body.name).slice(0, 80) + ' »' : ''} :\n\n${text}` });
  const offer = body.mode === 'offre';
  if (offer) content.push({ type: 'text', text: `Lis l'offre ligne par ligne avec extract_offer.${note ? ' Indication de Nicola : ' + note : ''}` }); else content.push({ type: 'text', text: `Fais le relevé complet avec extract_project.${note ? ' Indication de Nicola : ' + note : ''}${learned ? '\n\nHabitudes apprises sur les projets précédents de Nicola (à appliquer si le document ne dit pas autre chose) :\n' + learned : ''}` });
  const call = async (msgs) => {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.PLAN_MODEL || process.env.MODEL || 'claude-sonnet-5-5', max_tokens: 16000, system: offer ? SYSTEM_OFFER : SYSTEM, tools: [offer ? TOOL_OFFER : TOOL], tool_choice: { type: 'auto' }, messages: msgs })
    });
    if (!r.ok) { const t = await r.text(); throw new Error(('API ' + r.status + ' ' + t).slice(0, 300)); }
    return r.json();
  };
  try {
    const msgs = [{ role: 'user', content }];
    let data = await call(msgs);
    let tu = (data.content || []).find(c => c.type === 'tool_use');
    if (!tu) {
      msgs.push({ role: 'assistant', content: data.content && data.content.length ? data.content : [{ type: 'text', text: '…' }] });
      msgs.push({ role: 'user', content: offer ? 'Rends maintenant l\'offre complète avec l\'outil extract_offer, sans texte.' : 'Rends maintenant le relevé complet avec l\'outil extract_project, sans texte.' });
      data = await call(msgs); tu = (data.content || []).find(c => c.type === 'tool_use');
    }
    if (!tu) { const txt = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n'); const m = txt.match(/\{[\s\S]*\}/); if (m) { try { tu = { input: JSON.parse(m[0]) }; } catch (e) {} } }
    if (!tu) return res.status(502).json({ error: 'Lecture impossible', detail: 'pas de relevé renvoyé' });
    return res.status(200).json(offer ? { offer: tu.input, usage: data.usage, stop: data.stop_reason } : { project: tu.input, usage: data.usage, stop: data.stop_reason });
  } catch (e) {
    return res.status(502).json({ error: 'Erreur API modèle', detail: String(e.message).slice(0, 300) });
  }
};
