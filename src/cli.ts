import readline from "readline";
import chalk from "chalk";

import { app } from "./agent";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = () => {
  rl.question(
    `${chalk.hex("#EEDAB0")("Claude")} ${chalk.hex("CE6347")("❯ ")}`,
    async (input) => {
      if (input === "exit" || input === "quit" || input === "q") {
        rl.close();
        return;
      }

      if (input === "") {
        askQuestion();
        return;
      }

      try {
        await app.invoke({
          goal: input,
        });
      } catch (error) {
        console.error(chalk.red("An error occurred: "), error);
      }

      askQuestion();
    }
  );
};

askQuestion();
