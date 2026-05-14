import type { GeocodeSuggestion } from "@workspace/api-client-react";

const US_ZIP_RE = /^\d{5}(-\d{4})?$/;

async function openMeteoZipSearch(zip5: string): Promise<GeocodeSuggestion[]> {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", zip5);
    url.searchParams.set("count", "10");
    url.searchParams.set("countryCode", "US");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = (await res.json()) as {
        results?: Array<{
            id?: number;
            name?: string;
            latitude?: number;
            longitude?: number;
            country?: string;
            country_code?: string;
            admin1?: string;
            timezone?: string;
            postcodes?: string[];
        }>;
    };
    const raw = data.results ?? [];
    const us = raw.filter((r) => (r.country_code ?? "").toUpperCase() === "US");
    const withZip = us.filter((r) => r.postcodes?.includes(zip5));
    const pick = withZip.length ? withZip : us;
    if (!pick.length) return [];
    const seen = new Set<string>();
    const out: GeocodeSuggestion[] = [];
    for (const r of pick.slice(0, 8)) {
        const cityName = r.name ?? "Unknown";
        const region = r.admin1 ?? null;
        const country = r.country ?? "United States";
        const countryCode = (r.country_code ?? "US").toUpperCase();
        const key = `${cityName}-${region}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const parts = [cityName, region, country].filter(Boolean);
        out.push({
            id: `om-zip-${r.id ?? Math.random()}`,
            name: cityName,
            region,
            country,
            countryCode,
            lat: r.latitude ?? 0,
            lon: r.longitude ?? 0,
            displayName: parts.join(", "),
            timezone: r.timezone ?? "auto",
        });
    }
    return out;
}

async function openMeteoNameSearch(name: string): Promise<GeocodeSuggestion[]> {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", name);
    url.searchParams.set("count", "8");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = (await res.json()) as {
        results?: Array<{
            id?: number;
            name?: string;
            latitude?: number;
            longitude?: number;
            country?: string;
            country_code?: string;
            admin1?: string;
            timezone?: string;
        }>;
    };
    if (!data.results?.length) return [];
    return data.results.map((r) => {
        const cityName = r.name ?? "Unknown";
        const region = r.admin1 ?? null;
        const country = r.country ?? "Unknown";
        const countryCode = (r.country_code ?? "").toUpperCase();
        const parts = [cityName, region, country].filter(Boolean);
        return {
            id: `om-${r.id ?? "x"}`,
            name: cityName,
            region,
            country,
            countryCode,
            lat: r.latitude ?? 0,
            lon: r.longitude ?? 0,
            displayName: parts.join(", "),
            timezone: r.timezone ?? "auto",
        };
    });
}

export async function fetchGeocodeDirect(query: string): Promise<GeocodeSuggestion[]> {
    const t = query.trim();
    if (t.length < 2) return [];
    if (US_ZIP_RE.test(t)) {
        return openMeteoZipSearch(t.slice(0, 5));
    }
    if (/^\d+$/.test(t) && t.length < 5) return [];
    return openMeteoNameSearch(t);
}
