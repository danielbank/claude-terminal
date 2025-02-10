import type { BaseMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";

export const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
  remaining: Annotation<number>({
    reducer: (_, right) => right,
    default: () => 0,
  }),
});
