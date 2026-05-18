import { useId } from "react";
import { useComfortGraphics } from "@/hooks/use-media-query";
import type { DayPhase } from "@/lib/day-phase";

interface CinematicHeroChromeProps {
    dayPhase?: DayPhase | null;
}

/**
 * Readability chrome over in-card cinematic matte — asymmetric linear scrims (no vignette blobs)
 * so type stays legible on the left while volumetric stacks read on the right.
 */
export function CinematicHeroChrome({ dayPhase }: CinematicHeroChromeProps) {
    const comfortGraphics = useComfortGraphics();
    const uid = useId().replace(/:/g, "");

    type PhaseHue = "day" | "golden" | "sunset" | "dusk" | "blue";

    /* Collapse dusk/blue/deep-night for scrim tuning */
    const hue: PhaseHue =
        dayPhase ?
            (
                ({
                    sunrise: "day",
                    morning: "day",
                    afternoon: "day",
                    "golden-hour": "golden",
                    sunset: "sunset",
                    dusk: "dusk",
                    "blue-hour": "blue",
                    night: "blue",
                    "deep-night": "blue",
                }) as Record<DayPhase, PhaseHue>
            )[dayPhase]
        :   "day";

    const phaseReadability: Record<
        PhaseHue,
        {
            left: number;
            falloff: number;
            topBand: number;
        }
    > = {
        day: { left: 0.78, falloff: 0.38, topBand: 0.28 },
        golden: { left: 0.74, falloff: 0.36, topBand: 0.26 },
        sunset: { left: 0.76, falloff: 0.39, topBand: 0.3 },
        dusk: { left: 0.82, falloff: 0.41, topBand: 0.34 },
        blue: { left: 0.84, falloff: 0.43, topBand: 0.36 },
    };
    const q = phaseReadability[hue];

    return (
        <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-[inherit]" aria-hidden>
            {!comfortGraphics && (
                <svg className="absolute inset-0 z-[6] h-full w-full opacity-[0.03] mix-blend-overlay" aria-hidden>
                    <filter id={`hero-grain-${uid}`}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="661" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.38" />
                        </feComponentTransfer>
                    </filter>
                    <rect width="100%" height="100%" filter={`url(#hero-grain-${uid})`} fill="#fff" />
                </svg>
            )}

            {/* Heavy left rail for serif stack; open right corridor for atlas layers */}
            <div
                className="absolute inset-0 z-[1]"
                style={{
                    opacity: 0.97,
                    background: `
                      linear-gradient(105deg,
                        rgba(2, 6, 22, ${q.left}) 0%,
                        rgba(4, 10, 32, ${q.falloff}) min(52%, calc(26rem)),
                        rgba(6, 12, 40, ${q.falloff * 0.35}) min(74%, calc(26rem + 38vw)),
                        rgba(5, 10, 44, 0.02) 100%
                      ),
                      linear-gradient(180deg,
                        rgba(1, 4, 18, ${q.topBand}) 0%,
                        transparent min(54%, 12rem),
                        rgba(4, 8, 34, ${q.topBand * 0.55}) 100%
                      )
                    `,
                }}
            />

            {/* Subtle warm/cool veil along bottom edge — atmospheric floor, purely linear */}
            <div
                className="absolute inset-0 z-[2] mix-blend-soft-light opacity-[0.55]"
                style={{
                    background:
                        hue === "golden" || hue === "sunset"
                            ? `linear-gradient(188deg,
                                transparent 40%,
                                rgba(255, 108, 72, ${hue === "sunset" ? 0.075 : 0.055}) 100%)`
                            : hue === "dusk" || hue === "blue"
                                ? "linear-gradient(188deg, transparent 52%, rgba(56, 78, 180, 0.07) 100%)"
                                : "linear-gradient(188deg, transparent 62%, rgba(120, 165, 255, 0.045) 100%)",
                }}
            />
        </div>
    );
}
