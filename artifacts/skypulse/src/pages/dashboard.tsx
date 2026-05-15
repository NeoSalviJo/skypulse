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
    return (<main className="relative min-h-[100dvh] w-full overflow-x-hidden flex flex-col items-center">
      <AnimatedBackground conditionCode={conditionCode} timeOfDay={skyTime} dayPhase={dayPhase} windSpeedKmh={data?.current.windSpeed ?? 0}/>

      
      <AnimatePresence>
        {location && (<motion.header initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed top-4 left-4 right-4 md:left-auto md:right-auto md:w-full md:max-w-6xl z-50 glass-card-premium px-4 py-3 flex items-center justify-between mx-auto rounded-[1.25rem]">
            <div className="flex items-center gap-3">
              <CloudLightning className="w-6 h-6 text-primary shrink-0 drop-shadow-[0_0_14px_rgba(167,139,250,0.55)]"/>
              <span className="font-serif font-bold text-xl tracking-tight hidden md:inline-block">SkyPulse</span>
            </div>
            <div className="flex-1 max-w-sm mx-4">
              <SearchBar onSelectLocation={setLocation} isLoading={isLoading} variant="compact" currentLocationName={location?.name}/>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" onClick={toggleSound} className={`w-10 h-10 rounded-full transition-colors ${soundEnabled ? "text-primary bg-primary/10" : ""}`} title={soundEnabled ? "Mute ambient sounds" : "Enable ambient sounds"}>
                  {soundEnabled ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="w-9 h-9 rounded-full text-foreground/80" title="Volume & sound style" aria-label="Open ambient sound settings">
                      <SlidersHorizontal className="w-4 h-4"/>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={8} className="w-[min(22rem,calc(100vw-2rem))]">
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
                              className="h-auto min-h-9 px-2 py-1.5 text-left text-[11px] font-medium leading-tight whitespace-normal"
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
                            <Button key={key} type="button" variant={ambientCharacter === key ? "default" : "outline"} size="sm" className="h-8 px-1 text-[11px] font-medium" onClick={() => setAmbientCharacter(key)}>
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
              </div>
              <Button variant="ghost" size="icon" onClick={toggleUnit} className="w-10 h-10 rounded-full font-medium" data-testid="button-toggle-unit">
                {unit === "celsius" ? "°C" : "°F"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-10 h-10 rounded-full" data-testid="button-toggle-theme">
                {theme === "dark" ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
              </Button>
            </div>
          </motion.header>)}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-7xl p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-[100dvh]">

        
        <AnimatePresence mode="wait">
          {!location && (<motion.div key="hero" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="flex-1 flex flex-col items-center justify-center w-full min-h-[80vh] gap-12">
              <div className="text-center space-y-6">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="inline-flex items-center justify-center p-4 rounded-3xl glass-card mb-8">
                  <CloudLightning className="w-16 h-16 text-primary drop-shadow-lg"/>
                </motion.div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold tracking-tighter text-foreground drop-shadow-2xl">
                  SkyPulse
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 font-light max-w-2xl mx-auto">
                  Experience the atmosphere. Precise, luxurious, everywhere.
                </p>
              </div>

              {isAutoLocating ? (<div className="glass-card px-8 py-5 flex items-center gap-3 text-foreground/70">
                  <Loader2 className="w-5 h-5 animate-spin text-primary"/>
                  <span className="text-sm font-medium">Detecting your location…</span>
                </div>) : (<div className="w-full max-w-2xl">
                  <SearchBar onSelectLocation={setLocation} isLoading={isLoading} variant="hero"/>
                </div>)}

              <div className="absolute top-6 right-6 flex items-center gap-2 glass-card p-2">
                <Button variant="ghost" size="icon" onClick={toggleUnit} className="rounded-full font-medium w-10 h-10">
                  {unit === "celsius" ? "°C" : "°F"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full w-10 h-10">
                  {theme === "dark" ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                </Button>
              </div>
            </motion.div>)}

          
          {location && (<motion.div key={`dashboard-${location.id}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="w-full pt-24 pb-12">
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
