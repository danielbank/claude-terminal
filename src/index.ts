import process from "node:process";
import readline from "node:readline";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import chalk from "chalk";
import { traceable } from "langsmith/traceable";
import type { DynamicStructuredTool } from "@langchain/core";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, MemorySaver } from "@langchain/langgraph";
import { SYSTEM_PROMPT } from "@/prompts.ts";
import { AgentNode, ToolNode, shouldContinue } from "@/nodes.ts";
import { StateAnnotation } from "@/state.ts";
import {
  LoadEntriesInDirectoryTool,
  ListAttributeInDirectoryTool,
  MoveEntryTool,
  MakeDirectoryTool,
} from "@/tools.ts";

await load({ export: true });

const tools = [
  LoadEntriesInDirectoryTool,
  ListAttributeInDirectoryTool,
  MoveEntryTool,
  MakeDirectoryTool,
];
const toolNode = new ToolNode(tools as DynamicStructuredTool[]);

const model = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20241022",
  temperature: 0,
  anthropicApiKey: Deno.env.get("ANTHROPIC_API_KEY"),
}).bindTools(tools);

const agentNode = AgentNode(model);

const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", agentNode)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const checkpointer = new MemorySaver();

const app = workflow.compile({ checkpointer });

const cleanup = () => {
  console.log(chalk.cyanBright("\nGoodbye!"));
  rl.close();
  Deno.removeSignalListener("SIGINT", handleSignal);
  Deno.removeSignalListener("SIGTERM", handleSignal);
  Deno.exit(0);
};

const handleSignal = () => {
  try {
    cleanup();
  } catch (error) {
    console.error("Error during cleanup:", error);
    Deno.exit(1);
  }
};

Deno.addSignalListener("SIGINT", handleSignal);
Deno.addSignalListener("SIGTERM", handleSignal);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = traceable(
  (initialize = false) => {
    rl.question(
      `${chalk.hex("#F0B433")("Xaac")} ${chalk.hex("#2F8FCA")("❯ ")}`,
      async (input) => {
        if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
          cleanup();
          return;
        }

        if (input === "") {
          askQuestion();
          return;
        }

        try {
          const currentState = await checkpointer.get({
            configurable: { thread_id: "42" },
          });
          const existingMessages =
            (currentState as unknown as typeof StateAnnotation.State)
              ?.messages || initialize
              ? [new SystemMessage(SYSTEM_PROMPT)]
              : [];

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
                      chalk.hex("#2F8FCA")(output.generations[0][0].text)
                    );
                  },
                },
              ],
            }
          );
        } catch (error) {
          console.error(chalk.red("An error occurred:"));
          if (error instanceof Error) {
            console.error(chalk.red(error.message));
            console.error(chalk.red(error.stack));
          } else {
            console.error(chalk.red(String(error)));
          }
        }

        askQuestion();
      }
    );
  },
  { name: "askQuestion" }
);

askQuestion(true);
