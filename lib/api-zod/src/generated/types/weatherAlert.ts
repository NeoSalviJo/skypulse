export interface WeatherAlert {
    event: string;
    description: string;
    start: number;
    end: number;
    severity: string;
    senderName?: string | null;
}
