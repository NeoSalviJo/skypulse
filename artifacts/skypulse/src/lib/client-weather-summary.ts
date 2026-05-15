import type { GetWeatherSummaryParams, WeatherSummary } from "@workspace/api-client-react";

interface GeoResult {
    lat: number;
    lon: number;
    name: string;
    country: string;
    timezone: string;
}

function mapWmoToConditionCode(wmo: number, isDay: boolean): string {
    if (wmo === 0 || wmo === 1)
        return isDay ? "clear" : "night";
    if (wmo <= 3)
        return isDay ? "clear" : "night";
    if (wmo <= 48)
        return "cloudy";
    if (wmo <= 67)
        return "rain";
    if (wmo <= 77)
        return "snow";
    if (wmo <= 82)
        return "rain";
    if (wmo <= 86)
        return "snow";
    if (wmo >= 95)
        return "storm";
    return "cloudy";
}
function mapWmoToIcon(wmo: number, isDay: boolean): string {
    const s = isDay ? "d" : "n";
    if (wmo === 0)
        return `01${s}`;
    if (wmo <= 2)
        return `02${s}`;
    if (wmo <= 3)
        return `04${s}`;
    if (wmo <= 48)
        return `50${s}`;
    if (wmo <= 55)
        return `09${s}`;
    if (wmo <= 65)
        return `10${s}`;
    if (wmo <= 77)
        return `13${s}`;
    if (wmo <= 82)
        return `09${s}`;
    if (wmo <= 86)
        return `13${s}`;
    return `11${s}`;
}
function mapWmoToDescription(wmo: number): string {
    const map: Record<number, string> = {
        0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
        45: "fog", 48: "icy fog",
        51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
        61: "light rain", 63: "rain", 65: "heavy rain",
        71: "light snow", 73: "snow", 75: "heavy snow", 77: "snow grains",
        80: "light showers", 81: "showers", 82: "heavy showers",
        85: "light snow showers", 86: "snow showers",
        95: "thunderstorm", 96: "thunderstorm with hail", 99: "heavy thunderstorm",
    };
    return map[wmo] ?? "unknown";
}
function mapWmoToConditionLabel(wmo: number): string {
    if (wmo === 0 || wmo === 1)
        return "Clear";
    if (wmo <= 3)
        return "Partly Cloudy";
    if (wmo <= 48)
        return "Cloudy";
    if (wmo <= 55)
        return "Drizzle";
    if (wmo <= 65)
        return "Rain";
    if (wmo <= 77)
        return "Snow";
    if (wmo <= 82)
        return "Showers";
    if (wmo <= 86)
        return "Snow Showers";
    return "Thunderstorm";
}
function dewPoint(tempC: number, humidity: number): number {
    const a = 17.625, b = 243.04;
    const gamma = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
    return Math.round((b * gamma / (a - gamma)) * 10) / 10;
}
function isoToUnix(iso: string): number {
    return Math.floor(new Date(iso).getTime() / 1000);
}
interface OpenMeteoResponse {
    current: {
        time: string;
        temperature_2m: number;
        relative_humidity_2m: number;
        apparent_temperature: number;
        weather_code: number;
        wind_speed_10m: number;
        wind_direction_10m: number;
        surface_pressure: number;
        cloud_cover: number;
        visibility: number;
        is_day: number;
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        relative_humidity_2m: number[];
        apparent_temperature: number[];
        weather_code: number[];
        wind_speed_10m: number[];
        precipitation_probability: number[];
        is_day: number[];
    };
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weather_code: number[];
        wind_speed_10m_max: number[];
        precipitation_probability_max: number[];
        uv_index_max: number[];
        sunrise: string[];
        sunset: string[];
    };
}
async function fetchWeather(lat: number, lon: number, timezone: string): Promise<OpenMeteoResponse> {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover,visibility,is_day");
    url.searchParams.set("hourly", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation_probability,is_day");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,precipitation_probability_max,uv_index_max,sunrise,sunset");
    url.searchParams.set("wind_speed_unit", "kmh");
    url.searchParams.set("timezone", timezone || "auto");
    url.searchParams.set("forecast_days", "7");
    const res = await fetch(url.toString());
    if (!res.ok)
        throw new Error("Weather service unavailable");
    const raw = (await res.json()) as OpenMeteoResponse & { error?: boolean; reason?: string };
    if (raw.error === true)
        throw new Error(raw.reason ?? "Weather service error");
    return raw;
}
interface AQIResponse {
    hourly: {
        us_aqi: number[];
    };
}
async function fetchAqi(lat: number, lon: number, timezone: string): Promise<number | null> {
    try {
        const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
        url.searchParams.set("latitude", String(lat));
        url.searchParams.set("longitude", String(lon));
        url.searchParams.set("hourly", "us_aqi");
        url.searchParams.set("timezone", timezone || "auto");
        url.searchParams.set("forecast_days", "1");
        const res = await fetch(url.toString());
        if (!res.ok)
            return null;
        const data = (await res.json()) as AQIResponse;
        const vals = (data.hourly?.us_aqi ?? []).filter((v) => v != null && !isNaN(v));
        return vals[0] ?? null;
    } catch {
        return null;
    }
}
function aqiLabel(aqi: number | null): string | null {
    if (aqi == null)
        return null;
    if (aqi <= 50)
        return "Good";
    if (aqi <= 100)
        return "Moderate";
    if (aqi <= 150)
        return "Unhealthy for Sensitive Groups";
    if (aqi <= 200)
        return "Unhealthy";
    if (aqi <= 300)
        return "Very Unhealthy";
    return "Hazardous";
}
function generateDailySummary(wmo: number, temp: number, windSpeed: number, isDay: boolean): string {
    const condition = mapWmoToDescription(wmo);
    const tempDesc = temp <= 0 ? "freezing" : temp <= 8 ? "cold" : temp <= 14 ? "chilly" :
        temp <= 20 ? "mild" : temp <= 27 ? "warm" : "hot";
    const windDesc = windSpeed < 10 ? "calm" : windSpeed < 20 ? "light breeze" :
        windSpeed < 35 ? "breezy" : windSpeed < 50 ? "windy" : "very windy";
    const timeOfDay = isDay ? "Today" : "Tonight";
    return `${timeOfDay} is ${condition} and ${tempDesc} with ${windDesc} conditions.`;
}
function generateClothingAdvice(wmo: number, temp: number, windSpeed: number): string {
    const isRainy = wmo >= 51 && wmo <= 82;
    const isSnowy = (wmo >= 71 && wmo <= 77) || (wmo >= 85 && wmo <= 86);
    const isStormy = wmo >= 95;
    const windChill = windSpeed > 25;
    if (isStormy)
        return "Stay indoors if possible. If you must go out, wear a waterproof jacket and sturdy shoes.";
    if (isSnowy)
        return "Bundle up in a heavy coat, gloves, scarf, and waterproof boots.";
    if (isRainy)
        return "Bring an umbrella and wear a waterproof layer. Water-resistant shoes are a good idea.";
    if (temp <= 0)
        return "Dress in heavy winter layers — thermal base layer, insulated coat, gloves, hat, and scarf.";
    if (temp <= 8)
        return "Wear a warm coat, long sleeves, and consider a scarf and gloves.";
    if (temp <= 14)
        return `A jacket or light coat is recommended${windChill ? ", especially with the wind" : ""}.`;
    if (temp <= 20)
        return "A light jacket or long sleeves should be comfortable.";
    if (temp <= 27)
        return "Light clothing like a t-shirt and shorts or a light dress will work well.";
    return "It's hot — opt for breathable, light-colored clothing and stay hydrated.";
}
function buildCurrentWeather(data: OpenMeteoResponse, geo: GeoResult, aqiUs: number | null = null) {
    const c = data.current;
    const isDay = c.is_day === 1;
    const wmo = c.weather_code;
    const todayUv = data.daily.uv_index_max[0] ?? 0;
    const sunrise = isoToUnix(data.daily.sunrise[0] ?? "");
    const sunset = isoToUnix(data.daily.sunset[0] ?? "");
    return {
        city: geo.name,
        country: geo.country,
        lat: geo.lat,
        lon: geo.lon,
        timezone: geo.timezone,
        temperature: Math.round(c.temperature_2m * 10) / 10,
        feelsLike: Math.round(c.apparent_temperature * 10) / 10,
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
        windDirection: c.wind_direction_10m,
        uvIndex: Math.round(todayUv * 10) / 10,
        condition: mapWmoToConditionLabel(wmo),
        conditionCode: mapWmoToConditionCode(wmo, isDay),
        icon: mapWmoToIcon(wmo, isDay),
        description: mapWmoToDescription(wmo),
        visibility: Math.round(c.visibility / 100) / 10,
        pressure: Math.round(c.surface_pressure),
        dewPoint: dewPoint(c.temperature_2m, c.relative_humidity_2m),
        cloudCover: c.cloud_cover,
        sunrise,
        sunset,
        isDay,
        aqiUs,
        aqiLabel: aqiLabel(aqiUs),
    };
}
function buildHourly(data: OpenMeteoResponse) {
    const h = data.hourly;
    const now = Date.now();
    const results = [];
    for (let i = 0; i < h.time.length && results.length < 24; i++) {
        const t = isoToUnix(h.time[i]!);
        if (t * 1000 < now - 3600000)
            continue;
        const isDay = h.is_day[i] === 1;
        const wmo = h.weather_code[i]!;
        results.push({
            time: t,
            temperature: Math.round((h.temperature_2m[i] ?? 0) * 10) / 10,
            feelsLike: Math.round((h.apparent_temperature[i] ?? 0) * 10) / 10,
            humidity: h.relative_humidity_2m[i] ?? 0,
            windSpeed: Math.round((h.wind_speed_10m[i] ?? 0) * 10) / 10,
            condition: mapWmoToDescription(wmo),
            conditionCode: mapWmoToConditionCode(wmo, isDay),
            icon: mapWmoToIcon(wmo, isDay),
            precipitationProbability: h.precipitation_probability[i] ?? 0,
            isDay,
        });
    }
    return results;
}
function buildDailyForecast(data: OpenMeteoResponse) {
    const d = data.daily;
    return d.time.map((_, i) => {
        const wmo = d.weather_code[i]!;
        return {
            date: isoToUnix(d.time[i]! + "T12:00"),
            tempMax: Math.round((d.temperature_2m_max[i] ?? 0) * 10) / 10,
            tempMin: Math.round((d.temperature_2m_min[i] ?? 0) * 10) / 10,
            condition: mapWmoToDescription(wmo),
            conditionCode: mapWmoToConditionCode(wmo, true),
            icon: mapWmoToIcon(wmo, true),
            humidity: 0,
            windSpeed: Math.round((d.wind_speed_10m_max[i] ?? 0) * 10) / 10,
            precipitationProbability: d.precipitation_probability_max[i] ?? 0,
            uvIndex: Math.round((d.uv_index_max[i] ?? 0) * 10) / 10,
            sunrise: isoToUnix(d.sunrise[i] ?? ""),
            sunset: isoToUnix(d.sunset[i] ?? ""),
        };
    });
}

export async function fetchWeatherSummaryDirect(params: GetWeatherSummaryParams): Promise<WeatherSummary> {
    const lat = params.lat;
    const lon = params.lon;
    if (lat === undefined || lon === undefined)
        throw new Error("Direct weather requires coordinates (lat/lon).");
    const geo: GeoResult = {
        lat,
        lon,
        name: params.city,
        country: params.country ?? "",
        timezone: params.timezone ?? "auto",
    };
    const [data, aqi] = await Promise.all([
        fetchWeather(geo.lat, geo.lon, geo.timezone),
        fetchAqi(geo.lat, geo.lon, geo.timezone),
    ]);
    const current = buildCurrentWeather(data, geo, aqi);
    const wmo = data.current.weather_code;
    return {
        current,
        hourly: buildHourly(data),
        forecast: buildDailyForecast(data),
        alerts: [],
        dailySummary: generateDailySummary(wmo, current.temperature, current.windSpeed, current.isDay),
        clothingAdvice: generateClothingAdvice(wmo, current.temperature, current.windSpeed),
    };
}
