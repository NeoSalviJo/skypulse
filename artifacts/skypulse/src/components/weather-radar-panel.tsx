import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe, MapIcon, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AtmosphereMapCanvas } from "@/components/atmosphere-map-canvas";

export function WeatherRadarPanel({ cityName }: {
    cityName: string;
}) {
    const [open, setOpen] = useState(false);
    const [globe, setGlobe] = useState(false);
    return (
        <div className="glass-card-frost glass-card-hover overflow-hidden rounded-[1.35rem]">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-white/[0.03] sm:p-7"
            >
                <div className="flex min-w-0 items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.875rem] border border-[rgba(200,226,246,0.12)] bg-[rgba(148,246,246,0.06)] shadow-[inset_0_1px_0_rgba(255,251,239,0.12)] backdrop-blur-sm">
                        <MapIcon className="h-[1.2rem] w-[1.2rem] opacity-80"/>
                    </span>
                    <div className="min-w-0">
                        <p className="font-serif text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground/[0.92]">Weather maps</p>
                        <p className="mt-0.5 truncate font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/[0.44]">
                            Radar • Satellite • {cityName}
                        </p>
                    </div>
                </div>
                <ChevronDown className={`mr-1 h-[1.1rem] w-[1.1rem] shrink-0 opacity-65 transition-transform ${open ? "rotate-180" : ""}`}/>
            </button>

            <AnimatePresence initial={false}>
                {open ?
                    (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-4 px-6 pb-6 pt-px sm:px-7 sm:pb-7">
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={globe ? "outline" : "secondary"}
                                        className="h-9 gap-1.5 rounded-full px-5 text-[12px] font-medium tracking-wide shadow-none"
                                        onClick={() => setGlobe(false)}
                                    >
                                        <Crosshair className="h-[0.9375rem] w-[0.9375rem] opacity-85"/> Live Radar
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={globe ? "secondary" : "outline"}
                                        className="h-9 gap-1.5 rounded-full px-5 text-[12px] font-medium tracking-wide shadow-none"
                                        onClick={() => setGlobe(true)}
                                    >
                                        <Globe className="h-[0.9375rem] w-[0.9375rem] opacity-85"/> Satellite
                                    </Button>
                                </div>

                                <AtmosphereMapCanvas mode={globe ? "globe" : "radar"} cityLabel={cityName}/>

                                <p className="pt-1 text-center font-sans text-[10px] font-medium leading-relaxed text-foreground/[0.35]">
                                    Preview only
                                </p>
                            </div>
                        </motion.div>
                    )
                :   null}
            </AnimatePresence>
        </div>
    );
}
