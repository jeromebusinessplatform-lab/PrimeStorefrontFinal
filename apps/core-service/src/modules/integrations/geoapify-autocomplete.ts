export interface AddressSuggestion {
  id: string;
  formatted: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  confidence?: number;
}

export async function autocompleteAddress(
  text: string,
  apiKey: string,
  options: { lang?: string; countryCode?: string; limit?: number } = {},
): Promise<AddressSuggestion[]> {
  if (!text.trim()) return [];
  if (!apiKey) throw new Error("geoapify_api_key_missing");
  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.searchParams.set("text", text.trim());
  url.searchParams.set("format", "json");
  url.searchParams.set("apiKey", apiKey);
  if (options.lang) url.searchParams.set("lang", options.lang);
  if (options.countryCode) url.searchParams.set("filter", `countrycode:${options.countryCode.toLowerCase()}`);
  if (options.limit) url.searchParams.set("limit", String(Math.min(10, Math.max(1, options.limit))));

  const response = await fetch(url);
  if (!response.ok) throw new Error("geoapify_autocomplete_failed");
  const payload = await response.json() as { results?: Array<Record<string, unknown>> };
  return (payload.results ?? []).flatMap((item, index) => {
    const lat = typeof item.lat === "number" ? item.lat : Number(item.lat);
    const lon = typeof item.lon === "number" ? item.lon : Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
    return [{
      id: String(item.place_id ?? `${index}:${item.formatted ?? ""}`),
      formatted: String(item.formatted ?? ""),
      addressLine1: typeof item.address_line1 === "string" ? item.address_line1 : undefined,
      addressLine2: typeof item.address_line2 === "string" ? item.address_line2 : undefined,
      city: typeof item.city === "string" ? item.city : undefined,
      state: typeof item.state === "string" ? item.state : undefined,
      postcode: typeof item.postcode === "string" ? item.postcode : undefined,
      country: typeof item.country === "string" ? item.country : undefined,
      countryCode: typeof item.country_code === "string" ? item.country_code : undefined,
      latitude: lat,
      longitude: lon,
      confidence: typeof (item.rank as { confidence?: unknown } | undefined)?.confidence === "number"
        ? (item.rank as { confidence: number }).confidence
        : undefined,
    } satisfies AddressSuggestion];
  });
}
