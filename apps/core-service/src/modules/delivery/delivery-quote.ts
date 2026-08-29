import { calculateConfiguredDeliveryFee } from "./delivery-fee";
import { getActiveCourier, getDefaultWarehouse } from "./delivery-config-store";
import { calculateRoadRoute } from "./geoapify-routing";

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      all<T = unknown>(): Promise<{ results: T[] }>;
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
  const route = await calculateRoadRoute(
    geoapifyApiKey,
    { lat: warehouse.latitude, lon: warehouse.longitude },
    { lat: input.latitude, lon: input.longitude },
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

  return {
    warehouse: { id: warehouse.id, name: warehouse.name, latitude: warehouse.latitude, longitude: warehouse.longitude },
    courier: { id: courier.id, name: courier.name, type: courier.type },
    route,
    fee,
  };
}
