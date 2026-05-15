import type { WeatherSummary } from "@workspace/api-client-react";
import { Camera, Dumbbell, Car, Droplets, Moon, Sun, Wind, Activity, ShieldAlert, } from "lucide-react";
import { motion } from "framer-motion";
import { differenceInMinutes } from "date-fns";
import type { DayPhase } from "@/lib/day-phase";
export interface InsightItem {
    id: string;
    icon: React.ReactNode;
    title: string;
    body: string;
}
function minutesUntil(targetSec: number): number {
    return differenceInMinutes(new Date(targetSec * 1000), new Date());
}
export function buildSmartInsights(data: WeatherSummary, dayPhase: DayPhase | null): InsightItem[] {
    const { current, forecast } = data;
    const items: InsightItem[] = [];
    const goldenSoon = dayPhase === "golden-hour" ||
        (minutesUntil(current.sunset) > 0 && minutesUntil(current.sunset) <= 60 && current.isDay);
    if (goldenSoon && ["clear", "cloudy"].includes(current.conditionCode)) {
        const m = minutesUntil(current.sunset);
        items.push({
            id: "golden",
            icon: <Sun className="w-4 h-4"/>,
            title: "Golden hour",
            body: m > 0 && m <= 90
                ? `Golden-hour light in ~${m} min — warm, directional glow; excellent for portraits and landscapes facing west.`
                : "Golden-hour quality light — soft shadows and rich tones for photography.",
        });
    }
    if (current.uvIndex >= 8 && current.isDay) {
        items.push({
            id: "uv",
            icon: <ShieldAlert className="w-4 h-4"/>,
            title: "Skin & UV",
            body: `UV index ${current.uvIndex} — use SPF 30+ and reapply every 2h if you are outside.`,
        });
    }
    if (current.temperature >= 26 || current.temperature <= 5) {
        items.push({
            id: "hydration",
            icon: <Droplets className="w-4 h-4"/>,
            title: "Hydration",
            body: current.temperature >= 26
                ? "Heat stress risk — sip water regularly even if you do not feel thirsty yet."
                : "Cold air is dehydrating — warm fluids help circulation and comfort.",
        });
    }
    const activityOk = current.conditionCode !== "storm" &&
        current.windSpeed < 50 &&
        (current.aqiUs ?? 50) < 150 &&
        forecast[0] &&
        forecast[0].precipitationProbability < 70;
    if (activityOk && current.temperature >= 10 && current.temperature <= 30) {
        items.push({
            id: "workout",
            icon: <Dumbbell className="w-4 h-4"/>,
            title: "Training window",
            body: "Temps and air quality are workable for outdoor cardio or a steady ride — warm up longer if it is windy.",
        });
    }
    if (current.visibility >= 8 && current.cloudCover < 40 && current.isDay) {
        items.push({
            id: "photo",
            icon: <Camera className="w-4 h-4"/>,
            title: "Visibility & clarity",
            body: `${current.visibility} km visibility with lighter cloud cover — crisp long-range shots and polarized-friendly skies.`,
        });
    }
    if (current.windSpeed > 40) {
        items.push({
            id: "wind",
            icon: <Wind className="w-4 h-4"/>,
            title: "Windy conditions",
            body: "Secure loose gear outdoors; cyclists should favour aero tuck and wider following gaps on gusty stretches.",
        });
    }
    if (current.conditionCode === "rain" || current.conditionCode === "storm") {
        items.push({
            id: "drive",
            icon: <Car className="w-4 h-4"/>,
            title: "Driving",
            body: "Reduced grip when wet — smoother steering inputs, double following distance, watch for spray.",
        });
    }
    if (!current.isDay && current.cloudCover < 60 && current.conditionCode !== "storm") {
        const untilRise = differenceInMinutes(new Date(current.sunrise * 1000), new Date());
        if (untilRise > 0 && untilRise < 180) {
            items.push({
                id: "sleep",
                icon: <Moon className="w-4 h-4"/>,
                title: "Rest & rhythm",
                body: `Clearer skies before dawn — sunrise in ~${untilRise} min. Cool bedroom temps (~18–20°C) pair well with tomorrow’s early light.`,
            });
        }
        else {
            items.push({
                id: "sleep2",
                icon: <Moon className="w-4 h-4"/>,
                title: "Evening wind-down",
                body: "Stable overnight conditions — keep screens dim; cool air helps sleep onset.",
            });
        }
    }
    if ((current.aqiUs ?? 0) > 100) {
        items.push({
            id: "aqi",
            icon: <Activity className="w-4 h-4"/>,
            title: "Air quality",
            body: `AQI ${current.aqiUs} — sensitive groups should shorten outdoor exposure; consider indoor air filtration.`,
        });
    }
    const goldenStartSec = current.sunset - 55 * 60;
    const minsToGolden = differenceInMinutes(new Date(goldenStartSec * 1000), new Date());
    if (minsToGolden > 0 &&
        minsToGolden <= 45 &&
        current.isDay &&
        ["clear", "cloudy", "fog"].includes(current.conditionCode)) {
        items.unshift({
            id: "golden-lead",
            icon: <Sun className="w-4 h-4"/>,
            title: "Light quality",
            body: `Golden hour begins in ~${minsToGolden} minutes — excellent lighting for outdoor portraits and city geometry.`,
        });
    }
    return items.slice(0, 8);
}
export function SmartInsightsList({ items }: {
    items: InsightItem[];
}) {
    if (items.length === 0)
        return null;
    return (<ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((it, i) => (<motion.li key={it.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] dark:bg-black/20 p-4 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-primary/25 transition-colors">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-8 h-8 rounded-xl bg-primary/12 text-primary flex items-center justify-center ring-1 ring-primary/20">
              {it.icon}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1">{it.title}</p>
              <p className="text-sm text-foreground/85 leading-snug">{it.body}</p>
            </div>
          </div>
        </motion.li>))}
    </ul>);
}
