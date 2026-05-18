/** Radar and satellite preview visuals — layered map presentation (preview only). */
import { motion, useReducedMotion } from "framer-motion";
import { useId, useMemo } from "react";
import { useComfortGraphics } from "@/hooks/use-media-query";

function citySeed(cityName: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < cityName.length; i++)
        h = Math.imul(h ^ cityName.charCodeAt(i), 16777619) >>> 0;
    return h;
}

/** Deterministic precip / storm blobs from city string (reads stable per locale). */
function seededPrecipEchoes(seed: number, count: number) {
    let s = seed;
    const next = () => {
        s = (Math.imul(s, 1103515245) + 12345) >>> 0;
        return s / 4294967296;
    };
    return [...Array(count)].map((_, i) => ({
        cx: next() * 78 + 11,
        cy: next() * 72 + 14,
        r: 14 + next() * 28,
        o: 0.18 + next() * 0.38,
        driftX: (next() - 0.5) * 22,
        driftY: (next() - 0.5) * 14,
        hue: i % 5 === 0 ? "storm" : "rain",
        dur: 38 + next() * 28,
        delay: next() * 8,
    }));
}

interface AtmosphereMapCanvasProps {
    mode: "radar" | "globe";
    cityLabel: string;
}

export function AtmosphereMapCanvas({ mode, cityLabel }: AtmosphereMapCanvasProps) {
    const reduceMotion = useReducedMotion();
    const comfort = useComfortGraphics();
    const calm = !!(reduceMotion || comfort);
    const seed = citySeed(cityLabel || "");
    const bands = useMemo(() => seededPrecipEchoes(seed ^ 0xfeedface, calm ? 5 : 8), [seed, calm]);

    const uid = useId().replace(/:/g, "").slice(-8);

    return (
        <div
            className="relative isolate w-full overflow-hidden rounded-2xl border border-[rgba(200,226,246,0.09)] shadow-[inset_0_1px_0_rgba(255,252,248,0.06),inset_0_-1px_0_rgba(2,12,42,0.55),0_20px_60px_-24px_rgba(0,0,0,0.55)]"
            style={{
                aspectRatio: "16 / 10",
                maxHeight: "min(340px, 52dvh)",
                minHeight: 220,
                background: "linear-gradient(168deg, #020817 0%, #061229 52%, #0a1838 100%)",
            }}
        >
            {/* Subtle vignette */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.92]"
                style={{
                    mixBlendMode: "multiply",
                    background:
                        "radial-gradient(ellipse 92% 88% at 50% 54%, transparent 52%, rgba(2,12,52,0.85) 100%), radial-gradient(ellipse 70% 50% at 50% -6%, rgba(120,172,246,0.06) 0%, transparent 58%)",
                }}
            />

            {mode === "radar"
                ? (
                        <RadarPpiLayer
                            uid={uid}
                            calm={calm}
                            bands={bands}
                        />
                    )
                :   (
                        <GlobeThermosphere uid={uid} calm={calm} seed={seed}/>
                    )}

            {/* Specular skim — restrained, physics-like glare */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.42]"
                style={{
                    mixBlendMode: "soft-light",
                    background:
                        "linear-gradient(128deg, rgba(255,255,255,0.14) 0%, transparent 22%, transparent 58%, rgba(80,132,246,0.08) 100%)",
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-[1px] rounded-[calc(1rem-1px)] shadow-[inset_0_-18px_40px_-28px_rgba(0,0,0,0.45)] opacity-90"
            />
        </div>
    );
}

function RadarPpiLayer({
    uid,
    calm,
    bands,
}: {
    uid: string;
    calm: boolean;
    bands: ReturnType<typeof seededPrecipEchoes>;
}) {
    return (
        <div className="absolute inset-0">
            {/* Micro-texture — sensor grain */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage:
                        `radial-gradient(circle,rgba(255,251,239,0.14) 0.42px,transparent 0.5px),
                         radial-gradient(circle,rgba(255,251,239,0.06) 0.35px,transparent 0.45px)`,
                    backgroundSize: "28px 28px, 14px 14px",
                    backgroundPosition: "0 0, 9px 7px",
                    mixBlendMode: "overlay",
                }}
            />

            {/* Base field — CRT-like cyan bias without neon */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.55]"
                style={{
                    background:
                        "radial-gradient(circle at 50% 50%, rgba(32,152,246,0.085) 0%, transparent 55%), radial-gradient(ellipse 118% 100% at 50% 118%, rgba(6,162,232,0.06) 0%, transparent 62%)",
                }}
            />

            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 250" aria-hidden preserveAspectRatio="none">
                <defs>
                    <radialGradient id={`ppi-vig-${uid}`} cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor="rgba(14,165,233,0.08)" />
                        <stop offset="100%" stopColor="rgba(2,14,54,0.55)" />
                    </radialGradient>
                    <filter id={`ppm-soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" />
                    </filter>
                </defs>

                {/* Range rings */}
                {[0.22, 0.42, 0.62].map((scale, ix) => (
                    <ellipse
                        key={`ring-${ix}`}
                        cx="200"
                        cy="138"
                        rx={170 * scale}
                        ry={(170 * scale * 238) / 400}
                        fill="none"
                        stroke={`rgba(196,226,246,${0.05 + ix * 0.018})`}
                        strokeWidth={0.6}
                        strokeDasharray="2 14"
                        strokeLinecap="round"
                    />
                ))}

                <rect width="400" height="250" fill={`url(#ppi-vig-${uid})`} opacity={0.9} />

                {/* Distance spokes — very muted */}
                <g opacity={0.14} stroke="rgba(200,226,246,0.35)" strokeWidth={0.5}>
                    {[0, 30, 60, 90, 120, 150].map(deg => (
                        <line
                            key={`sp-${deg}`}
                            x1="200"
                            y1="138"
                            x2={200 + 182 * Math.cos((deg - 90) * (Math.PI / 180))}
                            y2={138 + 182 * Math.sin((deg - 90) * (Math.PI / 180))}
                        />
                    ))}
                </g>
            </svg>

            {/* Accumulation cells — softened “echo” */}
            <div aria-hidden className="absolute inset-0 rounded-[inherit]">
                {bands.map((b, i) => {
                    const col =
                        b.hue === "storm"
                            ? "radial-gradient(circle,rgba(176,154,246,0.45) 0%, rgba(246,226,246,0.1) 45%,transparent 74%)"
                        : i % 3 === 0
                                ? "radial-gradient(circle,rgba(90,220,246,0.42) 0%, rgba(148,248,246,0.12) 38%,transparent 72%)"
                        :       "radial-gradient(circle,rgba(130,246,208,0.42) 0%, rgba(180,248,246,0.11) 40%,transparent 70%)";
                    return (
                        <div
                            key={`cell-anchor-${uid}-${i}`}
                            className="pointer-events-none absolute"
                            style={{
                                left: `${b.cx}%`,
                                top: `${b.cy}%`,
                            }}
                        >
                            <motion.div
                                className="pointer-events-none h-0 w-0"
                                animate={
                                    calm
                                        ? {}
                                        :   {
                                                x: [0, b.driftX, -b.driftX * 0.4, 0],
                                                y: [0, -b.driftY, b.driftY * 0.3, 0],
                                            }
                                }
                                transition={{
                                    duration: b.dur,
                                    repeat: calm ? 0 : Infinity,
                                    ease: "easeInOut",
                                    delay: b.delay,
                                }}
                            >
                                <div
                                    className="pointer-events-none absolute rounded-full blur-[21px] -translate-x-1/2 -translate-y-1/2"
                                    style={{
                                        width: `${b.r * 5}px`,
                                        height: `${b.r * 5}px`,
                                        background: col,
                                        opacity: b.o,
                                    }}
                                />
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Slow sweep cue — faint, avoids toy-radar pacing */}
            <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-[-4%]"
                style={{
                    background:
                        "conic-gradient(from 0deg at 50% 55.5%, transparent 0deg 336deg, rgba(140,226,246,0.065) 345deg 352deg, rgba(220,248,246,0.084) 358deg 360deg)",
                    opacity: calm ? 0.55 : 0.92,
                    mixBlendMode: "screen",
                }}
                animate={calm ? { rotate: 0 } : { rotate: 360 }}
                transition={calm ? { duration: 0 } : { duration: 52, repeat: Infinity, ease: "linear" }}
            />

            {/* Gentle scan-line pulse */}
            {!calm && (
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.14]"
                    style={{
                        mixBlendMode: "soft-light",
                        backgroundImage:
                            "repeating-linear-gradient(-11deg, transparent, transparent 16px, rgba(255,251,239,0.05) 16px 17px), repeating-linear-gradient(14deg, transparent, transparent 42px, rgba(246,246,252,0.03) 42px 43px)",
                    }}
                    animate={{ opacity: [0.09, 0.16, 0.09] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                />
            )}

            {/* CRT edge darkening */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                    boxShadow:
                        "inset 0 0 140px rgba(2,14,62,0.58), inset 0 22px 60px rgba(4,132,246,0.05)",
                    mixBlendMode: "multiply",
                    opacity: 0.92,
                }}
            />
        </div>
    );
}

function GlobeThermosphere({
    uid,
    calm,
    seed,
}: {
    uid: string;
    calm: boolean;
    seed: number;
}) {
    const cloudLayers = useMemo(() => {
        let si = seed ^ 0x9e3779b9;
        const next = () => {
            si = (Math.imul(si, 1664525) + 1013904223) >>> 0;
            return si / 4294967296;
        };
        return [...Array(calm ? 4 : 6)].map((_, i) => ({
            cx: next() * 80 + 10,
            cy: next() * 70 + 10,
            w: 34 + next() * 48,
            blur: 16 + next() * 18,
            o: 0.07 + next() * 0.06,
            dur: 55 + next() * 40,
            drift: (next() - 0.5) * 18,
            rot: next() > 0.48 ? -1 : 1,
            delay: next() * 12,
            i,
        }));
    }, [calm, seed]);

    return (
        <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-7">
            <div className="relative flex h-[min(88%,300px)] w-[min(88%,300px)] items-center justify-center [perspective:1200px]">
                {/* Exosphere halo */}
                <motion.div
                    aria-hidden
                    className="absolute aspect-square w-[117%] max-w-none rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle at 50% 50%, rgba(148,246,246,0.15) 0%, rgba(94,226,246,0.06) 32%, transparent 68%)",
                        filter: "blur(22px)",
                        mixBlendMode: "screen",
                        opacity: 0.75,
                    }}
                    animate={calm ? {} : { opacity: [0.62, 0.82, 0.64], scale: [1, 1.02, 1] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.div
                    aria-hidden
                    className="relative aspect-square h-full max-h-[min(284px,calc(72vw))] rounded-full shadow-[inset_-28px_-36px_80px_rgba(0,0,0,0.62),inset_12px_18px_64px_rgba(148,246,246,0.08),0_42px_100px_-32px_rgba(0,0,0,0.55)]"
                    style={{
                        rotateX: 8,
                        background: `
                              radial-gradient(ellipse 138% 120% at 28% 24%, rgba(255,252,248,0.26) 0%, transparent 38%),
                              radial-gradient(circle at 124% 18%, rgba(32,246,246,0.06) 0%, transparent 45%),
                              radial-gradient(circle at 118% 48%, rgba(246,246,252,0.05) 0%, transparent 42%),
                              radial-gradient(circle at 80% -8%, rgba(74,246,246,0.15) 0%, transparent 40%),
                              radial-gradient(circle at 50% 50%, #0f2446 0%, #06162e 54%, #020818 94%)`,
                        boxShadow:
                            "inset 0 -62px 100px rgba(4,14,62,0.88), inset 26px -18px 60px rgba(10,246,246,0.06), inset -8px -8px 30px rgba(0,8,52,0.9)",
                    }}
                    animate={calm ? { rotateZ: 0 } : { rotateZ: [-1.4, 1.4, -1.4] }}
                    transition={calm ? { duration: 0 } : { duration: 88, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Graticule — orthographic arcs */}
                    <svg className="absolute inset-[-2px] rounded-full opacity-[0.12]" viewBox="0 0 200 200" aria-hidden>
                        <defs>
                            <clipPath id={`gclip-${uid}`}>
                                <circle cx="100" cy="100" r="99" />
                            </clipPath>
                        </defs>
                        <g clipPath={`url(#gclip-${uid})`} stroke="rgba(226,239,246,0.5)" strokeWidth={0.35} fill="none">
                            {[88, 92, 96, 100, 104, 108, 112].map((ry, iy) => (
                                <ellipse
                                    key={`lat-${ry}`}
                                    cx="100"
                                    cy="100"
                                    rx={98}
                                    ry={ry}
                                    opacity={0.42 + iy * 0.07}
                                />
                            ))}
                            <path d="M 100 1 A 82 118 0 0 1 178 164" opacity={0.26}/>
                            <path d="M 100 199 A 96 132 0 0 1 182 148" opacity={0.26}/>
                            <path d="M 18 90 A 86 138 0 0 1 100 198" opacity={0.24}/>
                            <path d="M 100 198 A 90 138 0 0 1 178 118" opacity={0.24}/>
                        </g>
                    </svg>

                    {/* Limb terminator wash */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-[-1px] rounded-full"
                        style={{
                            mixBlendMode: "multiply",
                            opacity: 0.94,
                            background:
                                "radial-gradient(circle at 76% 48%, transparent 42%, rgba(2,14,62,0.75) 100%), radial-gradient(circle at 22% -6%, transparent 62%, rgba(4,132,246,0.06) 100%)",
                        }}
                    />

                    {/* Cloud belts — slow drift */}
                    <div aria-hidden className="absolute inset-0 overflow-hidden rounded-full opacity-[0.95]">
                        {cloudLayers.map(L => (
                            <div key={`cla-${uid}-${L.i}`} className="pointer-events-none absolute" style={{ left: `${L.cx}%`, top: `${L.cy}%` }}>
                                <motion.div
                                    className="pointer-events-none"
                                    animate={
                                        calm
                                            ? {}
                                            :   {
                                                    x: [0, L.drift * L.rot * 1.2, -L.drift * 0.55, 0],
                                                    y: [0, L.drift * 0.4, -L.drift * 0.54, 0],
                                                    rotate: [0, 1.8 * L.rot, -1.6 * L.rot, 0],
                                                }
                                    }
                                    transition={{
                                        duration: L.dur,
                                        repeat: calm ? 0 : Infinity,
                                        ease: "easeInOut",
                                        delay: L.delay,
                                    }}
                                >
                                    <div
                                        className="pointer-events-none absolute rounded-full -translate-x-1/2 -translate-y-1/2"
                                        style={{
                                            background:
                                                "radial-gradient(ellipse at center, rgba(255,252,252,0.5) 0%, rgba(246,246,252,0.08) 52%, transparent 74%)",
                                            width: `${L.w}px`,
                                            height: `${L.w * 0.72}px`,
                                            filter: `blur(${L.blur}px)`,
                                            mixBlendMode: "screen",
                                            opacity: L.o,
                                        }}
                                    />
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    {/* Subtle continental mass (abstract) */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-[8%] rounded-full opacity-[0.22]"
                        style={{
                            mixBlendMode: "multiply",
                            background:
                                "radial-gradient(ellipse 94% 80% at 38% 46%, rgba(4,148,246,0.12) 0%, transparent 55%), radial-gradient(ellipse 74% 60% at 62% 68%, rgba(10,246,246,0.1) 0%, transparent 50%)",
                        }}
                    />

                    {/* Slow planetary roll */}
                    <motion.div
                        aria-hidden
                        className="absolute inset-[-6%]"
                        animate={calm ? { rotate: 0 } : { rotate: [0, -360] }}
                        transition={
                            calm
                                ? { duration: 0 }
                                :   { duration: 220, repeat: Infinity, ease: "linear" }
                        }
                    >
                        <div
                            className="pointer-events-none absolute inset-0 rounded-full opacity-[0.18]"
                            style={{
                                background:
                                    "repeating-conic-gradient(from 0deg, transparent 0deg 52deg, rgba(255,251,239,0.02) 52deg 54deg)",
                                mixBlendMode: "soft-light",
                            }}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
