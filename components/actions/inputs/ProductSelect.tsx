"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/lib/contexts/ProfileContext";

type ProductOption = { id: string; name: string };

export function ProductSelect({ value, onChange, disabled }: { value?: string; onChange: (id: string) => void; disabled?: boolean }) {
  const { profile } = useProfile();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);

  const accessToken = profile?.ghl_pit_token || "";
  const locationId = profile?.ghl_location_id || "";

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!accessToken || !locationId) return;
      setLoading(true);
      try {
        const url = new URL("https://services.leadconnectorhq.com/payments/products", window.location.origin);
        // payments list may require pagination; for now a simple request
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        });
        if (!res.ok) return;
        const data = await res.json();
        const list = (data?.products || data || []).map((p: any) => ({ id: p.id, name: p.name || p.id }));
        const filtered = query ? list.filter((p) => (p.name || "").toLowerCase().includes(query.toLowerCase())) : list;
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
        <Input placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} disabled={disabled} />
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


