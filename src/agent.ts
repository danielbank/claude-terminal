import "dotenv/config";
import { ChatAnthropic } from "@langchain/anthropic";
import { StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateAnnotation } from "./utils/state";
import {
  GetCurrentDirectoryTool,
  ListFilesInDirectoryTool,
  RenameFileOrDirectoryTool,
  MoveFileOrDirectoryTool,
  CreateDirectoryTool,
  ChangeDirectoryTool,
} from "./utils/tools";
import { CreatePlanNode, ExecutePlanNode, shouldContinue } from "./utils/nodes";

const tools = [
  GetCurrentDirectoryTool,
  ListFilesInDirectoryTool,
  RenameFileOrDirectoryTool,
  MoveFileOrDirectoryTool,
  CreateDirectoryTool,
  ChangeDirectoryTool,
];

const toolNode = new ToolNode(tools);

const planModel = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20240620",
  temperature: 0,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
});

const terminalModel = new ChatAnthropic({
  modelName: "claude-3-sonnet-20240229",
  temperature: 0,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
}).bindTools(tools);

const workflow = new StateGraph(StateAnnotation)
  .addNode("createPlan", CreatePlanNode(planModel))
  .addNode("terminal", ExecutePlanNode(terminalModel))
  .addNode("tools", toolNode)
  .addEdge("__start__", "createPlan")
  .addEdge("createPlan", "terminal")
  .addConditionalEdges("terminal", shouldContinue)
  .addEdge("tools", "terminal");

export const app = workflow.compile();
