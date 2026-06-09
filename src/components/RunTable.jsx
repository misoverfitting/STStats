const CHAR_COLORS = {
  ironclad:    '#d45c5c',
  silent:      '#4db87a',
  regent:      '#d4a827',
  necrobinder: '#a05cd4',
  defect:      '#5c95d4',
};

const CHAR_NAMES = {
  ironclad:    'Ironclad',
  silent:      'Silent',
  regent:      'Regent',
  necrobinder: 'Necrobinder',
  defect:      'Defect',
};

export default function RunTable({ runs }) {
  if (runs.length === 0) {
    return <p className="empty-state">No runs to display.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="run-table">
        <thead>
          <tr>
            <th>Result</th>
            <th>Character</th>
            <th>Asc</th>
            <th>Act Reached</th>
            <th>Killed By</th>
            <th>Time</th>
            <th>Mode</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {runs.map(run => (
            <tr key={run.id} className={run.won ? 'run-win' : 'run-loss'}>
              <td>
                <span className={`result-badge ${run.won ? 'badge-win' : 'badge-loss'}`}>
                  {run.won ? 'VICTORY' : 'DEFEAT'}
                </span>
              </td>
              <td style={{ color: CHAR_COLORS[run.character] }}>
                {CHAR_NAMES[run.character] ?? run.character}
              </td>
              <td>A{run.ascension}</td>
              <td style={{ color: run.won ? 'var(--win)' : 'var(--text)' }}>
                {run.actReached}
              </td>
              <td className="muted killed-by">
                {run.killedBy || '—'}
              </td>
              <td className="muted">{run.runTime}</td>
              <td className="muted">
                {run.multiplayer ? (
                  <span title={`With: ${run.allies.join(', ')}`} className="mp-badge">Co-op</span>
                ) : 'Solo'}
              </td>
              <td className="muted">{run.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
