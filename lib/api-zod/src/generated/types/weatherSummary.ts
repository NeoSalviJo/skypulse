import type { CurrentWeather } from "./currentWeather";
import type { DailyForecast } from "./dailyForecast";
import type { HourlyPoint } from "./hourlyPoint";
import type { WeatherAlert } from "./weatherAlert";
export interface WeatherSummary {
    current: CurrentWeather;
    hourly: HourlyPoint[];
    forecast: DailyForecast[];
    alerts: WeatherAlert[];
    dailySummary: string;
    clothingAdvice: string;
}
