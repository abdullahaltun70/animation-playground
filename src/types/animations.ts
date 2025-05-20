// Animation configuration type definitions
export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  delay: number;
  easing: EasingFunction;
  distance?: number;
  degrees?: number | { start: number; end: number }; // Updated to allow object for start/end degrees
  scale?: number;
  opacity?: {
    start: number;
    end: number;
  };
  axis?: 'x' | 'y';
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce';

export type EasingFunction =
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'linear'
  | 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Elastic

// Database model types
export interface ConfigModel {
  id: string;
  title: string;
  description?: string;
  configData: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  isPublic?: boolean;
  authorName?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

export interface SaveConfigRequest {
  title: string;
  description?: string;
  configData: string;
}
