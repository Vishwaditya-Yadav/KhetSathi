import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — KhetSathi" },
      { name: "description", content: "Your farms, crops, products and bookings." },
      { property: "og:title", content: "Dashboard — KhetSathi" },
      { property: "og:description", content: "Your farms, crops, products and bookings." },
    ],
  }),
  component: Dashboard,
});

type Field = { key: string; label: string; type?: string };
type TableName = "farms" | "crops" | "products" | "bookings";

const CONFIG: Record<TableName, Field[]> = {
  farms: [{ key: "name", label: "Farm name" }, { key: "location", label: "Location" }, { key: "size_acres", label: "Size (acres)", type: "number" }],
  crops: [{ key: "name", label: "Crop" }, { key: "stage", label: "Stage" }, { key: "sown_on", label: "Sown on", type: "date" }, { key: "treatments", label: "Treatments" }],
  products: [{ key: "name", label: "Product" }, { key: "category", label: "Category (seed/fertilizer/pesticide)" }, { key: "quantity", label: "Quantity", type: "number" }, { key: "unit", label: "Unit" }, { key: "price", label: "Price", type: "number" }],
  bookings: [{ key: "item", label: "Service / equipment" }, { key: "booking_date", label: "Date", type: "date" }, { key: "status", label: "Status" }, { key: "notes", label: "Notes" }],
};

function Dashboard() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", user.id],
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })).data ?? false,
  });

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-display text-2xl text-primary">KhetSathi</span>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {user.email}{isAdmin && " · admin"}
          <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Tabs defaultValue="farms">
          <TabsList>
            {(Object.keys(CONFIG) as TableName[]).map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}
            <TabsTrigger value="catalog">Crop guide</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>
          {(Object.keys(CONFIG) as TableName[]).map((t) => (
            <TabsContent key={t} value={t}><Resource table={t} userId={user.id} /></TabsContent>
          ))}
          <TabsContent value="catalog"><Catalog /></TabsContent>
          <TabsContent value="profile"><Profile userId={user.id} /></TabsContent>
          {isAdmin && <TabsContent value="admin"><Admin /></TabsContent>}
        </Tabs>
      </main>
    </div>
  );
}

function Resource({ table, userId }: { table: TableName; userId: string }) {
  const qc = useQueryClient();
  const fields = CONFIG[table];
  const [form, setForm] = useState<Record<string, string>>({});
  const { data = [] } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });
  const add = useMutation({
    mutationFn: async () => {
      const row: Record<string, unknown> = { user_id: userId };
      for (const f of fields) if (form[f.key]) row[f.key] = f.type === "number" ? Number(form[f.key]) : form[f.key];
      const { error } = await supabase.from(table).insert(row as never);
      if (error) throw error;
    },
    onSuccess: () => { setForm({}); qc.invalidateQueries({ queryKey: [table] }); toast.success("Saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from(table).delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });

  return (
    <section className="space-y-6 pt-4">
      <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-3">
        {fields.map((f) => (
          <Input key={f.key} type={f.type ?? "text"} placeholder={f.label} required={f === fields[0]}
            value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
        ))}
        <Button disabled={add.isPending}>Add</Button>
      </form>
      <ul className="divide-y rounded-xl border bg-card">
        {data.length === 0 && <li className="p-4 text-sm text-muted-foreground">Nothing yet.</li>}
        {data.map((r) => (
          <li key={String(r["id"])} className="flex items-center justify-between gap-4 p-4">
            <div className="text-sm">
              <span className="font-medium text-foreground">{String(r[fields[0]!.key])}</span>
              <span className="text-muted-foreground"> · {fields.slice(1).map((f) => r[f.key]).filter(Boolean).join(" · ")}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => del.mutate(String(r["id"]))}>Delete</Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Catalog() {
  const { data = [] } = useQuery({ queryKey: ["catalog"], queryFn: async () => (await supabase.from("crop_catalog").select("*").order("name")).data ?? [] });
  return (
    <div className="grid gap-3 pt-4 md:grid-cols-2">
      {data.map((c) => (
        <div key={c.id} className="rounded-xl border bg-card p-4">
          <p className="font-display text-xl text-foreground">{c.name}</p>
          <p className="text-sm text-muted-foreground">{c.season} · {c.duration_days} days · Pests: {c.common_pests}</p>
        </div>
      ))}
    </div>
  );
}

function Profile({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["profile", userId], queryFn: async () => (await supabase.from("profiles").select("*").eq("id", userId).single()).data });
  const [f, setF] = useState<{ full_name?: string; phone?: string; location?: string }>({});
  const save = async () => {
    const { error } = await supabase.from("profiles").update(f).eq("id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["profile", userId] });
  };
  if (!data) return null;
  return (
    <div className="max-w-md space-y-3 pt-4">
      <Input placeholder="Full name" defaultValue={data.full_name ?? ""} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
      <Input placeholder="Phone" defaultValue={data.phone ?? ""} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <Input placeholder="Location" defaultValue={data.location ?? ""} onChange={(e) => setF({ ...f, location: e.target.value })} />
      <p className="text-sm text-muted-foreground">{data.verified ? "Verified farmer" : "Not yet verified"}</p>
      <Button onClick={save}>Save</Button>
    </div>
  );
}

function Admin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin"],
    queryFn: async () => {
      const [p, f, c, b] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at"),
        supabase.from("farms").select("id", { count: "exact", head: true }),
        supabase.from("crops").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
      ]);
      return { users: p.data ?? [], farms: f.count ?? 0, crops: c.count ?? 0, bookings: b.count ?? 0 };
    },
  });
  const toggle = async (id: string, v: boolean) => {
    await supabase.from("profiles").update({ verified: v }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin"] });
  };
  if (!data) return null;
  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Users", data.users.length], ["Farms", data.farms], ["Crops", data.crops], ["Bookings", data.bookings]].map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">{k}</p><p className="font-display text-3xl text-foreground">{v}</p></div>
        ))}
      </div>
      <ul className="divide-y rounded-xl border bg-card">
        {data.users.map((u) => (
          <li key={u.id} className="flex items-center justify-between p-4 text-sm">
            <span className="text-foreground">{u.full_name}</span>
            <Button size="sm" variant={u.verified ? "outline" : "default"} onClick={() => toggle(u.id, !u.verified)}>
              {u.verified ? "Unverify" : "Verify"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
