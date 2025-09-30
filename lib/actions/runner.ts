import { ActionContext, ActionResult } from "./types";
import { findActionById } from "./registry";

export async function runAction(
  actionId: string,
  input: unknown,
  ctx: ActionContext
): Promise<ActionResult> {
  const action = findActionById(actionId);
  if (!action) {
    return { status: "failed", error: { message: `Unknown action: ${actionId}` } };
  }
  let parsedInput: any;
  try {
    parsedInput = action.inputSchema.parse(input);
  } catch (err) {
    return { status: "failed", error: { message: "Invalid input", code: "INVALID_INPUT" } };
  }
  try {
    return await action.execute(ctx, parsedInput);
  } catch (err: any) {
    return { status: "failed", error: { message: err?.message ?? "Execution failed" } };
  }
}


