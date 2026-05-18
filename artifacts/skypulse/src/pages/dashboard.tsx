import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	geocodeSearch,
	getGetWeatherSummaryQueryKey,
	getWeatherSummary,
} from "@workspace/api-client-react";
import type { GeocodeSuggestion, WeatherSummary } from "@workspace/api-client-react";
import { fetchWeatherSummaryDirect } from "@/lib/client-weather-summary";
import { SearchBar } from "@/components/search-bar";
import { AnimatedBackground } from "@/components/animated-background";
import type { TimeOfDay } from "@/components/animated-background";
import { WeatherDashboard } from "@/components/weather-dashboard";
import { useTheme } from "@/components/theme-provider";
import { useSettings, AMBIENT_SOUND_LABELS, AMBIENT_PRESET_LABELS, type AmbientSoundPreset } from "@/components/settings-provider";
import { useWeatherAudio } from "@/hooks/use-weather-audio";
import { getDayPhase, dayPhaseToSkyPeriod } from "@/lib/day-phase";
import type { DayPhase } from "@/lib/day-phase";
import { Moon, Sun, CloudLightning, MapPin, Loader2, Volume2, VolumeX, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
function isWeatherSummary(x: unknown): x is WeatherSummary {
    return (typeof x === "object" && x !== null && "current" in x &&
        typeof (x as WeatherSummary).current === "object" && (x as WeatherSummary).current !== null);
}
/** JSON/API occasionally yields numeric coordinates as strings; direct Open-Meteo needs real numbers. */
function parseCoord(v: unknown): number | undefined {
    if (typeof v === "number" && Number.isFinite(v))
        return v;
    if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        if (Number.isFinite(n))
            return n;
    }
    return undefined;
}
function getTimeOfDay(): TimeOfDay {
    const h = new Date().getHours();
    if (h >= 5 && h < 11)
        return "morning";
    if (h >= 11 && h < 17)
        return "afternoon";
    if (h >= 17 && h < 21)
        return "evening";
    return "night";
}
export default function Dashboard() {
    const [location, setLocation] = useState<GeocodeSuggestion | null>(null);
    const [isAutoLocating, setIsAutoLocating] = useState(false);
    const [tick, setTick] = useState(0);
    const { theme, setTheme } = useTheme();
    const {
        unit,
        toggleUnit,
        ambientVolume,
        setAmbientVolume,
        ambientCharacter,
        setAmbientCharacter,
        ambientPreset,
        setAmbientPreset,
    } = useSettings();

    const ambientPresetOrder: AmbientSoundPreset[] = ["auto", "rain", "thunderstorm", "wind", "snow", "cloudy", "calm", "night"];
    useEffect(() => {
        const id = setInterval(() => setTick((n) => n + 1), 60000);
        return () => clearInterval(id);
    }, []);
    useEffect(() => {
        if (!navigator.geolocation)
            return;
        setIsAutoLocating(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const res = await geocodeSearch({
                    q: `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`,
                });
                if (res.results?.[0]) {
                    setLocation(res.results[0]);
                }
            }
            catch {
            }
            finally {
                setIsAutoLocating(false);
            }
        }, () => setIsAutoLocating(false), { timeout: 6000, maximumAge: 300000 });
    }, []);
    const summaryParams = useMemo(() => {
        if (!location)
            return { city: "" as const };
        const lat = parseCoord(location.lat);
        const lon = parseCoord(location.lon);
        return {
            city: location.name,
            lat,
            lon,
            country: location.country,
            timezone: location.timezone,
        };
    }, [location]);
    const { data, isLoading, error } = useQuery({
        queryKey: getGetWeatherSummaryQueryKey(summaryParams),
        queryFn: async ({ signal }) => {
            const p = summaryParams;
            const lat = parseCoord(p.lat);
            const lon = parseCoord(p.lon);
            const hasCoords = lat !== undefined && lon !== undefined;
            const withCoords = hasCoords ? { ...p, lat, lon } : p;
            if (hasCoords) {
                try {
                    return await fetchWeatherSummaryDirect(withCoords);
                }
                catch (e) {
                    if (signal.aborted)
                        throw e;
                    try {
                        const apiRes = await getWeatherSummary(withCoords, { signal });
                        if (isWeatherSummary(apiRes))
                            return apiRes;
                    }
                    catch {
                    }
                    throw e instanceof Error ? e : new Error(String(e));
                }
            }
            const apiRes = await getWeatherSummary(p, { signal });
            if (isWeatherSummary(apiRes))
                return apiRes;
            throw new Error("Invalid weather response");
        },
        enabled: !!location,
        retry: false,
    });
    const rawConditionCode = data?.current?.conditionCode ?? "";
    const description = data?.current?.description ?? "";
    const conditionCode = rawConditionCode === "cloudy" && (description === "fog" || description === "icy fog")
        ? "fog"
        : rawConditionCode;
    const dayPhase: DayPhase | null = useMemo(() => {
        if (!data?.current)
            return null;
        return getDayPhase(Math.floor(Date.now() / 1000), data.current.sunrise, data.current.sunset);
    }, [data, tick]);
    const skyTime: TimeOfDay = useMemo(() => (dayPhase ? dayPhaseToSkyPeriod(dayPhase) : getTimeOfDay()), [dayPhase, tick]);
    const { isEnabled: soundEnabled, toggle: toggleSound } = useWeatherAudio(conditionCode, data?.current.windSpeed ?? 0, {
        volume: ambientVolume,
        character: ambientCharacter,
        preset: ambientPreset,
    });
    return (<main className="relative isolate min-h-[100dvh] w-full overflow-x-hidden flex flex-col items-center supports-[backdrop-filter]:bg-transparent">
      <AnimatedBackground conditionCode={conditionCode} timeOfDay={skyTime} dayPhase={dayPhase} windSpeedKmh={data?.current.windSpeed ?? 0}/>

      
      <AnimatePresence>
        {location && (<motion.header
            layout={false}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-50 glass-card-premium px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl sm:rounded-[1.25rem]
              top-[max(0.5rem,env(safe-area-inset-top,0px))]
              left-[max(0.5rem,env(safe-area-inset-left,0px))]
              right-[max(0.5rem,env(safe-area-inset-right,0px))]
              md:left-auto md:right-auto md:w-full md:max-w-6xl md:mx-auto
              flex flex-wrap md:flex-nowrap items-center gap-x-2 gap-y-2 sm:gap-x-3 md:justify-between md:gap-4"
          >
            <div className="flex items-center gap-2 shrink-0 order-1">
              <CloudLightning className="w-[1.375rem] h-[1.375rem] sm:w-6 sm:h-6 text-primary shrink-0 drop-shadow-[0_0_14px_rgba(167,139,250,0.55)]"/>
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight hidden md:inline-block truncate max-w-[10rem]">SkyPulse</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto order-2 md:order-3 md:ml-0 [&_button]:touch-manipulation">
              <Button variant="ghost" size="icon" onClick={toggleSound} className={`size-10 sm:size-11 rounded-full transition-colors shrink-0 ${soundEnabled ? "text-primary bg-primary/10" : ""}`} title={soundEnabled ? "Mute ambient sounds" : "Enable ambient sounds"}>
                {soundEnabled ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-10 sm:size-11 rounded-full text-foreground/80 shrink-0 touch-manipulation" title="Volume & sound style" aria-label="Open ambient sound settings">
                    <SlidersHorizontal className="w-4 h-4"/>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={8}
                  collisionPadding={16}
                  className="w-[min(22rem,calc(100vw-1.75rem-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)))] max-h-[min(28rem,calc(100dvh-4rem))] overflow-y-auto"
                >
                  <p className="text-sm font-semibold">Ambient sound</p>
                  <p className="text-xs text-foreground/55 mt-0.5 mb-4 leading-relaxed">
                    Pick a mood or leave it on Auto to follow live conditions. Use the speaker to mute.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium mb-2">Sound type</p>
                      <div className="grid grid-cols-2 gap-1.5">
                          {ambientPresetOrder.map((key) => (
                            <Button
                              key={key}
                              type="button"
                              variant={ambientPreset === key ? "default" : "outline"}
                              size="sm"
                              className="h-auto min-h-11 px-2 py-2 text-left text-[11px] font-medium leading-tight whitespace-normal touch-manipulation"
                              onClick={() => setAmbientPreset(key)}
                            >
                              {AMBIENT_PRESET_LABELS[key].title}
                            </Button>
                          ))}
                      </div>
                      <p className="text-[11px] text-foreground/50 mt-2 leading-snug">
                        {AMBIENT_PRESET_LABELS[ambientPreset].description}
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-2">
                        <span>Volume</span>
                        <span className="tabular-nums text-foreground/60">{Math.round(ambientVolume * 100)}%</span>
                      </div>
                      <Slider value={[ambientVolume]} onValueChange={(v) => setAmbientVolume(v[0] ?? 0)} min={0} max={1} step={0.02}/>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-2">Sound style</p>
                      <div className="grid grid-cols-3 gap-1.5">
                          {(["soft", "balanced", "immersive"] as const).map((key) => (
                            <Button key={key} type="button" variant={ambientCharacter === key ? "default" : "outline"} size="sm" className="h-11 px-1 text-[11px] font-medium touch-manipulation" onClick={() => setAmbientCharacter(key)}>
                              {AMBIENT_SOUND_LABELS[key].title}
                            </Button>
                          ))}
                      </div>
                      <p className="text-[11px] text-foreground/50 mt-2.5 leading-snug">
                        {AMBIENT_SOUND_LABELS[ambientCharacter].description}
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" onClick={toggleUnit} className="size-10 sm:size-11 rounded-full font-medium shrink-0 touch-manipulation" data-testid="button-toggle-unit">
                {unit === "celsius" ? "°C" : "°F"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="size-10 sm:size-11 rounded-full shrink-0 touch-manipulation" data-testid="button-toggle-theme">
                {theme === "dark" ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
              </Button>
            </div>
            <div className="w-full basis-full min-w-0 order-3 md:order-2 md:flex-1 md:basis-0 md:max-w-xl lg:max-w-lg md:mx-2 lg:mx-4">
              <SearchBar onSelectLocation={setLocation} isLoading={isLoading} variant="compact" currentLocationName={location?.name}/>
            </div>
          </motion.header>)}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-7xl p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-[100dvh]">

        
        <AnimatePresence mode="wait">
          {!location && (<motion.div key="hero" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative flex-1 flex flex-col items-center justify-center w-full min-h-[80dvh] sm:min-h-[80vh] gap-10 sm:gap-12 px-3 sm:px-4">
              <div className="text-center space-y-4 sm:space-y-6 px-1 max-w-full">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="inline-flex items-center justify-center p-4 rounded-3xl glass-card mb-4 sm:mb-8">
                  <CloudLightning className="size-14 sm:size-16 text-primary drop-shadow-lg shrink-0"/>
                </motion.div>
                <h1 className="skypulse-atmosphere-title text-[clamp(2.125rem,8.5vw,4.25rem)] sm:text-6xl md:text-8xl lg:text-9xl font-serif font-bold tracking-tighter text-foreground break-words px-1">
                  SkyPulse
                </h1>
                <p className="skypulse-atmosphere-subtitle text-lg sm:text-xl md:text-2xl text-foreground font-light max-w-2xl mx-auto leading-snug px-2">
                  Experience the atmosphere. Precise, luxurious, everywhere.
                </p>
              </div>

              {isAutoLocating ? (<div className="glass-card px-6 sm:px-8 py-4 sm:py-5 flex items-center gap-3 text-foreground/70 max-w-[calc(100%-1rem)]">
                  <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0"/>
                  <span className="text-sm font-medium">Detecting your location…</span>
                </div>) : (<div className="w-full max-w-2xl min-w-0 px-2">
                  <SearchBar onSelectLocation={setLocation} isLoading={isLoading} variant="hero"/>
                </div>)}

              <div className="fixed sm:absolute top-[max(1rem,env(safe-area-inset-top,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-[60] flex items-center gap-2 glass-card p-2 rounded-2xl touch-manipulation [&_button]:touch-manipulation">
                <Button variant="ghost" size="icon" onClick={toggleUnit} className="rounded-full font-medium min-h-10 min-w-10">
                  {unit === "celsius" ? "°C" : "°F"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full min-h-10 min-w-10">
                  {theme === "dark" ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                </Button>
              </div>
            </motion.div>)}

          
          {location && (<motion.div key={`dashboard-${location.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }} className="w-full pt-[7.9rem] sm:pt-[7.65rem] md:pt-24 pb-12">
              {error ? (<div className="glass-card p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-4 mt-20">
                  <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
                    <MapPin className="w-10 h-10"/>
                  </div>
                  <h3 className="text-2xl font-serif font-bold">Location Not Found</h3>
                  <p className="text-foreground/70">We couldn't fetch weather for this location. Please try a different search.</p>
                  <Button onClick={() => setLocation(null)} variant="outline" className="mt-4 rounded-xl">Return Home</Button>
                </div>) : isLoading ? (<DashboardSkeleton />) : data ? (<WeatherDashboard data={data} dayPhase={dayPhase}/>) : null}
            </motion.div>)}
        </AnimatePresence>

      </div>
    </main>);
}
function DashboardSkeleton() {
    return (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
        <div className="glass-card skeleton-shimmer h-[400px] rounded-3xl"/>
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card skeleton-shimmer h-[160px] rounded-3xl"/>
          <div className="glass-card skeleton-shimmer h-[160px] rounded-3xl"/>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card skeleton-shimmer h-[150px] rounded-3xl"/>
          <div className="glass-card skeleton-shimmer h-[150px] rounded-3xl"/>
        </div>
        <div className="glass-card skeleton-shimmer h-[180px] rounded-3xl"/>
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (<div key={i} className="glass-card skeleton-shimmer h-40 rounded-3xl"/>))}
        </div>
        <div className="glass-card skeleton-shimmer h-[200px] rounded-3xl"/>
        <div className="glass-card skeleton-shimmer flex-1 min-h-[320px] rounded-3xl"/>
      </div>
    </div>);
}
