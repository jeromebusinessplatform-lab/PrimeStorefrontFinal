export const TRACKING_STATES = ["AWAITING_RIDER", "DISPATCHED", "DELIVERED"] as const;
export type TrackingState = (typeof TRACKING_STATES)[number];

export interface TrackingSnapshot {
  orderId: string;
  state: TrackingState;
  trackingLink: string;
  updatedAt: string;
}

export class InvalidTrackingLink extends Error {
  constructor(code: string) {
    super(code);
    this.name = "InvalidTrackingLink";
  }
}

export function normalizeTrackingUrl(value: string): string {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new InvalidTrackingLink("tracking_link_invalid"); }
  if (url.protocol !== "https:") throw new InvalidTrackingLink("tracking_link_must_be_https");
  if (!url.hostname) throw new InvalidTrackingLink("tracking_link_invalid");
  return url.toString();
}

export function trackingAction(snapshot: Pick<TrackingSnapshot, "trackingLink">): "TRACK" | null {
  return normalizeTrackingUrl(snapshot.trackingLink) ? "TRACK" : null;
}

export function advanceTracking(snapshot: TrackingSnapshot, nextState: TrackingState): TrackingSnapshot {
  const order: TrackingState[] = ["AWAITING_RIDER", "DISPATCHED", "DELIVERED"];
  if (order.indexOf(nextState) < order.indexOf(snapshot.state)) throw new InvalidTrackingLink("tracking_state_regression");
  if (nextState === "DISPATCHED" && snapshot.state !== "AWAITING_RIDER") throw new InvalidTrackingLink("tracking_dispatch_invalid");
  if (nextState === "DELIVERED" && snapshot.state !== "DISPATCHED") throw new InvalidTrackingLink("tracking_delivery_invalid");
  return Object.freeze({ ...snapshot, state: nextState, updatedAt: new Date().toISOString() });
}
