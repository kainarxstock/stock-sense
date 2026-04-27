export type Market = "stocks" | "crypto";

export type OHLCV = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Bias = "up" | "down" | "sideways";

export type TrendRead = "bullish" | "bearish" | "neutral";
export type MomentumRead = "strong" | "slowing" | "weak";
export type StructureRead = "stable" | "volatile";
export type SnapshotBiasLabel = "slightly_bullish" | "bearish" | "sideways";

export type InterpretationAxis = {
  value: string;
  meaning: string;
};

export type MarketInterpretation = {
  trend: InterpretationAxis;
  momentum: InterpretationAxis;
  structure: InterpretationAxis;
  bias: InterpretationAxis;
};

/** Top-line regime label + one sentence. */
export type MarketStateBlock = {
  label: string;
  detail: string;
};

/** Analyst-style breakdown + watch list. */
export type StructuredCoreInsight = {
  trend: string;
  momentum: string;
  condition: string;
  implication: string;
  watchNext: string;
};

export type ExplanationReason = {
  id: string;
  title: string;
  body: string;
};

export type RiskLevel = "low" | "medium" | "high";

export type SignalAgreement = "strong" | "mixed" | "conflict";

export type BeginnerBrief = {
  marketState: string;
  whatToDo: string;
  why: string;
  riskLevel: RiskLevel;
  riskExplain: string;
  simple: {
    marketState: string;
    whatToDo: string;
    why: string;
    riskExplain: string;
  };
};

export type Layer2Block = { title: string; detail: string };

export type Layer2Narrative = {
  trend: Layer2Block;
  momentum: Layer2Block;
  structure: Layer2Block;
  volatility: Layer2Block;
  rsi: Layer2Block;
};

export type AnalysisResult = {
  bias: Bias;
  /** Raw classifier outputs for decision UI (locale-independent). */
  reads: {
    trend: TrendRead;
    momentum: MomentumRead;
    structure: StructureRead;
  };
  confidence: number;
  /** How aligned the internal reads are — maps to confidence bands. */
  agreement: SignalAgreement;
  summary: string;
  interpretation: MarketInterpretation;
  marketState: MarketStateBlock;
  coreInsight: StructuredCoreInsight;
  biasContext: string;
  reasons: ExplanationReason[];
  beginnerBrief: BeginnerBrief;
  layer2: Layer2Narrative;
  /** Non-empty in crypto mode — risk copy for this session. */
  cryptoRiskNotes: string[];
  metrics: {
    trendSlopePct: number;
    volatilityPct: number;
    rsiApprox: number;
    recentReturnPct: number;
    sma20: number | null;
    sma50: number | null;
  };
};

export type DataSource = "live" | "simulated";
