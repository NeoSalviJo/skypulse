import { useState, useEffect, useRef } from "react";
export interface CityImageLocation {
    city: string;
    region?: string | null;
    country?: string | null;
}
const imageCache = new Map<string, string | null>();
function buildSlugs(loc: CityImageLocation): string[] {
    const { city, region, country } = loc;
    const slugs: string[] = [];
    if (region && region !== city) {
        slugs.push(`${city}, ${region}`);
    }
    if (country && country !== region) {
        const cc = countryQualifier(country);
        if (cc && cc !== region) {
            slugs.push(`${city}, ${cc}`);
        }
    }
    slugs.push(city);
    return slugs;
}
function countryQualifier(country: string): string | null {
    const map: Record<string, string> = {
        "United Kingdom": "England",
        "France": "France",
        "Germany": "Germany",
        "Italy": "Italy",
        "Spain": "Spain",
        "Australia": "Australia",
        "Mexico": "Mexico",
        "Brazil": "Brazil",
        "India": "India",
        "China": "China",
        "Japan": "Japan",
        "South Korea": "South Korea",
        "Netherlands": "Netherlands",
        "Belgium": "Belgium",
        "Poland": "Poland",
        "Sweden": "Sweden",
        "Norway": "Norway",
        "Denmark": "Denmark",
        "Switzerland": "Switzerland",
        "Austria": "Austria",
        "Portugal": "Portugal",
        "Greece": "Greece",
    };
    return map[country] ?? null;
}
async function tryWikipediaSlug(slug: string, signal: AbortSignal): Promise<string | null> {
    const encoded = encodeURIComponent(slug.replace(/\s+/g, "_"));
    try {
        const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
            signal,
            headers: { Accept: "application/json" },
        });
        if (!r.ok) return null;
        const json = await r.json();
        const url: string | null =
            json?.originalimage?.source ?? json?.thumbnail?.source ?? null;
        if (!url) return null;
        const lower = url.toLowerCase();
        if (
            lower.includes("flag") ||
            lower.includes("coat_of_arms") ||
            lower.includes("locator") ||
            lower.includes("location_map") ||
            lower.includes("logo") ||
            lower.includes("seal_of")
        ) {
            return null;
        }
        const w = json?.originalimage?.width ?? json?.thumbnail?.width ?? 9999;
        if (w < 400) return null;
        return url;
    } catch {
        return null;
    }
}
export function useCityImage(location: CityImageLocation | null) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const city = location?.city ?? null;
    const region = location?.region ?? null;
    const country = location?.country ?? null;
    useEffect(() => {
        if (!city) {
            setImageUrl(null);
            setIsLoading(false);
            return;
        }
        const cacheKey = `${city}|${region ?? ""}|${country ?? ""}`.toLowerCase().trim();
        if (imageCache.has(cacheKey)) {
            setImageUrl(imageCache.get(cacheKey) ?? null);
            setIsLoading(false);
            return;
        }
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setIsLoading(true);
        const slugs = buildSlugs({ city, region, country });
        (async () => {
            let found: string | null = null;
            for (const slug of slugs) {
                if (controller.signal.aborted) return;
                found = await tryWikipediaSlug(slug, controller.signal);
                if (found) break;
            }
            if (!controller.signal.aborted) {
                imageCache.set(cacheKey, found);
                setImageUrl(found);
                setIsLoading(false);
            }
        })();
        return () => {
            controller.abort();
        };
    }, [city, region, country]);
    return { imageUrl, isLoading };
}
