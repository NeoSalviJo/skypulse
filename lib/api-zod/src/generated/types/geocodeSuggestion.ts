export interface GeocodeSuggestion {
    id: string;
    name: string;
    region?: string | null;
    country: string;
    countryCode: string;
    lat: number;
    lon: number;
    displayName: string;
    timezone: string;
}
