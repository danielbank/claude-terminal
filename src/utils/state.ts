import type { BaseMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { z } from "zod";

export const PlanFormatter = z.object({
  plan: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("create_directory"),
        directory: z.string(),
      }),
      z.object({
        type: z.literal("rename_file"),
        oldPath: z.string(),
        newPath: z.string(),
      }),
      z.object({
        type: z.literal("move_file"),
        oldPath: z.string(),
        newPath: z.string(),
      }),
    ])
  ),
  currentStep: z.number(),
});

export type PlanStep =
  | {
      type: "create_directory";
      directory: string;
    }
  | {
      type: "rename_file";
      oldPath: string;
      newPath: string;
    }
  | {
      type: "move_file";
      oldPath: string;
      newPath: string;
    };

export const PlanStepToText = (step: PlanStep) => {
  switch (step.type) {
    case "create_directory":
      return `Create directory ${step.directory}`;
    case "rename_file":
      return `Rename file ${step.oldPath} to ${step.newPath}`;
    case "move_file":
      return `Move file ${step.oldPath} to ${step.newPath}`;
    default:
      return `Unknown step: please return an error message as the result.  The step was: ${JSON.stringify(
        step
      )}`;
  }
};

export type Plan = PlanStep[];

export const StateAnnotation = Annotation.Root({
  goal: Annotation<string>(),
  plan: Annotation<Plan>(),
  currentStep: Annotation<number>(),
  results: Annotation<string[]>({
    reducer: (state, result) => state.concat(result),
  }),
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
});
