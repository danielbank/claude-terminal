import type { AIMessage, AIMessageChunk } from "@langchain/core/messages";
import type { StateAnnotation } from "@/state.ts";
import type { ChatAnthropicCallOptions } from "@langchain/anthropic";
import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import type { Runnable } from "@langchain/core/runnables";

export function shouldContinue(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  const remaining = state.remaining;
  console.log(`should continue remaining: ${remaining}`);

  if (lastMessage.tool_calls?.length) {
    console.log(lastMessage.tool_calls);
    return "tools";
  }

  return "__end__";
}

export const CallModelNode = (
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatAnthropicCallOptions
  >
) =>
  async function (state: typeof StateAnnotation.State) {
    const messages = state.messages;
    const response = await model.invoke(messages);
    if (typeof response.content === "string") {
      const newRemaining = parseInt(
        response.content.match(/Remaining: (\d+)$/)?.[1] ?? "0"
      );
      console.log(`newRemaining: ${newRemaining}`);
      return { messages: [response], remaining: newRemaining };
    } else {
      console.log(response.content);
      return { messages: [response] };
    }
  };
