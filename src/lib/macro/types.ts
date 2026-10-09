export interface Obs {
  date: string;
  value: number;
}

export interface YahooBar {
  date: string;
  open?: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

export interface CandlePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PriceZone {
  kind: "supply" | "demand";
  top: number;
  bottom: number;
  from: string;
  state: "utuh" | "tersentuh";
}

export interface YahooSeries {
  symbol: string;
  shortName: string | null;
  exchange: string | null;
  currency: string | null;
  price: number | null;
  marketTime: string | null;
  volume: number | null;
  bars: YahooBar[];
}

export interface BlsPoint {
  date: string;
  label: string;
  value: number;
  preliminary: boolean;
}

export interface CotSide {
  long: number;
  short: number;
  spread: number | null;
  longChg: number;
  shortChg: number;
  spreadChg: number | null;
}

export interface RawBundle {
  retrievedAt: string;
  errors: { source: string; message: string }[];
  nominal: Record<"y2" | "y5" | "y10" | "y30", Obs[]>;
  real: Record<"real5" | "real10" | "real30", Obs[]>;
  yahoo: Record<string, YahooSeries | null>;
  bls: Record<string, BlsPoint[]>;
  effr: {
    date: string;
    rate: number;
    targetLow: number;
    targetHigh: number;
  } | null;
  sofr: { date: string; rate: number } | null;
  rrp: { date: string; acceptedUsd: number } | null;
  cot: {
    date: string;
    oi: number;
    oiChg: number;
    producer: CotSide;
    swap: CotSide;
    managed: CotSide;
    other: CotSide;
  } | null;
  news: { title: string; link: string; pubDate: string }[];
  calendar: {
    title: string;
    country: string;
    date: string;
    impact: string;
    forecast: string;
    previous: string;
  }[];
  fomcHtmlConfirmed: boolean;
  tnx: number | null;
  goldHours: YahooBar[];
  goldM15: YahooBar[];
  lseGold: {
    price: number;
    change24: number | null;
    changeWeek: number | null;
    asOf: string;
    m15: YahooBar[];
  } | null;
}

export interface SeriesPoint {
  date: string;
  value: number;
}

export interface PrintRow {
  name: string;
  period: string;
  actual: string;
  previous: string;
  revisedNote: string;
  forecast: string;
  unit: string;
  frequency: string;
  freshness: string;
  source: string;
  observedChange: string;
  surprise: string;
}

export interface TerminalSnapshot {
  retrievedAt: string;
  clockNote: string;
  sources: { name: string; ok: boolean; detail: string }[];
  state: {
    biasLabel: string;
    biasTone: "bull" | "bear" | "neutral" | "gap";
    confidenceLabel: string;
    primaryDriver: string;
    secondary: string[];
    confirmation: string;
    confirmationDetail: string;
    pricedIn: string;
    pricedInDetail: string;
    positioningRisk: string;
    positioningDetail: string;
    nextCatalyst: string;
    nextCatalystWhen: string;
    invalidation: string;
    invalidationAlert: string | null;
    thesis: string;
  };
  chain: { label: string; status: "open" | "partial" | "blocked" | "model"; reading: string }[];
  crossChecks: { label: string; status: "open" | "partial" | "blocked" | "model"; reading: string }[];
  yields: {
    tenor: string;
    current: string;
    daily: string;
    weekly: string;
    monthly: string;
    trend: string;
  }[];
  yieldNote: string;
  yieldRead: string;
  realYield: {
    current: string;
    daily: string;
    weekly: string;
    monthly: string;
    asOf: string;
    interpretation: string;
    caveats: string[];
  };
  usd: {
    current: string;
    daily: string;
    weekly: string;
    monthly: string;
    trend: string;
    relation: string;
    source: string;
  };
  gold: {
    instrument: string;
    disclaimer: string;
    price: string;
    daily: string;
    weekly: string;
    monthly: string;
    realizedVol: string;
    atr: string;
    volume: string;
    openInterest: string;
    source: string;
    asOf: string;
  };
  charts: {
    gold: SeriesPoint[];
    real10: SeriesPoint[];
    y2: SeriesPoint[];
    dxy: SeriesPoint[];
    h4: SeriesPoint[];
  };
  techCharts: {
    m15: { bars: CandlePoint[]; zones: PriceZone[]; structure: string; note: string };
    h4: { bars: CandlePoint[]; zones: PriceZone[] };
    daily: { bars: CandlePoint[]; zones: PriceZone[] };
  };
  prints: { group: string; rows: PrintRow[] }[];
  surpriseSummary: string;
  reaction: {
    inflation: string;
    inflationDetail: string;
    employment: string;
    employmentDetail: string;
    growth: string;
    growthDetail: string;
    fedPressure: string;
    fedPressureDetail: string;
    disclaimer: string;
  };
  fed: {
    target: string;
    effr: string;
    sofr: string;
    probabilities: string;
    path: { horizon: string; rate: string; change: string }[];
    divergence: string;
    notes: string[];
  };
  pricedLayers: { layer: string; finding: string }[];
  releaseReactions: {
    event: string;
    date: string;
    gold: string;
    y2: string;
    real: string;
    dxy: string;
  }[];
  reactionNote: string;
  matrix: { variable: string; move: string; interpretation: string }[];
  matrixFooter: string;
  divergence: { classification: string; detail: string; hypotheses: string[] };
  positioning: {
    reportDate: string;
    source: string;
    rows: {
      book: string;
      long: string;
      short: string;
      spread: string;
      net: string;
      weekly: string;
      pctOi: string;
    }[];
    percentile: string;
    reading: string;
  };
  volatility: { rows: { name: string; value: string; meaning: string }[]; note: string };
  liquidity: { rows: { name: string; value: string; note: string }[]; reading: string };
  risk: {
    regime: string;
    detail: string;
    goldNote: string;
    rows: { name: string; value: string; move: string }[];
  };
  scenarios: {
    name: string;
    summary: string;
    trigger: string;
    evidence: string;
    confirmation: string;
    invalidation: string;
    watch: string;
  }[];
  daily: { heading: string; body: string }[];
  event: { mode: string; title: string; blocks: { heading: string; body: string }[] };
  calendar: {
    note: string;
    rows: { when: string; title: string; impact: string; forecast: string; previous: string }[];
  };
  news: { title: string; date: string; link: string; classification: string; note: string }[];
  technical: { regime: string; lines: string[]; separation: string };
  coverage: { domain: string; have: string; missing: string }[];
  rules: string[];
  desk: {
    regime: { inflation: string; labor: string; growth: string; financial: string };
    fedView: { current: string; policyBias: string; expected: string; repricing: string };
    lenses: { macro: string; yield: string; usd: string; positioning: string; risk: string };
    finalBias: string;
    finalNote: string;
    technicalBias: string;
    overall: string;
    confluence: { factor: string; condition: string; impact: string; strength: string }[];
    confluenceCall: string;
    pricedStatus: string;
    stretch: { label: string; detail: string };
    h4: { structure: string; support: string; resistance: string; location: string; bias: string; alignment: string };
    dailyTech: { structure: string; support: string; resistance: string; bias: string; location: string; note: string };
    watch: string[];
  };
}
