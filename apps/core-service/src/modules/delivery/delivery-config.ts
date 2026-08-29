export type CourierType = "standard" | "express" | "priority";

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourierConfig {
  id: string;
  name: string;
  type: CourierType;
  logoObjectKey: string | null;
  baseFeeMinor: number;
  perKmRateMinor: number;
  platformFeeMinor: number;
  surchargeMinor: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function assertWarehouseCoordinates(latitude: number, longitude: number): void {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error("invalid_warehouse_latitude");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("invalid_warehouse_longitude");
  }
}

export function assertCourierPricing(config: Pick<CourierConfig, "baseFeeMinor" | "perKmRateMinor" | "platformFeeMinor" | "surchargeMinor">): void {
  for (const [name, value] of Object.entries(config)) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`invalid_courier_${name}`);
  }
}

export function selectDefaultWarehouse(warehouses: readonly Warehouse[]): Warehouse {
  const active = warehouses.filter((warehouse) => warehouse.isActive);
  const defaults = active.filter((warehouse) => warehouse.isDefault);
  if (defaults.length !== 1) throw new Error("default_warehouse_not_configured");
  return defaults[0];
}
