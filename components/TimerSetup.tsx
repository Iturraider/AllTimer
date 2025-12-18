
import React, { useState } from 'react';
import { TimerMode, TimerConfig } from '../types';
import { ChevronLeftIcon, PlayIcon } from './Icons';
import { formatTime } from '../utils/timerEngine';

interface TimerSetupProps {
  mode: TimerMode;
  onStart: (config: TimerConfig) => void;
  onBack: () => void;
  isDarkMode: boolean;
}

const TimerSetup: React.FC<TimerSetupProps> = ({ mode, onStart, onBack, isDarkMode }) => {
  const getDefaultConfig = (m: TimerMode): TimerConfig => {
    switch(m) {
      case TimerMode.SERIES: return { mode: m, sets: 4, workTime: 45, restTime: 60, prepTime: 5 };
      case TimerMode.TABATA: return { mode: m, sets: 8, workTime: 20, restTime: 10, prepTime: 5 };
      case TimerMode.CLUSTER: return { mode: m, sets: 3, workTime: 0, restTime: 180, prepTime: 5, intraRestTime: 15, repsPerSet: 5 };
      case TimerMode.EMOM: return { mode: m, sets: 10, workTime: 0, restTime: 0, prepTime: 5, intervalTime: 60, totalSessionTime: 600 };
      case TimerMode.BOXING: return { mode: m, sets: 3, workTime: 180, restTime: 60, prepTime: 5, roundTime: 180, warningTime: 10 };
      default: return { mode: m, sets: 1, workTime: 60, restTime: 30, prepTime: 5 };
    }
  };

  const [config, setConfig] = useState<TimerConfig>(getDefaultConfig(mode));

  const handleChange = (field: keyof TimerConfig, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const InputField = ({ label, field, value }: { label: string, field: keyof TimerConfig, value: number }) => {
    const isTimeField = field.includes('Time') || field.includes('Duration') || field === 'workTime' || field === 'restTime' || field === 'prepTime' || field === 'intraRestTime' || field === 'intervalTime' || field === 'totalSessionTime' || field === 'roundTime';
    
    return (
      <div className="mb-6">
        <label className={`block text-sm font-semibold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </label>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleChange(field, Math.max(0, value - (isTimeField ? 5 : 1)))}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border transition-colors ${
              isDarkMode ? 'bg-slate-800 text-white border-slate-700 active:bg-slate-700' : 'bg-white text-slate-900 border-slate-200 active:bg-slate-100 shadow-sm'
            }`}
          >-</button>
          <div className={`flex-1 rounded-xl h-12 flex items-center justify-center text-xl font-bold border ${
            isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'
          }`}>
            {isTimeField ? (
              <>
                {formatTime(value)}
                {value < 60 && <span className="text-sm ml-0.5 opacity-60">s</span>}
              </>
            ) : value}
          </div>
          <button 
            onClick={() => handleChange(field, value + (isTimeField ? 5 : 1))}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border transition-colors ${
              isDarkMode ? 'bg-slate-800 text-white border-slate-700 active:bg-slate-700' : 'bg-white text-slate-900 border-slate-200 active:bg-slate-100 shadow-sm'
            }`}
          >+</button>
        </div>
      </div>
    );
  };

  const getModeTitle = () => {
    switch(mode) {
      case TimerMode.SERIES: return "SERIES";
      case TimerMode.CLUSTER: return "CLÚSTER";
      case TimerMode.EMOM: return "EMOM";
      case TimerMode.TABATA: return "TABATA";
      case TimerMode.BOXING: return "BOXEO";
      default: return mode;
    }
  }

  return (
    <div className={`min-h-screen p-6 flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <header className="flex items-center mb-8">
        <button onClick={onBack} className={`p-2 -ml-2 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
          <ChevronLeftIcon />
        </button>
        <h1 className="ml-2 text-2xl font-black italic tracking-tighter uppercase">CONFIGURAR {getModeTitle()}</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {mode === TimerMode.SERIES && (
          <>
            <InputField label="Series" field="sets" value={config.sets} />
            <InputField label="Trabajo" field="workTime" value={config.workTime} />
            <InputField label="Descanso" field="restTime" value={config.restTime} />
          </>
        )}

        {mode === TimerMode.TABATA && (
          <>
            <InputField label="Rondas" field="sets" value={config.sets} />
            <InputField label="Trabajo" field="workTime" value={config.workTime} />
            <InputField label="Descanso" field="restTime" value={config.restTime} />
          </>
        )}

        {mode === TimerMode.CLUSTER && (
          <>
            <InputField label="Número de Series" field="sets" value={config.sets} />
            <InputField label="Reps por Serie" field="repsPerSet" value={config.repsPerSet || 0} />
            <InputField label="Micro Descanso (Intra-serie)" field="intraRestTime" value={config.intraRestTime || 0} />
            <InputField label="Trabajo por Rep" field="workTime" value={config.workTime} />
            <InputField label="Descanso entre Series" field="restTime" value={config.restTime} />
          </>
        )}

        {mode === TimerMode.EMOM && (
          <>
             <InputField label="Intervalo" field="intervalTime" value={config.intervalTime || 60} />
             <InputField label="Sesión Total" field="totalSessionTime" value={config.totalSessionTime || 600} />
          </>
        )}

        {mode === TimerMode.BOXING && (
          <>
            <InputField label="Asaltos" field="sets" value={config.sets} />
            <InputField label="Duración Asalto" field="roundTime" value={config.roundTime || 180} />
            <InputField label="Descanso" field="restTime" value={config.restTime} />
          </>
        )}

        <InputField label="Preparación" field="prepTime" value={config.prepTime} />
      </div>

      <button 
        onClick={() => onStart(config)}
        className="fixed bottom-8 left-6 right-6 h-16 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center justify-center gap-3 text-xl font-black text-white transition-all shadow-xl shadow-blue-900/20 active:scale-95"
      >
        <PlayIcon /> INICIAR ENTRENAMIENTO
      </button>
    </div>
  );
};

export default TimerSetup;
