export type Keypoint = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  name?: string;
};

export type PoseLandmarks = Keypoint[];

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AssessmentIssue {
  id: string;
  name: string; // e.g., "Knee Valgus", "Ankle Inversion"
  riskLevel: RiskLevel;
  description: string; // "Your knee is caving in..."
  suggestion: string; // "Activate your glues..."
  relatedJoints: number[]; // Indices of joints to highlight
  timestamp?: number; // For video analysis
  angleValue?: number; // e.g., 15 degrees
}

export interface AnalysisReport {
  overallRisk: RiskLevel;
  issues: AssessmentIssue[];
  summary: string;
  poseName: string; // "Squat", "Standing", "Climbing"
  date: string;
}

export interface PainRegion {
  bodyPart:
  | 'left_shoulder' | 'right_shoulder'
  | 'left_arm' | 'right_arm'
  | 'waist'
  | 'left_hip' | 'right_hip'
  | 'left_knee' | 'right_knee'
  | 'left_ankle' | 'right_ankle';
  painLevel: 'mild' | 'moderate' | 'severe';
  diagnosed: boolean;
  diagnosisDetail?: string;
}

export interface PainProfile {
  regions: PainRegion[];
  lastUpdated: string;
}

export interface UserProfile {
  heightCm: number;
  weightKg?: number;
  trainingLevel: 'beginner' | 'intermediate' | 'advanced';
  injuryHistory: string[];
  painProfile?: PainProfile;
}
