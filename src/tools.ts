import type {
  Tool,
  ToolUseBlock,
} from "@anthropic-ai/sdk/resources/messages.mjs";
import { getCurrentDirectory, listFiles, gitStatus } from "./functions";

export const GetCurrentDirectoryTool: Tool = {
  name: "getCurrentDirectory",
  description: "Lists the files in the current directory.",
  input_schema: {
    type: "object",
  },
};

export const GitStatusTool: Tool = {
  name: "gitStatus",
  description: "Checks the status of a git repository.",
  input_schema: {
    type: "object",
  },
};

export const ListFilesTool: Tool = {
  name: "listFiles",
  description: "Lists the files in the specified directory.",
  input_schema: {
    type: "object",
    properties: {
      dir: {
        type: "string",
        default: ".",
      },
    },
    required: ["dir"],
  },
};

export const callTool = async (block: ToolUseBlock) => {
  switch (block?.name) {
    case "getCurrentDirectory": {
      return await getCurrentDirectory();
    }
    case "gitStatus": {
      return await gitStatus();
    }
    case "listFiles": {
      const input = block?.input as { dir: string };
      return await listFiles(input.dir);
    }
    default: {
      break;
    }
  }
};
