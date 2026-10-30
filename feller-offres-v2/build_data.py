#!/usr/bin/env python3
"""Construit data.js (client) et api/_data/catalogue.json (assistant) à partir de
   data/feller-catalogue-fr.json (liste) et data/feller-details-fr.json (fiches techniques, optionnel).
   Usage : python3 build_data.py   (depuis le dossier du projet)"""
import json, re, os, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
src = json.load(open(os.path.join(ROOT, 'data', 'feller-catalogue-fr.json')))
det_path = os.path.join(ROOT, 'data', 'feller-details-fr.json')
det = json.load(open(det_path)) if os.path.exists(det_path) else {}

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
    items.append(out)

payload = {'source': 'online-katalog.feller.ch', 'lang': 'fr', 'exportedAt': src.get('exportedAt'),
           'builtAt': datetime.datetime.now().isoformat(timespec='seconds'), 'count': len(items),
           'withTech': sum(1 for x in items if x.get('tech')), 'items': items}
js = json.dumps(payload, ensure_ascii=False, separators=(',', ':'))
open(os.path.join(ROOT, 'data.js'), 'w').write('window.FELLER_DATA=' + js + ';')
os.makedirs(os.path.join(ROOT, 'api', '_data'), exist_ok=True)
open(os.path.join(ROOT, 'api', '_data', 'catalogue.json'), 'w').write(js)
print(f"{len(items)} articles, {payload['withTech']} avec fiche technique, {sum(1 for x in items if x.get('nw'))} nouveautés, data.js = {len(js)/1e6:.1f} Mo")
