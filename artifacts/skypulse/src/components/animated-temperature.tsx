import { useEffect, useState, useRef } from "react";
import { animate } from "framer-motion";
interface AnimatedTemperatureProps {
    value: number;
    className?: string;
    suffixClassName?: string;
    suffix: string;
}
export function AnimatedTemperature({ value, className = "", suffixClassName = "", suffix }: AnimatedTemperatureProps) {
    const [display, setDisplay] = useState(value);
    const prev = useRef(value);
    useEffect(() => {
        const start = prev.current;
        prev.current = value;
        const controls = animate(start, value, {
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setDisplay(Math.round(v)),
        });
        return () => controls.stop();
    }, [value]);
    return (<span className={`tabular-nums relative inline-flex flex-wrap items-baseline gap-x-1.5 ${className}`}>
      <span>{display}</span>
      <span className={`font-light ${suffixClassName}`}>{suffix}</span>
    </span>);
}
