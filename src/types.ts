import { Timestamp } from 'firebase/firestore';

export type HiveStatus = 'active' | 'failing' | 'harvested' | 'inactive';
export type ActivityLevel = 'high' | 'medium' | 'low';

export interface Hive {
  id: string;
  name: string;
  location: string;
  status: HiveStatus;
  createdAt: Timestamp;
  ownerId: string;
}

export interface Inspection {
  id: string;
  hiveId: string;
  date: Timestamp;
  queenPresent: boolean;
  pestsSeen: boolean;
  activityLevel: ActivityLevel;
  honeyFlowProgress: number; // 0-100
  observations: string;
  aiIntervention?: string;
  ownerId: string;
}

export interface Harvest {
  id: string;
  hiveId: string;
  date: Timestamp;
  quantity: number; // in kg
  notes: string;
  ownerId: string;
}

export interface Flora {
  id: string;
  name: string;
  bloomingSeason: string;
  description: string;
  benefitToBees: string;
}
