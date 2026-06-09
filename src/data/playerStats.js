// Replace this with your actual stats.
// Run history can be imported from your STS saves at:
//   macOS: ~/Library/Application Support/com.MegaCrit.CardCrawl/runs/
//   Windows: %APPDATA%/SlayTheSpire/runs/

export const playerStats = {
  player: 'Player',
  lastUpdated: '2026-06-08',

  overview: {
    totalRuns: 412,
    totalWins: 167,
    winRate: 40.5,
    currentStreak: 3,
    currentStreakType: 'win',
    bestStreak: 11,
  },

  characters: [
    {
      id: 'ironclad',
      name: 'Ironclad',
      color: '#d45c5c',
      runs: 142,
      wins: 64,
      winRate: 45.1,
      highestAscension: 20,
      avgFloor: 47,
    },
    {
      id: 'silent',
      name: 'Silent',
      color: '#4db87a',
      runs: 118,
      wins: 51,
      winRate: 43.2,
      highestAscension: 18,
      avgFloor: 44,
    },
    {
      id: 'defect',
      name: 'Defect',
      color: '#5c95d4',
      runs: 97,
      wins: 35,
      winRate: 36.1,
      highestAscension: 15,
      avgFloor: 40,
    },
    {
      id: 'watcher',
      name: 'Watcher',
      color: '#a05cd4',
      runs: 55,
      wins: 17,
      winRate: 30.9,
      highestAscension: 12,
      avgFloor: 36,
    },
  ],

  // act: 1=Exordium, 2=City, 3=Beyond, 4=Ending
  bossStats: [
    { name: 'Slime Boss',    act: 1, encounters: 140, victories: 128 },
    { name: 'Hexaghost',     act: 1, encounters: 145, victories: 120 },
    { name: 'Guardian',      act: 1, encounters: 127, victories: 115 },
    { name: 'Champ',         act: 2, encounters: 130, victories: 108 },
    { name: 'Automaton',     act: 2, encounters: 138, victories: 112 },
    { name: 'Collector',     act: 2, encounters: 125, victories:  98 },
    { name: 'Time Eater',    act: 3, encounters: 110, victories:  72 },
    { name: 'Donu & Deca',   act: 3, encounters: 118, victories:  85 },
    { name: 'Awakened One',  act: 3, encounters: 105, victories:  68 },
    { name: 'Corrupt Heart', act: 4, encounters:  45, victories:  18 },
  ].map(b => ({ ...b, winRate: Math.round((b.victories / b.encounters) * 1000) / 10 })),

  recentRuns: [
    { id:  1, character: 'ironclad', ascension: 20, won: true,  floor: 57, score: 2847, date: 'Jun 8'  },
    { id:  2, character: 'silent',   ascension: 18, won: false, floor: 41, score: 1456, date: 'Jun 7'  },
    { id:  3, character: 'ironclad', ascension: 20, won: true,  floor: 57, score: 3102, date: 'Jun 7'  },
    { id:  4, character: 'defect',   ascension: 15, won: false, floor: 35, score:  892, date: 'Jun 6'  },
    { id:  5, character: 'watcher',  ascension: 12, won: true,  floor: 57, score: 2234, date: 'Jun 6'  },
    { id:  6, character: 'ironclad', ascension: 20, won: true,  floor: 57, score: 2991, date: 'Jun 5'  },
    { id:  7, character: 'silent',   ascension: 18, won: true,  floor: 57, score: 2654, date: 'Jun 5'  },
    { id:  8, character: 'defect',   ascension: 15, won: false, floor: 28, score:  634, date: 'Jun 4'  },
    { id:  9, character: 'ironclad', ascension: 20, won: false, floor: 47, score: 1823, date: 'Jun 4'  },
    { id: 10, character: 'watcher',  ascension: 12, won: false, floor: 32, score:  743, date: 'Jun 3'  },
    { id: 11, character: 'silent',   ascension: 18, won: true,  floor: 57, score: 2891, date: 'Jun 3'  },
    { id: 12, character: 'defect',   ascension: 15, won: true,  floor: 57, score: 2445, date: 'Jun 2'  },
    { id: 13, character: 'ironclad', ascension: 20, won: false, floor: 39, score: 1102, date: 'Jun 2'  },
    { id: 14, character: 'watcher',  ascension: 12, won: true,  floor: 57, score: 2178, date: 'Jun 1'  },
    { id: 15, character: 'silent',   ascension: 18, won: false, floor: 44, score: 1567, date: 'Jun 1'  },
    { id: 16, character: 'ironclad', ascension: 20, won: true,  floor: 57, score: 3047, date: 'May 31' },
    { id: 17, character: 'defect',   ascension: 15, won: false, floor: 31, score:  712, date: 'May 31' },
    { id: 18, character: 'silent',   ascension: 18, won: true,  floor: 57, score: 2723, date: 'May 30' },
    { id: 19, character: 'ironclad', ascension: 20, won: false, floor: 43, score: 1389, date: 'May 30' },
    { id: 20, character: 'watcher',  ascension: 12, won: false, floor: 27, score:  521, date: 'May 29' },
  ],
};

// Rolling 10-run win rate for last 50 runs (oldest → newest)
const rawHistory = [
  0,1,0,1,1,0,1,0,0,1,
  1,0,1,1,0,0,1,0,1,1,
  0,1,0,1,0,1,1,0,1,0,
  1,1,0,1,1,0,1,0,1,1,
  0,1,1,0,1,1,0,1,1,1,
];

export const winRateHistory = rawHistory.map((won, i) => {
  const window = rawHistory.slice(Math.max(0, i - 9), i + 1);
  const rate = (window.filter(w => w === 1).length / window.length) * 100;
  return {
    run: 363 + i,
    won: won === 1,
    rollingWinRate: Math.round(rate * 10) / 10,
  };
});
