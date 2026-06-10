import { useRef, useState, useEffect } from 'react';
import { loadFromFiles } from '../parser/parseStats';

const OS_PATHS = {
  mac:   '~/Library/Application Support/SlayTheSpire2/steam/{Steam ID}/profile1/saves',
  win:   '%AppData%\\SlayTheSpire2\\steam\\{Steam ID}\\profile1\\saves',
  linux: '~/.local/share/SlayTheSpire2/steam/{Steam ID}/profile1/saves',
};

function detectOS() {
  const p = navigator.platform || '';
  const ua = navigator.userAgent || '';
  if (/Win/.test(p))   return 'win';
  if (/Linux/.test(p) && !/Android/.test(ua)) return 'linux';
  return 'mac';
}

export default function UploadPanel({ onData, onDemo }) {
  const inputRef  = useRef(null);
  const [status,   setStatus]   = useState('idle'); // 'idle' | 'loading' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [os,       setOS]       = useState('mac');

  useEffect(() => {
    setOS(detectOS());
    if (inputRef.current) {
      inputRef.current.setAttribute('webkitdirectory', '');
      inputRef.current.setAttribute('mozdirectory', '');
      inputRef.current.setAttribute('directory', '');
    }
  }, []);

  async function handleFiles(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const stats = await loadFromFiles(files);
      onData(stats);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Unknown error while parsing save files.');
    }
    // Reset the input so the same folder can be re-selected after an error
    e.target.value = '';
  }

  const primaryPath = OS_PATHS[os];
  const otherPaths  = Object.entries(OS_PATHS).filter(([k]) => k !== os);
  const osLabels    = { mac: 'macOS', win: 'Windows', linux: 'Linux' };

  return (
    <div className="upload-panel">
      <div className="upload-card">
        <div className="upload-privacy-badge">
          <span className="privacy-icon">🔒</span>
          Files are read entirely in your browser — nothing is uploaded to any server.
        </div>

        <h2 className="upload-title">Connect Your Save Data</h2>
        <p className="upload-desc">
          Select your STS2 <code>saves</code> folder to analyse your own run history.
        </p>

        <div className="upload-path-section">
          <div className="upload-path-label">Save folder location ({osLabels[os]})</div>
          <div className="upload-path-box">{primaryPath}</div>
          <details className="upload-other-paths">
            <summary>Other platforms</summary>
            {otherPaths.map(([k, path]) => (
              <div key={k} className="upload-path-row">
                <span className="upload-path-os">{osLabels[k]}</span>
                <span className="upload-path-box upload-path-box--sm">{path}</span>
              </div>
            ))}
          </details>
        </div>

        <input
          ref={inputRef}
          type="file"
          id="folder-input"
          style={{ display: 'none' }}
          multiple
          onChange={handleFiles}
        />

        <button
          className="upload-btn"
          onClick={() => inputRef.current?.click()}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <span className="upload-spinner">Parsing…</span>
          ) : (
            'Select saves folder →'
          )}
        </button>

        {status === 'error' && (
          <div className="upload-error">
            <strong>Could not load save data:</strong> {errorMsg}
          </div>
        )}

        <div className="upload-divider">
          <span>or</span>
        </div>

        <button className="upload-demo-btn" onClick={onDemo}>
          View demo data
        </button>
      </div>
    </div>
  );
}
