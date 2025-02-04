import { execa } from "execa";

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
  const { stdout } = await execa("ls", flags ? [flags, dir] : [dir]);
  return `Listing files in ${dir}${
    flags ? ` with flags ${flags}` : ""
  }:\n${stdout}`;
}

/**
 * Gets the current working directory.
 * @param flags Optional flags to pass to the pwd command (e.g., '-L', '-P')
 * @returns A promise that resolves with the current working directory.
 */
export async function getCurrentDirectory(flags?: string): Promise<string> {
  const flagsArg = flags ? `${flags} ` : "";
  const result = await execa("pwd", flags ? [flags] : []).stdout;
  return `Current directory${
    flags ? ` (with flags ${flags})` : ""
  }:\n${result}`;
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
): Promise<string> {
  if (newName.includes("/")) {
    throw new Error(
      "New name cannot include path separators - use moveDirectory() for moving directories"
    );
  }

  const flagsArg = flags ? `${flags} ` : "";
  await execa("mv", [flagsArg + oldName, newName]);
  return `Renamed '${oldName}' to '${newName}'${
    flags ? ` with flags ${flags}` : ""
  }`;
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
): Promise<string> {
  if (!source.trim()) {
    throw new Error("Source file or directory path must be provided");
  }

  if (!destination.trim() || !destination.includes("/")) {
    throw new Error(
      "Destination must be a valid path (e.g., 'path/to/destination')"
    );
  }

  const flagsArg = flags ? `${flags} ` : "";
  await execa("mv", [flagsArg + source, destination]);
  return `Moved '${source}' to '${destination}'${
    flags ? ` with flags ${flags}` : ""
  }`;
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
): Promise<string> {
  const flagsArg = flags ? `${flags} ` : "";
  await execa("mkdir", [flagsArg + dir]);
  return `Created directory '${dir}'${flags ? ` with flags ${flags}` : ""}`;
}

/**
 * Changes the current working directory.
 * @param dir The directory to change to.
 * @returns A promise that resolves when the directory is changed
 */
export async function changeDirectory(dir: string): Promise<string> {
  try {
    process.chdir(dir);
    return `Changed directory to: ${process.cwd()}`;
  } catch (error) {
    throw new Error(`Failed to change directory: ${error}`);
  }
}
