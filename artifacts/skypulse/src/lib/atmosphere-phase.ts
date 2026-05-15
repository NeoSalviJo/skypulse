import type { DayPhase } from "./day-phase";

export type SkyTimeFallback = "morning" | "afternoon" | "evening" | "night";

export function effectiveDayPhase(dayPhase: DayPhase | null | undefined, timeOfDay: SkyTimeFallback): DayPhase {
    if (dayPhase)
        return dayPhase;
    switch (timeOfDay) {
        case "morning":
            return "morning";
        case "afternoon":
            return "afternoon";
        case "evening":
            return "golden-hour";
        case "night":
            return "deep-night";
        default:
            return "afternoon";
    }
}

export type WeatherAccent = null | "cloudy" | "fog" | "rain" | "snow" | "storm";

export function weatherAccentFromCondition(conditionCode: string): WeatherAccent {
    const c = conditionCode.trim().toLowerCase();
    if (!c || c === "clear")
        return null;
    if (c === "night")
        return null;
    if (c === "storm")
        return "storm";
    if (c === "snow")
        return "snow";
    if (c === "rain")
        return "rain";
    if (c === "fog")
        return "fog";
    if (c === "cloudy")
        return "cloudy";
    return null;
}

export interface CinematicPhaseStyle {
    /** Comma-separated CSS backgrounds (solid procedural only). */
    background: string;
    horizonGlow: string;
    /** Extra depth at zenith — optional vignette/top wash. */
    topWash: string;
    sun: false | {
        bottomPct: number;
        leftPct: number;
        sizePx: number;
        core: string;
        halo: string;
        rayIntensity: number;
    };
    moon: false | {
        topPct: number;
        rightPct: number;
        discPx: number;
        haloPx: number;
    };
    /** 0 = none, 1 = full starfield stacks */
    stars: number;
    lightShafts: boolean;
    aurora: boolean;
    atmosphericHaze: number;
}

export type CelestialSun = Exclude<CinematicPhaseStyle["sun"], false>;
export type CelestialMoon = Exclude<CinematicPhaseStyle["moon"], false>;

export const CINEMATIC_PHASE: Record<DayPhase, CinematicPhaseStyle> = {
    "deep-night": {
        background: `
      radial-gradient(ellipse 140% 80% at 50% -20%, rgba(72,62,148,0.35) 0%, transparent 50%),
      radial-gradient(ellipse 90% 45% at 18% 25%, rgba(36,94,156,0.14) 0%, transparent 55%),
      radial-gradient(ellipse 70% 40% at 82% 30%, rgba(110,76,178,0.12) 0%, transparent 50%),
      linear-gradient(180deg,
        #02010a 0%,
        #080b22 14%,
        #0f1438 34%,
        #141a52 52%,
        #1e1a62 74%,
        #161045 92%,
        #0a0718 100%
      )
    `,
        horizonGlow:
            `radial-gradient(ellipse 125% 55% at 50% 100%, rgba(86,112,216,0.42) 0%, rgba(48,72,156,0.22) 38%, rgba(92,76,158,0.14) 55%, transparent 78%),
           radial-gradient(ellipse 95% 40% at 70% 100%, rgba(180,164,240,0.12) 0%, transparent 60%)`,
        topWash:
            `radial-gradient(ellipse 115% 70% at 50% -12%, rgba(5,10,42,0.78) 0%, transparent 52%),
           linear-gradient(180deg, rgba(10,14,52,0.5) 0%, transparent 36%)`,
        sun: false,
        moon: { topPct: 9, rightPct: 12, discPx: 62, haloPx: 168 },
        stars: 1,
        lightShafts: false,
        aurora: true,
        atmosphericHaze: 0.52,
    },
    sunrise: {
        background: `
      linear-gradient(195deg,
        #050818 0%,
        #1c2a72 26%,
        #6b5aa8 52%,
        #e86850 74%,
        #ffc98a 100%
      )
    `,
        horizonGlow:
            `radial-gradient(ellipse 130% 65% at 50% 100%, rgba(255,180,96,0.65) 0%, rgba(255,120,100,0.28) 40%, transparent 68%)`,
        topWash:
            `linear-gradient(180deg, rgba(8,12,42,0.55) 0%, transparent 38%)`,
        sun: {
            bottomPct: 16,
            leftPct: 50,
            sizePx: 108,
            core: "#fff4d8",
            halo: "#fde68a",
            rayIntensity: 0.75,
        },
        moon: false,
        stars: 0.18,
        lightShafts: true,
        aurora: false,
        atmosphericHaze: 0.35,
    },
    morning: {
        background: `
      linear-gradient(185deg,
        #081a4a 0%,
        #3b82bd 38%,
        #7ecbff 70%,
        #cbeafe 100%
      )
    `,
        horizonGlow:
            `radial-gradient(ellipse 115% 55% at 50% 100%, rgba(255,230,176,0.42) 0%, rgba(147,218,255,0.22) 48%, transparent 72%)`,
        topWash:
            `linear-gradient(180deg, rgba(15,58,132,0.28) 0%, transparent 45%)`,
        sun: {
            bottomPct: 78,
            leftPct: 78,
            sizePx: 124,
            core: "#fffef5",
            halo: "#fcd34d",
            rayIntensity: 0.55,
        },
        moon: false,
        stars: 0,
        lightShafts: true,
        aurora: false,
        atmosphericHaze: 0.2,
    },
    afternoon: {
        background: `
      linear-gradient(180deg,
        #065d9e 0%,
        #31aafc 42%,
        #8fd7ff 100%
      )
    `,
        horizonGlow:
            `radial-gradient(ellipse 100% 50% at 50% 100%, rgba(255,252,220,0.35) 0%, rgba(96,206,255,0.24) 50%, transparent 75%)`,
        topWash:
            `linear-gradient(180deg, rgba(4,64,132,0.18) 0%, transparent 50%)`,
        sun: {
            bottomPct: 82,
            leftPct: 78,
            sizePx: 132,
            core: "#fffff2",
            halo: "#fde047",
            rayIntensity: 0.42,
        },
        moon: false,
        stars: 0,
        lightShafts: true,
        aurora: false,
        atmosphericHaze: 0.12,
    },
    "golden-hour": {
        background: `
      linear-gradient(188deg,
        #14102c 0%,
        #4a3678 34%,
        #c9566a 60%,
        #ff9742 82%,
        #ffd596 100%
      )
    `,
        horizonGlow:
            `radial-gradient(ellipse 140% 70% at 52% 100%, rgba(255,150,72,0.85) 0%, rgba(255,90,118,0.45) 35%, transparent 65%)`,
        topWash:
            `linear-gradient(180deg, rgba(30,22,72,0.35) 0%, transparent 42%)`,
        sun: {
            bottomPct: 14,
            leftPct: 48,
            sizePx: 132,
            core: "#fff2e8",
            halo: "#fb923c",
            rayIntensity: 0.92,
        },
        moon: false,
        stars: 0.1,
        lightShafts: true,
        aurora: false,
        atmosphericHaze: 0.26,
    },
    sunset: {
        background: `
      linear-gradient(190deg,
        #090818 0%,
        #2d2458 36%,
        #7c4388 62%,
        #e05848 82%,
        #ffb07a 100%
      )
    `,
        horizonGlow:
            `radial-gradient(ellipse 135% 68% at 48% 100%, rgba(255,110,94,0.78) 0%, rgba(160,72,148,0.38) 40%, transparent 68%)`,
        topWash:
            `linear-gradient(180deg, rgba(12,8,42,0.55) 0%, transparent 40%)`,
        sun: {
            bottomPct: 10,
            leftPct: 44,
            sizePx: 118,
            core: "#ffe8dc",
            halo: "#f97316",
            rayIntensity: 0.82,
        },
        moon: false,
        stars: 0.2,
        lightShafts: true,
        aurora: false,
        atmosphericHaze: 0.32,
    },
    dusk: {
        background: `
      radial-gradient(ellipse 100% 50% at 30% -5%, rgba(120,92,172,0.22) 0%, transparent 45%),
      linear-gradient(188deg,
        #070618 0%,
        #1a1648 38%,
        #4a3878 72%,
        #6e4f92 94%,
        #3d2a58 100%
      )
    `,
        horizonGlow:
            `radial-gradient(ellipse 125% 58% at 48% 100%, rgba(220,140,180,0.38) 0%, rgba(120,90,178,0.22) 45%, transparent 72%)`,
        topWash:
            `linear-gradient(180deg, rgba(8,6,34,0.72) 0%, transparent 52%)`,
        sun: false,
        moon: { topPct: 11, rightPct: 12, discPx: 52, haloPx: 132 },
        stars: 0.62,
        lightShafts: false,
        aurora: true,
        atmosphericHaze: 0.56,
    },
    "blue-hour": {
        background: `
      radial-gradient(ellipse 85% 45% at 75% 8%, rgba(120,154,246,0.18) 0%, transparent 50%),
      linear-gradient(182deg,
        #030818 0%,
        #0e1a54 42%,
        #1f3882 74%,
        #355cb4 94%,
        #243878 100%
      )
    `,
        horizonGlow:
            `radial-gradient(ellipse 118% 52% at 50% 100%, rgba(120,180,252,0.38) 0%, rgba(70,120,210,0.2) 48%, transparent 76%)`,
        topWash:
            `linear-gradient(180deg, rgba(4,10,48,0.78) 0%, transparent 44%)`,
        sun: false,
        moon: { topPct: 10, rightPct: 15, discPx: 56, haloPx: 138 },
        stars: 0.88,
        lightShafts: false,
        aurora: true,
        atmosphericHaze: 0.52,
    },
    night: {
        background: `
      radial-gradient(ellipse 120% 70% at 50% -15%, rgba(88,74,156,0.28) 0%, transparent 48%),
      radial-gradient(ellipse 70% 45% at 12% 22%, rgba(48,118,176,0.12) 0%, transparent 55%),
      linear-gradient(180deg,
        #050712 0%,
        #0c1230 36%,
        #152058 72%,
        #1f3278 94%,
        #141843 100%
      )
    `,
        horizonGlow:
            `radial-gradient(ellipse 118% 58% at 50% 100%, rgba(88,138,246,0.4) 0%, rgba(52,86,196,0.24) 42%, rgba(120,100,200,0.12) 58%, transparent 78%)`,
        topWash:
            `radial-gradient(ellipse 115% 55% at 50% -5%, rgba(6,12,48,0.68) 0%, transparent 56%)`,
        sun: false,
        moon: { topPct: 10, rightPct: 13, discPx: 60, haloPx: 156 },
        stars: 1,
        lightShafts: false,
        aurora: true,
        atmosphericHaze: 0.48,
    },
};
