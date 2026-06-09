import { useState } from 'react';
import {
  playerStats as overview,
  characters,
  bossStats,
  recentRuns,
  winRateHistory,
} from './data/playerStats';
import StatCard from './components/StatCard';
import CharacterChart from './components/CharacterChart';
import TrendChart from './components/TrendChart';
import BossChart from './components/BossChart';
import RunTable from './components/RunTable';

const TABS = [
  { id: 'all',         label: 'All'         },
  { id: 'silent',      label: 'Silent'      },
  { id: 'necrobinder', label: 'Necrobinder' },
  { id: 'defect',      label: 'Defect'      },
  { id: 'ironclad',    label: 'Ironclad'    },
  { id: 'regent',      label: 'Regent'      },
];

const streakLabel = (n, type) =>
  type === 'win' ? `${n}W` : `${n}L`;

export default function App() {
  const [selected, setSelected] = useState('all');

  const char = selected === 'all' ? null : characters.find(c => c.id === selected);

  const statCards = char
    ? [
        { label: 'Runs',              value: char.runs                          },
        { label: 'Wins',              value: char.wins                          },
        { label: 'Win Rate',          value: `${char.winRate}%`, color: char.color },
        { label: 'Max Ascension',     value: `A${char.highestAscension}`        },
        { label: 'Best Streak',       value: `${char.bestStreak}W`              },
        { label: 'Fastest Win',       value: char.fastestWin                    },
        { label: 'Playtime',          value: char.playtime                      },
      ]
    : [
        { label: 'Total Runs',        value: overview.totalRuns                 },
        { label: 'Total Wins',        value: overview.totalWins                 },
        { label: 'Win Rate',          value: `${overview.winRate}%`             },
        { label: 'Current Streak',    value: streakLabel(overview.currentStreak, overview.currentStreakType) },
        { label: 'Best Streak',       value: `${overview.bestStreak}W`          },
        { label: 'Floors Climbed',    value: overview.floorsClimbed.toLocaleString() },
        { label: 'Total Playtime',    value: overview.totalPlaytime             },
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
        <section className="stat-cards">
          {statCards.map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} color={s.color} />
          ))}
        </section>

        <section className="charts-row">
          <div className="chart-card">
            <h2 className="section-title">Character Win Rates</h2>
            <CharacterChart characters={characters} selected={selected} />
          </div>
          <div className="chart-card">
            <h2 className="section-title">
              Win Rate Trend
              <span className="section-sub"> (10-run rolling avg)</span>
            </h2>
            <TrendChart data={winRateHistory} />
          </div>
        </section>

        <div className="chart-card chart-card-full">
          <h2 className="section-title">
            Boss Encounters
            <span className="section-sub"> — sorted by win rate</span>
          </h2>
          <BossChart data={bossStats} />
        </div>

        <div className="chart-card chart-card-full">
          <h2 className="section-title">
            Recent Runs
            {char && <span className="section-sub"> — {char.name} only</span>}
          </h2>
          <RunTable runs={filteredRuns} />
        </div>
      </main>

      <footer className="app-footer">
        <p>STStats v1.0 &nbsp;·&nbsp; Slay the Spire 2 &nbsp;·&nbsp; {overview.totalRuns} runs parsed</p>
      </footer>
    </div>
  );
}
