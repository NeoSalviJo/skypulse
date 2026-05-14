import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { useTheme } from "./theme-provider";
import { DAY_PHASE_TINT, type DayPhase } from "@/lib/day-phase";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
interface AnimatedBackgroundProps {
    conditionCode: string;
    timeOfDay: TimeOfDay;
    cityImageUrl?: string | null;
    dayPhase?: DayPhase | null;
    windSpeedKmh?: number;
}
const STARS_TINY = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><g fill="#fff">
    <circle cx="42"  cy="28"  r="0.9"/><circle cx="120" cy="70"  r="0.7"/>
    <circle cx="220" cy="18"  r="1.1"/><circle cx="310" cy="55"  r="0.8"/>
    <circle cx="400" cy="30"  r="0.6"/><circle cx="490" cy="85"  r="1.0"/>
    <circle cx="550" cy="15"  r="0.7"/><circle cx="580" cy="60"  r="0.9"/>
    <circle cx="30"  cy="120" r="0.8"/><circle cx="90"  cy="160" r="1.2"/>
    <circle cx="170" cy="130" r="0.7"/><circle cx="260" cy="170" r="0.9"/>
    <circle cx="350" cy="140" r="0.6"/><circle cx="450" cy="110" r="1.1"/>
    <circle cx="520" cy="150" r="0.8"/><circle cx="70"  cy="220" r="0.7"/>
    <circle cx="150" cy="250" r="1.0"/><circle cx="280" cy="230" r="0.8"/>
    <circle cx="370" cy="260" r="0.6"/><circle cx="460" cy="210" r="1.2"/>
    <circle cx="540" cy="240" r="0.9"/><circle cx="15"  cy="310" r="0.7"/>
    <circle cx="100" cy="340" r="0.8"/><circle cx="200" cy="300" r="1.1"/>
    <circle cx="330" cy="360" r="0.7"/><circle cx="430" cy="320" r="0.9"/>
    <circle cx="510" cy="380" r="0.6"/><circle cx="570" cy="330" r="1.0"/>
  </g></svg>`);
const STARS_MEDIUM = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><g fill="#fff">
    <circle cx="80"  cy="45"  r="1.5"/><circle cx="195" cy="90"  r="1.8"/>
    <circle cx="290" cy="35"  r="1.3"/><circle cx="380" cy="80"  r="1.6"/>
    <circle cx="475" cy="50"  r="1.4"/><circle cx="560" cy="100" r="1.7"/>
    <circle cx="50"  cy="180" r="1.5"/><circle cx="160" cy="210" r="1.3"/>
    <circle cx="260" cy="190" r="1.8"/><circle cx="360" cy="220" r="1.4"/>
    <circle cx="470" cy="175" r="1.6"/><circle cx="55"  cy="290" r="1.3"/>
    <circle cx="175" cy="320" r="1.7"/><circle cx="290" cy="280" r="1.5"/>
    <circle cx="410" cy="350" r="1.4"/><circle cx="510" cy="295" r="1.8"/>
    <circle cx="145" cy="370" r="1.6"/><circle cx="340" cy="380" r="1.3"/>
    <circle cx="500" cy="360" r="1.5"/><circle cx="580" cy="270" r="1.7"/>
  </g></svg>`);
const STARS_BRIGHT = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><g fill="#fff">
    <circle cx="110" cy="60"  r="2.2"/><circle cx="250" cy="110" r="2.5"/>
    <circle cx="420" cy="55"  r="2.0"/><circle cx="540" cy="130" r="2.3"/>
    <circle cx="60"  cy="200" r="2.4"/><circle cx="210" cy="260" r="2.1"/>
    <circle cx="360" cy="195" r="2.6"/><circle cx="490" cy="240" r="2.0"/>
    <circle cx="130" cy="340" r="2.3"/><circle cx="320" cy="370" r="2.1"/>
    <circle cx="555" cy="310" r="2.5"/><circle cx="30"  cy="380" r="2.2"/>
  </g></svg>`);
const RAIN_DROP = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="6" height="32">
    <line x1="2" y1="0" x2="0" y2="32" stroke="rgba(180,210,255,0.22)" stroke-width="1.2"/>
  </svg>`);
const RAIN_DROP_HEAVY = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="5" height="40">
    <line x1="2" y1="0" x2="0" y2="40" stroke="rgba(150,190,240,0.30)" stroke-width="1.5"/>
  </svg>`);
const SNOW_LARGE = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
    <circle cx="5" cy="5" r="3.5" fill="rgba(255,255,255,0.75)"/>
  </svg>`);
const SNOW_MEDIUM = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7">
    <circle cx="3.5" cy="3.5" r="2.5" fill="rgba(255,255,255,0.60)"/>
  </svg>`);
const SNOW_SMALL = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4">
    <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.45)"/>
  </svg>`);
function svgUrl(svg: string): string {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}
function resolveScene(conditionCode: string, timeOfDay: TimeOfDay, theme: string): string {
    if (!conditionCode) {
        if (theme === "light")
            return timeOfDay === "night" ? "afternoon" : timeOfDay;
        return timeOfDay;
    }
    if (conditionCode === "clear") {
        if (timeOfDay === "morning")
            return "morning";
        if (timeOfDay === "evening")
            return "evening";
        return "afternoon";
    }
    if (conditionCode === "night")
        return "night";
    return conditionCode;
}
export function AnimatedBackground({ conditionCode, timeOfDay, cityImageUrl, dayPhase, windSpeedKmh = 0 }: AnimatedBackgroundProps) {
    const { theme } = useTheme();
    const scene = resolveScene(conditionCode, timeOfDay, theme);
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const springX = useSpring(rawX, { stiffness: 55, damping: 22 });
    const springY = useSpring(rawY, { stiffness: 55, damping: 22 });
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            rawX.set((e.clientX / window.innerWidth - 0.5) * 22);
            rawY.set((e.clientY / window.innerHeight - 0.5) * 14);
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        return () => window.removeEventListener("mousemove", onMove);
    }, [rawX, rawY]);
    return (<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">

      
      <AnimatePresence mode="wait">
        <motion.div key={`${scene}-${theme}`} initial={{ opacity: 0 }} animate={{ opacity: cityImageUrl ? 0.15 : 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.6, ease: "easeInOut" }} className="absolute inset-0">
          {scene === "morning" && <MorningSky />}
          {scene === "afternoon" && <AfternoonSky />}
          {scene === "evening" && <EveningSky />}
          {scene === "night" && <NightSky />}
          {scene === "cloudy" && <CloudySky theme={theme}/>}
          {scene === "fog" && <FogSky theme={theme}/>}
          {scene === "rain" && <RainSky theme={theme}/>}
          {scene === "snow" && <SnowSky theme={theme}/>}
          {scene === "storm" && <StormSky />}
        </motion.div>
      </AnimatePresence>

      
      <AnimatePresence mode="wait">
        {cityImageUrl && (<motion.div key={cityImageUrl} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 overflow-hidden">
            
            <motion.img key={cityImageUrl + "-img"} src={cityImageUrl} alt="" draggable={false} initial={{ scale: 1.14 }} animate={{ scale: 1.08 }} transition={{ duration: 20, ease: "easeOut" }} style={{
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center",
                willChange: "transform",
                x: springX,
                y: springY,
            }}/>
          </motion.div>)}
      </AnimatePresence>

      
      {cityImageUrl && (<>
          <div className={theme === "light"
                ? "absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
                : "absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"}/>
          <div className={theme === "light"
                ? "absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"
                : "absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"}/>
          <div className="absolute inset-0" style={{
                boxShadow: theme === "light"
                    ? "inset 0 0 120px 50px rgba(255,255,255,0.45)"
                    : "inset 0 0 200px 80px rgba(0,0,0,0.65)",
            }}/>
          <div className={theme === "light"
                ? "absolute inset-0 bg-white/15"
                : "absolute inset-0 bg-black/25 mix-blend-multiply"}/>
          <AmbientLight scene={scene}/>
          <WeatherPhotoOverlay conditionCode={conditionCode}/>
        </>)}

      
      {dayPhase && (<AtmosphereTint phase={dayPhase} muted={!!cityImageUrl} light={theme === "light"}/>)}
      {!cityImageUrl && <AmbientParticles conditionCode={conditionCode}/>}
      {windSpeedKmh > 28 && <WindShear intensity={Math.min(1, (windSpeedKmh - 28) / 50)}/>}
      {(conditionCode === "rain" || conditionCode === "storm") && <WetGlassSheen />}

      
      <div className={`absolute inset-0 pointer-events-none mix-blend-overlay ${theme === "light" ? "opacity-10" : "opacity-25"}`} style={{
            backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')",
        }}/>
    </div>);
}
function AtmosphereTint({ phase, muted, light, }: {
    phase: DayPhase;
    muted: boolean;
    light: boolean;
}) {
    const t = DAY_PHASE_TINT[phase];
    const o = light
        ? muted
            ? 0.22
            : 0.4
        : muted
            ? 0.4
            : 0.68;
    return (<motion.div className="absolute inset-0 z-[3] pointer-events-none" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: o }} transition={{ duration: 2.8, ease: "easeInOut" }} style={{
            background: `
          linear-gradient(195deg, ${t.a} 0%, transparent 45%, ${t.b} 100%),
          radial-gradient(ellipse 100% 55% at 50% 0%, ${t.glow} 0%, transparent 52%),
          radial-gradient(ellipse 95% 60% at 50% 100%, ${t.vignette} 0%, transparent 58%)
        `,
            mixBlendMode: light ? "multiply" : "soft-light",
        }}/>);
}
function AmbientParticles({ conditionCode }: {
    conditionCode: string;
}) {
    const seeds = [...Array(10)].map((_, i) => ({
        id: i,
        left: ((i * 17 + conditionCode.length * 3) % 90) + 5,
        top: ((i * 23) % 85) + 5,
        delay: (i * 0.4) % 3,
        dur: 12 + (i % 5) * 2,
    }));
    return (<div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
      {seeds.map((s) => (<motion.div key={s.id} className="absolute w-1 h-1 rounded-full bg-white/45" style={{ left: `${s.left}%`, top: `${s.top}%`, willChange: "transform, opacity" }} animate={{ y: [0, -36, 0], opacity: [0.15, 0.55, 0.15] }} transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}/>))}
    </div>);
}
function WindShear({ intensity }: {
    intensity: number;
}) {
    const dur = 16 + 12 * (1 - intensity);
    return (<motion.div className="absolute inset-0 z-[4] pointer-events-none opacity-35" style={{
            background: "linear-gradient(102deg, transparent 25%, rgba(255,255,255,0.07) 50%, transparent 75%)",
            filter: "blur(28px)",
            willChange: "transform",
        }} animate={{ x: ["-18%", "18%", "-18%"] }} transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}/>);
}
function WetGlassSheen() {
    return (<div className="absolute inset-0 z-[4] pointer-events-none opacity-35 mix-blend-soft-light" style={{
            backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 3px, rgba(255,255,255,0.06) 4px, transparent 7px)",
            animation: "fog-drift-slow 5s ease-in-out infinite",
        }}/>);
}
function AmbientLight({ scene }: {
    scene: string;
}) {
    const colours: Record<string, [
        string,
        string
    ]> = {
        morning: ["rgba(251,167,60,0.18)", "rgba(233,100,80,0.12)"],
        afternoon: ["rgba(96,165,250,0.15)", "rgba(147,197,253,0.10)"],
        evening: ["rgba(200,80,130,0.18)", "rgba(251,146,60,0.14)"],
        night: ["rgba(80,100,200,0.14)", "rgba(30,60,150,0.08)"],
        clear: ["rgba(251,191,36,0.16)", "rgba(96,165,250,0.10)"],
        cloudy: ["rgba(148,163,184,0.12)", "rgba(100,116,139,0.08)"],
        rain: ["rgba(96,125,200,0.15)", "rgba(30,60,130,0.10)"],
        snow: ["rgba(200,220,250,0.16)", "rgba(180,210,240,0.10)"],
        storm: ["rgba(100,60,180,0.20)", "rgba(50,20,120,0.12)"],
    };
    const [c1, c2] = colours[scene] ?? colours.night;
    return (<>
      <motion.div animate={{ x: [0, 80, -40, 0], y: [0, -40, 60, 0], opacity: [0.6, 1, 0.7, 0.6] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute pointer-events-none" style={{
            width: 600,
            height: 400,
            borderRadius: "50%",
            top: "10%",
            left: "15%",
            background: c1,
            filter: "blur(100px)",
        }}/>
      <motion.div animate={{ x: [0, -60, 30, 0], y: [0, 50, -30, 0], opacity: [0.5, 0.8, 0.6, 0.5] }} transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 5 }} className="absolute pointer-events-none" style={{
            width: 500,
            height: 350,
            borderRadius: "50%",
            bottom: "20%",
            right: "10%",
            background: c2,
            filter: "blur(120px)",
        }}/>
    </>);
}
function WeatherPhotoOverlay({ conditionCode }: {
    conditionCode: string;
}) {
    if (conditionCode === "rain") {
        return (<>
        <div className="absolute inset-0" style={{
                backgroundImage: `url(${RAIN_DROP})`,
                backgroundSize: "30px 70px",
                opacity: 0.25,
                animation: "rain 0.5s linear infinite",
                transform: "rotate(-8deg) scale(1.1)",
            }}/>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/30"/>
      </>);
    }
    if (conditionCode === "storm") {
        return (<>
        <div className="absolute inset-0" style={{
                backgroundImage: `url(${RAIN_DROP_HEAVY})`,
                backgroundSize: "22px 55px",
                opacity: 0.30,
                animation: "rain-heavy 0.32s linear infinite",
                transform: "rotate(-10deg) scale(1.12)",
            }}/>
        <motion.div animate={{ opacity: [0, 0, 0.35, 0, 0] }} transition={{ duration: 9, repeat: Infinity, times: [0, 0.35, 0.36, 0.37, 1] }} className="absolute inset-0 bg-indigo-100/10 mix-blend-screen"/>
      </>);
    }
    if (conditionCode === "snow") {
        return (<div className="absolute inset-0" style={{
                backgroundImage: `url(${SNOW_SMALL})`,
                backgroundSize: "50px 50px",
                opacity: 0.35,
                animation: "snow-medium 8s linear infinite",
            }}/>);
    }
    if (conditionCode === "clear" || conditionCode === "morning" || conditionCode === "afternoon") {
        return (<motion.div animate={{ opacity: [0.04, 0.10, 0.04] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0" style={{
                background: "radial-gradient(ellipse 80% 60% at 60% 20%, rgba(254,240,138,0.25) 0%, transparent 65%)",
            }}/>);
    }
    return null;
}
const SCREEN_W = typeof window !== "undefined" ? window.innerWidth + 300 : 1800;
function Birds({ dim = false }: {
    dim?: boolean;
}) {
    const opacity = dim ? 0.35 : 0.6;
    const flocks = [
        { top: "13%", count: 6, dur: 22, delay: 4, repeat: 42 },
        { top: "21%", count: 4, dur: 32, delay: 20, repeat: 56 },
        { top: "7%", count: 8, dur: 19, delay: 46, repeat: 40 },
    ];
    return (<>
      {flocks.map((f, fi) => (<motion.div key={fi} initial={{ x: -220 }} animate={{ x: SCREEN_W }} transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, repeatDelay: f.repeat, ease: "linear" }} style={{ position: "absolute", top: f.top, display: "flex", gap: 16, opacity }}>
          {[...Array(f.count)].map((_, bi) => (<motion.svg key={bi} width="22" height="12" viewBox="0 0 22 12" style={{ marginTop: Math.sin(bi * 0.9) * 10 }} animate={{ scaleY: [1, 0.25, 1] }} transition={{ duration: 0.45, delay: bi * 0.06, repeat: Infinity, ease: "easeInOut" }}>
              <path d="M 0 10 Q 5.5 0 11 5 Q 16.5 0 22 10" stroke="rgba(0,0,0,0.6)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </motion.svg>))}
        </motion.div>))}
    </>);
}
function Airplane() {
    return (<motion.div initial={{ x: -280, y: 0 }} animate={{ x: SCREEN_W, y: -35 }} transition={{ duration: 32, delay: 12, repeat: Infinity, repeatDelay: 88, ease: "linear" }} style={{ position: "absolute", top: "16%", left: 0, display: "flex", alignItems: "center" }}>
      
      <div style={{ width: 110, height: 2, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.55))", borderRadius: 2, marginRight: -1 }}/>
      
      <svg width="30" height="20" viewBox="0 0 30 20" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}>
        <path d="M 2 10 L 22 10 L 28 6 L 30 10 L 28 14 L 22 10 M 10 10 L 8 2 M 10 10 L 8 18" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.div>);
}
function MorningSky() {
    return (<div className="absolute inset-0 bg-gradient-to-b from-[#1a1a3e] via-[#c96a3a] via-40% to-[#f5c07a]">
      
      <div className="absolute bottom-0 left-0 right-0 h-2/5" style={{
            background: "radial-gradient(ellipse 120% 60% at 50% 100%, rgba(251,167,60,0.85) 0%, rgba(239,104,50,0.45) 45%, transparent 75%)",
            animation: "sunrise-glow 6s ease-in-out infinite",
        }}/>
      
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute" style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            bottom: "22%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "radial-gradient(circle, #FDE68A 0%, #FBBF24 35%, #F59E0B 65%, transparent 80%)",
            animation: "sun-pulse 5s ease-in-out infinite",
        }}/>
      
      <div className="absolute" style={{
            width: 320,
            height: 320,
            borderRadius: "50%",
            bottom: "14%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(251,191,36,0.07) 5deg, transparent 10deg, transparent 20deg, rgba(251,191,36,0.06) 25deg, transparent 30deg, transparent 40deg, rgba(251,191,36,0.08) 45deg, transparent 50deg, transparent 60deg, rgba(251,191,36,0.05) 65deg, transparent 70deg)",
            animation: "sun-rays 8s ease-in-out infinite",
        }}/>
      
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#0f0f2e]/70"/>
      
      <div className="absolute left-0 right-0" style={{
            height: 160,
            bottom: "35%",
            background: "linear-gradient(to top, transparent, rgba(233,100,100,0.18), transparent)",
        }}/>
      <Birds />
      <Airplane />
    </div>);
}
function AfternoonSky() {
    return (<div className="absolute inset-0 bg-gradient-to-b from-[#0369A1] via-[#38BDF8] to-[#7DD3FC]">
      
      <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute" style={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            top: "12%",
            right: "18%",
            background: "radial-gradient(circle, #FEFCE8 0%, #FEF08A 25%, #FCD34D 55%, transparent 78%)",
            animation: "sun-pulse 5s ease-in-out infinite",
        }}/>
      
      <div className="absolute" style={{
            width: 360,
            height: 360,
            borderRadius: "50%",
            top: "3%",
            right: "7%",
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(254,240,138,0.06) 5deg, transparent 10deg, transparent 18deg, rgba(254,240,138,0.05) 23deg, transparent 28deg, transparent 38deg, rgba(254,240,138,0.07) 43deg, transparent 50deg)",
            animation: "sun-rays 10s ease-in-out infinite",
        }}/>
      
      <motion.div animate={{ x: [0, 80, 0] }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }} className="absolute" style={{
            width: 520,
            height: 180,
            borderRadius: "50%",
            top: "20%",
            left: "-5%",
            background: "rgba(255,255,255,0.22)",
            filter: "blur(40px)",
        }}/>
      
      <motion.div animate={{ x: [0, -60, 0] }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} className="absolute" style={{
            width: 400,
            height: 140,
            borderRadius: "50%",
            top: "38%",
            right: "-8%",
            background: "rgba(255,255,255,0.18)",
            filter: "blur(50px)",
        }}/>
      
      <div className="absolute inset-0 bg-gradient-to-t from-sky-200/30 to-transparent"/>
      <Birds />
      <Airplane />
    </div>);
}
function EveningSky() {
    return (<div className="absolute inset-0 bg-gradient-to-b from-[#0F0C29] via-[#5C3E7A] via-35% to-[#CC7744]">
      
      <div className="absolute bottom-0 left-0 right-0 h-2/5" style={{
            background: "radial-gradient(ellipse 130% 70% at 50% 100%, rgba(255,140,60,0.9) 0%, rgba(200,80,130,0.5) 40%, transparent 70%)",
            animation: "sunset-bloom 7s ease-in-out infinite",
        }}/>
      
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} style={{
            position: "absolute",
            width: 110,
            height: 110,
            borderRadius: "50%",
            bottom: "18%",
            left: "45%",
            background: "radial-gradient(circle, #FEF3C7 0%, #FCD34D 30%, #F97316 60%, transparent 80%)",
            animation: "sun-pulse 6s ease-in-out infinite",
        }}/>
      
      <motion.div animate={{ x: [0, 50, 0] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} style={{
            position: "absolute",
            width: 600,
            height: 200,
            borderRadius: "50%",
            top: "25%",
            left: "-10%",
            background: "rgba(130,60,160,0.18)",
            filter: "blur(55px)",
        }}/>
      <motion.div animate={{ x: [0, -40, 0] }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} style={{
            position: "absolute",
            width: 500,
            height: 160,
            borderRadius: "50%",
            top: "40%",
            right: "-10%",
            background: "rgba(200,80,100,0.15)",
            filter: "blur(60px)",
        }}/>
      
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${STARS_TINY})`, backgroundSize: "400px 200px" }}/>
    </div>);
}
function NightSky() {
    return (<div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0C0E2A] to-[#161A3C]">
      
      <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: `url(${STARS_TINY})`,
            backgroundSize: "600px 400px",
            animation: "twinkle-a 4s ease-in-out infinite",
        }}/>
      <div className="absolute inset-0 opacity-55" style={{
            backgroundImage: `url(${STARS_MEDIUM})`,
            backgroundSize: "600px 400px",
            backgroundPosition: "150px 80px",
            animation: "twinkle-b 6s ease-in-out infinite",
        }}/>
      <div className="absolute inset-0 opacity-70" style={{
            backgroundImage: `url(${STARS_BRIGHT})`,
            backgroundSize: "600px 400px",
            backgroundPosition: "80px 160px",
            animation: "twinkle-c 5s ease-in-out infinite",
        }}/>
      
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} style={{
            position: "absolute",
            width: 72,
            height: 72,
            borderRadius: "50%",
            top: "12%",
            right: "16%",
            background: "radial-gradient(circle at 38% 38%, #E8F0FF 0%, #C8D8F0 45%, #9AB0D0 80%, transparent 100%)",
            animation: "moon-glow 6s ease-in-out infinite",
        }}/>
      
      <div style={{
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: "50%",
            top: "calc(12% + 6px)",
            right: "calc(16% - 14px)",
            background: "#0C0E2A",
            opacity: 0.88,
        }}/>
      
      <motion.div animate={{ opacity: [0.06, 0.13, 0.06] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{
            position: "absolute",
            width: 500,
            height: 300,
            borderRadius: "50%",
            top: "10%",
            left: "20%",
            background: "rgba(80,100,200,0.18)",
            filter: "blur(80px)",
        }}/>
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b20]/60 to-transparent"/>
    </div>);
}
function CloudySky({ theme }: {
    theme: string;
}) {
    const isDark = theme === "dark";
    return (<div className="absolute inset-0" style={{
            background: isDark
                ? "linear-gradient(to bottom, #1E293B, #334155, #475569)"
                : "linear-gradient(to bottom, #94A3B8, #CBD5E1, #E2E8F0)",
        }}>
      
      {[
            { w: 700, h: 220, top: "8%", left: "-5%", dur: 55, opacity: 0.22, delay: 0 },
            { w: 500, h: 180, top: "28%", right: "-8%", dur: 75, opacity: 0.18, delay: 0, dirR: true },
            { w: 600, h: 200, top: "50%", left: "-10%", dur: 65, opacity: 0.15, delay: 0 },
            { w: 450, h: 150, top: "70%", right: "-5%", dur: 85, opacity: 0.20, delay: 0, dirR: true },
            { w: 800, h: 250, top: "2%", left: "20%", dur: 45, opacity: 0.12, delay: 0 },
        ].map((c, i) => (<motion.div key={i} animate={{ x: c.dirR ? [0, -120, 0] : [0, 120, 0] }} transition={{ duration: c.dur, repeat: Infinity, ease: "linear" }} style={{
                position: "absolute",
                width: c.w,
                height: c.h,
                borderRadius: "50%",
                top: c.top,
                ...(c.left !== undefined ? { left: c.left } : { right: (c as {
                        right?: string;
                    }).right }),
                background: isDark ? `rgba(150,170,190,${c.opacity})` : `rgba(255,255,255,${c.opacity + 0.15})`,
                filter: "blur(50px)",
            }}/>))}
    </div>);
}
function FogSky({ theme }: {
    theme: string;
}) {
    const isDark = theme === "dark";
    return (<div className="absolute inset-0" style={{
            background: isDark
                ? "linear-gradient(to bottom, #1a1f2e, #2d3548, #3a4255)"
                : "linear-gradient(to bottom, #c8d0dd, #dde3ec, #edf0f5)",
        }}>
      
      {[
            { h: "35%", top: "0%", dur: 28, delay: 0, x: 80, opacity: isDark ? 0.35 : 0.55, blur: 40 },
            { h: "40%", top: "20%", dur: 40, delay: -12, x: -70, opacity: isDark ? 0.28 : 0.48, blur: 60 },
            { h: "45%", top: "40%", dur: 35, delay: -6, x: 90, opacity: isDark ? 0.32 : 0.52, blur: 50 },
            { h: "50%", top: "55%", dur: 50, delay: -20, x: -60, opacity: isDark ? 0.40 : 0.60, blur: 70 },
            { h: "30%", top: "10%", dur: 22, delay: -4, x: 60, opacity: isDark ? 0.20 : 0.38, blur: 30 },
        ].map((f, i) => (<motion.div key={i} animate={{ x: [0, f.x, 0] }} transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: "easeInOut" }} style={{
                position: "absolute",
                left: "-10%",
                width: "120%",
                height: f.h,
                top: f.top,
                borderRadius: "60%",
                background: isDark
                    ? `rgba(160,175,200,${f.opacity})`
                    : `rgba(220,228,238,${f.opacity})`,
                filter: `blur(${f.blur}px)`,
            }}/>))}
      
      <motion.div animate={{ opacity: [0.06, 0.12, 0.06] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0" style={{
            background: isDark
                ? "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(180,200,220,0.04) 61px)"
                : "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(200,215,230,0.08) 61px)",
        }}/>
    </div>);
}
function RainSky({ theme }: {
    theme: string;
}) {
    const isDark = theme === "dark";
    return (<div className="absolute inset-0" style={{
            background: isDark
                ? "linear-gradient(to bottom, #0A1628, #1E293B, #2D3E55)"
                : "linear-gradient(to bottom, #64748B, #94A3B8, #B0BEC8)",
        }}>
      
      <motion.div animate={{ x: [0, 60, 0] }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }} style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "35%",
            background: isDark ? "rgba(30,50,80,0.7)" : "rgba(100,120,140,0.5)",
            filter: "blur(30px)",
        }}/>
      
      <div className="absolute inset-0" style={{
            backgroundImage: `url(${RAIN_DROP})`,
            backgroundSize: "28px 70px",
            opacity: isDark ? 0.55 : 0.4,
            animation: "rain 0.45s linear infinite",
            transform: "rotate(-8deg) scale(1.1)",
        }}/>
      
      <div className="absolute inset-0" style={{
            backgroundImage: `url(${RAIN_DROP_HEAVY})`,
            backgroundSize: "42px 90px",
            backgroundPosition: "14px 20px",
            opacity: isDark ? 0.4 : 0.28,
            animation: "rain 0.6s linear infinite",
            transform: "rotate(-10deg) scale(1.08)",
        }}/>
      
      <div className="absolute bottom-0 left-0 right-0 h-1/4" style={{
            background: isDark
                ? "linear-gradient(to top, rgba(30,50,80,0.5), transparent)"
                : "linear-gradient(to top, rgba(150,170,190,0.4), transparent)",
        }}/>
    </div>);
}
function SnowSky({ theme }: {
    theme: string;
}) {
    const isDark = theme === "dark";
    return (<div className="absolute inset-0" style={{
            background: isDark
                ? "linear-gradient(to bottom, #1A2540, #2D3A55, #3D4F6B)"
                : "linear-gradient(to bottom, #D1DCE8, #E8EFF5, #F5F8FA)",
        }}>
      
      <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: isDark ? "rgba(40,55,80,0.6)" : "rgba(200,215,230,0.7)",
            filter: "blur(35px)",
        }}/>
      
      <div className="absolute inset-0" style={{
            backgroundImage: `url(${SNOW_LARGE})`,
            backgroundSize: "80px 80px",
            opacity: 0.7,
            animation: "snow-slow 9s linear infinite",
        }}/>
      
      <div className="absolute inset-0" style={{
            backgroundImage: `url(${SNOW_MEDIUM})`,
            backgroundSize: "55px 55px",
            backgroundPosition: "25px 30px",
            opacity: 0.6,
            animation: "snow-medium 7s linear infinite",
        }}/>
      
      <div className="absolute inset-0" style={{
            backgroundImage: `url(${SNOW_SMALL})`,
            backgroundSize: "36px 36px",
            backgroundPosition: "10px 15px",
            opacity: 0.5,
            animation: "snow-fast 5s linear infinite",
        }}/>
      
      <div className="absolute bottom-0 left-0 right-0 h-1/5" style={{
            background: isDark
                ? "linear-gradient(to top, rgba(180,200,220,0.12), transparent)"
                : "linear-gradient(to top, rgba(255,255,255,0.5), transparent)",
        }}/>
    </div>);
}
function StormSky() {
    return (<div className="absolute inset-0" style={{
            background: "linear-gradient(to bottom, #020408, #0A0E1A, #12183A)",
        }}>
      
      <motion.div animate={{ x: [0, 40, 0] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{
            position: "absolute",
            top: 0,
            left: "-5%",
            right: "-5%",
            height: "45%",
            background: "rgba(15,20,50,0.9)",
            filter: "blur(25px)",
        }}/>
      
      <div className="absolute inset-0" style={{
            backgroundImage: `url(${RAIN_DROP_HEAVY})`,
            backgroundSize: "20px 60px",
            opacity: 0.65,
            animation: "rain-heavy 0.3s linear infinite",
            transform: "rotate(-12deg) scale(1.15)",
        }}/>
      
      <div className="absolute inset-0" style={{
            backgroundImage: `url(${RAIN_DROP})`,
            backgroundSize: "16px 40px",
            backgroundPosition: "8px 0px",
            opacity: 0.45,
            animation: "rain-heavy 0.22s linear infinite",
            transform: "rotate(-9deg) scale(1.12)",
        }}/>
      
      <motion.div animate={{ opacity: [0, 0, 0.9, 0.2, 0.8, 0, 0, 0, 0, 0] }} transition={{
            duration: 8,
            repeat: Infinity,
            times: [0, 0.35, 0.36, 0.37, 0.38, 0.39, 0.6, 0.75, 0.9, 1],
        }} className="absolute inset-0 bg-indigo-200/20 mix-blend-screen"/>
      
      <motion.div animate={{ opacity: [0, 0, 0.6, 0, 0] }} transition={{
            duration: 8,
            repeat: Infinity,
            times: [0, 0.355, 0.36, 0.365, 1],
        }} style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            top: "5%",
            left: "30%",
            background: "rgba(150,100,255,0.4)",
            filter: "blur(60px)",
        }}/>
      
      <div className="absolute bottom-0 left-0 right-0 h-1/4" style={{
            background: "linear-gradient(to top, rgba(10,15,40,0.7), transparent)",
        }}/>
    </div>);
}
