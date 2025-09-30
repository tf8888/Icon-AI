"use client";

import { AnyActionDefinition } from "@/lib/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContactSelect } from "./inputs/ContactSelect";
import { OpportunitySelect } from "./inputs/OpportunitySelect";
import { CalendarSelect } from "./inputs/CalendarSelect";
import { PipelineStageSelect } from "./inputs/PipelineStageSelect";
import { ConversationSelect } from "./inputs/ConversationSelect";
import { ProductSelect } from "./inputs/ProductSelect";
import { PipelineSelect } from "./inputs/PipelineSelect";
import { PriceSelect } from "./inputs/PriceSelect";
import { useProfile } from "@/lib/contexts/ProfileContext";
import { useToast } from "@/hooks/use-toast";

export function ActionModal({ action, open, onClose, onSubmit }: { action: AnyActionDefinition | null; open: boolean; onClose: () => void; onSubmit: (values: any) => void }) {
  const schema = action?.inputSchema as z.ZodTypeAny | undefined;
  const form = useForm<Record<string, any>>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {},
    mode: "onChange",
  });
  const { toast } = useToast();
  const { profile } = useProfile();

  const fields = useMemo(() => {
    if (!schema || !('shape' in schema as any)) return [] as any[];
    // @ts-ignore access zod object shape
    const shape = (schema as any)._def?.shape?.();
    if (!shape) return [] as any[];
    return Object.entries(shape).map(([name, def]: any) => ({ name: name as string, def }));
  }, [schema]);

  if (!action) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action.title}</DialogTitle>
          <DialogDescription>{action.description}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            try {
              const res = await fetch("/api/actions/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  actionId: action.id,
                  input: values,
                  accessToken: profile?.ghl_pit_token,
                  locationId: profile?.ghl_location_id,
                }),
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const msg = typeof err?.error === "string"
                  ? err.error
                  : err?.error?.message || err?.message || `HTTP ${res.status}`;
                toast({ title: "Action failed", description: msg });
              } else {
                toast({ title: "Action started", description: `${action.title} submitted` });
              }
            } catch (e) {
              // swallow for now; add toast later
              toast({ title: "Network error", description: String(e) });
            }
            onSubmit(values);
          })}
          className="space-y-3"
        >
          {fields.map(({ name, def }) => {
            const error = (form.formState.errors as any)[name]?.message as string | undefined;
            const typeName = def?._def?.typeName;
            const isString = typeName === "ZodString";
            const isNumber = typeName === "ZodNumber";
            const isEnum = typeName === "ZodEnum";

            if (name.toLowerCase().includes("contactid")) {
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">Contact</label>
                  <ContactSelect value={form.watch(name) as string | undefined} onChange={(id) => form.setValue(name, id, { shouldValidate: true })} />
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }
            if (name.toLowerCase().includes("opportunityid")) {
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">Opportunity</label>
                  <OpportunitySelect value={form.watch(name) as string | undefined} onChange={(id) => form.setValue(name, id, { shouldValidate: true })} />
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }

            if (name.toLowerCase().includes("calendarid")) {
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">Calendar</label>
                  <CalendarSelect value={form.watch(name) as string | undefined} onChange={(id) => form.setValue(name, id, { shouldValidate: true })} />
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }

            if (name.toLowerCase().includes("stageid")) {
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">Pipeline Stage</label>
                  <PipelineStageSelect value={form.watch(name) as string | undefined} onChange={(id) => form.setValue(name, id, { shouldValidate: true })} />
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }

            if (name.toLowerCase().includes("pipelineid")) {
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">Pipeline</label>
                  <PipelineSelect value={form.watch(name) as string | undefined} onChange={(id) => form.setValue(name, id, { shouldValidate: true })} />
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }

            if (name.toLowerCase().includes("conversationid")) {
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">Conversation</label>
                  <ConversationSelect value={form.watch(name) as string | undefined} onChange={(id) => form.setValue(name, id, { shouldValidate: true })} />
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }

            if (name.toLowerCase().includes("productid")) {
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">Product</label>
                  <ProductSelect value={form.watch(name) as string | undefined} onChange={(id) => form.setValue(name, id, { shouldValidate: true })} />
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }

            if (name.toLowerCase().includes("priceid")) {
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">Price</label>
                  <PriceSelect value={form.watch(name) as string | undefined} onChange={(id) => form.setValue(name, id, { shouldValidate: true })} />
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }

            if (isEnum) {
              const values: string[] = def?._def?.values || [];
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">{name}</label>
                  <select
                    className="w-full border rounded-md h-9 px-3 text-sm"
                    value={(form.watch(name) as string) || ""}
                    onChange={(e) => form.setValue(name, e.target.value, { shouldValidate: true })}
                  >
                    <option value="">Select...</option>
                    {values.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }

            if (isNumber) {
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">{name}</label>
                  <Input type="number" value={(form.watch(name) as number | undefined) ?? ""} onChange={(e) => form.setValue(name, e.target.value === "" ? undefined : Number(e.target.value), { shouldValidate: true })} />
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }

            if (isString) {
              const lower = name.toLowerCase();
              const isLong = lower.includes("message") || lower.includes("notes") || lower.includes("html");
              return (
                <div key={name} className="space-y-1">
                  <label className="text-sm font-medium">{name}</label>
                  {isLong ? (
                    <Textarea value={(form.watch(name) as string | undefined) ?? ""} onChange={(e) => form.setValue(name, e.target.value, { shouldValidate: true })} />
                  ) : (
                    <Input value={(form.watch(name) as string | undefined) ?? ""} onChange={(e) => form.setValue(name, e.target.value, { shouldValidate: true })} />
                  )}
                  {error && <div className="text-xs text-destructive">{error}</div>}
                </div>
              );
            }

            return null;
          })}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


