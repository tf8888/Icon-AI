import { z } from "zod";

export type ActionCategory = "Attract" | "Capture" | "Nurture" | "Convert";

export type ActionId = string;

export type ActionResultStatus = "success" | "queued" | "failed";

export interface ActionResult<O = unknown> {
  status: ActionResultStatus;
  data?: O;
  error?: { message: string; code?: string };
  runId?: string;
}

export interface ActionContext {
  userId: string;
  locationId?: string;
  ghlAccessToken?: string;
  requestId?: string;
}

export interface ActionDefinition<I, O> {
  id: ActionId;
  title: string;
  description?: string;
  category: ActionCategory;
  icon: string; // lucide icon name
  inputSchema: z.ZodType<I>;
  execute: (ctx: ActionContext, input: I) => Promise<ActionResult<O>>;
  capabilities?: {
    ghlScopes?: string[];
    needsContact?: boolean;
    supportsBatch?: boolean;
    idempotentKeyFrom?: (input: I) => string | undefined;
  };
  visibility?: (ctx: ActionContext) => Promise<boolean> | boolean;
}

export type AnyActionDefinition = ActionDefinition<any, any>;

export type ActionListItem = {
  id: ActionId;
  title: string;
  description?: string;
  category: ActionCategory;
  icon: string;
};


