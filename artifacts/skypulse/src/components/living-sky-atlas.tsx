import { motion } from "framer-motion";
import { useMemo } from "react";
import type { DayPhase } from "@/lib/day-phase";
import type { CelestialMoon, WeatherAccent } from "@/lib/atmosphere-phase";
import { weatherHeroAssets as wx } from "@/components/weather-hero-assets";

const NIGHTISH = new Set<DayPhase>(["deep-night", "night", "blue-hour", "dusk"]);

/** Matte-plate fullscreen stack: sky + volumetric-ish cloud composites + phased grading. */
export function LivingSkyAtlas({
    phase,
    accent,
    calm,
    narrow,
    wind01,
    lightShafts,
    moonSpec,
}: {
    phase: DayPhase;
    accent: WeatherAccent;
    calm: boolean;
    narrow: boolean;
    wind01: number;
    lightShafts: boolean;
    moonSpec: false | CelestialMoon;
}) {
    const plateKey = useMemo(() => resolvePlateKey(phase, accent), [phase, accent]);
    const plateSrc = plateKey === "storm" ? wx.skyStorm : plateKey === "night" ? wx.skyNight : wx.skyDay;
    const drift = calm ? 0 : 14 + wind01 * 20;
    const driftFg = calm ? 0 : 20 + wind01 * 28;

    const tx =
        (px: number, sec: number, delay = 0) =>
        calm
            ? { x: 0 }
            : {
                  x: [0, px, -px * 0.55, px * 0.35, 0],
                  transition: {
                      duration: sec,
                      repeat: Infinity,
                      ease: "easeInOut" as const,
                      delay,
                  },
              };

    const plateFilter = compositePlateFilter(phase, accent, plateKey);
    const midOpacity = narrow ? 0.38 : accent === "fog" ? 0.94 : accent === "storm" || accent === "rain" ? 0.88 : plateKey === "night" ? 0.52 : accent === "cloudy" ? 0.78 : 0.66;
    const fgOpacity = narrow ? 0.55 : accent === "fog" ? 0.96 : accent === "snow" ? 0.9 : accent === "storm" ? 0.94 : plateKey === "night" ? 0.72 : 0.82;

    const showRays =
        lightShafts
        && !narrow
        && plateKey === "day"
        && accent !== "storm"
        && accent !== "rain"
        && accent !== "fog";

    const showMoonRaster = !!(moonSpec && accent !== "storm" && plateKey !== "storm");

    return (
        <motion.div
            key={`atlas-${phase}-${accent}-${plateKey}`}
            aria-hidden
            className="absolute inset-0 isolate overflow-hidden [&_img]:pointer-events-none [&_img]:select-none"
            initial={{ opacity: calm ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: calm ? 0 : 1.85, ease: "easeInOut" }}
        >
            {/* Subtle phased air-light (color grade tied to sunrise / golden / dusk — keeps plates cohesive). */}
            <div className="absolute inset-0 z-[0] opacity-95 mix-blend-soft-light pointer-events-none" style={phaseAmbientWashStyle(phase, plateKey)} />

            <motion.div
                className="absolute inset-0 z-[1] origin-center"
                style={{ willChange: calm ? undefined : "transform" }}
                animate={calm ? { scale: 1.085 } : { scale: [1.085, 1.098, 1.078, 1.085] }}
                transition={{ duration: 56, repeat: Infinity, ease: "easeInOut" }}
            >
                <motion.img
                    src={plateSrc}
                    alt=""
                    draggable={false}
                    decoding="async"
                    fetchPriority="high"
                    className="absolute inset-0 h-full min-h-[125%] w-full object-cover object-[50%_38%]"
                    style={{ filter: plateFilter }}
                    animate={tx(drift * 0.1, 88, 0)}
                />

                {/* Grounding / readability wash — cinematic letterbox vibe, not a flat blue panel. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-black/35 mix-blend-multiply opacity-90" />

                {(phase === "golden-hour" || phase === "sunset" || phase === "sunrise") && plateKey === "day" && (
                    <div
                        className="absolute inset-0 mix-blend-overlay opacity-[0.45] pointer-events-none"
                        style={{
                            background:
                                phase === "sunrise"
                                    ? "radial-gradient(ellipse 140% 80% at 50% 100%, rgba(255,150,112,0.35), transparent 62%)"
                                    : phase === "golden-hour"
                                      ? "radial-gradient(ellipse 130% 75% at 52% 100%, rgba(255,120,72,0.42), transparent 62%), radial-gradient(circle at 18% -8%, rgba(255,220,160,0.18), transparent 52%)"
                                      : "radial-gradient(ellipse 125% 70% at 48% 105%, rgba(255,94,138,0.38), transparent 62%), radial-gradient(circle at 85% -4%, rgba(160,94,246,0.16), transparent 48%)",
                        }}
                    />
                )}
            </motion.div>

            {showMoonRaster && moonSpec && (
                <motion.div
                    className="absolute z-[2]"
                    style={{
                        top: `${moonSpec.topPct}%`,
                        right: `${moonSpec.rightPct}%`,
                        width: `min(${Math.round(moonSpec.haloPx * 2.2)}px, 42vw)`,
                        maxWidth: 420,
                    }}
                    animate={calm ? { y: 0 } : { y: [-6, 4, -4, 0] }}
                    transition={{ duration: 54, repeat: Infinity, ease: "easeInOut" }}
                >
                    <img
                        src={wx.moon}
                        alt=""
                        draggable={false}
                        decoding="async"
                        className="w-full opacity-[0.94] saturate-[1.05]"
                        style={{ mixBlendMode: "screen", filter: moonFilterForPhase(phase) }}
                    />
                </motion.div>
            )}

            {(narrow ? false : plateKey !== "storm") && (
                <motion.div
                    className="absolute inset-y-[-8%] z-[3]"
                    animate={tx(drift * (plateKey === "night" ? 0.62 : 0.72), 58, 0.2)}
                    style={{ filter: accent === "fog" ? "blur(0.55px)" : "", willChange: calm ? undefined : "transform" }}
                >
                    <img
                        src={wx.cloudMid}
                        alt=""
                        draggable={false}
                        decoding="async"
                        className="absolute inset-0 -left-[10%] h-full min-h-[118%] w-[122%] max-w-none object-cover object-[44%_32%]"
                        style={{
                            opacity: midOpacity,
                            mixBlendMode: plateKey === "night" ? "screen" : "screen",
                        }}
                    />
                </motion.div>
            )}

            {showRays && (
                <motion.div
                    className="pointer-events-none absolute inset-[-14%] z-[4]"
                    style={{ mixBlendMode: "screen", willChange: calm ? undefined : "opacity,transform" }}
                    animate={calm ? { opacity: 0.5 } : { opacity: [0.38, 0.62, 0.42], x: [-8, 10, -5], y: [0, -10, 2] }}
                    transition={{ duration: 48, repeat: Infinity, ease: "easeInOut" }}
                >
                    <img
                        src={wx.godrays}
                        alt=""
                        draggable={false}
                        decoding="async"
                        className="absolute inset-0 h-full min-h-[115%] w-full object-cover object-[32%_0%]"
                        style={{ opacity: phase === "afternoon" || phase === "morning" ? 0.74 : 0.88 }}
                    />
                </motion.div>
            )}

            <motion.div
                className="absolute inset-y-[-4%] z-[5]"
                animate={tx(-driftFg * 0.95, 40, 0.45)}
                style={{ filter: accent === "fog" ? "blur(1px)" : "", willChange: calm ? undefined : "transform" }}
            >
                <img
                    src={wx.cloudFg}
                    alt=""
                    draggable={false}
                    decoding="async"
                    className="absolute inset-0 -left-[14%] h-full min-h-[122%] w-[138%] max-w-none object-cover object-[46%_64%]"
                    style={{
                        opacity: fgOpacity,
                        mixBlendMode: plateKey === "night" ? "soft-light" : "soft-light",
                    }}
                />
            </motion.div>

            <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 z-[6] h-[48%] pointer-events-none mix-blend-soft-light opacity-65"
                style={{
                    background: "linear-gradient(0deg, rgba(12,14,52,0.55) 0%, transparent 92%)",
                }}
            />

            {(accent === "snow" || plateKey === "storm") && !narrow && (
                <motion.div
                    aria-hidden
                    className="absolute inset-x-[-6%] bottom-[-18%] z-[6] h-[55%]"
                    style={{
                        mixBlendMode: "screen",
                        opacity: accent === "storm" ? 0.42 : 0.32,
                        background:
                            accent === "storm"
                                ? "radial-gradient(92% 78% at 50% 100%, rgba(120,150,230,0.16), transparent 74%)"
                                : "linear-gradient(0deg, rgba(226,246,255,0.22), transparent 68%)",
                    }}
                    animate={calm ? {} : { opacity: accent === "storm" ? [0.35, 0.48, 0.39] : [0.28, 0.38, 0.31] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
        </motion.div>
    );
}

function resolvePlateKey(phase: DayPhase, accent: WeatherAccent): "storm" | "night" | "day" {
    if (accent === "storm" || accent === "rain") return "storm";
    if (NIGHTISH.has(phase)) return "night";
    return "day";
}

function compositePlateFilter(phase: DayPhase, accent: WeatherAccent, plateKey: "storm" | "night" | "day"): string {
    let base = "";

    switch (plateKey) {
        case "storm":
            base = accent === "rain" ? "brightness(0.78) saturate(1.05) contrast(1.22)" : "brightness(0.72) saturate(1.06) contrast(1.2)";
            break;
        case "night":
            base = phase === "deep-night"
                ? "brightness(0.52) saturate(1.12) contrast(1.1)"
                : phase === "dusk"
                    ? "brightness(0.62) saturate(1.08) hue-rotate(8deg)"
                    : phase === "blue-hour"
                        ? "brightness(0.64) saturate(1.06) hue-rotate(14deg)"
                        : "brightness(0.72) saturate(1.06)";
            break;
        default:
            base = "";
    }

    if (plateKey === "day") {
        switch (phase) {
            case "sunrise":
                base = "brightness(0.93) saturate(1.22) hue-rotate(-8deg) contrast(1.06)";
                break;
            case "morning":
                base = "brightness(1.04) saturate(1.08)";
                break;
            case "afternoon":
                base = "brightness(1.05) saturate(1.1) contrast(1.02)";
                break;
            case "golden-hour":
                base = "brightness(0.92) saturate(1.28) hue-rotate(-14deg) contrast(1.1)";
                break;
            case "sunset":
                base = "brightness(0.86) saturate(1.32) hue-rotate(-24deg) contrast(1.1)";
                break;
            default:
                base = "brightness(1.02) saturate(1.05)";
                break;
        }
    }

    if (accent === "snow") {
        base += (base.length ? " " : "") + "saturate(0.74) hue-rotate(-14deg) brightness(1.04)";
    }
    if (accent === "fog") {
        base += (base.length ? " " : "") + "saturate(0.74) brightness(1.06) contrast(0.94)";
    }
    if (accent === "cloudy" && plateKey === "day") {
        base += (base.length ? " " : "") + "brightness(0.94) saturate(0.94)";
    }

    return base.trim() || "none";
}

function moonFilterForPhase(phase: DayPhase): string {
    switch (phase) {
        case "dusk":
            return "brightness(1.06) saturate(1.06) hue-rotate(-6deg)";
        case "blue-hour":
            return "brightness(0.94) saturate(1.08) hue-rotate(8deg)";
        case "deep-night":
            return "brightness(0.92) saturate(1.1)";
        default:
            return "brightness(1)";
    }
}

/** CSS background layers for phased ambient wash (minimal — plate carries most imagery). */
function phaseAmbientWashStyle(phase: DayPhase, plateKey: "storm" | "night" | "day"): { background: string } {
    const soft = plateKey === "day"
        ? "radial-gradient(ellipse 115% 60% at 50% -4%, rgba(255,253,246,0.14), transparent 58%)"
        : plateKey === "storm"
          ? "radial-gradient(circle at 22% -6%, rgba(180,210,255,0.08), transparent 55%)"
          : "radial-gradient(ellipse 120% 70% at 70% -2%, rgba(140,174,246,0.12), transparent 58%)";

    if (plateKey !== "day") {
        return { background: soft };
    }
    if (phase === "golden-hour" || phase === "sunset") {
        return {
            background:
                `${soft}, radial-gradient(ellipse 140% 80% at 50% 100%, rgba(255,130,92,0.16), transparent 58%)`,
        };
    }
    if (phase === "sunrise") {
        return {
            background:
                `${soft}, radial-gradient(ellipse 135% 70% at 45% 100%, rgba(255,154,118,0.14), transparent 60%)`,
        };
    }
    return { background: soft };
}
