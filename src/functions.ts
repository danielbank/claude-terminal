import { $ } from "bun";

/**
 * Lists the files in the specified directory.
 * @param dir The directory to list files from.
 * @returns A promise that resolves with the list of files.
 */
export async function listFiles(dir: string = "."): Promise<string> {
  return await $`ls ${dir}`.text();
}

/**
 * Gets the current working directory.
 * @returns A promise that resolves with the current working directory.
 */
export async function getCurrentDirectory(): Promise<string> {
  return await $`pwd`.text();
}

/**
 * Checks the status of a git repository.
 * @returns A promise that resolves with the git status.
 */
export async function gitStatus(): Promise<string> {
  return await $`git status`.text();
}
