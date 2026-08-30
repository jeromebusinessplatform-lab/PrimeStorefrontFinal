import React, { FormEvent, useEffect, useState } from "react";

type LoyaltyConfiguration = { pointsPerMinor: number; tierThresholds: { member: number; silver: number; gold: number; platinum: number }; pointsPerCreditMinor: number; referralMinimumOrderMinor: number; referrerPoints: number; referredPoints: number };
type ApiError = { error?: string };
async function apiError(response: Response, fallback: string): Promise<Error> { const body = await response.json().catch(() => null) as ApiError | null; return new Error(body?.error ?? fallback); }
async function getConfig(): Promise<LoyaltyConfiguration> { const response = await fetch("/admin/loyalty/configuration", { credentials: "include", cache: "no-store" }); if (!response.ok) throw await apiError(response, "loyalty_config_load_failed"); return await response.json() as LoyaltyConfiguration; }

export function LoyaltyPanel() {
  const [config, setConfig] = useState<LoyaltyConfiguration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  useEffect(() => { void getConfig().then(setConfig).catch((e) => setError(e instanceof Error ? e.message : "loyalty_config_load_failed")).finally(() => setBusy(false)); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!config) return; setBusy(true); setError(null); const form = new FormData(event.currentTarget);
    const next: LoyaltyConfiguration = {
      pointsPerMinor: Number(form.get("pointsPerMinor")),
      tierThresholds: { member: 0, silver: Number(form.get("silver")), gold: Number(form.get("gold")), platinum: Number(form.get("platinum")) },
      pointsPerCreditMinor: Number(form.get("pointsPerCreditMinor")), referralMinimumOrderMinor: Number(form.get("referralMinimumOrderMinor")), referrerPoints: Number(form.get("referrerPoints")), referredPoints: Number(form.get("referredPoints")),
    };
    try { const response = await fetch("/admin/loyalty/configuration", { method: "PATCH", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(next) }); if (!response.ok) throw await apiError(response, "loyalty_config_save_failed"); setConfig(await response.json() as LoyaltyConfiguration); } catch (e) { setError(e instanceof Error ? e.message : "loyalty_config_save_failed"); } finally { setBusy(false); }
  }
  if (busy && !config) return <section className="panel"><div className="eyebrow">LOYALTY</div><h2>Configuration</h2><p className="muted">Loading…</p></section>;
  if (!config) return <section className="panel"><p className="error" role="alert">{error ?? "Loyalty configuration unavailable."}</p></section>;
  return <section className="panel" aria-labelledby="loyalty-title"><div className="section-heading"><div><div className="eyebrow">LOYALTY</div><h2 id="loyalty-title">Configuration</h2></div><span className="muted">Server-validated rules</span></div>{error ? <p className="error" role="alert">{error}</p> : null}<form className="stack" onSubmit={save}><div className="inline-fields"><label className="field"><span>Points per minor</span><input name="pointsPerMinor" defaultValue={config.pointsPerMinor} inputMode="numeric" /></label><label className="field"><span>Points per credit minor</span><input name="pointsPerCreditMinor" defaultValue={config.pointsPerCreditMinor} inputMode="numeric" /></label></div><div className="inline-fields"><label className="field"><span>Silver threshold</span><input name="silver" defaultValue={config.tierThresholds.silver} inputMode="numeric" /></label><label className="field"><span>Gold threshold</span><input name="gold" defaultValue={config.tierThresholds.gold} inputMode="numeric" /></label></div><label className="field"><span>Platinum threshold</span><input name="platinum" defaultValue={config.tierThresholds.platinum} inputMode="numeric" /></label><label className="field"><span>Referral minimum order (minor)</span><input name="referralMinimumOrderMinor" defaultValue={config.referralMinimumOrderMinor} inputMode="numeric" /></label><div className="inline-fields"><label className="field"><span>Referrer points</span><input name="referrerPoints" defaultValue={config.referrerPoints} inputMode="numeric" /></label><label className="field"><span>Referred customer points</span><input name="referredPoints" defaultValue={config.referredPoints} inputMode="numeric" /></label></div><button className="primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save Loyalty Rules"}</button></form></section>;
}
