import { motion } from "framer-motion";
export function WeatherHeroVisual({ conditionCode, iconCode, description, isDay }: {
    conditionCode: string;
    iconCode: string;
    description: string;
    isDay: boolean;
}) {
    const code = conditionCode === "fog" ? "fog" : conditionCode;
    const showSun = isDay && code === "clear";
    const showMoon = !isDay && (code === "clear" || code === "night");
    const showRain = code === "rain" || code === "storm";
    const showSnow = code === "snow";
    const showStorm = code === "storm";
    return (<div className="relative w-36 h-36 md:w-44 md:h-44 shrink-0 flex items-center justify-center">
      <AmbientGlow code={code}/>
      {showSun && <SunDisc />}
      {showMoon && <MoonDisc />}
      {(code === "cloudy" || code === "fog") && <CloudLayers dim={code === "fog"}/>}
      {showRain && <RainPreview />}
      {showSnow && <SnowPreview />}
      {showStorm && <StormPreview />}
      <motion.img src={`https://openweathermap.org/img/wn/${iconCode}@4x.png`} alt={description} className="relative z-10 w-28 h-28 md:w-36 md:h-36 drop-shadow-2xl" animate={{ y: [0, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}/>
    </div>);
}
function AmbientGlow({ code }: {
    code: string;
}) {
    const colors: Record<string, string> = {
        clear: "rgba(253,224,71,0.35)",
        cloudy: "rgba(148,163,184,0.25)",
        fog: "rgba(200,210,230,0.3)",
        rain: "rgba(96,165,250,0.25)",
        snow: "rgba(224,242,254,0.35)",
        storm: "rgba(129,140,248,0.35)",
        night: "rgba(100,140,255,0.15)",
    };
    const c = colors[code] ?? colors.cloudy;
    return (<motion.div className="absolute inset-0 rounded-full blur-3xl scale-110 pointer-events-none" style={{ background: `radial-gradient(circle, ${c} 0%, transparent 70%)` }} animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.06, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}/>);
}
function SunDisc() {
    return (<motion.div className="absolute -top-1 left-4 w-20 h-20 rounded-full pointer-events-none opacity-70" style={{
            background: "radial-gradient(circle, #FEF9C3 0%, #FBBF24 50%, transparent 70%)",
            boxShadow: "0 0 60px 20px rgba(251,191,36,0.4)",
        }} animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}/>);
}
function MoonDisc() {
    return (<motion.div className="absolute top-2 right-2 w-14 h-14 rounded-full pointer-events-none opacity-80" style={{
            background: "radial-gradient(circle at 35% 35%, #E8F0FF 0%, #A8B8D8 55%, transparent 78%)",
            boxShadow: "0 0 40px 12px rgba(180,200,255,0.25)",
        }} animate={{ y: [0, -4, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}/>);
}
function CloudLayers({ dim }: {
    dim: boolean;
}) {
    return (<>
      {[0, 1, 2].map((i) => (<motion.div key={i} className="absolute rounded-full pointer-events-none opacity-50" style={{
                width: 80 + i * 20,
                height: 32 + i * 8,
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
                background: dim ? "rgba(180,190,210,0.4)" : "rgba(255,255,255,0.35)",
                filter: "blur(12px)",
            }} animate={{ x: [0, i % 2 ? -12 : 14, 0] }} transition={{ duration: 18 + i * 4, repeat: Infinity, ease: "easeInOut" }}/>))}
    </>);
}
function RainPreview() {
    return (<div className="absolute inset-0 pointer-events-none opacity-40" style={{
            backgroundImage: "repeating-linear-gradient(155deg, transparent, transparent 6px, rgba(147,197,253,0.35) 7px, transparent 9px)",
            animation: "rain 0.6s linear infinite",
        }}/>);
}
function SnowPreview() {
    return (<div className="absolute inset-0 pointer-events-none opacity-45" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 0.5px, transparent 1px)",
            backgroundSize: "24px 28px",
            animation: "snow-medium 7s linear infinite",
        }}/>);
}
function StormPreview() {
    return (<motion.div className="absolute inset-0 pointer-events-none bg-indigo-400/10 mix-blend-screen" animate={{ opacity: [0, 0.35, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.02, 1] }}/>);
}
