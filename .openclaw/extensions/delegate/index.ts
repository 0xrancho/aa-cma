import { definePluginEntry, type AnyAgentTool, type OpenClawPluginApi } from "./api.js";
import { createDelegateTool } from "./src/delegate-tool.js";

export default definePluginEntry({
  id: "delegate",
  name: "Delegate",
  description: "Structured task delegation with eval loops for ephemeral workers",
  register(api: OpenClawPluginApi) {
    api.registerTool(createDelegateTool(api) as unknown as AnyAgentTool);
  },
});
