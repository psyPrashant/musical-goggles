export type QuestionType = 'MCQ' | 'TEXT' | 'CODE_SUBMISSION' | 'GROUP';

export interface QuestionOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  body: string;
  tags: string[];
  options: QuestionOption[] | null;
  languageHint: string | null;
  memberQuestions?: Question[];
  maxScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionRequest {
  type: QuestionType;
  title: string;
  body: string;
  tags: string[];
  options?: { text: string; correct: boolean }[];
  languageHint?: string;
  memberQuestionIds?: string[];
  maxScore?: number;
}
