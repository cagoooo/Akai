// Achievement Types
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirements: {
    type: string;
    target: number;
    current?: number;
  };
  progress?: number;
  earned?: boolean;
  createdAt: string;
}

export type AchievementCategory = 
  | "tools"      // Tool usage achievements
  | "learning"   // Learning progress achievements
  | "social"     // Social interaction achievements
  | "innovation" // Creative use of platform achievements
