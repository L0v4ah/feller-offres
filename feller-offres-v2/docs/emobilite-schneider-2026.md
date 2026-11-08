# E-mobilité Schneider — ce que l'app sait (catalogue « EV charging and Storage Solutions 2026 », E-MOBILITY-EVL-CAT051_EN, lu le 31.10.2026)

## Gammes et références
- **Schneider Charge** (villa, blanche) : EVH5A22N2S prise T2S 7,4 / 11 / 22 kW ; EVH5A11N2C5 / C7 câble 5 / 7 m 11 kW ; EVH5A07N2C5 / C7 câble mono 7,4 kW. Filtre DC 6 mA, OCPP 1.6J, eSetup / Wiser Home, entrées iMNx / DSO. Support câble EVA5GH.
- **Schneider Charge Pro** (noire, PPE / flotte à domicile) : EVB4S22N40 prise T2S ; EVB4S22NC0 câble 7 m ; suffixes **M** = MID, **G** = 4G, **MG** = les deux. Ethernet 2 ports (daisy chain ≤ 10 par groupe), Wi-Fi, RFID/NFC, OCPP 1.6J. Pieds EVA2PBS1 (1) / EVA2PBS2 (2), plaque EVA2PCS2, module ISO 15118 EVA2M8 (AFIR), prise de rechange EVP2SSS43.
- **EVlink Pro AC** : EVB3S22N4 (22 kW base), N4A (FI A-SI intégré), N4B / NCB (FI type B-EV), N40M / NC0M (MID), NC0 / NCA (câble 5 m), N4E / N4F (+ prise domestique), N40MR (MID, protections à part, pour kit Metal) ; 11 kW : EVB3S11N4A / NCA ; mono : EVB3S07… MNx intégré sauf versions « 1 » et MID. Accessoires : EVA1MS (4G intégré ≤ 10 bornes), EVA1MM (Metal), EVP3MM + EVP2MX (modem externe > 10 / Expert), EVP1BNS (10 badges), EVA1PBS1 / PBS2 + EVA1PCS2, EVA1PLS1 (verrou câble), EVA1M8 (ISO 15118). Pièces : EVP1SS / EVP1SM / EVP1SCL (façades), EVP1SSS41 / 43 / 51 / 53 / 63 (prises), EVP1CSS321C / 323C (câbles attachés).
- **EVlink Pro AC Metal** : kits EVA1RWKS1 (mural), EVA1RFKS1 / RFKS2 (pied 1 / 2 points), Mureva 13960M / 13979 / 13444, PanelSeT EVA1RFKES, support câble EVA1FWHS12, serrure NSYCL610CSX.
- **Câbles EVlink** T2–T2 : EVP1CNS / CNL / CNX 32322 (tri 5 / 7 / 10 m), …32122 (mono).
- **EVlink Pro DC 60** : EVD1S60TBB (gestion de câbles 3,5 m), TBBC5 / TBBC7 (5 / 7 m), THB (CHAdeMO). 97 A nominal → iC120 4P 125 A C (A9N18480) + Vigi iC120 (A9N18597) 30 mA A-SI. Pieds EVP1DB3LG (740 mm) / DB4LG (1 m) ; DB5 / DB6 pour CHAdeMO. EVA1D60S01 = gestion de câbles ajoutable.
- **StarCharge Fast 60** : EVD2S60TBB, TBBCC (Payter), TBBCC1 (PAX), TBBC7 (7,5 m). 95 A → NSX160/250 4P 160 A + VigiPacT. MID DC, PnC, 97 %.
- **EVlink Pro DC 120 / 150 / 180** : EVD1S120/150/180TBB, suffixes C7, CC, -G. 193 / 242 / 291 A → NSX250 C25F4TM250 (120) ; NSX400 C40F42D400 + LV432465 (150 / 180).
- **StarCharge Fast 120 / 180 / 240 / 320** : EVD2S120/180/240/320TBB[C7][CC][CC1][-G]. 190 / 285 / 380 / 507 A → NSX250H + ML 4.2 ; NSX400H + ML 4.3 ; NSX630 570 A ; NSX630 630 A + VigiPacT.
- **StarCharge Fast 720** : armoires EVD1S360 (→ 480, modules 30 kW, EVD1S483), EVD1S480 (→ 720, modules 40 kW), EVD1S720 ; satellites EVD1D720TBB / TBBC7 / TBBCC (≤ 6, 80 m, 2× CCS2 400 A boost 600 A). 2 arrivées : 2× NSX630 500 A / 630 A, 2× NS800 800 A.

## Gestion de charge
- **Peak Controller** (anti-déclenchement, courant porteur PLC, PV pris en compte) : EVA2HPC3 tri 16–50 A ; EVA4HPC1 mono 16–50 A ; EVA2HPC1 mono 32–100 A. **Uniquement avec Schneider Charge (standard)** — retour terrain Feller du 02.11.2026 : pas compatible Charge Pro (le catalogue 2026 l'annonce pourtant pour les deux : l'app suit le terrain).
- **Resi9 Energy Meter** (Charge Pro seule, anti-déclenchement) : R9MUX6M tri + TI R9MCT80 / 160 / 250 ; R9M80X6M mono + R9MCT80. Modbus RS485, paires illimitées, config eSetup.
- **EcoStruxure EV Charging Expert** : une seule réf. **HMIBX1A0NEVB100SCP** (250 bornes, 20 zones / 4 niveaux, statique ou dynamique, VIP, PV, API BEMS, OCPP 1.6J, 12–24 V DC, 2× Ethernet, Harmony BX1). Autour : alim 24 V DC, switch Ethernet (Modicon), compteur de tête (iEM3155 A9MEM3155, PM5320 METSEPM5320, PowerTag + Panel Server PAS600, NSX via IFE LV434002, MTZ via EIFE LV851001), modem EVP3MM + EVP2MX. Délestage recalculé toutes les 15 min (favorise les derniers arrivés). Licences EVLMSED… uniquement pour les anciens HMIBSCEA53D1ED* (= « Régulateur de charge Evlink 5 / 15 / 250 stations » du grossiste).
- EVlink Pro AC : répartition statique par Master / Extender (grossiste) ; dynamique = Expert + compteur.

## Protections (recommandation catalogue)
- 11 kW → disjoncteur **20 A C** ; 22 kW et 7,4 kW mono → **40 A C**.
- Différentiel 30 mA **type A-SI** (iCV40N RCBO A9DB2616) quand la borne a un RDC-DD 6 mA (toutes les Schneider) ; **type B-EV** (iID A9Z51240) si exigé (HD 60364-7-722) ou borne sans détection DC.
- **iMNX** A9A26969 : déclencheur à minimum de tension, 2e niveau de protection, « obligatoire » selon Schneider si la borne peut être endommagée par un court-circuit aval ; intégré dans la plupart des EVlink Pro AC, à ajouter pour Schneider Charge / Charge Pro.
- En Suisse (NIN) : type A + 6 mA DC = pratique courante → Clario iC40 3LN 20 A / 40 A 30 mA type A (ou Si).

## Distribution et stockage
- Canalis for EV = Canalis **KS** 63–1000 A avec boîtes de départ (solution officielle, canopées outdoor), KN 40–160 A (KNA + KNB FI/LS) pour les petits parkings.
- KPX sous-station préfabriquée pour les hubs.
- Stockage : Schneider Boost Pro 200 kWh / 100 kW + EcoStruxure Energy Asset Controller (sur projet).

## Où c'est dans l'app
- `data/schneider-emob.json` → `emob.js` (fusionné au catalogue côté client) et `api/_data/emob.json` (assistant). Source `src:'se'` = « réf. catalogue 2026, N° ELDAS grossiste à confirmer ».
- Parcours bornes : variantes exactes, Peak Controller selon raccordement (mono/tri), Resi9 Energy Meter, EV Charging Expert + périphérie, iMNX, protections DC par puissance, pièces détachées en qty 0.
- Section « Bornes — tout voir, accessoires, pièces détachées ».
- Assistant (`api/chat.js`) : bloc BORNES réécrit avec toutes les références et règles.

## Règle projet multi-bornes (03.11.2026)
- Dès 2 Charge Pro avec gestion dynamique : EcoStruxure EV Charging Expert + alimentation 24 V DC (ABLM1A24012) + switch Ethernet + compteur de tête Modbus : ≤ 63 A iEM3155 direct ; > 63 A iEM3255 + 3 TI (200/5 A jusqu'à 160 A, 250/5 A jusqu'à 250 A, 400/5 A au-delà). Les TI sont toujours listés.
- Montage Charge Pro : mural sans accessoire ; sur pied EVA2PBS2 (2 bornes) / EVA2PBS1 (1 borne).

## Règles terrain (v13y · 6.11.2026 — liste matériel KBSE + liste de prix EV 06/2026)
- **Gamme** : Schneider Charge Pro en priorité (PPE et flottes). EVlink Pro AC uniquement sur demande.
- **Mise en service Schneider dès 4 bornes** : EVLIBN20_L_NC 180 CHF/borne ; forfait jour EVLIBN20 1 927 CHF quand il revient moins cher (≈ dès 11 bornes ; max 16 bornes/jour, 10 avec EVCE). Moins de 4 bornes : électricien (app eSetup), noté sur la ligne borne.
- **Mesure d'intro (EV Charging Expert)** selon l'introduction : ≤ 63 A PowerTag Flex 63 A A9MEM1570 · ≤ 160 A Flex 160 A A9MEM1580 · ≤ 200 A Rope 200 A A9MEM1590 · ≤ 600 A Rope 600 A A9MEM1591 · > 600 A PM5320 + 3 TI ouvrants METSECT5HG050. Toujours + Panel Server Entry PAS400 + Clario 6 A 3LN A9P54706 (prise de tension). Remplace iEM3155 / iEM3255 + TI.
- **Autour de l'EVCE** : alim 24 V ABLM1A24012, switch Modicon MCSESU053FN0 (≤ 3 bornes) / MCSESU083FN0, LSC 6 A optionnel, modem EVP3MM si 4G.
- **Canalis** (bornes) : élément 3 m KNA40ED4303 / KNA63-100-160ED4306, alimentation KNA63/100/160AB4, kit par borne KNB63LSFI25ACH (type A, Charge Pro) ou EVK8KN4PB25/40 (type B, option), étriers KNB160ZF1, protection de ligne : 40 A iC40 A9P54740 · 63 A iC60N A9F74463 · 100 A NSX 125 C16F3TM125 · 160 A NSX160.
- **Câbles individuels** : FI/LS Clario A9DC3740 (22 kW) / A9DC3720 (11 kW) + iMNX ; option type B-EV A9Z51440 + A9P54740.
- **Prix bruts** : `window.EV_GROSS` dans emob.js (réf. + ELDAS), utilisés quand aucun prix n'est importé ; total brut affiché dans le Pack conseillé.
- **Format d'offre du KAM (mail D. Wagner 3.11.2026)** : mail court à l'installateur + grossiste en copie ; 3 pièces jointes (liste matériel Excel prix brut à transmettre au grossiste, liste de prix EV 2026, schéma unifilaire simplifié) ; arguments borne en puces (câble 7 m ou prise, Wi-Fi, Bluetooth, RFID, protection DC incluse, app iOS/Android, OCPP) ; serveur bornes (délestage dynamique, page web, décompte CSV par badge, connectable à un opérateur Move / Swisscharge) ; mesure d'intro PowerTag + passerelle ; « câblage derrière les compteurs d'appartement ou compteur commun possible ».
- **v13z · mesure directe / indirecte** : question « Mesure à l'introduction ? » — Directe (≤ 63 A) → PowerTag Flex 63 A ; Indirecte → au choix PowerTag Rope (sans TI, recommandé) ou TI + compteur iEM3255 MID. Calibre : PowerTag Flex 160 / Rope 200 / Rope 600 / PM5320 > 600 A ; TI ouvrants 100/5 HG010 · 250/5 HG025 · 500/5 HG050 (fermés CC010 / CC025 / DA040 en option pour du neuf) + Panel Server Universal PAS600.
- **v14 · Panoramas** : vues « Panorama comptage & mesure » et « Panorama e-mobilité » (accueil + bouton « Panorama » dans les résultats) : schéma de principe cliquable, familles avec photo, réf. fabricant, prix brut, + ajouter ; règles clés ; documents (panorama PDF, mini-catalogue PowerTag, iEM METAS, se.com). Fiche produit Schneider : « Fiche se.com », « Fiche technique PDF », « Voir dans le panorama ». Parcours Comptage refait (existant/neuf, TI exacts ouvrants/fermés, iEM3455/3555 en alternative, mesure de l'introduction PowerTag Rope / NSX, passerelle forcée Universal si compteurs Modbus, supervision Energy Hub / PME).
- **v16 · configurateur bornes Charge Pro refait (pratique KAM, 8.11.2026)** : ordre des questions modèle → câble/prise → puissance 11 / 22 kW → nombre exact → fixation → gestion de charge → calibre de l'introduction (1 seule question : PowerTag Flex 63 / Flex 160 / Rope 200 / Rope 600 / PM5320) → refacturation → (départs | backend) → connexion Internet → communication des bornes → distribution.
  - Refacturation : derrière le compteur de chaque appartement (PPE : départ par borne dans le tableau de comptage, pas de MID, pas de Canalis) · compteur commun + backend (bornes MID + badges ; Move / Swisscharge / eCarUp / pas encore choisi / saisie libre) · plusieurs départs (iEM3155 MID par départ + PAS600 à la place du PAS400) · décompte par badge EV Charging Expert (CSV, sans MID) · aucune.
  - Réseau : existant → rien ; pas de réseau → modem 4G EVP3MM (1 port Ethernet, sans Wi-Fi : bornes Wi-Fi → routeur 4G Wi-Fi du commerce) ; 4G intégré (…MG) seulement avec backend et sans EVCE.
  - Communication : Wi-Fi → jamais de switch (liste KAM) ; câblé en guirlande (10 max par chaîne) → switch seulement si le modem 4G (1 port) ou le routeur manque de ports.
  - Protection par borne selon la puissance : 11 kW FI/LS A9DC3720 (alt. B-EV A9Z51425 + A9P54720), 22 kW A9DC3740 (alt. A9Z51440 + A9P54740).
  - Mise en service Schneider toujours en ligne « Option » (non cochée) : EVLIBN20_L_NC × max(4, n) ou forfait jour si moins cher.
  - Résumé d'architecture dans « À savoir pour conseiller ».
- **v16 · navigation** : bouton « Retour » permanent dans la barre du haut (toutes les vues sauf l'accueil) ; les PDF hébergés s'ouvrent dans un lecteur intégré (Retour, Partager le fichier, zoom, ↗ navigateur) au lieu de quitter l'app ; le geste / bouton retour du téléphone ferme d'abord le lecteur.
- **v16 · lots** : bornes et Canalis sortent par lots (Bornes — fourniture · Connexion bâtiment & réseau · Gestion dynamique & mesure · Comptage & refacturation · Distribution Canalis · Protections au tableau · Mise en service). Titres de lot dans le pack ; chaque ligne ajoutée garde son lot → liste et PDF regroupés comme l'offre du KAM. « Documentation par lot » sous le pack : Charge Pro guide d'installation FR (BRU2882901), EV Charging Expert DOCA0164 / DOCA0163 + vidéo HTVEVCE004, PowerTag Flex JYT32195_A, Panel Server DOCA0172EN, notice EVP3MM, iEM METAS, Canalis for EV, guide de mise en service EVSOLCG001EN.
- **v16 · options (8.11)** : mise en service Schneider OBLIGATOIRE (ligne incluse) dès 4 bornes, option en dessous (4 bornes minimum facturées). Parafoudre, badges RFID et protections par borne (FI/LS, iMNX, B-EV, DC) = options suggérées non cochées (« Options suggérées · coche celles à inclure ») ; une option ajoutée porte la mention « option » dans la liste. La liste et le PDF affichent les lots dans l'ordre de l'offre (fourniture → réseau → gestion → comptage → Canalis → protections → mise en service).
