import type { HourlyPoint } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Cloud, Droplets } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "framer-motion";
import { useId, useMemo, useState } from "react";
import { useComfortGraphics } from "@/hooks/use-media-query";
import { HourlyWeatherGlyph } from "@/components/hourly-weather-glyphs";
import { LivingSkyAtlas } from "@/components/living-sky-atlas";
import type { SkyTimeFallback } from "@/lib/atmosphere-phase";
import { CINEMATIC_PHASE, effectiveDayPhase, weatherAccentFromCondition } from "@/lib/atmosphere-phase";
import type { DayPhase } from "@/lib/day-phase";
import { dayPhaseToSkyPeriod } from "@/lib/day-phase";

interface Pt {
    x: number;
    y: number;
}

function skyPeriodToFallback(period: ReturnType<typeof dayPhaseToSkyPeriod>): SkyTimeFallback {
    if (period === "morning")
        return "morning";
    if (period === "afternoon")
        return "afternoon";
    if (period === "evening")
        return "evening";
    return "night";
}

/** Open Catmull–Rom–style cubic through knots (premium smooth spline). */
function cubicSplineOpenPath(points: Pt[]): string {
    if (points.length === 0)
        return "";
    if (points.length === 1)
        return `M ${points[0]!.x} ${points[0]!.y}`;
    const alpha = 0.22;
    const d: string[] = [`M ${points[0]!.x} ${points[0]!.y}`];
    const n = points.length;
    for (let i = 0; i < n - 1; i++) {
        const p0 = points[Math.max(0, i - 1)]!;
        const p1 = points[i]!;
        const p2 = points[i + 1]!;
        const p3 = points[Math.min(n - 1, i + 2)]!;
        const c1x = p1.x + (p2.x - p0.x) * alpha;
        const c1y = p1.y + (p2.y - p0.y) * alpha;
        const c2x = p2.x - (p3.x - p1.x) * alpha;
        const c2y = p2.y - (p3.y - p1.y) * alpha;
        d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
    }
    return d.join(" ");
}

interface HourlyForecastCinematicProps {
    hourly: HourlyPoint[];
    convertTemp: (c: number) => number;
    tempSuffix: string;
    dayPhase?: DayPhase | null;
    conditionCode?: string;
    windSpeedKmh?: number;
}

export function HourlyForecastCinematic({
    hourly,
    convertTemp,
    tempSuffix,
    dayPhase = null,
    conditionCode = "clear",
    windSpeedKmh = 12,
}: HourlyForecastCinematicProps) {
    const uid = useId().replace(/:/g, "");
    const comfortGraphics = useComfortGraphics();
    const reduceMotionOS = useReducedMotion();
    const calm = !!(reduceMotionOS || comfortGraphics);
    const accent = weatherAccentFromCondition(conditionCode);
    const timeFallback =
        dayPhase ? skyPeriodToFallback(dayPhaseToSkyPeriod(dayPhase)) : ("evening" as SkyTimeFallback);
    const phase = effectiveDayPhase(dayPhase, timeFallback);
    const cfg = CINEMATIC_PHASE[phase];

    const [emblaRef] = useEmblaCarousel({
        dragFree: true,
        containScroll: "trimSnaps",
    });
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    const slice = hourly.slice(0, 24);
    const temps = useMemo(() => slice.map((h) => convertTemp(h.temperature)), [slice, convertTemp]);
    const precip = useMemo(() => slice.map((h) => h.precipitationProbability), [slice]);

    const w = 720;
    const h = 176;
    const padX = 22;
    const padTop = 30;
    const padBot = 24;

    const { pathD, areaD, maxT, minT, pts, maxIdx, minIdx, precipPath } = useMemo(() => {
        if (temps.length === 0) {
            return { pathD: "", areaD: "", maxT: 0, minT: 0, pts: [] as Pt[], maxIdx: 0, minIdx: 0, precipPath: "" };
        }
        const max = Math.max(...temps);
        const min = Math.min(...temps);
        const range = Math.max(max - min, 4);
        const n = temps.length;
        const step = (w - padX * 2) / Math.max(n - 1, 1);

        let maxI = 0;
        let minI = 0;
        temps.forEach((t, i) => {
            if (t >= temps[maxI]!) maxI = i;
            if (t <= temps[minI]!) minI = i;
        });

        const ptsCalc: Pt[] = temps.map((t, i) => {
            const x = padX + i * step;
            const yNorm = (t - min) / range;
            const y = padTop + (1 - yNorm) * (h - padTop - padBot);
            return { x, y };
        });

        const path = cubicSplineOpenPath(ptsCalc);
        const first = ptsCalc[0]!;
        const last = ptsCalc[ptsCalc.length - 1]!;
        const baseY = h - padBot;
        let tail = path;
        tail = tail.replace(/^M\s+[-\d.]+\s+[-\d.]+(?:\s+)?/, "");

        const area = `M ${first.x} ${baseY} L ${first.x} ${first.y} ${tail} L ${last.x} ${baseY} Z`;

        let pd = "";
        if (precip.length > 0) {
            const base = h - 14;
            pd = `M ${padX} ${base}`;
            precip.forEach((p, i) => {
                const x = padX + i * step;
                pd += ` L ${x} ${base - (p / 100) * 30}`;
            });
            pd += ` L ${padX + (n - 1) * step} ${base} Z`;
        }

        return { pathD: path, areaD: area, maxT: max, minT: min, pts: ptsCalc, maxIdx: maxI, minIdx: minI, precipPath: pd };
    }, [temps, precip, w, h, padX, padTop, padBot]);

    const gidFill = `hfc-fill-${uid}`;
    const gidStroke = `hfc-line-${uid}`;
    const gidPrecip = `hfc-pr-${uid}`;
    const fGlow = `hfc-soft-${uid}`;
    const fBloom = `hfc-bloom-${uid}`;
    const fNeonOuter = `hfc-neon-outer-${uid}`;
    const fMarkerGlow = `hfc-mk-${uid}`;

    const pMax = pts[maxIdx];
    const pMin = pts[minIdx];
    const baseY = h - padBot;

    const wind01 = Math.min(1.2, windSpeedKmh / 55);

    return (
        <div
            className={[
                "relative isolate min-h-[24rem] overflow-hidden rounded-[2rem]",
                "border border-[rgba(255,248,230,0.18)] shadow-[0_36px_100px_-40px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(12,22,74,0.38)]",
                "ring-1 ring-inset ring-white/[0.08]",
                "backdrop-blur-[14px]",
            ].join(" ")}
        >
            {/* —— Full cinematic atlas (dramatic volumetric matte, synced to live atmosphere) —— */}
            <div className="pointer-events-none absolute inset-0 z-0 [&_img]:pointer-events-none [&_img]:select-none" aria-hidden>
                <LivingSkyAtlas
                    phase={phase}
                    accent={accent}
                    calm={calm}
                    narrow={comfortGraphics}
                    wind01={wind01}
                    lightShafts={cfg.lightShafts}
                    moonSpec={cfg.moon !== false ? cfg.moon : false}
                />
            </div>

            {/* Sunset/sun-bench lighting: left readability leg, right golden volumetric bleed */}
            <div
                className="pointer-events-none absolute inset-0 z-[2] opacity-[0.92] mix-blend-soft-light"
                style={{
                    background: `
                      linear-gradient(
                        105deg,
                        rgba(6,14,62,0.52) 0%,
                        rgba(255,120,118,0.065) min(72%, calc(28rem)),
                        transparent 94%
                      ),
                      linear-gradient(
                        194deg,
                        rgba(255,204,154,0.18) -4%,
                        transparent min(74%, calc(560px)),
                        rgba(72,132,246,0.12) 100%
                      ),
                      radial-gradient(circle farthest-corner at 108% -4%, rgba(255,246,210,0.26), transparent 56%),
                      radial-gradient(circle farthest-corner at 82% 8%, rgba(255,246,226,0.14), transparent 48%),
                      radial-gradient(circle farthest-corner at -8% 100%, rgba(20,118,246,0.12), transparent 58%),
                      radial-gradient(circle farthest-corner at 32% 100%, rgba(120,246,246,0.08), transparent 52%),
                      radial-gradient(circle farthest-corner at 100% 106%, rgba(255,246,226,0.08), transparent 44%),
                      radial-gradient(circle farthest-corner at -8% -4%, rgba(255,246,246,0.06), transparent 52%),
                      radial-gradient(ellipse 118% 48% at 50% 100%, rgba(8,148,246,0.1), transparent 58%)
                    `,
                }}
            />

            {/* Near-field mist + floating dust (screen-lit motes) */}
            {!comfortGraphics && (
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[3] opacity-45 mix-blend-screen"
                    style={{
                        background: "linear-gradient(180deg, rgba(255,250,246,0.12) 0%, transparent min(74%, calc(620px))), linear-gradient(0deg, transparent 74%, rgba(24,118,246,0.14) 100%)",
                    }}
                    animate={calm ? { opacity: 0.38 } : { opacity: [0.38, 0.52, 0.41], scale: [1, 1.02, 1] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
            {!comfortGraphics && !calm && (
                <div className="pointer-events-none absolute inset-0 z-[4]" aria-hidden>
                    {[...Array(18)].map((_, i) => (
                        <motion.span
                            key={`m-${uid}-${i}`}
                            className="absolute rounded-full bg-[rgba(255,248,226,0.35)] blur-[2px]"
                            style={{
                                left: `${((i * 137) % 92) + 4}%`,
                                top: `${((i * 211) % 78) + 8}%`,
                                width: `${1.8 + (i % 6) * 0.42}px`,
                                height: `${1.8 + (i % 6) * 0.42}px`,
                            }}
                            animate={{ y: [0, -18 + (i % 5), 0], x: [0, 6 + (i % 3), 0], opacity: [0.12, 0.38, 0.16] }}
                            transition={{
                                duration: 12 + i * 1.05,
                                delay: ((i % 9) / 22) % 21,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Readable glass strata over chart */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] opacity-70"
                style={{
                    boxShadow:
                        "inset 1px 0 0 rgba(255,246,246,0.14), inset 0 52px 80px rgba(8,22,62,0.22), inset 0 -140px 90px rgba(6,14,62,0.45)",
                    borderRadius: "inherit",
                }}
            />

            {/* —— HUD content —— */}
            <div className="relative z-20 flex min-h-[inherit] flex-col">
                <header className="relative flex flex-wrap items-start justify-between gap-4 px-5 pb-4 pt-5 md:px-7 md:pt-7">
                    <div className="flex min-w-0 items-center gap-3">
                        <Cloud className="h-6 w-6 shrink-0 text-[rgba(255,246,236,0.78)] opacity-90 [&_circle]:stroke-[1.05] [&_circle]:stroke-white/85"/>
                        <div>
                            <p className="text-[15px] font-semibold capitalize tracking-[0.02em] text-white/[0.95] drop-shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
                                Hourly timeline
                            </p>
                        </div>
                    </div>
                    <div
                        className="shrink-0 rounded-[14px] border border-[rgba(255,248,246,0.2)] px-4 py-2.5 backdrop-blur-2xl"
                        style={{
                            backgroundImage: "linear-gradient(145deg,rgba(10,22,62,0.52),rgba(16,144,246,0.14))",
                            backgroundColor: "rgba(246,246,246,0.08)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px rgba(6,118,246,0.06), 0 18px 40px rgba(24,246,246,0.12)",
                            borderRadius: "16px",
                        }}
                    >
                        <p className="text-[0.95rem] font-semibold tabular-nums tracking-tight text-white drop-shadow-[0_14px_32px_rgba(0,0,0,0.45)]">
                            {format(new Date(), "EEEE, d MMM")}
                        </p>
                        <p className="text-left font-sans text-[0.76rem] tabular-nums leading-tight text-white/[0.68] md:text-[0.8rem]">
                            {format(new Date(), "h:mm a")}
                        </p>
                    </div>
                </header>

                <div className="relative px-3 pb-1 pt-1 sm:px-5 md:px-8">
                    <svg viewBox={`0 0 ${w} ${h}`} className="block h-auto max-h-[220px] w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
                        <defs>
                            <linearGradient id={gidFill} x1="0" y1="0" x2="0.9" y2="1">
                                <stop offset="0%" stopColor="rgba(255,246,206,0.38)"/>
                                <stop offset="32%" stopColor="rgba(120,222,246,0.22)"/>
                                <stop offset="100%" stopColor="rgba(32,226,246,0.038)"/>
                            </linearGradient>
                            <linearGradient id={gidStroke} x1="0" y1="0.5" x2="1" y2="0.5">
                                <stop offset="0%" stopColor="#fde68a"/>
                                <stop offset="18%" stopColor="#fbbf24"/>
                                <stop offset="44%" stopColor="#fde047"/>
                                <stop offset="58%" stopColor="#a5f3fc"/>
                                <stop offset="78%" stopColor="#38bdf8"/>
                                <stop offset="100%" stopColor="#c8fffe"/>
                            </linearGradient>
                            <linearGradient id={gidPrecip} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="rgba(200,246,252,0.22)"/>
                                <stop offset="100%" stopColor="rgba(32,246,246,0.04)"/>
                            </linearGradient>
                            <filter id={fGlow} x="-55%" y="-55%" width="210%" height="210%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="2.75" result="b"/>
                                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                            <filter id={fBloom} x="-95%" y="-95%" width="290%" height="290%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="7.25" result="blo"/>
                                <feMerge><feMergeNode in="blo"/></feMerge>
                            </filter>
                            <filter id={fNeonOuter} x="-120%" y="-120%" width="340%" height="340%">
                                <feGaussianBlur stdDeviation="6.85" result="outer"/>
                                <feGaussianBlur in="SourceGraphic" stdDeviation="2.05" result="core"/>
                                <feMerge><feMergeNode in="outer"/><feMergeNode in="core"/></feMerge>
                            </filter>
                            <filter id={fMarkerGlow} x="-230%" y="-230%" width="560%" height="560%">
                                <feGaussianBlur stdDeviation="3.8" result="mk"/>
                                <feMerge><feMergeNode in="mk"/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                        </defs>

                        {precipPath ? <path d={precipPath} fill={`url(#${gidPrecip})`} opacity={0.85}/> : null}

                        {slice.length > 0
                            ? pts.map((pv, ig) => (
                                <line
                                    key={`g-${uid}-${ig}`}
                                    x1={pv.x}
                                    x2={pv.x}
                                    y1={padTop + 6}
                                    y2={baseY + 4}
                                    stroke="rgba(255,251,239,0.07)"
                                    strokeWidth="1"
                                    strokeDasharray="4 10"
                                    strokeLinecap="round"
                                />
                            ))
                            : null}

                        {areaD ? <path d={areaD} fill={`url(#${gidFill})`} opacity={0.78}/> : null}

                        {pMax ? (
                            <>
                                <line
                                    x1={pMax.x}
                                    y1={pMax.y + 10}
                                    x2={pMax.x}
                                    y2={baseY + 8}
                                    stroke="rgba(255,253,239,0.28)"
                                    strokeWidth="1.1"
                                    strokeDasharray="5 9"
                                    strokeLinecap="round"
                                />
                                <circle cx={pMax.x} cy={pMax.y} r="11" fill="rgba(174,246,255,0.22)" opacity={1} filter={`url(#${fMarkerGlow})`}/>
                                <circle cx={pMax.x} cy={pMax.y} r="8" fill="rgba(246,251,251,0.98)" opacity={1} stroke="rgba(255,246,239,0.55)" strokeWidth="1"/>
                            </>
                        ) : null}
                        {pMin && (minIdx !== maxIdx || slice.length <= 1) ? (
                            <>
                                <line
                                    x1={pMin.x}
                                    y1={Math.min(pMin.y + 8, baseY)}
                                    x2={pMin.x}
                                    y2={baseY + 8}
                                    stroke="rgba(236,244,251,0.22)"
                                    strokeWidth="1.05"
                                    strokeDasharray="5 11"
                                    strokeLinecap="round"
                                />
                                <circle cx={pMin.x} cy={pMin.y} r="9.5" fill="rgba(255,232,174,0.24)" opacity={1} filter={`url(#${fMarkerGlow})`}/>
                                <circle cx={pMin.x} cy={pMin.y} r="6" fill="rgba(255,250,239,0.94)" opacity={1} stroke="rgba(255,240,238,0.45)" strokeWidth="0.9"/>
                            </>
                        ) : null}

                        {pathD && !calm ? (
                            <>
                                <motion.path
                                    d={pathD}
                                    fill="none"
                                    stroke="rgba(246,246,246,0.34)"
                                    strokeWidth="17"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter={`url(#${fBloom})`}
                                    initial={{ opacity: 0.5 }}
                                    animate={{ opacity: [0.52, 0.72, 0.56] }}
                                    transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <motion.path
                                    d={pathD}
                                    fill="none"
                                    stroke="rgba(255,250,239,0.42)"
                                    strokeWidth="13"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter={`url(#${fNeonOuter})`}
                                    initial={{ opacity: 0.42 }}
                                    animate={{ opacity: [0.4, 0.64, 0.44] }}
                                    transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </>
                        ) : (
                            <>
                                <path
                                    d={pathD ?? ""}
                                    fill="none"
                                    stroke="rgba(246,246,246,0.32)"
                                    strokeWidth="17"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter={`url(#${fBloom})`}
                                    opacity={0.58}
                                />
                                <path
                                    d={pathD ?? ""}
                                    fill="none"
                                    stroke="rgba(255,248,239,0.42)"
                                    strokeWidth="13"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter={`url(#${fNeonOuter})`}
                                    opacity={0.5}
                                />
                            </>
                        )}

                        {pathD ? (
                            <path
                                d={pathD}
                                fill="none"
                                stroke="rgba(246,246,246,0.38)"
                                strokeWidth="9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter={`url(#${fGlow})`}
                                opacity={0.9}
                            />
                        ) : null}
                        {pathD ? (
                            <path
                                d={pathD}
                                fill="none"
                                stroke={`url(#${gidStroke})`}
                                strokeWidth="3.85"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={0.98}
                            />
                        ) : null}

                        {pMax ? (
                            <text
                                x={Math.min(Math.max(pMax.x - 42, 8), w - 120)}
                                y={Math.max(pMax.y - 18, padTop)}
                                fill="rgba(246,246,239,0.94)"
                                fontSize="12"
                                fontWeight={600}
                                fontFamily='ui-sans-serif,system-ui,sans-serif'
                                letterSpacing="0.18em"
                            >
                                PEAK
                                <tspan dx="6" dy="0" letterSpacing="0.04em">{` ${Math.round(maxT)}°`}</tspan>
                            </text>
                        ) : null}
                        {pMin && minIdx !== maxIdx ? (
                            <text
                                x={Math.min(Math.max(pMin.x - 44, 6), w - 126)}
                                y={Math.min(pMin.y + 32, baseY)}
                                fill="rgba(246,246,246,0.88)"
                                fontSize="12"
                                fontWeight={600}
                                fontFamily='ui-sans-serif,system-ui,sans-serif'
                                letterSpacing="0.18em"
                            >
                                FLOOR
                                <tspan dx="6" dy="0" letterSpacing="0.04em">{` ${Math.round(minT)}°`}</tspan>
                            </text>
                        ) : null}
                    </svg>
                </div>

                <div className="border-t border-[rgba(255,248,244,0.08)] px-2 pb-2 pt-3 sm:px-4 md:px-6 md:pb-3 md:pt-4">
                    <div className="overflow-hidden [&_.embla__viewport]:touch-pan-x" ref={emblaRef}>
                        <div className="flex touch-pan-x gap-3 px-1.5 pb-2 pt-2 sm:gap-4 sm:px-2">
                            {slice.map((hour, i) => {
                                const night = hour.icon.endsWith("n");
                                const isNow = i === 0;
                                const hovered = hoverIdx === i || (hoverIdx === null && isNow);
                                return (
                                    <motion.div
                                        key={`${hour.time}-${i}`}
                                        layout={false}
                                        role="presentation"
                                        onMouseEnter={() => setHoverIdx(i)}
                                        onMouseLeave={() => setHoverIdx(null)}
                                        whileHover={
                                            calm || comfortGraphics ?
                                                {}
                                                :   {
                                                        y: -5,
                                                        scale: isNow ? 1.03 : 1.024,
                                                        transition: { type: "spring", stiffness: 420, damping: 30 },
                                                    }
                                        }
                                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                        className={[
                                            "relative flex min-h-[170px] w-[82px] flex-none cursor-grab flex-col items-center justify-between gap-1.5 rounded-[1.2rem]",
                                            "border px-3 py-4 backdrop-blur-[22px] active:cursor-grabbing sm:min-h-[178px] sm:w-[96px]",
                                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-[transform,background-color,border-color,box-shadow,filter] duration-500",
                                            isNow ?
                                                [
                                                    "border-[rgba(255,214,174,0.58)] bg-gradient-to-b from-white/[0.2] via-white/[0.08] to-[rgba(32,246,246,0.05)]",
                                                    "shadow-[0_0_48px_-14px_rgba(251,191,86,0.45),0_24px_64px_-40px_rgba(0,0,0,0.55)]",
                                                    "brightness-[1.08]",
                                                ].join(" ")
                                            : hovered ?
                                                "border-[rgba(255,255,255,0.22)] bg-white/[0.12] shadow-[0_20px_54px_-36px_rgba(0,0,0,0.5)]"
                                            :   "border-white/[0.1] bg-white/[0.055] hover:border-[rgba(255,255,255,0.2)] hover:bg-white/[0.088]",
                                        ].join(" ")}
                                    >
                                        {isNow ? (
                                            <>
                                                <span
                                                    aria-hidden
                                                    className="pointer-events-none absolute inset-x-3 top-px z-[1] h-[1px] rounded-full bg-gradient-to-r from-transparent via-[rgba(255,239,218,0.95)] to-transparent"
                                                />
                                                <span className="pointer-events-none absolute inset-[0] rounded-[inherit] ring-2 ring-[rgba(255,210,138,0.28)] opacity-95" aria-hidden/>
                                                <span
                                                    aria-hidden
                                                    className="pointer-events-none absolute inset-x-3 bottom-[9px] z-[2] h-[3px] rounded-full bg-gradient-to-r from-transparent via-amber-200/92 to-transparent shadow-[0_0_28px_rgba(251,191,106,0.45)]"
                                                />
                                            </>
                                        ) : null}
                                        <span className="relative z-[3] pt-0.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/[0.9] drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)]">
                                            {isNow ? "NOW" : format(new Date(hour.time * 1000), "ha")}
                                        </span>
                                        <div className="relative z-[3] flex min-h-[3.85rem] flex-1 flex-col items-center justify-center pt-2">
                                            <HourlyWeatherGlyph icon={hour.icon} accent={night ? "night" : "day"} variant="luxury"/>
                                        </div>
                                        <span className="relative z-[3] text-[17px] font-semibold tabular-nums tracking-tight text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.45)] sm:text-[18px]">
                                            {Math.round(convertTemp(hour.temperature))}
                                            <span className="text-[12px] font-medium text-white/78">{tempSuffix}</span>
                                        </span>
                                        {(hour.condition?.trim() ?? "") && hour.precipitationProbability <= 15 ? (
                                            <span className="relative z-[3] max-w-[5.75rem] line-clamp-2 text-center text-[9px] font-medium capitalize leading-snug tracking-[0.04em] text-white/[0.48]">
                                                {hour.condition}
                                            </span>
                                        ) : null}
                                        {hour.precipitationProbability > 5 ? (
                                            <div className="relative z-[3] flex items-center gap-1 text-[10px] font-semibold tracking-wide text-[#a5f6ff] drop-shadow-[0_2px_10px_rgba(56,189,246,0.4)]">
                                                <Droplets className="h-3 w-3 shrink-0 opacity-92"/>
                                                <span>{hour.precipitationProbability}%</span>
                                            </div>
                                        ) : null}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
