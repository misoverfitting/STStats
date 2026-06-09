const CHAR_COLORS = {
  ironclad: '#d45c5c',
  silent:   '#4db87a',
  defect:   '#5c95d4',
  watcher:  '#a05cd4',
};

const CHAR_NAMES = {
  ironclad: 'Ironclad',
  silent:   'Silent',
  defect:   'Defect',
  watcher:  'Watcher',
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
            <th>Ascension</th>
            <th>Floor</th>
            <th>Score</th>
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
                {CHAR_NAMES[run.character]}
              </td>
              <td>A{run.ascension}</td>
              <td className="muted">{run.floor}</td>
              <td>{run.score.toLocaleString()}</td>
              <td className="muted">{run.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
