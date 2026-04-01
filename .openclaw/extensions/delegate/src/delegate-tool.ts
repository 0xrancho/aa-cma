import { Type } from "@sinclair/typebox";
import type { AnyAgentTool, OpenClawPluginApi } from "../api.js";
import { delegateHandler } from "./loop.js";
import type { TaskSpec } from "./types.js";

const FileReferenceSchema = Type.Object({
  path: Type.String(),
  role: Type.Union([
    Type.Literal("template"),
    Type.Literal("brand_guide"),
    Type.Literal("example"),
    Type.Literal("input"),
    Type.Literal("context"),
  ]),
  loadStrategy: Type.Union([
    Type.Literal("full"),
    Type.Literal("summary"),
    Type.Literal("outline"),
  ]),
});

const TaskSpecSchema = Type.Object({
  name: Type.String({ description: "Human-readable task name" }),
  domain: Type.Union([
    Type.Literal("sales_ops"),
    Type.Literal("pursuits"),
    Type.Literal("research"),
  ]),
  prompt: Type.String({ description: "Scoped instruction for the worker" }),
  systemContext: Type.Optional(Type.String()),
  tools: Type.Array(Type.String(), { description: "Tool IDs the worker gets" }),
  references: Type.Array(FileReferenceSchema, { default: [] }),
  eval: Type.Object({
    mode: Type.Union([Type.Literal("structured"), Type.Literal("code")]),
    criteria: Type.String({ description: "What 'done' looks like" }),
    passThreshold: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
    codeCheck: Type.Optional(Type.String()),
  }),
  maxIterations: Type.Number({ minimum: 1, maximum: 10, description: "Hard stop for retry loop" }),
  model: Type.String({ description: "Model ID for the worker (e.g. openai-codex/gpt-5.4)" }),
  timeoutSeconds: Type.Optional(Type.Number({ minimum: 0 })),
  learnings: Type.Optional(Type.String()),
  stage: Type.Optional(
    Type.Object({
      name: Type.String(),
      inputFrom: Type.Optional(Type.String()),
      outputKey: Type.String(),
    }),
  ),
});

export function createDelegateTool(api: OpenClawPluginApi): AnyAgentTool {
  return {
    name: "delegate",
    label: "Delegate",
    description:
      "Delegate a task to an ephemeral worker agent. Provide a structured TaskSpec JSON. " +
      "Returns a structured TaskResult with pass/fail status. Use this for any execution work: " +
      "file creation, research, document generation, data enrichment, API calls.",
    parameters: TaskSpecSchema,
    async execute(_toolCallId: string, args: Record<string, unknown>) {
      const taskSpec = args as unknown as TaskSpec;

      if (!taskSpec.name?.trim()) {
        throw new Error("TaskSpec.name is required");
      }
      if (!taskSpec.prompt?.trim()) {
        throw new Error("TaskSpec.prompt is required");
      }
      if (!taskSpec.model?.trim()) {
        throw new Error("TaskSpec.model is required");
      }

      const result = await delegateHandler(api, taskSpec);

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  } as AnyAgentTool;
}
