import { assertCourierPricing, assertWarehouseCoordinates, CourierConfig, CourierType, Warehouse } from "./delivery-config";

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      all<T = unknown>(): Promise<{ results: T[] }>;
      run(): Promise<unknown>;
    };
  };
}

function now(): string { return new Date().toISOString(); }
function id(prefix: string): string { return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`; }

interface WarehouseRow {
  id: string; name: string; address: string; latitude: number; longitude: number;
  is_default: number; is_active: number; created_at: string; updated_at: string;
}
interface CourierRow {
  id: string; name: string; type: CourierType; logo_object_key: string | null;
  base_fee_minor: number; per_km_rate_minor: number; platform_fee_minor: number;
  surcharge_minor: number; is_active: number; created_at: string; updated_at: string;
}

function mapWarehouse(row: WarehouseRow): Warehouse {
  return {
    id: row.id, name: row.name, address: row.address,
    latitude: row.latitude, longitude: row.longitude,
    isDefault: row.is_default === 1, isActive: row.is_active === 1,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}
function mapCourier(row: CourierRow): CourierConfig {
  return {
    id: row.id, name: row.name, type: row.type, logoObjectKey: row.logo_object_key,
    baseFeeMinor: row.base_fee_minor, perKmRateMinor: row.per_km_rate_minor,
    platformFeeMinor: row.platform_fee_minor, surchargeMinor: row.surcharge_minor,
    isActive: row.is_active === 1, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

const WAREHOUSE_SELECT = "SELECT id,name,address,latitude,longitude,is_default,is_active,created_at,updated_at FROM warehouses";
const COURIER_SELECT = "SELECT id,name,type,logo_object_key,base_fee_minor,per_km_rate_minor,platform_fee_minor,surcharge_minor,is_active,created_at,updated_at FROM couriers";

export async function listWarehouses(db: D1Like): Promise<Warehouse[]> {
  const { results } = await db.prepare(`${WAREHOUSE_SELECT} ORDER BY is_active DESC, is_default DESC, name ASC`).bind().all<WarehouseRow>();
  return results.map(mapWarehouse);
}
export async function listCouriers(db: D1Like): Promise<CourierConfig[]> {
  const { results } = await db.prepare(`${COURIER_SELECT} ORDER BY is_active DESC, name ASC`).bind().all<CourierRow>();
  return results.map(mapCourier);
}

export async function createWarehouse(db: D1Like, input: Omit<Warehouse, "id" | "createdAt" | "updatedAt">): Promise<Warehouse> {
  assertWarehouseCoordinates(input.latitude, input.longitude);
  if (!input.name.trim()) throw new Error("warehouse_name_required");
  if (!input.address.trim()) throw new Error("warehouse_address_required");
  const createdAt = now();
  const hasActiveDefault = await db.prepare("SELECT id FROM warehouses WHERE is_default = 1 AND is_active = 1 LIMIT 1").bind().first<{ id: string }>();
  const makeDefault = input.isDefault || (!hasActiveDefault && input.isActive);
  if (makeDefault) await db.prepare("UPDATE warehouses SET is_default = 0, updated_at = ? WHERE is_default = 1").bind(createdAt).run();
  const warehouse: Warehouse = { ...input, id: id("wh"), name: input.name.trim(), address: input.address.trim(), isDefault: makeDefault, createdAt, updatedAt: createdAt };
  await db.prepare("INSERT INTO warehouses (id,name,address,latitude,longitude,is_default,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)")
    .bind(warehouse.id, warehouse.name, warehouse.address, warehouse.latitude, warehouse.longitude, warehouse.isDefault ? 1 : 0, warehouse.isActive ? 1 : 0, createdAt, createdAt).run();
  return warehouse;
}

export async function updateWarehouse(db: D1Like, warehouseId: string, patch: Partial<Pick<Warehouse, "name" | "address" | "latitude" | "longitude" | "isActive" | "isDefault">>): Promise<Warehouse> {
  const row = await db.prepare(`${WAREHOUSE_SELECT} WHERE id = ? LIMIT 1`).bind(warehouseId).first<WarehouseRow>();
  if (!row) throw new Error("warehouse_not_found");
  const name = patch.name === undefined ? row.name : patch.name.trim();
  const address = patch.address === undefined ? row.address : patch.address.trim();
  if (!name) throw new Error("warehouse_name_required");
  if (!address) throw new Error("warehouse_address_required");
  const latitude = patch.latitude ?? row.latitude;
  const longitude = patch.longitude ?? row.longitude;
  assertWarehouseCoordinates(latitude, longitude);
  const isActive = patch.isActive ?? row.is_active === 1;
  if (!isActive && (patch.isDefault === true || row.is_default === 1)) throw new Error("default_warehouse_cannot_be_deactivated");
  const timestamp = now();
  const makeDefault = patch.isDefault === true ? true : patch.isDefault === false ? false : row.is_default === 1;
  if (makeDefault) await db.prepare("UPDATE warehouses SET is_default = 0, updated_at = ? WHERE is_default = 1 AND id <> ?").bind(timestamp, warehouseId).run();
  await db.prepare("UPDATE warehouses SET name = ?, address = ?, latitude = ?, longitude = ?, is_default = ?, is_active = ?, updated_at = ? WHERE id = ?")
    .bind(name, address, latitude, longitude, makeDefault ? 1 : 0, isActive ? 1 : 0, timestamp, warehouseId).run();
  const updated = await db.prepare(`${WAREHOUSE_SELECT} WHERE id = ? LIMIT 1`).bind(warehouseId).first<WarehouseRow>();
  if (!updated) throw new Error("warehouse_not_found");
  return mapWarehouse(updated);
}

export async function createCourier(db: D1Like, input: Omit<CourierConfig, "id" | "createdAt" | "updatedAt">): Promise<CourierConfig> {
  if (!input.name.trim()) throw new Error("courier_name_required");
  if (!["standard", "express", "priority"].includes(input.type)) throw new Error("invalid_courier_type");
  assertCourierPricing(input);
  const createdAt = now();
  const courier: CourierConfig = { ...input, id: id("co"), name: input.name.trim(), logoObjectKey: input.logoObjectKey?.trim() || null, createdAt, updatedAt: createdAt };
  await db.prepare("INSERT INTO couriers (id,name,type,logo_object_key,base_fee_minor,per_km_rate_minor,platform_fee_minor,surcharge_minor,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
    .bind(courier.id, courier.name, courier.type, courier.logoObjectKey, courier.baseFeeMinor, courier.perKmRateMinor, courier.platformFeeMinor, courier.surchargeMinor, courier.isActive ? 1 : 0, createdAt, createdAt).run();
  return courier;
}

export async function updateCourier(db: D1Like, courierId: string, patch: Partial<Pick<CourierConfig, "name" | "type" | "logoObjectKey" | "baseFeeMinor" | "perKmRateMinor" | "platformFeeMinor" | "surchargeMinor" | "isActive">>): Promise<CourierConfig> {
  const row = await db.prepare(`${COURIER_SELECT} WHERE id = ? LIMIT 1`).bind(courierId).first<CourierRow>();
  if (!row) throw new Error("courier_not_found");
  const name = patch.name === undefined ? row.name : patch.name.trim();
  if (!name) throw new Error("courier_name_required");
  const type = patch.type ?? row.type;
  if (!["standard", "express", "priority"].includes(type)) throw new Error("invalid_courier_type");
  const next = {
    baseFeeMinor: patch.baseFeeMinor ?? row.base_fee_minor,
    perKmRateMinor: patch.perKmRateMinor ?? row.per_km_rate_minor,
    platformFeeMinor: patch.platformFeeMinor ?? row.platform_fee_minor,
    surchargeMinor: patch.surchargeMinor ?? row.surcharge_minor,
  };
  assertCourierPricing(next);
  const timestamp = now();
  await db.prepare("UPDATE couriers SET name = ?, type = ?, logo_object_key = ?, base_fee_minor = ?, per_km_rate_minor = ?, platform_fee_minor = ?, surcharge_minor = ?, is_active = ?, updated_at = ? WHERE id = ?")
    .bind(name, type, patch.logoObjectKey === undefined ? row.logo_object_key : (patch.logoObjectKey?.trim() || null), next.baseFeeMinor, next.perKmRateMinor, next.platformFeeMinor, next.surchargeMinor, (patch.isActive ?? row.is_active === 1) ? 1 : 0, timestamp, courierId).run();
  const updated = await db.prepare(`${COURIER_SELECT} WHERE id = ? LIMIT 1`).bind(courierId).first<CourierRow>();
  if (!updated) throw new Error("courier_not_found");
  return mapCourier(updated);
}

export async function setDefaultWarehouse(db: D1Like, warehouseId: string): Promise<Warehouse> {
  return updateWarehouse(db, warehouseId, { isDefault: true, isActive: true });
}

export async function deactivateWarehouse(db: D1Like, warehouseId: string): Promise<Warehouse> {
  return updateWarehouse(db, warehouseId, { isActive: false });
}

export async function deactivateCourier(db: D1Like, courierId: string): Promise<CourierConfig> {
  return updateCourier(db, courierId, { isActive: false });
}

export async function getDefaultWarehouse(db: D1Like): Promise<Warehouse> {
  const row = await db.prepare(`${WAREHOUSE_SELECT} WHERE is_default = 1 AND is_active = 1 LIMIT 1`).bind().first<WarehouseRow>();
  if (!row) throw new Error("default_warehouse_not_configured");
  return mapWarehouse(row);
}

export async function getActiveCourier(db: D1Like, courierId: string): Promise<CourierConfig> {
  const row = await db.prepare(`${COURIER_SELECT} WHERE id = ? AND is_active = 1 LIMIT 1`).bind(courierId).first<CourierRow>();
  if (!row) throw new Error("courier_not_found");
  return mapCourier(row);
}
