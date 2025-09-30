"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/lib/contexts/ProfileContext";

type CalOption = { id: string; name: string };

export function CalendarSelect({ value, onChange, disabled }: { value?: string; onChange: (id: string) => void; disabled?: boolean }) {
  const { profile } = useProfile();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<CalOption[]>([]);
  const [loading, setLoading] = useState(false);

  const accessToken = profile?.ghl_pit_token || "";
  const locationId = profile?.ghl_location_id || "";

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!accessToken || !locationId) return;
      setLoading(true);
      try {
        const url = new URL("/api/ghl/pipelines", window.location.origin);
        // Reuse endpoint style: calendars list has its own API; for now call calendars directly
        const apiUrl = new URL("https://services.leadconnectorhq.com/calendars/");
        apiUrl.searchParams.set("locationId", locationId);
        const res = await fetch(apiUrl.toString(), {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json", Version: "2021-07-28" },
        });
        if (!res.ok) return;
        const data = await res.json();
        const list = (Array.isArray(data) ? data : data?.calendars || []).map((c: any) => ({ id: c.id, name: c.name || c.title || c.id }));
        const filtered = query ? list.filter((c) => (c.name || "").toLowerCase().includes(query.toLowerCase())) : list;
        if (!cancelled) setOptions(filtered);
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
        <Input placeholder="Search calendars..." value={query} onChange={(e) => setQuery(e.target.value)} disabled={disabled} />
        {selected && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>Clear</Button>
        )}
      </div>
      <div className="max-h-56 overflow-auto border rounded-md">
        {loading && <div className="p-2 text-sm text-muted-foreground">Loading...</div>}
        {!loading && options.length === 0 && <div className="p-2 text-sm text-muted-foreground">No results</div>}
        {!loading && options.map((opt) => (
          <button key={opt.id} type="button" className={`w-full text-left px-3 py-2 hover:bg-muted ${opt.id === value ? "bg-muted" : ""}`} onClick={() => onChange(opt.id)} disabled={disabled}>
            <div className="font-medium text-sm">{opt.name || "Untitled"}</div>
            <div className="text-xs text-muted-foreground">{opt.id}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


