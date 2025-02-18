import {
  HumanMessage,
  RemoveMessage,
  type AIMessage,
  type AIMessageChunk,
} from "@langchain/core/messages";
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

  return "summary";
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

export const SummaryNode = (
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatAnthropicCallOptions
  >
) =>
  async function (state: typeof StateAnnotation.State) {
    const { messages } = state;
    const summaryPrompt =
      "Create a summary of the conversation above.  Please retain user input and which directories were loaded into memory.";

    const response = await model.invoke([
      ...messages,
      new HumanMessage(summaryPrompt),
    ]);

    const removedMessages = messages
      .slice(1)
      .map((message) =>
        message.id ? new RemoveMessage({ id: message.id }) : message
      );

    return { messages: [...removedMessages, response] };
  };
