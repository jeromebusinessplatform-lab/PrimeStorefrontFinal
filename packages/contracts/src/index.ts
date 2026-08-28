export type Environment = "local" | "staging" | "production";
export type CurrencyCode = string;
export interface TenantContext { tenantId: string; environment: Environment; }
export interface ApiError { code: string; message: string; requestId?: string; }
