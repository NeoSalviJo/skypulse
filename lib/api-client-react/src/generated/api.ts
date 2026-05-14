import { useQuery } from "@tanstack/react-query";
import type { QueryFunction, QueryKey, UseQueryOptions, UseQueryResult, } from "@tanstack/react-query";
import type { AlertsResponse, ApiError, CurrentWeather, ForecastResponse, GeocodeResponse, GeocodeSearchParams, GetCurrentWeatherParams, GetForecastParams, GetHourlyForecastParams, GetWeatherAlertsParams, GetWeatherSummaryParams, HealthStatus, HourlyResponse, WeatherSummary, } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export const getHealthCheckUrl = () => {
    return `/api/healthz`;
};
export const healthCheck = async (options?: RequestInit): Promise<HealthStatus> => {
    return customFetch<HealthStatus>(getHealthCheckUrl(), {
        ...options,
        method: "GET",
    });
};
export const getHealthCheckQueryKey = () => {
    return [`/api/healthz`] as const;
};
export const getHealthCheckQueryOptions = <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>,>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => {
    const { query: queryOptions, request: requestOptions } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();
    const queryFn: QueryFunction<Awaited<ReturnType<typeof healthCheck>>> = ({ signal, }) => healthCheck({ signal, ...requestOptions });
    return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
        queryKey: QueryKey;
    };
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
export function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
} {
    const queryOptions = getHealthCheckQueryOptions(options);
    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };
    return { ...query, queryKey: queryOptions.queryKey };
}
export const getGeocodeSearchUrl = (params: GeocodeSearchParams) => {
    const normalizedParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? "null" : value.toString());
        }
    });
    const stringifiedParams = normalizedParams.toString();
    return stringifiedParams.length > 0
        ? `/api/weather/geocode?${stringifiedParams}`
        : `/api/weather/geocode`;
};
export const geocodeSearch = async (params: GeocodeSearchParams, options?: RequestInit): Promise<GeocodeResponse> => {
    return customFetch<GeocodeResponse>(getGeocodeSearchUrl(params), {
        ...options,
        method: "GET",
    });
};
export const getGeocodeSearchQueryKey = (params?: GeocodeSearchParams) => {
    return [`/api/weather/geocode`, ...(params ? [params] : [])] as const;
};
export const getGeocodeSearchQueryOptions = <TData = Awaited<ReturnType<typeof geocodeSearch>>, TError = ErrorType<ApiError>,>(params: GeocodeSearchParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof geocodeSearch>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => {
    const { query: queryOptions, request: requestOptions } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? getGeocodeSearchQueryKey(params);
    const queryFn: QueryFunction<Awaited<ReturnType<typeof geocodeSearch>>> = ({ signal, }) => geocodeSearch(params, { signal, ...requestOptions });
    return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof geocodeSearch>>, TError, TData> & {
        queryKey: QueryKey;
    };
};
export type GeocodeSearchQueryResult = NonNullable<Awaited<ReturnType<typeof geocodeSearch>>>;
export type GeocodeSearchQueryError = ErrorType<ApiError>;
export function useGeocodeSearch<TData = Awaited<ReturnType<typeof geocodeSearch>>, TError = ErrorType<ApiError>>(params: GeocodeSearchParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof geocodeSearch>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
} {
    const queryOptions = getGeocodeSearchQueryOptions(params, options);
    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };
    return { ...query, queryKey: queryOptions.queryKey };
}
export const getGetCurrentWeatherUrl = (params: GetCurrentWeatherParams) => {
    const normalizedParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? "null" : value.toString());
        }
    });
    const stringifiedParams = normalizedParams.toString();
    return stringifiedParams.length > 0
        ? `/api/weather/current?${stringifiedParams}`
        : `/api/weather/current`;
};
export const getCurrentWeather = async (params: GetCurrentWeatherParams, options?: RequestInit): Promise<CurrentWeather> => {
    return customFetch<CurrentWeather>(getGetCurrentWeatherUrl(params), {
        ...options,
        method: "GET",
    });
};
export const getGetCurrentWeatherQueryKey = (params?: GetCurrentWeatherParams) => {
    return [`/api/weather/current`, ...(params ? [params] : [])] as const;
};
export const getGetCurrentWeatherQueryOptions = <TData = Awaited<ReturnType<typeof getCurrentWeather>>, TError = ErrorType<ApiError>,>(params: GetCurrentWeatherParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentWeather>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => {
    const { query: queryOptions, request: requestOptions } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? getGetCurrentWeatherQueryKey(params);
    const queryFn: QueryFunction<Awaited<ReturnType<typeof getCurrentWeather>>> = ({ signal }) => getCurrentWeather(params, { signal, ...requestOptions });
    return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getCurrentWeather>>, TError, TData> & {
        queryKey: QueryKey;
    };
};
export type GetCurrentWeatherQueryResult = NonNullable<Awaited<ReturnType<typeof getCurrentWeather>>>;
export type GetCurrentWeatherQueryError = ErrorType<ApiError>;
export function useGetCurrentWeather<TData = Awaited<ReturnType<typeof getCurrentWeather>>, TError = ErrorType<ApiError>>(params: GetCurrentWeatherParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentWeather>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
} {
    const queryOptions = getGetCurrentWeatherQueryOptions(params, options);
    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };
    return { ...query, queryKey: queryOptions.queryKey };
}
export const getGetForecastUrl = (params: GetForecastParams) => {
    const normalizedParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? "null" : value.toString());
        }
    });
    const stringifiedParams = normalizedParams.toString();
    return stringifiedParams.length > 0
        ? `/api/weather/forecast?${stringifiedParams}`
        : `/api/weather/forecast`;
};
export const getForecast = async (params: GetForecastParams, options?: RequestInit): Promise<ForecastResponse> => {
    return customFetch<ForecastResponse>(getGetForecastUrl(params), {
        ...options,
        method: "GET",
    });
};
export const getGetForecastQueryKey = (params?: GetForecastParams) => {
    return [`/api/weather/forecast`, ...(params ? [params] : [])] as const;
};
export const getGetForecastQueryOptions = <TData = Awaited<ReturnType<typeof getForecast>>, TError = ErrorType<ApiError>,>(params: GetForecastParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getForecast>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => {
    const { query: queryOptions, request: requestOptions } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? getGetForecastQueryKey(params);
    const queryFn: QueryFunction<Awaited<ReturnType<typeof getForecast>>> = ({ signal, }) => getForecast(params, { signal, ...requestOptions });
    return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getForecast>>, TError, TData> & {
        queryKey: QueryKey;
    };
};
export type GetForecastQueryResult = NonNullable<Awaited<ReturnType<typeof getForecast>>>;
export type GetForecastQueryError = ErrorType<ApiError>;
export function useGetForecast<TData = Awaited<ReturnType<typeof getForecast>>, TError = ErrorType<ApiError>>(params: GetForecastParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getForecast>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
} {
    const queryOptions = getGetForecastQueryOptions(params, options);
    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };
    return { ...query, queryKey: queryOptions.queryKey };
}
export const getGetHourlyForecastUrl = (params: GetHourlyForecastParams) => {
    const normalizedParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? "null" : value.toString());
        }
    });
    const stringifiedParams = normalizedParams.toString();
    return stringifiedParams.length > 0
        ? `/api/weather/hourly?${stringifiedParams}`
        : `/api/weather/hourly`;
};
export const getHourlyForecast = async (params: GetHourlyForecastParams, options?: RequestInit): Promise<HourlyResponse> => {
    return customFetch<HourlyResponse>(getGetHourlyForecastUrl(params), {
        ...options,
        method: "GET",
    });
};
export const getGetHourlyForecastQueryKey = (params?: GetHourlyForecastParams) => {
    return [`/api/weather/hourly`, ...(params ? [params] : [])] as const;
};
export const getGetHourlyForecastQueryOptions = <TData = Awaited<ReturnType<typeof getHourlyForecast>>, TError = ErrorType<ApiError>,>(params: GetHourlyForecastParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHourlyForecast>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => {
    const { query: queryOptions, request: requestOptions } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? getGetHourlyForecastQueryKey(params);
    const queryFn: QueryFunction<Awaited<ReturnType<typeof getHourlyForecast>>> = ({ signal }) => getHourlyForecast(params, { signal, ...requestOptions });
    return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getHourlyForecast>>, TError, TData> & {
        queryKey: QueryKey;
    };
};
export type GetHourlyForecastQueryResult = NonNullable<Awaited<ReturnType<typeof getHourlyForecast>>>;
export type GetHourlyForecastQueryError = ErrorType<ApiError>;
export function useGetHourlyForecast<TData = Awaited<ReturnType<typeof getHourlyForecast>>, TError = ErrorType<ApiError>>(params: GetHourlyForecastParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHourlyForecast>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
} {
    const queryOptions = getGetHourlyForecastQueryOptions(params, options);
    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };
    return { ...query, queryKey: queryOptions.queryKey };
}
export const getGetWeatherAlertsUrl = (params: GetWeatherAlertsParams) => {
    const normalizedParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? "null" : value.toString());
        }
    });
    const stringifiedParams = normalizedParams.toString();
    return stringifiedParams.length > 0
        ? `/api/weather/alerts?${stringifiedParams}`
        : `/api/weather/alerts`;
};
export const getWeatherAlerts = async (params: GetWeatherAlertsParams, options?: RequestInit): Promise<AlertsResponse> => {
    return customFetch<AlertsResponse>(getGetWeatherAlertsUrl(params), {
        ...options,
        method: "GET",
    });
};
export const getGetWeatherAlertsQueryKey = (params?: GetWeatherAlertsParams) => {
    return [`/api/weather/alerts`, ...(params ? [params] : [])] as const;
};
export const getGetWeatherAlertsQueryOptions = <TData = Awaited<ReturnType<typeof getWeatherAlerts>>, TError = ErrorType<ApiError>,>(params: GetWeatherAlertsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeatherAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => {
    const { query: queryOptions, request: requestOptions } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? getGetWeatherAlertsQueryKey(params);
    const queryFn: QueryFunction<Awaited<ReturnType<typeof getWeatherAlerts>>> = ({ signal }) => getWeatherAlerts(params, { signal, ...requestOptions });
    return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getWeatherAlerts>>, TError, TData> & {
        queryKey: QueryKey;
    };
};
export type GetWeatherAlertsQueryResult = NonNullable<Awaited<ReturnType<typeof getWeatherAlerts>>>;
export type GetWeatherAlertsQueryError = ErrorType<ApiError>;
export function useGetWeatherAlerts<TData = Awaited<ReturnType<typeof getWeatherAlerts>>, TError = ErrorType<ApiError>>(params: GetWeatherAlertsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeatherAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
} {
    const queryOptions = getGetWeatherAlertsQueryOptions(params, options);
    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };
    return { ...query, queryKey: queryOptions.queryKey };
}
export const getGetWeatherSummaryUrl = (params: GetWeatherSummaryParams) => {
    const normalizedParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? "null" : value.toString());
        }
    });
    const stringifiedParams = normalizedParams.toString();
    return stringifiedParams.length > 0
        ? `/api/weather/summary?${stringifiedParams}`
        : `/api/weather/summary`;
};
export const getWeatherSummary = async (params: GetWeatherSummaryParams, options?: RequestInit): Promise<WeatherSummary> => {
    return customFetch<WeatherSummary>(getGetWeatherSummaryUrl(params), {
        ...options,
        method: "GET",
    });
};
export const getGetWeatherSummaryQueryKey = (params?: GetWeatherSummaryParams) => {
    return [`/api/weather/summary`, ...(params ? [params] : [])] as const;
};
export const getGetWeatherSummaryQueryOptions = <TData = Awaited<ReturnType<typeof getWeatherSummary>>, TError = ErrorType<ApiError>,>(params: GetWeatherSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeatherSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => {
    const { query: queryOptions, request: requestOptions } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? getGetWeatherSummaryQueryKey(params);
    const queryFn: QueryFunction<Awaited<ReturnType<typeof getWeatherSummary>>> = ({ signal }) => getWeatherSummary(params, { signal, ...requestOptions });
    return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getWeatherSummary>>, TError, TData> & {
        queryKey: QueryKey;
    };
};
export type GetWeatherSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getWeatherSummary>>>;
export type GetWeatherSummaryQueryError = ErrorType<ApiError>;
export function useGetWeatherSummary<TData = Awaited<ReturnType<typeof getWeatherSummary>>, TError = ErrorType<ApiError>>(params: GetWeatherSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeatherSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
} {
    const queryOptions = getGetWeatherSummaryQueryOptions(params, options);
    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };
    return { ...query, queryKey: queryOptions.queryKey };
}
