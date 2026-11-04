export interface RemoteJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  isWorldwide: boolean;
  url: string;
  applyUrl: string;
  source: 'RemoteOK' | 'Arbeitnow' | 'Jobicy' | 'Remotive' | 'HackerNews' | 'Direct';
  tags: string[];
  description: string;
  salary?: string;
  publishedAt: string;
  matchScore: number;
  matchReasons: string[];
  synergyStack: string[];
  urgent?: boolean;
}

export interface CandidateProfile {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  coreStack: string[];
  specialties: string[];
  keyProjects: {
    name: string;
    description: string;
    metrics: string;
    tech: string[];
    relevanceTags: string[];
  }[];
}

export interface ApplicationPackage {
  jobId: string;
  jobTitle: string;
  company: string;
  hookPitch: string;
  fullCoverLetter: string;
  mailtoUrl: string;
}

export interface ScanResult {
  timestamp: string;
  totalScanned: number;
  matchedJobs: RemoteJob[];
  stats: {
    urgentCount: number;
    highMatchCount: number;
    averageScore: number;
  };
}
