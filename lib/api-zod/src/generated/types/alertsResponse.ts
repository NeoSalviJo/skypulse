import type { WeatherAlert } from "./weatherAlert";
export interface AlertsResponse {
    city: string;
    country: string;
    alerts: WeatherAlert[];
}
