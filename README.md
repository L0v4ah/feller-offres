# Offres Feller — outil de recherche matériel

Ouvrir `index.html` dans Chrome, Edge ou Safari (double-clic). Aucun serveur, aucune installation.

## Fichiers
- `index.html` — l'application (recherche vocale/texte, liste de matériel, export PDF, liens configurateurs)
- `data.js` — le catalogue Feller (13 817 articles avec N° ELDAS), généré depuis `data/feller-catalogue-fr.json`
- `data/feller-catalogue-fr.json` — export brut de online-katalog.feller.ch (30.10.2026)

## Mettre à jour le catalogue
1. Ouvrir https://online-katalog.feller.ch dans le navigateur et relancer l'export (demander à Claude : « mets à jour le catalogue Feller »).
2. Régénérer `data.js` :
   `python3 -c "import json;d=json.load(open('data/feller-catalogue-fr.json'));open('data.js','w').write('window.FELLER_DATA='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';')"`

## Limites v1
- Catalogue Feller uniquement (appareillage, KNX, Wiser, FLF, REG). Les tableaux, TGBT, onduleurs et bornes EVlink Schneider ne sont pas dans cette base : l'app renvoie vers les configurateurs Schneider.
- Pas de prix ni de stock (données grossiste) : vérifier chez Sonepar / EM / W+F.
- La liste de matériel est enregistrée dans le navigateur (localStorage), pas dans un fichier.
- Brochures : lien vers la fiche produit Feller (onglet Documents), pas de PDF fusionné.
