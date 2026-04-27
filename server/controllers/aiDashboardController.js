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

Business Data:

Revenue:${revenue}

Profit:${profit}

Sales:${JSON.stringify(sales)}

Stock:${JSON.stringify(stock)}

CustomersPerDay:${JSON.stringify(customersPerDay)}

ProductProfit:${JSON.stringify(productProfit)}

Return JSON with EXACTLY these fields:

{
  "kpis": { "totalRevenue": number, "revenueGrowthPct": number, "totalOrders": number, "ordersGrowthPct": number, "totalCustomers": number, "customersGrowthPct": number, "avgOrderValue": number, "avgOrderGrowthPct": number, "profitMarginPct": number },
  
  "businessInsights": [{ "text": "insight text", "trend": "up|down|neutral" }],
  
  "futureSalesPrediction": {
    "summary": "brief summary paragraph",
    "growthPercent": number,
    "points": ["key point 1", "key point 2", "key point 3"],
    "trendData": [
      {"week": "W1", "actual": number, "predicted": null},
      {"week": "W2", "actual": number, "predicted": null},
      {"week": "W3", "actual": null, "predicted": number},
      {"week": "W4", "actual": null, "predicted": number}
    ]
  },
  
  "stockReplenishment": [{ "product": "name", "daysLeft": number, "action": "restock|watch|ok", "quantity": number, "reason": "brief reason" }],
  
  "productPerformanceAnalysis": {
    "topProducts": [{ "name": "product", "sold": number, "revenue": number, "score": 85, "reason": "why top" }],
    "lowPerformers": [{ "name": "product", "sold": number, "revenue": number, "issue": "issue text" }]
  },
  
  "customerHeatmap": [number, number, ...], // 7 numbers representing customer activity
  
  "profitOptimizationSuggestions": [{ "text": "suggestion", "impact": "high|medium|low" }],
  
  "profitContributionByProduct": [{ "product": "name", "profit": number, "percentage": number }]
}

Return ONLY valid JSON.
`;

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

    // Map Gemini response keys to frontend expected keys
    const ai = {
      kpis: aiData.kpis,
      businessInsights: aiData.businessInsights,
      salesPrediction: aiData.futureSalesPrediction, // Map futureSalesPrediction → salesPrediction
      stockSuggestions: aiData.stockReplenishment,
      productAnalysis: aiData.productPerformanceAnalysis,
      customerHeatmap: aiData.customerHeatmap,
      profitOptimization: aiData.profitOptimizationSuggestions,
      profitContribution: aiData.profitContributionByProduct
    };

    const finalData = {

      revenue,
      profit,
      sales,
      stock,
      customersPerDay,
      productProfit,

      ai

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