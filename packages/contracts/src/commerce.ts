export type ProductStatus = "draft" | "active" | "archived";

export type InventoryMovementType =
  | "IN"
  | "OUT"
  | "RESERVE"
  | "RELEASE"
  | "ADJUSTMENT";

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  priceMinor: number;
  currency: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryRecord {
  productId: string;
  onHand: number;
  reserved: number;
  updatedAt: string;
}

export interface InventoryMovementRecord {
  id: string;
  productId: string;
  movementType: InventoryMovementType;
  quantity: number;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
}

export function availableInventory(inventory: InventoryRecord): number {
  return Math.max(0, inventory.onHand - inventory.reserved);
}

export function assertSufficientInventory(inventory: InventoryRecord, requested: number): void {
  if (!Number.isInteger(requested) || requested <= 0) {
    throw new Error("invalid_inventory_quantity");
  }
  if (requested > availableInventory(inventory)) {
    throw new Error("insufficient_inventory");
  }
}
