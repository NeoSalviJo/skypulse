import type { DailyForecast } from "./dailyForecast";
export interface ForecastResponse {
    city: string;
    country: string;
    days: DailyForecast[];
}
