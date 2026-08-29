import { calculateConfiguredDeliveryFee } from "./delivery-fee";
import { getActiveCourier, getDefaultWarehouse } from "./delivery-config-store";
import { calculateRoadRoute } from "./geoapify-routing";

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
  };
}

export async function createDeliveryQuote(
  db: D1Like,
  input: { courierId: string; latitude: number; longitude: number },
  geoapifyApiKey: string,
): Promise<{
  warehouse: { id: string; name: string; latitude: number; longitude: number };
  courier: { id: string; name: string; type: string };
  route: { distanceMeters: number; durationSeconds: number };
  fee: ReturnType<typeof calculateConfiguredDeliveryFee>;
}> {
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) throw new Error("invalid_destination_latitude");
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) throw new Error("invalid_destination_longitude");
  const warehouse = await getDefaultWarehouse(db);
  const courier = await getActiveCourier(db, input.courierId);
  const route = await calculateRoadRoute(geoapifyApiKey, { lat: warehouse.latitude, lon: warehouse.longitude }, { lat: input.latitude, lon: input.longitude });
  const fee = calculateConfiguredDeliveryFee(route.distanceMeters / 1000, route.durationSeconds / 60, courier.type, {
    baseFeeMinor: courier.baseFeeMinor,
    perKmRateMinor: courier.perKmRateMinor,
    platformFeeMinor: courier.platformFeeMinor,
    surchargeMinor: courier.surchargeMinor,
  });
  return {
    warehouse: { id: warehouse.id, name: warehouse.name, latitude: warehouse.latitude, longitude: warehouse.longitude },
    courier: { id: courier.id, name: courier.name, type: courier.type },
    route,
    fee,
  };
}

export interface CheckoutDeliveryQuoteInput {
  checkoutSessionId: string;
  customerId: string;
  courierId: string;
  latitude: number;
  longitude: number;
  now?: Date;
}

export async function applyCheckoutDeliveryQuote(
  db: D1Like,
  input: CheckoutDeliveryQuoteInput,
  geoapifyApiKey: string,
): Promise<{
  checkoutSessionId: string;
  quoteVersion: number;
  expiresAt: string;
  warehouse: { id: string; name: string; latitude: number; longitude: number };
  courier: { id: string; name: string; type: string };
  route: { distanceMeters: number; durationSeconds: number };
  fee: ReturnType<typeof calculateConfiguredDeliveryFee>;
}> {
  if (!input.checkoutSessionId.trim()) throw new Error("checkout_session_required");
  if (!input.customerId.trim()) throw new Error("customer_required");
  const checkout = await db.prepare(
    "SELECT id, customer_id, delivery_quote_version FROM checkout_sessions WHERE id = ? AND status != 'expired' LIMIT 1",
  ).bind(input.checkoutSessionId).first<{ id: string; customer_id: string; delivery_quote_version: number | null }>();
  if (!checkout) throw new Error("checkout_not_found");
  if (checkout.customer_id !== input.customerId) throw new Error("checkout_forbidden");

  const quote = await createDeliveryQuote(db, {
    courierId: input.courierId,
    latitude: input.latitude,
    longitude: input.longitude,
  }, geoapifyApiKey);
  const now = input.now ?? new Date();
  const quoteVersion = (checkout.delivery_quote_version ?? 0) + 1;
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  await db.prepare(
    "UPDATE checkout_sessions SET delivery_warehouse_id = ?, delivery_courier_id = ?, delivery_distance_meters = ?, delivery_duration_seconds = ?, delivery_fee_amount = ?, delivery_fee_currency = 'PHP', delivery_quote_version = ?, delivery_quote_expires_at = ?, updated_at = ? WHERE id = ? AND customer_id = ? AND status != 'expired'",
  ).bind(
    quote.warehouse.id,
    quote.courier.id,
    quote.route.distanceMeters,
    quote.route.durationSeconds,
    quote.fee.feeMinor,
    quoteVersion,
    expiresAt,
    now.toISOString(),
    checkout.id,
    input.customerId,
  ).run();

  return { ...quote, checkoutSessionId: checkout.id, quoteVersion, expiresAt };
}
