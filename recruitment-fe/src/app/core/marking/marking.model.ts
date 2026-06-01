export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED';
export type MarkingStatus = 'FULLY_MARKED' | 'PENDING_REVIEW';
export type QuestionType = 'MCQ' | 'TEXT' | 'CODE_SUBMISSION';

export interface SubmissionSummary {
  submissionId: string;
  candidateId: string;
  candidateName: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  answeredCount: number;
  totalAnswers: number;
  markedCount: number;
}

export interface ResultQuestion {
  questionId: string;
  answerId: string | null;
  questionTitle: string;
  questionType: QuestionType;
  candidateAnswer: string | null;
  score: number | null;
  feedback: string | null;
  autoMarked: boolean;
  markedBy: string | null;
  markedAt: string | null;
}

export interface ResultSummary {
  submissionId: string;
  candidateName: string;
  assessmentTitle: string;
  submittedAt: string | null;
  totalScore: number;
  markingStatus: MarkingStatus;
  questions: ResultQuestion[];
}

export interface ScoreAnswerRequest {
  score: number;
  feedback?: string | null;
}

export interface AnswerScoreResponse {
  answerId: string;
  score: number;
  feedback: string | null;
  autoMarked: boolean;
  markedBy: string | null;
  markedAt: string | null;
}
