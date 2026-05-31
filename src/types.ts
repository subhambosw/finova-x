export type TransactionCategory =
  | "SaaS Subscriptions"
  | "Operations"
  | "Food & Travel"
  | "Utilities";

export interface Transaction {
  id: string;
  label: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  isFrozen: boolean;
}

export interface CategoryHeuristic {
  category: TransactionCategory;
  status: "critical" | "warning" | "optimal";
  analysis: string;
}

export interface TacticalOptimization {
  title: string;
  description: string;
  impact: string;
}

export interface SpendAnalysis {
  isBreaching: boolean;
  runRate: number;
  projectedSpend: number;
  savingsTarget: number;
  categoryHeuristics: CategoryHeuristic[];
  aiInsights: string[];
  tacticalOptimizations: TacticalOptimization[];
  mode: string;
}

export interface CopilotMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
}
