import React, { FormEvent, useEffect, useState } from "react";

type ProductBadge = "NEW" | "SALE" | "BEST_SELLER" | "LOW_STOCK" | "UNAVAILABLE";
type Product = { id: string; sku: string; name: string; subname: string | null; priceMinor: number; costMinor: number; marginMinor: number; barcode: string | null; taxInclusive: boolean; stocksAvailable: number; lowStockThreshold: number; status: string; badges: ProductBadge[] };
type ApiError = { error?: string };
async function apiError(response: Response, fallback: string): Promise<Error> { const body = await response.json().catch(() => null) as ApiError | null; return new Error(body?.error ?? fallback); }
async function listProducts(): Promise<Product[]> { const response = await fetch("/admin/catalog/products", { credentials: "include", cache: "no-store" }); if (!response.ok) throw await apiError(response, "catalog_load_failed"); return (await response.json() as { products: Product[] }).products; }

export function CatalogPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function reload() { setError(null); try { setProducts(await listProducts()); } catch (e) { setError(e instanceof Error ? e.message : "catalog_load_failed"); } finally { setBusy(false); } }
  useEffect(() => { void reload(); }, []);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    const form = new FormData(event.currentTarget);
    const body = {
      name: String(form.get("name") ?? ""), subname: String(form.get("subname") ?? "") || null,
      priceMinor: Number(form.get("priceMinor")), costMinor: Number(form.get("costMinor")),
      stocksAvailable: Number(form.get("stocksAvailable")), lowStockThreshold: Number(form.get("lowStockThreshold")),
      compareAtPriceMinor: String(form.get("compareAtPriceMinor") ?? "") ? Number(form.get("compareAtPriceMinor")) : null,
      taxInclusive: form.get("taxInclusive") === "on", badge: String(form.get("badge") ?? "") || null,
      description: String(form.get("description") ?? "") || null,
    };
    try { const response = await fetch("/admin/catalog/products", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); if (!response.ok) throw await apiError(response, "product_create_failed"); event.currentTarget.reset(); await reload(); } catch (e) { setError(e instanceof Error ? e.message : "product_create_failed"); setBusy(false); }
  }
  return <section className="panel" aria-labelledby="catalog-title">
    <div className="section-heading"><div><div className="eyebrow">CATALOG</div><h2 id="catalog-title">Products</h2></div><button type="button" onClick={() => void reload()} disabled={busy}>Refresh</button></div>
    {error ? <p className="error" role="alert">{error}</p> : null}
    <form className="stack" onSubmit={create}>
      <label className="field"><span>Name</span><input name="name" required /></label>
      <label className="field"><span>Subname / Variant</span><input name="subname" /></label>
      <label className="field"><span>Description</span><textarea name="description" rows={3} /></label>
      <div className="inline-fields"><label className="field"><span>Selling price (minor)</span><input name="priceMinor" inputMode="numeric" required /></label><label className="field"><span>Costing (minor)</span><input name="costMinor" inputMode="numeric" required /></label></div>
      <div className="inline-fields"><label className="field"><span>Compare-at price</span><input name="compareAtPriceMinor" inputMode="numeric" /></label><label className="field"><span>Stocks available</span><input name="stocksAvailable" inputMode="numeric" required /></label></div>
      <label className="field"><span>Low-stock threshold</span><input name="lowStockThreshold" inputMode="numeric" required /></label>
      <label className="field"><span>Badge</span><select name="badge" defaultValue=""><option value="">None</option><option>NEW</option><option>SALE</option><option>BEST_SELLER</option><option>LOW_STOCK</option><option>UNAVAILABLE</option></select></label>
      <label className="field checkbox"><input type="checkbox" name="taxInclusive" defaultChecked /><span>Tax inclusive</span></label>
      <button className="primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Add Product"}</button>
    </form>
    <div className="stack" aria-label="Product list">
      {products.map((product) => <article className="panel compact-card" key={product.id}><strong>{product.name}{product.subname ? ` — ${product.subname}` : ""}</strong><span className="muted">SKU {product.sku}{product.barcode ? ` • Barcode ${product.barcode}` : ""}</span><span className="muted">₱{(product.priceMinor / 100).toFixed(2)} • Cost ₱{(product.costMinor / 100).toFixed(2)} • Margin ₱{(product.marginMinor / 100).toFixed(2)}</span><span className="muted">Stock {product.stocksAvailable} • Low stock ≤ {product.lowStockThreshold} • {product.taxInclusive ? "Tax inclusive" : "Tax exclusive"}</span>{product.badges.length ? <span className="muted">{product.badges.join(" • ")}</span> : null}</article>)}
      {!busy && !products.length ? <p className="muted">No products yet.</p> : null}
    </div>
  </section>;
}
