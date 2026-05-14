import type { WeatherSummary, WeatherAlert, DailyForecast } from "@workspace/api-client-react";
import { Cloud, Droplets, Eye, Thermometer, Wind, Sunrise, AlertTriangle, Compass, Quote, Shirt, CalendarDays, Activity, Sun, Leaf, Car, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useSettings } from "./settings-provider";
import { motion } from "framer-motion";
import type { DayPhase } from "@/lib/day-phase";
import { WeatherHeroVisual } from "@/components/weather-hero-visual";
import { AnimatedTemperature } from "@/components/animated-temperature";
import { HourlyForecastCinematic } from "@/components/hourly-forecast-cinematic";
import { buildSmartInsights, SmartInsightsList } from "@/components/smart-weather-insights";
import { WeatherRadarPanel } from "@/components/weather-radar-panel";
interface WeatherDashboardProps {
    data: WeatherSummary;
    dayPhase: DayPhase | null;
}
function calcActivityScore(current: WeatherSummary["current"], forecast: WeatherSummary["forecast"]) {
    let score = 100;
    const { temperature: temp, uvIndex: uv, windSpeed: wind, conditionCode: code } = current;
    const aqi = current.aqiUs ?? 50;
    const precip = forecast[0]?.precipitationProbability ?? 0;
    if (temp < 0)
        score -= 35;
    else if (temp < 5)
        score -= 20;
    else if (temp < 10)
        score -= 10;
    else if (temp > 38)
        score -= 30;
    else if (temp > 35)
        score -= 18;
    else if (temp > 32)
        score -= 8;
    if (uv > 10)
        score -= 20;
    else if (uv > 8)
        score -= 12;
    else if (uv > 6)
        score -= 5;
    if (aqi > 200)
        score -= 30;
    else if (aqi > 150)
        score -= 20;
    else if (aqi > 100)
        score -= 10;
    else if (aqi > 50)
        score -= 5;
    if (wind > 60)
        score -= 25;
    else if (wind > 40)
        score -= 15;
    else if (wind > 25)
        score -= 8;
    if (precip > 80)
        score -= 25;
    else if (precip > 60)
        score -= 15;
    else if (precip > 40)
        score -= 8;
    if (code === "storm")
        score -= 40;
    else if (code === "snow")
        score -= 18;
    else if (code === "rain")
        score -= 14;
    else if (code === "fog")
        score -= 8;
    score = Math.max(0, Math.min(100, Math.round(score)));
    const label = score >= 85 ? "Perfect" : score >= 70 ? "Great" : score >= 55 ? "Good" : score >= 40 ? "Fair" : score >= 25 ? "Poor" : "Bad";
    const color = score >= 85 ? "#10b981" : score >= 70 ? "#22c55e" : score >= 55 ? "#84cc16" : score >= 40 ? "#eab308" : score >= 25 ? "#f97316" : "#ef4444";
    const detail = score >= 85 ? "Excellent conditions for outdoor activities"
        : score >= 70 ? "Comfortable for most outdoor activities"
            : score >= 55 ? "Suitable for light outdoor activities"
                : score >= 40 ? "Consider indoor alternatives"
                    : score >= 25 ? "Not ideal for outdoor activities"
                        : "Stay indoors if possible";
    return { score, label, color, detail };
}
function getDrivingConditions(current: WeatherSummary["current"]) {
    const { conditionCode: code, visibility, windSpeed } = current;
    if (code === "storm")
        return { label: "Dangerous", desc: "Severe storm — avoid driving", color: "#ef4444" };
    if (code === "snow")
        return { label: "Hazardous", desc: "Icy roads, reduced traction", color: "#f97316" };
    if (visibility < 1)
        return { label: "Poor", desc: "Very low visibility — drive slowly", color: "#f97316" };
    if (code === "rain")
        return { label: "Moderate", desc: "Wet roads — increase following distance", color: "#eab308" };
    if (code === "fog")
        return { label: "Caution", desc: "Reduced visibility — use fog lights", color: "#eab308" };
    if (windSpeed > 60)
        return { label: "Caution", desc: "Strong crosswinds on open roads", color: "#eab308" };
    if (code === "cloudy")
        return { label: "Good", desc: "Normal driving conditions", color: "#22c55e" };
    return { label: "Excellent", desc: "Clear roads, great visibility", color: "#10b981" };
}
function getMoonPhase(): {
    name: string;
    emoji: string;
    percent: number;
} {
    const knownNew = new Date(2000, 0, 6).getTime();
    const cycle = 29.53058867;
    const days = (Date.now() - knownNew) / 86400000;
    const phase = ((days % cycle) + cycle) % cycle;
    const pct = phase / cycle;
    if (pct < 0.0625 || pct >= 0.9375)
        return { name: "New Moon", emoji: "🌑", percent: pct };
    if (pct < 0.1875)
        return { name: "Waxing Crescent", emoji: "🌒", percent: pct };
    if (pct < 0.3125)
        return { name: "First Quarter", emoji: "🌓", percent: pct };
    if (pct < 0.4375)
        return { name: "Waxing Gibbous", emoji: "🌔", percent: pct };
    if (pct < 0.5625)
        return { name: "Full Moon", emoji: "🌕", percent: pct };
    if (pct < 0.6875)
        return { name: "Waning Gibbous", emoji: "🌖", percent: pct };
    if (pct < 0.8125)
        return { name: "Last Quarter", emoji: "🌗", percent: pct };
    return { name: "Waning Crescent", emoji: "🌘", percent: pct };
}
const cardVariants = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [
                number,
                number,
                number,
                number
            ] },
    }),
};
function Card({ children, className = "", index = 0, float = false, premium = false }: {
    children: React.ReactNode;
    className?: string;
    index?: number;
    float?: boolean;
    premium?: boolean;
}) {
    return (<motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible" whileHover={float ? { y: -5, transition: { duration: 0.25, ease: "easeOut" } } : undefined} className={`${premium ? "glass-card-premium" : "glass-card"} glass-card-hover ${className}`}>
      {children}
    </motion.div>);
}
export function WeatherDashboard({ data, dayPhase }: WeatherDashboardProps) {
    const { current, hourly, forecast, alerts, dailySummary, clothingAdvice } = data;
    const { convertTemp, tempSuffix } = useSettings();
    const moon = getMoonPhase();
    const effectiveCondition = current.conditionCode === "cloudy" && (current.description === "fog" || current.description === "icy fog")
        ? "fog"
        : current.conditionCode;
    const getAqiColor = (aqi: number | null | undefined) => {
        if (!aqi)
            return "text-foreground/60";
        if (aqi <= 50)
            return "text-emerald-400";
        if (aqi <= 100)
            return "text-yellow-400";
        if (aqi <= 150)
            return "text-orange-400";
        if (aqi <= 200)
            return "text-red-400";
        return "text-purple-400";
    };
    const getUvColor = (uv: number) => {
        if (uv <= 2)
            return "bg-emerald-400";
        if (uv <= 5)
            return "bg-yellow-400";
        if (uv <= 7)
            return "bg-orange-400";
        if (uv <= 10)
            return "bg-red-400";
        return "bg-purple-400";
    };
    const getUvLabel = (uv: number) => {
        if (uv <= 2)
            return "Low";
        if (uv <= 5)
            return "Moderate";
        if (uv <= 7)
            return "High";
        if (uv <= 10)
            return "Very High";
        return "Extreme";
    };
    const now = Math.floor(Date.now() / 1000);
    let sunProgress = 0;
    if (now > current.sunset)
        sunProgress = 100;
    else if (now < current.sunrise)
        sunProgress = 0;
    else {
        const totalDaylight = current.sunset - current.sunrise;
        sunProgress = ((now - current.sunrise) / totalDaylight) * 100;
    }
    return (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

      
      <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">

        
        <Card index={0} premium className="p-8 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
          
          <motion.div animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.05, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)" }}/>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-1">{current.city}</h2>
              <p className="text-foreground/60 text-xl font-light">{current.country}</p>
            </div>
            <div className="text-left md:text-right bg-black/10 dark:bg-white/5 py-2 px-4 rounded-2xl backdrop-blur-md shrink-0">
              <p className="text-xl md:text-2xl font-medium">{format(new Date(), "EEEE, d MMM")}</p>
              <p className="text-foreground/60">{format(new Date(), "h:mm a")}</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between mt-10 gap-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div className="relative min-w-[9rem] md:min-w-[12rem]">
                <AnimatedTemperature value={Math.round(convertTemp(current.temperature))} suffix={tempSuffix} className="text-8xl md:text-[140px] font-sans font-bold tracking-tighter leading-none drop-shadow-[0_4px_48px_rgba(0,0,0,0.28)]" suffixClassName="text-4xl md:text-6xl absolute top-2 -right-8 md:-right-12"/>
              </div>
              <div className="flex flex-col gap-2 mt-2 md:mt-0 md:ml-2 lg:ml-6 items-center md:items-start">
                <WeatherHeroVisual conditionCode={effectiveCondition} iconCode={current.icon} description={current.description} isDay={current.isDay}/>
                <span className="text-3xl font-serif font-medium capitalize text-center md:text-left">
                  {current.description}
                </span>
                <div className="flex gap-4 text-foreground/60 mt-1 text-lg">
                  <span>H: {Math.round(convertTemp(forecast[0]?.tempMax || current.temperature))}°</span>
                  <span>L: {Math.round(convertTemp(forecast[0]?.tempMin || current.temperature))}°</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card index={1} float className="p-8 flex flex-col justify-center">
            <Quote className="w-7 h-7 text-primary/40 mb-4"/>
            <p className="text-xl font-serif font-medium italic leading-relaxed text-foreground/90">
              "{dailySummary}"
            </p>
          </Card>
          <Card index={2} float className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 rounded-2xl">
                <Shirt className="w-5 h-5 text-primary"/>
              </div>
              <h3 className="text-base font-semibold text-foreground/70 uppercase tracking-wider">Style Advice</h3>
            </div>
            <p className="text-lg font-light leading-relaxed text-foreground/90">{clothingAdvice}</p>
          </Card>
        </div>

        {(() => {
            const insights = buildSmartInsights(data, dayPhase);
            if (insights.length === 0)
                return null;
            return (<Card index={3} premium className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-primary shrink-0"/>
                <div>
                  <h3 className="text-lg font-serif font-semibold tracking-tight">Ambient intelligence</h3>
                  <p className="text-xs text-foreground/50 uppercase tracking-widest mt-0.5">Context-aware guidance</p>
                </div>
              </div>
              <SmartInsightsList items={insights}/>
            </Card>);
        })()}

        
        {(() => {
            const act = calcActivityScore(current, forecast);
            const drv = getDrivingConditions(current);
            const R = 40;
            const circ = 2 * Math.PI * R;
            const dash = (act.score / 100) * circ;
            return (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card index={4} float className="p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-primary/10 rounded-2xl">
                    <Leaf className="w-5 h-5 text-primary"/>
                  </div>
                  <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">Outdoor Activity</h3>
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative w-[100px] h-[100px] shrink-0">
                    <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                      <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
                      <motion.circle cx="50" cy="50" r={R} fill="none" stroke={act.color} strokeWidth="7" strokeLinecap="round" initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${dash} ${circ - dash}` }} transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [
                        number,
                        number,
                        number,
                        number
                    ] }}/>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold leading-none" style={{ color: act.color }}>{act.score}</span>
                      <span className="text-[10px] text-foreground/40 font-medium">/100</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-bold mb-1" style={{ color: act.color }}>{act.label}</p>
                    <p className="text-sm text-foreground/60 leading-relaxed">{act.detail}</p>
                  </div>
                </div>
              </Card>

              
              <Card index={5} float className="p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-primary/10 rounded-2xl">
                    <Car className="w-5 h-5 text-primary"/>
                  </div>
                  <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">Driving Conditions</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-3xl font-bold" style={{ color: drv.color }}>{drv.label}</p>
                  <p className="text-base text-foreground/70 leading-relaxed">{drv.desc}</p>
                  <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: drv.color }} initial={{ width: 0 }} animate={{ width: drv.label === "Excellent" ? "100%" : drv.label === "Good" ? "80%" : drv.label === "Caution" ? "55%" : drv.label === "Moderate" ? "45%" : drv.label === "Poor" ? "28%" : "12%" }} transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [
                        number,
                        number,
                        number,
                        number
                    ] }}/>
                  </div>
                </div>
              </Card>
            </div>);
        })()}

        
        <Card index={6} premium className="p-6 md:p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-semibold flex items-center gap-3 text-foreground/90">
              <Cloud className="w-5 h-5 text-primary"/> Hourly timeline
            </h3>
          </div>
          <HourlyForecastCinematic hourly={hourly} convertTemp={convertTemp} tempSuffix={tempSuffix}/>
        </Card>
      </div>

      
      <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">

        
        {alerts && alerts.length > 0 && (<Card index={0} className="p-6 !border-red-500/30 !bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.12)]">
            <h3 className="text-base font-serif font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4"/> Active Alerts
            </h3>
            <div className="space-y-3">
              {alerts.map((alert: WeatherAlert, i: number) => (<div key={i} className="bg-red-500/8 p-4 rounded-2xl border border-red-500/10">
                  <p className="font-semibold text-red-300 text-sm">{alert.event}</p>
                  <p className="text-xs text-red-200/60 mt-1.5 line-clamp-3">{alert.description}</p>
                </div>))}
            </div>
          </Card>)}

        
        <div className="grid grid-cols-2 gap-4">
          {[
            {
                icon: <Thermometer className="w-4 h-4"/>,
                label: "Feels Like",
                value: `${Math.round(convertTemp(current.feelsLike))}°`,
                sub: "Similar to actual",
                idx: 1,
            },
            {
                icon: <Wind className="w-4 h-4"/>,
                label: "Wind",
                value: `${current.windSpeed}`,
                sub: <span className="text-sm font-normal">km/h</span>,
                footer: <WindDirection deg={current.windDirection}/>,
                idx: 2,
            },
            {
                icon: <Droplets className="w-4 h-4"/>,
                label: "Humidity",
                value: `${current.humidity}%`,
                sub: `Dew ${Math.round(convertTemp(current.dewPoint))}°`,
                idx: 3,
            },
            {
                icon: <Activity className="w-4 h-4"/>,
                label: "Air Quality",
                value: current.aqiUs?.toString() || "--",
                sub: <span className={getAqiColor(current.aqiUs)}>{current.aqiLabel || "Unknown"}</span>,
                idx: 4,
            },
            {
                icon: <Eye className="w-4 h-4"/>,
                label: "Visibility",
                value: `${current.visibility}`,
                sub: "km",
                idx: 5,
            },
            {
                icon: <Sun className="w-4 h-4"/>,
                label: "UV Index",
                value: `${current.uvIndex}`,
                sub: getUvLabel(current.uvIndex),
                footer: (<div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full rounded-full ${getUvColor(current.uvIndex)}`} style={{ width: `${Math.min((current.uvIndex / 11) * 100, 100)}%` }}/>
                </div>),
                idx: 6,
            },
        ].map(({ icon, label, value, sub, footer, idx }) => (<DetailCard key={label} icon={icon} label={label} value={value} subValue={sub} footer={footer} index={idx}/>))}
        </div>

        <WeatherRadarPanel cityName={current.city}/>

        
        <Card index={7} float className="p-6">
          <h3 className="text-base font-serif font-semibold text-foreground/70 mb-5 flex items-center gap-2">
            <Sunrise className="w-4 h-4 text-primary"/> Sun & Moon
          </h3>

          
          <div className="relative pt-8 pb-2 px-2">
            <div className="absolute top-0 left-0 w-full h-16 overflow-hidden">
              <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible" fill="none">
                <path d="M 5 50 Q 50 -10 95 50" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 2" fill="none"/>
                <circle cx="5" cy="50" r="2" fill="currentColor" opacity="0.3"/>
                <circle cx="95" cy="50" r="2" fill="currentColor" opacity="0.3"/>
                <g style={{
            transform: `translate(${5 + (sunProgress / 100) * 90}%, ${50 - Math.sin((sunProgress / 100) * Math.PI) * 40}px)`
        }}>
                  <circle cx="0" cy="0" r="5" fill="#FBBF24" filter="url(#glow)"/>
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                </g>
              </svg>
            </div>
            <div className="flex justify-between items-end mt-12">
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-sm">{format(new Date(current.sunrise * 1000), "h:mm a")}</span>
                <span className="text-xs text-foreground/40 uppercase tracking-wider">Sunrise</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-sm">{format(new Date(current.sunset * 1000), "h:mm a")}</span>
                <span className="text-xs text-foreground/40 uppercase tracking-wider">Sunset</span>
              </div>
            </div>
          </div>

          
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/[0.08]">
            <span className="text-4xl leading-none">{moon.emoji}</span>
            <div>
              <p className="font-semibold text-sm">{moon.name}</p>
              <p className="text-xs text-foreground/40 mt-0.5">
                {Math.round(moon.percent * 100)}% through lunar cycle
              </p>
            </div>
          </div>
        </Card>

        
        <Card index={8} className="p-6 flex-1 flex flex-col">
          <h3 className="text-base font-serif font-semibold text-foreground/70 mb-5 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary"/> 7-Day Forecast
          </h3>
          <div className="flex flex-col gap-4 flex-1 justify-between">
            {forecast.map((day: DailyForecast, i: number) => {
                const maxRange = Math.max(...forecast.map((d: DailyForecast) => convertTemp(d.tempMax)));
                const minRange = Math.min(...forecast.map((d: DailyForecast) => convertTemp(d.tempMin)));
                const range = Math.max(maxRange - minRange, 1);
                const dayMin = convertTemp(day.tempMin);
                const dayMax = convertTemp(day.tempMax);
                const left = ((dayMin - minRange) / range) * 100;
                const width = Math.max(((dayMax - dayMin) / range) * 100, 5);
                return (<motion.div key={i} whileHover={{ x: 3 }} transition={{ duration: 0.18 }} className="flex items-center justify-between group">
                  <span className="w-14 font-medium text-sm text-foreground/70 group-hover:text-foreground transition-colors">
                    {i === 0 ? "Today" : format(new Date(day.date * 1000), "EEE")}
                  </span>
                  <div className="flex items-center justify-center w-16 gap-1">
                    <img src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt={day.condition} className="w-9 h-9"/>
                    <span className="text-xs font-medium text-blue-400/70 w-7 text-left">
                      {day.precipitationProbability > 20 ? `${day.precipitationProbability}%` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 ml-2">
                    <span className="text-xs font-medium w-7 text-right text-foreground/50">{Math.round(dayMin)}°</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                      <div className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400" style={{ left: `${left}%`, width: `${width}%` }}/>
                    </div>
                    <span className="text-xs font-bold w-7 text-left">{Math.round(dayMax)}°</span>
                  </div>
                </motion.div>);
            })}
          </div>
        </Card>
      </div>
    </div>);
}
function DetailCard({ icon, label, value, subValue, footer, index = 0, }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: React.ReactNode;
    footer?: React.ReactNode;
    index?: number;
}) {
    return (<motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -4, transition: { duration: 0.2 } }} className="glass-card glass-card-hover p-5 flex flex-col justify-between h-40 cursor-default">
      <div className="flex items-center gap-2 text-foreground/50 font-medium">
        <span className="text-primary/70">{icon}</span>
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight flex items-baseline gap-1">{value}</div>
        {subValue && <div className="text-xs font-medium text-foreground/60 mt-1">{subValue}</div>}
      </div>
      {footer && <div className="mt-1 text-sm">{footer}</div>}
    </motion.div>);
}
function WindDirection({ deg }: {
    deg: number;
}) {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const dir = dirs[Math.round(deg / 45) % 8];
    return (<div className="flex items-center gap-2 text-foreground/60 font-medium text-xs">
      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
        <Compass className="w-3 h-3 text-primary" style={{ transform: `rotate(${deg}deg)` }}/>
      </div>
      <span>{dir}</span>
    </div>);
}
