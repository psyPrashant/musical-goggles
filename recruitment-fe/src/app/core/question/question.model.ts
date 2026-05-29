export type QuestionType = 'MCQ' | 'TEXT' | 'CODE_SUBMISSION';

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
}

export interface GroupQuestion {
  questionId: string;
  title: string;
  type: QuestionType;
  displayOrder: number | null;
}

export interface QuestionGroup {
  id: string;
  name: string;
  description: string | null;
  structured: boolean;
  questions: GroupQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionGroupRequest {
  name: string;
  description: string | null;
  structured: boolean;
}
