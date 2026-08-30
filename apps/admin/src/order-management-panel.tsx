import { useEffect, useState } from "react";

type OrderState = "REVIEW" | "PAYMENT_CLEARED" | "PACKING" | "READY" | "AWAITING_RIDER" | "DISPATCHED" | "DELIVERED" | "PAYMENT_FAILED" | "HOLD_ORDER" | "AWAITING_RECEIPT_RESUBMISSION";
type Order = { id: string; orderNumber: string; workflowState: OrderState; totalMinor: number; currency: string; trackingLink: string | null };
type Action = { action: string; label: string };

async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, { credentials: "include", cache: "no-store", ...init });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? "order_operation_failed");
  }
  return response.json();
}

export function OrderManagementPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [tracking, setTracking] = useState("");
  const [actions, setActions] = useState<Record<string, Action[]>>({});

  async function reload() {
    setError(null);
    try {
      const body = await api("/admin/orders");
      setOrders(body.orders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "orders_load_failed");
    }
  }

  useEffect(() => { void reload(); }, []);

  async function loadActions(orderId: string) {
    try {
      const body = await api(`/admin/orders/${encodeURIComponent(orderId)}`);
      setActions((current) => ({ ...current, [orderId]: body.actions ?? [] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "order_actions_failed");
    }
  }

  async function runAction(order: Order, action: string, trackingLink?: string) {
    setBusyId(order.id);
    setError(null);
    try {
      await api(`/admin/orders/${encodeURIComponent(order.id)}/payment-confirm`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, trackingLink }),
      });
      setTrackingId(null);
      setTracking("");
      await reload();
      setActions((current) => { const next = { ...current }; delete next[order.id]; return next; });
    } catch (e) {
      setError(e instanceof Error ? e.message : "order_action_failed");
    } finally {
      setBusyId(null);
    }
  }

  return <section className="panel" aria-labelledby="order-management-title">
    <div className="section-heading"><div><div className="eyebrow">ORDERS</div><h2 id="order-management-title">Order Management</h2></div><button type="button" onClick={() => void reload()} disabled={busyId !== null}>Refresh</button></div>
    {error ? <p className="error" role="alert">{error}</p> : null}
    {!orders.length ? <p className="muted">No orders found.</p> : orders.map((order) => <article className="delivery-item" key={order.id}>
      <strong>{order.orderNumber}</strong>
      <span className="muted">{order.workflowState} • {(order.totalMinor / 100).toFixed(2)} {order.currency}</span>
      {order.trackingLink ? <a href={order.trackingLink} target="_blank" rel="noreferrer">Tracking link</a> : null}
      <div className="button-row">
        <button type="button" onClick={() => void loadActions(order.id)} disabled={busyId === order.id}>Show Actions</button>
      </div>
      {(actions[order.id] ?? []).map((item) => <span key={item.action}>
        {item.action === "DISPATCH" ? <>{trackingId === order.id ? <span className="stack"><input aria-label="Tracking link" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="https://courier.example/track/..." /><button type="button" onClick={() => void runAction(order, item.action, tracking)} disabled={busyId === order.id || !tracking.trim()}>Confirm Dispatch</button></span> : <button type="button" onClick={() => { setTrackingId(order.id); setTracking(order.trackingLink ?? ""); }} disabled={busyId === order.id}>{item.label}</button>}</> : <button type="button" onClick={() => void runAction(order, item.action)} disabled={busyId === order.id}>{item.label}</button>}
      </span>)}
    </article>)}
  </section>;
}
