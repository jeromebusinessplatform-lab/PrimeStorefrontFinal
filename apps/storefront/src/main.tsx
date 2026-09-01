import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Product = { id: string; sku: string; name: string; subname: string | null; priceMinor: number; stocksAvailable: number; lowStockThreshold: number; status: string; badges: string[]; description: string | null };
type Courier = { id: string; name: string; type: string; baseFeeMinor: number; perKmRateMinor: number; platformFeeMinor: number; surchargeMinor: number };
type CustomerSession = { ok: boolean; customerId?: string };
type DeliveryQuote = { quoteId: string; courierId: string; courierName?: string; distanceKm: number; deliveryFeeMinor: number; expiresAt: string };
type AddressSuggestion = { id: string; formatted: string; latitude: number; longitude: number };
type CustomerOrder = { id: string; orderNumber: string; workflowState: string; status: string; totalMinor: number; currency: string; createdAt: string; trackingLink: string | null };
type ApiError = { error?: string };
type CheckoutState = { checkoutSessionId: string; items: Array<{ productId: string; quantity: number }>; receiverName: string; receiverContact: string; deliveryAddress: string; latitude: string; longitude: string; courierId: string; deliveryFeeMinor: number; deliveryQuoteId: string; deliveryPaymentMethod: "PAY_NOW" | "PAY_UPON_DELIVERY"; couponCode: string; referralCode: string; receiptObjectKey: string };
type TelegramWebApp = { initData?: string; ready?: () => void };

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

async function apiError(response: Response, fallback: string): Promise<Error> { const body = await response.json().catch(() => null) as ApiError | null; return new Error(body?.error ?? fallback); }
async function getSession(): Promise<CustomerSession> { const response = await fetch("/customer/auth/session", { credentials: "include", cache: "no-store" }); return response.ok ? await response.json() as CustomerSession : { ok: false }; }
async function listProducts(): Promise<Product[]> { const response = await fetch("/customer/catalog/products", { credentials: "include", cache: "no-store" }); if (!response.ok) throw await apiError(response, "catalog_unavailable"); return (await response.json() as { products: Product[] }).products; }
async function listCouriers(): Promise<Courier[]> { const response = await fetch("/customer/delivery/couriers", { credentials: "include", cache: "no-store" }); if (!response.ok) throw await apiError(response, "couriers_unavailable"); return (await response.json() as { couriers: Courier[] }).couriers; }
async function listOrders(): Promise<CustomerOrder[]> { const response = await fetch("/customer/catalog/products?view=orders", { credentials: "include", cache: "no-store" }); if (!response.ok) throw await apiError(response, "orders_unavailable"); return (await response.json() as { orders: CustomerOrder[] }).orders; }
async function autocomplete(query: string): Promise<AddressSuggestion[]> {
  const key = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_GEOAPIFY_API_KEY ?? "";
  if (!key || query.trim().length < 3) return [];
  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.searchParams.set("text", `${query.trim()}, Metro Manila`);
  url.searchParams.set("format", "json"); url.searchParams.set("apiKey", key); url.searchParams.set("filter", "countrycode:ph"); url.searchParams.set("limit", "8");
  const response = await fetch(url); if (!response.ok) throw new Error("address_autocomplete_failed");
  const payload = await response.json() as { results?: Array<Record<string, unknown>> };
  return (payload.results ?? []).flatMap((item, index) => { const lat = Number(item.lat); const lon = Number(item.lon); if (!Number.isFinite(lat) || !Number.isFinite(lon)) return []; return [{ id: String(item.place_id ?? index), formatted: String(item.formatted ?? ""), latitude: lat, longitude: lon }]; });
}
async function getDeliveryQuote(state: CheckoutState): Promise<DeliveryQuote> { const response = await fetch("/customer/checkout/delivery-quote", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ checkoutSessionId: state.checkoutSessionId, courierId: state.courierId, latitude: Number(state.latitude), longitude: Number(state.longitude) }) }); if (!response.ok) throw await apiError(response, "delivery_quote_failed"); return await response.json() as DeliveryQuote; }
async function submitCheckout(state: CheckoutState): Promise<{ orderId: string; orderNumber: string }> { const response = await fetch("/customer/checkout/submit", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(state) }); if (!response.ok) throw await apiError(response, "checkout_submission_failed"); return await response.json() as { orderId: string; orderNumber: string }; }

async function waitForTelegramInitData(timeoutMs = 5000): Promise<string> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready?.();
      const initData = webApp.initData?.trim() ?? "";
      if (initData) return initData;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  return "";
}

function TelegramGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [busy, setBusy] = useState(true); const [message, setMessage] = useState("Checking Telegram session…");
  useEffect(() => {
    let cancelled = false;
    async function authenticate() {
      try {
        const session = await getSession();
        if (cancelled) return;
        if (session.ok) { onAuthenticated(); return; }
        const initData = await waitForTelegramInitData();
        if (cancelled) return;
        if (!initData) { setMessage("Open PRIME from the Telegram Mini App button to continue."); return; }
        const response = await fetch("/customer/auth/exchange", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData }) });
        if (!response.ok) { setMessage("Telegram authentication failed. Reopen PRIME from the Telegram Mini App."); return; }
        onAuthenticated();
      } catch {
        if (!cancelled) setMessage("Unable to verify Telegram access.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }
    void authenticate();
    return () => { cancelled = true; };
  }, [onAuthenticated]);
  return <main className="shell auth-shell"><section className="panel auth-panel"><div className="eyebrow">PRIME™ SHOPFRONT</div><h1>Telegram Only</h1><p className="muted">{busy ? "Checking Telegram session…" : message}</p></section></main>;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const unavailable = product.status !== "active" || product.stocksAvailable <= 0;
  return <article className="panel product-card"><div className="product-copy"><div className="eyebrow">{product.badges.join(" • ") || "PRIME"}</div><h3>{product.name}</h3>{product.subname ? <p className="muted">{product.subname}</p> : null}<p className="price">₱{(product.priceMinor / 100).toFixed(2)}</p>{product.description ? <details><summary>Info</summary><p className="muted">{product.description}</p></details> : null}</div><button type="button" className="primary" onClick={() => onAdd(product)} disabled={unavailable}>{unavailable ? "Unavailable" : "Add to Cart"}</button></article>;
}

function OrderHistory({ orders }: { orders: CustomerOrder[] }) {
  return <section className="stack"><div className="section-heading"><div><div className="eyebrow">ACCOUNT</div><h2>Orders</h2></div><span className="muted">{orders.length} recent</span></div>{orders.length ? orders.map((order) => <article className="panel compact-card" key={order.id}><div className="section-heading"><strong>{order.orderNumber}</strong><span className="status">{order.workflowState}</span></div><span className="muted">₱{(order.totalMinor / 100).toFixed(2)} · {new Date(order.createdAt).toLocaleString()}</span>{order.trackingLink ? <a className="track-button" href={order.trackingLink} target="_blank" rel="noreferrer">TRACK</a> : <span className="muted">Tracking appears after dispatch.</span>}</article>) : <p className="muted">No orders yet.</p>}</section>;
}

function Checkout({ items, couriers, onComplete }: { items: Array<{ product: Product; quantity: number }>; couriers: Courier[]; onComplete: (order: { orderId: string; orderNumber: string }) => void }) {
  const [state, setState] = useState<CheckoutState>({ checkoutSessionId: crypto.randomUUID(), items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })), receiverName: "", receiverContact: "", deliveryAddress: "", latitude: "14.5995", longitude: "120.9842", courierId: couriers[0]?.id ?? "", deliveryFeeMinor: 0, deliveryQuoteId: "", deliveryPaymentMethod: "PAY_NOW", couponCode: "", referralCode: "", receiptObjectKey: "" });
  const [addressQuery, setAddressQuery] = useState(""); const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]); const [addressBusy, setAddressBusy] = useState(false); const [locationMessage, setLocationMessage] = useState("Search your delivery address."); const [error, setError] = useState<string | null>(null); const [quote, setQuote] = useState<DeliveryQuote | null>(null); const [submitting, setSubmitting] = useState(false); const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.product.priceMinor * item.quantity, 0), [items]);
  useEffect(() => { if (addressQuery.trim().length < 3) { setSuggestions([]); return; } const timer = window.setTimeout(() => { setAddressBusy(true); void autocomplete(addressQuery).then(setSuggestions).catch(() => setSuggestions([])).finally(() => setAddressBusy(false)); }, 500); return () => window.clearTimeout(timer); }, [addressQuery]);
  function useCurrentLocation() { setLocationMessage("Requesting current location…"); if (!navigator.geolocation) { setLocationMessage("Location is not supported on this device."); return; } navigator.geolocation.getCurrentPosition((position) => { setState((current) => ({ ...current, latitude: String(position.coords.latitude), longitude: String(position.coords.longitude), deliveryQuoteId: "" })); setLocationMessage("Current location selected. Confirm the address text before quoting."); }, () => setLocationMessage("Location permission was denied or unavailable."), { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }); }
  function dropPin() { setLocationMessage("Drop-pin mode: adjust latitude/longitude, then request a new delivery quote."); }
  async function quoteDelivery() { setError(null); if (!state.courierId) { setError("Select a courier."); return; } if (!state.deliveryAddress.trim()) { setError("Enter the delivery address."); return; } try { const next = await getDeliveryQuote(state); setQuote(next); setState((current) => ({ ...current, deliveryFeeMinor: next.deliveryFeeMinor, deliveryQuoteId: next.quoteId })); } catch (e) { setError(e instanceof Error ? e.message : "delivery_quote_failed"); } }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitting(true); setError(null); try { const result = await submitCheckout(state); onComplete(result); } catch (e) { setError(e instanceof Error ? e.message : "checkout_submission_failed"); } finally { setSubmitting(false); } }
  function selectSuggestion(suggestion: AddressSuggestion) { setAddressQuery(suggestion.formatted); setSuggestions([]); setState((current) => ({ ...current, deliveryAddress: suggestion.formatted, latitude: String(suggestion.latitude), longitude: String(suggestion.longitude), deliveryQuoteId: "" })); setLocationMessage("Address selected. Delivery quote is now based on this location."); }
  return <section className="stack"><div className="panel"><div className="eyebrow">CHECKOUT</div><h2>Full Order Details</h2><div className="stack">{items.map((item) => <div className="checkout-line" key={item.product.id}><span>{item.product.name} × {item.quantity}</span><strong>₱{((item.product.priceMinor * item.quantity) / 100).toFixed(2)}</strong></div>)}<div className="checkout-line total"><span>Subtotal</span><strong>₱{(subtotal / 100).toFixed(2)}</strong></div></div></div>
    <form className="panel stack" onSubmit={submit}>
      <h3>Receiver</h3><label className="field"><span>Name</span><input required value={state.receiverName} onChange={(e) => setState({ ...state, receiverName: e.target.value })} /></label><label className="field"><span>Contact Number</span><input required inputMode="tel" value={state.receiverContact} onChange={(e) => setState({ ...state, receiverContact: e.target.value })} /></label>
      <h3>Address</h3><div className="autocomplete-wrap"><label className="field"><span>Search / Delivery Address</span><input required value={addressQuery} onChange={(e) => { setAddressQuery(e.target.value); setState({ ...state, deliveryAddress: e.target.value, deliveryQuoteId: "" }); }} placeholder="Search Metro Manila or nearby provinces" autoComplete="street-address" /></label>{addressBusy ? <p className="muted small-text">Searching…</p> : null}{suggestions.length ? <div className="suggestions" role="listbox">{suggestions.map((suggestion) => <button type="button" className="suggestion" key={suggestion.id} onClick={() => selectSuggestion(suggestion)}>{suggestion.formatted}</button>)}</div> : null}</div><p className="muted small-text">{locationMessage}</p>
      <div className="inline-fields"><label className="field"><span>Latitude</span><input inputMode="decimal" value={state.latitude} onChange={(e) => setState({ ...state, latitude: e.target.value, deliveryQuoteId: "" })} /></label><label className="field"><span>Longitude</span><input inputMode="decimal" value={state.longitude} onChange={(e) => setState({ ...state, longitude: e.target.value, deliveryQuoteId: "" })} /></label></div>
      <div className="location-actions"><button type="button" onClick={useCurrentLocation}>Use Current Location</button><button type="button" onClick={dropPin}>Drop Pin</button></div><div className="map-placeholder" role="img" aria-label="Delivery map preview">Map preview · {Number(state.latitude).toFixed(5)}, {Number(state.longitude).toFixed(5)} · zoom / drag supported by device map view</div>
      <h3>Courier</h3><label className="field"><span>Select Courier</span><select required value={state.courierId} onChange={(e) => setState({ ...state, courierId: e.target.value, deliveryQuoteId: "" })}><option value="">Choose courier</option>{couriers.map((courier) => <option key={courier.id} value={courier.id}>{courier.name} · {courier.type}</option>)}</select></label><button type="button" onClick={() => void quoteDelivery()}>Get Delivery Quote</button>{quote ? <p className="muted">{quote.courierName ?? quote.courierId} · {quote.distanceKm.toFixed(2)} km · ₱{(quote.deliveryFeeMinor / 100).toFixed(2)}</p> : null}
      <div className="payment-choice"><label><input type="radio" checked={state.deliveryPaymentMethod === "PAY_NOW"} onChange={() => setState({ ...state, deliveryPaymentMethod: "PAY_NOW", deliveryQuoteId: "" })} /> Pay Now</label><label><input type="radio" checked={state.deliveryPaymentMethod === "PAY_UPON_DELIVERY"} onChange={() => setState({ ...state, deliveryPaymentMethod: "PAY_UPON_DELIVERY", deliveryQuoteId: "" })} /> Pay Upon Delivery</label></div>
      <div className="dual-blocks"><label className="field"><span>Coupon Code</span><input value={state.couponCode} onChange={(e) => setState({ ...state, couponCode: e.target.value })} /></label><label className="field"><span>Referral Code</span><input value={state.referralCode} onChange={(e) => setState({ ...state, referralCode: e.target.value })} /></label></div>
      <label className="field"><span>Receipt Upload</span><input type="file" accept="image/*,.pdf" onChange={(e) => setState({ ...state, receiptObjectKey: e.target.files?.[0]?.name ?? "" })} /><span className="muted small-text">Receipt selection is captured for checkout; R2 upload and Taggun processing require the production receipt endpoint/configuration.</span></label>
      {error ? <p className="error" role="alert">{error}</p> : null}<button className="primary" type="submit" disabled={submitting || !state.deliveryQuoteId}>{submitting ? "Submitting…" : "Submit Order"}</button>
    </form></section>;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false); const [products, setProducts] = useState<Product[]>([]); const [couriers, setCouriers] = useState<Courier[]>([]); const [orders, setOrders] = useState<CustomerOrder[]>([]); const [submittedOrder, setSubmittedOrder] = useState<{ orderId: string; orderNumber: string } | null>(null); const [cart, setCart] = useState<Record<string, number>>({}); const [loading, setLoading] = useState(true);
  async function reloadOrders() { try { setOrders(await listOrders()); } catch { setOrders([]); } }
  useEffect(() => { if (!authenticated) return; void Promise.all([listProducts(), listCouriers(), listOrders()]).then(([nextProducts, nextCouriers, nextOrders]) => { setProducts(nextProducts); setCouriers(nextCouriers); setOrders(nextOrders); }).catch(() => { setProducts([]); setCouriers([]); setOrders([]); }).finally(() => setLoading(false)); }, [authenticated]);
  const cartItems = products.filter((p) => cart[p.id] > 0).map((product) => ({ product, quantity: cart[product.id] }));
  if (!authenticated) return <TelegramGate onAuthenticated={() => setAuthenticated(true)} />;
  return <main className="shell"><header className="topbar"><div><div className="eyebrow">PRIME™ SHOPFRONT</div><h1>Shop</h1></div><span className="status">Telegram Verified</span></header>{submittedOrder ? <section className="panel success-card"><div className="eyebrow">ORDER CONFIRMED</div><h2>{submittedOrder.orderNumber}</h2><p className="muted">Your order has been submitted for review.</p><button type="button" className="primary" onClick={() => { setSubmittedOrder(null); setCart({}); void reloadOrders(); }}>View Orders</button></section> : null}<section className="stack"><div className="section-heading"><div><div className="eyebrow">CATALOG</div><h2>Products</h2></div><span className="muted">Cart {cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span></div>{loading ? <p className="muted">Loading products…</p> : products.length ? products.map((product) => <ProductCard key={product.id} product={product} onAdd={(next) => setCart((current) => ({ ...current, [next.id]: (current[next.id] ?? 0) + 1 }))} />) : <p className="muted">No products available.</p>}{cartItems.length ? <Checkout items={cartItems} couriers={couriers} onComplete={(order) => { setSubmittedOrder(order); void reloadOrders(); }} /> : null}<OrderHistory orders={orders} /></section></main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
