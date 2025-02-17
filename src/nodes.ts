import type { AIMessage, AIMessageChunk } from "@langchain/core/messages";
import type { StateAnnotation } from "@/state.ts";
import type { ChatAnthropicCallOptions } from "@langchain/anthropic";
import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import type { Runnable } from "@langchain/core/runnables";

export function shouldContinue(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  return "__end__";
}

export const AgentNode = (
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatAnthropicCallOptions
  >
) =>
  async function (state: typeof StateAnnotation.State) {
    const messages = state.messages;
    const response = await model.invoke(messages);
    console.log(response.content);
    return {
      messages: [response],
    };
  };
