"use client";

import { AnyActionDefinition } from "@/lib/actions";
import { ActionCard } from "./ActionCard";

export function ActionGrid({ actions, onSelect }: { actions: AnyActionDefinition[]; onSelect: (a: AnyActionDefinition) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <ActionCard key={action.id} action={action} onSelect={onSelect} />
      ))}
    </div>
  );
}


