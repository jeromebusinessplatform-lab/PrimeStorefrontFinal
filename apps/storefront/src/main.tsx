import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Product = { id: string; sku: string; name: string; subname: string | null; priceMinor: number; stocksAvailable: number; lowStockThreshold: number; status: string; badges: string[]; description: string | null };
type CustomerSession = { ok: boolean; customerId?: string };
type DeliveryQuote = { quoteId: string; courierId: string; courierName?: string; distanceKm: number; deliveryFeeMinor: number; expiresAt: string };
type CheckoutState = { checkoutSessionId: string; items: Array<{ productId: string; quantity: number }>; receiverName: string; receiverContact: string; deliveryAddress: string; latitude: string; longitude: string; courierId: string; deliveryFeeMinor: number; deliveryQuoteId: string; deliveryPaymentMethod: "PAY_NOW" | "PAY_UPON_DELIVERY"; couponCode: string; referralCode: string };
type ApiError = { error?: string };

async function apiError(response: Response, fallback: string): Promise<Error> { const body = await response.json().catch(() => null) as ApiError | null; return new Error(body?.error ?? fallback); }
async function getSession(): Promise<CustomerSession> { const response = await fetch("/customer/auth/session", { credentials: "include", cache: "no-store" }); return response.ok ? await response.json() as CustomerSession : { ok: false }; }
async function listProducts(): Promise<Product[]> { const response = await fetch("/customer/catalog/products", { credentials: "include", cache: "no-store" }); if (!response.ok) throw await apiError(response, "catalog_unavailable"); return (await response.json() as { products: Product[] }).products; }
async function getDeliveryQuote(state: CheckoutState): Promise<DeliveryQuote> {
  const response = await fetch("/customer/checkout/delivery-quote", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ checkoutSessionId: state.checkoutSessionId, courierId: state.courierId, latitude: Number(state.latitude), longitude: Number(state.longitude) }) });
  if (!response.ok) throw await apiError(response, "delivery_quote_failed");
  return await response.json() as DeliveryQuote;
}
async function submitCheckout(state: CheckoutState): Promise<{ orderId: string; orderNumber: string }> {
  const response = await fetch("/customer/checkout/submit", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(state) });
  if (!response.ok) throw await apiError(response, "checkout_submission_failed");
  return await response.json() as { orderId: string; orderNumber: string };
}

function TelegramGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("Checking Telegram session…");
  useEffect(() => {
    void getSession().then(async (session) => {
      if (session.ok) { onAuthenticated(); return; }
      const initData = (window as Window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData ?? "";
      if (!initData) { setMessage("Open PRIME from Telegram to continue."); return; }
      const response = await fetch("/customer/auth/exchange", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData }) });
      if (!response.ok) { setMessage("Telegram authentication failed. Reopen PRIME from Telegram."); return; }
      onAuthenticated();
    }).catch(() => setMessage("Unable to verify Telegram access.")).finally(() => setBusy(false));
  }, [onAuthenticated]);
  return <main className="shell auth-shell"><section className="panel auth-panel"><div className="eyebrow">PRIME™ SHOPFRONT</div><h1>Telegram Only</h1><p className="muted">{busy ? "Checking Telegram session…" : message}</p></section></main>;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const unavailable = product.status !== "ACTIVE" || product.stocksAvailable <= 0;
  return <article className="panel product-card">
    <div className="product-copy"><div className="eyebrow">{product.badges.join(" • ") || "PRIME"}</div><h3>{product.name}</h3>{product.subname ? <p className="muted">{product.subname}</p> : null}<p className="price">₱{(product.priceMinor / 100).toFixed(2)}</p>{product.description ? <details><summary>Info</summary><p className="muted">{product.description}</p></details> : null}</div>
    <button type="button" className="primary" onClick={() => onAdd(product)} disabled={unavailable}>{unavailable ? "Unavailable" : "Add to Cart"}</button>
  </article>;
}

function Checkout({ items, onComplete }: { items: Array<{ product: Product; quantity: number }>; onComplete: () => void }) {
  const [state, setState] = useState<CheckoutState>({ checkoutSessionId: crypto.randomUUID(), items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })), receiverName: "", receiverContact: "", deliveryAddress: "", latitude: "14.5995", longitude: "120.9842", courierId: "", deliveryFeeMinor: 0, deliveryQuoteId: "", deliveryPaymentMethod: "PAY_NOW", couponCode: "", referralCode: "" });
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.product.priceMinor * item.quantity, 0), [items]);
  async function quoteDelivery() {
    setError(null);
    if (!state.courierId) { setError("Select a courier."); return; }
    try { const next = await getDeliveryQuote(state); setQuote(next); setState((current) => ({ ...current, deliveryFeeMinor: next.deliveryFeeMinor, deliveryQuoteId: next.quoteId })); } catch (e) { setError(e instanceof Error ? e.message : "delivery_quote_failed"); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(null);
    try { const result = await submitCheckout(state); window.alert(`Order ${result.orderNumber} submitted.`); onComplete(); } catch (e) { setError(e instanceof Error ? e.message : "checkout_submission_failed"); } finally { setSubmitting(false); }
  }
  return <section className="stack">
    <div className="panel"><div className="eyebrow">CHECKOUT</div><h2>Full Order Details</h2><div className="stack">{items.map((item) => <div className="checkout-line" key={item.product.id}><span>{item.product.name} × {item.quantity}</span><strong>₱{((item.product.priceMinor * item.quantity) / 100).toFixed(2)}</strong></div>)}<div className="checkout-line total"><span>Subtotal</span><strong>₱{(subtotal / 100).toFixed(2)}</strong></div></div></div>
    <form className="panel stack" onSubmit={submit}>
      <h3>Receiver</h3><label className="field"><span>Name</span><input required value={state.receiverName} onChange={(e) => setState({ ...state, receiverName: e.target.value })} /></label><label className="field"><span>Contact Number</span><input required inputMode="tel" value={state.receiverContact} onChange={(e) => setState({ ...state, receiverContact: e.target.value })} /></label>
      <h3>Address</h3><label className="field"><span>Delivery Address</span><textarea required rows={3} value={state.deliveryAddress} onChange={(e) => setState({ ...state, deliveryAddress: e.target.value })} placeholder="Geoapify address search will populate this field" /></label><div className="inline-fields"><label className="field"><span>Latitude</span><input inputMode="decimal" value={state.latitude} onChange={(e) => setState({ ...state, latitude: e.target.value })} /></label><label className="field"><span>Longitude</span><input inputMode="decimal" value={state.longitude} onChange={(e) => setState({ ...state, longitude: e.target.value })} /></label></div>
      <div className="map-placeholder" role="img" aria-label="Delivery map preview">Map preview · drag/drop pin and current-location controls will attach here.</div>
      <h3>Courier</h3><label className="field"><span>Courier ID</span><input required value={state.courierId} onChange={(e) => setState({ ...state, courierId: e.target.value })} placeholder="Select from configured courier list" /></label><button type="button" onClick={() => void quoteDelivery()}>Get Delivery Quote</button>{quote ? <p className="muted">{quote.courierName ?? quote.courierId} · {quote.distanceKm.toFixed(2)} km · ₱{(quote.deliveryFeeMinor / 100).toFixed(2)}</p> : null}
      <div className="payment-choice"><label><input type="radio" checked={state.deliveryPaymentMethod === "PAY_NOW"} onChange={() => setState({ ...state, deliveryPaymentMethod: "PAY_NOW" })} /> Pay Now</label><label><input type="radio" checked={state.deliveryPaymentMethod === "PAY_UPON_DELIVERY"} onChange={() => setState({ ...state, deliveryPaymentMethod: "PAY_UPON_DELIVERY" })} /> Pay Upon Delivery</label></div>
      <div className="dual-blocks"><label className="field"><span>Coupon Code</span><input value={state.couponCode} onChange={(e) => setState({ ...state, couponCode: e.target.value })} /></label><label className="field"><span>Referral Code</span><input value={state.referralCode} onChange={(e) => setState({ ...state, referralCode: e.target.value })} /></label></div>
      {error ? <p className="error" role="alert">{error}</p> : null}<button className="primary" type="submit" disabled={submitting || !state.deliveryQuoteId}>{submitting ? "Submitting…" : "Submit Order"}</button>
    </form>
  </section>;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!authenticated) return; void listProducts().then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false)); }, [authenticated]);
  const cartItems = products.filter((p) => cart[p.id] > 0).map((product) => ({ product, quantity: cart[product.id] }));
  if (!authenticated) return <TelegramGate onAuthenticated={() => setAuthenticated(true)} />;
  return <main className="shell"><header className="topbar"><div><div className="eyebrow">PRIME™ SHOPFRONT</div><h1>Shop</h1></div><span className="status">Telegram Verified</span></header><section className="stack"><div className="section-heading"><div><div className="eyebrow">CATALOG</div><h2>Products</h2></div><span className="muted">Cart {cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span></div>{loading ? <p className="muted">Loading products…</p> : products.length ? products.map((product) => <ProductCard key={product.id} product={product} onAdd={(next) => setCart((current) => ({ ...current, [next.id]: (current[next.id] ?? 0) + 1 }))} />) : <p className="muted">No products available.</p>}{cartItems.length ? <Checkout items={cartItems} onComplete={() => setCart({})} /> : null}</section></main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
