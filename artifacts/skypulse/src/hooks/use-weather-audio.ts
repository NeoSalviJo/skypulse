import { useState, useRef, useCallback, useEffect } from "react";
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
function createAmbientNodes(ctx: AudioContext, code: string, windKmh = 0): {
    master: GainNode;
    stoppable: Stoppable[];
} {
    const stoppable: Stoppable[] = [];
    const noiseBuf = makeNoiseBuffer(ctx);
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5);
    master.connect(ctx.destination);
    const addNoise = (freq: number, type: BiquadFilterType, q: number, vol: number) => {
        const src = makeNoiseSource(ctx, noiseBuf);
        const filt = ctx.createBiquadFilter();
        filt.type = type;
        filt.frequency.value = freq;
        filt.Q.value = q;
        const gain = ctx.createGain();
        gain.gain.value = vol;
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
        gain.gain.value = vol;
        addLFO(filt.frequency, 0.12, baseFreq * 0.4);
        src.connect(filt);
        filt.connect(gain);
        gain.connect(master);
        src.start();
        stoppable.push(src);
    };
    if (code === "rain" || code === "storm") {
        addNoise(4000, "bandpass", 0.3, 0.55);
        addNoise(700, "lowpass", 0.8, 0.3);
    }
    if (code === "storm") {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = 55;
        const filt = ctx.createBiquadFilter();
        filt.type = "lowpass";
        filt.frequency.value = 180;
        const g = ctx.createGain();
        g.gain.value = 0.06;
        addLFO(g.gain, 0.07, 0.04);
        osc.connect(filt);
        filt.connect(g);
        g.connect(master);
        osc.start();
        stoppable.push(osc);
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
    return { master, stoppable };
}
export function useWeatherAudio(conditionCode: string, windSpeedKmh = 0) {
    const [isEnabled, setIsEnabled] = useState(false);
    const ctxRef = useRef<AudioContext | null>(null);
    const stoppableRef = useRef<Stoppable[]>([]);
    const masterRef = useRef<GainNode | null>(null);
    const stopAll = useCallback((fade = true) => {
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
    const startSound = useCallback((code: string, wind: number) => {
        const ctx = ctxRef.current;
        if (!ctx)
            return;
        if (ctx.state === "suspended")
            void ctx.resume();
        const { master, stoppable } = createAmbientNodes(ctx, code, wind);
        masterRef.current = master;
        stoppableRef.current = stoppable;
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
            startSound(conditionCode, windSpeedKmh);
            setIsEnabled(true);
        }
    }, [isEnabled, conditionCode, windSpeedKmh, stopAll, startSound]);
    useEffect(() => {
        if (!isEnabled)
            return;
        stopAll(false);
        setTimeout(() => startSound(conditionCode, windSpeedKmh), 150);
    }, [conditionCode, windSpeedKmh, isEnabled, startSound, stopAll]);
    useEffect(() => {
        return () => {
            stopAll(false);
            ctxRef.current?.close().catch(() => { });
        };
    }, [stopAll]);
    return { isEnabled, toggle };
}
