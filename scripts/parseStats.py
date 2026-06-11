#!/usr/bin/env python3
"""
Parses STS2 save files → src/data/playerStats.js

Run from project root: python3 scripts/parseStats.py
"""

import json
import os
import glob
from datetime import datetime, timezone

# ── Paths ────────────────────────────────────────────────────────────
USER_STEAM_ID = 76561198280896800

SAVE_BASE = os.path.expanduser(
    f'~/Library/Application Support/SlayTheSpire2/steam/{USER_STEAM_ID}/profile1/saves'
)
HISTORY_DIR   = os.path.join(SAVE_BASE, 'history')
PROGRESS_FILE = os.path.join(SAVE_BASE, 'progress.save')
OUTPUT_FILE   = os.path.join(os.path.dirname(__file__), '../src/data/playerStats.js')

# ── Character config ──────────────────────────────────────────────────
CHAR_CONFIG = {
    'CHARACTER.IRONCLAD':    {'id': 'ironclad',    'name': 'Ironclad',    'color': '#d45c5c'},
    'CHARACTER.SILENT':      {'id': 'silent',       'name': 'Silent',      'color': '#4db87a'},
    'CHARACTER.REGENT':      {'id': 'regent',       'name': 'Regent',      'color': '#d4a827'},
    'CHARACTER.NECROBINDER': {'id': 'necrobinder',  'name': 'Necrobinder', 'color': '#a05cd4'},
    'CHARACTER.DEFECT':      {'id': 'defect',       'name': 'Defect',      'color': '#5c95d4'},
}

# ── Boss config ───────────────────────────────────────────────────────
BOSS_CONFIG = {
    'ENCOUNTER.VANTOM_BOSS':              {'name': 'Vantom',              'act': 'overgrowth'},
    'ENCOUNTER.THE_KIN_BOSS':             {'name': 'The Kin',             'act': 'overgrowth'},
    'ENCOUNTER.CEREMONIAL_BEAST_BOSS':    {'name': 'Ceremonial Beast',    'act': 'overgrowth'},
    'ENCOUNTER.LAGAVULIN_MATRIARCH_BOSS': {'name': 'Lagavulin Matriarch', 'act': 'underdocks'},
    'ENCOUNTER.SOUL_FYSH_BOSS':           {'name': 'Soul Fysh',           'act': 'underdocks'},
    'ENCOUNTER.WATERFALL_GIANT_BOSS':     {'name': 'Waterfall Giant',     'act': 'underdocks'},
    'ENCOUNTER.KAISER_CRAB_BOSS':         {'name': 'Kaiser Crab',         'act': 'hive'},
    'ENCOUNTER.KNOWLEDGE_DEMON_BOSS':     {'name': 'Knowledge Demon',     'act': 'hive'},
    'ENCOUNTER.THE_INSATIABLE_BOSS':      {'name': 'The Insatiable',      'act': 'hive'},
    'ENCOUNTER.QUEEN_BOSS':               {'name': 'The Queen',           'act': 'glory'},
    'ENCOUNTER.TEST_SUBJECT_BOSS':        {'name': 'Test Subject',        'act': 'glory'},
    'ENCOUNTER.AEONGLASS_BOSS':           {'name': 'Aeonglass',           'act': 'glory'},
}

ACT_ORDER         = {'overgrowth': 1, 'underdocks': 1, 'hive': 2, 'glory': 3}
REWARD_NODE_TYPES = {'monster', 'elite', 'boss', 'treasure'}
SHOP_NODE_TYPES   = {'shop'}
MIN_OFFERS        = 5

# ── Helpers ───────────────────────────────────────────────────────────

def fmt_seconds(s):
    h = s // 3600
    m = (s % 3600) // 60
    return f'{h}h {m:02d}m' if h else f'{m}m'

def encounter_display(raw):
    name = raw.replace('ENCOUNTER.', '')
    is_boss  = name.endswith('_BOSS')
    is_elite = name.endswith('_ELITE')
    name = name.replace('_BOSS','').replace('_ELITE','').replace('_NORMAL','').replace('_WEAK','')
    name = name.replace('_', ' ').title()
    if is_boss:   name += ' (Boss)'
    elif is_elite: name += ' (Elite)'
    return name

def get_user_character(players):
    if len(players) == 1:
        return players[0]['character']
    for p in players:
        if p.get('id') == USER_STEAM_ID:
            return p['character']
    return None

def get_user_idx(players):
    if len(players) <= 1:
        return 0
    for i, p in enumerate(players):
        if p.get('id') == USER_STEAM_ID:
            return i
    return 0

def act_reached(run):
    if run['win']:
        return 'Clear'
    n = len(run.get('map_point_history', []))
    return f'Act {min(n, 3)}'

def round1(v):
    return round(v * 10) / 10

# ── Load data ─────────────────────────────────────────────────────────

print('Loading progress.save …')
with open(PROGRESS_FILE) as f:
    progress = json.load(f)

print('Loading run history …')
run_files = sorted(glob.glob(os.path.join(HISTORY_DIR, '*.run')))
print(f'  Found {len(run_files)} run files')

all_runs = []
for fp in run_files:
    try:
        with open(fp) as fh:
            d = json.load(fh)
        char_key = get_user_character(d.get('players', []))
        if char_key not in CHAR_CONFIG:
            continue
        all_runs.append({'_raw': d, 'char_key': char_key})
    except Exception as e:
        print(f'  Warning: skipping {os.path.basename(fp)}: {e}')

all_runs.sort(key=lambda r: r['_raw']['start_time'])
print(f'  Parsed {len(all_runs)} valid runs')

# ── Character stats from progress.save ───────────────────────────────

char_stats_raw = {cs['id']: cs for cs in progress.get('character_stats', [])}

characters = []
for char_key, cfg in CHAR_CONFIG.items():
    cs    = char_stats_raw.get(char_key, {})
    wins  = cs.get('total_wins', 0)
    losses = cs.get('total_losses', 0)
    total = wins + losses
    if total == 0:
        continue
    characters.append({
        'id':               cfg['id'],
        'name':             cfg['name'],
        'color':            cfg['color'],
        'runs':             total,
        'wins':             wins,
        'winRate':          round1(wins / total * 100) if total else 0,
        'highestAscension': cs.get('max_ascension', 0),
        'bestStreak':       cs.get('best_win_streak', 0),
        'currentStreak':    cs.get('current_streak', 0),
        'playtime':         fmt_seconds(cs.get('playtime', 0)),
        'fastestWin':       fmt_seconds(cs.get('fastest_win_time', 0)) if cs.get('fastest_win_time', -1) > 0 else '—',
    })

characters.sort(key=lambda c: -c['runs'])

# ── Overview ──────────────────────────────────────────────────────────

total_wins = sum(c['wins'] for c in characters)
total_runs = sum(c['runs'] for c in characters)
best_streak = max((c['bestStreak'] for c in characters), default=0)

current_streak = 0
current_streak_type = 'win'
if all_runs:
    last_result = all_runs[-1]['_raw']['win']
    current_streak_type = 'win' if last_result else 'loss'
    for r in reversed(all_runs):
        if r['_raw']['win'] == last_result:
            current_streak += 1
        else:
            break

overview = {
    'totalRuns':         total_runs,
    'totalWins':         total_wins,
    'winRate':           round1(total_wins / total_runs * 100) if total_runs else 0,
    'currentStreak':     current_streak,
    'currentStreakType': current_streak_type,
    'bestStreak':        best_streak,
    'floorsClimbed':     progress.get('floors_climbed', 0),
    'totalPlaytime':     fmt_seconds(progress.get('total_playtime', 0)),
}

# ── Boss stats ────────────────────────────────────────────────────────

encounter_map = {e['encounter_id']: e for e in progress.get('encounter_stats', [])}

boss_stats = []
for enc_id, bcfg in BOSS_CONFIG.items():
    enc = encounter_map.get(enc_id)
    if not enc:
        continue
    wins   = sum(fs['wins']   for fs in enc['fight_stats'])
    losses = sum(fs['losses'] for fs in enc['fight_stats'])
    total  = wins + losses
    if total == 0:
        continue
    boss_stats.append({
        'name':       bcfg['name'],
        'act':        bcfg['act'],
        'actOrder':   ACT_ORDER[bcfg['act']],
        'encounters': total,
        'victories':  wins,
        'winRate':    round1(wins / total * 100),
    })

boss_stats.sort(key=lambda b: (b['actOrder'], b['winRate']))

# ── Card stats + rawRuns ──────────────────────────────────────────────
# card_pool[card_id][char_id][src] = [offered, picked, win_picked]

card_pool = {}
raw_runs  = []

for r in all_runs:
    d        = r['_raw']
    char_key = r['char_key']
    cfg      = CHAR_CONFIG[char_key]
    players  = d.get('players', [])
    user_idx = get_user_idx(players)
    run_won  = bool(d['win'])

    card_events = []

    for act in d.get('map_point_history', []):
        for node in act:
            ntype = node.get('map_point_type', '')
            if   ntype in REWARD_NODE_TYPES: src = 'reward'
            elif ntype in SHOP_NODE_TYPES:   src = 'shop'
            else: continue

            ps_list = node.get('player_stats', [])
            ps = ps_list[user_idx] if user_idx < len(ps_list) else (ps_list[0] if ps_list else {})

            for choice in ps.get('card_choices', []):
                card_id = choice['card']['id']
                picked  = bool(choice.get('was_picked', False))

                entry = card_pool.setdefault(card_id, {})
                ce    = entry.setdefault(cfg['id'], {'reward': [0,0,0], 'shop': [0,0,0]})
                ce[src][0] += 1
                if picked:
                    ce[src][1] += 1
                    if run_won:
                        ce[src][2] += 1

                card_events.append({
                    'id':     card_id.replace('CARD.', ''),
                    'src':    src,
                    'picked': picked,
                })

    mp     = players
    allies = [CHAR_CONFIG[p['character']]['name'] for p in mp
              if p['character'] != char_key and p['character'] in CHAR_CONFIG]
    kb = d.get('killed_by_encounter', 'NONE.NONE')
    dt = datetime.fromtimestamp(d['start_time'], tz=timezone.utc)

    raw_runs.append({
        'id':          d['start_time'],
        'character':   cfg['id'],
        'ascension':   d.get('ascension', 0),
        'won':         run_won,
        'actReached':  act_reached(d),
        'killedBy':    encounter_display(kb) if not run_won and kb != 'NONE.NONE' else '',
        'runTimeSec':  d.get('run_time', 0),
        'runTime':     fmt_seconds(d.get('run_time', 0)),
        'multiplayer': len(mp) > 1,
        'allies':      allies,
        'date':        dt.strftime('%b %-d'),
        'cardEvents':  card_events,
    })

# Flatten card pool
card_stats_list = []
for card_id, char_data in card_pool.items():
    total_off = total_pk = total_win_pk = 0
    rew_off = rew_pk = shop_off = shop_pk = 0
    by_char = {}
    for char_id, srcs in char_data.items():
        r_off, r_pk, r_win_pk = srcs['reward']
        s_off, s_pk, s_win_pk = srcs['shop']
        off    = r_off + s_off
        pk     = r_pk  + s_pk
        win_pk = r_win_pk + s_win_pk
        total_off   += off;    total_pk    += pk;   total_win_pk += win_pk
        rew_off     += r_off;  rew_pk      += r_pk
        shop_off    += s_off;  shop_pk     += s_pk
        by_char[char_id] = {
            'offered':  off,
            'picked':   pk,
            'pickRate': round1(pk / off * 100) if off else 0,
        }
    if total_off < MIN_OFFERS:
        continue
    card_stats_list.append({
        'id':              card_id.replace('CARD.', ''),
        'name':            card_id.replace('CARD.', '').replace('_', ' ').title(),
        'offered':         total_off,
        'picked':          total_pk,
        'pickRate':        round1(total_pk / total_off * 100),
        'winPicked':       total_win_pk,
        'winPickRate':     round1(total_win_pk / total_pk * 100) if total_pk else None,
        'rewardOffered':   rew_off,
        'rewardPicked':    rew_pk,
        'rewardPickRate':  round1(rew_pk  / rew_off  * 100) if rew_off  else 0,
        'shopOffered':     shop_off,
        'shopPicked':      shop_pk,
        'shopPickRate':    round1(shop_pk / shop_off * 100) if shop_off else 0,
        'byChar':          by_char,
    })

card_stats_list.sort(key=lambda c: (-c['offered'], -c['pickRate']))
print(f'Card stats: {len(card_stats_list)} cards with {MIN_OFFERS}+ offers')

# ── Recent runs (last 25, reverse chron) ─────────────────────────────

recent_runs = [
    {k: v for k, v in rr.items() if k != 'cardEvents'}
    for rr in reversed(raw_runs[-25:])
]

# ── Win rate trend (last 50, rolling 10-run avg) ──────────────────────

last_50 = all_runs[-50:]
win_rate_history = []
for i, r in enumerate(last_50):
    window = last_50[max(0, i - 9):i + 1]
    rate   = sum(1 for w in window if w['_raw']['win']) / len(window) * 100
    d      = r['_raw']
    dt     = datetime.fromtimestamp(d['start_time'], tz=timezone.utc)
    win_rate_history.append({
        'run':            len(all_runs) - 50 + i + 1,
        'won':            d['win'],
        'rollingWinRate': round1(rate),
        'date':           dt.strftime('%b %-d'),
    })

# ── JS serialiser ─────────────────────────────────────────────────────

def js_val(v, indent=0):
    pad = '  ' * indent
    if v is None:
        return 'null'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, str):
        escaped = v.replace('\\', '\\\\').replace("'", "\\'")
        return f"'{escaped}'"
    if isinstance(v, list):
        if not v:
            return '[]'
        items = [js_val(i, indent + 1) for i in v]
        inner = (',\n' + pad + '  ').join(items)
        return f'[\n{pad}  {inner},\n{pad}]'
    if isinstance(v, dict):
        if not v:
            return '{}'
        lines = [f'{pad}  {k}: {js_val(val, indent + 1)}' for k, val in v.items()]
        return '{\n' + ',\n'.join(lines) + ',\n' + pad + '}'
    return repr(v)

def obj_export(name, val, indent=0):
    return f'export const {name} = {js_val(val, indent)};\n'

def arr_export(name, arr):
    pad = '  '
    items = [js_val(item, 1) for item in arr]
    inner = (',\n' + pad).join(items)
    return f'export const {name} = [\n{pad}{inner},\n];\n'

# ── Write output ──────────────────────────────────────────────────────

today = datetime.now().strftime('%Y-%m-%d')
parts = [
    f'// Auto-generated by scripts/parseStats.py on {today}',
    '// Do not edit by hand — re-run the parser to refresh.\n',
    obj_export('playerStats', overview),
    arr_export('characters', characters),
    arr_export('bossStats', boss_stats),
    arr_export('recentRuns', recent_runs),
    arr_export('winRateHistory', win_rate_history),
    arr_export('cardStats', card_stats_list),
    arr_export('rawRuns', raw_runs),
]

output = '\n'.join(parts)
with open(OUTPUT_FILE, 'w') as f:
    f.write(output)

print(f'\n✓ Written to {OUTPUT_FILE}')
print(f'\nOverview:')
print(f'  Total runs:    {overview["totalRuns"]}')
print(f'  Total wins:    {overview["totalWins"]}')
print(f'  Win rate:      {overview["winRate"]}%')
print(f'  Best streak:   {overview["bestStreak"]}W')
print(f'  Total playtime:{overview["totalPlaytime"]}')
print(f'\nCharacters:')
for c in characters:
    print(f'  {c["name"]:<14} {c["runs"]:>3} runs  {c["wins"]:>2} wins  {c["winRate"]:>5.1f}%  A{c["highestAscension"]}')
print(f'\nrawRuns:  {len(raw_runs)} entries')
