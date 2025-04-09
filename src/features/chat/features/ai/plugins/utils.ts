import { ToolRegistration } from "@agentkai/browser";

export const createTool = <T extends ToolRegistration>(tool: T) => {
  return tool as unknown as ToolRegistration;
};