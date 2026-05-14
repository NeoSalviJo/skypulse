import * as zod from "zod";
export const HealthCheckResponse = zod.object({
    status: zod.string(),
});
export const geocodeSearchQueryQMax = 100;
export const GeocodeSearchQueryParams = zod.object({
    q: zod.coerce
        .string()
        .min(1)
        .max(geocodeSearchQueryQMax)
        .describe("Search query — city name, ZIP\/postal code, or lat,lon coordinates"),
});
export const GeocodeSearchResponse = zod.object({
    results: zod.array(zod.object({
        id: zod.string(),
        name: zod.string().describe("Primary city\/place name"),
        region: zod
            .string()
            .nullish()
            .describe("State, province, or administrative region"),
        country: zod.string().describe("Full country name"),
        countryCode: zod
            .string()
            .describe('ISO 3166-1 alpha-2 country code (e.g. \"US\", \"GB\")'),
        lat: zod.number(),
        lon: zod.number(),
        displayName: zod
            .string()
            .describe('Full formatted display string e.g. \"Bayonne, New Jersey, United States\"'),
        timezone: zod.string().describe("IANA timezone identifier"),
    })),
});
export const getCurrentWeatherQueryCityMax = 100;
export const GetCurrentWeatherQueryParams = zod.object({
    city: zod.coerce
        .string()
        .min(1)
        .max(getCurrentWeatherQueryCityMax)
        .describe("City name to search for weather"),
});
export const GetCurrentWeatherResponse = zod.object({
    city: zod.string(),
    country: zod.string(),
    lat: zod.number(),
    lon: zod.number(),
    timezone: zod.string(),
    temperature: zod.number().describe("Temperature in Celsius"),
    feelsLike: zod.number().describe("Feels-like temperature in Celsius"),
    humidity: zod.number().describe("Humidity percentage"),
    windSpeed: zod.number().describe("Wind speed in km\/h"),
    windDirection: zod.number().describe("Wind direction in degrees"),
    uvIndex: zod.number().describe("UV index value"),
    condition: zod
        .string()
        .describe('Human-readable weather condition (e.g. \"Sunny\", \"Rain\")'),
    conditionCode: zod
        .string()
        .describe('Machine-readable condition key (e.g. \"clear\", \"rain\", \"snow\", \"storm\", \"cloudy\", \"night\")'),
    icon: zod.string().describe("Weather icon code"),
    description: zod.string(),
    visibility: zod.number().describe("Visibility in km"),
    pressure: zod.number().describe("Atmospheric pressure in hPa"),
    dewPoint: zod.number().describe("Dew point in Celsius"),
    cloudCover: zod.number().describe("Cloud cover percentage"),
    sunrise: zod.number().describe("Sunrise Unix timestamp"),
    sunset: zod.number().describe("Sunset Unix timestamp"),
    isDay: zod.boolean().describe("Whether it is currently daytime"),
    aqiUs: zod.number().nullish().describe("US AQI value (null if unavailable)"),
    aqiLabel: zod
        .string()
        .nullish()
        .describe('AQI label e.g. \"Good\", \"Moderate\", \"Unhealthy\"'),
});
export const getForecastQueryCityMax = 100;
export const GetForecastQueryParams = zod.object({
    city: zod.coerce
        .string()
        .min(1)
        .max(getForecastQueryCityMax)
        .describe("City name"),
});
export const GetForecastResponse = zod.object({
    city: zod.string(),
    country: zod.string(),
    days: zod.array(zod.object({
        date: zod.number().describe("Unix timestamp for the day"),
        tempMax: zod.number().describe("Max temperature in Celsius"),
        tempMin: zod.number().describe("Min temperature in Celsius"),
        condition: zod.string(),
        conditionCode: zod.string(),
        icon: zod.string(),
        humidity: zod.number(),
        windSpeed: zod.number(),
        precipitationProbability: zod.number(),
        uvIndex: zod.number(),
        sunrise: zod.number(),
        sunset: zod.number(),
    })),
});
export const getHourlyForecastQueryCityMax = 100;
export const GetHourlyForecastQueryParams = zod.object({
    city: zod.coerce
        .string()
        .min(1)
        .max(getHourlyForecastQueryCityMax)
        .describe("City name"),
});
export const GetHourlyForecastResponse = zod.object({
    city: zod.string(),
    country: zod.string(),
    hours: zod.array(zod.object({
        time: zod.number().describe("Unix timestamp"),
        temperature: zod.number(),
        feelsLike: zod.number(),
        humidity: zod.number(),
        windSpeed: zod.number(),
        condition: zod.string(),
        conditionCode: zod.string(),
        icon: zod.string(),
        precipitationProbability: zod
            .number()
            .describe("Probability of precipitation (0-100)"),
        isDay: zod.boolean(),
    })),
});
export const getWeatherAlertsQueryCityMax = 100;
export const GetWeatherAlertsQueryParams = zod.object({
    city: zod.coerce
        .string()
        .min(1)
        .max(getWeatherAlertsQueryCityMax)
        .describe("City name"),
});
export const GetWeatherAlertsResponse = zod.object({
    city: zod.string(),
    country: zod.string(),
    alerts: zod.array(zod.object({
        event: zod
            .string()
            .describe('Alert event type (e.g. \"Thunderstorm Warning\")'),
        description: zod.string().describe("Detailed alert description"),
        start: zod.number().describe("Alert start Unix timestamp"),
        end: zod.number().describe("Alert end Unix timestamp"),
        severity: zod
            .string()
            .describe('Severity level (e.g. \"Moderate\", \"Extreme\")'),
        senderName: zod.string().nullish(),
    })),
});
export const getWeatherSummaryQueryCityMax = 100;
export const getWeatherSummaryQueryLatMin = -90;
export const getWeatherSummaryQueryLatMax = 90;
export const getWeatherSummaryQueryLonMin = -180;
export const getWeatherSummaryQueryLonMax = 180;
export const getWeatherSummaryQueryCountryMax = 100;
export const getWeatherSummaryQueryTimezoneMax = 50;
export const GetWeatherSummaryQueryParams = zod.object({
    city: zod.coerce
        .string()
        .min(1)
        .max(getWeatherSummaryQueryCityMax)
        .describe("City display name"),
    lat: zod.coerce
        .number()
        .min(getWeatherSummaryQueryLatMin)
        .max(getWeatherSummaryQueryLatMax)
        .optional()
        .describe("Latitude — when provided with lon, bypasses geocoding"),
    lon: zod.coerce
        .number()
        .min(getWeatherSummaryQueryLonMin)
        .max(getWeatherSummaryQueryLonMax)
        .optional()
        .describe("Longitude — when provided with lat, bypasses geocoding"),
    country: zod.coerce
        .string()
        .max(getWeatherSummaryQueryCountryMax)
        .optional()
        .describe("Country display name (used when lat\/lon are provided)"),
    timezone: zod.coerce
        .string()
        .max(getWeatherSummaryQueryTimezoneMax)
        .optional()
        .describe("IANA timezone (used when lat\/lon are provided; defaults to auto-detect)"),
});
export const GetWeatherSummaryResponse = zod.object({
    current: zod.object({
        city: zod.string(),
        country: zod.string(),
        lat: zod.number(),
        lon: zod.number(),
        timezone: zod.string(),
        temperature: zod.number().describe("Temperature in Celsius"),
        feelsLike: zod.number().describe("Feels-like temperature in Celsius"),
        humidity: zod.number().describe("Humidity percentage"),
        windSpeed: zod.number().describe("Wind speed in km\/h"),
        windDirection: zod.number().describe("Wind direction in degrees"),
        uvIndex: zod.number().describe("UV index value"),
        condition: zod
            .string()
            .describe('Human-readable weather condition (e.g. \"Sunny\", \"Rain\")'),
        conditionCode: zod
            .string()
            .describe('Machine-readable condition key (e.g. \"clear\", \"rain\", \"snow\", \"storm\", \"cloudy\", \"night\")'),
        icon: zod.string().describe("Weather icon code"),
        description: zod.string(),
        visibility: zod.number().describe("Visibility in km"),
        pressure: zod.number().describe("Atmospheric pressure in hPa"),
        dewPoint: zod.number().describe("Dew point in Celsius"),
        cloudCover: zod.number().describe("Cloud cover percentage"),
        sunrise: zod.number().describe("Sunrise Unix timestamp"),
        sunset: zod.number().describe("Sunset Unix timestamp"),
        isDay: zod.boolean().describe("Whether it is currently daytime"),
        aqiUs: zod
            .number()
            .nullish()
            .describe("US AQI value (null if unavailable)"),
        aqiLabel: zod
            .string()
            .nullish()
            .describe('AQI label e.g. \"Good\", \"Moderate\", \"Unhealthy\"'),
    }),
    hourly: zod.array(zod.object({
        time: zod.number().describe("Unix timestamp"),
        temperature: zod.number(),
        feelsLike: zod.number(),
        humidity: zod.number(),
        windSpeed: zod.number(),
        condition: zod.string(),
        conditionCode: zod.string(),
        icon: zod.string(),
        precipitationProbability: zod
            .number()
            .describe("Probability of precipitation (0-100)"),
        isDay: zod.boolean(),
    })),
    forecast: zod.array(zod.object({
        date: zod.number().describe("Unix timestamp for the day"),
        tempMax: zod.number().describe("Max temperature in Celsius"),
        tempMin: zod.number().describe("Min temperature in Celsius"),
        condition: zod.string(),
        conditionCode: zod.string(),
        icon: zod.string(),
        humidity: zod.number(),
        windSpeed: zod.number(),
        precipitationProbability: zod.number(),
        uvIndex: zod.number(),
        sunrise: zod.number(),
        sunset: zod.number(),
    })),
    alerts: zod.array(zod.object({
        event: zod
            .string()
            .describe('Alert event type (e.g. \"Thunderstorm Warning\")'),
        description: zod.string().describe("Detailed alert description"),
        start: zod.number().describe("Alert start Unix timestamp"),
        end: zod.number().describe("Alert end Unix timestamp"),
        severity: zod
            .string()
            .describe('Severity level (e.g. \"Moderate\", \"Extreme\")'),
        senderName: zod.string().nullish(),
    })),
    dailySummary: zod
        .string()
        .describe("Human-readable summary of the day's weather"),
    clothingAdvice: zod
        .string()
        .describe("What to wear today based on weather conditions"),
});
