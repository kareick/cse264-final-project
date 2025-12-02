"use client";

import React, { useState, useEffect } from "react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, User, Briefcase, FileText, PieChart, Search, TrendingUp, TrendingDown, Plus, Minus } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const Investment = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");
  const [searchSymbol, setSearchSymbol] = useState("");
  const [stockPrice, setStockPrice] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [assetType, setAssetType] = useState("stock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const navItems = [
    { name: "Portfolio", url: "/portfolio", icon: PieChart },
    { name: "Invest", url: "/investments", icon: User },
    { name: "Market", url: "/market", icon: Briefcase },
    { name: "Log Out", url: "/logout", icon: FileText },
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
      
      // Auto-select first portfolio if available
      if (data.length > 0 && !selectedPortfolioId) {
        setSelectedPortfolioId(data[0].id.toString());
      }
    } catch (err) {
      console.error("Error fetching portfolios:", err);
      setError("Failed to load portfolios");
    }
  };

  // Fetch stock price
  const fetchStockPrice = async (symbol) => {
    if (!symbol.trim()) return;
    
    setLoadingPrice(true);
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
      setPrice(data.price.toFixed(2));
    } catch (err) {
      setError(err.message || "Failed to fetch stock price");
      setStockPrice(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  // Fetch transactions for selected portfolio
  const fetchTransactions = async () => {
    if (!selectedPortfolioId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/portfolios/${selectedPortfolioId}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load transactions");
      }

      const data = await response.json();
      setTransactions(data.holdings || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  // Create new portfolio
  const createPortfolio = async () => {
    const name = prompt("Enter portfolio name:");
    if (!name) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/portfolios`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create portfolio");
      }

      const data = await response.json();
      await fetchPortfolios();
      setSelectedPortfolioId(data.id.toString());
      setSuccess("Portfolio created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to create portfolio");
    }
  };

  // Buy stock
  const handleBuy = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedPortfolioId) {
      setError("Please select or create a portfolio");
      return;
    }

    if (!searchSymbol.trim() || !quantity || !price) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Use portfolio transactions endpoint for buying
      const response = await fetch(
        `${API_BASE_URL}/api/portfolios/${selectedPortfolioId}/transactions`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetSymbol: searchSymbol.toUpperCase().trim(),
            type: "buy",
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            fees: 0,
            notes: "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to buy stock");
      }

      setSuccess(`Successfully bought ${quantity} shares of ${searchSymbol.toUpperCase()}!`);
      setSearchSymbol("");
      setQuantity("");
      setPrice("");
      setStockPrice(null);
      
      // Refresh transactions
      await fetchTransactions();
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to buy stock");
    } finally {
      setLoading(false);
    }
  };

  // Sell stock
  const handleSell = async (assetId, symbol, currentQuantity) => {
    const sellQuantity = prompt(`Enter quantity to sell (max: ${currentQuantity}):`);
    if (!sellQuantity || parseFloat(sellQuantity) <= 0) return;

    const sellPrice = prompt("Enter sell price per share:");
    if (!sellPrice || parseFloat(sellPrice) <= 0) return;

    if (parseFloat(sellQuantity) > parseFloat(currentQuantity)) {
      setError("Cannot sell more shares than you own");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use portfolio transactions endpoint for selling
      const response = await fetch(
        `${API_BASE_URL}/api/portfolios/${selectedPortfolioId}/transactions`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetSymbol: symbol,
            type: "sell",
            quantity: parseFloat(sellQuantity),
            price: parseFloat(sellPrice),
            fees: 0,
            notes: "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sell stock");
      }

      setSuccess(`Successfully sold ${sellQuantity} shares of ${symbol}!`);
      await fetchTransactions();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to sell stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolioId) {
      fetchTransactions();
    }
  }, [selectedPortfolioId]);

  useEffect(() => {
    if (searchSymbol.trim() && assetType === "stock") {
      const timeoutId = setTimeout(() => {
        fetchStockPrice(searchSymbol);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchSymbol, assetType]);

  const totalValue = transactions.reduce((sum, holding) => {
    return sum + (parseFloat(holding.current_value) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-100 text-black">
      <NavBar items={navItems} />

      <main className="pt-24 pb-16 space-y-8">
        {/* Header */}
        <section className="container mx-auto px-4 md:px-8">
          <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-8 md:p-12">
            <p className="uppercase text-xs tracking-[0.4em] text-black/60">
              Investment
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">
              Buy & Sell Stocks
            </h1>
            <p className="mt-4 text-lg text-black/70 max-w-3xl">
              Manage your investments by buying and selling stocks. All transactions will be reflected in your portfolio.
            </p>
          </div>
        </section>

        {/* Portfolio Selection */}
        <section className="container mx-auto px-4 md:px-8">
          <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Select Portfolio</h2>
              <button
                onClick={createPortfolio}
                className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-black/90 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Portfolio
              </button>
            </div>
            {portfolios.length > 0 ? (
              <select
                value={selectedPortfolioId}
                onChange={(e) => setSelectedPortfolioId(e.target.value)}
                className="w-full md:w-auto rounded-xl border border-black/20 bg-white px-4 py-3 text-black focus:border-black focus:outline-none"
              >
                {portfolios.map((portfolio) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-black/60">
                No portfolios found. Create one to get started.
              </div>
            )}
          </div>
        </section>

        {/* Buy Form */}
        {selectedPortfolioId && (
          <section className="container mx-auto px-4 md:px-8">
            <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-10">
              <h2 className="text-2xl font-semibold mb-6">Buy Stock</h2>
              
              <form onSubmit={handleBuy} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      Asset Type
                    </label>
                    <select
                      value={assetType}
                      onChange={(e) => {
                        setAssetType(e.target.value);
                        setStockPrice(null);
                        setPrice("");
                      }}
                      className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-black focus:border-black focus:outline-none"
                    >
                      <option value="stock">Stock</option>
                      <option value="crypto">Crypto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      Symbol {assetType === "stock" && "(e.g., AAPL, MSFT)"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchSymbol}
                        onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                        placeholder="Enter symbol"
                        className="flex-1 rounded-xl border border-black/20 bg-white px-4 py-3 text-black focus:border-black focus:outline-none"
                        required
                      />
                      {assetType === "stock" && (
                        <button
                          type="button"
                          onClick={() => fetchStockPrice(searchSymbol)}
                          disabled={loadingPrice || !searchSymbol.trim()}
                          className="px-4 py-3 rounded-xl bg-gray-100 text-black hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {stockPrice && assetType === "stock" && (
                    <div className="md:col-span-2 rounded-xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-700">Current Price</p>
                          <p className="text-2xl font-bold text-green-900">
                            ${stockPrice.price.toFixed(2)}
                          </p>
                          <p
                            className={`text-sm ${
                              stockPrice.change >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {stockPrice.change >= 0 ? "+" : ""}
                            {stockPrice.change.toFixed(2)} (
                            {stockPrice.changePercent >= 0 ? "+" : ""}
                            {stockPrice.changePercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Number of shares"
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-black focus:border-black focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      Price per Share
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-black focus:border-black focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {quantity && price && (
                  <div className="rounded-xl border border-black/10 bg-gray-50 p-4">
                    <p className="text-sm text-black/60">Total Cost</p>
                    <p className="text-2xl font-bold">
                      ${(parseFloat(quantity) * parseFloat(price)).toFixed(2)}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedPortfolioId}
                  className="w-full px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold tracking-wide hover:bg-black/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : "Buy Stock"}
                </button>
              </form>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Current Holdings */}
        {selectedPortfolioId && transactions.length > 0 && (
          <section className="container mx-auto px-4 md:px-8">
            <div className="rounded-3xl bg-white border border-black/10 shadow-xl p-6 md:p-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">Current Holdings</h2>
                  <p className="text-black/60 mt-1">
                    Total Value: ${totalValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transactions.map((holding) => (
                  <div
                    key={holding.id}
                    className="rounded-2xl border border-black/10 p-5 bg-gradient-to-b from-white to-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-black/50">
                          {holding.symbol}
                        </p>
                        <p className="text-lg font-semibold">{holding.name || holding.symbol}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-black/60">Quantity:</span>
                        <span className="font-semibold">{holding.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-black/60">Avg Buy Price:</span>
                        <span className="font-semibold">
                          ${parseFloat(holding.average_buy_price).toFixed(2)}
                        </span>
                      </div>
                      {holding.current_price && (
                        <div className="flex justify-between text-sm">
                          <span className="text-black/60">Current Price:</span>
                          <span className="font-semibold">
                            ${parseFloat(holding.current_price).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {holding.current_value && (
                        <div className="flex justify-between text-sm">
                          <span className="text-black/60">Value:</span>
                          <span className="font-semibold">
                            ${parseFloat(holding.current_value).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleSell(holding.asset_id, holding.symbol, holding.quantity)}
                      className="w-full px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 transition flex items-center justify-center gap-2"
                    >
                      <Minus className="w-4 h-4" />
                      Sell
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Investment;

