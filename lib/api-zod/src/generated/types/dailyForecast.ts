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
