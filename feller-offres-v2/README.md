# Offres Feller — outil de recherche matériel et assistant

Production : https://feller-offres.vercel.app (dépôt GitHub `L0v4ah/feller-offres`, déploiement automatique à chaque commit sur `main`).

## Fichiers
- `index.html` — l'application : recherche vocale/texte, filtres (nouveautés, encastré/apparent/REG, IP44+, ligne de design), fiches techniques, liste de matériel, export PDF, liens configurateurs, assistant IA.
- `data.js` — catalogue embarqué côté client (généré par `build_data.py`).
- `api/chat.js` — fonction serverless Vercel : l'assistant (Claude API) avec outil de recherche dans le catalogue.
- `api/_data/catalogue.json` — même catalogue, lu par la fonction serveur.
- `vercel.json` — configuration (inclusion du catalogue dans la fonction, cache de data.js).
- `build_data.py` — reconstruit `data.js` et `api/_data/catalogue.json` à partir de `data/feller-catalogue-fr.json` (+ `data/feller-details-fr.json` si présent).

## Variables d'environnement Vercel (Settings → Environment Variables)
- `ANTHROPIC_API_KEY` — clé API Anthropic (console.anthropic.com).
- `ACCESS_CODE` — code d'accès de l'app (le même que celui saisi à l'ouverture).
- `MODEL` (facultatif) — modèle Claude, par défaut `claude-sonnet-5-5`.
Après ajout d'une variable : Deployments → Redeploy.

## Mettre à jour le catalogue
1. Export liste + fiches techniques depuis online-katalog.feller.ch (demander à Claude : « mets à jour le catalogue Feller »), fichiers dans `data/`.
2. `python3 build_data.py`
3. Commit `data.js` et `api/_data/catalogue.json`.

## Limites
- Catalogue Feller + distribution Schneider CH (Resi9, PrismaSeT, Pragma, Mureva, Clario). Bornes EVlink, TGBT et onduleurs hors base : renvoi vers les configurateurs Schneider.
- Pas de prix ni de stock grossiste.
- Liste de matériel en localStorage (par navigateur). Code d'accès : protège l'assistant (vérifié côté serveur) ; la recherche elle-même reste accessible sans code à qui connaît l'URL.
- Dictée : Chrome, Edge, Safari (pas Firefox).
