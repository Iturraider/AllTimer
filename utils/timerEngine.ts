
import { TimerConfig, TimerMode, TimerSegment, PhaseType } from '../types';

export const generateSegments = (config: TimerConfig): TimerSegment[] => {
  const segments: TimerSegment[] = [];

  // Siempre empezar con preparación
  if (config.prepTime > 0) {
    segments.push({
      type: PhaseType.PREPARATION,
      duration: config.prepTime,
      label: '¡Prepárate!',
      setIndex: 0,
      totalSets: config.sets
    });
  }

  switch (config.mode) {
    case TimerMode.SERIES:
    case TimerMode.TABATA:
      for (let i = 1; i <= config.sets; i++) {
        segments.push({
          type: PhaseType.WORK,
          duration: config.workTime,
          label: `Serie ${i}`,
          setIndex: i,
          totalSets: config.sets
        });
        if (i < config.sets) {
          segments.push({
            type: PhaseType.REST,
            duration: config.restTime,
            label: 'Descanso',
            setIndex: i,
            totalSets: config.sets
          });
        }
      }
      break;

    case TimerMode.CLUSTER:
      const reps = config.repsPerSet || 1;
      for (let i = 1; i <= config.sets; i++) {
        for (let r = 1; r <= reps; r++) {
          segments.push({
            type: PhaseType.WORK,
            duration: config.workTime,
            label: `Serie ${i} - Rep ${r}`,
            setIndex: i,
            totalSets: config.sets,
            repIndex: r,
            totalReps: reps
          });
          if (r < reps) {
            segments.push({
              type: PhaseType.INTRA_REST,
              duration: config.intraRestTime || 0,
              label: 'Micro Descanso',
              setIndex: i,
              totalSets: config.sets,
              repIndex: r,
              totalReps: reps
            });
          }
        }
        if (i < config.sets) {
          segments.push({
            type: PhaseType.REST,
            duration: config.restTime,
            label: 'Descanso entre Series',
            setIndex: i,
            totalSets: config.sets
          });
        }
      }
      break;

    case TimerMode.EMOM:
      const totalSession = config.totalSessionTime || 600;
      const interval = config.intervalTime || 60;
      const totalIntervals = Math.floor(totalSession / interval);
      for (let i = 1; i <= totalIntervals; i++) {
        segments.push({
          type: PhaseType.WORK,
          duration: interval,
          label: `Minuto ${i}`,
          setIndex: i,
          totalSets: totalIntervals
        });
      }
      break;

    case TimerMode.BOXING:
      for (let i = 1; i <= config.sets; i++) {
        segments.push({
          type: PhaseType.WORK,
          duration: config.roundTime || 180,
          label: `Asalto ${i}`,
          setIndex: i,
          totalSets: config.sets
        });
        if (i < config.sets) {
          segments.push({
            type: PhaseType.REST,
            duration: config.restTime,
            label: 'Descanso',
            setIndex: i,
            totalSets: config.sets
          });
        }
      }
      break;
  }

  return segments;
};

export const formatTime = (seconds: number): string => {
  if (seconds < 60) return seconds.toString();
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};
