const CHAR_CONFIG = {
  'CHARACTER.IRONCLAD':     { id: 'ironclad',     name: 'Ironclad',     color: '#d45c5c' },
  'CHARACTER.SILENT':       { id: 'silent',        name: 'Silent',       color: '#4db87a' },
  'CHARACTER.REGENT':       { id: 'regent',        name: 'Regent',       color: '#d4a827' },
  'CHARACTER.NECROBINDER':  { id: 'necrobinder',   name: 'Necrobinder',  color: '#a05cd4' },
  'CHARACTER.DEFECT':       { id: 'defect',        name: 'Defect',       color: '#5c95d4' },
};

const BOSS_CONFIG = {
  'ENCOUNTER.VANTOM_BOSS':              { name: 'Vantom',              act: 'overgrowth' },
  'ENCOUNTER.THE_KIN_BOSS':             { name: 'The Kin',             act: 'overgrowth' },
  'ENCOUNTER.CEREMONIAL_BEAST_BOSS':    { name: 'Ceremonial Beast',    act: 'overgrowth' },
  'ENCOUNTER.LAGAVULIN_MATRIARCH_BOSS': { name: 'Lagavulin Matriarch', act: 'underdocks' },
  'ENCOUNTER.SOUL_FYSH_BOSS':           { name: 'Soul Fysh',           act: 'underdocks' },
  'ENCOUNTER.WATERFALL_GIANT_BOSS':     { name: 'Waterfall Giant',     act: 'underdocks' },
  'ENCOUNTER.KAISER_CRAB_BOSS':         { name: 'Kaiser Crab',         act: 'hive' },
  'ENCOUNTER.KNOWLEDGE_DEMON_BOSS':     { name: 'Knowledge Demon',     act: 'hive' },
  'ENCOUNTER.THE_INSATIABLE_BOSS':      { name: 'The Insatiable',      act: 'hive' },
  'ENCOUNTER.QUEEN_BOSS':               { name: 'The Queen',           act: 'glory' },
  'ENCOUNTER.TEST_SUBJECT_BOSS':        { name: 'Test Subject',        act: 'glory' },
  'ENCOUNTER.AEONGLASS_BOSS':           { name: 'Aeonglass',           act: 'glory' },
};

const ACT_ORDER = { overgrowth: 1, underdocks: 1, hive: 2, glory: 3 };
const REWARD_NODE_TYPES = new Set(['monster', 'elite', 'boss', 'treasure']);
const SHOP_NODE_TYPES   = new Set(['shop']);
const MIN_OFFERS = 5;

function fmtSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function encounterDisplay(raw) {
  let name = raw.replace('ENCOUNTER.', '');
  const isBoss  = name.endsWith('_BOSS');
  const isElite = name.endsWith('_ELITE');
  name = name.replace('_BOSS', '').replace('_ELITE', '').replace('_NORMAL', '').replace('_WEAK', '');
  name = toTitleCase(name.replace(/_/g, ' '));
  if (isBoss)  name += ' (Boss)';
  else if (isElite) name += ' (Elite)';
  return name;
}

function actReached(run) {
  if (run.win) return 'Clear';
  const n = (run.map_point_history || []).length;
  return `Act ${Math.min(n, 3)}`;
}

function getUserCharacter(players, steamId) {
  if (players.length === 1) return players[0].character;
  if (steamId) {
    const p = players.find(p => String(p.id) === String(steamId));
    if (p) return p.character;
  }
  return players[0]?.character ?? null;
}

function getUserIdx(players, steamId) {
  if (players.length <= 1) return 0;
  if (steamId) {
    const idx = players.findIndex(p => String(p.id) === String(steamId));
    if (idx !== -1) return idx;
  }
  return 0;
}

function cardDisplayName(rawId) {
  return toTitleCase(rawId.replace('CARD.', '').replace(/_/g, ' '));
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

export function parseStats(progressData, runDataArray, steamId = null) {
  const allRuns = [];
  for (const d of runDataArray) {
    try {
      const charKey = getUserCharacter(d.players || [], steamId);
      if (!charKey || !CHAR_CONFIG[charKey]) continue;
      allRuns.push({ _raw: d, char_key: charKey });
    } catch {
      // skip malformed runs
    }
  }
  allRuns.sort((a, b) => a._raw.start_time - b._raw.start_time);

  // ── Character stats ──────────────────────────────────────────────────
  const charStatsRaw = {};
  for (const cs of progressData.character_stats || []) {
    charStatsRaw[cs.id] = cs;
  }

  const characters = [];
  for (const [charKey, cfg] of Object.entries(CHAR_CONFIG)) {
    const cs = charStatsRaw[charKey] || {};
    const wins  = cs.total_wins   || 0;
    const losses = cs.total_losses || 0;
    const total  = wins + losses;
    if (total === 0) continue;
    characters.push({
      id:               cfg.id,
      name:             cfg.name,
      color:            cfg.color,
      runs:             total,
      wins,
      winRate:          round1(wins / total * 100),
      highestAscension: cs.max_ascension     || 0,
      bestStreak:       cs.best_win_streak   || 0,
      currentStreak:    cs.current_streak    || 0,
      playtime:         fmtSeconds(cs.playtime || 0),
      fastestWin:       (cs.fastest_win_time > 0) ? fmtSeconds(cs.fastest_win_time) : '—',
    });
  }
  characters.sort((a, b) => b.runs - a.runs);

  // ── Overview ──────────────────────────────────────────────────────────
  const totalWins   = characters.reduce((s, c) => s + c.wins, 0);
  const totalRuns   = characters.reduce((s, c) => s + c.runs, 0);
  const bestStreak  = characters.reduce((m, c) => Math.max(m, c.bestStreak), 0);

  let currentStreak = 0;
  let currentStreakType = 'win';
  if (allRuns.length > 0) {
    const lastResult = allRuns[allRuns.length - 1]._raw.win;
    currentStreakType = lastResult ? 'win' : 'loss';
    for (let i = allRuns.length - 1; i >= 0; i--) {
      if (allRuns[i]._raw.win === lastResult) currentStreak++;
      else break;
    }
  }

  const overview = {
    totalRuns,
    totalWins,
    winRate:           totalRuns ? round1(totalWins / totalRuns * 100) : 0,
    currentStreak,
    currentStreakType,
    bestStreak,
    floorsClimbed:     progressData.floors_climbed  || 0,
    totalPlaytime:     fmtSeconds(progressData.total_playtime || 0),
  };

  // ── Boss stats ────────────────────────────────────────────────────────
  const encounterMap = {};
  for (const e of progressData.encounter_stats || []) {
    encounterMap[e.encounter_id] = e;
  }

  const bossStats = [];
  for (const [encId, bcfg] of Object.entries(BOSS_CONFIG)) {
    const enc = encounterMap[encId];
    if (!enc) continue;
    const wins   = enc.fight_stats.reduce((s, fs) => s + (fs.wins   || 0), 0);
    const losses = enc.fight_stats.reduce((s, fs) => s + (fs.losses || 0), 0);
    const total  = wins + losses;
    if (total === 0) continue;
    bossStats.push({
      name:       bcfg.name,
      act:        bcfg.act,
      actOrder:   ACT_ORDER[bcfg.act],
      encounters: total,
      victories:  wins,
      winRate:    round1(wins / total * 100),
    });
  }
  bossStats.sort((a, b) =>
    a.actOrder !== b.actOrder ? a.actOrder - b.actOrder : a.winRate - b.winRate
  );

  // ── Recent runs (last 25) ─────────────────────────────────────────────
  const recentRuns = [];
  for (let i = allRuns.length - 1; i >= Math.max(0, allRuns.length - 25); i--) {
    const r   = allRuns[i];
    const d   = r._raw;
    const cfg = CHAR_CONFIG[r.char_key];
    const mp  = d.players || [];
    const allies = mp
      .filter(p => p.character !== r.char_key && CHAR_CONFIG[p.character])
      .map(p => CHAR_CONFIG[p.character].name);
    const kb  = d.killed_by_encounter || 'NONE.NONE';
    const dt  = new Date(d.start_time * 1000);
    const date = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    recentRuns.push({
      id:         d.start_time,
      character:  cfg.id,
      ascension:  d.ascension || 0,
      won:        d.win,
      actReached: actReached(d),
      killedBy:   (!d.win && kb !== 'NONE.NONE') ? encounterDisplay(kb) : '',
      runTime:    fmtSeconds(d.run_time || 0),
      multiplayer: mp.length > 1,
      allies,
      date,
    });
  }

  // ── Win rate trend (last 50 runs, rolling 10-run avg) ─────────────────
  const last50 = allRuns.slice(-50);
  const winRateHistory = last50.map((r, i) => {
    const window = last50.slice(Math.max(0, i - 9), i + 1);
    const rate   = window.reduce((s, w) => s + (w._raw.win ? 1 : 0), 0) / window.length * 100;
    const dt     = new Date(r._raw.start_time * 1000);
    const date   = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return {
      run:           allRuns.length - 50 + i + 1,
      won:           r._raw.win,
      rollingWinRate: round1(rate),
      date,
    };
  });

  // ── Card pick rates ───────────────────────────────────────────────────
  const cardPool = {};
  for (const r of allRuns) {
    const d       = r._raw;
    const cfg     = CHAR_CONFIG[r.char_key];
    const players = d.players || [];
    const userIdx = getUserIdx(players, steamId);

    for (const act of (d.map_point_history || [])) {
      for (const node of act) {
        const ntype = node.map_point_type || '';
        let src;
        if (REWARD_NODE_TYPES.has(ntype))      src = 'reward';
        else if (SHOP_NODE_TYPES.has(ntype))   src = 'shop';
        else continue;

        const psList = node.player_stats || [];
        const ps     = userIdx < psList.length ? psList[userIdx] : (psList[0] || {});

        for (const choice of (ps.card_choices || [])) {
          const cardId = choice.card?.id;
          if (!cardId) continue;
          if (!cardPool[cardId])          cardPool[cardId] = {};
          if (!cardPool[cardId][cfg.id])  cardPool[cardId][cfg.id] = { reward: [0, 0], shop: [0, 0] };
          cardPool[cardId][cfg.id][src][0] += 1;
          if (choice.was_picked) cardPool[cardId][cfg.id][src][1] += 1;
        }
      }
    }
  }

  const cardStats = [];
  for (const [cardId, charData] of Object.entries(cardPool)) {
    let totalOff = 0, totalPk = 0, rewOff = 0, rewPk = 0, shopOff = 0, shopPk = 0;
    const byChar = {};
    for (const [charId, srcs] of Object.entries(charData)) {
      const [rOff, rPk] = srcs.reward;
      const [sOff, sPk] = srcs.shop;
      const off = rOff + sOff;
      const pk  = rPk  + sPk;
      totalOff += off;  totalPk  += pk;
      rewOff   += rOff; rewPk   += rPk;
      shopOff  += sOff; shopPk  += sPk;
      byChar[charId] = { offered: off, picked: pk, pickRate: off ? round1(pk / off * 100) : 0 };
    }
    if (totalOff < MIN_OFFERS) continue;
    cardStats.push({
      id:             cardId.replace('CARD.', ''),
      name:           cardDisplayName(cardId),
      offered:        totalOff,
      picked:         totalPk,
      pickRate:       round1(totalPk / totalOff * 100),
      rewardOffered:  rewOff,
      rewardPicked:   rewPk,
      rewardPickRate: rewOff  ? round1(rewPk  / rewOff  * 100) : 0,
      shopOffered:    shopOff,
      shopPicked:     shopPk,
      shopPickRate:   shopOff ? round1(shopPk / shopOff * 100) : 0,
      byChar,
    });
  }
  cardStats.sort((a, b) => b.offered !== a.offered ? b.offered - a.offered : b.pickRate - a.pickRate);

  return { overview, characters, bossStats, recentRuns, winRateHistory, cardStats };
}

export async function loadFromFiles(fileList) {
  let progressFile = null;
  const runFiles = [];
  let steamId = null;

  for (const file of fileList) {
    const relPath = file.webkitRelativePath || file.name;

    // Try to extract Steam ID from folder path (17-digit numeric segment)
    if (!steamId) {
      for (const part of relPath.split('/')) {
        if (/^\d{17,}$/.test(part)) { steamId = part; break; }
      }
    }

    if (file.name === 'progress.save') progressFile = file;
    else if (file.name.endsWith('.run')) runFiles.push(file);
  }

  if (!progressFile) {
    throw new Error(
      'No progress.save file found. Please select your saves folder ' +
      '(the folder that contains progress.save and a history/ subfolder).'
    );
  }

  const progressText = await progressFile.text();
  let progressData;
  try {
    progressData = JSON.parse(progressText);
  } catch {
    throw new Error('progress.save could not be parsed as JSON. The file may be corrupted.');
  }

  const runDataArray = await Promise.all(
    runFiles.map(async f => {
      try { return JSON.parse(await f.text()); }
      catch { return null; }
    })
  );
  const validRuns = runDataArray.filter(Boolean);

  return parseStats(progressData, validRuns, steamId);
}
