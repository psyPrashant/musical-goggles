export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED';
export type QuestionType = 'MCQ' | 'TEXT' | 'CODE_SUBMISSION' | 'GROUP';

export interface TakeOption {
  id: string;
  optionText: string;
}

export interface TakeTestCase {
  id: string;
  description: string | null;
  stdin: string | null;
  expectedOutput: string;
  runOnlyOnSubmit?: boolean;
}

export interface TakeQuestion {
  id: string;
  displayOrder: number;
  type: QuestionType;
  title: string;
  body: string;
  options: TakeOption[] | null;
  subQuestions?: TakeQuestion[];
  starterCode?: string | null;
  visibleTestCases?: TakeTestCase[] | null;
  starterTemplates?: Record<string, string> | null;
}

export interface RunCodeRequest {
  questionId: string;
  sourceCode: string;
  language: string;
}

export interface TestCaseRunResult {
  testCaseId: string;
  description: string | null;
  stdin: string | null;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean;
  stderr: string | null;
  judge0StatusId: number;
  judge0StatusDescription: string;
}

export interface RunCodeResponse {
  results: TestCaseRunResult[];
}

export interface TakeAnswer {
  questionId: string;
  selectedOptionIds: string[] | null;
  textContent: string | null;
  savedAt: string;
  language?: string | null;
}

export interface AssessmentTakeResponse {
  assessmentId: string;
  title: string;
  description: string | null;
  totalQuestionCount: number;
  startedAt: string;
  deadline: string;
  questions: TakeQuestion[];
  answers: TakeAnswer[];
}

export interface AnswerInput {
  questionId: string;
  selectedOptionIds?: string[] | null;
  textContent?: string | null;
  language?: string | null;
}

export interface SaveAnswersRequest {
  answers: AnswerInput[];
}

export interface SaveAnswersResponse {
  answers: TakeAnswer[];
}

export interface SubmitRequest {
  autoSubmitted: boolean;
}

export interface SubmitResponse {
  submissionId: string;
  assessmentTitle: string;
  status: SubmissionStatus;
  submittedAt: string;
  answeredCount: number;
  totalQuestionCount: number;
}
