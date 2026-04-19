import { useState, useEffect } from 'react';
import ApiKeyInput from './components/ApiKeyInput';
import CategorySelect from './components/CategorySelect';
import SessionSetup from './components/SessionSetup';
import DrillSession from './components/DrillSession';
import Stats from './components/Stats';
import { getApiKey, getModel, getMode } from './utils/storage';
import { initGemini } from './utils/gemini';

export default function App() {
  const [view, setView] = useState('home'); // home, setup, session, stats, settings
  const [category, setCategory] = useState(null);
  const [mode, setMode] = useState(getMode());
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const key = getApiKey();
    if (key) {
      initGemini(key, getModel());
    }
  }, []);

  function handleCategorySelect(cat) {
    setCategory(cat);
    setView('setup');
  }

  function handleStart(cfg) {
    setConfig(cfg);
    setView('session');
  }

  function handleBack() {
    setView('home');
    setCategory(null);
    setConfig(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>FIA</h1>
        <nav>
          <button
            className={view !== 'stats' && view !== 'settings' ? 'active' : ''}
            onClick={handleBack}
          >
            Training
          </button>
          <button
            className={view === 'stats' ? 'active' : ''}
            onClick={() => setView('stats')}
          >
            Statistik
          </button>
          <button
            className={view === 'settings' ? 'active' : ''}
            onClick={() => setView('settings')}
            title="Einstellungen"
          >
            &hellip;
          </button>
        </nav>
      </header>
      <main>
        {view === 'home' && (
          <CategorySelect onSelect={handleCategorySelect} />
        )}
        {view === 'setup' && (
          <SessionSetup
            category={category}
            onStart={handleStart}
            onBack={handleBack}
          />
        )}
        {view === 'session' && (
          <DrillSession
            category={category}
            config={config}
            mode={mode}
            onBack={handleBack}
            onInvalidKey={() => {
              setView('settings');
            }}
          />
        )}
        {view === 'stats' && <Stats />}
        {view === 'settings' && (
          <ApiKeyInput
            onReady={(selectedMode) => {
              setMode(selectedMode);
              setView(category ? 'setup' : 'home');
            }}
          />
        )}
      </main>
    </div>
  );
}
