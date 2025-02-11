import {
  HumanMessage,
  ToolMessage,
  RemoveMessage,
} from "@langchain/core/messages";
import type { AIMessage, AIMessageChunk } from "@langchain/core/messages";
import type { StateAnnotation } from "@/state.ts";
import type { ChatAnthropicCallOptions } from "@langchain/anthropic";
import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import type { Runnable } from "@langchain/core/runnables";
import type { DynamicStructuredTool } from "@langchain/core/tools";
import type { BaseMessage } from "@langchain/core/messages";
import type { ZodObject, ZodTypeAny } from "zod";
import { ToolNode as BaseToolNode } from "@langchain/langgraph/prebuilt";

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

export const AgentNode = (
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatAnthropicCallOptions
  >
) =>
  async function (state: typeof StateAnnotation.State) {
    const messages = state.messages;
    console.log(`messages length: ${messages.length}`);
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

export class ToolNode extends BaseToolNode {
  constructor(
    tools:
      | DynamicStructuredTool<ZodObject<Record<string, ZodTypeAny>>>[]
      | DynamicStructuredTool[]
  ) {
    super(tools);
  }

  override async invoke(
    state: { messages: BaseMessage[]; remaining: number },
    config: Record<string, unknown>
  ) {
    const result = await super.invoke(state, config);
    const toolOutput = result;
    if (
      toolOutput &&
      typeof toolOutput === "object" &&
      "remainingCount" in toolOutput
    ) {
      return {
        ...result,
        remaining: toolOutput.remainingCount,
      };
    }

    return result;
  }
}

export const SummarizationNode = (
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatAnthropicCallOptions
  >
) =>
  async function (state: typeof StateAnnotation.State) {
    /* summarize messages */
    let summarize = "";
    if (state.summary) {
      summarize = `Extend the summary by taking into account new messages above: ${state.summary}`;
    } else {
      summarize =
        "Please summarize the following messages in a concise manner:";
    }

    state.messages.push(new HumanMessage(summarize));

    /* remove tool messages */
    const messages = state.messages.filter(
      (message) => !(message instanceof ToolMessage)
    );

    /* summarize ai and human messages */

    const response = await model.invoke(messages);
    return { messages: [response] };
  };
