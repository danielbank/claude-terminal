import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import readline from "node:readline";
import chalk from "chalk";
import { ChatAnthropic } from "@langchain/anthropic";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  LoadEntriesInDirectoryTool,
  ListAttributeInDirectoryTool,
  MoveEntriesTool,
  MakeDirectoryTool,
} from "@/tools.ts";
import { SYSTEM_PROMPT } from "@/prompts.ts";
import { StateAnnotation } from "@/state.ts";
import { AgentNode, shouldContinue } from "@/nodes.ts";
import process from "node:process";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

await load({ export: true });

const tools = [
  LoadEntriesInDirectoryTool,
  ListAttributeInDirectoryTool,
  MoveEntriesTool,
  MakeDirectoryTool,
];
const toolNode = new ToolNode(tools);

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

const messages = [new SystemMessage(SYSTEM_PROMPT)];

const askQuestion = () => {
  rl.question(
    `${chalk.hex("#EEDAB0")("Claude")} ${chalk.hex("CE6347")("❯ ")}`,
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
        await app.invoke(
          {
            messages: [...messages, new HumanMessage(input)],
          },
          {
            recursionLimit: 1000,
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
};

askQuestion();
