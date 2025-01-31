import { mkdir, readdir, readFile } from "node:fs/promises";

const CORPUS_DIR = import.meta.dir + "/corpus";

let corpusFileContents: string[] = [];

try {
  await mkdir(CORPUS_DIR, { recursive: true });
  const corpusFiles = await readdir(CORPUS_DIR);
  corpusFileContents = await Promise.all(
    corpusFiles.map(async (file) => {
      const filePath = `${CORPUS_DIR}/${file}`;
      return await readFile(filePath, "utf-8");
    })
  );
} catch (error) {
  console.warn(`Warning: Error reading corpus directory: ${error}`);
  corpusFileContents = [];
}

export const SYSTEM_PROMPT = `You are a helpful terminal assistant.

The following are the manual pages for the tools you have access to:

\`\`\`
${corpusFileContents.join("\n")}
\`\`\`
`;

// # User Interaction Instructions
// When the user asks you to interact with the file system, use the tools provided to you.

// For tools that don't require confirmation:
// 1. Execute them directly and respond with the output of the tool

// For tools that require user confirmation:
// 1. State what you are going to do
// 2. Ask "Do you want to proceed? [y/n]"
// 3. Only proceed if user responds with "yes" or "y"
// 4. If user responds with "no" or "n", say "Ok, I won't do that."

// If the user asks you to do something that you don't have the tools for, say "I don't know how to do that."
// `;
