import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe, MapIcon, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
export function WeatherRadarPanel({ cityName }: {
    cityName: string;
}) {
    const [open, setOpen] = useState(false);
    const [globe, setGlobe] = useState(false);
    return (<div className="glass-card-premium overflow-hidden rounded-3xl border border-white/10">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center ring-1 ring-primary/25 shadow-[0_0_24px_rgba(96,165,250,0.12)]">
            <MapIcon className="w-5 h-5"/>
          </span>
          <div>
            <p className="font-serif font-semibold text-base">Atmosphere map</p>
            <p className="text-xs text-foreground/50">Stylized radar · {cityName}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-foreground/50 transition-transform ${open ? "rotate-180" : ""}`}/>
      </button>

      <AnimatePresence initial={false}>
        {open && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant={globe ? "outline" : "secondary"} className="rounded-full gap-1.5" onClick={() => setGlobe(false)}>
                  <Crosshair className="w-3.5 h-3.5"/> Radar
                </Button>
                <Button type="button" size="sm" variant={globe ? "secondary" : "outline"} className="rounded-full gap-1.5" onClick={() => setGlobe(true)}>
                  <Globe className="w-3.5 h-3.5"/> Globe
                </Button>
              </div>

              <div className="relative aspect-[16/9] max-h-[280px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-white/10">
                {globe ? (<motion.div className="absolute inset-0 flex items-center justify-center perspective-[800px]" initial={false}>
                    <motion.div className="relative w-[min(72%,280px)] aspect-square rounded-full" style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(96,165,250,0.35), transparent 55%), radial-gradient(circle at 70% 60%, rgba(34,197,94,0.15), transparent 50%), linear-gradient(135deg, #0f172a, #1e293b)",
                    boxShadow: "inset -20px -20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(59,130,246,0.15)",
                }} animate={{ rotate: [0, 360] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }}>
                      <div className="absolute inset-0 rounded-full opacity-40" style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 14px, rgba(255,255,255,0.04) 15px), repeating-linear-gradient(90deg, transparent, transparent 14px, rgba(255,255,255,0.04) 15px)",
                }}/>
                    </motion.div>
                  </motion.div>) : (<>
                    <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: "radial-gradient(circle at 40% 45%, rgba(59,130,246,0.4) 0%, transparent 45%), radial-gradient(circle at 65% 55%, rgba(168,85,247,0.25) 0%, transparent 40%), repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.02) 41px)",
                }}/>
                    <motion.div className="absolute inset-0 origin-center" style={{
                    background: "conic-gradient(from 0deg, transparent 0deg, rgba(96,165,250,0.35) 28deg, transparent 56deg)",
                }} animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}/>
                    <div className="absolute inset-10 rounded-full border border-white/10"/>
                    <div className="absolute inset-[26%] rounded-full border border-white/5"/>
                    <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-white/40 font-medium">
                      Simulated sweep · decorative
                    </div>
                  </>)}
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
