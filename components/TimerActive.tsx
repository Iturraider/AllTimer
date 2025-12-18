
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimerConfig, TimerSegment, PhaseType, TimerMode } from '../types';
import { generateSegments, formatTime } from '../utils/timerEngine';
import { audioService } from '../services/audioService';
import { PlayIcon, PauseIcon, ChevronLeftIcon, ResetIcon } from './Icons';

interface TimerActiveProps {
  config: TimerConfig;
  onExit: () => void;
}

const TimerActive: React.FC<TimerActiveProps> = ({ config, onExit }) => {
  const [segments] = useState<TimerSegment[]>(() => generateSegments(config));
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(segments[0]?.duration || 0);
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          // Avisos sonoros
          if (prev <= 4 && prev > 1) {
            audioService.playCountdown();
          }
          
          if (prev <= 1) {
            handleNextSegment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, handleNextSegment]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setCurrentSegmentIndex(0);
    setTimeLeft(segments[0].duration);
    setIsActive(false);
    setIsCompleted(false);
  };

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

  const progress = isCompleted ? 100 : ((currentSegment.duration - timeLeft) / currentSegment.duration) * 100;

  const getModeLabel = () => {
    switch(config.mode) {
      case TimerMode.SERIES: return "SERIES";
      case TimerMode.CLUSTER: return "CLÚSTER";
      case TimerMode.EMOM: return "EMOM";
      case TimerMode.TABATA: return "TABATA";
      case TimerMode.BOXING: return "BOXEO";
      default: return config.mode;
    }
  }

  return (
    <div className={`fixed inset-0 flex flex-col transition-colors duration-500 ${getPhaseColors()}`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10">
        <button onClick={onExit} className="p-2 bg-black/20 rounded-full text-white">
          <ChevronLeftIcon />
        </button>
        <div className="text-white font-bold uppercase tracking-widest text-sm">
          TEMPORIZADOR {getModeLabel()}
        </div>
        <button onClick={resetTimer} className="p-2 bg-black/20 rounded-full text-white">
          <ResetIcon />
        </button>
      </div>

      {/* Main Display */}
      <div className="flex-1 flex flex-col items-center justify-center text-white px-4">
        {!isCompleted ? (
          <>
            <div className="text-xl font-semibold opacity-90 mb-2 uppercase tracking-wide">
              {currentSegment?.label}
            </div>
            <div className={`font-black leading-none drop-shadow-2xl transition-all ${timeLeft >= 60 ? 'text-[8rem]' : 'text-[12rem]'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="mt-8 text-2xl font-bold flex gap-4 bg-black/10 px-6 py-2 rounded-full backdrop-blur-sm">
              <span>Serie {currentSegment?.setIndex} / {currentSegment?.totalSets}</span>
              {currentSegment?.repIndex && (
                <span>Rep {currentSegment?.repIndex} / {currentSegment?.totalReps}</span>
              )}
            </div>
          </>
        ) : (
          <div className="text-center animate-bounce">
            <div className="text-6xl font-black mb-4">¡HECHO!</div>
            <div className="text-xl">Gran sesión de entrenamiento.</div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-12 flex flex-col items-center z-10">
        {!isCompleted && (
          <button 
            onClick={toggleTimer}
            className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            {isActive ? <PauseIcon /> : <PlayIcon />}
          </button>
        )}
        {isCompleted && (
           <button 
           onClick={onExit}
           className="px-8 py-4 bg-white text-black rounded-full font-bold shadow-2xl active:scale-95 transition-transform"
         >
           VOLVER AL INICIO
         </button>
        )}
      </div>

      {/* Progress Bar Background */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-black/20">
        <div 
          className="h-full bg-white/50 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default TimerActive;
