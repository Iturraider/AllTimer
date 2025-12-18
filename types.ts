
export enum TimerMode {
  SERIES = 'SERIES',
  CLUSTER = 'CLUSTER',
  EMOM = 'EMOM',
  TABATA = 'TABATA',
  BOXING = 'BOXING'
}

export enum PhaseType {
  PREPARATION = 'PREPARATION',
  WORK = 'WORK',
  REST = 'REST',
  INTRA_REST = 'INTRA_REST',
  COMPLETED = 'COMPLETED'
}

export interface TimerSegment {
  type: PhaseType;
  duration: number;
  label: string;
  setIndex: number;
  totalSets: number;
  repIndex?: number;
  totalReps?: number;
}

export interface TimerConfig {
  mode: TimerMode;
  sets: number;
  workTime: number; // in seconds
  restTime: number; // in seconds
  prepTime: number; // default 5-10s
  
  // Specifics
  intraRestTime?: number; // Cluster
  repsPerSet?: number; // Cluster
  intervalTime?: number; // EMOM (usually 60)
  totalSessionTime?: number; // EMOM
  roundTime?: number; // Boxing
  warningTime?: number; // Boxing (last 10s)
}

export type AppView = 'HOME' | 'SETUP' | 'TIMER';
