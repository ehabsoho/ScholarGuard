export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PLAGIARISM = 'PLAGIARISM',
  AI_DETECTOR = 'AI_DETECTOR',
  HUMANIZER = 'HUMANIZER',
  LIBRARY = 'LIBRARY',
}

export enum HumanizeTone {
  SCIENTIFIC_FORMAL = 'Scientific Formal',
  REVIEWER_ACADEMIC = 'Reviewer-Level Academic',
  STUDENT_ACADEMIC = 'Student-Level Academic',
}

export interface PlagiarismMatch {
  sentence: string;
  source: string;
  sourceType: 'Journal' | 'Book' | 'Conference' | 'Website';
  similarity: number;
  url?: string;
}

export interface PlagiarismResult {
  score: number;
  matches: PlagiarismMatch[];
  summary: string;
}

export interface AIDetectionSegment {
  text: string;
  isAI: boolean;
  reason: string;
}

export interface AIDetectionResult {
  score: number; // 0-100% AI probability
  segments: AIDetectionSegment[];
  overallAnalysis: string;
}

export interface HumanizeResult {
  originalText: string;
  humanizedText: string;
  changesNote: string;
}

export interface LibraryDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  content: string; // Simplified for demo (raw text)
}
