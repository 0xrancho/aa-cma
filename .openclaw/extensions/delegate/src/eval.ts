import fs from "node:fs";
import type { EvalResult, TaskSpec, WorkerOutput } from "./types.js";

type EvalFunction = (parsed: WorkerOutput, rawOutput: string) => EvalResult;

const codeChecks: Record<string, EvalFunction> = {
  file_exists: (parsed) => {
    if (!parsed.output_path) {
      return { passed: false, details: "No output_path provided by worker" };
    }
    const exists = fs.existsSync(parsed.output_path);
    return { passed: exists, details: exists ? "File created" : "File not found" };
  },

  valid_html: (parsed) => {
    if (!parsed.output_path) {
      return { passed: false, details: "No output_path provided" };
    }
    try {
      const html = fs.readFileSync(parsed.output_path, "utf-8");
      const valid = html.includes("<html") && html.includes("</html>");
      return { passed: valid, details: valid ? "Valid HTML structure" : "Invalid HTML" };
    } catch {
      return { passed: false, details: "Could not read output file" };
    }
  },

  csv_has_rows: (parsed) => {
    if (!parsed.output_path) {
      return { passed: false, details: "No output_path provided" };
    }
    try {
      const csv = fs.readFileSync(parsed.output_path, "utf-8");
      const rows = csv.trim().split("\n").length;
      return { passed: rows > 1, details: `${rows} rows found` };
    } catch {
      return { passed: false, details: "Could not read output file" };
    }
  },

  enrichment_rate: (parsed) => {
    if (!parsed.output_path) {
      return { passed: false, details: "No output_path provided" };
    }
    try {
      const data = JSON.parse(fs.readFileSync(parsed.output_path, "utf-8"));
      if (!Array.isArray(data)) {
        return { passed: false, details: "Output is not an array" };
      }
      const rate = data.filter((r: { enriched?: boolean }) => r.enriched).length / data.length;
      return {
        passed: rate >= 0.8,
        details: `Enrichment rate: ${(rate * 100).toFixed(0)}%`,
      };
    } catch {
      return { passed: false, details: "Could not parse output file as JSON array" };
    }
  },
};

export function runEval(
  evalConfig: TaskSpec["eval"],
  parsed: WorkerOutput,
  rawOutput: string,
): EvalResult {
  if (evalConfig.mode === "structured") {
    const threshold = evalConfig.passThreshold ?? 0.7;
    if (parsed.confidence >= threshold && parsed.status === "done") {
      return {
        passed: true,
        details: `Confidence ${parsed.confidence} >= ${threshold}`,
      };
    }
    return {
      passed: false,
      details: `Confidence ${parsed.confidence} < ${threshold}. Worker self-assessment: ${parsed.self_assessment}`,
    };
  }

  if (evalConfig.mode === "code") {
    const checkName = evalConfig.codeCheck;
    if (!checkName || !codeChecks[checkName]) {
      return { passed: false, details: `Unknown code check: ${checkName}` };
    }
    return codeChecks[checkName](parsed, rawOutput);
  }

  return { passed: false, details: `Unknown eval mode: ${evalConfig.mode}` };
}
