import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  loadEntriesInDirectory,
  getEntriesFromRedis,
  moveEntry,
  makeDirectory,
} from "@/functions.ts";
import type { Entry } from "@/types.ts";

export const LoadEntriesInDirectoryTool = tool(
  async ({ dir }: { dir: string }) => {
    try {
      const result = await loadEntriesInDirectory(dir);
      console.log(result);
      return result;
    } catch (error) {
      throw new Error(`Failed to load entries in "${dir}": ${error}`);
    }
  },
  {
    name: "loadEntriesInDirectory",
    description:
      "Loads the files and folders in the specified directory into Redis.  NOTE: Necessary for any operations because the number of files and folders is too large to fit into memory.",
    schema: z.object({
      dir: z
        .string()
        .describe("The directory to load the files and folders from."),
    }),
  }
);

export const ListAttributeInDirectoryTool = tool(
  async ({ dir, attribute }: { dir: string; attribute: keyof Entry }) => {
    const { files, folders, remainingCount } = await getEntriesFromRedis(dir);
    const count = files.length + folders.length;

    let result = "";
    if (attribute === "name") {
      result = `${count} entries (${remainingCount} remaining) in "${dir}":\nFiles:\n${files
        .map((f: Entry) => `${f.name}`)
        .join("\n")}\n---\nFolders\n---\n${folders
        .map((f: Entry) => `${f.name}`)
        .join("\n")}\n---\n`;
    } else {
      result = `${count} entries (${remainingCount} remaining) in "${dir}":\nFiles:\n${files
        .map((f: Entry) => `${f.name} = ${f[attribute as keyof Entry]}`)
        .join("\n")}\n---\nFolders\n---\n${folders
        .map((f: Entry) => `${f.name} = ${f[attribute as keyof Entry]}`)
        .join("\n")}\n---\n`;
    }

    return {
      result,
      remainingCount,
    };
  },
  {
    name: "listAttributeInDirectory",
    description:
      "Lists the attributes for the files and folders in the specified directory, processing in batches.",
    schema: z.object({
      dir: z.string().describe("The directory to list the attributes for."),
      attribute: z
        .enum(["name", "type", "size", "modified", "created"])
        .describe(
          "The attribute to list for the files and folders in the directory."
        ),
    }),
  }
);

export const MoveEntryTool = tool(
  async ({ source, destination }: { source: string; destination: string }) => {
    const result = await moveEntry(source, destination);
    return result;
  },
  {
    name: "moveEntry",
    description: "Moves an entry from one directory to another.",
    schema: z.object({
      source: z.string().describe("The source entry to move."),
      destination: z.string().describe("The destination directory."),
    }),
  }
);

export const MakeDirectoryTool = tool(
  async ({ path }: { path: string }) => {
    const result = await makeDirectory(path);
    return result;
  },
  {
    name: "makeDirectory",
    description: "Creates a new directory.",
    schema: z.object({
      path: z.string().describe("The path to create the directory."),
    }),
  }
);
