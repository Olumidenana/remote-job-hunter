export interface SafetyAnalysis {
  safetyScore: number; // 0 - 100 (100 = verified safe)
  riskLevel: 'VERIFIED_SAFE' | 'CAUTION' | 'SUSPICIOUS_SCAM';
  flags: string[];
  reasons: string[];
  isVerifiedCompany: boolean;
}

export interface TranslationData {
  detectedLanguage: string;
  isTranslated: boolean;
  translatedTitle?: string;
  translatedDescription?: string;
  localLanguageGreeting?: string;
}

export interface ATSMatchAnalysis {
  atsScore: number; // 0 - 100%
  matchingKeywords: string[];
  missingKeywords: string[];
  recommendedHeadline: string;
  tailoredSummary: string;
}

export interface RemoteJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  isWorldwide: boolean;
  url: string;
  applyUrl: string;
  source: 'HackerNews' | 'RemoteOK' | 'Arbeitnow' | 'Jobicy' | 'Remotive' | 'TwitterX' | 'Direct';
  tags: string[];
  description: string;
  salary?: string;
  publishedAt: string;
  matchScore: number;
  matchReasons: string[];
  synergyStack: string[];
  urgent?: boolean;
  instructions?: InstructionAnalysis;
  safety?: SafetyAnalysis;
  translation?: TranslationData;
  atsAnalysis?: ATSMatchAnalysis;
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
  atsAnalysis: ATSMatchAnalysis;
  safety: SafetyAnalysis;
  translation?: TranslationData;
}

export interface ApplicationRecord {
  id: string;
  messageId?: string;
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
    safeCount: number;
    suspiciousFilteredCount: number;
  };
}
