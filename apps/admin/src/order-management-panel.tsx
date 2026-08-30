import { useEffect, useState } from "react";

type OrderState = "REVIEW" | "PAYMENT_CLEARED" | "PACKING" | "READY" | "AWAITING_RIDER" | "DISPATCHED" | "DELIVERED" | "PAYMENT_FAILED" | "HOLD_ORDER" | "AWAITING_RECEIPT_RESUBMISSION";
type Order = { id: string; orderNumber: string; workflowState: OrderState; totalMinor: number; currency: string; trackingLink: string | null; actions?: string[] };
type ApiError = { error?: string };
async function requestJson(url: string, init?: RequestInit) { const response = await fetch(url, { credentials: "include", cache: "no-store", ...init }); if (!response.ok) { const body = await response.json().catch(() => null) as ApiError | null; throw new Error(body?.error ?? "order_operation_failed"); } return response.json(); }

export function OrderManagementPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dispatchId, setDispatchId] = useState<string | null>(null);
  const [tracking, setTracking] = useState("");

  async function reload() { setError(null); try { const body = await requestJson("/admin/orders/_list/payment-confirm"); setOrders(body.orders ?? []); } catch (e) { setError(e instanceof Error ? e.message : "orders_load_failed"); } }
  useEffect(() => { void reload(); }, []);

  async function runAction(order: Order, action: string, trackingLink?: string) {
    setBusyId(order.id); setError(null);
    try {
      await requestJson(`/admin/orders/${encodeURIComponent(order.id)}/payment-confirm`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, trackingLink }) });
      setDispatchId(null); setTracking(""); await reload();
    } catch (e) { setError(e instanceof Error ? e.message : "order_action_failed"); }
    finally { setBusyId(null); }
  }

  return <section className="panel" aria-labelledby="order-management-title">
    <div className="section-heading"><div><div className="eyebrow">ORDERS</div><h2 id="order-management-title">Order Management</h2></div><button type="button" onClick={() => void reload()} disabled={busyId !== null}>Refresh</button></div>
    {error ? <p className="error" role="alert">{error}</p> : null}
    {!orders.length ? <p className="muted">No orders found.</p> : orders.map((order) => <article className="delivery-item" key={order.id}>
      <strong>{order.orderNumber}</strong><span className="muted">{order.workflowState} • {(order.totalMinor / 100).toFixed(2)} {order.currency}</span>
      {order.trackingLink ? <a href={order.trackingLink} target="_blank" rel="noreferrer">Tracking link</a> : null}
      <div className="button-row">
        {(order.actions ?? []).map((action) => action === "DISPATCH" ? <span key={action} className="stack">{dispatchId === order.id ? <><input aria-label="Tracking link" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="https://courier.example/track/..." /><button type="button" onClick={() => void runAction(order, action, tracking)} disabled={busyId === order.id || !tracking.trim()}>Confirm Dispatch</button></> : <button type="button" onClick={() => { setDispatchId(order.id); setTracking(order.trackingLink ?? ""); }} disabled={busyId === order.id}>Dispatch</button>}</span> : <button key={action} type="button" onClick={() => void runAction(order, action)} disabled={busyId === order.id}>{action.replaceAll("_", " ")}</button>)}
      </div>
    </article>)}
  </section>;
}
