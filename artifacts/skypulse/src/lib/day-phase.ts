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
        a: "rgba(15,20,45,0.45)",
        b: "rgba(8,10,30,0.25)",
        vignette: "rgba(0,0,0,0.55)",
        glow: "rgba(100,140,255,0.06)",
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
        a: "rgba(80,50,120,0.16)",
        b: "rgba(40,30,80,0.14)",
        vignette: "rgba(10,5,30,0.35)",
        glow: "rgba(200,100,200,0.08)",
    },
    "blue-hour": {
        a: "rgba(40,60,140,0.20)",
        b: "rgba(20,40,90,0.18)",
        vignette: "rgba(5,10,40,0.40)",
        glow: "rgba(80,120,220,0.10)",
    },
    night: {
        a: "rgba(20,30,70,0.28)",
        b: "rgba(10,15,45,0.20)",
        vignette: "rgba(0,0,20,0.50)",
        glow: "rgba(120,160,255,0.05)",
    },
};
