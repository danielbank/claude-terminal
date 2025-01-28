import type {
  Tool,
  ToolUseBlock,
} from "@anthropic-ai/sdk/resources/messages.mjs";
import {
  createDirectory,
  getCurrentDirectory,
  listFilesInDirectory,
  moveFileOrDirectory,
  renameFileOrDirectory,
} from "./functions";

export const GetCurrentDirectoryTool: Tool = {
  name: "getCurrentDirectory",
  description: "Lists the files in the current directory.",
  input_schema: {
    type: "object",
    properties: {
      flags: {
        type: "string",
        default: "",
      },
    },
  },
};

export const ListFilesInDirectoryTool: Tool = {
  name: "listFilesInDirectory",
  description: "Lists the files in the specified directory.",
  input_schema: {
    type: "object",
    properties: {
      flags: {
        type: "string",
        default: "",
      },
      dir: {
        type: "string",
        default: ".",
      },
    },
    required: ["dir"],
  },
};

export const RenameFileOrDirectoryTool: Tool = {
  name: "renameFileOrDirectory",
  description: "Renames a file or directory.",
  input_schema: {
    type: "object",
    properties: {
      oldName: { type: "string" },
      newName: { type: "string" },
    },
  },
};

export const MoveFileOrDirectoryTool: Tool = {
  name: "moveFileOrDirectory",
  description: "Moves a file or directory to a new location.",
  input_schema: {
    type: "object",
    properties: {
      source: { type: "string" },
      destination: { type: "string" },
    },
  },
};

export const CreateDirectoryTool: Tool = {
  name: "createDirectory",
  description: "Creates a new directory.",
  input_schema: { type: "object", properties: { dir: { type: "string" } } },
};

export const callTool = async (block: ToolUseBlock) => {
  switch (block?.name) {
    case "getCurrentDirectory": {
      return await getCurrentDirectory();
    }
    case "listFiles": {
      const input = block?.input as { dir: string };
      return await listFilesInDirectory(input.dir);
    }
    case "renameFileOrDirectory": {
      const input = block?.input as { oldName: string; newName: string };
      return await renameFileOrDirectory(input.oldName, input.newName);
    }
    case "moveFileOrDirectory": {
      const input = block?.input as { source: string; destination: string };
      return await moveFileOrDirectory(input.source, input.destination);
    }
    case "createDirectory": {
      const input = block?.input as { dir: string };
      return await createDirectory(input.dir);
    }
    default: {
      break;
    }
  }
};
