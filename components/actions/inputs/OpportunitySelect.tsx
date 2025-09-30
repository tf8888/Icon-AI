"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/lib/contexts/ProfileContext";

type OppOption = { id: string; name: string; pipeline?: string; stage?: string };

export function OpportunitySelect({ value, onChange, disabled }: { value?: string; onChange: (id: string) => void; disabled?: boolean }) {
  const { profile } = useProfile();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<OppOption[]>([]);
  const [loading, setLoading] = useState(false);

  const accessToken = profile?.ghl_pit_token || "";
  const locationId = profile?.ghl_location_id || "";

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!accessToken || !locationId) return;
      setLoading(true);
      try {
        const url = new URL("/api/ghl/opportunities", window.location.origin);
        url.searchParams.set("access_token", accessToken);
        url.searchParams.set("location_id", locationId);
        if (query) url.searchParams.set("query", query);
        url.searchParams.set("limit", "10");
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const data = await res.json();
        const list = (data?.opportunities || []).map((o: any) => ({ id: o.id, name: o.name || o.id, pipeline: o.pipeline?.name, stage: o.pipelineStageId }));
        if (!cancelled) setOptions(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [query, accessToken, locationId]);

  const selected = useMemo(() => options.find((o) => o.id === value), [options, value]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Search opportunities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
        />
        {selected && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>Clear</Button>
        )}
      </div>
      <div className="max-h-56 overflow-auto border rounded-md">
        {loading && <div className="p-2 text-sm text-muted-foreground">Loading...</div>}
        {!loading && options.length === 0 && <div className="p-2 text-sm text-muted-foreground">No results</div>}
        {!loading && options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`w-full text-left px-3 py-2 hover:bg-muted ${opt.id === value ? "bg-muted" : ""}`}
            onClick={() => onChange(opt.id)}
            disabled={disabled}
          >
            <div className="font-medium text-sm">{opt.name || "Untitled"}</div>
            <div className="text-xs text-muted-foreground">{opt.pipeline ? `${opt.pipeline} • ${opt.stage || "stage"}` : opt.id}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


