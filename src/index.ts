import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import readline from "readline";
import chalk from "chalk";
import {
  callTool,
  GetCurrentDirectoryTool,
  ListFilesTool,
  GitStatusTool,
} from "./tools";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = () => {
  rl.question(
    `${chalk.hex("#EEDAB0")("Claude")} ${chalk.hex("CE6347")("❯ ")}`,
    async (input) => {
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1024,
        system:
          "You are a Terminal UI Assistant. The user will ask you in plain English to perform a task in the terminal. You will respond with the output of the most appropriate tool call.  If the user indicates a desire to stop executing the program, please respond with a stop_reason of `end_sequence`.",
        tools: [GetCurrentDirectoryTool, ListFilesTool, GitStatusTool],
        messages: [
          {
            role: "user",
            content: input,
          },
        ],
      });

      switch (response.stop_reason) {
        case "tool_use": {
          const toolUseMessage = response.content
            .filter((message) => message.type === "tool_use")
            .pop();
          console.log(
            chalk.green(`Tool use detected: ${toolUseMessage?.name}.`)
          );
          console.log(await callTool(toolUseMessage));

          askQuestion();
          break;
        }
        default:
        case "end_turn": {
          console.log(
            chalk.hex("#EEDAB0")("Thank you for using Claude Terminal.")
          );
          rl.close();
          break;
        }
      }
    }
  );
};

askQuestion();
