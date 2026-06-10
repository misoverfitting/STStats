import { useState, useEffect } from 'react';
import {
  playerStats as demoOverview,
  characters as demoCharacters,
  bossStats as demoBossStats,
  recentRuns as demoRecentRuns,
  winRateHistory as demoWinRateHistory,
  cardStats as demoCardStats,
} from './data/playerStats';
import StatCard from './components/StatCard';
import CharacterChart from './components/CharacterChart';
import TrendChart from './components/TrendChart';
import BossChart from './components/BossChart';
import RunTable from './components/RunTable';
import CardPicks from './components/CardPicks';
import CollapsibleSection from './components/CollapsibleSection';
import UploadPanel from './components/UploadPanel';

const DEMO_DATA = {
  overview:       demoOverview,
  characters:     demoCharacters,
  bossStats:      demoBossStats,
  recentRuns:     demoRecentRuns,
  winRateHistory: demoWinRateHistory,
  cardStats:      demoCardStats,
};

const SESSION_KEY = 'ststats_userdata';

const TABS = [
  { id: 'all',         label: 'All'         },
  { id: 'silent',      label: 'Silent'      },
  { id: 'necrobinder', label: 'Necrobinder' },
  { id: 'defect',      label: 'Defect'      },
  { id: 'ironclad',    label: 'Ironclad'    },
  { id: 'regent',      label: 'Regent'      },
];

const streakLabel = (n, type) => type === 'win' ? `${n}W` : `${n}L`;

export default function App() {
  const [page,     setPage]     = useState('upload'); // 'upload' | 'dashboard'
  const [dashData, setDashData] = useState(null);     // null = not yet set
  const [isDemo,   setIsDemo]   = useState(false);
  const [selected, setSelected] = useState('all');

  // Restore saved user data from sessionStorage on first load
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        setDashData(JSON.parse(saved));
        setIsDemo(false);
        setPage('dashboard');
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  function handleUserData(stats) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(stats));
    } catch {
      // sessionStorage full — proceed without persistence
    }
    setDashData(stats);
    setIsDemo(false);
    setPage('dashboard');
  }

  function handleDemo() {
    setDashData(null); // demo uses DEMO_DATA inline
    setIsDemo(true);
    setPage('dashboard');
  }

  function handleChangeData() {
    setPage('upload');
    setSelected('all');
  }

  if (page === 'upload') {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">
            <span className="title-deco">✦</span>
            STStats
            <span className="title-deco">✦</span>
          </h1>
          <p className="app-subtitle">Slay the Spire 2 &mdash; Statistics Dashboard</p>
          <div className="header-rule" />
        </header>
        <UploadPanel onData={handleUserData} onDemo={handleDemo} />
      </div>
    );
  }

  const { overview, characters, bossStats, recentRuns, winRateHistory, cardStats } =
    (isDemo || !dashData) ? DEMO_DATA : dashData;

  const char = selected === 'all' ? null : characters.find(c => c.id === selected);

  const statCards = char
    ? [
        { label: 'Runs',          value: char.runs                              },
        { label: 'Wins',          value: char.wins                              },
        { label: 'Win Rate',      value: `${char.winRate}%`, color: char.color  },
        { label: 'Max Ascension', value: `A${char.highestAscension}`            },
        { label: 'Best Streak',   value: `${char.bestStreak}W`                  },
        { label: 'Fastest Win',   value: char.fastestWin                        },
        { label: 'Playtime',      value: char.playtime                          },
      ]
    : [
        { label: 'Total Runs',     value: overview.totalRuns                                          },
        { label: 'Total Wins',     value: overview.totalWins                                          },
        { label: 'Win Rate',       value: `${overview.winRate}%`                                      },
        { label: 'Current Streak', value: streakLabel(overview.currentStreak, overview.currentStreakType) },
        { label: 'Best Streak',    value: `${overview.bestStreak}W`                                   },
        { label: 'Floors Climbed', value: overview.floorsClimbed.toLocaleString()                     },
        { label: 'Total Playtime', value: overview.totalPlaytime                                      },
      ];

  const filteredRuns = selected === 'all'
    ? recentRuns
    : recentRuns.filter(r => r.character === selected);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-deco">✦</span>
          STStats
          <span className="title-deco">✦</span>
        </h1>
        <p className="app-subtitle">Slay the Spire 2 &mdash; Statistics Dashboard</p>
        <div className="header-source-row">
          <span className="header-source-label">
            {isDemo ? 'Viewing demo data' : 'Your save data'}
          </span>
          <button className="header-change-btn" onClick={handleChangeData}>
            Change data
          </button>
        </div>
        <div className="header-rule" />
      </header>

      <nav className="char-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`char-tab ${tab.id} ${selected === tab.id ? 'active' : ''}`}
            onClick={() => setSelected(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        <CollapsibleSection title="Overview" defaultOpen={false}>
          <div className="stat-cards">
            {statCards.map(s => (
              <StatCard key={s.label} label={s.label} value={s.value} color={s.color} />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Charts" defaultOpen={false}>
          <div className="charts-row-inner">
            <div className="chart-half">
              <h3 className="section-sub-title">Character Win Rates</h3>
              <CharacterChart characters={characters} selected={selected} />
            </div>
            <div className="chart-half">
              <h3 className="section-sub-title">
                Win Rate Trend
                <span className="section-sub"> (10-run rolling avg)</span>
              </h3>
              <TrendChart data={winRateHistory} />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Boss Encounters"
          subtitle=" — sorted by win rate"
          defaultOpen={false}
        >
          <BossChart data={bossStats} />
        </CollapsibleSection>

        <CollapsibleSection
          title="Card Picks"
          subtitle={char ? ` — ${char.name} only` : ''}
          defaultOpen={false}
        >
          <CardPicks cards={cardStats} selectedChar={selected} />
        </CollapsibleSection>

        <CollapsibleSection
          title="Recent Runs"
          subtitle={char ? ` — ${char.name} only` : ''}
          defaultOpen={false}
        >
          <RunTable runs={filteredRuns} />
        </CollapsibleSection>
      </main>

      <footer className="app-footer">
        <p>
          STStats v1.0 &nbsp;·&nbsp; Slay the Spire 2 &nbsp;·&nbsp;{' '}
          {overview.totalRuns} runs parsed
        </p>
      </footer>
    </div>
  );
}
