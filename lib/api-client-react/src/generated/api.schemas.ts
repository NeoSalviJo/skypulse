export interface HealthStatus {
    status: string;
}
export interface ApiError {
    error: string;
}
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
export interface GeocodeResponse {
    results: GeocodeSuggestion[];
}
export interface CurrentWeather {
    city: string;
    country: string;
    lat: number;
    lon: number;
    timezone: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    uvIndex: number;
    condition: string;
    conditionCode: string;
    icon: string;
    description: string;
    visibility: number;
    pressure: number;
    dewPoint: number;
    cloudCover: number;
    sunrise: number;
    sunset: number;
    isDay: boolean;
    aqiUs?: number | null;
    aqiLabel?: string | null;
}
export interface HourlyPoint {
    time: number;
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    conditionCode: string;
    icon: string;
    precipitationProbability: number;
    isDay: boolean;
}
export interface HourlyResponse {
    city: string;
    country: string;
    hours: HourlyPoint[];
}
export interface DailyForecast {
    date: number;
    tempMax: number;
    tempMin: number;
    condition: string;
    conditionCode: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    precipitationProbability: number;
    uvIndex: number;
    sunrise: number;
    sunset: number;
}
export interface ForecastResponse {
    city: string;
    country: string;
    days: DailyForecast[];
}
export interface WeatherAlert {
    event: string;
    description: string;
    start: number;
    end: number;
    severity: string;
    senderName?: string | null;
}
export interface AlertsResponse {
    city: string;
    country: string;
    alerts: WeatherAlert[];
}
export interface WeatherSummary {
    current: CurrentWeather;
    hourly: HourlyPoint[];
    forecast: DailyForecast[];
    alerts: WeatherAlert[];
    dailySummary: string;
    clothingAdvice: string;
}
export type GeocodeSearchParams = {
    q: string;
};
export type GetCurrentWeatherParams = {
    city: string;
};
export type GetForecastParams = {
    city: string;
};
export type GetHourlyForecastParams = {
    city: string;
};
export type GetWeatherAlertsParams = {
    city: string;
};
export type GetWeatherSummaryParams = {
    city: string;
    lat?: number;
    lon?: number;
    country?: string;
    timezone?: string;
};
