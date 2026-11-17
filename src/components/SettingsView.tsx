import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import {
  Settings,
  Volume2,
  VolumeX,
  Vibrate,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Check,
  Copy
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const SettingsView: React.FC<{ onReplayOnboarding: () => void }> = ({
  onReplayOnboarding
}) => {
  const { settings, updateSettings, exportData, importData } = useWorkout();
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCopyExport = () => {
    const data = exportData();
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitbull-fit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePerformImport = () => {
    if (!importText.trim()) return;
    const success = importData(importText);
    if (success) {
      setImportStatus('Backup restored successfully!');
      setTimeout(() => {
        setImportStatus(null);
        setShowImport(false);
        setImportText('');
      }, 1500);
    } else {
      setImportStatus('Failed to parse backup JSON. Please check formatting.');
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-[500px] mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-text tracking-tight uppercase">Settings</h1>
        <span className="text-xs text-text-muted">Preferences & local storage</span>
      </div>

      {/* Preferences Section */}
      <div className="rounded-3xl bg-surface border border-line p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Preferences</h3>

        {/* Weight Unit */}
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-sm font-bold text-text">Weight Units</span>
            <span className="text-xs text-text-muted">Default weight unit for logging</span>
          </div>
          <div className="flex bg-surface-2 p-1 rounded-xl border border-line">
            <button
              type="button"
              onClick={() => updateSettings({ weightUnit: 'kg' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                settings.weightUnit === 'kg' ? 'bg-accent text-on-accent' : 'text-text-muted'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ weightUnit: 'lbs' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                settings.weightUnit === 'lbs' ? 'bg-accent text-on-accent' : 'text-text-muted'
              }`}
            >
              lbs
            </button>
          </div>
        </div>

        {/* Default Rest Timer */}
        <div className="pt-2 border-t border-line flex items-center justify-between">
          <div>
            <span className="block text-sm font-bold text-text">Default Rest Timer</span>
            <span className="text-xs text-text-muted">Standard rest countdown</span>
          </div>
          <div className="flex bg-surface-2 p-1 rounded-xl border border-line">
            {[60, 90, 120, 180].map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => updateSettings({ defaultRestSeconds: dur })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  settings.defaultRestSeconds === dur ? 'bg-accent text-on-accent' : 'text-text-muted'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        {/* Sound Effects */}
        <div className="pt-2 border-t border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {settings.soundEnabled ? (
              <Volume2 size={18} className="text-accent" />
            ) : (
              <VolumeX size={18} className="text-text-muted" />
            )}
            <div>
              <span className="block text-sm font-bold text-text">Sound Cues</span>
              <span className="text-xs text-text-muted">Chimes on set complete & rest alerts</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !settings.soundEnabled;
              updateSettings({ soundEnabled: next });
              if (next) soundFx.playTap();
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              settings.soundEnabled ? 'bg-accent' : 'bg-surface-2 border border-line'
            }`}
          >
            <div
              className={`size-5 rounded-full transition-transform ${
                settings.soundEnabled ? 'bg-on-accent translate-x-5' : 'bg-text-muted translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Haptic Feedback */}
        <div className="pt-2 border-t border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Vibrate size={18} className="text-accent" />
            <div>
              <span className="block text-sm font-bold text-text">Haptic Vibrations</span>
              <span className="text-xs text-text-muted">Tactile feedback on mobile buttons</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !settings.hapticEnabled;
              updateSettings({ hapticEnabled: next });
              if (next) soundFx.triggerHaptic(40);
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              settings.hapticEnabled ? 'bg-accent' : 'bg-surface-2 border border-line'
            }`}
          >
            <div
              className={`size-5 rounded-full transition-transform ${
                settings.hapticEnabled ? 'bg-on-accent translate-x-5' : 'bg-text-muted translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tutorial & Onboarding Replay */}
      <div className="rounded-3xl bg-surface border border-line p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Tutorial</h3>
        <button
          type="button"
          onClick={onReplayOnboarding}
          className="w-full py-3 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-line text-sm font-bold text-text flex items-center justify-center gap-2 transition-colors"
        >
          <HelpCircle size={16} className="text-accent" />
          Replay Interactive Onboarding
        </button>
      </div>

      {/* Data Backup & Restore */}
      <div className="rounded-3xl bg-surface border border-line p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Offline Data Backup
        </h3>
        <p className="text-xs text-text-muted">
          All your workouts and settings are stored locally on this phone. Export your JSON backup
          regularly.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDownloadExport}
            className="py-2.5 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={14} className="text-accent" /> Download File
          </button>

          <button
            type="button"
            onClick={handleCopyExport}
            className="py-2.5 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowImport(!showImport)}
          className="w-full py-2.5 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text-muted hover:text-text flex items-center justify-center gap-1.5 transition-colors"
        >
          <Upload size={14} /> Restore from Backup JSON
        </button>

        {showImport && (
          <div className="pt-2 space-y-2 animate-in fade-in">
            <textarea
              rows={4}
              placeholder="Paste your backup JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-3 rounded-xl bg-bg border border-line text-xs font-mono text-text focus:outline-none focus:border-accent resize-none"
            />
            {importStatus && (
              <span className="block text-xs font-semibold text-accent">{importStatus}</span>
            )}
            <button
              type="button"
              onClick={handlePerformImport}
              className="w-full py-2.5 rounded-xl bg-accent text-on-accent text-xs font-black shadow-[0_0_12px_rgba(204,255,0,0.3)] hover:brightness-110 transition-all"
            >
              Restore Data
            </button>
          </div>
        )}
      </div>

      {/* About App */}
      <div className="text-center pt-2 text-xs text-text-muted space-y-1">
        <p className="font-bold text-text">PITBULL FIT v1.0.0</p>
        <p>Inspired by ABOT — Strength Training & Hypertrophy Tracker</p>
      </div>
    </div>
  );
};
