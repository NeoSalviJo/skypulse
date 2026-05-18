import { motion, useReducedMotion } from "framer-motion";
import { useComfortGraphics } from "@/hooks/use-media-query";
import { useMemo } from "react";

export function WeatherHeroVisual({ conditionCode, iconCode, description, isDay, variant = "default" }: {
    conditionCode: string;
    iconCode: string;
    description: string;
    isDay: boolean;
    variant?: "default" | "hero";
}) {
    const reduceMotionOS = useReducedMotion();
    const comfortGraphics = useComfortGraphics();
    const calm = !!(reduceMotionOS || comfortGraphics);
    const code = conditionCode === "fog" ? "fog" : conditionCode;
    /** Clear daytime: rely on the OWM icon only — no extra “sculpted” sun shapes behind it. */
    const isClearDay = isDay && code === "clear";
    const isNight = !isDay;
    const showMoon = isNight;
    const showRain = code === "rain" || code === "storm";
    const showSnow = code === "snow";
    const showStorm = code === "storm";

    const referenceNight =
        !calm &&
        isNight && ["clear", "night", "cloudy"].includes(code) && !showRain && !showSnow && !showStorm;
    const calmNight = isNight && !showRain && !showSnow && !showStorm;

    /** Smaller parallax tilt off on mobile budget / reduced-motion. */
    const tiltAnim = calm ? undefined : {
        rotateY: [0, -1.4, 0.9, 0],
        rotateX: [0, 0.8, -0.55, 0],
    };
    const tiltTrans = calm ? { duration: 0 } : { duration: 22, repeat: Infinity, ease: "easeInOut" as const };

    const isHero = variant === "hero";
    const frameClass = [
        "relative shrink-0 mx-auto flex items-center justify-center",
        isHero
            ? calm
                ? "w-[clamp(12.75rem,min(82vw,19.5rem),20.5rem)] sm:w-[clamp(15rem,min(52vw,22rem),25rem)]"
                : "w-[clamp(12.25rem,min(80vw,20rem),20.5rem)] sm:w-[clamp(14rem,min(46vw,24rem),25.5rem)]"
            : calm
                ? "w-[clamp(11.5rem,min(74vw,15.5rem),15.75rem)] sm:w-[clamp(13rem,min(62vw,18rem),19rem)]"
                : "w-[clamp(10.75rem,min(72vw,18.5rem),19rem)] sm:w-[clamp(12rem,min(56vw,20rem),22rem)]",
        "max-w-[min(100%,26rem)] aspect-square",
    ].join(" ");

    return (
        <div
            className={frameClass}
            style={calm ? undefined : { perspective: "min(1200px, 120vw)" }}
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
                className="relative w-full h-full flex items-center justify-center"
                animate={tiltAnim}
                transition={tiltTrans}
                style={calm ? undefined : { transformStyle: "preserve-3d" }}
            >
                {isNight && <HeroStarfield reduceMotion={calm}/>}

                {isNight ? <NightHeroAmbient /> : isClearDay ? <ClearSkyAtmosphere calm={calm} mutedHero={isHero}/> : <AmbientGlow code={code} calm={calm}/>}

                {!isNight && !isClearDay && <HaloDisk code={code} calm={calm}/>}
                {calmNight && <ReferenceCinematicRing calm={calm}/>}

                {(code === "cloudy" || code === "fog" || code === "rain" || code === "storm" || showSnow) && !referenceNight && (
                    <SoftCloudMass dim={code === "fog"} depth={showStorm ? "deep" : "normal"} calm={calm}/>
                )}

                {(code === "cloudy" || code === "fog") && !(showRain || showSnow) && !referenceNight && (
                    <CloudLayers dim={code === "fog"} calm={calm}/>
                )}

                {calmNight && <NightAccentClouds dimCloud={code === "cloudy" || code === "fog"} calm={calm}/>}

                <div
                    className={[
                        "relative flex items-center justify-center",
                        isNight ? "z-[1]" : "z-10",
                        isClearDay
                            ? isHero
                                ? "w-[86%] h-[86%] sm:w-[82%] sm:h-[82%]"
                                : "w-[82%] h-[82%] sm:w-[78%] sm:h-[78%]"
                            : "w-[78%] h-[78%] sm:w-[74%] sm:h-[74%]",
                    ].join(" ")}
                    style={calm ? undefined : { transform: "translateZ(1px)", transformStyle: "preserve-3d" }}
                >
                    {isClearDay ? (<>
                        
                        <ClearDaySunBloom calm={calm} hero={isHero}/>

                        
                        <div
                            aria-hidden
                            className={[
                                "pointer-events-none absolute rounded-full",
                                isHero ? "inset-[5%]" : "inset-[6%]",
                            ].join(" ")}
                            style={{
                                opacity: calm ? 0.55 : 0.72,
                                background: `
              radial-gradient(circle at 50% 50%, transparent 40%, rgba(255,247,214,${isHero ? 0.07 : 0.045}) 58%, transparent 71%),
              radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 52%)
            `,
                                transform: calm ? undefined : "translateZ(8px)",
                            }}
                        />

                        
                        <div
                            className={[
                                "relative z-[3] flex items-center justify-center rounded-full backdrop-blur-2xl",
                                isHero
                                    ? "aspect-square w-[min(100%,13.85rem)] sm:w-[min(100%,15.75rem)] border border-white/[0.2] bg-gradient-to-b from-white/[0.16] via-white/[0.07] to-white/[0.02] ring-1 ring-white/15"
                                    : "aspect-square w-[min(100%,11.25rem)] sm:w-[min(100%,12.5rem)] border border-white/[0.18] bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-transparent ring-1 ring-white/12",
                                "shadow-[inset_0_1px_0_rgba(255,255,255,0.38),inset_0_-1px_0_rgba(0,0,0,0.08),0_28px_64px_-20px_rgba(0,8,44,0.45)] dark:border-white/[0.12] dark:from-white/[0.1] dark:via-white/[0.03] dark:to-transparent dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.08),0_32px_70px_-18px_rgba(0,4,44,0.58)]",
                            ].join(" ")}
                            style={calm ? undefined : { transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
                        >
                            <motion.img
                                src={`https://openweathermap.org/img/wn/${iconCode}@4x.png`}
                                alt={description}
                                className={"relative z-[4] block h-[78%] w-[78%] object-contain select-none pointer-events-none sm:h-[76%] sm:w-[76%]"}
                                style={{
                                    filter: `
                      saturate(1.08) contrast(1.06)
                      drop-shadow(0 12px 24px rgba(6,28,76,0.35))
                      drop-shadow(0 0 48px rgba(255,226,170,0.22))
                    `,
                                    transform: calm ? undefined : "translateZ(4px)",
                                }}
                                draggable={false}
                                animate={calm ? undefined : isClearDay ? { y: [0, -2.5, 0] } : undefined}
                                transition={{
                                    duration: calm ? 6.5 : isClearDay ? 9 : 6.5,
                                    repeat: calm ? 0 : Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </div>
                    </>) : (<>
                    
                    <div
                        aria-hidden
                        className={[
                            "relative shadow-[inset_0_1px_0_rgba(255,255,255,0.26),inset_0_-1px_0_rgba(0,0,0,0.12)]",
                            "w-[92%] h-[92%] rounded-[32%] ring-1 ring-white/14 dark:ring-white/10",
                        ].join(" ")}
                        style={{
                            background: `
                              radial-gradient(ellipse 115% 100% at 32% 26%, rgba(255,255,255,${isNight ? 0.42 : 0.52}) 0%, rgba(255,255,255,${isNight ? 0.06 : 0.1}) 32%, transparent 56%),
                              radial-gradient(circle at 70% 80%, rgba(40,90,180,${isNight ? 0.16 : 0.12}) 0%, transparent 58%),
                              linear-gradient(165deg, rgba(255,255,255,${isNight ? 0.08 : 0.14}) 0%, rgba(255,255,255,0) 48%)
                            `,
                            boxShadow: isNight
                                ? `
                      0 0 0 1px rgba(255,255,255,0.08) inset,
                      0 18px 44px -16px rgba(0,20,60,0.55),
                      0 0 60px -20px rgba(130,160,255,0.22)
                    `
                                : `
                      0 0 0 1px rgba(255,255,255,0.15) inset,
                      0 -18px 36px -12px rgba(255,255,255,0.18) inset,
                      0 22px 48px -18px rgba(30,120,220,0.22),
                      0 40px 70px -24px rgba(0,40,96,0.28)
                    `,
                            transform: calm ? undefined : "translateZ(36px)",
                            opacity: 1,
                        }}
                    />

                    <motion.img
                        src={`https://openweathermap.org/img/wn/${iconCode}@4x.png`}
                        alt={description}
                        className="relative z-[2] absolute w-[86%] h-[86%] sm:w-[88%] sm:h-[88%] object-contain select-none pointer-events-none"
                        style={{
                            filter: !isDay
                                ? `
                    brightness(1.02) contrast(1.12) saturate(0.88) hue-rotate(-6deg)
                    drop-shadow(0 20px 36px rgba(12,24,72,0.55))
                    drop-shadow(0 0 36px rgba(160,190,255,0.28))
                  `
                                : `
                    drop-shadow(0 24px 28px rgba(0,35,76,0.32))
                    drop-shadow(0 8px 14px rgba(120,210,255,0.14))
                  `,
                            transform: calm ? undefined : "translateZ(58px)",
                        }}
                        draggable={false}
                        animate={calm ? undefined : {
                            y: [0, -4, 0],
                            rotateZ: [0, -0.45, 0.35, 0],
                            scale: [1, 1.015, 1],
                        }}
                        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    </>)}
                </div>

                {showMoon && (
                    <MoonSculpt large={referenceNight} mid={calmNight && !referenceNight} dimmed={isNight && (showRain || showStorm)} calm={calm}/>
                )}
                {showRain && !showStorm && <RainPreviewEnhanced narrow={comfortGraphics}/>}
                {showSnow && <SnowPreviewEnhanced narrow={comfortGraphics}/>}
                {showStorm && <StormVignette calm={calm}/>}
                {showStorm && <LightningStroke calm={calm}/>}
            </motion.div>
        </div>
    );
}

function HeroStarfield({ reduceMotion }: {
    reduceMotion: boolean;
}) {
    const dots = useMemo(() => [...Array(reduceMotion ? 12 : 32)].map((_, i) => {
        const seed = (i * 7919 + 17) % 997;
        return {
            id: i,
            left: (seed * 53) % 92 + 4,
            top: (seed * 31 + i * 7) % 88 + 4,
            size: i % 4 === 0 ? 2.2 : i % 3 === 0 ? 1.4 : 1,
            dur: 4.2 + (i % 6) * 0.9,
            delay: (seed % 120) / 100,
            op: i % 5 === 0 ? 0.55 : 0.35,
        };
    }), [reduceMotion]);

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
                        willChange: reduceMotion ? undefined : "opacity",
                    }}
                    animate={reduceMotion ? { opacity: d.op } : {
                        opacity: [d.op * 0.35, d.op * 0.95, d.op * 0.45, d.op * 0.88, d.op * 0.35],
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

function ReferenceCinematicRing({ calm }: {
    calm: boolean;
}) {
    return (
        <motion.div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={calm ? undefined : { transform: "translateZ(6px)" }}
            animate={calm ? { opacity: 0.72 } : { opacity: [0.55, 0.82, 0.62], scale: [1, 1.02, 1] }}
            transition={{ duration: calm ? 0 : 16, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
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

function NightAccentClouds({ dimCloud, calm }: {
    dimCloud: boolean;
    calm: boolean;
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
                animate={calm ? { x: 0, y: 0 } : { x: [0, -6, 4, 0], y: [0, 3, 0] }}
                transition={{ duration: calm ? 0 : 18, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
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
                animate={calm ? { x: 0 } : { x: [0, 8, -4, 0] }}
                transition={{ duration: calm ? 0 : 22, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
            />
        </>
    );
}

/** Soft photocentric bloom + airlight — blurred mass, not sharp “sun + cloud” primitives. */
function ClearDaySunBloom({ calm, hero }: {
    calm: boolean;
    hero: boolean;
}) {
    const spread = hero ? "130%" : "122%";

    return (
        <>
            <motion.div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[46%] z-[2] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    width: spread,
                    height: spread,
                    background: `
            radial-gradient(circle at 44% 40%, rgba(255,253,239,0.58) 0%, rgba(255,224,150,0.24) 19%, rgba(251,191,36,0.07) 38%, transparent 62%),
            radial-gradient(circle at 62% 60%, rgba(186,218,252,0.08) 0%, transparent 48%)
          `,
                    filter: "blur(32px)",
                    mixBlendMode: "screen",
                }}
                animate={calm ? { opacity: 0.9 } : { opacity: [0.84, 0.94, 0.85] }}
                transition={{ duration: calm ? 0 : 11, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden
                className={[
                    "pointer-events-none absolute left-[14%] top-[22%] z-[2] rounded-full opacity-50",
                    hero ? "h-[68%] w-[68%]" : "h-[70%] w-[70%]",
                ].join(" ")}
                style={{
                    background: "radial-gradient(circle at 38% 34%, rgba(255,255,255,0.28) 0%, transparent 58%)",
                    filter: "blur(22px)",
                    mixBlendMode: "overlay",
                }}
                animate={calm ? { opacity: 0.45 } : { opacity: [0.38, 0.5, 0.4] }}
                transition={{ duration: calm ? 0 : 15, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
            />
        </>
    );
}

/** Soft sky dome + horizon tint — no second “sun”; the OWM illustration carries the motif. */
function ClearSkyAtmosphere({ calm, mutedHero }: {
    calm: boolean;
    mutedHero?: boolean;
}) {
    const f = mutedHero ? 0.68 : 1;

    return (
        <motion.div
            aria-hidden
            className="absolute inset-[3%] pointer-events-none overflow-hidden rounded-[44%] blur-2xl"
            style={{
                background: `
          radial-gradient(ellipse 115% 78% at 50% -8%, rgba(210,238,255,${0.52 * f}) 0%, rgba(155,206,252,${0.12 * f}) 45%, transparent 62%),
          radial-gradient(ellipse 95% 52% at 50% 102%, rgba(255,246,226,${0.16 * f}) 0%, transparent 48%),
          linear-gradient(180deg, rgba(255,253,246,${0.06 * f}) 0%, transparent 28%, transparent 72%, rgba(30,74,140,${0.05 * f}) 100%)
        `,
                transform: "translateZ(0)",
                mixBlendMode: "screen",
            }}
            animate={
                calm
                    ? { opacity: 1 }
                    : {
                            opacity: [0.93, 0.99, 0.94],
                        }
            }
            transition={{ duration: calm ? 0 : 12, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
        />
    );
}

function AmbientGlow({ code, calm }: {
    code: string;
    calm: boolean;
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
            animate={calm
                ? { opacity: 0.88 }
                : {
                        opacity: [0.76, 0.94, 0.79],
                        scale: [1, 1.03, 1],
                    }}
            transition={{ duration: calm ? 0 : 8, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
        />
    );
}

function HaloDisk({ code, calm }: {
    code: string;
    calm: boolean;
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
            animate={calm ? { rotate: 0 } : { rotate: 360 }}
            transition={{ duration: calm ? 0 : 160, repeat: calm ? 0 : Infinity, ease: "linear" }}
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
                transform: calm ? undefined : "translateZ(8px)",
            }}
        />
    );
}

function SoftCloudMass({ dim, depth, calm }: {
    dim: boolean;
    depth: "normal" | "deep";
    calm: boolean;
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
                            transform: calm ? undefined : `translateZ(${L.z}px)`,
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
                        animate={calm ? { x: 0, y: 0 } : { x: [0, i % 2 ? -7 : 8, 0], y: [0, 2.5, 0] }}
                        transition={{ duration: calm ? 0 : 22 + i * 5, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
                    />
                );
            })}
        </>
    );
}

function MoonSculpt({ large = false, mid = false, dimmed = false, calm = false }: {
    large?: boolean;
    mid?: boolean;
    dimmed?: boolean;
    calm?: boolean;
}) {
    const moonCls = large
        ? "w-[5.75rem] h-[5.75rem] md:w-[6.75rem] md:h-[6.75rem]"
        : mid
            ? "w-20 h-20 md:w-[5.35rem] md:h-[5.35rem]"
            : "w-16 h-16 md:w-[4.5rem] md:h-[4.5rem]";
    return (
        <div
            className={`absolute ${large ? "top-[2%] right-[4%]" : "top-[4%] right-[6%]"} pointer-events-none transition-opacity duration-300`}
            style={{ transform: calm ? undefined : "translateZ(48px)", opacity: dimmed ? 0.42 : 1 }}
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
                animate={calm ? { y: 0 } : { y: [0, -4, 0] }}
                transition={{ duration: calm ? 0 : 7, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
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

function CloudLayers({ dim, calm }: {
    dim: boolean;
    calm: boolean;
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
                        transform: calm ? undefined : `translateZ(${22 + i * 8}px)`,
                        background: dim
                            ? `linear-gradient(180deg, rgba(220,228,240,0.55) 0%, rgba(170,186,210,0.35) 100%)`
                            : `linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(210,220,235,0.45) 100%)`,
                        boxShadow: `
              0 10px 22px rgba(40,60,90,0.12),
              inset 0 4px 10px rgba(255,255,255,0.35)
            `,
                        filter: "blur(10px)",
                    }}
                    animate={calm ? { x: 0 } : { x: [0, i % 2 ? -9 : 10, 0] }}
                    transition={{ duration: calm ? 0 : 24 + i * 8, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
                />
            ))}
        </>
    );
}

function RainPreviewEnhanced({ narrow }: {
    narrow: boolean;
}) {
    return (
        <>
            <div
                className={`absolute inset-0 pointer-events-none z-[4] ${narrow ? "opacity-[0.32]" : "opacity-[0.42]"}`}
                style={{
                    backgroundImage:
                        `repeating-linear-gradient(158deg, transparent, transparent ${narrow ? "6px" : "5px"}, rgba(186,220,255,${narrow ? 0.38 : 0.45}) ${narrow ? "7px" : "6px"}, transparent ${narrow ? "12px" : "9px"})`,
                    animation: narrow ? undefined : "rain 0.52s linear infinite",
                    mixBlendMode: "soft-light",
                    transform: narrow ? "translateZ(78px) rotate(-6deg) scale(1.05)" : "translateZ(80px) rotate(-6deg) scale(1.08)",
                }}
            />
            {!narrow && (
                <div
                    className="absolute inset-0 pointer-events-none z-[4] opacity-25"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(152deg, transparent, transparent 8px, rgba(120,180,255,0.3) 9px, transparent 12px)",
                        animation: "rain 0.72s linear infinite",
                        transform: "translateZ(76px) rotate(-5deg)",
                    }}
                />
            )}
        </>
    );
}

function SnowPreviewEnhanced({ narrow }: {
    narrow: boolean;
}) {
    return (
        <>
            <div
                className={`absolute inset-0 pointer-events-none z-[4] ${narrow ? "opacity-35" : "opacity-50"}`}
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.95) 0.55px, transparent 1.1px)",
                    backgroundSize: narrow ? "28px 32px" : "22px 26px",
                    animation: narrow ? undefined : "snow-medium 6.5s linear infinite",
                    transform: "translateZ(78px)",
                }}
            />
            {!narrow && (
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
            )}
        </>
    );
}

function StormVignette({ calm }: {
    calm: boolean;
}) {
    return (
        <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none z-[5] rounded-[40%]"
            style={{
                background: "radial-gradient(circle at 50% 30%, transparent 20%, rgba(12,16,48,0.55) 100%)",
                mixBlendMode: "multiply",
                transform: calm ? undefined : "translateZ(60px)",
            }}
            animate={calm ? { opacity: 0.64 } : { opacity: [0.54, 0.72, 0.56] }}
            transition={{ duration: calm ? 0 : 7, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
        />
    );
}

function LightningStroke({ calm }: {
    calm: boolean;
}) {
    return (
        <svg aria-hidden viewBox="0 0 100 140" className="absolute left-[38%] top-[6%] w-[28%] h-[42%] z-[6] overflow-visible pointer-events-none">
            <defs>
                <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#eef2ff" stopOpacity={1}/>
                    <stop offset="55%" stopColor="#a5b4fc" stopOpacity={0.98}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9}/>
                </linearGradient>
                <filter id="heroLightningGlow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation={calm ? "3" : "4"} result="b"/>
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
                style={{ transform: calm ? undefined : "translateZ(92px)", transformOrigin: "center", mixBlendMode: "screen" }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={calm
                    ? {
                            opacity: [0, 0, 0.55, 0, 0, 0, 0.4, 0, 0, 0],
                            scale: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                        }
                    : {
                            opacity: [0, 0, 0.95, 0.2, 0, 0, 0.75, 0, 0, 0],
                            scale: [1, 1, 1.04, 0.99, 1, 1, 1.06, 1, 1, 1],
                        }}
                transition={{
                    duration: calm ? 9.5 : 6.8,
                    repeat: Infinity,
                    ease: "linear",
                    times: [0, 0.42, 0.43, 0.44, 0.45, 0.71, 0.72, 0.73, 0.74, 1],
                }}
            />
        </svg>
    );
}
