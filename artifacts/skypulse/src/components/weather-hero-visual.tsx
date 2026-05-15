import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

export function WeatherHeroVisual({ conditionCode, iconCode, description, isDay }: {
    conditionCode: string;
    iconCode: string;
    description: string;
    isDay: boolean;
}) {
    const reduceMotion = useReducedMotion();
    const code = conditionCode === "fog" ? "fog" : conditionCode;
    const showSun = isDay && code === "clear";
    const isNight = !isDay;
    const showMoon = isNight;
    const showRain = code === "rain" || code === "storm";
    const showSnow = code === "snow";
    const showStorm = code === "storm";

    const referenceNight =
        isNight && ["clear", "night", "cloudy"].includes(code) && !showRain && !showSnow && !showStorm;
    const calmNight = isNight && !showRain && !showSnow && !showStorm;
    /** At night prefer moon + clouds + stars only (clean on every screen size). */
    const hideFlatIcon = isNight;

    /** Smaller 3D parallax on phones; respect system reduced motion. */
    const tiltAnim = reduceMotion ? undefined : {
        rotateY: [0, -2.25, 1.25, 0],
        rotateX: [0, 1.25, -0.9, 0],
    };
    const tiltTrans = reduceMotion ? { duration: 0 } : { duration: 14, repeat: Infinity, ease: "easeInOut" as const };

    return (
        <div
            className={[
                "relative shrink-0 flex items-center justify-center aspect-square mx-auto",
                "w-[clamp(10.5rem,min(74vw,20rem),20rem)]",
                "sm:w-[clamp(11.5rem,min(58vw,20rem),22rem)]",
                "max-w-[min(100%,22rem)]",
            ].join(" ")}
            style={{ perspective: "min(1400px, 140vw)" }}
        >
            
            <div
                aria-hidden
                className="absolute bottom-[-6%] left-1/2 -translate-x-1/2 w-[88%] h-[18%] rounded-[100%] pointer-events-none opacity-60"
                style={{
                    background:
                        `radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,20,48,0.45) 0%, transparent 72%)`,
                    filter: "blur(14px)",
                }}
            />

            <motion.div
                className="relative w-full h-full flex items-center justify-center preserve-3d"
                animate={tiltAnim}
                transition={tiltTrans}
                style={{ transformStyle: "preserve-3d" }}
            >
                {isNight && <HeroStarfield reduceMotion={!!reduceMotion} />}

                {isNight ? <NightHeroAmbient /> : <AmbientGlow code={code} />}

                {!isNight && <HaloDisk code={code} />}
                {calmNight && <ReferenceCinematicRing />}

                {(code === "cloudy" || code === "fog" || code === "rain" || code === "storm" || showSnow) && !referenceNight && (
                    <SoftCloudMass dim={code === "fog"} depth={showStorm ? "deep" : "normal"} />
                )}

                {(code === "cloudy" || code === "fog") && !(showRain || showSnow) && !referenceNight && (
                    <CloudLayers dim={code === "fog"} />
                )}

                {calmNight && <NightAccentClouds dimCloud={code === "cloudy" || code === "fog"} />}

                {showSun && <SunSculpt />}

                <div
                    className={`relative ${isNight ? "z-[1]" : "z-10"} w-[74%] h-[74%] flex items-center justify-center`}
                    style={{ transform: "translateZ(1px)", transformStyle: "preserve-3d" }}
                >
                    
                    <div
                        className="relative w-[92%] h-[92%] rounded-[32%]"
                        style={{
                            background:
                                `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.06) 28%, transparent 52%),
                 radial-gradient(ellipse 140% 100% at 50% 118%, rgba(15,35,72,0.22) 0%, transparent 55%)`,
                            boxShadow:
                                `
                  0 0 0 1px rgba(255,255,255,0.12) inset,
                  0 -20px 40px -14px rgba(255,255,255,0.15) inset,
                  0 24px 48px -20px rgba(0,30,68,0.35) inset,
                  0 18px 40px rgba(56,155,240,0.12),
                  0 42px 64px rgba(0,40,96,0.22)
                `,
                            transform: "translateZ(42px)",
                            opacity: isNight ? 0 : 1,
                        }}
                    />

                    {!hideFlatIcon && (
                        <motion.img
                            src={`https://openweathermap.org/img/wn/${iconCode}@4x.png`}
                            alt={description}
                            className="relative z-[2] absolute w-[88%] h-[88%] object-contain select-none pointer-events-none"
                            style={{
                                filter: !isDay
                                    ? `
                    brightness(1.06) contrast(1.08) saturate(0.74) hue-rotate(-10deg)
                    drop-shadow(0 24px 40px rgba(20,35,92,0.45))
                    drop-shadow(0 0 48px rgba(130,168,255,0.22))
                  `
                                    : `
                    drop-shadow(0 28px 32px rgba(0,35,76,0.35))
                    drop-shadow(0 8px 12px rgba(120,210,255,0.12))
                  `,
                                transform: "translateZ(72px)",
                            }}
                            draggable={false}
                            animate={{
                                y: [0, -6, 0],
                                rotateZ: [0, -0.8, 0.6, 0],
                                scale: [1, 1.02, 1],
                            }}
                            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    )}
                </div>

                {showMoon && (
                    <MoonSculpt large={referenceNight} mid={calmNight && !referenceNight} dimmed={isNight && (showRain || showStorm)} />
                )}
                {showRain && !showStorm && <RainPreviewEnhanced />}
                {showSnow && <SnowPreviewEnhanced />}
                {showStorm && <StormVignette />}
                {showStorm && <LightningStroke />}
            </motion.div>
        </div>
    );
}

function HeroStarfield({ reduceMotion }: {
    reduceMotion: boolean;
}) {
    const dots = useMemo(() => [...Array(34)].map((_, i) => {
        const seed = (i * 7919 + 17) % 997;
        return {
            id: i,
            left: (seed * 53) % 92 + 4,
            top: (seed * 31 + i * 7) % 88 + 4,
            size: i % 4 === 0 ? 2.2 : i % 3 === 0 ? 1.4 : 1,
            dur: 3.8 + (i % 6) * 0.85,
            delay: (seed % 120) / 100,
            op: i % 5 === 0 ? 0.55 : 0.35,
        };
    }), []);

    return (
        <div
            className="absolute inset-[1%] z-[2] rounded-[45%] pointer-events-none overflow-hidden"
            style={{ transform: "translateZ(2px)" }}
            aria-hidden
        >
            {dots.map((d) => (
                <motion.span
                    key={d.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${d.left}%`,
                        top: `${d.top}%`,
                        width: d.size,
                        height: d.size,
                        boxShadow: d.size > 1.8 ? "0 0 4px rgba(220,228,255,0.7)" : "0 0 2px rgba(200,218,255,0.5)",
                        willChange: "opacity, transform",
                    }}
                    animate={reduceMotion ? { opacity: d.op } : {
                        opacity: [d.op * 0.35, d.op, d.op * 0.42, d.op * 0.9, d.op * 0.35],
                        scale: [0.92, 1.06, 0.98, 1.05, 0.92],
                    }}
                    transition={reduceMotion ? { duration: 0 } : {
                        duration: d.dur,
                        delay: d.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

function NightHeroAmbient() {
    return (
        <div
            aria-hidden
            className="absolute inset-[3%] rounded-[48%] pointer-events-none z-[3]"
            style={{
                transform: "translateZ(3px)",
                background: `
          radial-gradient(ellipse 75% 70% at 50% 42%, rgba(130,156,226,0.14) 0%, transparent 55%),
          radial-gradient(ellipse 45% 40% at 72% 24%, rgba(98,138,218,0.08) 0%, transparent 50%)
        `,
                mixBlendMode: "screen",
            }}
        />
    );
}

function ReferenceCinematicRing() {
    return (
        <motion.div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ transform: "translateZ(6px)" }}
            animate={{ opacity: [0.55, 0.88, 0.62], scale: [1, 1.03, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
            <div
                className="w-[118%] h-[118%] rounded-full max-w-[calc(100%+36px)] max-h-[calc(100%+36px)]"
                style={{
                    background: `
          radial-gradient(circle at 50% 48%, transparent 40%, rgba(215,226,255,0.04) 48%, transparent 53%),
          radial-gradient(circle at 50% 50%, transparent 54%, rgba(180,198,246,0.09) 59%, transparent 66%),
          radial-gradient(circle at 50% 50%, transparent 64%, rgba(140,168,236,0.06) 72%, transparent 80%)
        `,
                    mixBlendMode: "screen",
                    filter: "blur(0.5px)",
                }}
            />
        </motion.div>
    );
}

function NightAccentClouds({ dimCloud }: {
    dimCloud: boolean;
}) {
    const whiteCore = dimCloud ? "rgba(238,242,252,0.42)" : "rgba(252,253,255,0.58)";
    const whiteEdge = dimCloud ? "rgba(200,210,232,0.22)" : "rgba(230,236,248,0.35)";
    return (
        <>
            <motion.div
                aria-hidden
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: "clamp(72px, 36%, 7.75rem)",
                    height: "clamp(28px, 16%, 3.25rem)",
                    left: "6%",
                    top: "36%",
                    transform: "translateZ(38px)",
                    background: `
            radial-gradient(ellipse 90% 100% at 40% 45%, ${whiteCore} 0%, transparent 70%),
            radial-gradient(ellipse 100% 90% at 62% 55%, ${whiteEdge} 0%, transparent 68%)
          `,
                    filter: "blur(14px)",
                    mixBlendMode: "screen",
                }}
                animate={{ x: [0, -6, 4, 0], y: [0, 3, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: "clamp(64px, 30%, 6.75rem)",
                    height: "clamp(32px, 17%, 3.35rem)",
                    right: "-2%",
                    top: "46%",
                    transform: "translateZ(52px)",
                    background: `
            radial-gradient(ellipse 95% 100% at 45% 50%, rgba(38,46,74,${dimCloud ? 0.72 : 0.55}) 0%, transparent 68%),
            radial-gradient(ellipse 80% 90% at 70% 40%, rgba(255,255,255,${dimCloud ? 0.2 : 0.28}) 0%, transparent 55%)
          `,
                    filter: "blur(12px)",
                    mixBlendMode: "multiply",
                }}
                animate={{ x: [0, 8, -4, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
        </>
    );
}

function AmbientGlow({ code }: {
    code: string;
}) {
    const colors: Record<string, [string, string]> = {
        clear: ["rgba(254,226,138,0.55)", "rgba(253,164,71,0.18)"],
        cloudy: ["rgba(186,200,226,0.45)", "rgba(100,120,152,0.12)"],
        fog: ["rgba(220,230,246,0.5)", "rgba(140,160,190,0.14)"],
        rain: ["rgba(146,206,252,0.48)", "rgba(40,100,178,0.16)"],
        snow: ["rgba(236,250,255,0.52)", "rgba(180,210,235,0.18)"],
        storm: ["rgba(186,174,252,0.42)", "rgba(60,50,140,0.22)"],
        night: ["rgba(140,180,255,0.35)", "rgba(40,60,140,0.12)"],
    };
    const [cInner, cOuter] = colors[code] ?? colors.cloudy;

    return (
        <motion.div
            aria-hidden
            className="absolute inset-[4%] rounded-full pointer-events-none overflow-hidden blur-2xl"
            style={{
                background: `
          radial-gradient(circle at 40% 35%, ${cInner} 0%, transparent 55%),
          radial-gradient(circle at 72% 70%, ${cOuter} 0%, transparent 60%)
        `,
                transform: "translateZ(0)",
            }}
            animate={{
                opacity: [0.75, 1, 0.78],
                scale: [1, 1.05, 1],
            }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

function HaloDisk({ code }: {
    code: string;
}) {
    const hues: Record<string, string> = {
        clear: "rgba(251,211,141,0.45)",
        cloudy: "rgba(200,210,230,0.35)",
        fog: "rgba(230,238,248,0.4)",
        rain: "rgba(147,206,253,0.38)",
        snow: "rgba(224,246,254,0.42)",
        storm: "rgba(167,169,247,0.4)",
        night: "rgba(140,172,252,0.22)",
    };
    const h = hues[code] ?? hues.cloudy;

    return (
        <motion.div
            aria-hidden
            className="absolute inset-[2%] rounded-full pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
            style={{
                background: `
          radial-gradient(transparent 42%, transparent 53%, ${h} 56%, transparent 61%),
          conic-gradient(from 0deg,
            transparent 0deg,
            rgba(255,255,255,0.06) 32deg,
            transparent 76deg,
            transparent 148deg,
            rgba(255,255,255,0.045) 200deg,
            transparent 296deg)
        `,
                filter: "blur(0.5px)",
                opacity: code === "clear" ? 0.92 : 0.65,
                mixBlendMode: "screen",
                transform: "translateZ(8px)",
            }}
        />
    );
}

function SoftCloudMass({ dim, depth }: {
    dim: boolean;
    depth: "normal" | "deep";
}) {
    const d = depth === "deep" ? 0.1 : 0;
    const layers = [
        { w: 118, h: 44, x: -8, y: 32, op: 0.34 + d, blur: 18, z: 18 },
        { w: 132, h: 50, x: 12, y: 48, op: 0.28 + d, blur: 22, z: 28 },
        { w: 108, h: 40, x: 28, y: 22, op: 0.24 + d, blur: 16, z: 36 },
    ];

    return (
        <>
            {layers.map((L, i) => {
                const core = dim
                    ? `rgba(210,220,235,${0.48 + L.op * 0.35})`
                    : `rgba(255,255,255,${0.58 + L.op * 0.25})`;
                const edge = dim
                    ? `rgba(170,186,210,${0.32 + L.op * 0.2})`
                    : `rgba(235,242,252,${0.4 + L.op * 0.15})`;
                return (
                    <motion.div
                        key={i}
                        aria-hidden
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            width: L.w,
                            height: L.h,
                            left: `${L.x}%`,
                            top: `${L.y}%`,
                            transform: `translateZ(${L.z}px)`,
                            background: `
              radial-gradient(ellipse 85% 90% at 38% 42%, ${core} 0%, transparent 68%),
              radial-gradient(ellipse 100% 90% at 62% 58%, ${edge} 0%, transparent 65%)
            `,
                            filter: `blur(${L.blur}px)`,
                            boxShadow: dim
                                ? `0 12px 28px rgba(40,60,88,0.18), inset 0 -8px 18px rgba(255,255,255,0.06)`
                                : `0 16px 36px rgba(40,70,110,0.14), inset 0 -6px 20px rgba(255,255,255,0.14)`,
                            mixBlendMode: dim ? "soft-light" : "screen",
                        }}
                        animate={{ x: [0, i % 2 ? -10 : 12, 0], y: [0, 4, 0] }}
                        transition={{ duration: 16 + i * 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                );
            })}
        </>
    );
}

function SunSculpt() {
    return (
        <>
            <motion.div
                aria-hidden
                className="absolute -top-[2%] left-[8%] w-[46%] h-[46%] rounded-full pointer-events-none"
                style={{
                    background: `
            radial-gradient(circle at 35% 32%, #fffef5 0%, #fef3c7 18%, #fbbf24 42%, #f59e0b 58%, transparent 76%)
          `,
                    boxShadow: `
            0 0 40px 16px rgba(253,224,138,0.45),
            0 0 80px 36px rgba(251,191,36,0.22),
            inset 0 -12px 24px rgba(245,158,11,0.25)
          `,
                    transform: "translateZ(52px)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                aria-hidden
                className="absolute -top-[6%] left-[2%] w-[58%] h-[58%] rounded-full pointer-events-none opacity-45"
                style={{
                    background: `
            conic-gradient(from 0deg,
              transparent 0deg,
              rgba(255,252,220,0.12) 6deg,
              transparent 18deg,
              transparent 40deg,
              rgba(254,240,138,0.1) 48deg,
              transparent 58deg,
              transparent 88deg,
              rgba(253,230,138,0.09) 96deg,
              transparent 110deg)
          `,
                    filter: "blur(10px)",
                    transform: "translateZ(34px)",
                }}
                animate={{ rotate: [0, 14, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
        </>
    );
}

function MoonSculpt({ large = false, mid = false, dimmed = false }: {
    large?: boolean;
    mid?: boolean;
    dimmed?: boolean;
}) {
    const moonCls = large
        ? "w-[5.75rem] h-[5.75rem] md:w-[6.75rem] md:h-[6.75rem]"
        : mid
            ? "w-20 h-20 md:w-[5.35rem] md:h-[5.35rem]"
            : "w-16 h-16 md:w-[4.5rem] md:h-[4.5rem]";
    return (
        <div
            className={`absolute ${large ? "top-[2%] right-[4%]" : "top-[4%] right-[6%]"} pointer-events-none transition-opacity duration-300`}
            style={{ transform: "translateZ(48px)", opacity: dimmed ? 0.42 : 1 }}
        >
            <motion.div
                aria-hidden
                className={`relative ${moonCls} rounded-full`}
                style={{
                    background: `
            radial-gradient(circle at 30% 28%, #f8fbff 0%, #dbe7f8 30%, #9eb4d6 58%, #3d4d72 100%)
          `,
                    boxShadow: large
                        ? `
              0 0 38px 16px rgba(220,228,255,0.45),
              0 0 72px 40px rgba(130,158,226,0.22),
              inset -10px -10px 22px rgba(24,38,72,0.42),
              inset 6px 8px 16px rgba(255,255,255,0.42)
            `
                        : mid
                            ? `
              0 0 28px 12px rgba(210,220,255,0.38),
              0 0 52px 28px rgba(120,150,220,0.18),
              inset -8px -8px 18px rgba(28,42,72,0.38),
              inset 5px 6px 12px rgba(255,255,255,0.38)
            `
                            : `
            0 0 24px 10px rgba(200,220,255,0.28),
            0 0 48px 24px rgba(120,160,220,0.12),
            inset -6px -8px 18px rgba(30,45,78,0.35),
            inset 4px 6px 14px rgba(255,255,255,0.35)
          `,
                }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <div
                aria-hidden
                className="absolute rounded-full opacity-35"
                style={{
                    width: large ? "32%" : "28%",
                    height: large ? "24%" : "22%",
                    top: large ? "24%" : "26%",
                    left: large ? "20%" : "22%",
                    background: "radial-gradient(circle, rgba(60,78,110,0.5) 0%, transparent 70%)",
                    filter: "blur(3px)",
                }}
            />
            <div
                aria-hidden
                className="absolute rounded-full opacity-[0.22]"
                style={{
                    width: large ? "20%" : "18%",
                    height: large ? "16%" : "14%",
                    top: large ? "54%" : "52%",
                    left: large ? "50%" : "48%",
                    background: "radial-gradient(circle, rgba(50,65,98,0.55) 0%, transparent 70%)",
                    filter: "blur(2px)",
                }}
            />
            {(large || mid) && (
                <>
                    <div
                        aria-hidden
                        className="absolute rounded-full opacity-[0.18]"
                        style={{
                            width: "14%",
                            height: "11%",
                            top: "38%",
                            left: "62%",
                            background: "radial-gradient(circle, rgba(55,72,104,0.7) 0%, transparent 70%)",
                            filter: "blur(1.5px)",
                        }}
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 rounded-full pointer-events-none opacity-55"
                        style={{
                            background: `
                radial-gradient(circle at 25% 20%, rgba(255,255,255,0.14) 0%, transparent 8%),
                radial-gradient(circle at 72% 68%, rgba(40,54,82,0.12) 0%, transparent 6%)
              `,
                            mixBlendMode: "soft-light",
                        }}
                    />
                </>
            )}
        </div>
    );
}

function CloudLayers({ dim }: {
    dim: boolean;
}) {
    return (
        <>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    aria-hidden
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 86 + i * 22,
                        height: 34 + i * 9,
                        left: `${8 + i * 14}%`,
                        top: `${18 + i * 9}%`,
                        transform: `translateZ(${22 + i * 8}px)`,
                        background: dim
                            ? `linear-gradient(180deg, rgba(220,228,240,0.55) 0%, rgba(170,186,210,0.35) 100%)`
                            : `linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(210,220,235,0.45) 100%)`,
                        boxShadow: `
              0 10px 22px rgba(40,60,90,0.12),
              inset 0 4px 10px rgba(255,255,255,0.35)
            `,
                        filter: "blur(10px)",
                    }}
                    animate={{ x: [0, i % 2 ? -14 : 16, 0] }}
                    transition={{ duration: 19 + i * 5, repeat: Infinity, ease: "easeInOut" }}
                />
            ))}
        </>
    );
}

function RainPreviewEnhanced() {
    return (
        <>
            <div
                className="absolute inset-0 pointer-events-none z-[4] opacity-[0.42]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(158deg, transparent, transparent 5px, rgba(186,220,255,0.45) 6px, transparent 9px)",
                    animation: "rain 0.52s linear infinite",
                    mixBlendMode: "soft-light",
                    transform: "translateZ(80px) rotate(-6deg) scale(1.08)",
                }}
            />
            <div
                className="absolute inset-0 pointer-events-none z-[4] opacity-25"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(152deg, transparent, transparent 8px, rgba(120,180,255,0.3) 9px, transparent 12px)",
                    animation: "rain 0.72s linear infinite",
                    transform: "translateZ(76px) rotate(-5deg)",
                }}
            />
        </>
    );
}

function SnowPreviewEnhanced() {
    return (
        <>
            <div
                className="absolute inset-0 pointer-events-none z-[4] opacity-50"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.95) 0.55px, transparent 1.1px)",
                    backgroundSize: "22px 26px",
                    animation: "snow-medium 6.5s linear infinite",
                    transform: "translateZ(78px)",
                }}
            />
            <div
                className="absolute inset-0 pointer-events-none z-[4] opacity-35"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.85) 0.45px, transparent 1px)",
                    backgroundSize: "14px 18px",
                    backgroundPosition: "10px 8px",
                    animation: "snow-slow 9s linear infinite",
                    transform: "translateZ(74px)",
                }}
            />
        </>
    );
}

function StormVignette() {
    return (
        <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none z-[5] rounded-[40%]"
            style={{
                background: "radial-gradient(circle at 50% 30%, transparent 20%, rgba(12,16,48,0.55) 100%)",
                mixBlendMode: "multiply",
                transform: "translateZ(60px)",
            }}
            animate={{ opacity: [0.55, 0.78, 0.58] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

function LightningStroke() {
    return (
        <svg aria-hidden viewBox="0 0 100 140" className="absolute left-[38%] top-[6%] w-[28%] h-[42%] z-[6] overflow-visible pointer-events-none">
            <defs>
                <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#eef2ff" stopOpacity={1}/>
                    <stop offset="55%" stopColor="#a5b4fc" stopOpacity={0.98}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9}/>
                </linearGradient>
                <filter id="heroLightningGlow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="4" result="b"/>
                    <feMerge>
                        <feMergeNode in="b"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <motion.path
                d="M 52 4 L 36 62 L 48 62 L 32 134 L 70 54 L 52 54 L 66 4 Z"
                fill="url(#boltGrad)"
                filter="url(#heroLightningGlow)"
                style={{ transform: "translateZ(92px)", transformOrigin: "center", mixBlendMode: "screen" }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                    opacity: [0, 0, 0.95, 0.2, 0, 0, 0.75, 0, 0, 0],
                    scale: [1, 1, 1.05, 0.98, 1, 1, 1.08, 1, 1, 1],
                }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "linear", times: [0, 0.4, 0.41, 0.42, 0.43, 0.7, 0.71, 0.73, 0.74, 1] }}
            />
        </svg>
    );
}
