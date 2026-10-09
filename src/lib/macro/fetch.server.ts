import { buildTerminal } from "@/lib/macro/engine";
import type { BlsPoint, Obs, RawBundle, TerminalSnapshot, YahooBar, YahooSeries } from "@/lib/macro/types";

const UA = "Mozilla/5.0 (compatible; AurumMacroTerminal/1.0; research)";

interface CacheBox {
  at: number;
  v: number;
  snap: TerminalSnapshot;
}

const box = globalThis as unknown as { __aurumCache?: CacheBox };

function monthList(): string[] {
  return ["202605", "202606", "202607", "202608", "202609", "202610"];
}

async function getText(url: string, ms = 12000): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(ms),
    headers: { "User-Agent": UA, Accept: "*/*" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map(splitCsvLine);
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(cur.trim());
      cur = "";
    } else cur += c;
  }
  out.push(cur.trim());
  return out;
}

function toIsoDate(mdy: string): string | null {
  const m = mdy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

function column(header: string[], names: string[]): number {
  const norm = header.map((h) => h.toLowerCase().replace(/\s+/g, ""));
  for (const name of names) {
    const i = norm.indexOf(name.toLowerCase().replace(/\s+/g, ""));
    if (i >= 0) return i;
  }
  return -1;
}

async function loadCurve(
  type: "daily_treasury_yield_curve" | "daily_treasury_real_yield_curve",
  fields: { key: string; names: string[] }[],
): Promise<Record<string, Obs[]>> {
  const buckets: Record<string, Obs[]> = {};
  for (const f of fields) buckets[f.key] = [];
  const chunks = await Promise.all(
    monthList().map(async (yyyymm) => {
      const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/all/${yyyymm}?field_tdr_date_value_month=${yyyymm}&type=${type}&page&_format=csv`;
      try {
        return await getText(url, 12000);
      } catch {
        return "";
      }
    }),
  );
  for (const text of chunks) {
    const rows = parseCsv(text);
    if (rows.length < 2) continue;
    const header = rows[0];
    const dateIdx = column(header, ["Date"]);
    const idxs = fields.map((f) => ({ key: f.key, idx: column(header, f.names) }));
    for (const row of rows.slice(1)) {
      const date = dateIdx >= 0 ? toIsoDate(row[dateIdx] ?? "") : null;
      if (!date) continue;
      for (const { key, idx } of idxs) {
        if (idx < 0) continue;
        const value = Number(row[idx]);
        if (!Number.isFinite(value)) continue;
        buckets[key].push({ date, value });
      }
    }
  }
  for (const key of Object.keys(buckets)) {
    const map = new Map<string, number>();
    for (const p of buckets[key]) map.set(p.date, p.value);
    buckets[key] = [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value }));
  }
  if (Object.values(buckets).every((rows) => rows.length === 0)) {
    throw new Error("yield curve returned no rows");
  }
  return buckets;
}

function exchangeDate(ts: number, offsetSec: number): string {
  return new Date((ts + offsetSec) * 1000).toISOString().slice(0, 10);
}

async function loadIntraday(interval: string, range: string): Promise<YahooBar[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=${interval}&range=${range}`;
  const text = await getText(url, 12000);
  const json = JSON.parse(text) as {
    chart?: {
      result?: {
        timestamp?: number[];
        indicators?: { quote?: { open?: (number | null)[]; high?: (number | null)[]; low?: (number | null)[]; close?: (number | null)[]; volume?: (number | null)[] }[] };
      }[];
    };
  };
  const result = json.chart?.result?.[0];
  if (!result?.timestamp) return [];
  const quote = result.indicators?.quote?.[0] ?? {};
  return result.timestamp
    .map((ts, i) => ({
      date: new Date(ts * 1000).toISOString(),
      open: quote.open?.[i] ?? null,
      high: quote.high?.[i] ?? null,
      low: quote.low?.[i] ?? null,
      close: quote.close?.[i] ?? null,
      volume: quote.volume?.[i] ?? null,
    }))
    .filter((bar) => bar.close != null && bar.high != null && bar.low != null);
}

async function loadYahoo(symbol: string): Promise<YahooSeries | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=6mo`;
  const text = await getText(url, 12000);
  const json = JSON.parse(text) as {
    chart?: {
      result?: {
        meta?: {
          symbol?: string;
          shortName?: string;
          exchangeName?: string;
          currency?: string;
          regularMarketPrice?: number;
          regularMarketTime?: number;
          gmtoffset?: number;
          regularMarketVolume?: number;
        };
        timestamp?: number[];
        indicators?: { quote?: { open?: (number | null)[]; high?: (number | null)[]; low?: (number | null)[]; close?: (number | null)[]; volume?: (number | null)[] }[] };
      }[];
    };
  };
  const result = json.chart?.result?.[0];
  if (!result?.meta || !result.timestamp) return null;
  const quote = result.indicators?.quote?.[0] ?? {};
  const offset = result.meta.gmtoffset ?? 0;
  const bars = result.timestamp.map((ts, i) => ({
    date: exchangeDate(ts, offset),
    open: quote.open?.[i] ?? null,
    high: quote.high?.[i] ?? null,
    low: quote.low?.[i] ?? null,
    close: quote.close?.[i] ?? null,
    volume: quote.volume?.[i] ?? null,
  }));
  const price = result.meta.regularMarketPrice ?? null;
  if (price != null && bars.length) {
    bars[bars.length - 1] = { ...bars[bars.length - 1], close: price };
  }
  const marketTime =
    result.meta.regularMarketTime != null
      ? new Date(result.meta.regularMarketTime * 1000).toISOString()
      : null;
  return {
    symbol: result.meta.symbol ?? symbol,
    shortName: result.meta.shortName ?? null,
    exchange: result.meta.exchangeName ?? null,
    currency: result.meta.currency ?? null,
    price,
    marketTime,
    volume: result.meta.regularMarketVolume ?? null,
    bars,
  };
}

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function blsPoint(year: string, period: string, value: string, footnotes: { code?: string; text?: string }[] | undefined): BlsPoint | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const preliminary = (footnotes ?? []).some((f) => f.code === "P" || /prelim/i.test(f.text ?? ""));
  if (period.startsWith("M")) {
    const m = Number(period.slice(1));
    if (!m) return null;
    return {
      date: `${year}-${String(m).padStart(2, "0")}-01`,
      label: `${MONTHS[m]} ${year}`,
      value: n,
      preliminary,
    };
  }
  if (period.startsWith("Q")) {
    const q = Number(period.slice(1));
    const month = q * 3;
    return {
      date: `${year}-${String(month).padStart(2, "0")}-01`,
      label: `Q${q} ${year}`,
      value: n,
      preliminary,
    };
  }
  return null;
}

async function loadBls(): Promise<Record<string, BlsPoint[]>> {
  const seriesid = [
    "CUUR0000SA0",
    "CUSR0000SA0",
    "CUUR0000SA0L1E",
    "CUSR0000SA0L1E",
    "LNS14000000",
    "CES0000000001",
    "CES0500000003",
    "WPSFD4",
    "WPSFD49116",
    "JTS000000000000000JOL",
    "CIU1010000000000A",
  ];
  const res = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/json", "User-Agent": UA },
    body: JSON.stringify({ seriesid, startyear: "2025", endyear: "2026" }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as {
    status?: string;
    Results?: {
      series?: { seriesID: string; data?: { year: string; period: string; value: string; footnotes?: { code?: string; text?: string }[] }[] }[];
    };
  };
  if (json.status !== "REQUEST_SUCCEEDED") throw new Error(json.status ?? "BLS rejected the request");
  const out: Record<string, BlsPoint[]> = {};
  for (const series of json.Results?.series ?? []) {
    const points = (series.data ?? [])
      .map((row) => blsPoint(row.year, row.period, row.value, row.footnotes))
      .filter((p): p is BlsPoint => Boolean(p))
      .sort((a, b) => a.date.localeCompare(b.date));
    out[series.seriesID] = points;
  }
  return out;
}

function numAt(cols: string[], i: number): number | null {
  const n = Number((cols[i] ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function side(cols: string[], all: number, chg: number, spread: boolean) {
  return {
    long: numAt(cols, all) ?? 0,
    short: numAt(cols, all + 1) ?? 0,
    spread: spread ? numAt(cols, all + 2) : null,
    longChg: numAt(cols, chg) ?? 0,
    shortChg: numAt(cols, chg + 1) ?? 0,
    spreadChg: spread ? numAt(cols, chg + 2) : null,
  };
}

async function loadCot(): Promise<RawBundle["cot"]> {
  const text = await getText("https://www.cftc.gov/dea/newcot/f_disagg.txt", 20000);
  const line = text.split(/\r?\n/).find((ln) => ln.includes("GOLD - COMMODITY EXCHANGE INC."));
  if (!line) throw new Error("COMEX gold row missing");
  const cols = splitCsvLine(line);
  const all = 7;
  const chg = 7 + 16 * 3;
  const oi = numAt(cols, all);
  const totLong = numAt(cols, all + 12);
  const producer = side(cols, all + 1, chg + 1, false);
  const swap = side(cols, all + 3, chg + 3, true);
  const managed = side(cols, all + 6, chg + 6, true);
  const other = side(cols, all + 9, chg + 9, true);
  if (oi == null || totLong == null) throw new Error("COT columns did not parse");
  const reconstructed =
    producer.long +
    swap.long +
    managed.long +
    other.long +
    (swap.spread ?? 0) +
    (managed.spread ?? 0) +
    (other.spread ?? 0);
  if (Math.abs(reconstructed - totLong) > 1) throw new Error("COT column check failed");
  return {
    date: cols[2] ?? "",
    oi,
    oiChg: numAt(cols, chg) ?? 0,
    producer,
    swap,
    managed,
    other,
  };
}

function decode(value: string): string {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&#39;|'/g, "'")
    .replace(/"/g, '"')
    .trim();
}

async function loadNews(): Promise<RawBundle["news"]> {
  const xml = await getText("https://www.federalreserve.gov/feeds/press_monetary.xml", 12000);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 6);
  return items.map((match) => {
    const block = match[1];
    const title = decode(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const link = decode(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "");
    const pubDate = decode(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "");
    return { title, link, pubDate };
  }).filter((item) => item.title);
}

async function loadEffr(): Promise<RawBundle["effr"]> {
  const json = JSON.parse(await getText("https://markets.newyorkfed.org/api/rates/unsecured/effr/last/1.json")) as {
    refRates?: { effectiveDate?: string; percentRate?: number; targetRateFrom?: number; targetRateTo?: number }[];
  };
  const row = json.refRates?.[0];
  if (!row?.effectiveDate || row.percentRate == null || row.targetRateFrom == null || row.targetRateTo == null) {
    throw new Error("EFFR payload incomplete");
  }
  return {
    date: row.effectiveDate,
    rate: row.percentRate,
    targetLow: row.targetRateFrom,
    targetHigh: row.targetRateTo,
  };
}

async function loadSofr(): Promise<RawBundle["sofr"]> {
  const json = JSON.parse(await getText("https://markets.newyorkfed.org/api/rates/secured/sofr/last/1.json")) as {
    refRates?: { effectiveDate?: string; percentRate?: number }[];
  };
  const row = json.refRates?.[0];
  if (!row?.effectiveDate || row.percentRate == null) throw new Error("SOFR payload incomplete");
  return { date: row.effectiveDate, rate: row.percentRate };
}

async function loadRrp(): Promise<RawBundle["rrp"]> {
  const json = JSON.parse(
    await getText("https://markets.newyorkfed.org/api/rp/reverserepo/all/results/last/1.json"),
  ) as { repo?: { operations?: { operationDate?: string; totalAmtAccepted?: number }[] } };
  const row = json.repo?.operations?.[0];
  if (!row?.operationDate || row.totalAmtAccepted == null) throw new Error("RRP payload incomplete");
  return { date: row.operationDate, acceptedUsd: row.totalAmtAccepted };
}

interface CalendarEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

const ffMem = globalThis as unknown as { __aurumFf?: { at: number; events: CalendarEvent[] } };

async function loadCalendar(): Promise<CalendarEvent[]> {
  const hit = ffMem.__aurumFf;
  if (hit && Date.now() - hit.at < 50 * 60 * 1000) return hit.events;
  try {
    const text = await getText("https://nfs.faireconomy.media/ff_calendar_thisweek.json", 12000);
    const rows = JSON.parse(text) as Partial<CalendarEvent>[];
    if (!Array.isArray(rows)) throw new Error("calendar payload was not a list");
    const events = rows
      .filter((row) => row.country === "USD" && row.title && row.date)
      .map((row) => ({
        title: String(row.title),
        country: "USD",
        date: String(row.date),
        impact: String(row.impact ?? ""),
        forecast: String(row.forecast ?? ""),
        previous: String(row.previous ?? ""),
      }));
    ffMem.__aurumFf = { at: Date.now(), events };
    return events;
  } catch (error) {
    if (hit) return hit.events;
    throw error;
  }
}

async function loadFomcFlag(): Promise<boolean> {
  const html = await getText("https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm", 15000);
  const text = html.replace(/<[^>]+>/g, " ").replace(/&ndash;|&#8211;/g, "–");
  const sep = /September\s+15\s*[–-]\s*16/.test(text);
  const oct = /October\s+27\s*[–-]\s*28/.test(text);
  return sep && oct;
}

async function lseJson<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.londonstrategicedge.com/${path}`, {
    signal: AbortSignal.timeout(12000),
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      "x-api-key": "71f880e1d2ef471664f3b6c04c6dc1e618f94e51f68c87522bc6dcbc0ca173a5",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

function toM15(rows: { timestamp: string; open: number; high: number; low: number; close: number; volume: number | null }[]): YahooBar[] {
  const buckets = new Map<string, YahooBar>();
  for (const row of rows) {
    const time = Date.parse(row.timestamp);
    if (!Number.isFinite(time) || row.high == null || row.low == null || row.close == null) continue;
    const bucket = new Date(Math.floor(time / 900000) * 900000).toISOString();
    const current = buckets.get(bucket);
    if (!current) {
      buckets.set(bucket, { date: bucket, open: row.open, high: row.high, low: row.low, close: row.close, volume: row.volume });
      continue;
    }
    current.high = Math.max(current.high ?? row.high, row.high);
    current.low = Math.min(current.low ?? row.low, row.low);
    current.close = row.close;
    current.volume = (current.volume ?? 0) + (row.volume ?? 0);
  }
  return [...buckets.values()];
}

async function loadLseGold(): Promise<NonNullable<RawBundle["lseGold"]>> {
  const quote = await lseJson<{ current_price: number; change_24h_pct: number | null; change_weekly_pct: number | null; updated_at: string }[]>(
    "x_pricecache?symbol=eq.XAU/USD&select=current_price,change_24h_pct,change_weekly_pct,updated_at",
  );
  const row = quote[0];
  if (row?.current_price == null) throw new Error("LSE gold quote empty");
  const pages = await Promise.all(
    [0, 1000, 2000, 3000].map((offset) =>
      lseJson<{ timestamp: string; open: number; high: number; low: number; close: number; volume: number | null }[]>(
        `candles_xau_usd?select=timestamp,open,high,low,close,volume&order=timestamp.desc&limit=1000&offset=${offset}`,
      ),
    ),
  );
  const m15 = toM15(pages.flat().sort((a, b) => a.timestamp.localeCompare(b.timestamp))).slice(-240);
  if (m15.length < 20) throw new Error("LSE gold candles too short");
  return { price: row.current_price, change24: row.change_24h_pct, changeWeek: row.change_weekly_pct, asOf: row.updated_at, m15 };
}

async function settled<T>(source: string, errors: RawBundle["errors"], task: Promise<T>): Promise<T | null> {
  try {
    return await task;
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 160) : "request failed";
    errors.push({ source, message });
    return null;
  }
}

const inflight = globalThis as unknown as { __aurumInflight?: Promise<TerminalSnapshot> };

export async function loadTerminal(refresh: boolean): Promise<TerminalSnapshot> {
  const hit = box.__aurumCache;
  const usable = hit && hit.v === 14 && hit.snap.desk?.stretch ? hit : null;
  if (!refresh && usable && Date.now() - usable.at < 180000) return usable.snap;
  if (!refresh && usable) {
    void loadTerminal(true).catch(() => {});
    return usable.snap;
  }
  if (inflight.__aurumInflight) return inflight.__aurumInflight;

  const task = collectTerminal().finally(() => {
    inflight.__aurumInflight = undefined;
  });
  inflight.__aurumInflight = task;
  return task;
}

async function collectTerminal(): Promise<TerminalSnapshot> {

  const errors: RawBundle["errors"] = [];
  const yahooSymbols = ["XAUUSD=X", "GC=F", "DX-Y.NYB", "^VIX", "^GSPC", "^IXIC", "CL=F", "HG=F", "HYG", "^TNX"];

  const [nominal, real, bls, cot, news, calendar, effr, sofr, rrp, fomcHtmlConfirmed, yahooList, goldHours, goldM15, lseGold] = await Promise.all([
    settled("Treasury nominal", errors, loadCurve("daily_treasury_yield_curve", [
      { key: "y2", names: ["2 Yr", "2Yr"] },
      { key: "y5", names: ["5 Yr", "5Yr"] },
      { key: "y10", names: ["10 Yr", "10Yr"] },
      { key: "y30", names: ["30 Yr", "30Yr"] },
    ])),
    settled("Treasury real", errors, loadCurve("daily_treasury_real_yield_curve", [
      { key: "real5", names: ["5 YR", "5 Yr"] },
      { key: "real10", names: ["10 YR", "10 Yr"] },
      { key: "real30", names: ["30 YR", "30 Yr"] },
    ])),
    settled("BLS", errors, loadBls()),
    settled("CFTC", errors, loadCot()),
    settled("Fed RSS", errors, loadNews()),
    settled("Forex Factory", errors, loadCalendar()),
    settled("NY Fed EFFR", errors, loadEffr()),
    settled("NY Fed SOFR", errors, loadSofr()),
    settled("NY Fed RRP", errors, loadRrp()),
    settled("Fed calendar", errors, loadFomcFlag()),
    Promise.all(yahooSymbols.map(async (symbol) => settled(`Yahoo ${symbol}`, errors, loadYahoo(symbol)))),
    settled("Yahoo GC=F 60m", errors, loadIntraday("60m", "1mo")),
    settled("Yahoo GC=F 15m", errors, loadIntraday("15m", "5d")),
    settled("London Strategic Edge XAU/USD", errors, loadLseGold()),
  ]);

  const yahoo: RawBundle["yahoo"] = {};
  yahooSymbols.forEach((symbol, i) => {
    yahoo[symbol] = yahooList[i];
  });

  const empty: Obs[] = [];
  const bundle: RawBundle = {
    retrievedAt: new Date().toISOString(),
    errors,
    nominal: {
      y2: nominal?.y2 ?? empty,
      y5: nominal?.y5 ?? empty,
      y10: nominal?.y10 ?? empty,
      y30: nominal?.y30 ?? empty,
    },
    real: {
      real5: real?.real5 ?? empty,
      real10: real?.real10 ?? empty,
      real30: real?.real30 ?? empty,
    },
    yahoo,
    bls: bls ?? {},
    effr,
    sofr,
    rrp,
    cot,
    news: news ?? [],
    calendar: calendar ?? [],
    fomcHtmlConfirmed: Boolean(fomcHtmlConfirmed),
    tnx: yahoo["^TNX"]?.price ?? null,
    goldHours: goldHours ?? [],
    goldM15: goldM15 ?? [],
    lseGold,
  };

  const snap = buildTerminal(bundle);
  const useful = bundle.nominal.y10.length > 0 || (yahoo["GC=F"]?.price ?? yahoo["XAUUSD=X"]?.price) != null;
  if (useful) box.__aurumCache = { at: Date.now(), v: 14, snap };
  return snap;
}
