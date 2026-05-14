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
