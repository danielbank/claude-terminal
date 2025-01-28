import { $ } from "bun";

/**
 * Lists the files in the specified directory.
 * @param dir The directory to list files from.
 * @param flags Optional flags to pass to the ls command (e.g., '-la', '-R')
 * @returns A promise that resolves with the list of files.
 */
export async function listFilesInDirectory(
  dir: string = ".",
  flags?: string
): Promise<string> {
  const flagsArg = flags ? `${flags} ` : "";
  return await $`ls ${flagsArg}${dir}`.text();
}

/**
 * Gets the current working directory.
 * @param flags Optional flags to pass to the pwd command (e.g., '-L', '-P')
 * @returns A promise that resolves with the current working directory.
 */
export async function getCurrentDirectory(flags?: string): Promise<string> {
  const flagsArg = flags ? `${flags} ` : "";
  return await $`pwd ${flagsArg}`.text();
}

/**
 * Renames a file or directory.
 * @param oldName The current directory name
 * @param newName The new directory name
 * @param flags Optional flags to pass to the mv command (e.g., '-f', '-i', '-v')
 * @returns A promise that resolves when the directory is renamed
 * @throws Will throw an error if the operation fails or if attempting to move to a different path
 */
export async function renameFileOrDirectory(
  oldName: string,
  newName: string,
  flags?: string
): Promise<void> {
  if (newName.includes("/")) {
    throw new Error(
      "New name cannot include path separators - use moveDirectory() for moving directories"
    );
  }

  const flagsArg = flags ? `${flags} ` : "";
  await $`mv ${flagsArg}${oldName} ${newName}`;
}

/**
 * Moves a file or directory to a new location.
 * @param source The source file or directory path
 * @param destination The destination path where the file or directory will be moved
 * @param flags Optional flags to pass to the mv command (e.g., '-f', '-i', '-v')
 * @returns A promise that resolves when the file or directory is moved
 * @throws Will throw an error if the operation fails or if the destination file or directory already exists
 */
export async function moveFileOrDirectory(
  source: string,
  destination: string,
  flags?: string
): Promise<void> {
  if (!source.trim()) {
    throw new Error("Source file or directory path must be provided");
  }

  if (!destination.trim() || !destination.includes("/")) {
    throw new Error(
      "Destination must be a valid path (e.g., 'path/to/destination')"
    );
  }

  const flagsArg = flags ? `${flags} ` : "";
  await $`mv ${flagsArg}${source} ${destination}`;
}

/**
 * Creates a new directory.
 * @param dir The directory to create.
 * @param flags Optional flags to pass to the mkdir command (e.g., '-p', '-m', '-v')
 * @returns A promise that resolves when the directory is created
 */
export async function createDirectory(
  dir: string,
  flags?: string
): Promise<void> {
  const flagsArg = flags ? `${flags} ` : "";
  await $`mkdir ${flagsArg}${dir}`.text();
}
