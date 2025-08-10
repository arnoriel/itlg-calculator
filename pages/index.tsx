import React, { useState, useEffect } from "react";

type Result = {
  totalUSDT: number;
  totalIDR: number;
  projectedUSDT?: number;
  projectedIDR?: number;
  daysProjected?: number;
};

export default function CryptoAssetCalculator() {
  const [pricePerCoin, setPricePerCoin] = useState<string>("0.4796");
  const [currentCoins, setCurrentCoins] = useState<string>("");
  const [dailyCoins, setDailyCoins] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [usdToIdr, setUsdToIdr] = useState<string>("16000");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);

  // Animated background particles
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, opacity: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.1
    }));
    setParticles(newParticles);
  }, []);

  function parseNumber(v: string) {
    if (!v) return 0;
    const cleaned = v.replace(/,/g, "").trim();
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  function formatIDR(n: number) {
    return n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  }

  function formatUSDT(n: number) {
    return `${n.toLocaleString(undefined, { maximumFractionDigits: 6 })} USDT`;
  }

  async function compute() {
    setError("");
    setIsCalculating(true);
    
    // Add loading animation delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const price = parseNumber(pricePerCoin);
    const coins = parseNumber(currentCoins);
    const daily = parseNumber(dailyCoins);
    const rate = parseNumber(usdToIdr);

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
  }

  function resetAll() {
    setPricePerCoin("0.4796");
    setCurrentCoins("0");
    setDailyCoins("0");
    setEndDate("");
    setUsdToIdr("15000");
    setResult(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-black relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/10 animate-pulse"
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
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

      <main className="relative z-10 p-4 md:p-6 flex items-start justify-center min-h-screen">
        <div className="max-w-4xl w-full">
          {/* Glassmorphism Card */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-4 md:p-8 transition-all duration-700">
            
            {/* Header with Gradient Text */}
            <header className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-3 md:mb-4 tracking-tight">
                $ITLG Asset Calculator
              </h1>
              <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-gray-300 to-white mx-auto rounded-full mb-3 md:mb-4"></div>
              <p className="text-gray-300 text-xs sm:text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-2 sm:px-4">
                Hitung nilai aset kripto Anda dengan proyeksi otomatis dan tampilan real-time yang menawan
              </p>
            </header>

            {/* Main Input Form - Consistent Grid Layout */}
            <section className="mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Data Utama
              </h2>
              {/* Force 2-column layout on all screens except very small */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className="group">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white">
                    Harga per koin dalam USDT (sesuai dari apespace.com)
                  </label>
                  <input
                    inputMode="decimal"
                    value={pricePerCoin}
                    onChange={(e) => setPricePerCoin(e.target.value)}
                    className="w-full p-3 md:p-4 text-sm md:text-base rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 hover:bg-white/10"
                    placeholder="0.4796"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white">
                    Kurs USD → IDR
                  </label>
                  <input
                    inputMode="decimal"
                    value={usdToIdr}
                    onChange={(e) => setUsdToIdr(e.target.value)}
                    className="w-full p-3 md:p-4 text-sm md:text-base rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 hover:bg-white/10"
                    placeholder="15000"
                  />
                </div>

                {/* Full width on mobile and desktop */}
                <div className="sm:col-span-2 group">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white">
                    Jumlah koin Anda sekarang
                  </label>
                  <input
                    inputMode="decimal"
                    value={currentCoins}
                    onChange={(e) => setCurrentCoins(e.target.value)}
                    className="w-full p-3 md:p-4 text-sm md:text-base rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 hover:bg-white/10"
                    placeholder="1000"
                  />
                </div>
              </div>
            </section>

            {/* Projection Section - Consistent Position */}
            <section className="mb-6 md:mb-8">
              <div className="bg-gradient-to-r from-slate-800/20 to-gray-700/20 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-slate-600/30">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-3 md:mb-4 bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
                  Proyeksi Opsional
                </h2>
                <p className="text-gray-400 text-center mb-4 md:mb-6 text-xs sm:text-sm px-2 sm:px-4">
                  Isi bagian ini jika Anda ingin melihat proyeksi perolehan koin di masa depan
                </p>
                
                {/* Consistent 2-column layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div className="group">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white">
                      Koin per hari (proyeksi)
                    </label>
                    <input
                      inputMode="decimal"
                      value={dailyCoins}
                      onChange={(e) => setDailyCoins(e.target.value)}
                      className="w-full p-3 md:p-4 text-sm md:text-base rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400/30 transition-all duration-300 hover:bg-white/10"
                      placeholder="180"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white">
                      Proyeksi sampai tanggal
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-3 md:p-4 text-sm md:text-base rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400/30 transition-all duration-300 hover:bg-white/10"
                    />
                  </div>
                </div>
                
                <p className="text-gray-500 text-xs sm:text-sm mt-4 text-center">
                  💡 Kosongkan kedua field ini jika tidak ingin melakukan proyeksi
                </p>
              </div>
            </section>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
                <p className="text-red-300 text-center text-xs sm:text-sm md:text-base">{error}</p>
              </div>
            )}

            {/* Action Buttons - Consistent Layout */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
              <button
                onClick={compute}
                disabled={isCalculating}
                className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-gray-700 to-black text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden text-sm md:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-gray-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isCalculating ? (
                    <>
                      <div className="w-4 md:w-5 h-4 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menghitung...
                    </>
                  ) : (
                    <>
                      Hitung Assetku
                    </>
                  )}
                </span>
              </button>

              <button
                onClick={resetAll}
                className="px-4 md:px-6 py-3 md:py-4 bg-white/5 backdrop-blur-sm text-white font-medium rounded-2xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105 text-sm md:text-base"
              >
                Reset
              </button>

              <button
                onClick={() => {
                  setPricePerCoin("0.4796");
                  setCurrentCoins("8578");
                  setDailyCoins("180");
                  const sampleEnd = new Date();
                  sampleEnd.setMonth(sampleEnd.getMonth() + 1);
                  setEndDate(sampleEnd.toISOString().slice(0, 10));
                }}
                className="px-4 md:px-6 py-3 md:py-4 bg-gray-500/20 backdrop-blur-sm text-gray-300 font-medium rounded-2xl border border-gray-500/30 transition-all duration-300 hover:bg-gray-500/30 hover:scale-105 text-sm md:text-base"
              >
                Contoh Data
              </button>
            </div>

            {/* Results Section - Consistent Layout */}
            <section className="mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Hasil Perhitungan
              </h2>

              {!result && !isCalculating && (
                <div className="text-center py-8 md:py-12">
                  <div className="w-16 md:w-24 h-16 md:h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-white/10 to-gray-400/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-2xl md:text-4xl">
                    💎
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base md:text-lg px-4">
                    Tekan tombol <strong className="text-white">Hitung Assetku</strong> untuk melihat hasil yang memukau
                  </p>
                </div>
              )}

              {isCalculating && (
                <div className="text-center py-8 md:py-12">
                  <div className="w-16 md:w-24 h-16 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-r from-white/10 to-gray-400/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <div className="w-6 md:w-8 h-6 md:h-8 border-2 border-gray-400/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg">Sedang menghitung aset Anda...</p>
                </div>
              )}

              {result && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 animate-fadeIn">
                  {/* Current Value Card - IDR First - Consistent Layout */}
                  <div className="group relative p-4 md:p-6 rounded-3xl bg-gradient-to-br from-white/10 to-gray-500/10 backdrop-blur-xl border border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white/20 flex items-center justify-center text-lg md:text-2xl">🇮🇩</div>
                        <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-white">Nilai Sekarang (IDR)</h3>
                      </div>
                      <p className="text-lg sm:text-xl md:text-3xl font-bold text-white mb-2 break-words">{formatIDR(result.totalIDR)}</p>
                      <p className="text-gray-300 text-xs sm:text-sm md:text-lg break-words">{formatUSDT(result.totalUSDT)}</p>
                    </div>
                  </div>

                  {/* Details Card - Consistent Layout */}
                  <div className="group relative p-4 md:p-6 rounded-3xl bg-gradient-to-br from-gray-500/10 to-black/20 backdrop-blur-xl border border-gray-400/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-400/20 flex items-center justify-center text-lg md:text-2xl">📋</div>
                        <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-200">Detail</h3>
                      </div>
                      <div className="space-y-2 text-gray-300 text-xs sm:text-sm">
                        <p>💎 Harga/koin: <strong className="text-white break-words">{formatUSDT(parseNumber(pricePerCoin))}</strong></p>
                        <p>🪙 Total koin: <strong className="text-white">{parseNumber(currentCoins).toLocaleString()}</strong></p>
                        <p>💱 Kurs: <strong className="text-white">Rp {parseNumber(usdToIdr).toLocaleString()}</strong></p>
                      </div>
                    </div>
                  </div>

                  {/* Projection Card - Full Width on Both Screens */}
                  {result.projectedUSDT !== undefined && (
                    <div className="sm:col-span-2 group relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-gray-600/10 via-slate-500/10 to-white/5 backdrop-blur-xl border border-gray-400/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/20">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                          <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-gray-400/20 flex items-center justify-center text-2xl md:text-3xl">🚀</div>
                          <div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Proyeksi Masa Depan</h3>
                            <p className="text-gray-300 text-xs sm:text-sm md:text-base">Target: {endDate}</p>
                          </div>
                        </div>
                        <div className="text-center mb-4 md:mb-6">
                          <p className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2 break-words">{formatIDR(result.projectedIDR!)}</p>
                          <p className="text-base sm:text-lg md:text-2xl text-gray-200 break-words">{formatUSDT(result.projectedUSDT)}</p>
                        </div>
                        <div className="flex justify-center">
                          <div className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-gray-400/20 backdrop-blur-sm border border-gray-400/30">
                            <p className="text-gray-300 text-center text-xs sm:text-sm">
                              +{parseNumber(dailyCoins).toLocaleString()} koin/hari × {result.daysProjected} hari
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
              <div className="inline-block px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-gray-400 text-xs sm:text-sm">
                  Real-time calculation • Secure • Responsive
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Disclaimer: Kami tidak mengumpulkan data apa pun. Gunakan aplikasi ini dengan tenang dan nyaman.
                </p>
                <br/>
                <p className="text-gray-400 text-xs sm:text-sm">
                 2025 - Arno
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>

      {/* Custom Animations */}
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
    </div>
  );
}
