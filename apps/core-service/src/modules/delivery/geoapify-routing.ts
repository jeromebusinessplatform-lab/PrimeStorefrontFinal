export interface GeoapifyRouteQuote {
  distanceMeters: number;
  durationSeconds: number;
}

interface GeoapifyFeatureCollection {
  features?: Array<{ properties?: { distance?: number; time?: number } }>;
  results?: Array<{ distance?: number; time?: number }>;
}

export async function calculateRoadRoute(
  apiKey: string,
  hub: { lat: number; lon: number },
  customer: { lat: number; lon: number },
  fetchImpl: typeof fetch = fetch,
): Promise<GeoapifyRouteQuote> {
  if (!apiKey) throw new Error("geoapify_api_key_required");
  const waypoints = `${hub.lat},${hub.lon}|${customer.lat},${customer.lon}`;
  const url = new URL("https://api.geoapify.com/v1/routing");
  url.searchParams.set("waypoints", waypoints);
  url.searchParams.set("mode", "drive");
  url.searchParams.set("format", "json");
  url.searchParams.set("apiKey", apiKey);

  const response = await fetchImpl(url);
  if (!response.ok) throw new Error("geoapify_route_failed");
  const json = await response.json() as GeoapifyFeatureCollection;
  const route = json.results?.[0] ?? json.features?.[0]?.properties;
  const distanceMeters = route?.distance;
  const durationSeconds = route?.time;
  if (!Number.isFinite(distanceMeters) || !Number.isFinite(durationSeconds) || distanceMeters <= 0 || durationSeconds <= 0) {
    throw new Error("geoapify_route_invalid");
  }
  return { distanceMeters, durationSeconds };
}
