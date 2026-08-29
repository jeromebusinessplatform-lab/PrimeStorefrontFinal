import React, { FormEvent, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Warehouse = { id: string; name: string; address: string; latitude: number; longitude: number; isDefault: boolean; isActive: boolean };
type Courier = { id: string; name: string; type: "standard" | "express" | "priority"; baseFeeMinor: number; perKmRateMinor: number; platformFeeMinor: number; surchargeMinor: number; isActive: boolean };

type ApiError = { error?: string };
function element<T extends HTMLElement>(id: string): T { return document.getElementById(id) as T; }
async function responseError(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => null) as ApiError | null;
  return new Error(body?.error ?? fallback);
}

async function login(accessCode: string): Promise<void> {
  const response = await fetch("/admin/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accessCode }), credentials: "include" });
  if (!response.ok) throw await responseError(response, "admin_auth_failed");
}
async function hasSession(): Promise<boolean> {
  const response = await fetch("/admin/auth/session", { credentials: "include", cache: "no-store" });
  return response.ok;
}
async function getDeliveryConfig(): Promise<{ warehouses: Warehouse[]; couriers: Courier[] }> {
  const [warehouses, couriers] = await Promise.all([
    fetch("/admin/delivery/warehouses", { credentials: "include", cache: "no-store" }),
    fetch("/admin/delivery/couriers", { credentials: "include", cache: "no-store" }),
  ]);
  if (!warehouses.ok) throw await responseError(warehouses, "warehouse_load_failed");
  if (!couriers.ok) throw await responseError(couriers, "courier_load_failed");
  return {
    warehouses: ((await warehouses.json()) as { warehouses: Warehouse[] }).warehouses,
    couriers: ((await couriers.json()) as { couriers: Courier[] }).couriers,
  };
}
async function createWarehouse(input: Record<string, unknown>): Promise<void> {
  const response = await fetch("/admin/delivery/warehouses", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
  if (!response.ok) throw await responseError(response, "warehouse_create_failed");
}
async function createCourier(input: Record<string, unknown>): Promise<void> {
  const response = await fetch("/admin/delivery/couriers", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
  if (!response.ok) throw await responseError(response, "courier_create_failed");
}
async function setDefaultWarehouse(id: string): Promise<void> {
  const response = await fetch(`/admin/delivery/warehouses/${encodeURIComponent(id)}/default`, { method: "POST", credentials: "include" });
  if (!response.ok) throw await responseError(response, "warehouse_default_failed");
}
async function updateWarehouse(id: string, input: Record<string, unknown>): Promise<void> {
  const response = await fetch(`/admin/delivery/warehouses/${encodeURIComponent(id)}`, { method: "PATCH", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
  if (!response.ok) throw await responseError(response, "warehouse_update_failed");
}
async function updateCourier(id: string, input: Record<string, unknown>): Promise<void> {
  const response = await fetch(`/admin/delivery/couriers/${encodeURIComponent(id)}`, { method: "PATCH", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
  if (!response.ok) throw await responseError(response, "courier_update_failed");
}

function DeliveryManagement() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<string | null>(null);
  const [editingCourier, setEditingCourier] = useState<string | null>(null);

  async function reload() {
    setError(null);
    try { const data = await getDeliveryConfig(); setWarehouses(data.warehouses); setCouriers(data.couriers); }
    catch (e) { setError(e instanceof Error ? e.message : "delivery_config_load_failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void reload(); }, []);

  async function action(work: () => Promise<void>) {
    setBusy(true); setError(null);
    try { await work(); await reload(); } catch (e) { setError(e instanceof Error ? e.message : "delivery_operation_failed"); } finally { setBusy(false); }
  }

  return <section className="panel delivery-panel" aria-labelledby="delivery-title">
    <div className="section-heading"><div><div className="eyebrow">DELIVERY</div><h2 id="delivery-title">Warehouse & Courier</h2></div><button type="button" onClick={() => void reload()} disabled={loading || busy}>Refresh</button></div>
    {error ? <p className="error" role="alert">{error}</p> : null}
    {loading ? <p className="muted">Loading delivery configuration…</p> : <>
      <div className="delivery-columns">
        <div>
          <h3>Warehouses</h3>
          <p className="muted">Exactly one active default is used as the routing origin.</p>
          {warehouses.map((warehouse) => editingWarehouse === warehouse.id ? <div className="delivery-item" key={warehouse.id}>
            <input aria-label="Warehouse name" defaultValue={warehouse.name} id={`wh-name-${warehouse.id}`} />
            <input aria-label="Warehouse address" defaultValue={warehouse.address} id={`wh-address-${warehouse.id}`} />
            <div className="inline-fields"><input aria-label="Latitude" defaultValue={warehouse.latitude} id={`wh-lat-${warehouse.id}`} inputMode="decimal" /><input aria-label="Longitude" defaultValue={warehouse.longitude} id={`wh-lon-${warehouse.id}`} inputMode="decimal" /></div>
            <div className="button-row"><button type="button" onClick={() => void action(() => updateWarehouse(warehouse.id, { name: element<HTMLInputElement>(`wh-name-${warehouse.id}`).value, address: element<HTMLInputElement>(`wh-address-${warehouse.id}`).value, latitude: Number(element<HTMLInputElement>(`wh-lat-${warehouse.id}`).value), longitude: Number(element<HTMLInputElement>(`wh-lon-${warehouse.id}`).value) }))} disabled={busy}>Save</button><button type="button" onClick={() => setEditingWarehouse(null)} disabled={busy}>Cancel</button></div>
          </div> : <div className="delivery-item" key={warehouse.id}>
            <strong>{warehouse.name}</strong><span className="muted">{warehouse.address}</span><span className="muted">{warehouse.latitude.toFixed(5)}, {warehouse.longitude.toFixed(5)} {warehouse.isDefault ? "• DEFAULT" : ""}</span>
            <div className="button-row"><button type="button" onClick={() => setEditingWarehouse(warehouse.id)} disabled={busy}>Edit</button>{!warehouse.isDefault && warehouse.isActive ? <button type="button" onClick={() => void action(() => setDefaultWarehouse(warehouse.id))} disabled={busy}>Set Default</button> : null}</div>
          </div>)}
          <div className="delivery-item create-item"><strong>Add warehouse</strong><input id="new-wh-name" aria-label="New warehouse name" placeholder="Name" /><input id="new-wh-address" aria-label="New warehouse address" placeholder="Address" /><div className="inline-fields"><input id="new-wh-lat" aria-label="New latitude" placeholder="Latitude" inputMode="decimal" /><input id="new-wh-lon" aria-label="New longitude" placeholder="Longitude" inputMode="decimal" /></div><button type="button" onClick={() => void action(() => createWarehouse({ name: element<HTMLInputElement>("new-wh-name").value, address: element<HTMLInputElement>("new-wh-address").value, latitude: Number(element<HTMLInputElement>("new-wh-lat").value), longitude: Number(element<HTMLInputElement>("new-wh-lon").value) }))} disabled={busy}>Add Warehouse</button></div>
        </div>
        <div>
          <h3>Couriers</h3>
          <p className="muted">Pricing is stored in PHP minor units (₱100 = 10000).</p>
          {couriers.map((courier) => editingCourier === courier.id ? <div className="delivery-item" key={courier.id}>
            <input aria-label="Courier name" defaultValue={courier.name} id={`co-name-${courier.id}`} />
            <select aria-label="Courier type" defaultValue={courier.type} id={`co-type-${courier.id}`}><option value="standard">Standard</option><option value="express">Express</option><option value="priority">Priority</option></select>
            <div className="inline-fields"><input aria-label="Base fee minor" defaultValue={courier.baseFeeMinor} id={`co-base-${courier.id}`} inputMode="numeric" /><input aria-label="Per kilometer rate minor" defaultValue={courier.perKmRateMinor} id={`co-km-${courier.id}`} inputMode="numeric" /></div>
            <div className="inline-fields"><input aria-label="Platform fee minor" defaultValue={courier.platformFeeMinor} id={`co-platform-${courier.id}`} inputMode="numeric" /><input aria-label="Surcharge minor" defaultValue={courier.surchargeMinor} id={`co-surcharge-${courier.id}`} inputMode="numeric" /></div>
            <div className="button-row"><button type="button" onClick={() => void action(() => updateCourier(courier.id, { name: element<HTMLInputElement>(`co-name-${courier.id}`).value, type: element<HTMLSelectElement>(`co-type-${courier.id}`).value, baseFeeMinor: Number(element<HTMLInputElement>(`co-base-${courier.id}`).value), perKmRateMinor: Number(element<HTMLInputElement>(`co-km-${courier.id}`).value), platformFeeMinor: Number(element<HTMLInputElement>(`co-platform-${courier.id}`).value), surchargeMinor: Number(element<HTMLInputElement>(`co-surcharge-${courier.id}`).value) }))} disabled={busy}>Save</button><button type="button" onClick={() => setEditingCourier(null)} disabled={busy}>Cancel</button></div>
          </div> : <div className="delivery-item" key={courier.id}><strong>{courier.name}</strong><span className="muted">{courier.type.toUpperCase()}</span><span className="muted">Base ₱{(courier.baseFeeMinor / 100).toFixed(2)} • ₱{(courier.perKmRateMinor / 100).toFixed(2)}/km</span><span className="muted">Platform ₱{(courier.platformFeeMinor / 100).toFixed(2)} • Surcharge ₱{(courier.surchargeMinor / 100).toFixed(2)}</span><div className="button-row"><button type="button" onClick={() => setEditingCourier(courier.id)} disabled={busy}>Edit</button></div></div>)}
          <div className="delivery-item create-item"><strong>Add courier</strong><input id="new-co-name" aria-label="New courier name" placeholder="Name" /><select id="new-co-type" aria-label="New courier type" defaultValue="standard"><option value="standard">Standard</option><option value="express">Express</option><option value="priority">Priority</option></select><div className="inline-fields"><input id="new-co-base" aria-label="Base fee" placeholder="Base fee minor" inputMode="numeric" /><input id="new-co-km" aria-label="Per kilometer rate" placeholder="Per km minor" inputMode="numeric" /></div><div className="inline-fields"><input id="new-co-platform" aria-label="Platform fee" placeholder="Platform fee minor" inputMode="numeric" defaultValue="0" /><input id="new-co-surcharge" aria-label="Surcharge" placeholder="Surcharge minor" inputMode="numeric" defaultValue="0" /></div><button type="button" onClick={() => void action(() => createCourier({ name: element<HTMLInputElement>("new-co-name").value, type: element<HTMLSelectElement>("new-co-type").value, baseFeeMinor: Number(element<HTMLInputElement>("new-co-base").value), perKmRateMinor: Number(element<HTMLInputElement>("new-co-km").value), platformFeeMinor: Number(element<HTMLInputElement>("new-co-platform").value), surchargeMinor: Number(element<HTMLInputElement>("new-co-surcharge").value) }))} disabled={busy}>Add Courier</button></div>
        </div>
      </div>
    </>}
  </section>;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void hasSession().then(setAuthenticated).catch(() => setAuthenticated(false)).finally(() => setBusy(false)); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    try { await login(accessCode); setAccessCode(""); setAuthenticated(true); } catch (e) { setError(e instanceof Error ? e.message : "Access denied. Check the Admin Access Code."); } finally { setBusy(false); }
  }
  if (busy && !authenticated) return <main className="shell"><section className="panel">Checking session…</section></main>;
  if (!authenticated) return <main className="shell auth-shell"><section className="panel auth-panel" aria-labelledby="admin-title"><div className="eyebrow">PRIME ADMIN</div><h1 id="admin-title">Admin Access</h1><p className="muted">Enter the Admin Access Code to continue.</p><form className="stack" onSubmit={submit}><label className="field"><span>Admin Access Code</span><input autoComplete="one-time-code" inputMode="text" type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} required /></label><button className="primary" type="submit" disabled={busy}>{busy ? "Verifying…" : "Enter Admin"}</button></form>{error ? <p className="error" role="alert">{error}</p> : null}</section></main>;
  return <main className="shell"><header className="topbar"><div><div className="eyebrow">PRIME ADMIN</div><h1>Control Center</h1></div><span className="status">Authenticated</span></header><section className="stack cards" aria-label="Admin modules"><article className="panel compact-card"><strong>Orders</strong><span className="muted">Review and process customer orders.</span></article><article className="panel compact-card"><strong>Catalog</strong><span className="muted">Products, categories, and media.</span></article><article className="panel compact-card"><strong>Inventory</strong><span className="muted">Stock levels and movement history.</span></article><article className="panel compact-card"><strong>Payments</strong><span className="muted">Payment proofs and review decisions.</span></article><article className="panel compact-card"><strong>POS</strong><span className="muted">Walk-in order operations.</span></article></section><DeliveryManagement /></main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
