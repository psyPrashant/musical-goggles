export type QuestionType = 'MCQ' | 'TEXT' | 'CODE_SUBMISSION' | 'GROUP';

export interface QuestionOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface CodeTestCase {
  id?: string;
  description?: string | null;
  stdin?: string | null;
  expectedOutput: string;
  visible: boolean;
  displayOrder: number;
  runOnlyOnSubmit?: boolean;
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
  createdAt: string;
  updatedAt: string;
  starterCode?: string | null;
  starterCodeJava?: string | null;
  starterCodeCsharp?: string | null;
  starterCodePython?: string | null;
  testCases?: CodeTestCase[] | null;
}

export interface QuestionRequest {
  type: QuestionType;
  title: string;
  body: string;
  tags: string[];
  options?: { text: string; correct: boolean }[];
  languageHint?: string;
  memberQuestionIds?: string[];
  starterCode?: string;
  testCases?: Omit<CodeTestCase, 'id'>[];
  starterCodeJava?: string;
  starterCodeCsharp?: string;
  starterCodePython?: string;
}
