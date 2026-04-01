import crypto from "node:crypto";
import type { OpenClawPluginApi } from "../api.js";
import { runEval } from "./eval.js";
import { assemblePrompt } from "./prompt.js";
import type { TaskResult, TaskSpec, WorkerOutput } from "./types.js";

function generateId(): string {
  return crypto.randomUUID();
}

function stripCodeFences(s: string): string {
  const trimmed = s.trim();
  const m = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? (m[1] ?? "").trim() : trimmed;
}

function extractWorkerJson(messages: unknown[]): { parsed: WorkerOutput | null; raw: string } {
  // Walk messages in reverse to find the last assistant message with JSON
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i] as { role?: string; content?: string; text?: string };
    const text = msg.content ?? msg.text ?? "";
    if (typeof text !== "string" || !text.trim()) continue;

    // Find last JSON block in the message
    const jsonBlocks = text.match(/```(?:json)?\s*([\s\S]*?)```/g);
    if (jsonBlocks && jsonBlocks.length > 0) {
      const lastBlock = jsonBlocks[jsonBlocks.length - 1];
      try {
        const cleaned = stripCodeFences(lastBlock);
        const parsed = JSON.parse(cleaned) as WorkerOutput;
        return { parsed, raw: text };
      } catch {
        // Not valid JSON, keep searching
      }
    }

    // Try parsing the entire message as JSON (worker might not use fences)
    try {
      const parsed = JSON.parse(text.trim()) as WorkerOutput;
      return { parsed, raw: text };
    } catch {
      // Not JSON
    }
  }

  return { parsed: null, raw: "" };
}

function buildTaskResult(
  id: string,
  taskSpec: TaskSpec,
  status: TaskResult["status"],
  iterations: number,
  parsed: WorkerOutput | null,
  evalDetails: string,
  startTime: number,
): TaskResult {
  return {
    id,
    taskName: taskSpec.name,
    status,
    iterations,
    outputPath: parsed?.output_path ?? undefined,
    outputData: undefined,
    workerSummary: parsed?.self_assessment ?? "",
    evalPassed: status === "success",
    evalDetails,
    tokensUsed: 0, // TODO: requires provider-level usage reporting
    estimatedCost: 0, // TODO: requires provider-level usage reporting
    durationSeconds: Math.round((Date.now() - startTime) / 1000),
    transcriptPath: "", // TODO: transcript persistence
  };
}

export async function delegateHandler(
  api: OpenClawPluginApi,
  taskSpec: TaskSpec,
): Promise<TaskResult> {
  const taskId = generateId();
  const startTime = Date.now();
  let iteration = 0;
  let lastEvalFeedback = "";

  while (iteration < taskSpec.maxIterations) {
    iteration++;
    const sessionKey = `delegate-${taskId}-iter-${iteration}`;
    const timeoutMs = (taskSpec.timeoutSeconds ?? 300) * 1000;

    // 1. Assemble worker prompt
    const workerPrompt = assemblePrompt(taskSpec, lastEvalFeedback, iteration);

    // 2. Spawn worker
    let runId: string;
    try {
      const spawnResult = await api.runtime.subagent.run({
        sessionKey,
        message: workerPrompt,
        model: taskSpec.model,
      });
      runId = spawnResult.runId;
    } catch (err) {
      return buildTaskResult(
        taskId,
        taskSpec,
        "failed",
        iteration,
        null,
        `Spawn failed: ${err instanceof Error ? err.message : String(err)}`,
        startTime,
      );
    }

    // 3. Wait for completion
    const waitResult = await api.runtime.subagent.waitForRun({
      runId,
      timeoutMs,
    });

    if (waitResult.status === "timeout") {
      await cleanupSession(api, sessionKey);
      if (iteration < taskSpec.maxIterations) {
        lastEvalFeedback = "Previous attempt timed out. Try a more focused approach.";
        continue;
      }
      return buildTaskResult(taskId, taskSpec, "timeout", iteration, null, "Timed out", startTime);
    }

    if (waitResult.status === "error") {
      await cleanupSession(api, sessionKey);
      if (iteration < taskSpec.maxIterations) {
        lastEvalFeedback = `Previous attempt errored: ${waitResult.error}. Try again.`;
        continue;
      }
      return buildTaskResult(
        taskId,
        taskSpec,
        "failed",
        iteration,
        null,
        `Worker error: ${waitResult.error}`,
        startTime,
      );
    }

    // 4. Get worker output
    const messagesResult = await api.runtime.subagent.getSessionMessages({
      sessionKey,
    });
    const { parsed, raw } = extractWorkerJson(messagesResult.messages);

    if (!parsed) {
      await cleanupSession(api, sessionKey);
      if (iteration < taskSpec.maxIterations) {
        lastEvalFeedback =
          "Previous attempt did not produce valid structured JSON output. You MUST output the required JSON block as the last thing in your response.";
        continue;
      }
      return buildTaskResult(
        taskId,
        taskSpec,
        "failed",
        iteration,
        null,
        "Worker did not produce parseable JSON output",
        startTime,
      );
    }

    // 5. Handle "needs help"
    if (parsed.needs_help) {
      await cleanupSession(api, sessionKey);
      return buildTaskResult(
        taskId,
        taskSpec,
        "stuck",
        iteration,
        parsed,
        `Worker needs help: ${parsed.question ?? "no question provided"}`,
        startTime,
      );
    }

    // 6. Run eval gate
    const evalResult = runEval(taskSpec.eval, parsed, raw);

    if (evalResult.passed) {
      await cleanupSession(api, sessionKey);
      return buildTaskResult(
        taskId,
        taskSpec,
        "success",
        iteration,
        parsed,
        evalResult.details,
        startTime,
      );
    }

    // 7. Eval failed — prepare feedback for next iteration
    await cleanupSession(api, sessionKey);
    lastEvalFeedback = `Previous attempt failed eval. Feedback: ${evalResult.details}. Try again with a different approach.`;
  }

  // Max iterations exhausted
  return buildTaskResult(
    taskId,
    taskSpec,
    "failed",
    iteration,
    null,
    "Max iterations reached",
    startTime,
  );
}

async function cleanupSession(api: OpenClawPluginApi, sessionKey: string): Promise<void> {
  try {
    await api.runtime.subagent.deleteSession({ sessionKey });
  } catch {
    // Cleanup is best-effort
  }
}
