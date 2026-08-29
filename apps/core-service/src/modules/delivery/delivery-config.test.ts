import { describe, expect, it } from "vitest";
import { assertCourierPricing, assertWarehouseCoordinates, selectDefaultWarehouse, type Warehouse } from "./delivery-config";

const warehouse = (overrides: Partial<Warehouse> = {}): Warehouse => ({
  id: "wh_1",
  name: "Main",
  address: "Manila",
  latitude: 14.5995,
  longitude: 120.9842,
  isDefault: true,
  isActive: true,
  createdAt: "2026-08-30T00:00:00.000Z",
  updatedAt: "2026-08-30T00:00:00.000Z",
  ...overrides,
});

describe("delivery configuration", () => {
  it("accepts valid warehouse coordinates", () => {
    expect(() => assertWarehouseCoordinates(14.6, 121)).not.toThrow();
  });

  it("rejects coordinates outside geographic bounds", () => {
    expect(() => assertWarehouseCoordinates(91, 121)).toThrow("invalid_warehouse_latitude");
    expect(() => assertWarehouseCoordinates(14.6, 181)).toThrow("invalid_warehouse_longitude");
  });

  it("requires exactly one active default warehouse", () => {
    expect(selectDefaultWarehouse([warehouse()]).id).toBe("wh_1");
    expect(() => selectDefaultWarehouse([warehouse({ isDefault: false })])).toThrow("default_warehouse_not_configured");
    expect(() => selectDefaultWarehouse([warehouse(), warehouse({ id: "wh_2" })])).toThrow("default_warehouse_not_configured");
  });

  it("rejects negative courier pricing", () => {
    expect(() => assertCourierPricing({ baseFeeMinor: -1, perKmRateMinor: 100, platformFeeMinor: 0, surchargeMinor: 0 })).toThrow("invalid_courier_baseFeeMinor");
  });
});
