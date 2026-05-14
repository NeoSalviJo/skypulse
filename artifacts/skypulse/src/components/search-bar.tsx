import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { geocodeSearch } from "@workspace/api-client-react";
import type { GeocodeSuggestion } from "@workspace/api-client-react";
import { toast } from "@/hooks/use-toast";
interface SearchBarProps {
    onSelectLocation: (location: GeocodeSuggestion) => void;
    isLoading?: boolean;
    variant?: "hero" | "compact";
    currentLocationName?: string;
}
function countryFlag(code: string): string {
    return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397));
}
function shouldSkipGeocodeQuery(raw: string): boolean {
    const t = raw.trim();
    if (t.length < 2)
        return true;
    if (/^\d+$/.test(t) && t.length < 5)
        return true;
    if (/^\d{5}-\d{0,3}$/.test(t))
        return true;
    return false;
}
export function SearchBar({ onSelectLocation, isLoading, variant = "hero", currentLocationName }: SearchBarProps) {
    const [value, setValue] = useState(currentLocationName ?? "");
    const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIdx, setHighlightedIdx] = useState(-1);
    const [isLocating, setIsLocating] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (currentLocationName)
            setValue(currentLocationName);
    }, [currentLocationName]);
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);
    const fetchSuggestions = useCallback(async (q: string) => {
        if (shouldSkipGeocodeQuery(q)) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }
        const t = q.trim();
        setIsFetching(true);
        try {
            const res = await geocodeSearch({ q: t });
            setSuggestions(res.results ?? []);
            setIsOpen(true);
            setHighlightedIdx(-1);
        }
        catch {
            setSuggestions([]);
        }
        finally {
            setIsFetching(false);
        }
    }, []);
    const handleChange = (val: string) => {
        setValue(val);
        if (debounceRef.current)
            clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
    };
    const handleSelect = (suggestion: GeocodeSuggestion) => {
        setValue(suggestion.name);
        setSuggestions([]);
        setIsOpen(false);
        onSelectLocation(suggestion);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (highlightedIdx >= 0 && suggestions[highlightedIdx]) {
            handleSelect(suggestions[highlightedIdx]);
            return;
        }
        if (suggestions.length > 0 && suggestions[0]) {
            handleSelect(suggestions[0]);
            return;
        }
        const q = value.trim();
        if (shouldSkipGeocodeQuery(q))
            return;
        setIsFetching(true);
        try {
            const res = await geocodeSearch({ q });
            const results = res.results ?? [];
            if (results.length > 0) {
                handleSelect(results[0]);
                return;
            }
            toast({
                title: "No locations found",
                description: "Try another city, ZIP, or spelling.",
            });
        }
        catch {
            toast({
                variant: "destructive",
                title: "Search unavailable",
                description: "The app could not reach the weather API. Run the API server (e.g. on port 8080) while using Vite, or check your network.",
            });
        }
        finally {
            setIsFetching(false);
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0)
            return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIdx((i) => Math.min(i + 1, suggestions.length - 1));
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIdx((i) => Math.max(i - 1, -1));
        }
        else if (e.key === "Escape") {
            setIsOpen(false);
            setHighlightedIdx(-1);
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            const idx = highlightedIdx >= 0 ? highlightedIdx : 0;
            if (suggestions[idx])
                handleSelect(suggestions[idx]);
        }
    };
    const handleCurrentLocation = () => {
        if (!navigator.geolocation)
            return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const res = await geocodeSearch({ q: `${latitude},${longitude}` });
                if (res.results?.[0]) {
                    handleSelect(res.results[0]);
                }
            }
            catch {
            }
            finally {
                setIsLocating(false);
            }
        }, () => { setIsLocating(false); }, { timeout: 8000 });
    };
    const clearInput = () => {
        setValue("");
        setSuggestions([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };
    const dropdown = isOpen && suggestions.length > 0 && (<ul role="listbox" className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl glass-card border border-white/10 dark:border-white/10 shadow-2xl">
      {suggestions.map((s, i) => {
            const isHL = i === highlightedIdx;
            const flag = s.countryCode ? countryFlag(s.countryCode) : "🌍";
            const regionPart = s.region ? `, ${s.region}` : "";
            return (<li key={s.id} role="option" aria-selected={isHL} onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }} onMouseEnter={() => setHighlightedIdx(i)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none
              ${isHL
                    ? "bg-primary/20 dark:bg-primary/30"
                    : "hover:bg-white/10 dark:hover:bg-white/5"}
              ${i < suggestions.length - 1 ? "border-b border-white/5 dark:border-white/5" : ""}
            `}>
            <span className="text-xl shrink-0 leading-none">{flag}</span>
            <span className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-sm truncate">
                {s.name}{regionPart}
              </span>
              <span className="text-xs text-foreground/50 truncate">{s.country}</span>
            </span>
          </li>);
        })}
    </ul>);
    if (variant === "compact") {
        return (<div ref={containerRef} className="relative w-full max-w-sm">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="relative flex items-center bg-black/20 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full overflow-visible transition-all duration-300 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
            {isFetching
                ? <Loader2 className="absolute left-3 w-4 h-4 text-foreground/50 animate-spin"/>
                : <Search className="absolute left-3 w-4 h-4 text-foreground/50"/>}
            <Input ref={inputRef} type="text" value={value} onChange={(e) => handleChange(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => suggestions.length > 0 && setIsOpen(true)} placeholder="Search city or ZIP..." className="w-full h-10 pl-10 pr-10 bg-transparent border-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-foreground/30" autoComplete="off" data-testid="input-city-search-compact"/>
            <Button type="button" variant="ghost" size="icon" onClick={value ? clearInput : handleCurrentLocation} disabled={isLocating || isLoading} className="absolute right-1 w-8 h-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10" title={value ? "Clear" : "Use current location"} data-testid="button-current-location-compact">
              {isLocating
                ? <Loader2 className="w-4 h-4 animate-spin"/>
                : value
                    ? <X className="w-4 h-4 text-foreground/50"/>
                    : <MapPin className="w-4 h-4 text-foreground/50"/>}
            </Button>
          </div>
        </form>
        {dropdown}
      </div>);
    }
    return (<div className="w-full flex flex-col items-center">
      <div ref={containerRef} className="relative w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-0 rounded-3xl bg-black/5 dark:bg-white/5 blur-2xl transition-all duration-500 group-hover:bg-black/10 dark:group-hover:bg-white/10 group-focus-within:bg-primary/20"/>
          <div className="relative flex items-center bg-white/20 dark:bg-black/40 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl overflow-visible transition-all duration-500 focus-within:border-primary/50 focus-within:shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)] hover:shadow-lg">
            {isFetching
            ? <Loader2 className="absolute left-6 w-6 h-6 text-foreground/50 animate-spin"/>
            : <Search className="absolute left-6 w-6 h-6 text-foreground/50"/>}
            <Input ref={inputRef} type="text" value={value} onChange={(e) => handleChange(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => suggestions.length > 0 && setIsOpen(true)} placeholder="City, ZIP code, or coordinates..." className="w-full h-16 pl-16 pr-32 bg-transparent border-0 text-xl font-medium focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-foreground/30" autoComplete="off" data-testid="input-city-search-hero"/>
            <div className="absolute right-2 flex items-center gap-1">
              {value && (<Button type="button" variant="ghost" size="icon" onClick={clearInput} className="h-9 w-9 rounded-xl text-foreground/40 hover:text-foreground">
                  <X className="w-4 h-4"/>
                </Button>)}
              <Button type="submit" disabled={isLoading || !value.trim() || value.trim().length < 2} className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-lg" data-testid="button-city-search-hero">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Search"}
              </Button>
            </div>
          </div>
        </form>
        {dropdown}
      </div>

      <button onClick={handleCurrentLocation} disabled={isLocating} className="mt-6 flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors py-2 px-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5" data-testid="button-current-location-hero">
        {isLocating ? <Loader2 className="w-4 h-4 animate-spin"/> : <MapPin className="w-4 h-4"/>}
        or use current location
      </button>
    </div>);
}
