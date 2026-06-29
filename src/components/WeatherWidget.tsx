import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { weatherApi } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  timestamp: string;
}

// ─── Composant principal ──────────────────────────────────────────────────────
const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("Dakar");
  const [inputCity, setInputCity] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const fetchWeather = async (targetCity: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherApi.getWeather(targetCity);
      setWeather(data);
      setCity(targetCity);
    } catch {
      setError("Ville introuvable ou service indisponible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("Dakar");
  }, []);

  const handleSearch = () => {
    const trimmed = inputCity.trim();
    if (trimmed) {
      fetchWeather(trimmed);
      setInputCity("");
      setShowSearch(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setShowSearch(false);
  };

  // ─── Skeleton loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 w-full max-w-xs animate-pulse">
        <div className="h-4 bg-white/20 rounded w-24 mb-3" />
        <div className="h-10 bg-white/20 rounded w-16 mb-2" />
        <div className="h-3 bg-white/20 rounded w-32" />
      </div>
    );
  }

  // ─── Erreur ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-5 border border-red-400/30 w-full max-w-xs">
        <p className="text-red-200 text-sm">{error}</p>
        <button
          onClick={() => fetchWeather(city)}
          className="mt-2 text-xs text-white underline hover:no-underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!weather) return null;

  // ─── Rendu principal ───────────────────────────────────────────────────────
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 w-full max-w-xs relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Fond décoratif */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

      {/* En-tête ville + bouton recherche */}
      <div className="relative flex items-center justify-between mb-3">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
            Météo locale
          </p>
          <h3 className="text-white font-bold text-lg leading-tight">
            {weather.city},{" "}
            <span className="text-white/60 font-normal text-sm">
              {weather.country}
            </span>
          </h3>
        </div>
        <motion.button
          onClick={() => setShowSearch((v) => !v)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
          whileTap={{ scale: 0.9 }}
          title="Changer de ville"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </motion.button>
      </div>

      {/* Barre de recherche */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="mb-3 flex gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="text"
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex : Paris, Tokyo..."
              autoFocus
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/50"
            />
            <motion.button
              onClick={handleSearch}
              className="px-3 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-xl text-white text-sm font-medium transition-colors duration-200"
              whileTap={{ scale: 0.95 }}
            >
              OK
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Température + icône */}
      <div className="flex items-center gap-3 mb-3">
        <motion.img
          src={weather.icon}
          alt={weather.description}
          className="w-14 h-14 drop-shadow-lg"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div>
          <p className="text-4xl font-black text-white leading-none">
            {weather.temperature}
            <span className="text-2xl text-white/70">°C</span>
          </p>
          <p className="text-white/60 text-xs capitalize mt-0.5">
            {weather.description}
          </p>
        </div>
      </div>

      {/* Détails : ressenti, humidité, vent */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
            label: "Ressenti",
            value: `${weather.feelsLike}°`,
          },
          {
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707" />
              </svg>
            ),
            label: "Humidité",
            value: `${weather.humidity}%`,
          },
          {
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            ),
            label: "Vent",
            value: `${weather.windSpeed} m/s`,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white/10 rounded-xl px-2 py-2 text-center"
          >
            <div className="flex justify-center text-white/60 mb-1">{item.icon}</div>
            <p className="text-white font-semibold text-sm leading-none">{item.value}</p>
            <p className="text-white/50 text-xs mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Bouton refresh */}
      <motion.button
        onClick={() => fetchWeather(city)}
        className="mt-3 w-full text-center text-white/40 hover:text-white/70 text-xs transition-colors duration-200 flex items-center justify-center gap-1"
        whileTap={{ rotate: 360 }}
        transition={{ duration: 0.4 }}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Actualiser
      </motion.button>
    </motion.div>
  );
};

export default WeatherWidget;
