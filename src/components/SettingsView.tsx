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
  Copy,
  Globe,
  Activity,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { Card } from './Card';
import { calculateBMI, lbsToKg, kgToLbs, FitnessGoal, Gender } from '../utils/bmi';
import { getDailyMotivationIndex, getMotivationText, FITNESS_MOTIVATIONS } from '../data/motivations';
import { useNumericField } from '../hooks/useNumericField';

export const SettingsView: React.FC<{ onReplayOnboarding: () => void }> = ({
  onReplayOnboarding
}) => {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    language,
    setLanguage,
    setActiveTab,
    t
  } = useWorkout();

  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(() => getDailyMotivationIndex());

  const shuffleQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % FITNESS_MOTIVATIONS.length);
  };

  // Profile Edit State
  const [showEditBmi, setShowEditBmi] = useState(false);
  const [editHeight, setEditHeight] = useState(settings.profile?.heightCm || 175);
  const [editWeight, setEditWeight] = useState(settings.profile?.weightKg || 70);
  const [editAge, setEditAge] = useState(settings.profile?.age || 25);
  const [editGender, setEditGender] = useState<Gender>(settings.profile?.gender || 'male');
  const [editGoal, setEditGoal] = useState<FitnessGoal>(settings.profile?.goal || 'maintain');

  // Numeric drafts so a field can be cleared and retyped without snapping to a limit.
  const editHeightField = useNumericField(editHeight, { min: 100, max: 250, fallback: 175 });
  const editWeightField = useNumericField(editWeight, { min: 30, max: 300, fallback: 70, decimal: true });
  const editAgeField = useNumericField(editAge, { min: 12, max: 99, fallback: 25 });

  const previewWeight = parseFloat(editWeightField.text) || editWeight;
  const previewHeight = parseFloat(editHeightField.text) || editHeight;
  const previewAge = parseInt(editAgeField.text, 10) || editAge;

  const liveBmi = calculateBMI(previewWeight, previewHeight, previewAge, editGender, editGoal);

  const handleSaveBmi = () => {
    const finalHeight = editHeightField.commit();
    const finalWeight = editWeightField.commit();
    const finalAge = editAgeField.commit();
    setEditHeight(finalHeight);
    setEditWeight(finalWeight);
    setEditAge(finalAge);

    const bmi = calculateBMI(finalWeight, finalHeight, finalAge, editGender, editGoal);

    updateSettings({
      profile: {
        heightCm: finalHeight,
        weightKg: finalWeight,
        age: finalAge,
        gender: editGender,
        bmi: bmi.bmi,
        bmiCategory: bmi.category,
        goal: editGoal,
        dailyCalories: bmi.dailyCalories,
        dailyProteinGrams: bmi.dailyProteinGrams
      }
    });
    setShowEditBmi(false);
    if (settings.soundEnabled) soundFx.playSetComplete();
  };

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
      setImportStatus(language === 'id' ? 'Cadangan berhasil dipulihkan!' : 'Backup restored successfully!');
      setTimeout(() => {
        setImportStatus(null);
        setShowImport(false);
        setImportText('');
      }, 1500);
    } else {
      setImportStatus(
        language === 'id'
          ? 'Gagal memproses JSON. Periksa format berkas.'
          : 'Failed to parse backup JSON. Please check formatting.'
      );
    }
  };

  const getBmiBadgeColor = (cat?: string) => {
    switch (cat) {
      case 'underweight':
        return 'text-sky-600 dark:text-sky-400 bg-sky-500/15 border-sky-500/30';
      case 'normal':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'overweight':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'obese':
        return 'text-red-600 dark:text-red-400 bg-red-500/15 border-red-500/30';
      default:
        return 'text-accent bg-accent/15 border-accent/30';
    }
  };

  return (
    <div className="pb-4 pt-4 px-4 max-w-[500px] mx-auto space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="size-9 rounded-full bg-surface-2 hover:bg-surface-3 border border-line flex items-center justify-center text-text-muted hover:text-text transition-colors active:scale-95"
          title="Back / Kembali"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-black text-text tracking-tight uppercase">
            {t('settings_title')}
          </h1>
          <span className="text-xs text-text-muted">{t('settings_sub')}</span>
        </div>
      </div>

      {/* LANGUAGE SELECTOR CARD */}
      <Card
        radius="card"
        padding="20px"
        variant="default"
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe size={18} className="text-accent" />
            <div>
              <span className="block text-sm font-bold text-text">{t('language_setting')}</span>
              <span className="text-xs text-text-muted">{t('language_desc')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setLanguage('id')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              language === 'id'
                ? 'bg-accent text-on-accent'
                : 'bg-surface-2 text-text-muted hover:text-text border border-line'
            }`}
          >
            <span>🇮🇩</span>
            <span>Bahasa Indonesia</span>
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              language === 'en'
                ? 'bg-accent text-on-accent'
                : 'bg-surface-2 text-text-muted hover:text-text border border-line'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
        </div>
      </Card>

      {/* BODY PROFILE & BMI MANAGEMENT CARD */}
      <Card
        radius="card"
        padding="20px"
        variant="default"
        className="space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Activity size={18} className="text-accent shrink-0" />
            <div className="min-w-0">
              <span className="block text-sm font-bold text-text truncate">
                {t('body_profile_title')}
              </span>
              <span className="text-xs text-text-muted line-clamp-1">{t('body_profile_desc')}</span>
            </div>
          </div>
          {settings.profile && (
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap shrink-0 text-center inline-flex items-center justify-center leading-none ${getBmiBadgeColor(
                settings.profile.bmiCategory
              )}`}
            >
              {t(`bmi_${settings.profile.bmiCategory}` as any)}
            </span>
          )}
        </div>

        {/* Current Metrics Summary */}
        {settings.profile && !showEditBmi && (
          <div className="p-3 rounded-xl bg-surface-2/70 border border-line space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-text-muted">{t('current_bmi')}</span>
                <span className="block text-2xl font-black font-mono text-text">
                  {settings.profile.bmi}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-muted">{t('goal_label')}</span>
                <span className="block text-sm font-bold text-accent capitalize">
                  {t(`goal_${settings.profile.goal}` as any)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line text-xs">
              <div>
                <span className="text-text-muted block">{t('height_label')} / {t('weight_label')}</span>
                <span className="font-mono font-bold text-text">
                  {settings.profile.heightCm} cm · {settings.profile.weightKg} kg
                </span>
              </div>
              <div>
                <span className="text-text-muted block">{t('daily_protein')} / {t('daily_calories')}</span>
                <span className="font-mono font-bold text-text">
                  {settings.profile.dailyProteinGrams || 140}g · {settings.profile.dailyCalories || 2200} kcal
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEditBmi(true)}
              className="w-full mt-2 py-2 rounded-lg bg-surface-3 hover:bg-surface-2 text-xs font-bold text-accent border border-line transition-colors flex items-center justify-center gap-1"
            >
              {t('recalc_bmi_btn')} <ChevronDown size={14} />
            </button>
          </div>
        )}

        {/* Inline BMI Recalculator Form */}
        {showEditBmi && (
          <div className="p-3.5 rounded-xl bg-surface-2/90 border border-accent/30 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-text-muted block mb-1">
                  {t('gender_label')}
                </label>
                <div className="flex bg-surface p-0.5 rounded-lg border border-line">
                  <button
                    type="button"
                    onClick={() => setEditGender('male')}
                    className={`flex-1 py-1 rounded text-xs font-bold ${
                      editGender === 'male' ? 'bg-accent text-on-accent' : 'text-text-muted'
                    }`}
                  >
                    {t('gender_male')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditGender('female')}
                    className={`flex-1 py-1 rounded text-xs font-bold ${
                      editGender === 'female' ? 'bg-accent text-on-accent' : 'text-text-muted'
                    }`}
                  >
                    {t('gender_female')}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted block mb-1">
                  {t('age_label')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editAgeField.text}
                  onChange={(e) => editAgeField.onChange(e.target.value)}
                  onBlur={() => setEditAge(editAgeField.commit())}
                  className="w-full px-2.5 py-1 rounded-lg bg-surface border border-line text-xs font-mono font-bold text-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-text-muted block mb-1">
                  {t('height_label')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editHeightField.text}
                  onChange={(e) => editHeightField.onChange(e.target.value)}
                  onBlur={() => setEditHeight(editHeightField.commit())}
                  className="w-full px-2.5 py-1 rounded-lg bg-surface border border-line text-xs font-mono font-bold text-text"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted block mb-1">
                  {t('weight_label')}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={editWeightField.text}
                  onChange={(e) => editWeightField.onChange(e.target.value)}
                  onBlur={() => setEditWeight(editWeightField.commit())}
                  className="w-full px-2.5 py-1 rounded-lg bg-surface border border-line text-xs font-mono font-bold text-text"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-text-muted block mb-1">
                {t('goal_label')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['cut', 'maintain', 'bulk'] as FitnessGoal[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setEditGoal(g)}
                    className={`py-1 rounded-lg text-xs font-bold ${
                      editGoal === g ? 'bg-accent text-on-accent' : 'bg-surface text-text-muted border border-line'
                    }`}
                  >
                    {g === 'cut' ? 'Cut' : g === 'maintain' ? 'Recomp' : 'Bulk'}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Output Preview */}
            <div className="p-2.5 rounded-lg bg-bg/80 border border-line flex items-center justify-between text-xs">
              <div>
                <span className="text-text-muted block text-[10px]">BMI Preview</span>
                <span className="font-mono font-black text-accent text-base">{liveBmi.bmi}</span>
              </div>
              <div className="text-right">
                <span className="text-text-muted block text-[10px]">Category</span>
                <span className="font-bold text-text">{t(`bmi_${liveBmi.category}` as any)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEditBmi(false)}
                className="flex-1 py-2 rounded-xl bg-surface-2 text-xs font-bold text-text-muted hover:text-text border border-line"
              >
                {t('cancel_btn')}
              </button>
              <button
                type="button"
                onClick={handleSaveBmi}
                className="flex-1 py-2 rounded-xl bg-accent text-on-accent text-xs font-black"
              >
                Simpan / Save
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Preferences Section in Liquid Glass */}
      <Card
        radius="card"
        padding="20px"
        variant="default"
        className="space-y-4"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Preferensi / Preferences
        </h3>

        {/* Display Theme (Dark / Light) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {settings.theme === 'light' ? (
              <Sun size={18} className="text-amber-600 dark:text-amber-400" />
            ) : (
              <Moon size={18} className="text-accent" />
            )}
            <div>
              <span className="block text-sm font-bold text-text">{t('theme_setting')}</span>
              <span className="text-xs text-text-muted">{t('theme_desc')}</span>
            </div>
          </div>
          <div className="flex bg-surface-2 p-1 rounded-xl border border-line">
            <button
              type="button"
              onClick={() => {
                updateSettings({ theme: 'dark' });
                if (settings.soundEnabled) soundFx.playTap();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                settings.theme !== 'light' ? 'bg-accent text-on-accent' : 'text-text-muted hover:text-text'
              }`}
            >
              <Moon size={13} />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => {
                updateSettings({ theme: 'light' });
                if (settings.soundEnabled) soundFx.playTap();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                settings.theme === 'light' ? 'bg-accent text-on-accent' : 'text-text-muted hover:text-text'
              }`}
            >
              <Sun size={13} />
              <span>Light</span>
            </button>
          </div>
        </div>

        {/* Weight Unit */}
        <div className="pt-2 border-t border-line flex items-center justify-between">
          <div>
            <span className="block text-sm font-bold text-text">{t('weight_units')}</span>
            <span className="text-xs text-text-muted">Default weight unit</span>
          </div>
          <div className="flex bg-surface-2 p-1 rounded-xl border border-line">
            <button
              type="button"
              onClick={() => updateSettings({ weightUnit: 'kg' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                settings.weightUnit === 'kg' ? 'bg-accent text-on-accent' : 'text-text-muted'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ weightUnit: 'lbs' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
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
            <span className="block text-sm font-bold text-text">{t('default_rest')}</span>
            <span className="text-xs text-text-muted">Standard rest countdown</span>
          </div>
          <div className="flex bg-surface-2 p-1 rounded-xl border border-line">
            {[60, 90, 120, 180].map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => updateSettings({ defaultRestSeconds: dur })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  settings.defaultRestSeconds === dur ? 'bg-accent text-on-accent' : 'text-text-muted'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        {/* Sound Effects with Real Refracting GlassSwitch */}
        <div className="pt-2 border-t border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {settings.soundEnabled ? (
              <Volume2 size={18} className="text-accent" />
            ) : (
              <VolumeX size={18} className="text-text-muted" />
            )}
            <div>
              <span className="block text-sm font-bold text-text">{t('sound_cues')}</span>
              <span className="text-xs text-text-muted">{t('sound_cues_desc')}</span>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.soundEnabled}
            aria-label="Sound Cues Toggle"
            onClick={() => {
              const next = !settings.soundEnabled;
              updateSettings({ soundEnabled: next });
              if (next) soundFx.playTap();
            }}
            className={`relative w-11 h-6 rounded-full border transition-colors ${
              settings.soundEnabled ? 'bg-accent border-accent' : 'bg-surface-2 border-line'
            }`}
          >
            <span
              className={`absolute top-0.5 size-4.5 rounded-full bg-white transition ${
                settings.soundEnabled ? 'left-[22px]' : 'left-0.5'
              }`}
              style={{ width: 18, height: 18 }}
            />
          </button>
        </div>

        {/* Haptic Feedback with Real Refracting GlassSwitch */}
        <div className="pt-2 border-t border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Vibrate size={18} className="text-accent" />
            <div>
              <span className="block text-sm font-bold text-text">{t('haptic_vibe')}</span>
              <span className="text-xs text-text-muted">{t('haptic_vibe_desc')}</span>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.hapticEnabled}
            aria-label="Haptic Vibrations Toggle"
            onClick={() => {
              const next = !settings.hapticEnabled;
              updateSettings({ hapticEnabled: next });
              if (next) soundFx.triggerHaptic(40);
            }}
            className={`relative w-11 h-6 rounded-full border transition-colors ${
              settings.hapticEnabled ? 'bg-accent border-accent' : 'bg-surface-2 border-line'
            }`}
          >
            <span
              className={`absolute top-0.5 rounded-full bg-white transition ${
                settings.hapticEnabled ? 'left-[22px]' : 'left-0.5'
              }`}
              style={{ width: 18, height: 18 }}
            />
          </button>
        </div>
      </Card>

      {/* Tutorial & Onboarding Replay */}
      <Card
        radius="card"
        padding="20px"
        variant="default"
        className="space-y-3"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Tutorial & Panduan
        </h3>
        <button
          type="button"
          onClick={onReplayOnboarding}
          className="w-full py-3 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-line text-sm font-bold text-text flex items-center justify-center gap-2 transition-colors active:scale-95"
        >
          <HelpCircle size={16} className="text-accent" />
          {t('replay_onboarding')}
        </button>
      </Card>

      {/* Data Backup & Restore */}
      <Card
        radius="card"
        padding="20px"
        variant="default"
        className="space-y-3"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          {t('offline_backup')}
        </h3>
        <p className="text-xs text-text-muted">
          Your workout logs and history reside exclusively on this device in localStorage. Export or restore your backup anytime.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleDownloadExport}
            className="py-2.5 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text flex items-center justify-center gap-1.5 transition-colors active:scale-95"
          >
            <Download size={14} className="text-accent" />
            {t('download_json')}
          </button>
          <button
            type="button"
            onClick={handleCopyExport}
            className="py-2.5 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text flex items-center justify-center gap-1.5 transition-colors active:scale-95"
          >
            {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
            {copied ? t('copied_alert') : t('copy_clipboard')}
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
          >
            <Upload size={13} />
            {showImport ? 'Hide Restore Panel' : t('restore_backup')}
          </button>
        </div>

        {showImport && (
          <div className="pt-2 space-y-2 animate-in fade-in">
            <textarea
              rows={4}
              placeholder="Paste backup JSON payload here..."
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
              className="w-full py-2.5 rounded-xl bg-accent text-on-accent text-xs font-black hover:brightness-110 transition active:scale-95"
            >
              {t('restore_btn')}
            </button>
          </div>
        )}
      </Card>

      {/* Daily Rotating Fitness Motivation Quote */}
      <div className="text-center pt-3 pb-2 px-3 text-xs text-text-muted space-y-2">
        <p className="font-mono font-bold tracking-wider text-[11px] text-text uppercase">
          PITBULL FIT v1.1.0
        </p>
        <div
          onClick={shuffleQuote}
          role="button"
          tabIndex={0}
          title={language === 'id' ? 'Klik untuk ganti kata motivasi hari ini' : 'Click to shuffle fitness motivation'}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl bg-surface-2/70 hover:bg-surface-2 border border-line text-xs text-text-muted hover:text-text transition cursor-pointer active:scale-95 select-none max-w-sm mx-auto shadow-sm"
        >
          <Sparkles size={13} className="text-accent shrink-0" />
          <span className="italic leading-relaxed font-medium">
            "{getMotivationText(quoteIndex, language)}"
          </span>
        </div>
      </div>
    </div>
  );
};
