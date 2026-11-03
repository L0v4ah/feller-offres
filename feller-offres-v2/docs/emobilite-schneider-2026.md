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
