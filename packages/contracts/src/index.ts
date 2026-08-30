export type Environment = "local" | "staging" | "production";
export type CurrencyCode = string;
export interface ApiError { code: string; message: string; requestId?: string; }
