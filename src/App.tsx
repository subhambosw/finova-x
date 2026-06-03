import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  X,
  Plus,
  Send,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Sparkles,
  Layers,
  Calendar,
  Trash2,
  Lock,
  Unlock,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import {
  Transaction,
  TransactionCategory,
  SpendAnalysis,
  CopilotMessage,
  CategoryHeuristic,
  TacticalOptimization
} from "./types";

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    label: "AWS Cloud Compute (us-east-1)",
    amount: 14500.0,
    category: "SaaS Subscriptions",
    date: "2026-05-12",
    isFrozen: false
  },
  {
    id: "tx-2",
    label: "Snowflake Cloud Data Warehouse",
    amount: 8900.0,
    category: "Operations",
    date: "2026-05-10",
    isFrozen: false
  },
  {
    id: "tx-3",
    label: "OpenAI API Platform billing",
    amount: 3400.0,
    category: "Operations",
    date: "2026-05-08",
    isFrozen: false
  },
  {
    id: "tx-4",
    label: "Corporate Travel - NYC Conf",
    amount: 2120.45,
    category: "Food & Travel",
    date: "2026-05-11",
    isFrozen: false
  },
  {
    id: "tx-5",
    label: "GitHub Enterprise seats",
    amount: 1450.0,
    category: "SaaS Subscriptions",
    date: "2026-05-05",
    isFrozen: false
  },
  {
    id: "tx-6",
    label: "Datadog Diagnostics Pro",
    amount: 1200.0,
    category: "SaaS Subscriptions",
    date: "2026-05-15",
    isFrozen: false
  },
  {
    id: "tx-7",
    label: "HQ Fiber Gigabit Internet",
    amount: 600.0,
    category: "Utilities",
    date: "2026-05-01",
    isFrozen: false
  }
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-cyan-500/30 p-2.5 rounded shadow-[0_10px_30px_rgba(255,255,255,0.08)] backdrop-blur-md">
        <p className="text-[10px] font-black uppercase text-cyan-400 tracking-wider mb-1.5">{label}</p>
        <div className="space-y-1 text-xs">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-400">{entry.name}:</span>
              </span>
              <span className="font-mono font-bold text-slate-100">${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface Toast {
  id: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
}

export default function App() {
  // Application states
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budget, setBudget] = useState<number>(30000); // Customizable active threshold
  const [elapsedDays, setElapsedDays] = useState<number>(15); // Dynamic elapsed day count
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedStrategy, setSelectedStrategy] = useState<
    "reduction" | "ceiling" | "freeze" | null
  >(null);

  // Chat window states
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg-1",
      sender: "copilot",
      text: "Hello! I am your **Spend Copilot**. I have parsed your transaction aggregate. You are currently projected to exceed your standard threshold due to peak hosting and operational data warehousing spikes under your SaaS metrics. How can I assist you in optimizing your operational costs today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Back-end intelligence metrics and fallbacks
  const [analysis, setAnalysis] = useState<SpendAnalysis>({
    isBreaching: true,
    runRate: 66485.59,
    projectedSpend: 66485.59,
    savingsTarget: 36485.59,
    categoryHeuristics: [
      {
        category: "SaaS Subscriptions",
        status: "critical",
        analysis: "Autonomous tooling is scaling costs exponentially over baseline metrics."
      },
      {
        category: "Operations",
        status: "critical",
        analysis: "High usage warehousing and custom LLM API prompts contribute to the current overage prediction."
      },
      {
        category: "Food & Travel",
        status: "optimal",
        analysis: "Conference schedules are under strict containment."
      },
      {
        category: "Utilities",
        status: "optimal",
        analysis: "Gigabit infrastructure baseline charges are locked and stable."
      }
    ],
    aiInsights: [
      "Aggregate run-rate exceeds your threshold budget trigger by 121%.",
      "Dynamic compute limits in SaaS index are causing a compounding breach hazard.",
      "Re-optimization suggests downscaling non-critical operational clusters to salvage cycle headroom."
    ],
    tacticalOptimizations: [
      {
        title: "Tactical Resource Reduction",
        description: "Downscale SaaS background computational cycles by 25% for the rest of current cycle.",
        impact: "Reduces run-rate by approximately $4,280.00 instantly."
      },
      {
        title: "Adjust Threshold Ceiling",
        description: "Safes configuration parameters by raising target limits to 115% of actual projections.",
        impact: "Resets breach alarms while establishing realistic buffer safety."
      },
      {
        title: "Temporary Subscription Freezing",
        description: "Enforce lockouts on high-leakage SaaS subscriptions to instantly freeze active daily outflows.",
        impact: "Freezes dynamic baseline SaaS subscriptions, saving up to $17,150.00."
      }
    ],
    mode: "Internal Engine V2"
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Spent list inputs
  const [newLabel, setNewLabel] = useState<string>("");
  const [newAmount, setNewAmount] = useState<string>("");
  const [newCategory, setNewCategory] = useState<TransactionCategory>("SaaS Subscriptions");
  const [newDate, setNewDate] = useState<string>("2026-05-20");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtered transactions by label or vendor name in real-time
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) =>
      tx.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  // Custom Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "warning" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Scroll ref for chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Financial calculations
  const activeAggregate = transactions.reduce(
    (sum, tx) => sum + (tx.isFrozen ? 0 : tx.amount),
    0
  );
  const totalDaysInMonth = 31;
  const projectedRunRate =
    elapsedDays > 0 ? (activeAggregate / elapsedDays) * totalDaysInMonth : activeAggregate;
  const isCurrentlyBreaching = projectedRunRate > budget;
  const savingsRequired = Math.max(0, projectedRunRate - budget);

  // Generate 30-day projection chart dataset
  const chartData = React.useMemo(() => {
    const data = [];
    const dailyRate = elapsedDays > 0 ? activeAggregate / elapsedDays : 0;
    
    for (let day = 1; day <= 31; day++) {
      // Historical spend is accumulated up to the elapsedDays
      const historicalAmount = day <= elapsedDays ? Math.round(dailyRate * day) : null;
      // Projected spend goes for all 31 days
      const projectedAmount = Math.round(dailyRate * day);
      
      data.push({
        day: `Day ${day}`,
        "Historical Spent": historicalAmount !== null ? historicalAmount : undefined,
        "Projected Runway": projectedAmount,
        "Ceiling limit": budget
      });
    }
    return data;
  }, [activeAggregate, elapsedDays, budget]);

  // Trigger analysis when items, elapsed days, or budget limits change
  useEffect(() => {
    fetchAnalysis();
  }, [transactions, budget, elapsedDays]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/copilot/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions,
          currentBudget: budget,
          elapsedDays
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        throw new Error("Analysis endpoint error fallback used");
      }
    } catch (e) {
      console.warn("Utilizing high-perf UI diagnostics fallback:", e);
      // Construct dynamic fallback indicators using math
      const runRateMath = elapsedDays > 0 ? (activeAggregate / elapsedDays) * 31 : activeAggregate;
      const isOver = runRateMath > budget;
      const discrepancy = Math.max(0, runRateMath - budget);

      setAnalysis({
        isBreaching: isOver,
        runRate: runRateMath,
        projectedSpend: runRateMath,
        savingsTarget: discrepancy,
        categoryHeuristics: [
          {
            category: "SaaS Subscriptions",
            status: activeAggregate > budget * 0.4 ? "critical" : "optimal",
            analysis: "Baseline SaaS tool subscriptions capture the largest chunk of fixed cycles."
          },
          {
            category: "Operations",
            status: activeAggregate > budget * 0.3 ? "warning" : "optimal",
            analysis: "Operational data pipelines and APIs fluctuate with current transaction trends."
          },
          {
            category: "Food & Travel",
            status: "optimal",
            analysis: "Travel aggregate maintains structural containment compliance parameters."
          },
          {
            category: "Utilities",
            status: "optimal",
            analysis: "Secured enterprise networking and energy components exhibit no drift."
          }
        ],
        aiInsights: [
          `Active aggregate spent is currently $${activeAggregate.toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}.`,
          isOver
            ? `WARNING: End-of-month run-rate is projected to exceed current limit by $${discrepancy.toLocaleString(
                undefined,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}.`
            : `System optimal. Estimated cycle run-rate remains safely below set criteria borders.`,
          "AI analytics proposes testing Temporary Subscription Freezing to unlock fast cycle gains."
        ],
        tacticalOptimizations: [
          {
            title: "Tactical Resource Reduction",
            description: "Scale back SaaS dynamic compute clusters to 75% for the remaining period.",
            impact: `Estimated mitigation: $${(discrepancy * 0.4).toLocaleString(
              undefined,
              { maximumFractionDigits: 2 }
            )} cycle buffer recovery`
          },
          {
            title: "Adjust Threshold Ceiling",
            description: "Adapt financial boundaries dynamically by elevating the threshold ceiling to 115% of run-rate projection.",
            impact: `Establishes safe operating space with optimized metric triggers`
          },
          {
            title: "Temporary Subscription Freezing",
            description: "Place high priority lock and freeze on selected monthly SaaS platform licenses.",
            impact: "Bypass baseline SaaS charges completely to achieve instant cash preservation"
          }
        ],
        mode: "Heuristic Solver V2.4"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newAmount) {
      addToast("Please fulfill both label and amount inputs.", "warning");
      return;
    }
    const val = parseFloat(newAmount);
    if (isNaN(val) || val <= 0) {
      addToast("Amount must represent a positive real number.", "warning");
      return;
    }

    const item: Transaction = {
      id: "tx-" + Math.random().toString(36).substring(2, 9),
      label: newLabel,
      amount: val,
      category: newCategory,
      date: newDate,
      isFrozen: false
    };

    setTransactions((prev) => [item, ...prev]);
    addToast(`Added expenditure: ${newLabel} ($${val.toLocaleString()})`, "success");
    setNewLabel("");
    setNewAmount("");
  };

  const removeTransaction = (id: string, label: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    addToast(`Transaction successfully removed: ${label}`, "info");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: CopilotMessage = {
      id: "msg-user-" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    const originalInput = inputMessage;
    setInputMessage("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: originalInput,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          transactions,
          budget,
          projected: projectedRunRate
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: "msg-copilot-" + Math.random().toString(36).substring(2, 9),
            sender: "copilot",
            text: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error("Chat service error fallback");
      }
    } catch (err) {
      // Offline fallback text based on prompts
      setTimeout(() => {
        let reply = "I am operating in offline-assistance mode. Based on current parameters:\n\n";
        const msgClean = originalInput.toLowerCase();
        if (msgClean.includes("save") || msgClean.includes("reduce") || msgClean.includes("cut")) {
          reply += `To secure the needed **$${savingsRequired.toLocaleString(undefined, { minimumFractionDigits: 2 })}** savings target, you should evaluate the **Subscription Freeze** option. This will exclude the continuous baseline expense items labeled under SaaS Subscriptions dynamically.`;
        } else if (msgClean.includes("unfreeze") || msgClean.includes("reset")) {
          reply += "Understood. You can reset or toggle frozen states manually inside the main Spend Ledger itemized table instantly.";
        } else {
          reply += `Current total aggregate spend stands at **$${activeAggregate.toLocaleString(undefined, { minimumFractionDigits: 2 })}** over **${elapsedDays} elapsed days**. The resulting run-rate projection of **$${projectedRunRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}** requires active stabilization maneuvers. Please tap on the warning controls overlay to trigger auto-re-optimization!`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: "msg-copilot-fallback-" + Math.random().toString(36).substring(2, 9),
            sender: "copilot",
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 700);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Execution of the chosen re-optimization strategy
  const executeStabilization = () => {
    if (!selectedStrategy) {
      addToast("Please select one stabilization strategy to execute.", "warning");
      return;
    }

    if (selectedStrategy === "reduction") {
      // Downscale SaaS and Operations costs dynamically by 25% for remainder of cycle. 
      // We do this by applying a 25% discount to all current SaaS & Operations items!
      const updated = transactions.map((tx) => {
        if (tx.category === "SaaS Subscriptions" || tx.category === "Operations") {
          return { ...tx, amount: Number((tx.amount * 0.75).toFixed(2)) };
        }
        return tx;
      });
      setTransactions(updated);
      addToast("Executed Resource Reduction: All SaaS & Operations downscaled by 25%!", "success");
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-exec-" + Math.random().toString(),
          sender: "copilot",
          text: "🚀 **Tactical Resource Reduction Implemented Successfully.** All cloud server tiers and background data warehousing clusters have been downsized by 25%. Active expenditures are reduced, stabilizing the projected deficit.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (selectedStrategy === "ceiling") {
      // Safes the breach by raising current limit budget to 115% of the projected run-rate
      const calculatedNewCeiling = Math.ceil(projectedRunRate * 1.15);
      setBudget(calculatedNewCeiling);
      addToast(`Ceiling limit safely adjusted to $${calculatedNewCeiling.toLocaleString()}!`, "success");
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-exec-" + Math.random().toString(),
          sender: "copilot",
          text: `📈 **Threshold Ceiling Calibrated.** Raised quota parameters safely to $${calculatedNewCeiling.toLocaleString()} (115% of forecast run-rate) to absorb ongoing cycles with zero downtime security boundaries.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (selectedStrategy === "freeze") {
      // Disable premium SaaS background service charges (flag them as frozen)
      const updated = transactions.map((tx) => {
        if (tx.category === "SaaS Subscriptions") {
          return { ...tx, isFrozen: true };
        }
        return tx;
      });
      setTransactions(updated);
      addToast("Temporary Ice Lockout: Excluded SaaS subscriptions from active totals!", "success");
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-exec-" + Math.random().toString(),
          sender: "copilot",
          text: "❄️ **SaaS Subscription Lock Enacted.** Suspended all SaaS subscription renewals and seated licenses temporarily. Their associated charges have been temporarily nullified to save cash flow immediately.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }

    setIsDrawerOpen(false);
  };

  // Toggle frozen status of a single transaction
  const toggleFreezeTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          const nextState = !tx.isFrozen;
          addToast(
            nextState
              ? `Temporarily froze license: ${tx.label}`
              : `Restructured transaction cycle: ${tx.label}`,
            nextState ? "warning" : "success"
          );
          return { ...tx, isFrozen: nextState };
        }
        return tx;
      })
    );
  };

  // Reset entire dashboard parameters to default for sandbox testing convenience
  const handleResetParameters = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudget(30000);
    setElapsedDays(15);
    setSelectedStrategy(null);
    addToast("All expenditures and simulation params reset to default.", "info");
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-white relative">
      {/* Floating high-fidelity glass toaster notifications */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded border overline-card shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-md flex items-start gap-3 ${
                t.type === "success"
                  ? "border-[#39ff14]/30 bg-slate-900/90 text-slate-100 border-t-4 border-t-emerald-500"
                  : t.type === "warning"
                  ? "border-yellow-500/30 bg-slate-900/90 text-slate-100 border-t-4 border-t-yellow-500"
                  : t.type === "error"
                  ? "border-red-500/30 bg-slate-900/90 text-slate-100 border-t-4 border-t-red-500"
                  : "border-cyan-500/30 bg-slate-900/90 text-slate-100 border-t-4 border-t-cyan-500"
              }`}
            >
              {t.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-[#39ff14] shrink-0 mt-0.5" />
              ) : t.type === "warning" ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              ) : t.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <p className="font-bold leading-normal">{t.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Decorative ambient light grid overlays as requested in Frosted Glass design template */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.8),rgba(2,6,23,0.95))] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-transparent pointer-events-none border-[12px] border-slate-950/40 z-40" />

      {/* Main Structural Wrapper Container */}
      <div className="max-w-[1300px] w-full mx-auto p-4 md:p-6 flex flex-col space-y-5 flex-1 select-none md:select-text">
        {/* Header Block with high accents and diagnostic identifiers */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-2">
                FINOVA <span className="text-cyan-400 font-normal">X SPEND COPILOT</span>
              </h1>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                Active Stability Guard
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
              AI Re-optimization Spend Engine // System-wide Control Center V2.4.0-STABLE
            </p>
          </div>

          {/* Quick Simulation Parameter sliders for interactive user testing */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 bg-slate-900/60 p-3 rounded border border-white/5 backdrop-blur-sm">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                Cycle Progress (Days Elapsed)
              </span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min="1"
                  max="31"
                  value={elapsedDays}
                  onChange={(e) => setElapsedDays(Number(e.target.value))}
                  className="accent-cyan-400 w-28 cursor-pointer h-1.5 rounded-lg bg-slate-700"
                />
                <span className="text-xs font-mono font-bold text-[#39ff14]">
                  {elapsedDays} / 31 Days
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase font-bold flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-400" />
                Monthly Limit Criteria
              </span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value.replace(/[^0-9]/g, ""));
                    setBudget(isNaN(parsed) ? 0 : parsed);
                  }}
                  className="bg-slate-950/80 border border-white/10 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-cyan-400/80 w-20 text-center"
                />
                <span className="text-[10px] text-sky-400 font-mono">USD</span>
              </div>
            </div>

            <button
              onClick={handleResetParameters}
              title="Reset configuration defaults"
              className="text-xs border border-white/10 hover:border-cyan-500/40 bg-slate-800/80 hover:bg-slate-800 text-cyan-400 p-2 rounded transition-all duration-150 flex items-center justify-center cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Dashboard Panels Layout Grid */}
        <main className="grid grid-cols-12 gap-6 items-stretch">
          {/* Left Wing Actions Area (Core metrics and LED table ledger list) */}
          <section className="col-span-12 xl:col-span-8 flex flex-col space-y-5">
            {/* 3 Metric Cards row conforming to exact PRD specs and Frosted Glass layouts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Active Spending Aggregate */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="overline-card bg-slate-900/40 backdrop-blur-md p-4 flex flex-col justify-between h-34 rounded-sm transition-all duration-205 hover:border-cyan-500/40"
              >
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                    Active Expenditures Aggregate
                  </p>
                  <h2 className="text-3xl font-bold font-mono tracking-tight text-white mt-1">
                    $
                    {activeAggregate.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </h2>
                </div>
                <div className="mt-2 text-[10px] flex items-center justify-between text-slate-400">
                  <span>Usage of criteria ceiling</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {budget > 0 ? ((activeAggregate / budget) * 100).toFixed(1) : 100}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, budget > 0 ? (activeAggregate / budget) * 100 : 100)}%` }}
                  />
                </div>
              </motion.div>

              {/* Card 2: Monthly Threshold Gauge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="overline-card bg-slate-900/40 backdrop-blur-md p-4 flex flex-col justify-between h-34 rounded-sm transition-all duration-205 hover:border-cyan-500/40"
              >
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                    Monthly Threshold Gauge
                  </p>
                  <h2 className="text-3xl font-bold font-mono tracking-tight mt-1">
                    $
                    {budget.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </h2>
                </div>
                <div className="mt-2 text-[10px] flex flex-col gap-1">
                  {isCurrentlyBreaching ? (
                    <span className="text-rose-400 font-black flex items-center gap-1 uppercase">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                      Predicted Limit Breach
                    </span>
                  ) : (
                    <span className="text-[#39ff14] font-bold flex items-center gap-1 uppercase tracking-wider">
                      <TrendingDown className="w-3.5 h-3.5 text-[#39ff14]" />
                      {(100 - (activeAggregate / budget) * 100).toFixed(1)}% Headroom remaining
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Card 3: Projected Run Rate Forecaster (With extreme highlight fluorescent styling and active warning overlays) */}
              <motion.div
                onClick={() => setIsDrawerOpen(true)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className={`overline-card p-4 h-34 rounded-sm flex flex-col justify-between cursor-pointer transition-all duration-205 hover:-translate-y-0.5 relative group ${
                  isCurrentlyBreaching
                    ? "bg-white/5 border-[#39ff14]/70 shadow-[0_0_20px_rgba(57,255,20,0.18)] border-b-[#39ff14] border-x-[#39ff14]"
                    : "bg-slate-900/40 backdrop-blur-md hover:border-cyan-500/40"
                }`}
                style={isCurrentlyBreaching ? { boxShadow: "0 10px 30px rgba(255, 255, 255, 0.08)" } : {}}
              >
                <div className="flex justify-between items-start">
                  <p
                    className={`text-[10px] uppercase font-black tracking-wider ${
                      isCurrentlyBreaching ? "text-[#39ff14] neon-glow font-bold" : "text-cyan-400"
                    }`}
                  >
                    Projected Run-rate Forecaster
                  </p>
                  {isCurrentlyBreaching && (
                    <div className="bg-[#39ff14] text-black text-[9px] px-1.5 py-0.5 font-sans font-black uppercase rounded tracking-tight shadow-[0_0_8px_rgba(57,255,20,1)]">
                      BREACH HAZARD
                    </div>
                  )}
                </div>

                <div className="mt-1">
                  <h2
                    className={`text-3xl font-black font-mono tracking-tight ${
                      isCurrentlyBreaching ? "text-[#39ff14] neon-glow" : "text-slate-100"
                    }`}
                  >
                    $
                    {projectedRunRate.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </h2>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span className={isCurrentlyBreaching ? "text-slate-300" : "text-slate-400"}>
                    {isCurrentlyBreaching
                      ? `Breach forecast around Day ${Math.min(
                          30,
                          Math.max(1, Math.round((budget / (activeAggregate || 1)) * elapsedDays))
                        )}`
                      : "No immediate threats flagged"}
                  </span>
                  <span className="text-[9px] text-cyan-400 group-hover:underline underline-offset-2 tracking-tight uppercase flex items-center gap-1 font-bold">
                    Stabilize Now →
                  </span>
                </div>

                {isCurrentlyBreaching && (
                  <div className="absolute inset-x-0 -bottom-1 h-1 bg-[#39ff14] animate-pulse rounded-b-sm" />
                )}
              </motion.div>
            </div>

            {/* Interactive Monthly Forecast Recharts visualizer */}
            <div className="overline-card bg-slate-900/40 backdrop-blur-md p-5 rounded-sm border border-white/5 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Month-to-Date Predictive Model
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase mt-0.5">
                    30-Day predictive projection trajectory vs active budget ceiling
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono whitespace-nowrap bg-slate-950/40 px-2 py-1 rounded border border-white/5">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-1.5 rounded-xs" style={{ backgroundColor: '#22d3ee' }} />
                    <span className="text-slate-400">HISTORICAL SPEND</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-1.5 rounded-xs" style={{ backgroundColor: '#39ff14' }} />
                    <span className="text-slate-400 font-bold text-[#39ff14]">PROJECTED RUNWAY</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-1.5 rounded-xs" style={{ backgroundColor: '#f43f5e' }} />
                    <span className="text-slate-400">BUDGET CEILING</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full text-xs text-slate-400 font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 12, right: 12, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="rgba(255, 255, 255, 0.3)" 
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      dy={8}
                    />
                    <YAxis 
                      stroke="rgba(255, 255, 255, 0.3)" 
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="Historical Spent" 
                      stroke="#22d3ee" 
                      strokeWidth={2.5} 
                      dot={false}
                      activeDot={{ r: 4, stroke: "#22d3ee", strokeWidth: 1 }}
                      connectNulls
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Projected Runway" 
                      stroke="#39ff14" 
                      strokeWidth={1.5} 
                      strokeDasharray="4 4"
                      dot={false}
                      connectNulls
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Ceiling limit" 
                      stroke="#f43f5e" 
                      strokeWidth={1.5} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dynamic Ledger Control Section */}
            <div className="overline-card bg-slate-900/40 backdrop-blur-md rounded-sm overflow-hidden flex flex-col border border-white/5 shadow-md">
              {/* Form & Ledger Action Header */}
              <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                    Dynamic Expenditure Ledger list
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase mt-0.5">
                    Live database feeds and custom input modifications
                  </p>
                </div>
                {/* Real-time search/filter input field */}
                <div className="relative w-full md:w-72">
                  <span className="absolute left-2.5 top-2 text-cyan-500/60 font-mono text-[9px] uppercase font-bold">Search:</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by label or vendor name..."
                    className="bg-slate-950/85 border border-cyan-500/20 text-slate-100 placeholder-slate-500 text-xs rounded py-1.5 pl-14 pr-7 focus:outline-none focus:border-cyan-400 w-full transition-all duration-150 h-8 font-mono select-text"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-cyan-400 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Add Custom Expensed Item Form */}
              <form
                onSubmit={addTransaction}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-950/60 border-b border-cyan-500/10 text-xs text-white"
              >
                <div className="sm:col-span-4 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    Spending Label / Vendor name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vercel Premium Hosting"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="bg-slate-900/90 border border-cyan-500/25 px-3 py-2 rounded-sm focus:outline-none focus:border-cyan-400 text-slate-100 placeholder-slate-500"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-cyan-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      placeholder="1250"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="bg-slate-900/90 border border-cyan-500/25 pl-6 pr-3 py-2 rounded-sm focus:outline-none focus:border-cyan-400 text-slate-100 placeholder-slate-500 w-full font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    Category Classifier
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TransactionCategory)}
                    className="bg-slate-900/90 border border-cyan-500/25 px-3 py-2 rounded-sm focus:outline-none focus:border-cyan-400 text-slate-100"
                  >
                    <option value="SaaS Subscriptions">SaaS Subscriptions</option>
                    <option value="Operations">Operations</option>
                    <option value="Food & Travel">Food & Travel</option>
                    <option value="Utilities">Utilities</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    Date Record
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-slate-900/90 border border-cyan-500/25 px-3 py-2 rounded-sm focus:outline-none focus:border-cyan-400 text-slate-100 cursor-pointer font-mono"
                  />
                </div>

                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-[#0c1e3e] hover:bg-[#12284e] text-white border border-cyan-500/40 hover:border-cyan-400 text-[10px] uppercase font-black tracking-wider py-2.5 rounded-sm transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Post</span>
                  </button>
                </div>
              </form>

              {/* Transactions Ledger Table */}
              <div className="overflow-x-auto flex-1 max-h-[360px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c1e3e]/70 text-cyan-400 uppercase font-black border-b border-cyan-500/20 text-[10px] tracking-wider sticky top-0 backdrop-blur-md z-12">
                    <tr>
                      <th className="p-3">Label Descriptor</th>
                      <th className="p-3">Category Group</th>
                      <th className="p-3">Billing Date</th>
                      <th className="p-3 text-right">Raw Cost</th>
                      <th className="p-3 text-center">Status Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                          No active spend logs detected in current workspace cache.
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-cyan-500/80 font-mono font-bold">
                          No transaction records matching "{searchQuery}" filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className={`hover:bg-slate-900/60 transition-colors ${
                            tx.isFrozen ? "bg-[#0c1e3e]/20 text-slate-500" : ""
                          }`}
                        >
                          <td className="p-3 font-bold flex items-center gap-2">
                            {tx.isFrozen ? (
                              <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                            )}
                            <span className={tx.isFrozen ? "line-through text-slate-500" : "text-slate-100"}>
                              {tx.label}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border ${
                                tx.category === "SaaS Subscriptions"
                                  ? "bg-indigo-950/40 text-rose-300 border-indigo-500/20"
                                  : tx.category === "Operations"
                                  ? "bg-sky-950/40 text-amber-300 border-sky-500/20"
                                  : tx.category === "Food & Travel"
                                  ? "bg-slate-900 text-slate-300 border-white/5"
                                  : "bg-emerald-950/40 text-emerald-300 border-emerald-500/20"
                              }`}
                            >
                              {tx.category}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-white/50">{tx.date}</td>
                          <td className="p-3 text-right font-mono font-bold">
                            {tx.isFrozen ? (
                              <span className="text-cyan-400 pr-1 text-[11px] font-black italic">
                                [FROZEN]
                              </span>
                            ) : (
                              <span className="text-slate-100">${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Freeze Lock Toggle Action */}
                              <button
                                onClick={() => toggleFreezeTransaction(tx.id)}
                                title={tx.isFrozen ? "Unfreeze transaction charges" : "Temporarily freeze license costs"}
                                className={`p-1.5 rounded-sm border transition-all ${
                                  tx.isFrozen
                                    ? "bg-[#39ff14]/10 border-[#39ff14]/30 hover:border-[#39ff14] text-[#39ff14]"
                                    : "bg-slate-850 border-white/10 hover:border-cyan-400 text-slate-400 hover:text-cyan-400"
                                } cursor-pointer`}
                              >
                                {tx.isFrozen ? (
                                  <Unlock className="w-3 h-3" />
                                ) : (
                                  <Lock className="w-3 h-3" />
                                )}
                              </button>

                              {/* Remove Action */}
                              <button
                                onClick={() => removeTransaction(tx.id, tx.label)}
                                title="Remove item permanently"
                                className="p-1.5 bg-slate-850 hover:bg-rose-955/20 border border-white/10 hover:border-rose-500 text-slate-400 hover:text-rose-400 rounded-sm transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Right Wing Assistant & Analyser (Chat Copilot + Live AI Analysis Panel) */}
          <aside className="col-span-12 xl:col-span-4 flex flex-col space-y-5">
            {/* Real-time Copilot Panel */}
            <div className="overline-card bg-slate-900/40 backdrop-blur-md p-5 rounded-sm border border-white/5 flex flex-col h-[460px]">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#39ff14] shadow-[0_0_10px_#39ff14]" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#39ff14] animate-ping opacity-60" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#39ff14]">
                      Spend Copilot
                    </h3>
                    <p className="text-[9px] text-white/30 font-bold uppercase">
                      Core Strategy Agent Active
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-mono border border-cyan-500/30 px-1.5 py-0.5 bg-cyan-950/50 rounded text-cyan-400">
                    {analysis.mode}
                  </span>
                </div>
              </div>

              {/* Chat Thread Area */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs select-text">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-sm leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#0c1e3e]/70 border border-cyan-500/20 ml-6 text-slate-100"
                        : "bg-white/5 border border-white/10 mr-6 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 opacity-40 text-[9px] uppercase font-bold tracking-tight">
                      <span>{m.sender === "user" ? "Administrator" : "Spend Copilot CFO"}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    {/* Basic safe bullet point sanitizer for markdown rendering in react */}
                    <div className="space-y-1.5">
                      {m.text.split("\n").map((line, idx) => {
                        if (line.startsWith("- ") || line.startsWith("* ")) {
                          return (
                            <li key={idx} className="list-disc list-inside pl-1 text-slate-200">
                              {line.substring(2)}
                            </li>
                          );
                        }
                        // Handle bold markdown highlighting simply
                        const matchBold = line.split("**");
                        if (matchBold.length > 2) {
                          return (
                            <p key={idx}>
                              {matchBold.map((token, index) =>
                                index % 2 === 1 ? (
                                  <strong key={index} className="text-cyan-300 font-bold">
                                    {token}
                                  </strong>
                                ) : (
                                  token
                                )
                              )}
                            </p>
                          );
                        }
                        return <p key={idx}>{line}</p>;
                      })}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-sm mr-6 text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[#39ff14] rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest pl-1 animate-pulse">
                      Synthesizing Strategy...
                    </span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask copilot optimization recommendations..."
                  className="bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 rounded-sm py-2 px-3 focus:outline-none focus:border-cyan-400 text-xs text-slate-100 flex-1 placeholder-slate-500 focus:ring-1 focus:ring-cyan-500/20"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isChatLoading}
                  className="bg-[#0c1e3e] hover:bg-[#12284e] text-white border border-cyan-500/40 px-3.5 rounded-sm flex items-center justify-center cursor-pointer transition-all disabled:opacity-30"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </form>
            </div>

            {/* Smart Category Diagnostics & KPI Alerts */}
            <div className="overline-card bg-slate-900/40 backdrop-blur-md p-5 rounded-sm border border-white/5 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  AI Category Critiques
                </h3>
              </div>

              {isAnalyzing ? (
                <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-cyan-400">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-[9px] uppercase tracking-widest font-bold">Refreshing metrics...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysis.categoryHeuristics.map((ch, i) => (
                    <div
                      key={i}
                      className="p-3 border rounded-sm bg-slate-950/40 flex flex-col space-y-1"
                      style={{
                        borderColor:
                          ch.status === "critical"
                            ? "rgba(244,63,94,0.25)"
                            : ch.status === "warning"
                            ? "rgba(245,158,11,0.25)"
                            : "rgba(16,185,129,0.15)"
                      }}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-100">{ch.category}</span>
                        <span
                          className={`uppercase text-[8px] font-extrabold px-1.5 py-0.2 rounded-sm border ${
                            ch.status === "critical"
                              ? "bg-rose-950/30 text-rose-300 border-rose-500/30"
                              : ch.status === "warning"
                              ? "bg-amber-950/30 text-amber-300 border-amber-500/20"
                              : "bg-emerald-950/20 text-[#39ff14] border-emerald-500/20"
                          }`}
                        >
                          {ch.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">
                        {ch.analysis}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Warning Anomaly banner trigger if breach is predicted */}
              {isCurrentlyBreaching && (
                <div
                  onClick={() => setIsDrawerOpen(true)}
                  className="p-3 bg-red-950/20 border border-rose-500/30 hover:border-rose-400 rounded-sm flex items-center justify-between cursor-pointer transition-all duration-150 transform hover:-translate-y-0.5 shadow-[0_0_12px_rgba(244,63,94,0.15)] group"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider">
                      Overspend anomaly detected
                    </span>
                  </div>
                  <span className="text-[9px] text-[#39ff14] uppercase font-bold group-hover:underline">
                    Trigger Copilot Solver →
                  </span>
                </div>
              )}
            </div>
          </aside>
        </main>

        {/* Footer info logs inside margins */}
        <footer className="text-[10px] flex flex-col md:flex-row justify-between items-center text-white/20 pt-4 border-t border-white/5 gap-2">
          <div>NETWORK SECURED: SHA-256 ENCRYPTED // ACTIVE NODE: {analysis.mode}</div>
          <div>SECURED BY FINOVA ENGINE COOPERATIVE CORE</div>
        </footer>
      </div>

      {/* Main interactive drawer/overlay for Re-optimization strategies (Conforms to PRD Overline layouts) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overline-card bg-slate-900 border-cyan-500/40 p-6 max-w-lg w-full rounded shadow-[0_15px_45px_rgba(255,255,255,0.13)] text-xs text-white"
            >
              {/* Overlaid Black Header specs on overlay box list */}
              <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
                <div>
                  <span className="text-[10px] text-[#39ff14] uppercase font-black tracking-widest flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    COPILOT ACTIVE STABILIZATION
                  </span>
                  <h3 className="text-lg font-black tracking-tight mt-1 uppercase text-slate-100">
                    Mitigate Forecasted Overrun
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 border border-white/10 hover:border-cyan-400 bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Anomaly Briefing Information */}
              <div className="p-4 rounded border border-rose-500/20 bg-rose-950/10 mb-5 text-slate-200">
                <p className="text-[9px] uppercase font-black text-rose-300 tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-rose-500" />
                  Live Cycle Deficit Analysis
                </p>
                <p className="leading-relaxed mt-1 text-[11px]">
                  Daily run-rate predictions of <span className="text-cyan-400 font-bold">${projectedRunRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> against your threshold budget limit of <span className="text-[#39ff14] font-bold">${budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> will cause an approximate overshoot breach of <span className="text-red-400 font-bold font-mono">${savingsRequired.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> inside the current monthly interval.
                </p>
              </div>

              {/* Three Selectable optimization options mapped dynamically to fulfill state */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase font-black text-white/60 tracking-wider">
                  Select Re-optimization Method
                </p>

                {/* Option 1: Tactical Resource Reduction */}
                <div
                  onClick={() => setSelectedStrategy("reduction")}
                  className={`p-3.5 border rounded cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    selectedStrategy === "reduction"
                      ? "border-[#39ff14] bg-[#39ff14]/10 shadow-[0_0_12px_rgba(57,255,20,0.25)]"
                      : "border-white/10 bg-white/5 opacity-80 hover:opacity-100 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex-1">
                    <span className="text-xs font-black text-slate-100 tracking-wide block">
                      Tactical Resource Reduction
                    </span>
                    <span className="text-[10px] text-slate-400 leading-normal mt-0.5 block">
                      Downscales SaaS background computation instances and auxiliary ops server clusters by 25% for remainder of cycle.
                    </span>
                    <span className="text-[9px] text-[#39ff14] font-mono mt-1 block font-bold">
                      Impact: Save approx. ${(savingsRequired * 0.4).toLocaleString(undefined, { maximumFractionDigits: 2 })} dynamic hosting charges.
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                      selectedStrategy === "reduction" ? "border-[#39ff14]" : "border-white/40"
                    }`}
                  >
                    {selectedStrategy === "reduction" && (
                      <div className="w-2 h-2 rounded-full bg-[#39ff14]" />
                    )}
                  </div>
                </div>

                {/* Option 2: Adjust Threshold Ceiling */}
                <div
                  onClick={() => setSelectedStrategy("ceiling")}
                  className={`p-3.5 border rounded cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    selectedStrategy === "ceiling"
                      ? "border-[#39ff14] bg-[#39ff14]/10 shadow-[0_0_12px_rgba(57,255,20,0.25)]"
                      : "border-white/10 bg-white/5 opacity-80 hover:opacity-100 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex-1">
                    <span className="text-xs font-black text-slate-100 tracking-wide block">
                      Adjust Threshold Ceiling
                    </span>
                    <span className="text-[10px] text-slate-400 leading-normal mt-0.5 block">
                      Amortizes ongoing compliance alerts by scaling current cycle threshold budget level dynamically to 115% of prediction.
                    </span>
                    <span className="text-[9px] text-[#39ff14] font-mono mt-1 block font-bold">
                      Impact: Budget resilience scaled to ${(projectedRunRate * 1.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}.
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                      selectedStrategy === "ceiling" ? "border-[#39ff14]" : "border-white/40"
                    }`}
                  >
                    {selectedStrategy === "ceiling" && (
                      <div className="w-2 h-2 rounded-full bg-[#39ff14]" />
                    )}
                  </div>
                </div>

                {/* Option 3: Temporary Subscription Freezing */}
                <div
                  onClick={() => setSelectedStrategy("freeze")}
                  className={`p-3.5 border rounded cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    selectedStrategy === "freeze"
                      ? "border-[#39ff14] bg-[#39ff14]/10 shadow-[0_0_12px_rgba(57,255,20,0.25)]"
                      : "border-white/10 bg-white/5 opacity-80 hover:opacity-100 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex-1">
                    <span className="text-xs font-black text-slate-100 tracking-wide block">
                      Temporary Subscription Freezing
                    </span>
                    <span className="text-[10px] text-slate-400 leading-normal mt-0.5 block">
                      Instantly freeze seat tiers under all SaaS Subscription classifiers. Bypasses recurring monthly renewals.
                    </span>
                    <span className="text-[9px] text-[#39ff14] font-mono mt-1 block font-bold">
                      Impact: Instant ${(activeAggregate * 0.4).toLocaleString(undefined, { maximumFractionDigits: 2 })} target room recovered in ledger.
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                      selectedStrategy === "freeze" ? "border-[#39ff14]" : "border-white/40"
                    }`}
                  >
                    {selectedStrategy === "freeze" && (
                      <div className="w-2 h-2 rounded-full bg-[#39ff14]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Actions submit and cancel triggers */}
              <div className="mt-6 flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 border border-white/10 hover:border-slate-500 bg-slate-800 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-300 rounded cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeStabilization}
                  className="flex-1 bg-[#0c1e3e] hover:bg-[#12284e] py-3 text-[11px] font-black uppercase tracking-widest text-[#39ff14] border border-[#39ff14]/50 hover:border-[#39ff14] shadow-[0_4px_14px_rgba(57,255,20,0.15)] rounded cursor-pointer transition-all"
                >
                  Execute re-optimization
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
