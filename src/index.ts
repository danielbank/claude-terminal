import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import "dotenv/config";
import readline from "node:readline";
import chalk from "chalk";
import { ChatAnthropic } from "@langchain/anthropic";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  GetCurrentDirectoryTool,
  ListFilesInDirectoryTool,
  RenameFileOrDirectoryTool,
  MoveFileOrDirectoryTool,
  CreateDirectoryTool,
  ChangeDirectoryTool,
  ExitTerminalTool,
} from "./tools.ts";
import { SYSTEM_PROMPT } from "./prompts.ts";
import { StateAnnotation } from "./state.ts";
import { CallModelNode, shouldContinue } from "./nodes.ts";
const tools = [
  GetCurrentDirectoryTool,
  ListFilesInDirectoryTool,
  RenameFileOrDirectoryTool,
  MoveFileOrDirectoryTool,
  CreateDirectoryTool,
  ChangeDirectoryTool,
  ExitTerminalTool,
];

const toolNode = new ToolNode(tools);

const model = new ChatAnthropic({
  modelName: "claude-3-sonnet-20240229",
  temperature: 0,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
}).bindTools(tools);

const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", CallModelNode(model))
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const checkpointer = new MemorySaver();

const app = workflow.compile({ checkpointer });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (initialize = false) => {
  rl.question(
    `${chalk.hex("#EEDAB0")("Claude")} ${chalk.hex("CE6347")("❯ ")}`,
    async (input) => {
      if (input === "") {
        askQuestion();
        return;
      }
      const currentState = await checkpointer.get({
        configurable: { thread_id: "42" },
      });
      const existingMessages =
        (currentState as any)?.messages || initialize
          ? [new SystemMessage(SYSTEM_PROMPT)]
          : [];

      console.log(existingMessages);
      try {
        await app.invoke(
          {
            messages: [...existingMessages, new HumanMessage(input)],
          },
          {
            configurable: { thread_id: "42" },
            callbacks: [
              {
                handleLLMEnd: (output) => {
                  console.log(
                    chalk.hex("#EEDAB0")(output.generations[0][0].text)
                  );
                },
              },
            ],
          }
        );
      } catch (error) {
        console.error(chalk.red("An error occurred: "), error);
      }

      askQuestion();
    }
  );
};

askQuestion(true);
