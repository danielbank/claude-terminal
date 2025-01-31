import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  changeDirectory,
  createDirectory,
  exitTerminal,
  getCurrentDirectory,
  listFilesInDirectory,
  moveFileOrDirectory,
  renameFileOrDirectory,
  requestPermission,
  checkPermission,
} from "./functions.ts";

export const GetCurrentDirectoryTool = tool(
  async ({ flags }: { flags?: string }) => {
    return await getCurrentDirectory(flags);
  },
  {
    name: "getCurrentDirectory",
    description: "Gets the current working directory.",
    schema: z.object({
      flags: z
        .string()
        .optional()
        .describe(
          "Optional flags to pass to the pwd command (e.g., '-L', '-P')"
        ),
    }),
  }
);

export const ListFilesInDirectoryTool = tool(
  async ({ dir, flags }: { dir: string; flags?: string }) => {
    return await listFilesInDirectory(dir, flags);
  },
  {
    name: "listFilesInDirectory",
    description: "Lists the files in the specified directory..",
    schema: z.object({
      dir: z.string().describe("The directory to list the files in."),
      flags: z
        .string()
        .optional()
        .describe(
          "Optional flags to pass to the ls command (e.g., '-la', '-R')"
        ),
    }),
  }
);

export const RenameFileOrDirectoryTool = tool(
  async ({
    oldName,
    newName,
    flags,
  }: {
    oldName: string;
    newName: string;
    flags?: string;
  }) => {
    return await renameFileOrDirectory(oldName, newName, flags);
  },
  {
    name: "renameFileOrDirectory",
    description: "Renames a file or directory.",
    schema: z.object({
      oldName: z.string().describe("The old name of the file or directory."),
      newName: z.string().describe("The new name of the file or directory."),
      flags: z
        .string()
        .optional()
        .describe(
          "Optional flags to pass to the mv command (e.g., '-f', '-i', '-v')"
        ),
    }),
  }
);

export const MoveFileOrDirectoryTool = tool(
  async ({
    source,
    destination,
    flags,
  }: {
    source: string;
    destination: string;
    flags?: string;
  }) => {
    return await moveFileOrDirectory(source, destination, flags);
  },
  {
    name: "moveFileOrDirectory",
    description: "Moves a file or directory to a new location.",
    schema: z.object({
      source: z.string().describe("The source file or directory."),
      destination: z.string().describe("The destination file or directory."),
      flags: z
        .string()
        .optional()
        .describe(
          "Optional flags to pass to the mv command (e.g., '-f', '-i', '-v')"
        ),
    }),
  }
);

export const CreateDirectoryTool = tool(
  async ({ dir, flags }: { dir: string; flags?: string }) => {
    return await createDirectory(dir, flags);
  },
  {
    name: "createDirectory",
    description: "Creates a new directory.",
    schema: z.object({
      dir: z.string().describe("The directory to create."),
      flags: z
        .string()
        .optional()
        .describe(
          "Optional flags to pass to the mkdir command (e.g., '-p', '-m')"
        ),
    }),
  }
);

export const ChangeDirectoryTool = tool(
  async ({ dir, flags }: { dir: string; flags?: string }) => {
    return await changeDirectory(dir);
  },
  {
    name: "changeDirectory",
    description: "Changes the current working directory.",
    schema: z.object({
      dir: z.string().describe("The directory to change to."),
    }),
  }
);

export const RequestPermissionTool = tool(
  async ({ permission }: { permission: "read" | "write" | "cwd" }) => {
    return await requestPermission(permission);
  },
  {
    name: "requestPermission",
    description: "Requests permission to access a resource..",
    schema: z.object({
      permission: z
        .enum(["read", "write", "cwd"])
        .describe("The permission to request."),
    }),
  }
);

export const CheckPermissionTool = tool(
  async ({ permission }: { permission: "read" | "write" | "cwd" }) => {
    return await checkPermission(permission);
  },
  {
    name: "checkPermission",
    description: "Checks if a permission is granted.",
    schema: z.object({
      permission: z
        .enum(["read", "write", "cwd"])
        .describe("The permission to check."),
    }),
  }
);

export const ExitTerminalTool = tool(
  async () => {
    return await exitTerminal();
  },
  {
    name: "exitTerminal",
    description: "Exits the terminal..",
    schema: z.object({}),
  }
);
