"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, User, Briefcase, FileText, PieChart, Search, TrendingUp, TrendingDown } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const Market = () => {
  const [searchSymbol, setSearchSymbol] = useState("");
  const [currentStock, setCurrentStock] = useState(null);
  const [stockPrice, setStockPrice] = useState(null);
  const [stockHistory, setStockHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [outputsize, setOutputsize] = useState("compact");

  const navItems = [
    { name: "Portfolio", url: "/portfolio", icon: Home },
    { name: "Invest", url: "/investments", icon: User },
    { name: "Market", url: "/market", icon: Briefcase },
    { name: "Log Out", url: "/logout", icon: PieChart },
  ];

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("marketWatchlist");
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem("marketWatchlist", JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const fetchStockQuote = async (symbol) => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/market/quote/${symbol.toUpperCase()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Stock not found");
      }

      const data = await response.json();
      setStockPrice(data);
      setCurrentStock(symbol.toUpperCase());
    } catch (err) {
      setError(err.message || "Failed to fetch stock quote");
      setStockPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockHistory = async (symbol) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/market/history/${symbol.toUpperCase()}?outputsize=${outputsize}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Stock history not found");
      }

      const data = await response.json();
      setStockHistory(data);
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err.message || "Failed to fetch stock history");
      setStockHistory(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchSymbol.trim()) return;

    await Promise.all([
      fetchStockQuote(searchSymbol),
      fetchStockHistory(searchSymbol),
    ]);
  };

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol.toUpperCase())) {
      setWatchlist([...watchlist, symbol.toUpperCase()]);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter((s) => s !== symbol));
  };

  const historyChartData = useMemo(() => {
    if (!stockHistory?.history?.length) return null;

    const history = stockHistory.history;
    const isPositive = history.length > 1 
      ? history[history.length - 1].close >= history[0].close 
      : true;

    return {
      labels: history.map((point) => new Date(point.date).toLocaleDateString()),
      datasets: [
        {
          label: "Close Price",
          data: history.map((point) => point.close),
          borderColor: isPositive ? "#10b981" : "#ef4444",
          backgroundColor: isPositive 
            ? "rgba(16, 185, 129, 0.1)" 
            : "rgba(239, 68, 68, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [stockHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-100 text-black">
      <NavBar items={navItems} />

      <main className="pt-24 pb-16 space-y-8">
        {/* Header */}
        <section className="container mx-auto px-4 md:px-8">
          <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-8 md:p-12">
            <p className="uppercase text-xs tracking-[0.4em] text-black/60">
              Market Data
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">
              Real-Time Stock Market
            </h1>
            <p className="mt-4 text-lg text-black/70 max-w-3xl">
              Search for stocks, view live prices, and analyze historical performance with Alpha Vantage data.
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="container mx-auto px-4 md:px-8">
          <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-10">
            <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchSymbol}
                  onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                  placeholder="Enter stock symbol (e.g., AAPL, MSFT, GOOGL)"
                  className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-black focus:border-black focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchSymbol.trim()}
                className="px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold tracking-wide hover:bg-black/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {loading ? "Loading..." : "Search"}
              </button>
              <select
                value={outputsize}
                onChange={(e) => {
                  setOutputsize(e.target.value);
                  if (currentStock) {
                    fetchStockHistory(currentStock);
                  }
                }}
                className="px-4 py-3 rounded-xl border border-black/20 bg-white text-black focus:border-black focus:outline-none"
              >
                <option value="compact">Last 100 Days</option>
              </select>
            </form>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Stock Quote Display */}
        {stockPrice && currentStock && (
          <section className="container mx-auto px-4 md:px-8">
            <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold">{currentStock}</h2>
                  <p className="text-black/60 mt-1">Current Price</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    ${stockPrice.price.toFixed(2)}
                  </p>
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      stockPrice.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stockPrice.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {stockPrice.change >= 0 ? "+" : ""}
                      {stockPrice.change.toFixed(2)} (
                      {stockPrice.changePercent >= 0 ? "+" : ""}
                      {stockPrice.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (watchlist.includes(currentStock)) {
                      removeFromWatchlist(currentStock);
                    } else {
                      addToWatchlist(currentStock);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    watchlist.includes(currentStock)
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {watchlist.includes(currentStock) ? "Remove from" : "Add to"} Watchlist
                </button>
              </div>

              {/* History Chart */}
              {historyChartData && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Price History</h3>
                  <Line
                    data={historyChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) =>
                              `$${context.parsed.y.toFixed(2)}`,
                          },
                        },
                      },
                      scales: {
                        y: {
                          ticks: {
                            callback: (value) => `$${Number(value).toFixed(2)}`,
                          },
                          grid: { color: "rgba(15,23,42,0.1)" },
                        },
                        x: {
                          grid: { display: false },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Watchlist Section */}
        {watchlist.length > 0 && (
          <section className="container mx-auto px-4 md:px-8">
            <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-10">
              <h2 className="text-2xl font-semibold mb-6">Watchlist</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlist.map((symbol) => (
                  <div
                    key={symbol}
                    className="rounded-2xl border border-black/10 p-4 bg-gradient-to-b from-white to-gray-50 flex items-center justify-between hover:shadow-lg transition cursor-pointer"
                    onClick={() => {
                      setSearchSymbol(symbol);
                      Promise.all([
                        fetchStockQuote(symbol),
                        fetchStockHistory(symbol),
                      ]);
                    }}
                  >
                    <div>
                      <p className="font-semibold text-lg">{symbol}</p>
                      <p className="text-sm text-black/60">Click to view</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(symbol);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popular Stocks */}
        <section className="container mx-auto px-4 md:px-8">
          <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-10">
            <h2 className="text-2xl font-semibold mb-6">Popular Stocks</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => {
                    setSearchSymbol(symbol);
                    Promise.all([
                      fetchStockQuote(symbol),
                      fetchStockHistory(symbol),
                    ]);
                  }}
                  className="rounded-xl border border-black/10 p-4 bg-gradient-to-b from-white to-gray-50 hover:shadow-lg transition text-center"
                >
                  <p className="font-semibold">{symbol}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Market;

