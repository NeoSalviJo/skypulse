import type { HourlyPoint } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Droplets, Cloud } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
interface HourlyForecastCinematicProps {
    hourly: HourlyPoint[];
    convertTemp: (c: number) => number;
    tempSuffix: string;
}
export function HourlyForecastCinematic({ hourly, convertTemp, tempSuffix }: HourlyForecastCinematicProps) {
    const slice = hourly.slice(0, 24);
    const [emblaRef] = useEmblaCarousel({ dragFree: true, containScroll: "trimSnaps" });
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const temps = useMemo(() => slice.map((h) => convertTemp(h.temperature)), [slice, convertTemp]);
    const precip = useMemo(() => slice.map((h) => h.precipitationProbability), [slice]);
    const w = 560;
    const h = 120;
    const pad = 16;
    const { pathD, areaD, maxT, minT } = useMemo(() => {
        if (temps.length === 0)
            return { pathD: "", areaD: "", maxT: 0, minT: 0 };
        const max = Math.max(...temps);
        const min = Math.min(...temps);
        const range = Math.max(max - min, 4);
        const n = temps.length;
        const step = (w - pad * 2) / Math.max(n - 1, 1);
        const pts = temps.map((t, i) => {
            const x = pad + i * step;
            const yNorm = (t - min) / range;
            const y = pad + (1 - yNorm) * (h - pad * 2);
            return { x, y };
        });
        const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        const area = `M ${pts[0]?.x ?? 0} ${h - pad} ` +
            pts.map((p) => `L ${p.x} ${p.y}`).join(" ") +
            ` L ${pts[pts.length - 1]?.x ?? 0} ${h - pad} Z`;
        return { pathD: line, areaD: area, maxT: max, minT: min };
    }, [temps, w, h]);
    const precipPath = useMemo(() => {
        if (precip.length === 0)
            return "";
        const n = precip.length;
        const step = (w - pad * 2) / Math.max(n - 1, 1);
        const base = h - 18;
        let d = `M ${pad} ${base}`;
        precip.forEach((p, i) => {
            const x = pad + i * step;
            const wave = (p / 100) * 28;
            d += ` L ${x} ${base - wave}`;
        });
        d += ` L ${pad + (n - 1) * step} ${base} Z`;
        return d;
    }, [precip, w, h, pad]);
    return (<div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden bg-black/[0.12] dark:bg-white/[0.04] border border-white/10">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto max-h-[140px] block" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(96,165,250,0.45)"/>
              <stop offset="100%" stopColor="rgba(96,165,250,0)"/>
            </linearGradient>
            <linearGradient id="tempStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8"/>
              <stop offset="100%" stopColor="#a78bfa"/>
            </linearGradient>
            <linearGradient id="precipFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(59,130,246,0.25)"/>
              <stop offset="100%" stopColor="rgba(59,130,246,0.02)"/>
            </linearGradient>
          </defs>
          <path d={precipPath} fill="url(#precipFill)"/>
          <path d={areaD} fill="url(#tempFill)"/>
          <path d={pathD} fill="none" stroke="url(#tempStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="motion-safe:opacity-100"/>
        </svg>
        <div className="absolute top-2 right-3 flex gap-4 text-[10px] uppercase tracking-widest text-foreground/45 font-medium">
          <span>Hi {Math.round(maxT)}°</span>
          <span>Lo {Math.round(minT)}°</span>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2 touch-pan-y">
          {slice.map((hour, i) => (<motion.div key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 28 }} className={`flex-none w-[88px] sm:w-[96px] flex flex-col items-center gap-2 p-3 rounded-2xl cursor-grab active:cursor-grabbing touch-manipulation
                border transition-colors duration-300
                ${hoverIdx === i
                ? "bg-primary/15 border-primary/40 shadow-[0_0_24px_rgba(96,165,250,0.15)]"
                : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"}`}>
              <span className="text-[11px] font-semibold text-foreground/45 uppercase tracking-wide">
                {i === 0 ? "Now" : format(new Date(hour.time * 1000), "ha")}
              </span>
              <img
                src={`https://openweathermap.org/img/wn/${hour.icon}@2x.png`}
                alt={hour.condition}
                className="w-12 h-12 drop-shadow-lg"
                draggable={false}
              />
              <span className="text-lg font-bold tabular-nums tracking-tight">
                {Math.round(convertTemp(hour.temperature))}{tempSuffix}
              </span>
              {hour.precipitationProbability > 5 && (
                <div className="flex items-center gap-1 text-[11px] text-sky-400/90 font-medium">
                  <Droplets className="w-3 h-3" />
                  {hour.precipitationProbability}%
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-foreground/40 px-1">
        <Cloud className="w-3.5 h-3.5" />
        <span>Swipe the timeline — hover cells for emphasis</span>
      </div>
    </div>
  );
}
