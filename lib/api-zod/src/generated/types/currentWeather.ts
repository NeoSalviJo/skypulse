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
