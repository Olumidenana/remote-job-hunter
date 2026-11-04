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
  instructions?: InstructionAnalysis;
}

export interface InstructionAnalysis {
  recipientEmail?: string;
  customSubject?: string;
  secretCodeWords: string[];
  detectedInstructions: string[];
  requiredAnswers: { question: string; answer: string }[];
  recommendedCV: 'FullStack' | 'Quant';
  recommendedCVFile: string;
  hasDirectEmail: boolean;
  complianceConfidence: number; // 0 - 100%
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
  cvFiles: {
    fullStack: {
      name: string;
      filename: string;
      url: string;
    };
    quant: {
      name: string;
      filename: string;
      url: string;
    };
  };
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
  recipientEmail: string;
  subject: string;
  hookPitch: string;
  fullCoverLetter: string;
  mailtoUrl: string;
  recommendedCVFile: string;
  recommendedCVName: string;
  instructions: InstructionAnalysis;
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  company: string;
  jobTitle: string;
  recipientEmail: string;
  subject: string;
  status: 'SENT' | 'QUEUED' | 'PORTAL';
  sentAt: string;
  cvAttached: string;
  complianceNotes: string[];
}

export interface ScanResult {
  timestamp: string;
  totalScanned: number;
  matchedJobs: RemoteJob[];
  stats: {
    urgentCount: number;
    highMatchCount: number;
    averageScore: number;
    directEmailCount: number;
  };
}
