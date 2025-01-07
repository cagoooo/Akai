export interface StoryFrame {
  id: string;
  emoji: string;
  text: string;
  animation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Story {
  id: string;
  title: string;
  frames: StoryFrame[];
  createdBy?: string;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateStoryInput = Omit<Story, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateStoryInput = Partial<Omit<Story, 'id' | 'createdAt' | 'updatedAt'>>;
