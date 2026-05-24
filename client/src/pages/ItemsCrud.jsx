// InventoryManagement.jsx
// Requires: Tailwind CSS configured in your project
// Font: Add to index.html → <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>

import { useState, useEffect } from "react";
import { apiGet, apiDelete } from "../utils/api";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";

// ─── Helper Functions ─────────────────────────────────────────────────────────

// Generate color based on product name
const getColorForProduct = (name) => {
  const colors = [
    "bg-violet-600", "bg-slate-600", "bg-orange-700", "bg-teal-700",
    "bg-blue-700", "bg-pink-700", "bg-indigo-700", "bg-purple-700",
    "bg-cyan-700", "bg-emerald-700"
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Get stock status
const getStockStatus = (stock) => {
  const stockNum = parseInt(stock) || 0;
  if (stockNum > 50) return { label: "IN STOCK", color: "bg-cyan-400", textColor: "text-cyan-400", badgeClass: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" };
  if (stockNum > 10) return { label: "LOW", color: "bg-amber-400", textColor: "text-amber-400", badgeClass: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
  return { label: "CRITICAL", color: "bg-rose-500", textColor: "text-rose-400", badgeClass: "text-rose-400 bg-rose-400/10 border-rose-400/20" };
};

// Calculate stats from products
const calculateStats = (products) => {
  const total = products.length;
  const inStock = products.filter(p => parseInt(p.Stock) > 50).length;
  const lowStock = products.filter(p => parseInt(p.Stock) > 10 && parseInt(p.Stock) <= 50).length;
  const critical = products.filter(p => parseInt(p.Stock) <= 10).length;

  return [
    { label: "Total Items", value: total.toString(), icon: "▦", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { label: "In Stock", value: inStock.toString(), icon: "✓", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { label: "Low Stock", value: lowStock.toString(), icon: "⚠", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Critical Stock", value: critical.toString(), icon: "✕", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  ];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, color, bg, border }) => (
  <div className={`flex-1 min-w-0 rounded-xl border ${border} ${bg} p-4 flex items-center gap-4`}>
    <div className={`w-10 h-10 rounded-lg ${bg} border ${border} flex items-center justify-center text-lg ${color} flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-100 font-mono">{value}</p>
    </div>
  </div>
);

const StockBar = ({ count, max, color }) => {
  const pct = Math.min(Math.round((count / max) * 100), 100);
  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  
  const stockStatus = getStockStatus(product.Stock);
  const stockNum = parseInt(product.Stock) || 0;
  const stockMax = 150;
  const profitNum = parseFloat(product.profit) || 0;
  const marginDir = profitNum >= 0 ? "up" : "down";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-xl border transition-all duration-200 p-4 flex flex-col gap-3 cursor-pointer
        ${hovered
          ? "border-violet-500/40 bg-[#1a1d2e] shadow-lg shadow-violet-900/20"
          : "border-white/8 bg-[#13151f]"
        }`}
    >
      {/* Edit icon */}
      <button 
        onClick={() => onEdit(product)}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-300 transition-colors text-sm"
      >
        ✎
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${getColorForProduct(product.item)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {product.item.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-100 leading-tight">{product.item}</p>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">SKU: {product.item_code}</p>
        </div>
      </div>

      {/* Price + Margin */}
      <div className="flex gap-6">
        <div>
          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-0.5">Price</p>
          <p className="text-lg font-bold text-gray-100 font-mono">₹{product.price}</p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-0.5">Margin</p>
          <p className={`text-lg font-bold font-mono ${marginDir === "up" ? "text-violet-400" : "text-rose-400"}`}>
            {product.profit}%
            <span className="text-xs ml-0.5">{marginDir === "up" ? "↗" : "↘"}</span>
          </p>
        </div>
      </div>

      {/* Stock bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Stock Status</p>
          <span className={`text-[9px] font-mono font-bold border rounded px-1.5 py-0.5 ${stockStatus.badgeClass}`}>
            {stockStatus.label} ({stockNum})
          </span>
        </div>
        <StockBar count={stockNum} max={stockMax} color={stockStatus.color} />
      </div>

      {/* Footer */}
      <div className="flex justify-between pt-1 border-t border-white/5">
        <p className="text-[10px] font-mono text-gray-600">HSN: <span className="text-gray-400">{product.HSN}</span></p>
        <p className="text-[10px] font-mono text-gray-600">GST: <span className="text-gray-400">{product.GST}%</span></p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-white/5">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 py-2 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-300 text-xs font-semibold hover:bg-violet-600/30 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(product._id)}
          className="flex-1 py-2 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-semibold hover:bg-rose-600/30 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryManagement() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`${import.meta.env.VITE_API_URL}/api/auth/getproducts`);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError("Failed to fetch products");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    // TODO: Implement edit functionality
    console.log("Edit product:", product);
    alert(`Edit functionality for ${product.item} - Coming soon!`);
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await apiDelete(`${import.meta.env.VITE_API_URL}/api/auth/deleteproduct/${productId}`);
      
      if (response.ok) {
        // Remove product from state
        setProducts(products.filter(p => p._id !== productId));
        alert("Product deleted successfully!");
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Error deleting product");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.item.toLowerCase().includes(search.toLowerCase()) ||
      p.item_code.toLowerCase().includes(search.toLowerCase())
  );

  const stats = calculateStats(products);

  return (
    <div
      className="min-h-screen bg-[#0e1018] text-gray-200"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", paddingLeft: SIDEBAR_WIDTH }}
    >
      <Sidebar />

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0e1018]/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Inventory Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">Real-time stock tracking and SKU analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-2">
              <span className="text-gray-500 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by SKU, Name..."
                className="bg-transparent outline-none text-sm text-gray-300 placeholder-gray-600 w-44"
              />
            </div>
            {/* Filter icon */}
            <button className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors flex items-center justify-center text-sm">
              ⚙
            </button>
            {/* Bell */}
            <button className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors flex items-center justify-center text-sm">
              🔔
            </button>
            {/* Export */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1d2e] border border-violet-500/30 text-violet-300 text-sm font-semibold hover:bg-violet-600/20 transition-colors">
              ☁ Export CSV
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mb-4"></div>
              <p className="font-mono text-sm">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-rose-400">
              <p className="text-4xl mb-3">⚠</p>
              <p className="font-mono text-sm">{error}</p>
              <button 
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-300 text-sm font-semibold hover:bg-violet-600/30 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Stat Cards */}
              <div className="flex gap-4 mb-8">
                {stats.map((s) => (
                  <StatCard key={s.label} {...s} />
                ))}
              </div>

              {/* Product Grid */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {filtered.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="font-mono text-sm">
                    {search ? `No products found for "${search}"` : "No products available"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}