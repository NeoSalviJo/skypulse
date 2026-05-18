/** Cinematic SVG weather marks (no flat PNG icons). Maps OpenWeather `icon` codes. */
import { useId, type ReactElement } from "react";

interface HourlyWeatherGlyphProps {
    icon: string;
    accent?: "day" | "night";
    /** Larger, brighter presentation for cinematic hourly cards */
    variant?: "default" | "luxury";
}

export function HourlyWeatherGlyph({ icon, accent = "day", variant = "default" }: HourlyWeatherGlyphProps) {
    const blurId = `hwg-${useId().replace(/:/g, "")}`;
    const i = icon.replace("@2x", "").toLowerCase();
    const night = accent === "night" || i.endsWith("n");

    let el: ReactElement;
    if (i.startsWith("01"))
        el = night ? <MoonGlyph blurId={blurId}/> : <SunGlyph blurId={blurId}/>;
    else if (i.startsWith("02"))
        el = night ? <MoonSmallCloudGlyph blurId={blurId}/> : <SunCloudGlyph blurId={blurId}/>;
    else if (i.startsWith("03") || i.startsWith("04"))
        el = <HeavyCloudGlyph blurId={blurId} night={night}/>;
    else if (i.startsWith("09") || i.startsWith("10"))
        el = <RainGlyph blurId={blurId} night={night}/>;
    else if (i.startsWith("11"))
        el = <StormGlyph blurId={blurId}/>;
    else if (i.startsWith("13"))
        el = <SnowGlyph blurId={blurId}/>;
    else if (i.startsWith("50"))
        el = <FogGlyph blurId={blurId} night={night}/>;
    else
        el = night ? <MoonGlyph blurId={blurId}/> : <SunCloudGlyph blurId={blurId}/>;

    if (variant !== "luxury") return el;
    return (
        <div
            className={[
                "relative flex items-center justify-center",
                "-translate-y-px scale-[1.14]",
                "brightness-[1.08] contrast-[1.06] saturate-[1.06]",
                "drop-shadow-[0_22px_36px_rgba(0,12,74,0.38)] sm:scale-[1.1]",
            ].join(" ")}
        >
            {el}
        </div>
    );
}

function blurDef(blurId: string) {
    return (
        <defs>
            <filter id={blurId} x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="1.6" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
    );
}

function SunGlyph({ blurId }: { blurId: string }) {
    const gid = `sg-${blurId}`;
    return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 drop-shadow-[0_0_22px_rgba(251,191,36,0.7)]" aria-hidden>
            {blurDef(blurId)}
            <radialGradient id={gid} cx="42%" cy="38%" r="58%">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="42%" stopColor="#fff7da"/>
                <stop offset="100%" stopColor="#fbbf24"/>
            </radialGradient>
            <g opacity={0.92}>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                    <path
                        key={a}
                        d="M24 4 L25.8 13 L24 11 L22.2 13Z"
                        fill="rgba(255,250,226,0.5)"
                        transform={`rotate(${a} 24 24)`}
                    />
                ))}
            </g>
            <circle cx="24" cy="24" r="13.5" fill={`url(#${gid})`}/>
            <circle cx="21" cy="21" r="4.8" fill="rgba(255,255,255,0.52)"/>
        </svg>
    );
}

function MoonGlyph({ blurId }: { blurId: string }) {
    const gid = `mg-${blurId}`;
    return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 drop-shadow-[0_0_24px_rgba(186,212,255,0.55)]" aria-hidden>
            {blurDef(blurId)}
            <radialGradient id={gid} cx="36%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#f4fbff"/>
                <stop offset="50%" stopColor="#c9d8ef"/>
                <stop offset="100%" stopColor="#7b8fba"/>
            </radialGradient>
            <circle cx="24" cy="24" r="17" fill="rgba(24,32,62,0.25)"/>
            <path
                d="M28 13 C41 13 43 29 43 36 C43 43 37 43 31 43 C38 36 40 28 39 21 C39 17 34 13 28 13Z"
                fill={`url(#${gid})`}
                filter={`url(#${blurId})`}
            />
            <ellipse cx="32" cy="17" rx="4" ry="2.8" fill="rgba(255,255,255,0.14)"/>
        </svg>
    );
}

function SunCloudGlyph({ blurId }: { blurId: string }) {
    const gs = `sc-s-${blurId}`;
    const gc = `sc-c-${blurId}`;
    return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 drop-shadow-[0_10px_22px_rgba(0,0,0,0.38)]" aria-hidden>
            <defs>
                <radialGradient id={gs} cx="32%" cy="35%" r="62%">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#fbbf24"/>
                </radialGradient>
                <linearGradient id={gc} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#bdd4ff"/>
                </linearGradient>
            </defs>
            <circle cx="17" cy="17" r="8.5" fill={`url(#${gs})`} opacity={0.98}/>
            <circle cx="14.5" cy="14" r="2.5" fill="rgba(255,255,255,0.72)"/>
            <path d="M9 41 C11 34 17 31 29 37 C43 43 43 43 43 43 L11 43 C9 43 9 43 9 41Z" fill={`url(#${gc})`} opacity={0.96}/>
        </svg>
    );
}

function MoonSmallCloudGlyph({ blurId }: { blurId: string }) {
    const gm = `msc-m-${blurId}`;
    const gc = `msc-c-${blurId}`;
    return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 drop-shadow-[0_0_18px_rgba(130,164,246,0.4)]" aria-hidden>
            <defs>
                <radialGradient id={gm} cx="38%" cy="28%" r="68%">
                    <stop offset="0%" stopColor="#eef4ff"/>
                    <stop offset="100%" stopColor="#8ea4cf"/>
                </radialGradient>
                <linearGradient id={gc} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#dfe8fc"/>
                    <stop offset="100%" stopColor="#8b9cc4"/>
                </linearGradient>
            </defs>
            <path d="M24 16 C37 14 41 31 41 38 C41 42 37 43 32 43 C36 39 39 34 39 29 C39 22 34 17 29 17Z" fill={`url(#${gm})`} opacity={0.94}/>
            <path d="M10 44 C13 37 26 34 36 43 C43 46 43 46 43 46 L11 46Z" fill={`url(#${gc})`} opacity={0.9}/>
        </svg>
    );
}

function HeavyCloudBodies({ blurId, night }: { blurId: string; night?: boolean }) {
    const gt = `hc-top-${blurId}`;
    const gs = `hc-sh-${blurId}`;
    return (
        <>
            <defs>
                <linearGradient id={gt} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={night ? "#c8d5f4" : "#ffffff"}/>
                    <stop offset="100%" stopColor={night ? "#6476a8" : "#aac6f5"}/>
                </linearGradient>
                <linearGradient id={gs} x1="0" x2="1">
                    <stop offset="0%" stopColor="#5a6fa0"/>
                    <stop offset="100%" stopColor="#3f4f78"/>
                </linearGradient>
            </defs>
            <path d="M4 43 C11 41 41 43 43 43 L43 43 L6 43Z" fill={`url(#${gs})`} opacity={0.55}/>
            <ellipse cx="19" cy="30" rx="16" ry="11" fill={`url(#${gt})`}/>
            <ellipse cx="33" cy="28" rx="13" ry="10" fill={`url(#${gt})`} opacity={0.88}/>
            <ellipse cx="25" cy="39" rx="20" ry="11" fill={`url(#${gs})`} opacity={0.45}/>
        </>
    );
}

function HeavyCloudGlyph({ blurId, night }: { blurId: string; night?: boolean }) {
    return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 drop-shadow-[0_10px_22px_rgba(0,0,0,0.42)]" aria-hidden>
            <HeavyCloudBodies blurId={blurId} night={night}/>
        </svg>
    );
}

function RainGlyph({ blurId, night }: { blurId: string; night: boolean }) {
    return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 drop-shadow-[0_8px_18px_rgba(56,165,246,0.45)]" aria-hidden>
            <HeavyCloudBodies blurId={`${blurId}-r`} night={night}/>
            <g opacity={0.9} stroke="rgba(174,218,254,0.95)" strokeLinecap="round" strokeWidth="1.4">
                <line x1="14" y1="39" x2="12.5" y2="46"/>
                <line x1="23" y1="41" x2="21" y2="46"/>
                <line x1="32" y1="39" x2="30.5" y2="46"/>
            </g>
        </svg>
    );
}

function StormGlyph({ blurId }: { blurId: string }) {
    const bid = `${blurId}-s`;
    return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 drop-shadow-[0_0_28px_rgba(250,232,132,0.45)]" aria-hidden>
            {blurDef(bid)}
            <HeavyCloudBodies blurId={`${blurId}-st`} night/>
            <path
                d="M26 42 L31 53 L31 58 L41 58 L34 67 L43 67 L26 88 L34 67 L21 67Z"
                fill="rgba(254,246,154,0.96)"
                filter={`url(#${bid})`}
                opacity={0.9}
                transform="translate(10,10) scale(0.42)"
            />
        </svg>
    );
}

function SnowGlyph({ blurId }: { blurId: string }) {
    return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 drop-shadow-[0_0_16px_rgba(240,249,255,0.55)]" aria-hidden>
            <HeavyCloudBodies blurId={`${blurId}-sn`}/>
            <g fill="rgba(248,252,255,0.92)">
                <circle cx="15" cy="45" r="1.85"/>
                <circle cx="24" cy="47" r="1.55"/>
                <circle cx="33" cy="45" r="1.75"/>
                <circle cx="20" cy="49" r="1.2"/>
                <circle cx="28" cy="50" r="1.15"/>
            </g>
        </svg>
    );
}

function FogGlyph({ blurId, night }: { blurId: string; night: boolean }) {
    return (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 opacity-[0.95]" aria-hidden>
            {blurDef(blurId)}
            {[0, 1, 2].map((k) => (
                <ellipse
                    key={k}
                    cx="24"
                    cy={31 + k * 7}
                    rx={18 + k}
                    ry={3.6}
                    fill={night ? "rgba(148,164,216,0.38)" : "rgba(255,255,255,0.42)"}
                    filter={k === 1 ? `url(#${blurId})` : undefined}
                />
            ))}
        </svg>
    );
}
