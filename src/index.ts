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
} from "@/tools.ts";
import { SYSTEM_PROMPT } from "@/prompts.ts";
import { StateAnnotation } from "@/state.ts";
import { CallModelNode, shouldContinue } from "@/nodes.ts";
import process from "node:process";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const tools = [LoadEntriesInDirectoryTool, ListAttributeInDirectoryTool];

const toolNode = new ToolNode(tools);

await load({ export: true });

const model = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20241022",
  temperature: 0,
  anthropicApiKey: Deno.env.get("ANTHROPIC_API_KEY"),
}).bindTools(tools);

const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", CallModelNode(model))
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const checkpointer = new MemorySaver();

const app = workflow.compile({ checkpointer });

const cleanup = () => {
  console.log(chalk.cyanBright("\nGoodbye!"));
  rl.close();
  Deno.exit(0);
};

// Handle interrupts
Deno.addSignalListener("SIGINT", cleanup);
Deno.addSignalListener("SIGTERM", cleanup);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (initialize = false) => {
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
        const currentState = await checkpointer.get({
          configurable: { thread_id: "42" },
        });
        const existingMessages =
          (currentState as unknown as typeof StateAnnotation.State)?.messages ||
          initialize
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

askQuestion(true);
