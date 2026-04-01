import fs from "node:fs";
import type { TaskSpec } from "./types.js";

function loadReference(ref: TaskSpec["references"][0]): string {
  let content: string;
  try {
    content = fs.readFileSync(ref.path, "utf-8");
  } catch {
    return `[FILE NOT FOUND: ${ref.path}]`;
  }

  if (ref.loadStrategy === "full") {
    return content;
  }

  if (ref.loadStrategy === "outline") {
    // Extract headings and structural markers only
    return content
      .split("\n")
      .filter((line) => /^#{1,6}\s|^<\w+|^\s*[-*]\s/.test(line))
      .join("\n");
  }

  if (ref.loadStrategy === "summary") {
    // First 500 chars as a rough summary
    return content.slice(0, 500) + (content.length > 500 ? "\n[truncated]" : "");
  }

  return content;
}

const WORKER_OUTPUT_SCHEMA = `--- REQUIRED OUTPUT FORMAT ---
When you complete the task, output a JSON block as the LAST thing in your response:
\`\`\`json
{
  "status": "done" | "stuck",
  "confidence": 0.0 to 1.0,
  "output_path": "/path/to/created/file (if applicable, otherwise null)",
  "self_assessment": "Brief assessment of your work quality",
  "needs_help": false,
  "question": null
}
\`\`\`
If you are stuck or unsure how to proceed, set needs_help to true and put your question in the question field. Do not guess.`;

export function assemblePrompt(
  taskSpec: TaskSpec,
  evalFeedback: string,
  iteration: number,
): string {
  const parts: string[] = [];

  if (taskSpec.systemContext) {
    parts.push(taskSpec.systemContext);
  }

  for (const ref of taskSpec.references) {
    const content = loadReference(ref);
    parts.push(`--- ${ref.role.toUpperCase()}: ${ref.path} ---\n${content}`);
  }

  // TODO: stage.inputFrom — load previous stage output
  // Deferred until presales pipeline build

  parts.push(`--- TASK ---\n${taskSpec.prompt}`);

  if (evalFeedback) {
    parts.push(`--- FEEDBACK FROM PREVIOUS ATTEMPT (iteration ${iteration}) ---\n${evalFeedback}`);
  }

  if (taskSpec.learnings) {
    parts.push(
      `--- RULES FROM PREVIOUS SIMILAR TASKS ---\nFollow these rules based on past experience:\n${taskSpec.learnings}`,
    );
  }

  parts.push(WORKER_OUTPUT_SCHEMA);

  return parts.join("\n\n");
}
