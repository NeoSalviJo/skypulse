import { createContext, useContext, useState, useEffect, ReactNode } from "react";
type Unit = "celsius" | "fahrenheit";
interface SettingsContextType {
    unit: Unit;
    toggleUnit: () => void;
    convertTemp: (celsius: number) => number;
    tempSuffix: string;
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
    useEffect(() => {
        localStorage.setItem("skypulse-unit", unit);
    }, [unit]);
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
    return (<SettingsContext.Provider value={{ unit, toggleUnit, convertTemp, tempSuffix }}>
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
