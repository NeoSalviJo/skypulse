import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useTheme } from "./theme-provider";
import { DAY_PHASE_TINT, type DayPhase } from "@/lib/day-phase";
import {
    type WeatherAccent,
    CINEMATIC_PHASE,
    effectiveDayPhase,
    weatherAccentFromCondition,
    type SkyTimeFallback,
    type CelestialSun,
    type CelestialMoon,
} from "@/lib/atmosphere-phase";

export type TimeOfDay = SkyTimeFallback;

interface AnimatedBackgroundProps {
    conditionCode: string;
    timeOfDay: TimeOfDay;
    dayPhase?: DayPhase | null | undefined;
    windSpeedKmh?: number;
}

function svgUrl(svg: string): string {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const STARS_TINY = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><g fill="#fff">
    <circle cx="42"  cy="28"  r="0.9"/><circle cx="120" cy="70"  r="0.7"/><circle cx="220" cy="18"  r="1.1"/><circle cx="310" cy="55"  r="0.8"/><circle cx="400" cy="30"  r="0.6"/><circle cx="490" cy="85"  r="1"/><circle cx="550" cy="15"  r="0.7"/><circle cx="580" cy="60"  r="0.9"/><circle cx="30"  cy="120" r="0.8"/><circle cx="90"  cy="160" r="1.2"/><circle cx="170" cy="130" r="0.7"/><circle cx="260" cy="170" r="0.9"/><circle cx="350" cy="140" r="0.6"/><circle cx="450" cy="110" r="1.1"/><circle cx="520" cy="150" r="0.8"/><circle cx="70"  cy="220" r="0.7"/><circle cx="150" cy="250" r="1"/><circle cx="280" cy="230" r="0.8"/><circle cx="370" cy="260" r="0.6"/><circle cx="460" cy="210" r="1.2"/><circle cx="540" cy="240" r="0.9"/><circle cx="15"  cy="310" r="0.7"/><circle cx="100" cy="340" r="0.8"/><circle cx="200" cy="300" r="1.1"/><circle cx="330" cy="360" r="0.7"/><circle cx="430" cy="320" r="0.9"/><circle cx="510" cy="380" r="0.6"/><circle cx="570" cy="330" r="1"/>
  </g></svg>`);

const STARS_MEDIUM = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><g fill="#fff">
    <circle cx="80"  cy="45"  r="1.5"/><circle cx="195" cy="90"  r="1.8"/><circle cx="290" cy="35"  r="1.3"/><circle cx="380" cy="80"  r="1.6"/><circle cx="475" cy="50"  r="1.4"/><circle cx="560" cy="100" r="1.7"/><circle cx="50"  cy="180" r="1.5"/><circle cx="160" cy="210" r="1.3"/><circle cx="260" cy="190" r="1.8"/><circle cx="360" cy="220" r="1.4"/><circle cx="470" cy="175" r="1.6"/><circle cx="55"  cy="290" r="1.3"/><circle cx="175" cy="320" r="1.7"/><circle cx="290" cy="280" r="1.5"/><circle cx="410" cy="350" r="1.4"/><circle cx="510" cy="295" r="1.8"/><circle cx="145" cy="370" r="1.6"/><circle cx="340" cy="380" r="1.3"/><circle cx="500" cy="360" r="1.5"/><circle cx="580" cy="270" r="1.7"/>
  </g></svg>`);

const STARS_BRIGHT = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><g fill="#fff">
    <circle cx="110" cy="60"  r="2.2"/><circle cx="250" cy="110" r="2.5"/><circle cx="420" cy="55"  r="2"/><circle cx="540" cy="130" r="2.3"/><circle cx="60"  cy="200" r="2.4"/><circle cx="210" cy="260" r="2.1"/><circle cx="360" cy="195" r="2.6"/><circle cx="490" cy="240" r="2"/><circle cx="130" cy="340" r="2.3"/><circle cx="320" cy="370" r="2.1"/><circle cx="555" cy="310" r="2.5"/><circle cx="30"  cy="380" r="2.2"/>
  </g></svg>`);

const RAIN_DROP = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="6" height="32"><line x1="2" y1="0" x2="0" y2="32" stroke="rgba(180,210,255,0.24)" stroke-width="1.2"/></svg>`);
const RAIN_DROP_HEAVY = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="5" height="40"><line x1="2" y1="0" x2="0" y2="40" stroke="rgba(150,190,240,0.32)" stroke-width="1.5"/></svg>`);
const SNOW_LARGE = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="5" cy="5" r="3.5" fill="rgba(255,255,255,0.76)"/></svg>`);
const SNOW_MEDIUM = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7"><circle cx="3.5" cy="3.5" r="2.5" fill="rgba(255,255,255,0.58)"/></svg>`);
const SNOW_SMALL = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.42)"/></svg>`);

export function AnimatedBackground({ conditionCode, timeOfDay, dayPhase = null, windSpeedKmh = 0 }: AnimatedBackgroundProps) {
    const { theme } = useTheme();
    const reduceMotion = useReducedMotion();
    const phase = effectiveDayPhase(dayPhase, timeOfDay);
    const cfg = CINEMATIC_PHASE[phase];
    const accent = weatherAccentFromCondition(conditionCode);
    const isLightTheme = theme === "light";
    const nightLuxury =
        !isLightTheme &&
        (phase === "deep-night" || phase === "night" || phase === "blue-hour" || phase === "dusk");

    const wind01 = Math.min(1.2, windSpeedKmh / 55);
    const cloudBoost = accent === "cloudy" ? 1.35 : accent === "storm" ? 1.65 : accent === "fog" ? 0.85 : 1;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">

            <motion.div
                key={`sky-${phase}`}
                aria-hidden
                className="absolute inset-0"
                initial={{ opacity: reduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 2.8, ease: "easeInOut" }}
                style={{ background: cfg.background }}
            />

            {nightLuxury && <NebulaParallaxBackdrop reduceMotion={!!reduceMotion} />}

            <HorizonBloom glow={cfg.horizonGlow} topWash={cfg.topWash} isLight={isLightTheme} nightLuxury={nightLuxury} />

            <AtmosphericHaze strength={cfg.atmosphericHaze * (accent === "fog" ? 1.45 : 1)} isLight={isLightTheme} nightLuxury={nightLuxury} />

            {cfg.sun && (
                <CinematicSun
                    spec={cfg.sun}
                    rayIntensity={cfg.sun.rayIntensity}
                    reduceMotion={!!reduceMotion}
                    dampen={accent === "fog" || accent === "storm" || accent === "rain"}
                />
            )}

            {cfg.moon && (
                <CinematicMoon spec={cfg.moon} reduceMotion={!!reduceMotion} luxury={nightLuxury} />
            )}

            <Starfield strength={cfg.stars} reduceMotion={!!reduceMotion} parallaxNight={nightLuxury} accent={accent} />

            {cfg.lightShafts && (
                <LightShafts phaseKey={phase} intensity={cfg.sun && typeof cfg.sun === "object" ? cfg.sun.rayIntensity : 0.5} reduceMotion={!!reduceMotion} />
            )}

            {cfg.aurora && <AuroraLayers reduceMotion={!!reduceMotion} boosted={nightLuxury} />}

            <VolumetricClouds
                wind={wind01}
                boost={cloudBoost}
                isLight={isLightTheme}
                accent={accent}
                reduceMotion={!!reduceMotion}
                nightLuxury={nightLuxury}
            />

            <WeatherStack accent={accent} isLight={isLightTheme} reduceMotion={!!reduceMotion} />

            <AtmosphereTint phase={phase} muted={false} light={isLightTheme} />

            <AmbientParticles density={accent === "storm" ? 0.45 : 0.85} reduceMotion={!!reduceMotion} />

            {windSpeedKmh > 22 && (
                <WindShear intensity={Math.min(1, (windSpeedKmh - 22) / 48)} reduceMotion={!!reduceMotion} />
            )}

            {(accent === "rain" || accent === "storm") && <WetGlassSheen />}
            {nightLuxury && <CinematicGradientLighting reduceMotion={!!reduceMotion} />}

            <FilmGrain isLight={isLightTheme} />
        </div>
    );
}

function HorizonBloom({ glow, topWash, isLight, nightLuxury }: {
    glow: string;
    topWash: string;
    isLight: boolean;
    nightLuxury?: boolean;
}) {
    return (
        <>
            <motion.div
                aria-hidden
                className="absolute inset-0 z-[2]"
                style={{
                    background: glow,
                    opacity: isLight ? 0.92 : 1,
                    mixBlendMode: isLight ? "multiply" : "screen",
                }}
                animate={isLight ? { opacity: [0.88, 0.95, 0.88] } : { opacity: nightLuxury ? [0.88, 0.98, 0.88] : [0.96, 1, 0.96] }}
                transition={{ duration: nightLuxury ? 14 : 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
                className="absolute inset-0 z-[2]"
                style={{
                    background: topWash,
                    mixBlendMode: isLight ? "multiply" : nightLuxury ? "soft-light" : "soft-light",
                }}
            />
        </>
    );
}

function AtmosphericHaze({ strength, isLight, nightLuxury }: {
    strength: number;
    isLight: boolean;
    nightLuxury?: boolean;
}) {
    if (strength <= 0.02)
        return null;
    const n = nightLuxury && !isLight;
    return (
        <div
            className="absolute inset-0 z-[3]"
            style={{
                background: isLight
                    ? `linear-gradient(180deg, rgba(255,255,255,${strength * 0.18}) 0%, transparent 55%, rgba(255,255,255,${strength * 0.12}) 100%)`
                    : n
                        ? `
                        radial-gradient(ellipse 80% 50% at 50% -10%, rgba(88,92,148,${strength * 0.14}) 0%, transparent 50%),
                        linear-gradient(180deg, rgba(18,24,58,${strength * 0.42}) 0%, transparent 48%, rgba(12,16,48,${strength * 0.36}) 100%)
                      `
                        : `linear-gradient(180deg, rgba(12,20,48,${strength * 0.35}) 0%, transparent 50%, rgba(8,14,44,${strength * 0.28}) 100%)`,
                mixBlendMode: isLight ? "soft-light" : n ? "soft-light" : "multiply",
                pointerEvents: "none",
            }}
        />
    );
}

function CinematicSun({
    spec,
    rayIntensity,
    reduceMotion,
    dampen,
}: {
    spec: CelestialSun;
    rayIntensity: number;
    reduceMotion: boolean;
    dampen: boolean;
}) {
    const op = dampen ? 0.55 : 1;
    return (
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
            <motion.div
                animate={reduceMotion ? {} : { y: [0, -10, 0], scale: [1, 1.02, 1] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    bottom: `${spec.bottomPct}%`,
                    left: `${spec.leftPct}%`,
                    transform: "translate(-50%, 50%)",
                    width: spec.sizePx,
                    height: spec.sizePx,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${spec.core} 0%, ${spec.halo} 52%, transparent 76%)`,
                    filter: dampen ? "blur(4px)" : "blur(2px)",
                    opacity: op * 0.95,
                    boxShadow: dampen ? "0 0 40px 12px rgba(253,224,71,0.12)" : "0 0 80px 32px rgba(253,224,71,0.22)",
                }}
            />
            <motion.div
                animate={reduceMotion ? {} : { rotate: [0, 18, -8, 0], opacity: [0.2, rayIntensity * 0.52, 0.24] }}
                transition={{ duration: reduceMotion ? 0 : 32, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    bottom: `${spec.bottomPct}%`,
                    left: `${spec.leftPct}%`,
                    transform: `translate(-50%, 52%) rotate(-8deg)`,
                    width: spec.sizePx * 3.8,
                    height: spec.sizePx * 3.8,
                    marginLeft: -spec.sizePx * 1.2,
                    marginBottom: -spec.sizePx * 1.8,
                    background: `conic-gradient(from 0deg, transparent 0deg,
            rgba(255,252,220,${0.04 * rayIntensity * op}) 4deg,
            transparent 14deg,
            transparent 44deg,
            rgba(253,246,178,${0.05 * rayIntensity * op}) 50deg,
            transparent 62deg,
            transparent 112deg,
            rgba(251,237,154,${0.04 * rayIntensity * op}) 120deg,
            transparent 138deg)`,
                    filter: "blur(38px)",
                    opacity: dampen ? 0.42 : 0.78,
                }}
            />
        </div>
    );
}

function CinematicMoon({
    spec,
    reduceMotion,
    luxury,
}: {
    spec: CelestialMoon;
    reduceMotion: boolean;
    luxury: boolean;
}) {
    return (
        <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
            {luxury && (
                <>
                    <motion.div
                        aria-hidden
                        animate={reduceMotion ? {} : { scale: [1, 1.06, 1], opacity: [0.35, 0.5, 0.35] }}
                        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            position: "absolute",
                            top: `calc(${spec.topPct}% - 4%)`,
                            right: `calc(${spec.rightPct}% - 4%)`,
                            width: spec.haloPx * 2.1,
                            height: spec.haloPx * 2.1,
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(200,210,255,0.08) 0%, rgba(147,112,246,0.05) 42%, transparent 68%)",
                            filter: "blur(22px)",
                            mixBlendMode: "screen",
                        }}
                    />
                    <motion.div
                        aria-hidden
                        animate={reduceMotion ? {} : { rotate: [0, 8, -4, 0], opacity: [0.2, 0.32, 0.22] }}
                        transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            position: "absolute",
                            top: `${spec.topPct}%`,
                            right: `${spec.rightPct}%`,
                            width: spec.haloPx * 1.55,
                            height: spec.haloPx * 1.55,
                            marginTop: spec.haloPx * 0.02,
                            marginRight: spec.haloPx * 0.02,
                            borderRadius: "50%",
                            background: `conic-gradient(from 210deg,
                transparent 0deg,
                rgba(186,210,255,0.06) 40deg,
                transparent 80deg,
                rgba(167,139,250,0.07) 120deg,
                transparent 170deg,
                rgba(147,220,255,0.055) 220deg,
                transparent 300deg)`,
                            filter: "blur(16px)",
                            mixBlendMode: "screen",
                        }}
                    />
                </>
            )}
            <motion.div
                animate={reduceMotion ? {} : { y: [0, -6, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    top: `${spec.topPct}%`,
                    right: `${spec.rightPct}%`,
                    width: spec.haloPx * (luxury ? 1.35 : 1),
                    height: spec.haloPx * (luxury ? 1.35 : 1),
                    marginTop: -(spec.haloPx * (luxury ? 1.35 : 1)) * 0.08,
                    marginRight: -(spec.haloPx * (luxury ? 1.35 : 1)) * 0.08,
                    borderRadius: "50%",
                    background: luxury
                        ? "radial-gradient(circle at 38% 36%, rgba(252,253,255,0.92) 0%, rgba(200,218,246,0.45) 32%, rgba(120,148,206,0.16) 55%, transparent 72%)"
                        : "radial-gradient(circle at 38% 38%, rgba(240,248,255,0.95) 0%, rgba(180,200,230,0.35) 45%, transparent 72%)",
                    filter: luxury ? "blur(12px)" : "blur(6px)",
                    boxShadow: luxury
                        ? "0 0 80px 28px rgba(160,190,255,0.25), 0 0 120px 48px rgba(120,100,200,0.12)"
                        : undefined,
                }}
            />
            <motion.div
                animate={reduceMotion ? {} : { boxShadow: [
                    "inset -8px -4px 18px rgba(20,30,60,0.45), 0 0 32px rgba(180,200,255,0.28)",
                    "inset -8px -4px 18px rgba(20,30,60,0.45), 0 0 48px rgba(200,220,255,0.38)",
                    "inset -8px -4px 18px rgba(20,30,60,0.45), 0 0 32px rgba(180,200,255,0.28)",
                ] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    top: `calc(${spec.topPct}% + 6px)`,
                    right: `calc(${spec.rightPct}% - 10px)`,
                    width: spec.discPx,
                    height: spec.discPx,
                    borderRadius: "50%",
                    background: luxury
                        ? "radial-gradient(circle at 34% 32%, #fbfdff 0%, #d4e2f8 38%, #8fa4ce 68%, #2a3358 100%)"
                        : "radial-gradient(circle at 36% 34%, #f1f6ff 0%, #b8c8e8 55%, #2a3358 100%)",
                    boxShadow: "inset -8px -4px 18px rgba(20,30,60,0.45), 0 0 24px rgba(180,200,255,0.2)",
                }}
            />
        </div>
    );
}

function Starfield({ strength, reduceMotion, parallaxNight, accent }: {
    strength: number;
    reduceMotion: boolean;
    parallaxNight: boolean;
    accent: WeatherAccent;
}) {
    if (strength <= 0.01)
        return null;
    const stormDim = accent === "storm" || accent === "rain" ? 0.72 : 1;
    const mult = stormDim * (parallaxNight ? 1.08 : 1);
    const a = reduceMotion ? { animation: "none" } : {};
    const wrap = (depth: number, child: ReactNode) =>
        parallaxNight && !reduceMotion
            ? (
                <motion.div
                    className="absolute inset-0"
                    animate={{ y: [0, depth * -10, 0], x: [0, depth * 4, 0] }}
                    transition={{ duration: 80 + depth * 40, repeat: Infinity, ease: "easeInOut", delay: depth * -8 }}
                    style={{ willChange: "transform" }}
                >
                    {child}
                </motion.div>
                )
            : (
                <div className="absolute inset-0">
                    {child}
                </div>
                );
    return (
        <div className="absolute inset-0 z-[1] pointer-events-none">
            {wrap(2, (
                <div
                    style={{
                        ...a,
                        opacity: 0.32 * strength * mult,
                        backgroundImage: `url(${STARS_TINY})`,
                        backgroundSize: "820px 500px",
                        animation: reduceMotion ? undefined : "twinkle-a 5s ease-in-out infinite",
                    }}
                />
            ))}
            {wrap(4, (
                <div
                    style={{
                        ...a,
                        opacity: 0.42 * strength * mult,
                        backgroundImage: `url(${STARS_MEDIUM})`,
                        backgroundSize: "780px 480px",
                        backgroundPosition: "120px 60px",
                        animation: reduceMotion ? undefined : "twinkle-b 7s ease-in-out infinite",
                    }}
                />
            ))}
            {wrap(6, (
                <div
                    style={{
                        ...a,
                        opacity: 0.52 * strength * mult,
                        backgroundImage: `url(${STARS_BRIGHT})`,
                        backgroundSize: "760px 460px",
                        backgroundPosition: "60px 140px",
                        animation: reduceMotion ? undefined : "twinkle-c 6s ease-in-out infinite",
                    }}
                />
            ))}
            {parallaxNight && strength > 0.35 && (
                wrap(1, (
                    <div
                        aria-hidden
                        style={{
                            ...a,
                            opacity: 0.85 * strength * mult,
                            backgroundImage:
                                `radial-gradient(circle at 18% 22%, rgba(255,253,255,0.95) 0.65px, transparent 1.1px),
             radial-gradient(circle at 72% 18%, rgba(240,246,255,0.85) 0.5px, transparent 1px)`,
                            backgroundSize: "240px 200px",
                            animation: reduceMotion ? undefined : "twinkle-b 11s ease-in-out infinite reverse",
                            mixBlendMode: "screen",
                        }}
                    />
                ))
            )}
        </div>
    );
}

function LightShafts({
    phaseKey,
    intensity,
    reduceMotion,
}: {
    phaseKey: DayPhase;
    intensity: number;
    reduceMotion: boolean;
}) {
    return (
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none opacity-90">
            <motion.div
                animate={reduceMotion ? {} : { rotate: [0, 6, -4, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: reduceMotion ? 0 : 48, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-1/4 -top-1/4 w-[150%] h-[150%]"
                style={{
                    background: `conic-gradient(from 210deg,
            transparent 0deg,
            rgba(255,250,220,${0.03 * intensity}) 8deg,
            transparent 22deg,
            transparent 48deg,
            rgba(255,245,200,${0.042 * intensity}) 58deg,
            transparent 72deg,
            transparent 120deg,
            rgba(220,240,255,${0.025 * intensity}) 132deg,
            transparent 150deg)`,
                    filter: "blur(68px)",
                    mixBlendMode: phaseKey === "afternoon" || phaseKey === "morning" ? "soft-light" : "screen",
                }}
            />
        </div>
    );
}

function AuroraLayers({ reduceMotion, boosted }: {
    reduceMotion: boolean;
    boosted?: boolean;
}) {
    const b = boosted ? 1.4 : 1;
    return (
        <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
            <motion.div
                animate={reduceMotion ? {} : { x: ["-8%", "6%", "-5%"], opacity: [0.22 * b, 0.38 * b, 0.26 * b] }}
                transition={{ duration: reduceMotion ? 0 : 38, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-[10%] top-[6%] w-[70%] h-[44%] rounded-[100%]"
                style={{
                    background: "linear-gradient(105deg, transparent 0%, rgba(56,189,248,0.12) 35%, rgba(167,139,250,0.18) 55%, rgba(52,211,153,0.08) 80%, transparent 100%)",
                    filter: "blur(42px)",
                    mixBlendMode: "screen",
                }}
            />
            <motion.div
                animate={reduceMotion ? {} : { x: ["5%", "-7%", 0], y: [0, 12, 0], opacity: [0.18 * b, 0.26 * b, 0.2 * b] }}
                transition={{ duration: reduceMotion ? 0 : 44, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute right-[-5%] top-[18%] w-[55%] h-[38%] rounded-[100%]"
                style={{
                    background: "linear-gradient(120deg, transparent, rgba(192,132,252,0.14), rgba(96,165,250,0.1), transparent)",
                    filter: "blur(50px)",
                    mixBlendMode: "screen",
                }}
            />
            <motion.div
                animate={reduceMotion ? {} : { opacity: [0.12 * b, 0.22 * b, 0.14 * b], scaleY: [0.95, 1.05, 0.97] }}
                transition={{ duration: reduceMotion ? 0 : 22, repeat: Infinity }}
                className="absolute inset-x-0 bottom-0 h-[40%]"
                style={{
                    background: "linear-gradient(0deg, rgba(96,165,250,0.06) 0%, transparent 100%)",
                    filter: "blur(60px)",
                    mixBlendMode: "screen",
                }}
            />
        </div>
    );
}

function VolumetricClouds({
    wind,
    boost,
    isLight,
    accent,
    reduceMotion,
    nightLuxury,
}: {
    wind: number;
    boost: number;
    isLight: boolean;
    accent: WeatherAccent;
    reduceMotion: boolean;
    nightLuxury: boolean;
}) {
    const countBase = accent === "storm" ? 7 : accent === "cloudy" || accent === "rain" ? 6 : accent === "fog" ? 8 : 4;
    const count = Math.min(11, Math.round(countBase * boost));
    const speedMult = reduceMotion ? 0 : (1 + wind * 0.85) / Math.max(0.6, boost);

    const layers = [...Array(count)].map((_, i) => ({
        id: i,
        w: 420 + i * 90 + wind * 80,
        h: 140 + i * 28 + wind * 30,
        top: `${8 + (i * 13) % 62}%`,
        left: `${-22 + (i * 31) % 88}%`,
        dur: (72 + i * 18) / speedMult,
        delay: -i * 4.5,
        dir: i % 2 === 0 ? 120 : -120,
        op: accent === "fog" ? (0.18 + wind * 0.04) * boost : (0.13 + wind * 0.05) * boost,
        blur: accent === "fog" ? 56 + wind * 8 : 45 + wind * 6,
        night: !!(nightLuxury && !isLight),
    }));

    return (
        <div className="absolute inset-0 z-[3] overflow-hidden pointer-events-none">
            {layers.map((c) => (
                <motion.div
                    key={c.id}
                    animate={{ x: [0, c.dir, -c.dir * 0.4, 0] }}
                    transition={{
                        duration: reduceMotion ? 0 : c.dur,
                        delay: reduceMotion ? 0 : c.delay,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        position: "absolute",
                        width: c.w,
                        height: c.h,
                        borderRadius: "55%",
                        top: c.top,
                        left: c.left,
                        background: c.night
                            ? `radial-gradient(ellipse 120% 100% at 30% 28%,
                      rgba(218,228,252,${Math.min(0.52, c.op * 0.55)}) 0%,
                      rgba(92,102,138,${Math.min(0.38, c.op * 0.95)}) 38%,
                      rgba(42,48,72,${Math.min(0.32, c.op * 0.75)}) 100%)`
                            : isLight
                                ? `rgba(248,252,255,${c.op + 0.08})`
                                : `rgba(110,138,174,${c.op})`,
                        filter: `blur(${c.blur}px)`,
                        mixBlendMode: c.night ? "screen" : isLight ? "soft-light" : "screen",
                    }}
                />
            ))}
        </div>
    );
}

function WeatherStack({ accent, isLight, reduceMotion }: {
    accent: WeatherAccent;
    isLight: boolean;
    reduceMotion: boolean;
}) {
    if (!accent)
        return null;

    const dim = accent === "storm" ? "rgba(4,10,38,0.55)" : accent === "rain" ? "rgba(10,26,62,0.38)" : "rgba(8,22,54,0.28)";

    return (
        <>
            {(accent === "rain" || accent === "storm") && (
                <>
                    <div
                        className="absolute inset-0 z-[5]"
                        style={{
                            backgroundImage: `url(${RAIN_DROP})`,
                            backgroundSize: accent === "storm" ? "20px 58px" : "28px 72px",
                            opacity: accent === "storm" ? (isLight ? 0.28 : 0.48) : (isLight ? 0.2 : 0.38),
                            animation: reduceMotion ? undefined : (accent === "storm" ? "rain-heavy 0.32s linear infinite" : "rain 0.48s linear infinite"),
                            transform: "rotate(-9deg) scale(1.1)",
                            mixBlendMode: "soft-light",
                        }}
                    />
                    {accent === "storm" && (
                        <div
                            className="absolute inset-0 z-[5]"
                            style={{
                                backgroundImage: `url(${RAIN_DROP_HEAVY})`,
                                backgroundSize: "16px 48px",
                                opacity: isLight ? 0.22 : 0.4,
                                animation: reduceMotion ? undefined : "rain-heavy 0.24s linear infinite",
                                transform: "rotate(-11deg)",
                            }}
                        />
                    )}
                </>
            )}

            {accent === "snow" && (
                <>
                    <div
                        className="absolute inset-0 z-[5]"
                        style={{
                            backgroundImage: `url(${SNOW_LARGE})`,
                            backgroundSize: "72px 72px",
                            opacity: isLight ? 0.45 : 0.58,
                            animation: reduceMotion ? undefined : "snow-slow 10s linear infinite",
                        }}
                    />
                    <div
                        className="absolute inset-0 z-[5]"
                        style={{
                            backgroundImage: `url(${SNOW_MEDIUM})`,
                            backgroundSize: "48px 48px",
                            backgroundPosition: "20px 30px",
                            opacity: isLight ? 0.38 : 0.5,
                            animation: reduceMotion ? undefined : "snow-medium 7s linear infinite",
                        }}
                    />
                    <div
                        className="absolute inset-0 z-[5]"
                        style={{
                            backgroundImage: `url(${SNOW_SMALL})`,
                            backgroundSize: "32px 32px",
                            backgroundPosition: "8px 12px",
                            opacity: isLight ? 0.32 : 0.44,
                            animation: reduceMotion ? undefined : "snow-fast 5.5s linear infinite",
                        }}
                    />
                </>
            )}

            {accent === "fog" && (
                <>
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={`fog-${i}`}
                            animate={reduceMotion ? {} : { x: [0, i % 2 ? -72 : 80, 0] }}
                            transition={{ duration: reduceMotion ? 0 : 32 + i * 8, repeat: Infinity, ease: "easeInOut", delay: -i * 5 }}
                            className="absolute -left-[8%]"
                            style={{
                                width: "116%",
                                height: `${32 + i * 8}%`,
                                top: `${i * 12}%`,
                                borderRadius: "60%",
                                background: isLight
                                    ? `rgba(230,236,246,${0.32 + i * 0.04})`
                                    : `rgba(70,92,126,${0.34 + i * 0.04})`,
                                filter: `blur(${48 + i * 10}px)`,
                                mixBlendMode: isLight ? "soft-light" : "screen",
                                zIndex: 4,
                            }}
                        />
                    ))}
                </>
            )}

            {(accent === "rain" || accent === "storm" || accent === "cloudy" || accent === "snow") && (
                <div
                    className="absolute inset-0 z-[4]"
                    style={{
                        background: `radial-gradient(ellipse 110% 80% at 50% -10%, transparent 42%, ${dim} 100%)`,
                        mixBlendMode: "multiply",
                    }}
                />
            )}

            {accent === "storm" && (
                <>
                    <motion.div
                        className="absolute inset-0 z-[6]"
                        animate={reduceMotion ? {} : {
                            opacity: [0, 0, 0.55, 0.08, 0.45, 0, 0, 0, 0],
                        }}
                        transition={{ duration: reduceMotion ? 0 : 11, repeat: Infinity, ease: "linear" }}
                        style={{
                            background: "radial-gradient(circle at 40% 8%, rgba(220,235,255,0.5) 0%, transparent 45%)",
                            mixBlendMode: "screen",
                        }}
                    />
                    <motion.div
                        className="absolute inset-0 z-[6] mix-blend-screen"
                        style={{ animation: reduceMotion ? undefined : "lightning-flash 7s infinite" }}
                    />
                </>
            )}
        </>
    );
}

function AtmosphereTint({ phase, muted, light, }: {
    phase: DayPhase;
    muted: boolean;
    light: boolean;
}) {
    const t = DAY_PHASE_TINT[phase];
    const o = light
        ? muted ? 0.18 : 0.38
        : muted ? 0.32 : 0.62;
    return (
        <motion.div className="absolute inset-0 z-[7] pointer-events-none" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: o }} transition={{ duration: 3.5, ease: "easeInOut" }} style={{
            background: `
          linear-gradient(195deg, ${t.a} 0%, transparent 44%, ${t.b} 100%),
          radial-gradient(ellipse 100% 55% at 50% -2%, ${t.glow} 0%, transparent 58%),
          radial-gradient(ellipse 95% 58% at 50% 100%, ${t.vignette} 0%, transparent 58%)
        `,
            mixBlendMode: light ? "multiply" : "soft-light",
        }}
        />
    );
}

function AmbientParticles({ density, reduceMotion }: {
    density: number;
    reduceMotion: boolean;
}) {
    const seeds = [...Array(14)].map((_, i) => ({
        id: i,
        left: ((i * 37) % 92) + 4,
        top: ((i * 61) % 88) + 4,
        delay: ((i * 0.53) % 4),
        dur: 16 + (i % 7) * 3,
        size: i % 3 === 0 ? 2 : 1,
    }));

    return (
        <div className="absolute inset-0 z-[6] overflow-hidden pointer-events-none">
            {seeds.map((s) => (
                <motion.div
                    key={s.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${s.left}%`,
                        top: `${s.top}%`,
                        width: s.size,
                        height: s.size,
                        opacity: 0.2 * density,
                        boxShadow: s.size > 1 ? "0 0 6px 1px rgba(255,255,255,0.35)" : undefined,
                        willChange: "transform, opacity",
                    }}
                    animate={reduceMotion ? {} : { y: [0, -52, 0], x: [0, 14, -8, 0], opacity: [0.06 * density, 0.35 * density, 0.08 * density] }}
                    transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
}

function WindShear({ intensity, reduceMotion }: {
    intensity: number;
    reduceMotion: boolean;
}) {
    if (reduceMotion) {
        return (
            <div
                className="absolute inset-0 z-[6] pointer-events-none opacity-[0.18]"
                style={{
                    background: "linear-gradient(102deg, transparent 26%, rgba(255,255,255,0.07) 50%, transparent 74%)",
                    filter: "blur(28px)",
                }}
            />
        );
    }
    const dur = 16 + 10 * (1 - intensity);
    return (
        <motion.div className="absolute inset-0 z-[6] pointer-events-none opacity-35" style={{
            background: "linear-gradient(102deg, transparent 22%, rgba(255,255,255,0.09) 50%, transparent 78%)",
            filter: "blur(32px)",
            willChange: "transform",
        }} animate={{ x: ["-22%", "22%", "-22%"] }} transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

function WetGlassSheen() {
    return (<div className="absolute inset-0 z-[6] pointer-events-none opacity-[0.38] mix-blend-soft-light" style={{
            backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 3px, rgba(255,255,255,0.065) 4px, transparent 8px)",
            animation: "fog-drift-slow 5.5s ease-in-out infinite",
        }}/>);
}

function NebulaParallaxBackdrop({ reduceMotion }: {
    reduceMotion: boolean;
}) {
    return (
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden>
            <motion.div
                className="absolute -left-[20%] top-[-12%] h-[62%] w-[92%] rounded-[100%]"
                style={{
                    background: "radial-gradient(ellipse at 38% 40%, rgba(96,88,188,0.26) 0%, rgba(48,58,132,0.1) 48%, transparent 72%)",
                    filter: "blur(52px)",
                    mixBlendMode: "screen",
                }}
                animate={reduceMotion ? {} : { x: ["-3%", "5%", "-2%"], y: ["0%", "3%", "-1%"], scale: [1, 1.04, 1] }}
                transition={{ duration: 52, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute right-[-12%] top-[8%] h-[48%] w-[62%] rounded-[100%]"
                style={{
                    background: "radial-gradient(ellipse at 60% 45%, rgba(96,168,255,0.14) 0%, rgba(140,120,220,0.12) 42%, transparent 68%)",
                    filter: "blur(44px)",
                    mixBlendMode: "screen",
                }}
                animate={reduceMotion ? {} : { x: ["2%", "-4%", 1], y: ["1%", "-2%", 0] }}
                transition={{ duration: 44, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            />
            <motion.div
                className="absolute left-[8%] bottom-[-6%] h-[42%] w-[88%] rounded-[100%]"
                style={{
                    background: "linear-gradient(12deg, rgba(36,48,92,0.35) 0%, rgba(88,72,148,0.12) 45%, transparent 75%)",
                    filter: "blur(56px)",
                    mixBlendMode: "soft-light",
                }}
                animate={reduceMotion ? {} : { opacity: [0.55, 0.78, 0.6], x: ["-1%", "2%", 0] }}
                transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

function CinematicGradientLighting({ reduceMotion }: {
    reduceMotion: boolean;
}) {
    return (
        <motion.div
            aria-hidden
            className="absolute inset-0 z-[7] pointer-events-none mix-blend-soft-light"
            style={{
                background: `
          radial-gradient(ellipse 90% 55% at 10% 20%, rgba(147,197,253,0.09) 0%, transparent 55%),
          radial-gradient(ellipse 80% 50% at 85% 30%, rgba(167,139,250,0.1) 0%, transparent 50%),
          linear-gradient(125deg, transparent 20%, rgba(96,165,250,0.06) 48%, rgba(192,132,252,0.05) 62%, transparent 82%)
        `,
                opacity: 0.72,
            }}
            animate={reduceMotion ? {} : {
                opacity: [0.45, 0.85, 0.5],
                rotate: [0, 2, -1.5, 0],
            }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

function FilmGrain({ isLight }: {
    isLight: boolean;
}) {
    return (
        <div
            className="absolute inset-0 z-[8] pointer-events-none mix-blend-overlay"
            style={{
                opacity: isLight ? 0.045 : 0.12,
                backgroundImage:
                    `url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC43IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIwLjA2Ii8+PC9zdmc+')`,
            }}
        />
    );
}
