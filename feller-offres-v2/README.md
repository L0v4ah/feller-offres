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
