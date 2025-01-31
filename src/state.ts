import type { BaseMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";

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

export type Plan = PlanStep[];

export const StateAnnotation = Annotation.Root({
  plan: Annotation<Plan>(),
  currentStep: Annotation<PlanStep>(),
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
});
