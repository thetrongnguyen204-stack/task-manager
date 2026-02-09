
export enum Priority {
  ON_TIME = 'On-time',
  IN_TIME = 'In-time',
  JUST_DONE = 'Just Done'
}

export interface Task {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  content: string;
  completionPercent: number;
  notes: string;
  orderIndex: number;
  isBufferTask: boolean;
  type: 'normal' | 'review' | 'check';
}

export interface Project {
  id: string;
  name: string;
  goal: string;
  background: string;
  priority: Priority;
  startDate: string;
  endDate: string;
  dailyWorkTime: number;
  tasks?: Task[]; // Store tasks inside project for multi-project management
}

export interface FeasibilityOption {
  type: 'hours' | 'deadline' | 'goal';
  description: string;
  suggestedValue: string | number;
}

export interface FeasibilityResponse {
  isFeasible: boolean;
  reasoning: string;
  options?: FeasibilityOption[];
}
