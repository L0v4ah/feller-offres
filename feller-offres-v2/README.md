# Offres Feller — outil de recherche matériel et assistant

Production : https://feller-offres.vercel.app (dépôt GitHub `L0v4ah/feller-offres`, déploiement automatique à chaque commit sur `main`).

## Fichiers
- `index.html` — l'application : recherche vocale/texte, filtres (nouveautés, encastré/apparent/REG, IP44+, ligne de design), fiches techniques, liste de matériel, export PDF, liens configurateurs, assistant IA.
- `data.js` — catalogue embarqué côté client, allégé (généré par `build_data.py`) ; `tech.json` — fiches techniques et accessoires, chargé en arrière-plan.
- `api/chat.js` — fonction serverless Vercel : l'assistant (Claude API) avec outil de recherche dans le catalogue.
- `api/extract.js` — lecture de plan / photo / cahier des charges (bêta) : relevé structuré par pièce (outil extract_project) ; le choix des références se fait côté client. Variable facultative `PLAN_MODEL`.
- `samples/` — exemples (plan d'appartement, cahier des charges PDF) pour tester l'import.
- `api/_data/catalogue.json.gz` — même catalogue (complet, gzip), lu par la fonction serveur.
- `vercel.json` — configuration (inclusion du catalogue dans la fonction, cache de data.js).
- `build_data.py` — reconstruit `data.js` et `api/_data/catalogue.json` à partir de `data/feller-catalogue-fr.json` + `data/feller-details-fr.json` (fiches techniques, accessoires) + `data/feller-vars-fr.json` (variantes de couleur) + `data/feller-dis-fr.json` (composition / pièces détachées) + `data/ev-sonepar.json` (bornes EVlink, source Sonepar).

## Variables d'environnement Vercel (Settings → Environment Variables)
- `ANTHROPIC_API_KEY` — clé API Anthropic (console.anthropic.com).
- `ACCESS_CODE` — code d'accès de l'app (le même que celui saisi à l'ouverture).
- `MODEL` (facultatif) — modèle Claude, par défaut `claude-sonnet-5-5`.
Après ajout d'une variable : Deployments → Redeploy.

## Mettre à jour le catalogue
Fichiers sources dans `data/` :
- `feller-catalogue-fr.json` — liste Feller (online-katalog.feller.ch, `/products/query?lng=fr&page=N&perPage=50`, 277 pages ; contient `similar` = variantes de couleur et `flags.disassembleItems`).
- `feller-details-fr.json` — fiches techniques, accessoires, dimensions (`/products/{fellerNr}?lng=fr`).
- `feller-vars-fr.json` — variantes de couleur (`{fellerNr:{sim:[[f,e,couleur,désignation,ean,commandable]]}}`).
- `feller-dis-fr.json` — composition / pièces détachées (`{fellerNr:{dis:[[f,e,qté,désignation,'',image]], lv:[application,chapitre], ins}}`).
- `schneider-sonepar.json` — Schneider Electric Suisse complet via sonepar.ch (`{eNo:{e,d,href,img,acc,rep,p}}`) : recherche « Schneider Electric » filtrée fabricant, `&page=620` charge tout d'un coup dans la page (dataLayer + cartes).
- `ev-sonepar.json` — ancien extrait bornes (repli).
Puis `python3 build_data.py` → `data.js`, `tech.json`, `api/_data/catalogue.json.gz` (et horodatage `?v=` dans index.html). Commit ces 4 fichiers.
Rate limit Feller : 429 par session de navigateur (retry-after 60 s) — crawler dans Chrome, pas dans le navigateur intégré.

## Prix bruts
Le champ `p` (CHF) est affiché quand il existe (bouton « Prix bruts » dans la liste, colonne PDF, copie, e-mail). Source à connecter : prix grossiste (Sonepar connecté) ou prix Feller (catalogue connecté) — à capturer dans `schneider-sonepar.json` / fiches Feller puis `build_data.py`.

## Limites
- Catalogue Feller (13 817) + Schneider Electric Suisse via Sonepar (7 429 : Resi9, PrismaSeT XS/XL/G, Pragma, Kaedra, Mureva, Clario iC40, Acti9, iID, iPRD, contacteurs, compteurs, PowerTag, EVlink, Schneider Charge, Charge Pro). Les articles Sonepar (« SE-… ») n'ont pas de fiche technique détaillée. DC 120-180 kW, StarCharge, TGBT, onduleurs : sur projet (configurateurs Schneider).
- Pas de prix ni de stock grossiste.
- Liste de matériel en localStorage (par navigateur). Code d'accès : protège l'assistant (vérifié côté serveur) ; la recherche elle-même reste accessible sans code à qui connaît l'URL.
- Dictée : Chrome, Edge, Safari (pas Firefox).

## v13 (31.10.2026)
- Retour sans perte : pile de vues + historique du navigateur, reprise après rechargement (vue, liste, assistant).
- Progression ✓ / en cours / ✕ avec temps écoulé (import, assistant, PDF) et bouton Réessayer.
- Liste par lots : renommer, ×N, copier, retirer ; désignation par ligne ; fiche au clic.
- PDF réel (jsPDF) avec photos via `api/img.js`, aperçu, partage WhatsApp / Messages / Mail (Web Share), impression en secours.
- Tableau : circuits éclairage / prises demandés, groupes Éclairage et Prises, désignations par circuit, légende UM.
- Import : références citées dans la soumission reprises telles quelles, écarts signalés, sections du devis → lots.

## v13b (31.10.2026)
- Projet en cours persistant : carte « Reprendre » à l'accueil et sur la page import, fil d'Ariane « Relevé : … » dans les parcours lancés depuis le relevé, ← Retour revient au relevé, lot marqué ✓ dans la liste.
- Appels d'offres longs : texte de toutes les pages (150 max), pages électricité conservées en priorité (CFC 23x, appareillage…), PDF scannés jusqu'à 20 pages.
- « Photo ou PDF express » : un PDF (offre concurrente, fiche) est lu (3 pages + texte) et envoyé à l'assistant.
- Bornes : choix explicite DC 60 kW → EVlink Pro DC 60 (stock) ou StarCharge Fast 60 (projet) ; StarCharge 180 / 320 / 720 ; étape « Câbles ou Canalis for EV » dès 3 places avec calcul de la ligne KNA (40–160 A), boîtes de sortie KNB, couvercles, fixations, protection par ligne.
- Nouvelle section « Canalis — gaine à barres » (KN, KBB, KS).

## v13c (31.10.2026)
- Configurateur Canalis (bêta) : usage (bornes / atelier / éclairage / puissance), questions réelles (nombre, puissance, type de borne, gestion dynamique, calibre de ligne 40–160 A tous visibles avec recommandation calculée, disposition, départs, longueur, fixation, angles) → ligne, alimentation, boîtes de sortie, couvercles, étriers, protection par ligne.
- Règle produit : aucune option cachée — toutes les puissances / calibres sont listés, la recommandation est marquée.

## v13d (31.10.2026) — e-mobilité
- Catalogue Schneider « EV charging & Storage 2026 » lu intégralement : 106 références (bornes, variantes MID/4G, pieds, modules ISO 15118, pièces détachées, Peak Controller, Resi9 Energy Meter, EV Charging Expert, modems, compteurs, protections DC) dans `emob.js` + `api/_data/emob.json` (source `se`, N° ELDAS grossiste à confirmer).
- Parcours bornes : références exactes, choix du Peak Controller selon le raccordement, Resi9 Energy Meter / EV Charging Expert + périphérie, iMNX, protections par puissance DC, pièces détachées à proposer (qty 0).
- Section « Bornes — tout voir, accessoires, pièces détachées » ; assistant mis à jour (bloc BORNES complet). Doc : `docs/emobilite-schneider-2026.md`.

## v13e (01.11.2026) — audit UX, premières optimisations
- Accueil en 5 groupes repliables (Lecture automatique · Appareillage · Tableaux & protection · E-mobilité · Énergie & industrie), sous-tuiles ordonnables dans leur groupe.
- Résultats : une carte par produit (couleurs via pastilles) au lieu d'une carte par couleur, sauf si la recherche nomme une couleur.
- Liste : taux de remplissage par tableau (UM utilisés / capacité, réserve 20 %), ⚠ tableau plein, bouton « passer au coffret supérieur », bouton « + zone multimédia ».
- Fiche : lien « Fiche Schneider se.com (photos, docs, CAD) » pour les articles grossiste ; placeholder « photo non disponible » cliquable.
- Cibles tactiles agrandies (boutons, +/−, pastilles, ×) sur écran tactile.
