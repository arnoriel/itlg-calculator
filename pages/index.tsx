import React, { useState, useEffect, useCallback, useMemo } from "react";

type Result = {
  totalUSDT: number;
  totalIDR: number;
  projectedUSDT?: number;
  projectedIDR?: number;
  daysProjected?: number;
};

export default function CryptoAssetCalculator() {
  const [pricePerCoin, setPricePerCoin] = useState<string>("0.4800");
  const [currentCoins, setCurrentCoins] = useState<string>("");
  const [dailyCoins, setDailyCoins] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [usdToIdr, setUsdToIdr] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  
  // Performance mode state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);

  // Animated background particles (only for non-performance mode)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, opacity: number}>>([]);

  // Fetch USD to IDR rate from API
  const fetchExchangeRate = useCallback(async () => {
    setIsLoadingRate(true);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates && data.rates.IDR) {
        setUsdToIdr(data.rates.IDR.toString());
      } else {
        setError("Gagal memuat kurs USD→IDR. Gunakan nilai default.");
        setUsdToIdr("15000");
      }
    } catch (err) {
      setError("Gagal memuat kurs USD→IDR. Gunakan nilai default.");
      setUsdToIdr("15000");
    } finally {
      setIsLoadingRate(false);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  useEffect(() => {
    if (!isPerformanceMode) {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.5 + 0.1
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isPerformanceMode]);

  // Memoized parsing function
  const parseNumber = useCallback((v: string) => {
    if (!v) return 0;
    const cleaned = v.replace(/,/g, "").trim();
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }, []);

  // Memoized formatting functions
  const formatIDR = useCallback((n: number) => {
    return n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  }, []);

  const formatUSDT = useCallback((n: number) => {
    return `${n.toLocaleString(undefined, { maximumFractionDigits: 6 })} USDT`;
  }, []);

  // Memoized current values to reduce re-renders
  const currentValues = useMemo(() => ({
    price: parseNumber(pricePerCoin),
    coins: parseNumber(currentCoins),
    daily: parseNumber(dailyCoins),
    rate: parseNumber(usdToIdr)
  }), [pricePerCoin, currentCoins, dailyCoins, usdToIdr, parseNumber]);

  const compute = useCallback(async () => {
    setError("");
    setIsCalculating(true);
    
    // Adaptive loading delay based on performance mode
    const delay = isPerformanceMode ? 150 : 800;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const { price, coins, daily, rate } = currentValues;

    if (Number.isNaN(price) || price < 0) {
      setIsCalculating(false);
      return setError("Masukkan harga per koin (USDT) yang valid.");
    }
    if (Number.isNaN(coins) || coins < 0) {
      setIsCalculating(false);
      return setError("Masukkan jumlah koin yang valid.");
    }
    if (Number.isNaN(daily) || daily < 0) {
      setIsCalculating(false);
      return setError("Masukkan jumlah koin harian yang valid (0 jika tidak ingin proyeksi).");
    }
    if (Number.isNaN(rate) || rate <= 0) {
      setIsCalculating(false);
      return setError("Masukkan kurs USD→IDR yang valid (misal 15000).");
    }

    const totalUSDT = price * coins;
    const totalIDR = totalUSDT * rate;

    const res: Result = { totalUSDT, totalIDR };

    if (daily > 0 && endDate) {
      const today = new Date();
      const end = new Date(endDate + "T00:00:00");
      const msPerDay = 1000 * 60 * 60 * 24;
      const diff = Math.ceil((end.getTime() - today.setHours(0,0,0,0)) / msPerDay);
      const daysProjected = diff > 0 ? diff : 0;

      const addedCoins = daily * daysProjected;
      const projectedCoinsTotal = coins + addedCoins;
      const projectedUSDT = projectedCoinsTotal * price;
      const projectedIDR = projectedUSDT * rate;

      res.projectedUSDT = projectedUSDT;
      res.projectedIDR = projectedIDR;
      res.daysProjected = daysProjected;
    }

    setResult(res);
    setIsCalculating(false);
  }, [currentValues, endDate, isPerformanceMode]);

  const resetAll = useCallback(() => {
    setPricePerCoin("0.4796");
    setCurrentCoins("0");
    setDailyCoins("0");
    setEndDate("");
    setUsdToIdr("15000");
    setResult(null);
    setError("");
  }, []);

  const fillSampleData = useCallback(() => {
    setPricePerCoin("0.4796");
    setCurrentCoins("8578");
    setDailyCoins("180");
    const sampleEnd = new Date();
    sampleEnd.setMonth(sampleEnd.getMonth() + 1);
    setEndDate(sampleEnd.toISOString().slice(0, 10));
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  // Enhanced theme classes that handle both modes
  const themeClasses = useMemo(() => {
    if (isPerformanceMode) {
      // Performance mode theme (simplified but with light/dark support)
      if (isDarkMode) {
        return {
          background: "bg-gradient-to-br from-gray-900 to-slate-800",
          card: "bg-white/5 backdrop-blur-sm border-white/10",
          text: {
            primary: "text-white",
            secondary: "text-gray-300",
            muted: "text-gray-400"
          },
          input: "bg-white/10 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30",
          button: {
            primary: "bg-white text-gray-900 hover:bg-gray-100",
            secondary: "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
          },
          gradient: "text-white",
          performanceCard: {
            projection: "bg-gray-800/30 border-gray-600/30",
            details: "bg-gray-800/30 border-gray-600/30",
            current: "bg-white/10 border-white/20"
          },
          icons: {
            primary: "bg-white/20",
            secondary: "bg-gray-400/20"
          }
        };
      } else {
        // Performance mode light theme
        return {
          background: "bg-gradient-to-br from-blue-50 to-indigo-100",
          card: "bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg",
          text: {
            primary: "text-gray-800",
            secondary: "text-gray-600",
            muted: "text-gray-500"
          },
          input: "bg-white/70 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30",
          button: {
            primary: "bg-blue-600 text-white hover:bg-blue-700",
            secondary: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          },
          gradient: "text-gray-800",
          performanceCard: {
            projection: "bg-blue-50/70 border-blue-200/50",
            details: "bg-gray-50/70 border-gray-200/50",
            current: "bg-white/70 border-blue-200/30"
          },
          icons: {
            primary: "bg-blue-100",
            secondary: "bg-gray-200"
          }
        };
      }
    } else {
      // Full theme for normal mode
      return {
        background: isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-slate-800 to-black" 
          : "bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50",
        card: isDarkMode
          ? "bg-white/5 backdrop-blur-2xl border-white/10"
          : "bg-white/80 backdrop-blur-2xl border-gray-200/50 shadow-xl",
        text: {
          primary: isDarkMode ? "text-white" : "text-gray-800",
          secondary: isDarkMode ? "text-gray-300" : "text-gray-600",
          muted: isDarkMode ? "text-gray-400" : "text-gray-500"
        },
        input: isDarkMode
          ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:ring-white/30 focus:border-white/30 hover:bg-white/10"
          : "bg-white/70 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-blue-500/30 focus:border-blue-500/30 hover:bg-white/90",
        button: {
          primary: isDarkMode
            ? "bg-gradient-to-r from-gray-700 to-black text-white hover:shadow-white/10"
            : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-blue-500/20",
          secondary: isDarkMode
            ? "bg-white/5 text-white border-white/10 hover:bg-white/10"
            : "bg-white/60 text-gray-700 border-gray-300/50 hover:bg-white/80"
        },
        gradient: isDarkMode
          ? "from-white via-gray-200 to-gray-300"
          : "from-blue-600 via-indigo-700 to-purple-700",
        performanceCard: {
          projection: isDarkMode 
            ? "bg-gradient-to-br from-gray-600/10 via-slate-500/10 to-white/5 border-gray-400/20"
            : "bg-gradient-to-br from-indigo-50/70 via-purple-50/70 to-white/70 border-purple-200/30",
          details: isDarkMode 
            ? "bg-gradient-to-br from-gray-500/10 to-black/20 border-gray-400/20"
            : "bg-gradient-to-br from-gray-50/70 to-white/70 border-gray-200/30",
          current: isDarkMode 
            ? "bg-gradient-to-br from-white/10 to-gray-500/10 border-white/20"
            : "bg-gradient-to-br from-white/70 to-blue-50/70 border-blue-200/30"
        },
        icons: {
          primary: isDarkMode ? "bg-white/20" : "bg-blue-100",
          secondary: isDarkMode ? "bg-gray-400/20" : "bg-gray-200"
        }
      };
    }
  }, [isDarkMode, isPerformanceMode]);

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-700 ${themeClasses.background}`}>
      {/* Control Panel - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {/* Theme Toggle - Always visible now */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3 rounded-2xl transition-all duration-300 backdrop-blur-lg border ${
            (isDarkMode || (isPerformanceMode && isDarkMode))
              ? "bg-white/10 border-white/20 text-white hover:bg-white/20" 
              : "bg-white/70 border-gray-200 text-gray-700 hover:bg-white/90"
          } hover:scale-110 shadow-lg`}
          title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Performance Toggle */}
        <button
          onClick={() => setIsPerformanceMode(!isPerformanceMode)}
          className={`p-3 rounded-2xl transition-all duration-300 backdrop-blur-lg border ${
            (isDarkMode || (isPerformanceMode && isDarkMode))
              ? "bg-white/10 border-white/20 text-white hover:bg-white/20" 
              : "bg-white/70 border-gray-200 text-gray-700 hover:bg-white/90"
          } hover:scale-110 shadow-lg ${isPerformanceMode ? 'ring-2 ring-green-500/50' : ''}`}
          title={`${isPerformanceMode ? 'Disable' : 'Enable'} Performance Mode`}
        >
          {isPerformanceMode ? '⚡' : '🎨'}
        </button>
      </div>

      {/* Animated Background Elements - Only in non-performance mode */}
      {!isPerformanceMode && (
        <>
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className={`absolute rounded-full animate-pulse ${
                  isDarkMode ? "bg-white/10" : "bg-blue-500/20"
                }`}
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity,
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite alternate`
                }}
              />
            ))}
          </div>
          
          {/* Gradient Orbs */}
          <div className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl animate-pulse ${
            isDarkMode ? "bg-white/5" : "bg-blue-300/30"
          }`}></div>
          <div className={`absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
            isDarkMode ? "bg-gray-500/10" : "bg-purple-300/30"
          }`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-2000 ${
            isDarkMode ? "bg-slate-400/5" : "bg-indigo-300/20"
          }`}></div>
        </>
      )}

      {/* Simplified background for performance mode */}
      {isPerformanceMode && (
        <>
          <div className={`absolute inset-0 ${
            isDarkMode 
              ? "bg-gradient-to-tr from-transparent via-gray-800/20 to-gray-700/30" 
              : "bg-gradient-to-tr from-transparent via-blue-200/20 to-indigo-200/30"
          } pointer-events-none`}></div>
          <div className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-50 ${
            isDarkMode ? "bg-white/5" : "bg-blue-300/20"
          }`}></div>
        </>
      )}

      <main className="relative z-10 p-4 md:p-6 flex items-start justify-center min-h-screen pt-20">
        <div className="max-w-4xl w-full">
          {/* Adaptive Card Design */}
          <div className={`${isPerformanceMode ? 'rounded-2xl shadow-xl' : 'rounded-3xl shadow-2xl'} p-4 md:p-8 transition-all duration-700 ${themeClasses.card}`}>
            
            {/* Adaptive Header */}
            <header className="text-center mb-6 md:mb-8">
              <h1 className={`${
                isPerformanceMode 
                  ? `text-2xl sm:text-3xl md:text-4xl font-bold mb-3 tracking-tight ${themeClasses.text.primary}`
                  : `text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-3 md:mb-4 tracking-tight ${themeClasses.gradient}`
              }`}>
                $ITLG Asset Calculator
              </h1>
              {!isPerformanceMode && (
                <div className={`w-16 md:w-24 h-1 bg-gradient-to-r mx-auto rounded-full mb-3 md:mb-4 ${themeClasses.gradient}`}></div>
              )}
              {isPerformanceMode && (
                <div className={`w-16 md:w-24 h-1 mx-auto rounded-full mb-3 md:mb-4 ${
                  isDarkMode ? "bg-white/50" : "bg-gray-400"
                }`}></div>
              )}
              <p className={`text-xs sm:text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-2 sm:px-4 ${themeClasses.text.muted}`}>
                {isPerformanceMode 
                  ? "Hitung nilai aset kripto Anda dengan proyeksi otomatis"
                  : "Hitung nilai aset kripto Anda dengan proyeksi otomatis dan tampilan real-time yang menawan"
                }
              </p>
            </header>

            {/* Main Input Form */}
            <section className="mb-6 md:mb-8">
              <h2 className={`${
                isPerformanceMode 
                  ? `text-lg md:text-xl font-semibold text-center mb-4 ${themeClasses.text.primary}`
                  : `text-lg sm:text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 bg-gradient-to-r bg-clip-text text-transparent ${themeClasses.gradient}`
              }`}>
                Data Utama
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className={isPerformanceMode ? "" : "group"}>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                    isPerformanceMode 
                      ? themeClasses.text.secondary
                      : `transition-colors ${themeClasses.text.secondary} group-focus-within:${themeClasses.text.primary}`
                  }`}>
                    Harga per koin dalam USDT {isPerformanceMode ? "" : "(yang di prediksi dan di ekspektasikan, bisa diganti pakai harga berapapun)"}
                  </label>
                  <input
                    inputMode="decimal"
                    value={pricePerCoin}
                    onChange={(e) => setPricePerCoin(e.target.value)}
                    className={`w-full p-3 md:p-4 text-sm md:text-base ${
                      isPerformanceMode ? 'rounded-xl' : 'rounded-2xl backdrop-blur-sm'
                    } border focus:outline-none focus:ring-2 transition-all duration-300 ${themeClasses.input}`}
                    placeholder="0.4796"
                  />
                </div>

                <div className={isPerformanceMode ? "" : "group"}>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                    isPerformanceMode 
                      ? themeClasses.text.secondary
                      : `transition-colors ${themeClasses.text.secondary} group-focus-within:${themeClasses.text.primary}`
                  }`}>
                    Kurs USD → IDR
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      inputMode="decimal"
                      value={usdToIdr}
                      onChange={(e) => setUsdToIdr(e.target.value)}
                      className={`w-full p-3 md:p-4 text-sm md:text-base ${
                        isPerformanceMode ? 'rounded-xl' : 'rounded-2xl backdrop-blur-sm'
                      } border focus:outline-none focus:ring-2 transition-all duration-300 ${themeClasses.input}`}
                      placeholder="15000"
                    />
                    <button
                      onClick={fetchExchangeRate}
                      disabled={isLoadingRate}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isDarkMode 
                          ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                          : "bg-white/70 border-gray-200 text-gray-700 hover:bg-white/90"
                      } ${isLoadingRate ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                      title="Refresh Kurs"
                    >
                      {isLoadingRate ? '🔄' : '🔄'}
                    </button>
                  </div>
                </div>

                <div className={`sm:col-span-2 ${isPerformanceMode ? "" : "group"}`}>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                    isPerformanceMode 
                      ? themeClasses.text.secondary
                      : `transition-colors ${themeClasses.text.secondary} group-focus-within:${themeClasses.text.primary}`
                  }`}>
                    Jumlah koin Anda sekarang
                  </label>
                  <input
                    inputMode="decimal"
                    value={currentCoins}
                    onChange={(e) => setCurrentCoins(e.target.value)}
                    className={`w-full p-3 md:p-4 text-sm md:text-base ${
                      isPerformanceMode ? 'rounded-xl' : 'rounded-2xl backdrop-blur-sm'
                    } border focus:outline-none focus:ring-2 transition-all duration-300 ${themeClasses.input}`}
                    placeholder="1000"
                  />
                </div>
              </div>
            </section>

            {/* Adaptive Projection Section */}
            <section className="mb-6 md:mb-8">
              <div className={`${
                isPerformanceMode 
                  ? `rounded-xl p-4 md:p-6 border ${themeClasses.performanceCard.projection}`
                  : `rounded-3xl p-4 md:p-6 border transition-all duration-300 ${
                      isDarkMode 
                        ? "bg-gradient-to-r from-slate-800/20 to-gray-700/20 backdrop-blur-sm border-slate-600/30"
                        : "bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm border-blue-200/30"
                    }`
              }`}>
                <h2 className={`${
                  isPerformanceMode 
                    ? `text-lg md:text-xl font-semibold text-center mb-3 ${themeClasses.text.primary}`
                    : `text-lg sm:text-xl md:text-2xl font-bold text-center mb-3 md:mb-4 bg-gradient-to-r bg-clip-text text-transparent ${themeClasses.gradient}`
                }`}>
                  Proyeksi Opsional
                </h2>
                <p className={`text-center mb-4 md:mb-6 text-xs sm:text-sm px-2 sm:px-4 ${themeClasses.text.muted}`}>
                  {isPerformanceMode 
                    ? "Isi bagian ini jika Anda ingin melihat proyeksi masa depan"
                    : "Isi bagian ini jika Anda ingin melihat proyeksi perolehan koin di masa depan"
                  }
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div className={isPerformanceMode ? "" : "group"}>
                    <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                      isPerformanceMode 
                        ? themeClasses.text.secondary
                        : `transition-colors ${themeClasses.text.secondary} group-focus-within:${themeClasses.text.primary}`
                    }`}>
                      Koin per hari (proyeksi)
                    </label>
                    <input
                      inputMode="decimal"
                      value={dailyCoins}
                      onChange={(e) => setDailyCoins(e.target.value)}
                      className={`w-full p-3 md:p-4 text-sm md:text-base ${
                        isPerformanceMode ? 'rounded-xl' : 'rounded-2xl backdrop-blur-sm'
                      } border focus:outline-none focus:ring-2 transition-all duration-300 ${themeClasses.input}`}
                      placeholder="180"
                    />
                  </div>

                  <div className={isPerformanceMode ? "" : "group"}>
                    <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                      isPerformanceMode 
                        ? themeClasses.text.secondary
                        : `transition-colors ${themeClasses.text.secondary} group-focus-within:${themeClasses.text.primary}`
                    }`}>
                      Proyeksi sampai tanggal
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full p-3 md:p-4 text-sm md:text-base ${
                        isPerformanceMode ? 'rounded-xl' : 'rounded-2xl backdrop-blur-sm'
                      } border focus:outline-none focus:ring-2 transition-all duration-300 ${themeClasses.input}`}
                    />
                  </div>
                </div>
                
                {!isPerformanceMode && (
                  <p className={`text-xs sm:text-sm mt-4 text-center ${themeClasses.text.muted}`}>
                    💡 Kosongkan kedua field ini jika tidak ingin melakukan proyeksi
                  </p>
                )}
              </div>
            </section>

            {/* Error Message */}
            {error && (
              <div className={`mb-6 p-4 ${
                isPerformanceMode ? 'rounded-xl' : 'rounded-2xl backdrop-blur-sm'
              } ${
                isPerformanceMode
                  ? isDarkMode
                    ? "bg-red-900/50 border border-red-500/50 text-red-200"
                    : "bg-red-100 border border-red-300 text-red-700"
                  : `${
                      isDarkMode 
                        ? "bg-red-500/20 border border-red-500/30 text-red-300"
                        : "bg-red-100 border border-red-300 text-red-700"
                    }`
              }`}>
                <p className="text-center text-xs sm:text-sm md:text-base">{error}</p>
              </div>
            )}

            {/* Adaptive Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
              <button
                onClick={compute}
                disabled={isCalculating}
                className={`group relative px-6 md:px-8 py-3 md:py-4 font-semibold ${
                  isPerformanceMode ? 'rounded-xl' : 'rounded-2xl'
                } shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden text-sm md:text-base ${
                  isPerformanceMode ? '' : 'hover:scale-105'
                } ${themeClasses.button.primary}`}
              >
                {!isPerformanceMode && (
                  <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isDarkMode ? "from-white/10 to-gray-300/10" : "from-white/20 to-blue-200/20"
                  }`}></div>
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {isCalculating ? (
                    <>
                      <div className={`w-4 md:w-5 h-4 md:h-5 border-2 rounded-full animate-spin ${
                        isPerformanceMode 
                          ? isDarkMode 
                            ? "border-gray-600/30 border-t-gray-600"
                            : "border-white/30 border-t-white"
                          : "border-white/30 border-t-white"
                      }`}></div>
                      Menghitung...
                    </>
                  ) : (
                    "Hitung Assetku"
                  )}
                </span>
              </button>

              <button
                onClick={resetAll}
                className={`px-4 md:px-6 py-3 md:py-4 font-medium ${
                  isPerformanceMode ? 'rounded-xl' : 'rounded-2xl'
                } border transition-all duration-300 text-sm md:text-base ${
                  isPerformanceMode ? '' : 'hover:scale-105'
                } ${themeClasses.button.secondary}`}
              >
                Reset
              </button>

              <button
                onClick={fillSampleData}
                className={`px-4 md:px-6 py-3 md:py-4 font-medium ${
                  isPerformanceMode ? 'rounded-xl' : 'rounded-2xl'
                } border transition-all duration-300 text-sm md:text-base ${
                  isPerformanceMode ? '' : 'hover:scale-105'
                } ${
                  isPerformanceMode
                    ? isDarkMode
                      ? "bg-gray-600/50 text-gray-200 border-gray-500 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                    : `${
                        isDarkMode 
                          ? "bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30"
                          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                      }`
                }`}
              >
                Contoh Data
              </button>
            </div>

            {/* Results Section */}
            <section className="mb-6 md:mb-8">
              <h2 className={`${
                isPerformanceMode 
                  ? `text-xl md:text-2xl font-bold text-center mb-4 ${themeClasses.text.primary}`
                  : `text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6 bg-gradient-to-r bg-clip-text text-transparent ${themeClasses.gradient}`
              }`}>
                Hasil Perhitungan
              </h2>

              {!result && !isCalculating && (
                <div className="text-center py-8 md:py-12">
                  <div className={`w-16 md:w-24 h-16 md:h-24 mx-auto mb-4 rounded-full ${
                    isPerformanceMode 
                      ? isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'
                      : 'backdrop-blur-sm border'
                  } flex items-center justify-center text-2xl md:text-4xl ${
                    isPerformanceMode 
                      ? ""
                      : `${
                          isDarkMode 
                            ? "bg-gradient-to-r from-white/10 to-gray-400/10 border-white/10"
                            : "bg-gradient-to-r from-blue-100/50 to-indigo-100/50 border-blue-200/30"
                        }`
                  }`}>
                    💎
                  </div>
                  <p className={`text-sm sm:text-base md:text-lg px-4 ${themeClasses.text.muted}`}>
                    Tekan tombol <strong className={themeClasses.text.primary}>Hitung Assetku</strong> untuk melihat hasil{isPerformanceMode ? "" : " yang memukau"}
                  </p>
                </div>
              )}

              {isCalculating && (
                <div className="text-center py-8 md:py-12">
                  <div className={`w-16 md:w-24 h-16 md:h-24 mx-auto mb-4 md:mb-6 rounded-full ${
                    isPerformanceMode 
                      ? isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'
                      : 'backdrop-blur-sm border'
                  } flex items-center justify-center ${
                    isPerformanceMode 
                      ? ""
                      : `${
                          isDarkMode 
                            ? "bg-gradient-to-r from-white/10 to-gray-400/10 border-white/10"
                            : "bg-gradient-to-r from-blue-100/50 to-indigo-100/50 border-blue-200/30"
                        }`
                  }`}>
                    <div className={`w-6 md:w-8 h-6 md:h-8 border-2 rounded-full animate-spin ${
                      isPerformanceMode 
                        ? isDarkMode 
                          ? "border-gray-400/30 border-t-white" 
                          : "border-blue-300/30 border-t-blue-600"
                        : isDarkMode ? "border-gray-400/30 border-t-white" : "border-blue-300/30 border-t-blue-600"
                    }`}></div>
                  </div>
                  <p className={`text-sm sm:text-base md:text-lg ${themeClasses.text.secondary}`}>Sedang menghitung aset Anda...</p>
                </div>
              )}

              {result && (
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 ${isPerformanceMode ? '' : 'animate-fadeIn'}`}>
                  {/* Current Value Card - IDR */}
                  <div className={`group relative p-4 md:p-6 ${
                    isPerformanceMode ? 'rounded-xl' : 'rounded-3xl backdrop-blur-xl'
                  } border transition-all duration-500 ${
                    isPerformanceMode ? '' : 'hover:scale-105 hover:shadow-2xl'
                  } ${themeClasses.performanceCard.current}`}>
                    {!isPerformanceMode && (
                      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                        isDarkMode ? "bg-gradient-to-br from-white/5 to-transparent" : "bg-gradient-to-br from-white/20 to-transparent"
                      }`}></div>
                    )}
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <div className={`w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center text-lg md:text-2xl ${themeClasses.icons.primary}`}>🇮🇩</div>
                        <h3 className={`text-sm sm:text-lg md:text-xl font-semibold ${themeClasses.text.primary}`}>Nilai Sekarang (IDR)</h3>
                      </div>
                      <p className={`text-lg sm:text-xl md:text-3xl font-bold mb-2 break-words ${themeClasses.text.primary}`}>{formatIDR(result.totalIDR)}</p>
                      <p className={`text-xs sm:text-sm md:text-lg break-words ${themeClasses.text.secondary}`}>{formatUSDT(result.totalUSDT)}</p>
                    </div>
                  </div>

                  {/* Details Card */}
                  <div className={`group relative p-4 md:p-6 ${
                    isPerformanceMode ? 'rounded-xl' : 'rounded-3xl backdrop-blur-xl'
                  } border transition-all duration-500 ${
                    isPerformanceMode ? '' : 'hover:scale-105 hover:shadow-2xl'
                  } ${themeClasses.performanceCard.details}`}>
                    {!isPerformanceMode && (
                      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                        isDarkMode ? "bg-gradient-to-br from-gray-400/5 to-transparent" : "bg-gradient-to-br from-white/20 to-transparent"
                      }`}></div>
                    )}
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <div className={`w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center text-lg md:text-2xl ${themeClasses.icons.secondary}`}>📋</div>
                        <h3 className={`text-sm sm:text-lg md:text-xl font-semibold ${themeClasses.text.primary}`}>Detail</h3>
                      </div>
                      <div className={`space-y-2 text-xs sm:text-sm ${themeClasses.text.secondary}`}>
                        <p>💎 Harga/koin: <strong className={`break-words ${themeClasses.text.primary}`}>{formatUSDT(currentValues.price)}</strong></p>
                        <p>🪙 Total koin: <strong className={themeClasses.text.primary}>{currentValues.coins.toLocaleString()}</strong></p>
                        <p>💱 Kurs: <strong className={themeClasses.text.primary}>Rp {currentValues.rate.toLocaleString()}</strong></p>
                      </div>
                    </div>
                  </div>

                  {/* Projection Card */}
                  {result.projectedUSDT !== undefined && (
                    <div className={`sm:col-span-2 group relative p-6 md:p-8 ${
                      isPerformanceMode ? 'rounded-xl' : 'rounded-3xl backdrop-blur-xl'
                    } border transition-all duration-500 ${
                      isPerformanceMode ? '' : 'hover:scale-105 hover:shadow-2xl'
                    } ${themeClasses.performanceCard.projection}`}>
                      {!isPerformanceMode && (
                        <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                          isDarkMode ? "bg-gradient-to-br from-white/5 to-transparent" : "bg-gradient-to-br from-white/20 to-transparent"
                        }`}></div>
                      )}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                          <div className={`w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl ${themeClasses.icons.secondary}`}>🚀</div>
                          <div>
                            <h3 className={`text-lg sm:text-xl md:text-2xl font-bold ${themeClasses.text.primary}`}>Proyeksi Masa Depan</h3>
                            <p className={`text-xs sm:text-sm md:text-base ${themeClasses.text.secondary}`}>Target: {endDate}</p>
                          </div>
                        </div>
                        <div className="text-center mb-4 md:mb-6">
                          <p className={`text-xl sm:text-2xl md:text-4xl font-bold mb-2 break-words ${themeClasses.text.primary}`}>{formatIDR(result.projectedIDR!)}</p>
                          <p className={`text-base sm:text-lg md:text-2xl break-words ${themeClasses.text.secondary}`}>{formatUSDT(result.projectedUSDT)}</p>
                        </div>
                        <div className="flex justify-center">
                          <div className={`px-4 md:px-6 py-2 md:py-3 rounded-full ${
                            isPerformanceMode 
                              ? isDarkMode 
                                ? 'bg-gray-600/50 border border-gray-500/50' 
                                : 'bg-white/60 border border-gray-300/50'
                              : 'backdrop-blur-sm border'
                          } ${
                            isPerformanceMode 
                              ? ""
                              : `${
                                  isDarkMode 
                                    ? "bg-gray-400/20 border-gray-400/30" 
                                    : "bg-white/60 border-purple-200/50"
                                }`
                          }`}>
                            <p className={`text-center text-xs sm:text-sm ${themeClasses.text.secondary}`}>
                              +{currentValues.daily.toLocaleString()} koin/hari × {result.daysProjected} hari
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="text-center">
              <div className={`inline-block px-4 md:px-6 py-2 md:py-3 rounded-full ${
                isPerformanceMode 
                  ? isDarkMode 
                    ? 'bg-white/5 border border-white/10' 
                    : 'bg-white/60 border border-gray-200/50'
                  : 'backdrop-blur-sm border'
              } ${
                isPerformanceMode 
                  ? ""
                  : `${
                      isDarkMode 
                        ? "bg-white/5 border-white/10" 
                        : "bg-white/60 border-gray-200/50"
                    }`
              }`}>
                <p className={`text-xs sm:text-sm ${themeClasses.text.muted}`}>
                  Real-time calculation • Secure • Responsive
                </p>
                <p className={`text-xs sm:text-sm ${themeClasses.text.muted}`}>
                  Disclaimer: Kami tidak mengumpulkan data apa pun. Gunakan aplikasi ini dengan tenang dan nyaman.
                </p>
                <br/>
                <p className={`text-xs sm:text-sm ${themeClasses.text.muted}`}>
                 2025 - Arno
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>

      {/* Custom Animations - Only load in non-performance mode */}
      {!isPerformanceMode && (
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out;
          }
        `}</style>
      )}
    </div>
  );
}
