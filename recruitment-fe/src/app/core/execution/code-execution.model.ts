export type RunStatus = 'OK' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIMED_OUT';

export interface RunCodeRequest {
  code: string;
  stdin?: string;
}

export interface RunCodeResponse {
  status: RunStatus;
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  exitCode: number | null;
}
