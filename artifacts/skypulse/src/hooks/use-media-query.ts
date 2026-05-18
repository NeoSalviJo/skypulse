import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Subscribes to `matchMedia`; safe for SSR (initial false until mount).
 */
export function useMediaQuery(query: string): boolean {
    const get = useCallback(() => {
        if (typeof window === "undefined")
            return false;
        return window.matchMedia(query).matches;
    }, [query]);

    const [matches, setMatches] = useState(get);

    useEffect(() => {
        const mq = window.matchMedia(query);
        const sync = () => setMatches(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, [query]);

    return matches;
}

/** Max ~430px-ish phones plus small portrait tablets we treat like phones for GPU/motion budget. */
export function useComfortGraphics(): boolean {
    const narrow = useMediaQuery("(max-width: 767px)");
    const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    return useMemo(() => narrow || reduceMotion, [narrow, reduceMotion]);
}
