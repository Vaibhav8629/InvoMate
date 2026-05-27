// InventoryManagement.jsx
// Requires: Tailwind CSS configured in your project
// Font: Add to index.html → <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import { useAuth } from "../store/auth";

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
      className="relative rounded-xl border transition-all duration-200 p-4 flex flex-col gap-3 cursor-pointer"
      style={{
        background: hovered ? "var(--surface-2)" : "var(--surface)",
        borderColor: hovered ? "rgba(99,102,241,.4)" : "var(--border-subtle)",
        boxShadow: hovered ? "0 12px 24px rgba(79,70,229,0.18)" : "none",
      }}
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
            {product.profit}₹
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
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const gstOptions = [0, 5, 18, 40];
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    item_code: "",
    HSN: "",
    item: "",
    price: "",
    category: "",
    GST: "",
    Stock: "",
    profit: "",
  });

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

  const resetForm = () => {
    setFormData({
      item_code: "",
      HSN: "",
      item: "",
      price: "",
      category: "",
      GST: "",
      Stock: "",
      profit: "",
    });
    setFormError(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogMode("add");
    setEditingProductId(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setFormError(null);
  };

  const handleFormChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const requiredFields = ["item_code", "HSN", "item", "price", "category", "GST", "Stock", "profit"];
    const missing = requiredFields.filter((key) => !String(formData[key]).trim());
    if (missing.length > 0) {
      setFormError("Please fill in all fields.");
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      GST: Number(formData.GST),
      Stock: Number(formData.Stock),
      profit: Number(formData.profit),
    };

    try {
      setIsSubmitting(true);

      if (dialogMode === "add") {
        const response = await apiPost(
          `${import.meta.env.VITE_API_URL}/api/auth/addproducts`,
          payload
        );

        if (!response.ok) {
          const message = response.status === 400
            ? "Invalid product details."
            : "Failed to add product.";
          setFormError(message);
          return;
        }

        const created = await response.json();
        setProducts((prev) => [created, ...prev]);
        closeDialog();
        return;
      }

      const response = await apiPut(
        `${import.meta.env.VITE_API_URL}/api/auth/updateproduct`,
        { _id: editingProductId, ...payload }
      );

      if (!response.ok) {
        const message = response.status === 400
          ? "Invalid product details."
          : "Failed to update product.";
        setFormError(message);
        return;
      }

      setProducts((prev) => prev.map((p) => (
        p._id === editingProductId ? { ...p, ...payload } : p
      )));
      closeDialog();
    } catch (err) {
      console.error("Error saving product:", err);
      setFormError("Error connecting to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      item_code: product.item_code ?? "",
      HSN: product.HSN ?? "",
      item: product.item ?? "",
      price: product.price ?? "",
      category: product.category ?? "",
      GST: product.GST ?? "",
      Stock: product.Stock ?? "",
      profit: product.profit ?? "",
    });
    setDialogMode("edit");
    setEditingProductId(product._id);
    setFormError(null);
    setIsDialogOpen(true);
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

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleExportCSV = () => {
    if (!products || products.length === 0) {
      alert("No products available to export");
      return;
    }

    const headers = [
      "Sr. No.",
      "Item Code",
      "Product Name",
      "HSN Code",
      "Category",
      "Price",
      "GST %",
      "Stock Quantity"
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = products.map((product, idx) => [
      idx + 1,
      product.item_code || '',
      product.item || '',
      product.HSN || '',
      product.category || '',
      product.price || 0,
      product.GST || 0,
      product.Stock || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", `products-report-${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", paddingLeft: SIDEBAR_WIDTH, background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Sidebar onLogout={handleLogout} />

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-8 py-4 border-b border-white/5 backdrop-blur-md sticky top-0 z-10"
          style={{ background: "var(--surface)", borderColor: "var(--border-subtle)" }}
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Inventory Management</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Real-time stock tracking and SKU analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
            >
              <span className="text-gray-500 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by SKU, Name..."
                className="bg-transparent outline-none text-sm text-gray-300 placeholder-gray-600 w-44"
              />
            </div>
            {/* Bell */}
            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-500/30 text-violet-300 text-sm font-semibold hover:bg-violet-600/20 transition-colors"
              style={{ background: "var(--surface-2)" }}
            >
              ☁ Export CSV
            </button>
            {/* Add Product */}
            <button
              onClick={openAddDialog}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-200 text-sm font-semibold hover:bg-violet-600/30 transition-colors"
            >
              ＋ Add Item
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

      {/* Add Product Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm" style={{ background: "var(--overlay)" }}>
          <div className="w-full max-w-2xl mx-4 rounded-2xl border shadow-2xl" style={{ background: "var(--surface)", borderColor: "var(--border-subtle)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">
                  {dialogMode === "add" ? "New Product" : "Update Product"}
                </p>
                <h2 className="text-xl font-semibold text-white">
                  {dialogMode === "add" ? "Add Inventory Item" : "Edit Inventory Item"}
                </h2>
              </div>
              <button
                onClick={closeDialog}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                    Item Code
                  </label>
                  <input
                    type="text"
                    value={formData.item_code}
                    onChange={handleFormChange("item_code")}
                    placeholder="SKU-1029"
                    className="w-full rounded-lg px-3 py-2 text-sm placeholder-gray-600 outline-none focus:border-violet-500/60"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                    HSN
                  </label>
                  <input
                    type="text"
                    value={formData.HSN}
                    onChange={handleFormChange("HSN")}
                    placeholder="8471"
                    className="w-full rounded-lg px-3 py-2 text-sm placeholder-gray-600 outline-none focus:border-violet-500/60"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={formData.item}
                    onChange={handleFormChange("item")}
                    placeholder="Wireless Keyboard"
                    className="w-full rounded-lg px-3 py-2 text-sm placeholder-gray-600 outline-none focus:border-violet-500/60"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={handleFormChange("category")}
                    placeholder="Accessories"
                    className="w-full rounded-lg px-3 py-2 text-sm placeholder-gray-600 outline-none focus:border-violet-500/60"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleFormChange("price")}
                    placeholder="1499"
                    className="w-full rounded-lg px-3 py-2 text-sm placeholder-gray-600 outline-none focus:border-violet-500/60"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                    GST (%)
                  </label>
                  <select
                    value={formData.GST}
                    onChange={handleFormChange("GST")}
                    className="w-full rounded-lg px-3 py-2 text-sm placeholder-gray-600 outline-none focus:border-violet-500/60"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  >
                    <option value="" disabled>
                      Select GST
                    </option>
                    {gstOptions.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}%
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.Stock}
                    onChange={handleFormChange("Stock")}
                    placeholder="120"
                    className="w-full rounded-lg px-3 py-2 text-sm placeholder-gray-600 outline-none focus:border-violet-500/60"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                    Profit (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.profit}
                    onChange={handleFormChange("profit")}
                    placeholder="22"
                    className="w-full rounded-lg px-3 py-2 text-sm placeholder-gray-600 outline-none focus:border-violet-500/60"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              {formError && (
                <p className="mt-4 text-sm text-rose-400 font-mono">{formError}</p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-violet-600/30 border border-violet-500/50 text-violet-200 text-sm font-semibold hover:bg-violet-600/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Saving..."
                    : dialogMode === "add"
                      ? "Save Item"
                      : "Update Item"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}