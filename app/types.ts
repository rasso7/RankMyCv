export interface ATSResult {
  atsScore: number;
  keywordMatch: number;
  skillMatch: number;
  experienceMatch: number;
  ranking: string;
  hiringProbability: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  skillGaps: string[];
  sectionFeedback: {
    summary: string;
    skills: string;
    experience: string;
    projects: string;
    education: string;
    formatting: string;
  };
  improvements: string[];
  rewrittenPoints: string[];
  suggestedProjects: string[];
  suggestedCertifications: string[];
  finalTips: string[];
}
