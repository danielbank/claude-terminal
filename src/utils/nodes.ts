import {
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import type {
  ChatAnthropic,
  ChatAnthropicCallOptions,
} from "@langchain/anthropic";
import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import type { Runnable } from "@langchain/core/runnables";

import { PlanStepToText, StateAnnotation } from "./state";
import { PLAN_PROMPT, TERMINAL_PROMPT } from "./prompts";
import { PlanFormatter } from "./state";

export function shouldContinue(state: typeof StateAnnotation.State) {
  if (
    state.currentStep !== null &&
    typeof state.currentStep === "number" &&
    state.plan &&
    Array.isArray(state.plan) &&
    state.currentStep < state.plan.length
  ) {
    return "tools";
  }

  return "__end__";
}

export const CreatePlanNode = (model: ChatAnthropic) =>
  async function (state: typeof StateAnnotation.State) {
    const goal = state.goal;

    const response = await model
      .withStructuredOutput(PlanFormatter)
      .invoke([new SystemMessage(PLAN_PROMPT), new HumanMessage(goal)]);

    return { plan: response.plan, currentStep: 0 };
  };

export const ExecutePlanNode = (
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatAnthropicCallOptions
  >
) =>
  async function (state: typeof StateAnnotation.State) {
    const plan = state.plan;
    const currentStepState = state.plan[state.currentStep];

    console.log(`plan: ${JSON.stringify(plan)}`);
    console.log(`currentStep: ${state.currentStep}`);
    console.log(`currentStepState: ${JSON.stringify(currentStepState)}`);

    const response = await model.invoke([
      new SystemMessage(TERMINAL_PROMPT),
      new HumanMessage(PlanStepToText(currentStepState)),
    ]);

    const content = typeof response === "string" ? response : response.content;

    console.log(`content: ${JSON.stringify(content)}`);

    return {
      currentStep: state.currentStep + 1,
      result: content,
      toolOutput: content,
      messages: [response],
    };
  };
