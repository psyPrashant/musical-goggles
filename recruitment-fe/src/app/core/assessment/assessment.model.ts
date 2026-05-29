import { QuestionType } from '../question/question.model';

export type AssessmentStatus = 'DRAFT' | 'PUBLISHED';

export interface Assessment {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number;
  status: AssessmentStatus;
  questionCount: number;
  passwordProtected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentQuestion {
  questionId: string;
  title: string;
  type: QuestionType;
  displayOrder: number;
}

export interface AssessmentDetail {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number;
  status: AssessmentStatus;
  questions: AssessmentQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentRequest {
  title: string;
  description: string | null;
  timeLimitMinutes: number;
}

export interface AddQuestionRequest {
  questionId: string;
  displayOrder: number;
}

export interface PreviewOption {
  id: string;
  text: string;
}

export interface PreviewQuestion {
  id: string;
  type: QuestionType;
  body: string;
  options: PreviewOption[] | null;
  languageHint: string | null;
}

export interface AssessmentPreview {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number;
  passwordRequired: boolean;
  questions: PreviewQuestion[];
}
