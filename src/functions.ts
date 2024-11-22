import { exec } from "child_process";

/**
 * Executes a shell command and returns it as a Promise.
 * @param cmd The command to execute.
 * @returns A promise that resolves with the command output.
 */
function executeCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Lists the files in the specified directory.
 * @param dir The directory to list files from.
 * @returns A promise that resolves with the list of files.
 */
export function listFiles(dir: string = "."): Promise<string> {
  return executeCommand(`ls ${dir}`);
}

/**
 * Gets the current working directory.
 * @returns A promise that resolves with the current working directory.
 */
export function getCurrentDirectory(): Promise<string> {
  return executeCommand("pwd");
}

/**
 * Checks the status of a git repository.
 * @returns A promise that resolves with the git status.
 */
export function gitStatus(): Promise<string> {
  return executeCommand("git status");
}
