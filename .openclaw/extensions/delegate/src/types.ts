export interface FileReference {
  path: string;
  role: "template" | "brand_guide" | "example" | "input" | "context";
  loadStrategy: "full" | "summary" | "outline";
}

export interface TaskSpec {
  name: string;
  domain: "sales_ops" | "pursuits" | "research";
  prompt: string;
  systemContext?: string;

  tools: string[];
  references: FileReference[];

  eval: {
    mode: "structured" | "code";
    criteria: string;
    passThreshold?: number;
    codeCheck?: string;
  };

  maxIterations: number;
  model: string;
  timeoutSeconds?: number;

  learnings?: string;

  stage?: {
    name: string;
    inputFrom?: string;
    outputKey: string;
  };
}

export interface TaskResult {
  id: string;
  taskName: string;
  status: "success" | "failed" | "stuck" | "timeout";
  iterations: number;

  outputPath?: string;
  outputData?: unknown;
  workerSummary: string;

  evalPassed: boolean;
  evalDetails: string;

  tokensUsed: number;
  estimatedCost: number;
  durationSeconds: number;

  transcriptPath: string;
}

export interface WorkerOutput {
  status: "done" | "stuck";
  confidence: number;
  output_path?: string;
  self_assessment: string;
  needs_help: boolean;
  question?: string | null;
}

export interface EvalResult {
  passed: boolean;
  details: string;
}
