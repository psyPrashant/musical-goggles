import { QuestionType } from '../question/question.model';
import { TakeTestCase, TestCaseRunResult } from '../take/candidate-take.model';

export type { TakeTestCase, TestCaseRunResult };

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
  subQuestionCount: number;
}

export interface AssessmentDetail {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number;
  status: AssessmentStatus;
  questions: AssessmentQuestion[];
  passwordProtected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentRequest {
  title: string;
  description: string | null;
  timeLimitMinutes: number;
  accessPassword?: string | null;
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
  subQuestions?: PreviewQuestion[];
  starterCode?: string | null;
  visibleTestCases?: TakeTestCase[] | null;
  starterTemplates?: Record<string, string> | null;
}

export interface AssessmentPreview {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number;
  passwordRequired: boolean;
  questions: PreviewQuestion[];
}
