import { motion, useReducedMotion } from "framer-motion";
import { useId, useMemo } from "react";
import type { CSSProperties } from "react";
import { useComfortGraphics } from "@/hooks/use-media-query";
import type { DayPhase } from "@/lib/day-phase";
import { weatherHeroAssets as wx } from "@/components/weather-hero-assets";

export type HeroSceneAccent = "clear-day" | "clear-night" | "cloudy" | "rain" | "storm" | "snow" | "fog";

function inferAccent(conditionCode: string, isDay: boolean): HeroSceneAccent {
    const c = conditionCode === "fog" ? "fog" : conditionCode;
    if (c === "storm") return "storm";
    if (c === "snow") return "snow";
    if (c === "rain") return "rain";
    if (c === "fog") return "fog";
    if (c === "cloudy") return "cloudy";
    if (c === "clear" || c === "night") return isDay ? "clear-day" : "clear-night";
    return isDay ? "clear-day" : "clear-night";
}

export function cinematicHeroAccent(conditionCode: string, isDay: boolean): HeroSceneAccent {
    return inferAccent(conditionCode, isDay);
}

function dayPhaseWash(dayPhase: DayPhase | null | undefined, accent: HeroSceneAccent): string | undefined {
    if (!dayPhase) return undefined;
    if (accent === "storm" || accent === "rain") {
        switch (dayPhase) {
            case "golden-hour":
            case "sunset":
                return "linear-gradient(196deg, rgba(36,48,112,0.18) 0%, transparent min(62%, 22rem)), linear-gradient(8deg, transparent 55%, rgba(255,120,118,0.07) 100%)";
            case "dusk":
                return "linear-gradient(182deg, rgba(22,36,132,0.14) 0%, transparent min(72%, 30rem)), linear-gradient(0deg, transparent 62%, rgba(110,92,218,0.08) 100%)";
            default:
                return "linear-gradient(188deg, rgba(24,32,112,0.12) 0%, transparent min(74%, 32rem)), linear-gradient(0deg, transparent 74%, rgba(150,174,246,0.07) 100%)";
        }
    }
    if (accent === "snow") {
        switch (dayPhase) {
            case "sunset":
            case "golden-hour":
                return "linear-gradient(190deg, rgba(255,200,236,0.08) 0%, transparent min(72%, 28rem))";
            default:
                return undefined;
        }
    }
    switch (dayPhase) {
        case "sunrise":
            return "linear-gradient(168deg, rgba(255,186,146,0.18) 0%, transparent min(72%, 32rem)), linear-gradient(0deg, transparent 68%, rgba(255,226,218,0.08) 100%)";
        case "golden-hour":
            return "linear-gradient(188deg, rgba(255,196,154,0.16) 0%, transparent min(72%, 30rem)), linear-gradient(354deg, transparent 62%, rgba(255,146,206,0.09) 100%)";
        case "sunset":
            return "linear-gradient(182deg, rgba(255,150,138,0.18) 0%, transparent min(68%, 28rem)), linear-gradient(4deg, transparent 62%, rgba(108,92,246,0.1) 100%)";
        case "dusk":
            return "linear-gradient(174deg, rgba(120,90,246,0.12) 0%, transparent min(72%, 30rem)), linear-gradient(188deg, transparent 72%, rgba(24,44,146,0.16) 100%)";
        case "blue-hour":
        case "night":
        case "deep-night":
            return "linear-gradient(182deg, rgba(78,144,246,0.1) 0%, transparent min(74%, 32rem)), linear-gradient(184deg, transparent 74%, rgba(8,10,62,0.22) 100%)";
        default:
            return undefined;
    }
}

interface SceneStack {
    plateSrc: string;
    plateStyle: CSSProperties;
    moon: boolean;
    rays: boolean;
    midBlend: CSSProperties["mixBlendMode"];
    fgBlend: CSSProperties["mixBlendMode"];
    layers: CSSProperties["filter"];
    midMotion: number;
    fgMotion: number;
}

function accentStack(accent: HeroSceneAccent, isDay: boolean): SceneStack {
    const baseContrast = accent === "fog" ? 0.98 : accent === "storm" || accent === "rain" ? 1.08 : 1.06;
    const baseSaturate = accent === "snow" ? 0.88 : accent === "storm" ? 1.06 : accent === "rain" ? 0.94 : accent === "fog" ? 0.76 : 1.02;

    if (accent === "clear-night") {
        return {
            plateSrc: wx.skyNight,
            plateStyle: { filter: `saturate(1.06) brightness(1.02) contrast(1.04)` },
            moon: true,
            rays: false,
            midBlend: "screen",
            fgBlend: "soft-light",
            layers: "",
            midMotion: 0.65,
            fgMotion: -0.92,
        };
    }

    if (accent === "storm") {
        return {
            plateSrc: wx.skyStorm,
            plateStyle: { filter: `saturate(1.08) brightness(0.72) contrast(1.2)` },
            moon: false,
            rays: false,
            midBlend: "multiply",
            fgBlend: "screen",
            layers: "",
            midMotion: 0.85,
            fgMotion: -1.05,
        };
    }

    const plateSrc = wx.skyDay;
    const plateStyle: CSSProperties = {
        filter:
            accent === "rain"
                ? "saturate(0.78) brightness(0.74) contrast(1.22)"
                : accent === "snow"
                  ? "saturate(0.72) brightness(1.05) contrast(1.06) hue-rotate(-12deg)"
                  : accent === "fog"
                    ? `saturate(${baseSaturate}) brightness(1.12) contrast(0.94)`
                    : accent === "cloudy"
                      ? `saturate(${isDay ? 0.94 : baseSaturate}) brightness(${isDay ? 0.93 : 0.82}) contrast(1.1)`
                      : `saturate(${baseSaturate}) brightness(1.04) contrast(${baseContrast})`,
    };

    return {
        plateSrc,
        plateStyle,
        moon: false,
        rays: accent === "clear-day" || (accent === "cloudy" && isDay),
        midBlend: accent === "fog" ? "overlay" : "screen",
        fgBlend: accent === "fog" ? "overlay" : "soft-light",
        layers: accent === "fog" ? "blur(0.6px)" : "",
        midMotion: accent === "fog" ? 0.4 : accent === "cloudy" || accent === "rain" ? 0.82 : accent === "snow" ? 0.74 : 0.58,
        fgMotion: accent === "fog" ? -0.55 : accent === "rain" ? -1.08 : accent === "snow" ? -0.88 : -0.94,
    };
}

interface CinematicHeroSceneProps {
    conditionCode: string;
    isDay: boolean;
    windSpeedKmh?: number;
    /** When `hero`, biases raster framing toward the card’s right corridor (balances left typography stack). */
    variant?: "default" | "hero";
    /** Local solar/lighting mood layered as linear washes (never blur blobs). */
    dayPhase?: DayPhase | null;
    className?: string;
}

/** Cinematic matte-plate hero: raster sky & volumetric-looking cloud composites (not procedural gradient clouds). */
export function CinematicHeroScene({
    conditionCode,
    isDay,
    windSpeedKmh = 0,
    variant = "default",
    dayPhase,
    className = "",
}: CinematicHeroSceneProps) {
    const reduceMotionOS = useReducedMotion();
    const comfortGraphics = useComfortGraphics();
    const calm = !!(reduceMotionOS || comfortGraphics);
    const uid = useId().replace(/:/g, "");
    const accent = inferAccent(conditionCode, isDay);
    const stack = useMemo(() => accentStack(accent, isDay), [accent, isDay]);

    const wind = Math.min(1, Math.max(0, windSpeedKmh / 44));
    const drift = calm ? 0 : 11 + wind * 18;
    const driftFg = calm ? 0 : 18 + wind * 24;

    const tx =
        (px: number, sec: number, delay = 0) =>
        calm
            ? { x: 0 }
            : {
                  x: [0, px, -px * 0.55, px * 0.38, 0],
                  transition: {
                      duration: sec,
                      repeat: Infinity,
                      ease: "easeInOut" as const,
                      delay,
                  },
              };

    const midOpacity =
        accent === "clear-night" ? (calm ? 0.18 : 0.26)
        : accent === "snow" ? 0.92
            : accent === "fog" ? 1
                : accent === "storm" || accent === "rain" ? Math.min(0.98, 0.92)
                    : accent === "cloudy" ? Math.min(0.98, 0.82)
                        : accent === "clear-day" ? 0.58
                            : 0.72;

    const fgOpacity =
        accent === "clear-night" ? (calm ? 0.12 : 0.2)
        : accent === "fog" ? 1
            : accent === "snow" ? 0.94
                : accent === "storm" ? Math.min(0.99, 0.96)
                    : accent === "rain" ? 0.9
                        : accent === "cloudy" ? 0.9
                            : accent === "clear-day" ? 0.78
                                : 0.88;

    const phaseBackdrop = useMemo(() => dayPhaseWash(dayPhase, accent), [dayPhase, accent]);
    const isHero = variant === "hero";
    const plateObject = isHero ? "object-[58%_32%]" : "object-[50%_40%]";
    const midObject = isHero ? "object-[52%_30%]" : "object-[45%_35%]";
    const midShift = isHero ? "translate-x-[3%]" : "-translate-x-[2%]";
    const fgObject = isHero ? "object-[54%_58%]" : "object-[48%_64%]";
    const fgShift = isHero ? "-translate-x-[4%]" : "-translate-x-[8%]";
    const raysObject = isHero ? "object-[44%_-4%]" : "object-[36%_0%]";
    const starField = useMemo(
        () => [...Array(calm ? 32 : 56)].map((_, i) => {
            let h = (i * 834 + (uid.charCodeAt(i % Math.max(uid.length, 1)) || 11)) % 983;
            const cx = (h % 960) / 10;
            h = Math.floor(h * 1.7) % 983;
            const cy = (h % 620) / 10;
            return { cx, cy, r: 0.28 + (i % 6) * 0.085, op: 0.08 + (i % 5) * 0.036 };
        }),
        [calm, uid],
    );

    return (
        <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] ${className}`.trim()} aria-hidden>
            {!comfortGraphics && (
                <svg className="absolute inset-0 z-[42] h-full w-full opacity-[0.036] mix-blend-overlay" aria-hidden>
                    <filter id={`film-${uid}`}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="3" seed="907" stitchTiles="stitch" result="n" />
                        <feColorMatrix type="saturate" values="0" in="n" result="g" />
                        <feComponentTransfer in="g">
                            <feFuncA type="linear" slope="0.42" />
                        </feComponentTransfer>
                    </filter>
                    <rect width="100%" height="100%" filter={`url(#film-${uid})`} fill="#fff" />
                </svg>
            )}

            <motion.div
                className="absolute inset-0 z-[0] scale-[1.08]"
                animate={calm ? { scale: 1.08 } : { scale: [1.08, 1.11, 1.065, 1.08] }}
                transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
            >
                <motion.img
                    src={stack.plateSrc}
                    alt=""
                    draggable={false}
                    className={`h-full min-h-[115%] w-full object-cover ${plateObject}`}
                    style={stack.plateStyle}
                    animate={tx(drift * 0.08, 80, 0)}
                />
                <div className="absolute inset-0 bg-[linear-gradient(145deg,_transparent_0%,_transparent_42%,rgba(12,22,62,0.55)_88%)] mix-blend-multiply opacity-95" />

                {(accent === "clear-day" || accent === "cloudy") && (
                    <div
                        className="absolute inset-0 opacity-[0.2] mix-blend-soft-light"
                        style={{
                            background: "linear-gradient(116deg, rgba(255,234,210,0.32) 0%, transparent min(74%, 32rem))",
                        }}
                    />
                )}
            </motion.div>

            {phaseBackdrop ? (
                <div
                    className="pointer-events-none absolute inset-0 z-[1] mix-blend-soft-light opacity-55"
                    style={{ background: phaseBackdrop }}
                />
            ) : null}

            {accent === "clear-night" && (
                <svg className="absolute inset-0 z-[2] h-full w-full" viewBox="0 0 96 64" preserveAspectRatio="xMidYMid slice" aria-hidden>
                    <g style={{ mixBlendMode: "screen", opacity: 0.92 }}>
                        {starField.map((s, i) => (
                            <circle
                                key={`st-${uid}-${i}`}
                                cx={s.cx}
                                cy={s.cy}
                                r={s.r}
                                fill={`rgba(240,246,255,${s.op})`}
                            />
                        ))}
                    </g>
                </svg>
            )}

            {stack.moon && (
                <motion.div
                    className={`absolute z-[3] ${isHero ? "w-[32%] min-w-[148px] max-w-[340px]" : "w-[38%] min-w-[164px] max-w-[460px]"}`}
                    style={{ right: isHero ? "2%" : "4%", top: isHero ? "3%" : "4%" }}
                    animate={calm ? { y: 0 } : { y: [-4, 3, -3, 2, 0] }}
                    transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
                >
                    <img
                        src={wx.moon}
                        alt=""
                        draggable={false}
                        className="w-full opacity-[0.95] drop-shadow-[0_22px_64px_rgba(180,200,255,0.25)] saturate-[1.02]"
                        style={{ mixBlendMode: "screen" }}
                    />
                </motion.div>
            )}

            <motion.div
                className="absolute inset-y-[-4%] z-[4]"
                animate={tx(drift * stack.midMotion, 54, 0.25)}
                style={{ filter: stack.layers }}
            >
                <img
                    src={wx.cloudMid}
                    alt=""
                    draggable={false}
                    className={`${midShift} h-full min-h-[112%] w-[118%] max-w-none object-cover ${midObject}`}
                    style={{ opacity: midOpacity, mixBlendMode: stack.midBlend ?? "screen" }}
                />
            </motion.div>

            {stack.rays && (
                <motion.div
                    className="pointer-events-none absolute inset-[-6%] z-[5]"
                    style={{ mixBlendMode: "screen" }}
                    animate={calm ? { opacity: 0.44 } : { opacity: [0.36, 0.55, 0.4], x: [-6, 8, -4], y: [2, -4, 0] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                >
                    <img
                        src={wx.godrays}
                        alt=""
                        draggable={false}
                        className={`h-full min-h-[108%] w-full object-cover opacity-[0.85] ${raysObject}`}
                    />
                </motion.div>
            )}

            <svg className="absolute inset-0 z-[6] min-h-[108%] w-full" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid slice">
                {isHero && (accent === "clear-day" || accent === "cloudy") && (
                    <motion.g
                        style={{ mixBlendMode: "screen", opacity: accent === "cloudy" ? 0.16 : 0.22 }}
                        animate={
                            calm
                                ? {}
                                : {
                                        y: [0, 18, 4, 22, 0],
                                        x: [0, -6, 3, -4, 0],
                                      }
                        }
                        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {[...Array(calm ? 10 : 16)].map((_, i) => {
                            const x = (i * 61 + ((i + 5) ** 3) % 97) % 920;
                            const y = (i * 103) % 480;
                            return (
                                <circle
                                    key={`dm-${uid}-${i}`}
                                    cx={150 + x * 0.85}
                                    cy={120 + y * 0.6}
                                    r={0.6 + (i % 5) * 0.38}
                                    fill={`rgba(255,248,230,${0.06 + (i % 4) * 0.035})`}
                                />
                            );
                        })}
                    </motion.g>
                )}
                {(accent === "rain" || accent === "storm") && (
                    <motion.g
                        style={{ mixBlendMode: "screen", opacity: accent === "storm" ? 0.32 : 0.22 }}
                        animate={calm ? {} : { y: [0, 48, 0] }}
                        transition={{ duration: 2.05, repeat: Infinity, ease: "linear" }}
                    >
                        {[...Array(calm ? 34 : 64)].map((_, i) => {
                            const x = (i * 15.9 + (i % 8) * 29) % 990;
                            const skew = 4.5 + (i % 5) * 1.4;
                            const o = accent === "storm" ? 0.12 + (i % 4) * 0.03 : 0.07 + (i % 3) * 0.02;
                            return (
                                <line
                                    key={`rn-${uid}-${i}`}
                                    x1={x}
                                    y1={-50 + (i % 10) * 14}
                                    x2={x + skew}
                                    y2={690}
                                    stroke={`rgba(198,218,254,${o})`}
                                    strokeWidth={accent === "storm" ? 2.2 : 1.4}
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </motion.g>
                )}

                {accent === "snow" && (
                    <motion.g
                        style={{ mixBlendMode: "screen", opacity: 0.42 }}
                        animate={calm ? {} : { y: [0, 620, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    >
                        {[...Array(calm ? 48 : 88)].map((_, i) => {
                            const x = (i * 53 + i * i * 0.02) % 980;
                            const y0 = ((i * 179) % 720) - 420;
                            return (
                                <rect
                                    key={`sn-${uid}-${i}`}
                                    x={x}
                                    y={y0}
                                    width={(i % 4) + 2}
                                    height={(i % 3) + 3}
                                    rx="0.35"
                                    fill="rgba(248,252,255,0.55)"
                                    transform={`skewX(${(i % 5) - 2})`}
                                />
                            );
                        })}
                    </motion.g>
                )}
            </svg>

            <motion.div
                className="absolute inset-y-[-2%] z-[7]"
                animate={tx(driftFg * stack.fgMotion, 38, 0.5)}
                style={{ filter: accent === "fog" ? "blur(0.9px) saturate(0.85)" : stack.layers }}
            >
                <img
                    src={wx.cloudFg}
                    alt=""
                    draggable={false}
                    className={`h-full min-h-[118%] w-[132%] max-w-none object-cover ${fgShift} ${fgObject}`}
                    style={{ opacity: fgOpacity, mixBlendMode: stack.fgBlend ?? "soft-light" }}
                />
            </motion.div>

            {accent === "fog" && (
                <div
                    className="pointer-events-none absolute inset-0 z-[8]"
                    style={{
                        mixBlendMode: "overlay",
                        background: "linear-gradient(180deg, transparent 14%, rgba(206,226,246,0.22) 55%, rgba(190,216,246,0.48) 100%)",
                        opacity: 0.85,
                    }}
                />
            )}

            {(accent === "storm" || accent === "snow") && (
                <div
                    className="pointer-events-none absolute inset-x-[-4%] bottom-[-14%] z-[8] h-[62%]"
                    style={{
                        mixBlendMode: "screen",
                        background:
                            accent === "storm"
                                ? "linear-gradient(0deg, rgba(120,150,226,0.16) 0%, transparent min(94%, 28rem))"
                                : "linear-gradient(0deg, rgba(232,246,255,0.28) 0%, transparent min(94%, 24rem))",
                        opacity: accent === "storm" ? 0.55 : 0.42,
                    }}
                />
            )}
        </div>
    );
}
