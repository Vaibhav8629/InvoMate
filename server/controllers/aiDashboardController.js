const Invoice = require("../models/Invoice");
const Product = require("../models/Product");

const askGemini = require("../services/geminiService");
const { getCache, setCache } = require("../services/aiCache");

exports.getAIDashboardAnalytics = async (req, res) => {

  try {

    const userId = req.user.id;
    const cacheKey = `ai_dashboard_${userId}`;

    const cached = getCache(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const invoices = await Invoice.find({ user: userId });
    const products = await Product.find({ user: userId });

    let revenue = 0;
    let profit = 0;

    const sales = {};
    const customersPerDay = {};
    const productProfit = {};

    invoices.forEach(inv => {

      revenue += Number(inv.total || 0);
      profit += Number(inv.profit || 0);

      const day = inv.date;

      customersPerDay[day] = (customersPerDay[day] || 0) + 1;

      inv.items.forEach(item => {

        const name = item.item;

        sales[name] = (sales[name] || 0) + Number(item.qty || 0);

      });

    });

    const stock = products.map(p => ({
      name: p.item,
      stock: Number(p.Stock)
    }));

    products.forEach(p => {

      productProfit[p.item] = Number(p.profit || 0);

    });

    const prompt = `
You are a business analyst AI for InvoMate. Analyze the data below and return ONLY valid JSON with NO markdown fences, NO explanation.
Data: ${JSON.stringify({
  revenue,
  profit,
  sales,
  stock,
  customersPerDay,
  productProfit,
  invoices: invoices.length,
  products: products.length
})}

Return exactly this shape:
{
  "kpis": { "totalRevenue": ${revenue}, "revenueGrowthPct": 12, "totalOrders": ${invoices.length}, "ordersGrowthPct": 8, "totalCustomers": ${Object.keys(customersPerDay).length}, "customersGrowthPct": 5, "avgOrderValue": ${Math.round(revenue / Math.max(invoices.length, 1))}, "avgOrderGrowthPct": -3, "profitMarginPct": ${Math.round((profit / Math.max(revenue, 1)) * 100)} },
  "businessInsights": [{ "text": "insight text", "trend": "up" }],
  "salesPrediction": {
    "summary": "paragraph", "growthPercent": 9, "points": ["p1","p2","p3"],
    "trendData": [
      {"week":"W1","actual":48000,"predicted":null},{"week":"W2","actual":52000,"predicted":null},
      {"week":"W3","actual":55000,"predicted":null},{"week":"W4","actual":51000,"predicted":null},
      {"week":"W5","actual":null,"predicted":57000},{"week":"W6","actual":null,"predicted":61000}
    ]
  },
  "stockSuggestions": [{"product":"Name","daysLeft":8,"action":"restock","quantity":120,"reason":"brief"}],
  "productAnalysis": {
    "topProducts": [{"name":"P","sold":340,"revenue":85000,"score":88,"reason":"why"}],
    "lowProducts":  [{"name":"P","sold":45,"revenue":9000,"score":28,"issue":"what","suggestion":"fix"}]
  },
  "customerHeatmap": [
    {"day":"Mon","morning":12,"afternoon":28,"evening":18,"night":5},
    {"day":"Tue","morning":9,"afternoon":32,"evening":21,"night":4},
    {"day":"Wed","morning":14,"afternoon":25,"evening":17,"night":6},
    {"day":"Thu","morning":11,"afternoon":30,"evening":24,"night":4},
    {"day":"Fri","morning":19,"afternoon":38,"evening":31,"night":11},
    {"day":"Sat","morning":22,"afternoon":42,"evening":24,"night":16},
    {"day":"Sun","morning":15,"afternoon":20,"evening":13,"night":9}
  ],
  "profitOptimization": [{"idea":"suggestion","impact":"high","category":"pricing"}],
  "profitContribution": [{"product":"Product A","profit":35000,"percentage":35}]
}
Rules: businessInsights >= 7. profitOptimization >= 5. Use real data from the provided business data.`;

    const aiText = await askGemini(prompt);

    let aiData;

    try {
      aiData = JSON.parse(aiText);
    } catch (err) {

      console.log("JSON parse failed, cleaning response");

      const cleaned = aiText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      aiData = JSON.parse(cleaned);
    }

    // Use the response directly since it matches frontend expectations
    const finalData = {
      revenue,
      profit,
      sales,
      stock,
      customersPerDay,
      productProfit,
      ...aiData  // Spread the AI response directly
    };

    setCache(cacheKey, finalData);

    res.json(finalData);

  } catch (error) {

    console.error("AI Dashboard Error:", error);

    res.status(500).json({
      message: "AI Dashboard Failed"
    });

  }
};