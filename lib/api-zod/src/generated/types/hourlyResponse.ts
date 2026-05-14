import type { HourlyPoint } from "./hourlyPoint";
export interface HourlyResponse {
    city: string;
    country: string;
    hours: HourlyPoint[];
}
