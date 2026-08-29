import { getActiveCourier, getDefaultWarehouse } from "../delivery/delivery-config-store";
import { calculateConfiguredDeliveryFee } from "../delivery/delivery-fee";
import { calculateRoadRoute } from "../delivery/geoapify-routing";

interface D1Like {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
  };
}

export interface CheckoutDeliveryQuoteInput {
  checkoutSessionId: string;
  courierId: string;
  customer: { latitude: number; longitude: number };
  now?: Date;
}

export interface CheckoutDeliveryQuote {
  checkoutSessionId: string;
  quoteVersion: number;
  expiresAt: string;
  warehouse: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  courier: {
    id: string;
    name: string;
    type: string;
  };
  route: {
    distanceMeters: number;
    durationSeconds: number;
  };
  fee: ReturnType<typeof calculateConfiguredDeliveryFee>;
}

interface CheckoutRow {
  id: string;
  customer_id: string;
  quote_version: number;
}

function assertCoordinate(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new Error(`invalid_customer_${name}`);
}

export async function createCheckoutDeliveryQuote(
  db: D1Like,
  input: CheckoutDeliveryQuoteInput,
  geoapifyApiKey: string,
): Promise<CheckoutDeliveryQuote> {
  if (!input.checkoutSessionId.trim()) throw new Error("checkout_session_required");
  assertCoordinate(input.customer.latitude, "latitude");
  assertCoordinate(input.customer.longitude, "longitude");
  if (input.customer.latitude < -90 || input.customer.latitude > 90) throw new Error("invalid_customer_latitude");
  if (input.customer.longitude < -180 || input.customer.longitude > 180) throw new Error("invalid_customer_longitude");

  const checkout = await db.prepare(
    "SELECT id, customer_id, delivery_quote_version AS quote_version FROM checkout_sessions WHERE id = ? AND status != 'expired' LIMIT 1",
  ).bind(input.checkoutSessionId).first<CheckoutRow>();
  if (!checkout) throw new Error("checkout_not_found");

  const warehouse = await getDefaultWarehouse(db);
  const courier = await getActiveCourier(db, input.courierId);
  const route = await calculateRoadRoute(
    geoapifyApiKey,
    { lat: warehouse.latitude, lon: warehouse.longitude },
    { lat: input.customer.latitude, lon: input.customer.longitude },
  );

  const fee = calculateConfiguredDeliveryFee(
    route.distanceMeters / 1000,
    route.durationSeconds / 60,
    courier.type,
    {
      baseFeeMinor: courier.baseFeeMinor,
      perKmRateMinor: courier.perKmRateMinor,
      platformFeeMinor: courier.platformFeeMinor,
      surchargeMinor: courier.surchargeMinor,
    },
  );

  const now = input.now ?? new Date();
  const quoteVersion = checkout.quote_version + 1;
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  await db.prepare(
    "UPDATE checkout_sessions SET delivery_warehouse_id = ?, delivery_courier_id = ?, delivery_distance_meters = ?, delivery_duration_seconds = ?, delivery_fee_amount = ?, delivery_fee_currency = 'PHP', delivery_base_fee_minor = ?, delivery_distance_fee_minor = ?, delivery_platform_fee_minor = ?, delivery_surcharge_minor = ?, delivery_quote_version = ?, delivery_quote_expires_at = ?, updated_at = ? WHERE id = ?",
  ).bind(
    warehouse.id,
    courier.id,
    route.distanceMeters,
    route.durationSeconds,
    fee.feeMinor,
    fee.baseFeeMinor,
    fee.distanceFeeMinor,
    fee.platformFeeMinor,
    fee.surchargeMinor,
    quoteVersion,
    expiresAt,
    now.toISOString(),
    checkout.id,
  ).run();

  return {
    checkoutSessionId: checkout.id,
    quoteVersion,
    expiresAt,
    warehouse: { id: warehouse.id, name: warehouse.name, latitude: warehouse.latitude, longitude: warehouse.longitude },
    courier: { id: courier.id, name: courier.name, type: courier.type },
    route,
    fee,
  };
}
