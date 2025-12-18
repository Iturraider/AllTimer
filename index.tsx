
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- TYPES ---
enum TimerMode {
  SERIES = 'SERIES',
  CLUSTER = 'CLUSTER',
  EMOM = 'EMOM',
  TABATA = 'TABATA',
  BOXING = 'BOXING'
}

enum PhaseType {
  PREPARATION = 'PREPARATION',
  WORK = 'WORK',
  REST = 'REST',
  INTRA_REST = 'INTRA_REST',
  COMPLETED = 'COMPLETED'
}

interface TimerSegment {
  type: PhaseType;
  duration: number;
  label: string;
  setIndex: number;
  totalSets: number;
  repIndex?: number;
  totalReps?: number;
}

interface TimerConfig {
  mode: TimerMode;
  sets: number;
  workTime: number;
  restTime: number;
  prepTime: number;
  intraRestTime?: number;
  repsPerSet?: number;
  intervalTime?: number;
  totalSessionTime?: number;
  roundTime?: number;
  warningTime?: number;
}

type AppView = 'HOME' | 'SETUP' | 'TIMER';

// --- AUDIO SERVICE ---
class AudioService {
  private ctx: AudioContext | null = null;
  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  private playTone(freq: number, duration: number, volume: number = 0.1) {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
  playCountdown() { this.playTone(440, 0.2); }
  playStart() { this.playTone(880, 0.5); }
  playEnd() { this.playTone(220, 0.5); }
}
const audioService = new AudioService();

// --- UTILS ---
const formatTime = (seconds: number): string => {
  if (seconds < 60) return seconds.toString();
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const generateSegments = (config: TimerConfig): TimerSegment[] => {
  const segments: TimerSegment[] = [];
  if (config.prepTime > 0) {
    segments.push({ type: PhaseType.PREPARATION, duration: config.prepTime, label: '¡Prepárate!', setIndex: 0, totalSets: config.sets });
  }
  switch (config.mode) {
    case TimerMode.SERIES:
    case TimerMode.TABATA:
      for (let i = 1; i <= config.sets; i++) {
        segments.push({ type: PhaseType.WORK, duration: config.workTime, label: `Serie ${i}`, setIndex: i, totalSets: config.sets });
        if (i < config.sets) segments.push({ type: PhaseType.REST, duration: config.restTime, label: 'Descanso', setIndex: i, totalSets: config.sets });
      }
      break;
    case TimerMode.CLUSTER:
      const reps = config.repsPerSet || 1;
      for (let i = 1; i <= config.sets; i++) {
        for (let r = 1; r <= reps; r++) {
          segments.push({ type: PhaseType.WORK, duration: config.workTime, label: `Serie ${i} - Rep ${r}`, setIndex: i, totalSets: config.sets, repIndex: r, totalReps: reps });
          if (r < reps) segments.push({ type: PhaseType.INTRA_REST, duration: config.intraRestTime || 0, label: 'Micro Descanso', setIndex: i, totalSets: config.sets, repIndex: r, totalReps: reps });
        }
        if (i < config.sets) segments.push({ type: PhaseType.REST, duration: config.restTime, label: 'Descanso entre Series', setIndex: i, totalSets: config.sets });
      }
      break;
    case TimerMode.EMOM:
      const totalSession = config.totalSessionTime || 600;
      const interval = config.intervalTime || 60;
      const totalIntervals = Math.floor(totalSession / interval);
      for (let i = 1; i <= totalIntervals; i++) {
        segments.push({ type: PhaseType.WORK, duration: interval, label: `Minuto ${i}`, setIndex: i, totalSets: totalIntervals });
      }
      break;
    case TimerMode.BOXING:
      for (let i = 1; i <= config.sets; i++) {
        segments.push({ type: PhaseType.WORK, duration: config.roundTime || 180, label: `Asalto ${i}`, setIndex: i, totalSets: config.sets });
        if (i < config.sets) segments.push({ type: PhaseType.REST, duration: config.restTime, label: 'Descanso', setIndex: i, totalSets: config.sets });
      }
      break;
  }
  return segments;
};

// --- COMPONENTS ---
const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>;
const PauseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>;
const ResetIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const ChevronLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const TimerIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

const TimerActive = ({ config, onExit }: { config: TimerConfig, onExit: () => void }) => {
  const [segments] = useState(() => generateSegments(config));
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(segments[0]?.duration || 0);
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<any>(null);
  const currentSegment = segments[currentSegmentIndex];

  const handleNextSegment = useCallback(() => {
    if (currentSegmentIndex < segments.length - 1) {
      const nextIndex = currentSegmentIndex + 1;
      setCurrentSegmentIndex(nextIndex);
      setTimeLeft(segments[nextIndex].duration);
      audioService.playStart();
    } else {
      setIsCompleted(true);
      setIsActive(false);
      audioService.playEnd();
    }
  }, [currentSegmentIndex, segments]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) audioService.playCountdown();
          if (prev <= 1) { handleNextSegment(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, handleNextSegment]);

  const getPhaseColors = () => {
    if (isCompleted) return 'bg-blue-600';
    switch (currentSegment?.type) {
      case PhaseType.PREPARATION: return 'bg-yellow-500';
      case PhaseType.WORK: return 'bg-green-500';
      case PhaseType.REST:
      case PhaseType.INTRA_REST: return 'bg-red-500';
      default: return 'bg-slate-800';
    }
  };

  return (
    <div className={`fixed inset-0 flex flex-col transition-colors duration-500 ${getPhaseColors()}`}>
      <div className="p-4 flex items-center justify-between z-10">
        <button onClick={onExit} className="p-2 bg-black/20 rounded-full text-white"><ChevronLeftIcon /></button>
        <div className="text-white font-bold uppercase tracking-widest text-sm">TEMPORIZADOR {config.mode}</div>
        <button onClick={() => { setCurrentSegmentIndex(0); setTimeLeft(segments[0].duration); setIsActive(false); setIsCompleted(false); }} className="p-2 bg-black/20 rounded-full text-white"><ResetIcon /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-white px-4">
        {!isCompleted ? (
          <>
            <div className="text-xl font-semibold opacity-90 mb-2 uppercase tracking-wide">{currentSegment?.label}</div>
            <div className={`font-black leading-none drop-shadow-2xl text-[10rem]`}>{formatTime(timeLeft)}</div>
            <div className="mt-8 text-2xl font-bold flex gap-4 bg-black/10 px-6 py-2 rounded-full backdrop-blur-sm">
              <span>Serie {currentSegment?.setIndex} / {currentSegment?.totalSets}</span>
            </div>
          </>
        ) : (
          <div className="text-center animate-bounce">
            <div className="text-6xl font-black mb-4">¡HECHO!</div>
            <div className="text-xl">Gran sesión de entrenamiento.</div>
          </div>
        )}
      </div>
      <div className="p-12 flex flex-col items-center z-10">
        {!isCompleted ? (
          <button onClick={() => setIsActive(!isActive)} className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform">
            {isActive ? <PauseIcon /> : <PlayIcon />}
          </button>
        ) : (
          <button onClick={onExit} className="px-8 py-4 bg-white text-black rounded-full font-bold shadow-2xl active:scale-95 transition-transform">VOLVER AL INICIO</button>
        )}
      </div>
    </div>
  );
};

const TimerSetup = ({ mode, onStart, onBack, isDarkMode }: { mode: TimerMode, onStart: (c: TimerConfig) => void, onBack: () => void, isDarkMode: boolean }) => {
  const getDefaultConfig = (m: TimerMode): TimerConfig => {
    switch(m) {
      case TimerMode.SERIES: return { mode: m, sets: 4, workTime: 45, restTime: 60, prepTime: 5 };
      case TimerMode.TABATA: return { mode: m, sets: 8, workTime: 20, restTime: 10, prepTime: 5 };
      case TimerMode.CLUSTER: return { mode: m, sets: 3, workTime: 10, restTime: 180, prepTime: 5, intraRestTime: 15, repsPerSet: 5 };
      case TimerMode.EMOM: return { mode: m, sets: 10, workTime: 0, restTime: 0, prepTime: 5, intervalTime: 60, totalSessionTime: 600 };
      case TimerMode.BOXING: return { mode: m, sets: 3, workTime: 180, restTime: 60, prepTime: 5, roundTime: 180, warningTime: 10 };
      default: return { mode: m, sets: 1, workTime: 60, restTime: 30, prepTime: 5 };
    }
  };
  const [config, setConfig] = useState<TimerConfig>(getDefaultConfig(mode));
  const handleChange = (field: keyof TimerConfig, value: number) => setConfig(prev => ({ ...prev, [field]: value }));
  const InputField = ({ label, field, value }: { label: string, field: keyof TimerConfig, value: number }) => (
    <div className="mb-6">
      <label className={`block text-sm font-semibold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
      <div className="flex items-center gap-4">
        <button onClick={() => handleChange(field, Math.max(0, value - 5))} className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>-</button>
        <div className={`flex-1 rounded-xl h-12 flex items-center justify-center text-xl font-bold border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>{value}s</div>
        <button onClick={() => handleChange(field, value + 5)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>+</button>
      </div>
    </div>
  );
  return (
    <div className={`min-h-screen p-6 flex flex-col ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <header className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ChevronLeftIcon /></button>
        <h1 className="ml-2 text-2xl font-black italic tracking-tighter uppercase">CONFIGURAR {mode}</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        <InputField label="Series" field="sets" value={config.sets} />
        <InputField label="Trabajo" field="workTime" value={config.workTime} />
        <InputField label="Descanso" field="restTime" value={config.restTime} />
        <InputField label="Preparación" field="prepTime" value={config.prepTime} />
      </div>
      <button onClick={() => onStart(config)} className="mt-8 h-16 bg-blue-600 rounded-2xl flex items-center justify-center gap-3 text-xl font-black text-white shadow-xl active:scale-95 transition-transform"><PlayIcon /> INICIAR</button>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState<AppView>('HOME');
  const [selectedMode, setSelectedMode] = useState<TimerMode | null>(null);
  const [timerConfig, setTimerConfig] = useState<TimerConfig | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const ModeCard = ({ mode, title, color }: { mode: TimerMode, title: string, color: string }) => (
    <button onClick={() => { setSelectedMode(mode); setView('SETUP'); }} className={`w-full mb-4 p-6 rounded-3xl flex flex-col items-start text-left border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} hover:border-${color}-500 transition-all active:scale-95`}>
      <h3 className="text-2xl font-black italic tracking-tighter uppercase">{title}</h3>
      <div className="mt-2 text-blue-500"><TimerIcon /></div>
    </button>
  );

  return (
    <div className={`h-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {view === 'HOME' && (
        <div className="h-full flex flex-col p-6 overflow-y-auto">
          <header className="mb-8 pt-4 flex justify-between items-start">
            <h1 className={`text-4xl font-black italic tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>UNIVERSAL<br/><span className="text-blue-500">TRAINING</span> TIMER</h1>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-yellow-400' : 'bg-white border-slate-200 shadow-sm'}`}>{isDarkMode ? <SunIcon /> : <MoonIcon />}</button>
          </header>
          <div className="flex-1">
            <ModeCard mode={TimerMode.SERIES} title="Series Tradicionales" color="blue" />
            <ModeCard mode={TimerMode.CLUSTER} title="Entrenamiento Clúster" color="purple" />
            <ModeCard mode={TimerMode.EMOM} title="EMOM" color="orange" />
            <ModeCard mode={TimerMode.TABATA} title="TABATA" color="green" />
            <ModeCard mode={TimerMode.BOXING} title="BOXEO / MMA" color="red" />
          </div>
        </div>
      )}
      {view === 'SETUP' && selectedMode && <TimerSetup mode={selectedMode} onStart={(c) => { setTimerConfig(c); setView('TIMER'); }} onBack={() => setView('HOME')} isDarkMode={isDarkMode} />}
      {view === 'TIMER' && timerConfig && <TimerActive config={timerConfig} onExit={() => setView('HOME')} />}
    </div>
  );
};

// --- RENDER ---
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

// SW Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
