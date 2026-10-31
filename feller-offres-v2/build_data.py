#!/usr/bin/env python3
"""Construit data.js (client) et api/_data/catalogue.json (assistant) à partir de
   data/feller-catalogue-fr.json (liste) et data/feller-details-fr.json (fiches techniques, optionnel).
   Usage : python3 build_data.py   (depuis le dossier du projet)"""
import json, re, os, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
src = json.load(open(os.path.join(ROOT, 'data', 'feller-catalogue-fr.json')))
det_path = os.path.join(ROOT, 'data', 'feller-details-fr.json')
det = json.load(open(det_path)) if os.path.exists(det_path) else {}
vars_path = os.path.join(ROOT, 'data', 'feller-vars-fr.json')
vars_ = json.load(open(vars_path)) if os.path.exists(vars_path) else {}
dis_path = os.path.join(ROOT, 'data', 'feller-dis-fr.json')  # composition (disassembleItems) + chapitre
dis_ = json.load(open(dis_path)) if os.path.exists(dis_path) else {}

# Nouveautés officielles feller.ch (page Nouveautés, 30.10.2026) — règles de reconnaissance
NEW_RULES = [
    ('2026', lambda it: any(l.get('slug') == 'feller-4' for l in it['lab'])),                     # Feller 4 (KNX)
    ('2026', lambda it: it['f'].startswith('3400.D')),                                             # Capteurs température Wiser
    ('2026', lambda it: it['f'].startswith('A9DSC')),                                              # Clario iC40 FI/LS 1UM
    ('2026', lambda it: 'NEVO' in it['d'] and 'SNAPFIX' in it['d']),                               # NEVO SNAPFIX
    ('2025', lambda it: re.search(r'\bELEMENT\b', it['d']) is not None and re.search(r'd[ée]tecteur|USB|store|KNX|Wiser', it['d'], re.I) is not None),  # ELEMENT fonctions élargies
    ('2025', lambda it: re.search(r'matter', it['d'], re.I) is not None),                          # Matter
    ('2025', lambda it: it['f'].startswith('36164-04')),                                           # KNX DALI Broadcast 4x
    ('2026', lambda it: any(l.get('slug') == 'not-yet-available' for l in it['lab'])),             # Pas encore disponible
]

items = []
for it in src['items']:
    labs = [l for l in (it.get('lab') or []) if isinstance(l, dict)]
    it['lab'] = labs
    nw = next((y for y, rule in NEW_RULES if rule(it)), None)
    d = det.get(it['f']) or {}
    feat = d.get('feat') or []
    tech = [[n, v, u] for n, v, u in feat if n]
    mount = next((v for n, v, u in feat if n == 'Type de montage'), None)
    m = {'Encastré': 'ENC', 'Apparent': 'AP', 'Incorporé': 'ENC', 'REG': 'REG', 'Rail DIN': 'REG', 'Rail DIN 35 mm': 'REG', 'Barre DIN': 'REG'}.get(mount or '', None)
    if not m:
        dd = ' ' + it['d'] + ' '
        m = 'ENC' if ' ENC ' in dd else 'AP' if ' AP ' in dd else 'REG' if re.search(r'\.REG\b|\bREG\b|\bUM\b|rail DIN', it['d'] + ' ' + it['f']) else ''
    ip = next((v for n, v, u in feat if n.startswith('Adapté à la classe de protection')), None)
    if not ip:
        mm = re.search(r'\bIP\s?(\d\d)\b', it['d']); ip = 'IP' + mm.group(1) if mm else None
    out = {
        'f': it['f'], 'e': it['e'], 't': it['t'], 'd': it['d'], 'c': it['c'], 'img': it['img'], 'fu': it['fu'],
        'ean': it['ean'], 'buy': it['buy'], 'm': m, 'ip': ip,
        'lab': [l.get('slug') for l in labs if l.get('slug') in ('while-stock', 'no-longer-available', 'not-yet-available', 'spare-part-available-at-feller', 'feller-4')],
    }
    if nw: out['nw'] = nw
    if any(l.get('slug') == 'not-yet-available' for l in labs): out['soon'] = True
    if tech: out['tech'] = tech
    if d.get('acc'): out['acc'] = d['acc']
    if d.get('dim'): out['dim'] = d['dim']
    v = (vars_.get(it['f']) or {}).get('sim') or []
    if len(v) > 1: out['vars'] = [[x[0], x[1], x[2], x[3], x[4], x[5]] for x in v]
    dd_ = dis_.get(it['f']) or {}
    parts = [x for x in (dd_.get('dis') or []) if x and x[0] and x[0] != it['f']]
    if parts: out['parts'] = [[x[0], x[1], x[2], x[3], '', ('' if (x[5] or '').endswith('/pict/' + x[0]) else (x[5] or ''))] for x in parts]
    lv = dd_.get('lv') or []
    if lv and lv[1]: out['ch'] = lv[1]
    items.append(out)

# Schneider Electric CH via Sonepar (E-No, désignation, image, lien) — data/schneider-sonepar.json (dict E-No → item)
# + ancien extrait bornes data/ev-sonepar.json (43 articles) conservé en repli.
EV_RX = re.compile(r"station de charge|evlink|wallbox|charge pro|peak controller|r[ée]gulateur de charge|gestion de charge|c[âa]ble de charge|carte rfid|modem evlink|pied de support|kit de montage (?:evlink|se charge)|poteau de montage|bo[îi]te de raccordement evlink|support mural evlink|antivol evlink|porte-c[âa]bles|support de c[âa]bles ik10|anti-tripping|powertag|charging expert", re.I)
def ev_tech(d):
    tech = []
    if re.search(r'22\s?kW', d): tech.append(['Puissance', '22', 'kW'])
    elif re.search(r'11\s?kW', d): tech.append(['Puissance', '11', 'kW'])
    if 'CCS' in d: tech.append(['Type', 'DC rapide, CCS2', ''])
    if re.search(r'c[âa]ble', d, re.I) and re.search(r'station|charge pro|wallbox', d, re.I): tech.append(['Raccordement véhicule', 'Câble attaché', ''])
    elif re.search(r'prise T2', d, re.I): tech.append(['Raccordement véhicule', 'Prise T2', ''])
    if 'FI type B' in d: tech.append(['Différentiel intégré', 'Type B (DC 6 mA)', ''])
    if 'FI type A' in d: tech.append(['Différentiel intégré', 'Type A + DC 6 mA', ''])
    if 'MID' in d: tech.append(['Compteur', 'MID (facturation)', ''])
    if 'Wi-Fi' in d and '4G' in d: tech.append(['Connectivité', 'Wi-Fi, Ethernet, 4G', ''])
    elif 'Wi-Fi' in d: tech.append(['Connectivité', 'Wi-Fi, Ethernet, app', ''])
    elif '4G' in d: tech.append(['Connectivité', '4G, ISO 15118', ''])
    if 'Master' in d: tech.append(['Rôle', 'Master (pilote les Extender)', ''])
    if 'Extender' in d or 'Exten.' in d: tech.append(['Rôle', 'Extender (piloté par la Master)', ''])
    if re.search(r'Charge Pro', d): tech.append(['Gamme', 'Schneider Charge Pro (noir) — PPE, OCPP 1.6, IP55 IK10', ''])
    if re.search(r'Wallbox', d): tech.append(['Gamme', 'Schneider Charge (blanc) — villa, app', ''])
    if 'dyn' in d: tech.append(['Gestion de charge', 'Dynamique', ''])
    return tech
def mount_of(d):
    dd = ' ' + d + ' '
    if ' ENC ' in dd or ' INC ' in dd: return 'ENC'
    if ' AP ' in dd: return 'AP'
    if re.search(r'\bUM\b|\bREG\b|rail DIN|modules?\b', d): return 'REG'
    return ''
byE = {x['e']: x for x in items if x.get('e')}
sch_path = os.path.join(ROOT, 'data', 'schneider-sonepar.json')
ev_path = os.path.join(ROOT, 'data', 'ev-sonepar.json')
sonepar = {}
if os.path.exists(ev_path):
    for x in json.load(open(ev_path)):
        if x.get('e') and x.get('d'): sonepar[x['e']] = x
if os.path.exists(sch_path):
    raw = json.load(open(sch_path))
    for e, x in (raw.items() if isinstance(raw, dict) else ((x['e'], x) for x in raw)):
        if x.get('d'): sonepar[e] = {**sonepar.get(e, {}), **x}
added = 0
for e, x in sonepar.items():
    d = x['d']
    img = (x.get('img') or '').replace('/thumb/', '/zoom/')
    url = 'https://www.sonepar.ch' + x['href'] if x.get('href', '').startswith('/') else (x.get('url') or '')
    ex = byE.get(e)
    if ex:  # déjà dans le catalogue Feller (même E-No) : on enrichit sans dupliquer
        if url: ex['url'] = url
        if img and (not ex.get('img') or 'nan' in ex['img']): ex['img'] = img
        if x.get('p'): ex['p'] = x['p']
        if x.get('av'): ex['av'] = x['av']
        if x.get('acc') and not ex.get('acc'): ex['sacc'] = x['acc']
        if EV_RX.search(d): ex['cat'] = 'ev'
        continue
    isev = bool(EV_RX.search(d))
    it = {'f': 'SE-' + e, 'e': e, 't': d[:40], 'd': d, 'c': '', 'img': img, 'fu': None, 'ean': None,
          'buy': True, 'm': 'AP' if isev else mount_of(d), 'ip': ('IP55' if 'IP55' in d else (re.search(r'\bIP\s?(\d\d)\b', d).group(0).replace(' ', '') if re.search(r'\bIP\s?(\d\d)\b', d) else None)),
          'lab': (['replacement-available'] if x.get('rep') else []), 'src': 'sonepar', 'url': url, 'av': x.get('av', '')}
    if isev: it['cat'] = 'ev'; it['tech'] = ev_tech(d)
    if x.get('p'): it['p'] = x['p']
    if x.get('acc'): it['sacc'] = x['acc']
    if re.search(r'Charge Pro|StarCharge|PowerTag PTE|iC40|Clario', d): it['nw'] = '2025' if not re.search(r'iC40|Clario', d) else None
    if not it.get('nw'): it.pop('nw', None)
    items.append(it); byE[e] = it; added += 1
print(f"Schneider via Sonepar : {len(sonepar)} articles lus, {added} ajoutés (le reste enrichit des articles existants)")

payload = {'source': 'online-katalog.feller.ch + sonepar.ch (EVlink)', 'lang': 'fr', 'exportedAt': src.get('exportedAt'),
           'builtAt': datetime.datetime.now().isoformat(timespec='seconds'), 'count': len(items),
           'withTech': sum(1 for x in items if x.get('tech')), 'withPrice': sum(1 for x in items if x.get('p')), 'withParts': sum(1 for x in items if x.get('parts')), 'items': items}
js = json.dumps(payload, ensure_ascii=False, separators=(',', ':'))
# Client : data.js allégé (sans fiches techniques ni accessoires) + tech.json chargé en arrière-plan
lite_items, tech = [], {}
for x in items:
    y = {k: v for k, v in x.items() if k not in ('tech', 'acc', 'dim', 'parts', 'ch')}
    lite_items.append(y)
    t = {k: x[k] for k in ('tech', 'acc', 'dim', 'parts', 'ch') if x.get(k)}
    if t: tech[x['f']] = t
lite = dict(payload); lite['items'] = lite_items; lite['techFile'] = 'tech.json'
js_lite = json.dumps(lite, ensure_ascii=False, separators=(',', ':'))
open(os.path.join(ROOT, 'data.js'), 'w').write('window.FELLER_DATA=' + js_lite + ';')
open(os.path.join(ROOT, 'tech.json'), 'w').write(json.dumps(tech, ensure_ascii=False, separators=(',', ':')))
os.makedirs(os.path.join(ROOT, 'api', '_data'), exist_ok=True)
import gzip
with gzip.open(os.path.join(ROOT, 'api', '_data', 'catalogue.json.gz'), 'wt', encoding='utf-8', compresslevel=9) as gz: gz.write(js)
if os.path.exists(os.path.join(ROOT, 'api', '_data', 'catalogue.json')): os.remove(os.path.join(ROOT, 'api', '_data', 'catalogue.json'))
idx = os.path.join(ROOT, 'index.html')
if os.path.exists(idx):
    stamp = datetime.datetime.now().strftime('%Y%m%d%H%M')
    h = open(idx).read(); h2 = re.sub(r'data\.js\?v=\d+', 'data.js?v=' + stamp, h); h2 = re.sub(r'tech\.json\?v=\d+', 'tech.json?v=' + stamp, h2)
    if h2 != h: open(idx, 'w').write(h2)
print(f"data.js allégé = {len(js_lite)/1e6:.1f} Mo, tech.json = {os.path.getsize(os.path.join(ROOT,'tech.json'))/1e6:.1f} Mo")
print(f"{len(items)} articles, {payload['withTech']} avec fiche technique, {payload['withParts']} avec composition, {sum(1 for x in items if x.get('vars'))} avec variantes de couleur, {sum(1 for x in items if x.get('nw'))} nouveautés, data.js = {len(js)/1e6:.1f} Mo")
