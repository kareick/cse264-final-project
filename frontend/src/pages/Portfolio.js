"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, User, Briefcase, FileText, PieChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const defaultHoldings = [
  { symbol: "AAPL", name: "Apple", shares: 8, color: "#0f172a" },
  { symbol: "MSFT", name: "Microsoft", shares: 5, color: "#1f2937" },
  { symbol: "NVDA", name: "Nvidia", shares: 3, color: "#4b5563" },
  { symbol: "AMZN", name: "Amazon", shares: 4, color: "#f97316" },
];

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [draftHoldings, setDraftHoldings] = useState(defaultHoldings);
  const [holdings, setHoldings] = useState(defaultHoldings);
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navItems = [
    { name: "Portfolio", url: "/portfolio", icon: Home },
    { name: "Invest", url: "/investments", icon: User },
    { name: "Market", url: "/market", icon: Briefcase },
    { name: "Log Out", url: "/logout", icon: PieChart },
  ];

  // Fetch user's portfolios
  const fetchPortfolios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/portfolios`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Unable to load portfolios");
      }

      const data = await response.json();
      setPortfolios(data);
      
      // If user has portfolios, load the first one
      if (data.length > 0 && !selectedPortfolio) {
        fetchPortfolioDetails(data[0].id);
      } else if (data.length === 0) {
        // No portfolios, use default holdings for market data
        fetchMarketData(defaultHoldings);
      }
    } catch (err) {
      console.error("Error fetching portfolios:", err);
      // If auth fails, fall back to default holdings
      fetchMarketData(defaultHoldings);
    }
  };

  // Fetch portfolio details with holdings
  const fetchPortfolioDetails = async (portfolioId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/portfolios/${portfolioId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Unable to load portfolio details");
      }

      const data = await response.json();
      setSelectedPortfolio(data);
      
      // Convert portfolio holdings to format for market data
      if (data.holdings && data.holdings.length > 0) {
        const colorPalette = ["#0f172a", "#1f2937", "#4b5563", "#f97316", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
        const holdingsForMarket = data.holdings.map((holding, index) => ({
          symbol: holding.symbol,
          name: holding.name || holding.symbol,
          shares: parseFloat(holding.quantity) || 0,
          color: colorPalette[index % colorPalette.length],
        }));
        setHoldings(holdingsForMarket);
        setDraftHoldings(holdingsForMarket);
        fetchMarketData(holdingsForMarket);
      } else {
        fetchMarketData(defaultHoldings);
      }
    } catch (err) {
      console.error("Error fetching portfolio details:", err);
      fetchMarketData(defaultHoldings);
    }
  };

  // Fetch market data for holdings
  const fetchMarketData = async (holdingsToFetch) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/market/portfolio`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdings: holdingsToFetch.map(({ symbol, shares }) => ({
            symbol,
            shares,
          })),
          outputsize: "compact",
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to load market data");
      }

      const data = await response.json();
      setPortfolioData(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    if (holdings.length > 0) {
      fetchMarketData(holdings);
    }
  }, [holdings]);

  const totalLineData = useMemo(() => {
    if (!portfolioData?.timeline?.length) return null;

    return {
      labels: portfolioData.timeline.map((point) =>
        new Date(point.date).toLocaleDateString()
      ),
      datasets: [
        {
          label: "Total Portfolio Value",
          data: portfolioData.timeline.map((point) => point.value),
          borderColor: "#0f172a",
          backgroundColor: "rgba(15, 23, 42, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [portfolioData]);

  const allocationData = useMemo(() => {
    if (!portfolioData?.holdings?.length) return null;

    const latestValues = portfolioData.holdings.map((holding, index) => {
      const lastPoint = holding.series[holding.series.length - 1];
      return {
        symbol: holding.symbol,
        value: lastPoint ? lastPoint.value : 0,
        color: draftHoldings[index]?.color || "#111827",
      };
    });

    return {
      labels: latestValues.map((item) => item.symbol),
      datasets: [
        {
          data: latestValues.map((item) => item.value),
          backgroundColor: latestValues.map((item) => item.color),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [portfolioData, draftHoldings]);

  const handleShareChange = (symbol, newValue) => {
    setDraftHoldings((prev) =>
      prev.map((holding) =>
        holding.symbol === symbol
          ? { ...holding, shares: Number(newValue) || 0 }
          : holding
      )
    );
  };

  const applyHoldings = () => {
    setHoldings(draftHoldings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-100 text-black">
      <NavBar items={navItems} />

      <main className="pt-24 pb-16 space-y-12">
        <section className="container mx-auto px-4 md:px-8">
          <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-8 md:p-12">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <p className="uppercase text-xs tracking-[0.4em] text-black/60">
                  Insight
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mt-4">
                  Visualize Your Portfolio in Real Time
                </h1>
                <p className="mt-4 text-lg text-black/70 max-w-3xl">
                  Connect live Alpha Vantage market data with your personal share
                  counts to see how every position contributes to your total value.
                </p>
              </div>
              {portfolios.length > 0 && (
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <label className="text-sm font-medium text-black/70">
                    Select Portfolio
                  </label>
                  <select
                    value={selectedPortfolio?.id || ""}
                    onChange={(e) => {
                      const portfolioId = e.target.value;
                      if (portfolioId) {
                        fetchPortfolioDetails(portfolioId);
                      }
                    }}
                    className="rounded-xl border border-black/20 bg-white px-4 py-2 text-black focus:border-black focus:outline-none cursor-pointer hover:border-black/40 transition"
                  >
                    {portfolios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || `Portfolio ${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {selectedPortfolio && (
              <div className="mt-6 pt-6 border-t border-black/10">
                <p className="text-sm text-black/60">
                  <span className="font-semibold">{selectedPortfolio.name}</span>
                  {selectedPortfolio.description && (
                    <span className="ml-2">- {selectedPortfolio.description}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-black/60">
                  Performance
                </p>
                <h2 className="text-2xl font-semibold">Portfolio Growth</h2>
              </div>
              {loading && (
                <span className="text-sm text-black/60 animate-pulse">
                  Syncing…
                </span>
              )}
            </div>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {totalLineData ? (
              <Line
                data={totalLineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  aspectRatio: 2,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      displayColors: false,
                      callbacks: {
                        label: (context) => `$${context.parsed.y.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      ticks: {
                        callback: (value) =>
                          `$${Number(value).toLocaleString()}`,
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                          size: 11,
                        },
                      },
                      grid: { 
                        color: "rgba(15,23,42,0.1)",
                        drawBorder: false,
                      },
                    },
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                          size: 10,
                        },
                        maxTicksLimit: 10,
                      },
                      grid: { 
                        display: false,
                        drawBorder: false,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-black/60">No data yet.</div>
            )}
          </div>

          <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-8 space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-black/60">
                Allocation
              </p>
              <h2 className="text-2xl font-semibold">Current Mix</h2>
            </div>
            {allocationData ? (
              <Doughnut
                data={allocationData}
                options={{
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { color: "#111827", usePointStyle: true },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-black/60">No allocation data.</div>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-8">
          <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-10 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-black/60">
                  Settings
                </p>
                <h2 className="text-2xl font-semibold">Adjust Share Counts</h2>
                <p className="text-black/60">
                  Tweak your positions and compare the updated performance.
                </p>
              </div>
              <button
                onClick={applyHoldings}
                className="px-6 py-3 rounded-full bg-black text-white text-sm font-semibold tracking-wide hover:bg-black/90 transition"
              >
                Update Charts
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {draftHoldings.map((holding) => (
                <div
                  key={holding.symbol}
                  className="rounded-2xl border border-black/10 p-5 bg-gradient-to-b from-white to-gray-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-black/50">
                        {holding.symbol}
                      </p>
                      <h3 className="text-lg font-semibold">{holding.name}</h3>
                    </div>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: holding.color }}
                    />
                  </div>
                  <label className="text-sm text-black/60 block">
                    Shares
                    <input
                      type="number"
                      min="0"
                      value={holding.shares}
                      onChange={(e) =>
                        handleShareChange(holding.symbol, e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

        {portfolioData?.holdings?.length ? (
          <section className="container mx-auto px-4 md:px-8">
            <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-black/60">
                    Positions
                  </p>
                  <h2 className="text-2xl font-semibold">Live Snapshot</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {portfolioData.holdings.map((holding, index) => {
                  const latest = holding.series[holding.series.length - 1];
                  const color = draftHoldings[index]?.color || "#0f172a";
                  return (
                    <div
                      key={holding.symbol}
                      className="rounded-2xl border border-black/10 p-5 bg-gradient-to-b from-white to-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-black/50">
                            {holding.symbol}
                          </p>
                          <p className="text-sm text-black/60">
                            {holdings[index]?.shares || 0} shares
                          </p>
                        </div>
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <p className="mt-4 text-3xl font-bold">
                        {latest
                          ? `$${latest.value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "--"}
                      </p>
                      <p className="text-sm text-black/60">
                        Close: $
                        {latest
                          ? latest.close.toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default Portfolio;

