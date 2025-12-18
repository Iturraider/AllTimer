
import React, { useState, useEffect } from 'react';
import { TimerMode, AppView, TimerConfig } from './types';
import TimerSetup from './components/TimerSetup';
import TimerActive from './components/TimerActive';
import { TimerIcon, SunIcon, MoonIcon } from './components/Icons';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('HOME');
  const [selectedMode, setSelectedMode] = useState<TimerMode | null>(null);
  const [timerConfig, setTimerConfig] = useState<TimerConfig | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSelectMode = (mode: TimerMode) => {
    setSelectedMode(mode);
    setView('SETUP');
  };

  const handleStartTimer = (config: TimerConfig) => {
    setTimerConfig(config);
    setView('TIMER');
  };

  const goHome = () => {
    setView('HOME');
    setSelectedMode(null);
    setTimerConfig(null);
  };

  const ModeCard = ({ mode, title, description, colorClass }: { mode: TimerMode, title: string, description: string, colorClass: string }) => (
    <button 
      onClick={() => handleSelectMode(mode)}
      className={`w-full mb-4 p-6 rounded-3xl flex flex-col items-start text-left transition-all active:scale-95 relative overflow-hidden group border ${
        isDarkMode 
        ? `bg-slate-900 border-slate-800 text-white ${colorClass}` 
        : `bg-white border-slate-200 text-slate-900 shadow-sm ${colorClass.replace('hover:border-', 'hover:border-')}`
      }`}
    >
      <div className="relative z-10">
        <h3 className="text-2xl font-black italic tracking-tighter mb-1 uppercase">{title}</h3>
        <p className={`text-sm leading-tight pr-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
      </div>
      <div className={`absolute top-1/2 -translate-y-1/2 right-4 opacity-10 group-hover:opacity-20 transition-opacity ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        <TimerIcon />
      </div>
    </button>
  );

  return (
    <div className={`h-full transition-colors duration-300 overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {view === 'HOME' && (
        <div className="h-full flex flex-col p-6 overflow-y-auto">
          <header className="mb-8 pt-4 flex justify-between items-start">
            <div>
              <h1 className={`text-4xl font-black italic tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                UNIVERSAL<br/>
                <span className="text-blue-500">TRAINING</span> TIMER
              </h1>
              <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Selecciona tu modalidad</p>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-yellow-400' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}
            >
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </header>

          <div className="flex-1">
            <ModeCard 
              mode={TimerMode.SERIES} 
              title="Series Tradicionales" 
              description="Intervalos estándar de Trabajo/Descanso para fuerza o hipertrofia."
              colorClass="hover:border-blue-500"
            />
            <ModeCard 
              mode={TimerMode.CLUSTER} 
              title="Entrenamiento Clúster" 
              description="Alta intensidad con micro-pausas dentro de la misma serie."
              colorClass="hover:border-purple-500"
            />
            <ModeCard 
              mode={TimerMode.EMOM} 
              title="EMOM" 
              description="Every Minute on the Minute. Tu velocidad es tu descanso."
              colorClass="hover:border-orange-500"
            />
            <ModeCard 
              mode={TimerMode.TABATA} 
              title="TABATA" 
              description="Quema grasa al máximo. 20s trabajo, 10s descanso."
              colorClass="hover:border-green-500"
            />
            <ModeCard 
              mode={TimerMode.BOXING} 
              title="BOXEO / MMA" 
              description="Asaltos con avisos finales y sonidos de campana."
              colorClass="hover:border-red-500"
            />
          </div>
          
          <footer className={`py-4 text-center text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            Pantalla Siempre Activa • Grado Profesional
          </footer>
        </div>
      )}

      {view === 'SETUP' && selectedMode && (
        <TimerSetup mode={selectedMode} onStart={handleStartTimer} onBack={goHome} isDarkMode={isDarkMode} />
      )}

      {view === 'TIMER' && timerConfig && (
        <TimerActive config={timerConfig} onExit={goHome} />
      )}
    </div>
  );
};

export default App;
