import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini initialization to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
      }
    }
  }
  return aiClient;
}

// 1. Analyze Spend Endpoint (POST /api/copilot/analyze)
app.post("/api/copilot/analyze", async (req, res) => {
  const { transactions = [], currentBudget = 1500, elapsedDays = 15 } = req.body;

  const totalSpent = transactions.reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
  const totalDaysInMonth = 31;
  const runRate = elapsedDays > 0 ? (totalSpent / elapsedDays) * totalDaysInMonth : totalSpent;
  const isBreaching = runRate > currentBudget;
  const savingsTarget = Math.max(0, runRate - currentBudget);

  // Default smart offline-mode fallback logic
  const defaultInsights = [
    `Current run-rate of $${runRate.toFixed(2)} exceeds your allocated $${currentBudget} cushion limit.`,
    `SaaS subscriptions occupy the largest fraction of fixed monthly leakage (${(
      (transactions.filter((tx: any) => tx.category === "SaaS Subscriptions").reduce((s: number, tx: any) => s + tx.amount, 0) / (totalSpent || 1)) * 100
    ).toFixed(0)}%).`,
    `Immediate downscale of inactive or non-essential ops items can reclaim up to 25% overhead space.`,
  ];

  const defaultTacticalOptimizations = [
    {
      title: "Tactical Resource Reduction",
      description: "Downscale background compute and operation instances by 25% for the remaining 16 days.",
      impact: `Save approx. $${(savingsTarget * 0.4).toFixed(2)} on dynamic hosting charges.`,
    },
    {
      title: "Adjust Threshold Ceiling",
      description: "Amortize the breach by scaling up monthly threshold safely to 115% of projection.",
      impact: `Secures compliance buffer with absolute alignment to current business run-rates.`,
    },
    {
      title: "Temporary Subscription Freezing",
      description: "Freeze low-priority operations, non-essential travel or SaaS licenses during current cycle.",
      impact: `Instant $${(savingsTarget * 0.6).toFixed(2)} locked space recovery from dormant trials.`,
    },
  ];

  const defaultCategories = [
    {
      category: "SaaS Subscriptions",
      status: totalSpent > currentBudget * 0.5 ? "critical" : "optimal",
      analysis: "Continuous operational software accounts for key monthly baseline charges.",
    },
    {
      category: "Operations",
      status: totalSpent > currentBudget * 0.4 ? "warning" : "optimal",
      analysis: "Dynamic billing variables present standard operational creep.",
    },
    {
      category: "Food & Travel",
      status: "optimal",
      analysis: "Consistently remains within designated target bounds.",
    },
    {
      category: "Utilities",
      status: "optimal",
      analysis: "Regulated energy and data pipeline charges are predictable.",
    },
  ];

  const client = getGeminiClient();

  if (!client) {
    // Return high-fidelity mock heuristic values
    return res.json({
      isBreaching,
      runRate,
      projectedSpend: runRate,
      savingsTarget,
      categoryHeuristics: defaultCategories,
      aiInsights: defaultInsights,
      tacticalOptimizations: defaultTacticalOptimizations,
      mode: "Heuristic Search Offline",
    });
  }

  try {
    const prompt = `You are an elite financial operations CFO assistant and spend strategist for finova Spend Copilot. 
Analyze these current enterprise spend metrics:
- Active Spent Aggregate: $${totalSpent.toFixed(2)}
- Current Allocated Monthly Budget Threshold: $${currentBudget.toFixed(2)}
- Months elapsed: ${elapsedDays} out of 31 days.
- Projected monthly run-rate: $${runRate.toFixed(2)}
- Current Overspend Breach Predicted: ${isBreaching ? "YES" : "NO"}
- Savings / Adjustments needed inside cycle: $${savingsTarget.toFixed(2)}

Below is the list of spend ledger items:
${JSON.stringify(transactions, null, 2)}

Please provide a highly polished evaluation in strict JSON format. Deliver the output exactly as a JSON object matching this schema structure:
{
  "isBreaching": boolean,
  "runRate": number,
  "projectedSpend": number,
  "savingsTarget": number,
  "categoryHeuristics": [
    { "category": "SaaS Subscriptions" | "Operations" | "Food & Travel" | "Utilities", "status": "critical" | "warning" | "optimal", "analysis": "Detailed 1-sentence analytics critique" }
  ],
  "aiInsights": [
    "Critique point 1 with actionable insights and metrics",
    "Critique point 2 with detailed numbers",
    "Critique point 3 highlighting exact ledger optimizations"
  ],
  "tacticalOptimizations": [
    { "title": "Tactical Resource Reduction", "description": "Actionable description detailing exactly which item to downscale", "impact": "Projected dollars or target room saved" },
    { "title": "Adjust Threshold Ceiling", "description": "Details about scaling budget limit to cushion predicted run-rate", "impact": "Budget resilience percentage" },
    { "title": "Temporary Subscription Freezing", "description": "Details on pausing dormant non-essential assets", "impact": "Estimated instant cycle space recovery" }
  ]
}

Ensure the response contains ONLY the parseable JSON object without any backticks, markdown markers, or leading text. Just standard JSON format.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    try {
      const parsed = JSON.parse(text);
      return res.json({
        ...parsed,
        mode: "Gemini 3.5 Core Online",
      });
    } catch (parseErr) {
      console.warn("Could not parse JSON response from Gemini, falling back to heuristics:", parseErr, text);
      return res.json({
        isBreaching,
        runRate,
        projectedSpend: runRate,
        savingsTarget,
        categoryHeuristics: defaultCategories,
        aiInsights: [
          `Analysis Mode: Local Smart Hybrid. Projections forecast potential cycle breaches of $${savingsTarget.toFixed(2)}.`,
          ...defaultInsights,
        ],
        tacticalOptimizations: defaultTacticalOptimizations,
        mode: "Gemini Hybrid Fallback",
      });
    }
  } catch (err: any) {
    console.error("Gemini API error in Analyze, fallback used:", err?.message || err);
    return res.json({
      isBreaching,
      runRate,
      projectedSpend: runRate,
      savingsTarget,
      categoryHeuristics: defaultCategories,
      aiInsights: defaultInsights,
      tacticalOptimizations: defaultTacticalOptimizations,
      mode: "Offline local-heuristics engine (Active API error/no connection)",
    });
  }
});

// 2. Chat Copilot Endpoint (POST /api/copilot/chat)
app.post("/api/copilot/chat", async (req, res) => {
  const { message, history = [], transactions = [], budget = 1500, projected = 0 } = req.body;

  const totalSpent = transactions.reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
  const client = getGeminiClient();

  if (!client) {
    // High-quality automated financial chatbot replies
    const msgLower = (message || "").toLowerCase();
    let reply = "Hello! I am your Spend Copilot. Add process.env.GEMINI_API_KEY in Settings to enable real-time dynamic conversational chat.\n\nIn offline mode, here is what I recommend based on your ledger:\n";
    
    if (msgLower.includes("saas") || msgLower.includes("subscription")) {
      reply += `- You have SaaS items in your list. Try downsizing redundant tiers first.\n- Pause subscriptions during weekends if the provider supports daily metering.`;
    } else if (msgLower.includes("overspend") || msgLower.includes("breach") || msgLower.includes("limit")) {
      reply += `- Your active limit is $${budget}.\n- Since projected run-rate is $${projected.toFixed(2)}, I suggest either expanding your limit ceiling to $${(projected * 1.15).toFixed(2)} or using Tactical Resource Reduction to save 25% of hosting charges.`;
    } else {
      reply += `- Current aggregate spent: $${totalSpent.toFixed(2)}\n- Predicted Run-Rate: $${projected.toFixed(2)} against $${budget.toFixed(2)}.\n- Trigger the warning alert on your top gauge to start my 3 Stabilization strategies immediately!`;
    }

    return res.json({
      response: reply,
      generatedAt: new Date().toISOString(),
      mode: "Heuristic Search Offline",
    });
  }

  try {
    const chatPrompt = `You are "Spend Copilot", a high-performance CFO AI agent for finova's spend and cloud re-optimization dashboard.
The user's transaction ledger consists of: ${JSON.stringify(transactions, null, 2)}
Overall user budget: $${budget}. Projected monthly run-rate: $${projected}. Total currently spent: $${totalSpent}.

The user says: "${message}"

Write a concise, professional, tactical reply. Highlight exact transactions if relevant. Suggest realistic optimization cuts. Keep formatting elegant in bullet points where appropriate (use standard Markdown). Stay professional, objective, and extremely helpful.`;

    const chatResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatPrompt,
    });

    return res.json({
      response: chatResponse.text || "I was unable to synthesize a recommendation. Please refine your instruction.",
      generatedAt: new Date().toISOString(),
      mode: "Gemini 3.5 Core Online",
    });
  } catch (err: any) {
    console.error("Gemini API error in Chat:", err?.message || err);
    return res.status(500).json({
      error: "Could not contact Gemini AI service",
      details: err?.message,
    });
  }
});

// Serve assets using Vite or static folder depending on environment
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`finova Spend Copilot server running on http://0.0.0.0:${PORT}`);
});
