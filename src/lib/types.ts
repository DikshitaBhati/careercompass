import type { Timestamp } from 'firebase/firestore';

export type Job = {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  applyUrl: string;
  createdAt: any;
};

export type JobMatch = {
  userId: string;
  jobId: string;
  matchScore: number;
  missingSkills: string;
  strengths: string;
  createdAt: Timestamp;
};

export type JobWithMatch = Job & {
  match?: JobMatch;
};
