import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AmbientSoundCharacter = "soft" | "balanced" | "immersive";

export type AmbientSoundPreset =
    | "auto"
    | "rain"
    | "thunderstorm"
    | "wind"
    | "snow"
    | "cloudy"
    | "calm"
    | "night";

export const AMBIENT_PRESET_LABELS: Record<AmbientSoundPreset, { title: string; description: string }> = {
    auto: {
        title: "Auto",
        description: "Matches the live weather condition.",
    },
    rain: {
        title: "Rain",
        description: "Steady showers and drizzle texture.",
    },
    thunderstorm: {
        title: "Thunderstorm",
        description: "Heavy rain layers plus low thunder tone.",
    },
    wind: {
        title: "Wind",
        description: "Layered gusts — stronger when it’s windy outside.",
    },
    snow: {
        title: "Snow",
        description: "Soft air and muffled wind.",
    },
    cloudy: {
        title: "Cloudy",
        description: "Soft overcast ambience.",
    },
    calm: {
        title: "Calm sky",
        description: "Very light breeze and open air.",
    },
    night: {
        title: "Night air",
        description: "Quiet low wind with delicate high detail.",
    },
};

export const AMBIENT_SOUND_LABELS: Record<AmbientSoundCharacter, { title: string; description: string }> = {
    soft: {
        title: "Soft",
        description: "Gentle backdrop — best for focus or quiet rooms.",
    },
    balanced: {
        title: "Balanced",
        description: "Default mix of wind, moisture, and air texture.",
    },
    immersive: {
        title: "Immersive",
        description: "Richer ambient detail and depth.",
    },
};

type Unit = "celsius" | "fahrenheit";
interface SettingsContextType {
    unit: Unit;
    toggleUnit: () => void;
    convertTemp: (celsius: number) => number;
    tempSuffix: string;
    ambientVolume: number;
    setAmbientVolume: (v: number) => void;
    ambientCharacter: AmbientSoundCharacter;
    setAmbientCharacter: (c: AmbientSoundCharacter) => void;
    ambientPreset: AmbientSoundPreset;
    setAmbientPreset: (p: AmbientSoundPreset) => void;
}
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
export function SettingsProvider({ children }: {
    children: ReactNode;
}) {
    const [unit, setUnit] = useState<Unit>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("skypulse-unit");
            if (saved === "fahrenheit" || saved === "celsius")
                return saved;
        }
        return "celsius";
    });
    const [ambientVolume, setAmbientVolumeState] = useState<number>(() => {
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem("skypulse-ambient-volume");
            const n = raw == null ? NaN : Number(raw);
            if (Number.isFinite(n) && n >= 0 && n <= 1)
                return n;
        }
        return 0.78;
    });
    const [ambientCharacter, setAmbientCharacterState] = useState<AmbientSoundCharacter>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("skypulse-ambient-character");
            if (saved === "soft" || saved === "balanced" || saved === "immersive")
                return saved;
        }
        return "balanced";
    });
    const [ambientPreset, setAmbientPresetState] = useState<AmbientSoundPreset>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("skypulse-ambient-preset");
            const valid: AmbientSoundPreset[] = [
                "auto", "rain", "thunderstorm", "wind", "snow", "cloudy", "calm", "night",
            ];
            if (saved && (valid as string[]).includes(saved))
                return saved as AmbientSoundPreset;
        }
        return "auto";
    });
    useEffect(() => {
        localStorage.setItem("skypulse-unit", unit);
    }, [unit]);
    useEffect(() => {
        localStorage.setItem("skypulse-ambient-volume", String(ambientVolume));
    }, [ambientVolume]);
    useEffect(() => {
        localStorage.setItem("skypulse-ambient-character", ambientCharacter);
    }, [ambientCharacter]);
    useEffect(() => {
        localStorage.setItem("skypulse-ambient-preset", ambientPreset);
    }, [ambientPreset]);
    const setAmbientVolume = (v: number) => {
        setAmbientVolumeState(Math.min(1, Math.max(0, v)));
    };
    const setAmbientCharacter = (c: AmbientSoundCharacter) => {
        setAmbientCharacterState(c);
    };
    const setAmbientPreset = (p: AmbientSoundPreset) => {
        setAmbientPresetState(p);
    };
    const toggleUnit = () => {
        setUnit((prev) => (prev === "celsius" ? "fahrenheit" : "celsius"));
    };
    const convertTemp = (celsius: number) => {
        if (unit === "fahrenheit") {
            return (celsius * 9) / 5 + 32;
        }
        return celsius;
    };
    const tempSuffix = unit === "celsius" ? "°C" : "°F";
    return (<SettingsContext.Provider value={{
        unit, toggleUnit, convertTemp, tempSuffix,
        ambientVolume, setAmbientVolume, ambientCharacter, setAmbientCharacter,
        ambientPreset, setAmbientPreset,
    }}>
      {children}
    </SettingsContext.Provider>);
}
export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
