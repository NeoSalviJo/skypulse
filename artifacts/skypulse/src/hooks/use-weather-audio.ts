import { useState, useRef, useCallback, useEffect } from "react";
import type { AmbientSoundCharacter, AmbientSoundPreset } from "@/components/settings-provider";

function resolveAmbientSoundCode(preset: AmbientSoundPreset, liveConditionCode: string): string {
    if (preset === "auto") {
        const c = liveConditionCode.trim().toLowerCase();
        return c.length > 0 ? c : "clear";
    }
    const map = {
        rain: "rain",
        thunderstorm: "storm",
        wind: "wind",
        snow: "snow",
        cloudy: "cloudy",
        calm: "clear",
        night: "night",
    } as const satisfies Record<Exclude<AmbientSoundPreset, "auto">, string>;
    return map[preset];
}

function synthesisWindKmh(preset: AmbientSoundPreset, reportedWindKmh: number): number {
    if (preset === "wind")
        return Math.max(reportedWindKmh, 36);
    return reportedWindKmh;
}

const CHARACTER_MIX: Record<AmbientSoundCharacter, number> = {
    soft: 0.48,
    balanced: 1,
    immersive: 1.26,
};
function makeNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const len = 2 * ctx.sampleRate;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++)
        d[i] = Math.random() * 2 - 1;
    return buf;
}
function makeNoiseSource(ctx: AudioContext, buf: AudioBuffer): AudioBufferSourceNode {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
}
type Stoppable = AudioBufferSourceNode | OscillatorNode;

function playThunderBurst(ctx: AudioContext, master: GainNode, character: AmbientSoundCharacter): void {
    const chr = CHARACTER_MIX[character] ?? 1;
    const peak = Math.min(0.92, (0.38 + Math.random() * 0.22) * chr);
    const len = Math.floor(ctx.sampleRate * (0.5 + Math.random() * 0.15));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b = (b + w * 0.02) * 0.993;
        d[i] = b;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 35 + Math.random() * 35;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 320 + Math.random() * 180;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    src.connect(hp);
    hp.connect(lp);
    lp.connect(g);
    g.connect(master);
    g.gain.value = 0;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.038 + Math.random() * 0.02);
    const tail = t + 0.55 + Math.random() * 0.55;
    g.gain.exponentialRampToValueAtTime(0.0008, tail);
    src.start(t);
    src.stop(tail + 0.06);
}

function scheduleStormThunder(ctx: AudioContext, master: GainNode, character: AmbientSoundCharacter): () => void {
    let disposed = false;
    let pending: number | undefined;
    const kick = (): void => {
        if (disposed || (ctx.state !== "running" && ctx.state !== "suspended"))
            return;
        if (ctx.state === "suspended")
            void ctx.resume();
        playThunderBurst(ctx, master, character);
        const gap = 3500 + Math.random() * 8500;
        pending = window.setTimeout(kick, gap);
    };
    pending = window.setTimeout(kick, 400 + Math.random() * 1200);

    return () => {
        disposed = true;
        if (pending !== undefined)
            clearTimeout(pending);
    };
}

function createAmbientNodes(ctx: AudioContext, code: string, windKmh = 0, character: AmbientSoundCharacter = "balanced"): {
    master: GainNode;
    stoppable: Stoppable[];
    cleanup?: () => void;
} {
    const stoppable: Stoppable[] = [];
    const chr = CHARACTER_MIX[character] ?? 1;
    const scale = (v: number) => Math.min(0.95, v * chr);
    const noiseBuf = makeNoiseBuffer(ctx);
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.connect(ctx.destination);
    const addNoise = (freq: number, type: BiquadFilterType, q: number, vol: number) => {
        const src = makeNoiseSource(ctx, noiseBuf);
        const filt = ctx.createBiquadFilter();
        filt.type = type;
        filt.frequency.value = freq;
        filt.Q.value = q;
        const gain = ctx.createGain();
        gain.gain.value = scale(vol);
        src.connect(filt);
        filt.connect(gain);
        gain.connect(master);
        src.start();
        stoppable.push(src);
    };
    const addLFO = (target: AudioParam, freqHz: number, depth: number) => {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = freqHz;
        const g = ctx.createGain();
        g.gain.value = depth;
        lfo.connect(g);
        g.connect(target);
        lfo.start();
        stoppable.push(lfo);
        return lfo;
    };
    const addWind = (vol: number, baseFreq: number) => {
        const src = makeNoiseSource(ctx, noiseBuf);
        const filt = ctx.createBiquadFilter();
        filt.type = "lowpass";
        filt.frequency.value = baseFreq;
        const gain = ctx.createGain();
        gain.gain.value = scale(vol);
        addLFO(filt.frequency, 0.12, baseFreq * 0.4);
        src.connect(filt);
        filt.connect(gain);
        gain.connect(master);
        src.start();
        stoppable.push(src);
    };
    if (code === "wind") {
        const w = Math.max(windKmh, 22);
        const gust = Math.min(1, Math.max(0, (w - 10) / 78));
        addWind(0.15 + gust * 0.22, 340 + gust * 260);
        addWind(0.10 + gust * 0.18, 500 + gust * 180);
        addNoise(800 + gust * 1000, "bandpass", 0.52, 0.055 + gust * 0.09);
        addNoise(6200, "highshelf", 0.75, 0.032 + gust * 0.048);
        return { master, stoppable };
    }
    let cleanupThunder: (() => void) | undefined;
    if (code === "rain" || code === "storm") {
        if (code === "storm") {
            addNoise(4200, "bandpass", 0.32, scale(0.62));
            addNoise(780, "lowpass", 0.78, scale(0.36));
            addNoise(160, "lowpass", 0.95, scale(0.11));
        }
        else {
            addNoise(4000, "bandpass", 0.3, 0.55);
            addNoise(700, "lowpass", 0.8, 0.3);
        }
    }
    if (code === "storm") {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = 48 + Math.random() * 8;
        const filt = ctx.createBiquadFilter();
        filt.type = "lowpass";
        filt.frequency.value = 220;
        const g = ctx.createGain();
        g.gain.value = scale(0.16);
        addLFO(g.gain, 0.065, 0.09 * chr);
        osc.connect(filt);
        filt.connect(g);
        g.connect(master);
        osc.start();
        stoppable.push(osc);

        const oscR = ctx.createOscillator();
        oscR.type = "triangle";
        oscR.frequency.value = 28;
        const fR = ctx.createBiquadFilter();
        fR.type = "lowpass";
        fR.frequency.value = 95;
        const gR = ctx.createGain();
        gR.gain.value = scale(0.088);
        addLFO(gR.gain, 0.05, 0.055 * chr);
        oscR.connect(fR);
        fR.connect(gR);
        gR.connect(master);
        oscR.start();
        stoppable.push(oscR);

        cleanupThunder = scheduleStormThunder(ctx, master, character);
    }
    if (code === "snow" || code === "cloudy" || code === "fog") {
        addWind(0.22, 350);
    }
    if (windKmh > 32) {
        addWind(0.06 + Math.min(0.14, (windKmh - 32) / 90), 520);
    }
    if (code === "night") {
        addWind(0.08, 180);
        addNoise(8000, "highshelf", 1, 0.04);
    }
    if (code === "clear" || code === "morning" || code === "afternoon" || code === "evening") {
        addWind(0.10, 280);
    }
    return cleanupThunder !== undefined ? { master, stoppable, cleanup: cleanupThunder } : { master, stoppable };
}
export function useWeatherAudio(
    conditionCode: string,
    windSpeedKmh = 0,
    options: {
        volume?: number;
        character?: AmbientSoundCharacter;
        preset?: AmbientSoundPreset;
    } = {},
) {
    const volume = options.volume ?? 1;
    const character = options.character ?? "balanced";
    const preset = options.preset ?? "auto";
    const ambientCode = resolveAmbientSoundCode(preset, conditionCode);
    const synthWind = synthesisWindKmh(preset, windSpeedKmh);
    const [isEnabled, setIsEnabled] = useState(false);
    const ctxRef = useRef<AudioContext | null>(null);
    const stoppableRef = useRef<Stoppable[]>([]);
    const masterRef = useRef<GainNode | null>(null);
    const ambientCleanupRef = useRef<(() => void) | null>(null);
    const stopAll = useCallback((fade = true) => {
        ambientCleanupRef.current?.();
        ambientCleanupRef.current = null;
        const ctx = ctxRef.current;
        const master = masterRef.current;
        if (!ctx || stoppableRef.current.length === 0)
            return;
        const doStop = () => {
            stoppableRef.current.forEach(n => {
                try {
                    n.stop();
                }
                catch { }
            });
            stoppableRef.current = [];
            masterRef.current = null;
        };
        if (fade && master) {
            master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
            setTimeout(doStop, 2000);
        }
        else {
            doStop();
        }
    }, []);
    const startSound = useCallback((code: string, wind: number, vol: number, char: AmbientSoundCharacter) => {
        const ctx = ctxRef.current;
        if (!ctx)
            return;
        if (ctx.state === "suspended")
            void ctx.resume();
        ambientCleanupRef.current?.();
        ambientCleanupRef.current = null;
        const { master, stoppable, cleanup } = createAmbientNodes(ctx, code, wind, char);
        masterRef.current = master;
        stoppableRef.current = stoppable;
        ambientCleanupRef.current = cleanup ?? null;
        const target = Math.min(1, Math.max(0, vol));
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(target, ctx.currentTime + 1.5);
    }, []);
    const toggle = useCallback(() => {
        if (isEnabled) {
            stopAll(true);
            setIsEnabled(false);
        }
        else {
            if (!ctxRef.current) {
                ctxRef.current = new AudioContext();
            }
            startSound(ambientCode, synthWind, volume, character);
            setIsEnabled(true);
        }
    }, [isEnabled, ambientCode, synthWind, volume, character, stopAll, startSound]);
    useEffect(() => {
        if (!isEnabled)
            return;
        const ctx = ctxRef.current;
        const master = masterRef.current;
        if (ctx && master) {
            const target = Math.min(1, Math.max(0, volume));
            try {
                master.gain.cancelScheduledValues(ctx.currentTime);
                master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
                master.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.12);
            }
            catch {
            }
        }
    }, [volume, isEnabled]);
    useEffect(() => {
        if (!isEnabled)
            return;
        stopAll(false);
        const tid = window.setTimeout(() => startSound(ambientCode, synthWind, volume, character), 150);
        return () => window.clearTimeout(tid);
    }, [ambientCode, synthWind, volume, character, isEnabled, startSound, stopAll]);
    useEffect(() => {
        return () => {
            stopAll(false);
            ctxRef.current?.close().catch(() => { });
        };
    }, [stopAll]);
    return { isEnabled, toggle };
}
