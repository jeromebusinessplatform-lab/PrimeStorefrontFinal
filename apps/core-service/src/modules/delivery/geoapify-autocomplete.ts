export interface AddressSuggestion {
  placeId?: string;
  formatted: string;
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
}

interface GeoapifyAutocompleteResponse {
  results?: Array<Record<string, unknown>>;
}

export async function autocompleteAddress(
  apiKey: string,
  text: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AddressSuggestion[]> {
  const query = text.trim();
  if (!apiKey) throw new Error("geoapify_api_key_required");
  if (query.length < 3) return [];

  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.searchParams.set("text", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("apiKey", apiKey);

  const response = await fetchImpl(url);
  if (!response.ok) throw new Error("geoapify_autocomplete_failed");
  const json = await response.json() as GeoapifyAutocompleteResponse;

  return (json.results ?? []).flatMap((result) => {
    const lat = result.lat;
    const lon = result.lon;
    const formatted = result.formatted;
    if (typeof lat !== "number" || typeof lon !== "number" || typeof formatted !== "string") return [];
    return [{
      placeId: typeof result.place_id === "string" ? result.place_id : undefined,
      formatted,
      lat,
      lon,
      city: typeof result.city === "string" ? result.city : undefined,
      state: typeof result.state === "string" ? result.state : undefined,
      postcode: typeof result.postcode === "string" ? result.postcode : undefined,
      country: typeof result.country === "string" ? result.country : undefined,
      countryCode: typeof result.country_code === "string" ? result.country_code : undefined,
    } satisfies AddressSuggestion];
  });
}
