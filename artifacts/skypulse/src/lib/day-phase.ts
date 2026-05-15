export type DayPhase = "deep-night" | "sunrise" | "morning" | "afternoon" | "golden-hour" | "sunset" | "dusk" | "blue-hour" | "night";
export function getDayPhase(nowSec: number, sunriseSec: number, sunsetSec: number): DayPhase {
    if (nowSec < sunriseSec) {
        if (sunriseSec - nowSec <= 3600)
            return "sunrise";
        return "deep-night";
    }
    if (nowSec > sunsetSec) {
        const after = nowSec - sunsetSec;
        if (after <= 2400)
            return "dusk";
        if (after <= 5400)
            return "blue-hour";
        return "night";
    }
    const span = sunsetSec - sunriseSec;
    const noon = sunriseSec + span / 2;
    const beforeSunset = sunsetSec - nowSec;
    const afterSunrise = nowSec - sunriseSec;
    if (beforeSunset <= 3600)
        return "golden-hour";
    if (beforeSunset <= 5400)
        return "sunset";
    if (afterSunrise <= 3600)
        return "sunrise";
    if (nowSec < noon - 1800)
        return "morning";
    if (nowSec > noon + 1800)
        return "afternoon";
    return "afternoon";
}
export function dayPhaseToSkyPeriod(phase: DayPhase): "morning" | "afternoon" | "evening" | "night" {
    switch (phase) {
        case "sunrise":
        case "morning":
            return "morning";
        case "afternoon":
            return "afternoon";
        case "golden-hour":
        case "sunset":
        case "dusk":
            return "evening";
        case "blue-hour":
        case "night":
        case "deep-night":
            return "night";
        default:
            return "afternoon";
    }
}
export const DAY_PHASE_TINT: Record<DayPhase, {
    a: string;
    b: string;
    vignette: string;
    glow: string;
}> = {
    "deep-night": {
        a: "rgba(36,52,118,0.38)",
        b: "rgba(16,22,62,0.32)",
        vignette: "rgba(2,4,22,0.78)",
        glow: "rgba(140,132,246,0.14)",
    },
    sunrise: {
        a: "rgba(255,120,80,0.18)",
        b: "rgba(255,200,120,0.12)",
        vignette: "rgba(30,20,40,0.25)",
        glow: "rgba(255,200,100,0.14)",
    },
    morning: {
        a: "rgba(255,220,160,0.08)",
        b: "rgba(120,180,255,0.06)",
        vignette: "rgba(0,20,40,0.12)",
        glow: "rgba(255,230,180,0.08)",
    },
    afternoon: {
        a: "rgba(100,180,255,0.07)",
        b: "rgba(60,140,220,0.05)",
        vignette: "rgba(0,30,60,0.10)",
        glow: "rgba(150,210,255,0.06)",
    },
    "golden-hour": {
        a: "rgba(255,140,60,0.22)",
        b: "rgba(200,80,120,0.14)",
        vignette: "rgba(40,15,30,0.18)",
        glow: "rgba(255,180,80,0.20)",
    },
    sunset: {
        a: "rgba(255,90,120,0.20)",
        b: "rgba(120,60,160,0.12)",
        vignette: "rgba(30,10,40,0.22)",
        glow: "rgba(255,120,100,0.16)",
    },
    dusk: {
        a: "rgba(110,74,148,0.22)",
        b: "rgba(48,40,94,0.18)",
        vignette: "rgba(10,8,38,0.48)",
        glow: "rgba(220,150,210,0.12)",
    },
    "blue-hour": {
        a: "rgba(52,92,172,0.26)",
        b: "rgba(28,48,118,0.22)",
        vignette: "rgba(8,14,52,0.52)",
        glow: "rgba(120,180,255,0.14)",
    },
    night: {
        a: "rgba(48,72,148,0.34)",
        b: "rgba(22,32,92,0.28)",
        vignette: "rgba(2,6,26,0.62)",
        glow: "rgba(150,130,246,0.11)",
    },
};
