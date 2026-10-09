import type {
  BlsPoint,
  Obs,
  RawBundle,
  TerminalSnapshot,
  CandlePoint,
  PriceZone,
  YahooBar,
  YahooSeries,
} from "@/lib/macro/types";

const GAP = "DATA TIDAK TERSEDIA";
const NO_SURPRISE =
  "BUKTI TIDAK CUKUP — tidak ada konsensus yang bersumber, jadi ini bukan kejutan ekonomi.";

interface Win {
  last: number | null;
  lastDate: string | null;
  d1: number | null;
  d5: number | null;
  d21: number | null;
  date1: string | null;
  date5: string | null;
  date21: string | null;
  from1: number | null;
  from5: number | null;
  from21: number | null;
}

type Vote = "supportive" | "restrictive" | "flat" | "abstain";

function winDiff(points: Obs[]): Win {
  const blank: Win = {
    last: null,
    lastDate: null,
    d1: null,
    d5: null,
    d21: null,
    date1: null,
    date5: null,
    date21: null,
    from1: null,
    from5: null,
    from21: null,
  };
  if (!points.length) return blank;
  const last = points[points.length - 1];
  const pick = (back: number) => {
    const i = points.length - 1 - back;
    return i >= 0 ? points[i] : null;
  };
  const p1 = pick(1);
  const p5 = pick(5);
  const p21 = pick(21);
  return {
    last: last.value,
    lastDate: last.date,
    d1: p1 ? last.value - p1.value : null,
    d5: p5 ? last.value - p5.value : null,
    d21: p21 ? last.value - p21.value : null,
    date1: p1?.date ?? null,
    date5: p5?.date ?? null,
    date21: p21?.date ?? null,
    from1: p1?.value ?? null,
    from5: p5?.value ?? null,
    from21: p21?.value ?? null,
  };
}

function closes(series: YahooSeries | null | undefined): Obs[] {
  if (!series) return [];
  return series.bars
    .filter((b) => b.close != null && Number.isFinite(b.close))
    .map((b) => ({ date: b.date, value: b.close as number }));
}

function winRet(points: Obs[]): Win {
  const base = winDiff(points);
  const pct = (diff: number | null, from: number | null) => {
    if (diff == null || from == null || from === 0) return null;
    return ((from + diff) / from - 1) * 100;
  };
  return {
    ...base,
    d1: pct(base.d1, base.from1),
    d5: pct(base.d5, base.from5),
    d21: pct(base.d21, base.from21),
  };
}

function signed(v: number | null, digits: number, suffix = ""): string {
  if (v == null || !Number.isFinite(v)) return GAP;
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(digits)}${suffix}`;
}

function num(v: number | null, digits: number, suffix = ""): string {
  if (v == null || !Number.isFinite(v)) return GAP;
  return `${v.toFixed(digits)}${suffix}`;
}

function bps(levelDiff: number | null): string {
  if (levelDiff == null || !Number.isFinite(levelDiff)) return GAP;
  return signed(levelDiff * 100, 1, " bps");
}

function ints(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return GAP;
  return new Intl.NumberFormat("en-US").format(Math.round(v));
}

function yieldVote(diff: number | null, dead: number): Vote {
  if (diff == null || !Number.isFinite(diff)) return "abstain";
  if (Math.abs(diff) < dead) return "flat";
  return diff < 0 ? "supportive" : "restrictive";
}

function softerVote(ret: number | null, dead: number): Vote {
  if (ret == null || !Number.isFinite(ret)) return "abstain";
  if (Math.abs(ret) < dead) return "flat";
  return ret < 0 ? "supportive" : "restrictive";
}

function trend(diff: number | null, dead: number, up = "Naik", down = "Turun"): string {
  if (diff == null || !Number.isFinite(diff)) return GAP;
  if (Math.abs(diff) < dead) return "Datar";
  return diff > 0 ? up : down;
}

function latestBls(points: BlsPoint[] | undefined): BlsPoint | null {
  if (!points?.length) return null;
  return points[points.length - 1];
}

function blsAt(points: BlsPoint[] | undefined, back: number): BlsPoint | null {
  if (!points || points.length <= back) return null;
  return points[points.length - 1 - back];
}

function yoyEnding(points: BlsPoint[] | undefined, back: number): number | null {
  if (!points) return null;
  const i = points.length - 1 - back;
  const j = i - 12;
  if (i < 0 || j < 0) return null;
  const b = points[j].value;
  if (!b) return null;
  return (points[i].value / b - 1) * 100;
}

function mom(points: BlsPoint[] | undefined): number | null {
  const a = latestBls(points);
  const b = blsAt(points, 1);
  if (!a || !b || !b.value) return null;
  return (a.value / b.value - 1) * 100;
}

function ann3(points: BlsPoint[] | undefined): number | null {
  const a = latestBls(points);
  const b = blsAt(points, 3);
  if (!a || !b || !b.value) return null;
  return (Math.pow(a.value / b.value, 4) - 1) * 100;
}

function levelChg(points: BlsPoint[] | undefined, back = 1): number | null {
  const a = latestBls(points);
  const b = blsAt(points, back);
  if (!a || !b) return null;
  return a.value - b.value;
}

function prelim(p: BlsPoint | null): string {
  return p?.preliminary ? " Sementara." : "";
}

function gapRow(name: string, why: string): TerminalSnapshot["prints"][number]["rows"][number] {
  return {
    name,
    period: GAP,
    actual: GAP,
    previous: GAP,
    revisedNote: "Tidak ada vintase yang diambil.",
    forecast: GAP,
    unit: GAP,
    frequency: GAP,
    freshness: GAP,
    source: why,
    observedChange: GAP,
    surprise: NO_SURPRISE,
  };
}

function indexPrint(opts: {
  name: string;
  points: BlsPoint[] | undefined;
  unit: string;
  frequency: string;
  source: string;
  freshness: string;
  showYoy?: boolean;
  showMom?: boolean;
  alreadyPercent?: boolean;
}): TerminalSnapshot["prints"][number]["rows"][number] {
  const a = latestBls(opts.points);
  const prev = blsAt(opts.points, 1);
  if (!a) return gapRow(opts.name, opts.source);
  const yoy = opts.showYoy ? yoyEnding(opts.points, 0) : null;
  const m = opts.showMom ? mom(opts.points) : null;
  const bits: string[] = [];
  if (opts.alreadyPercent) bits.push(`cetakan terakhir ${num(a.value, 1, "%")}`);
  else bits.push(`indeks ${num(a.value, 3)}`);
  if (yoy != null) bits.push(`YoY ${signed(yoy, 2, "%")}`);
  if (m != null) bits.push(`MoM ${signed(m, 2, "%")}`);
  const observed =
    yoy != null || m != null
      ? `${bits.join(" · ")}. Perubahan yang teramati, bukan kejutan terhadap konsensus.`
      : bits.join(" · ");
  return {
    name: opts.name,
    period: a.label,
    actual: opts.alreadyPercent ? num(a.value, 1, "%") : num(a.value, 3),
    previous: prev ? (opts.alreadyPercent ? num(prev.value, 1, "%") : num(prev.value, 3)) : GAP,
    revisedNote:
      "Sebelumnya adalah periode sebelumnya pada vintase BLS yang sekarang. Angka saat pertama kali terbit DATA TIDAK TERSEDIA." +
      prelim(a),
    forecast: GAP,
    unit: opts.unit,
    frequency: opts.frequency,
    freshness: opts.freshness,
    source: opts.source,
    observedChange: observed,
    surprise: NO_SURPRISE,
  };
}

function legLabel(kind: "Hawkish" | "Dovish" | "Neutral" | "Insufficient"): string {
  if (kind === "Hawkish") return "Ketat";
  if (kind === "Dovish") return "Longgar";
  if (kind === "Neutral") return "Netral";
  return "Tidak cukup";
}

function contradicts(vote: Vote, shortDiff: number | null, dead: number): boolean {
  if (vote === "abstain" || vote === "flat" || shortDiff == null) return false;
  if (vote === "supportive") return shortDiff > dead;
  return shortDiff < -dead;
}

function barsToObs(bars: YahooBar[]): Obs[] {
  return bars
    .filter((b) => b.close != null)
    .map((b) => ({ date: b.date, value: b.close as number }));
}

function sessionMove(points: Obs[], date: string, mode: "bps" | "pct"): string {
  const i = points.findIndex((p) => p.date >= date);
  if (i <= 0) return GAP;
  const gapDays =
    (Date.parse(`${points[i].date}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86400000;
  if (gapDays > 4) return GAP;
  const now = points[i].value;
  const prev = points[i - 1].value;
  const span = `${points[i - 1].date} → ${points[i].date}`;
  if (mode === "bps") return `${bps(now - prev)} (${span})`;
  if (!prev) return GAP;
  return `${signed((now / prev - 1) * 100, 2, "%")} (${span})`;
}

function ma(values: number[], n: number): number | null {
  if (values.length < n) return null;
  const slice = values.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / n;
}

function stdev(values: number[]): number | null {
  if (values.length < 8) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const v = values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(v);
}

function atr(bars: YahooBar[], n = 14): number | null {
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const bar = bars[i];
    const prev = bars[i - 1].close;
    if (bar.high == null || bar.low == null || bar.close == null || prev == null) continue;
    trs.push(Math.max(bar.high - bar.low, Math.abs(bar.high - prev), Math.abs(bar.low - prev)));
  }
  const last = trs.slice(-n);
  if (last.length < n) return null;
  return last.reduce((a, b) => a + b, 0) / last.length;
}

function fourHour(bars: YahooBar[]): YahooBar[] {
  const buckets = new Map<number, YahooBar>();
  const span = 4 * 3600 * 1000;
  for (const bar of bars) {
    const t = Date.parse(bar.date);
    if (!Number.isFinite(t) || bar.close == null || bar.high == null || bar.low == null) continue;
    const key = Math.floor(t / span) * span;
    const cur = buckets.get(key);
    if (!cur) {
      buckets.set(key, {
        date: new Date(key).toISOString(),
        open: bar.open ?? bar.close,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
      });
    } else {
      cur.high = Math.max(cur.high ?? bar.high, bar.high);
      cur.low = Math.min(cur.low ?? bar.low, bar.low);
      cur.close = bar.close;
      cur.volume = (cur.volume ?? 0) + (bar.volume ?? 0);
    }
  }
  return [...buckets.entries()].sort((a, b) => a[0] - b[0]).map(([, bar]) => bar);
}

function candlesOf(bars: YahooBar[]): CandlePoint[] {
  const out: CandlePoint[] = [];
  let prev: number | null = null;
  for (const bar of bars) {
    if (bar.high == null || bar.low == null || bar.close == null) continue;
    const open = bar.open ?? prev ?? bar.close;
    out.push({ date: bar.date, open, high: bar.high, low: bar.low, close: bar.close });
    prev = bar.close;
  }
  return out;
}

function zonesOf(bars: YahooBar[]): PriceZone[] {
  const clean = candlesOf(bars);
  const range = atr(bars, 14);
  if (clean.length < 24 || range == null || range <= 0) return [];
  const wing = 2;
  const found: { kind: "supply" | "demand"; i: number; top: number; bottom: number }[] = [];
  for (let i = wing; i < clean.length - wing; i++) {
    const bar = clean[i];
    let isHigh = true;
    let isLow = true;
    for (let k = 1; k <= wing; k++) {
      if (clean[i - k].high >= bar.high || clean[i + k].high >= bar.high) isHigh = false;
      if (clean[i - k].low <= bar.low || clean[i + k].low <= bar.low) isLow = false;
    }
    if (isLow && clean.slice(i + 1, i + 6).some((next) => next.high >= bar.low + range)) {
      const baseTop = Math.max(bar.high, clean[i - 1].high);
      found.push({ kind: "demand", i, bottom: bar.low, top: Math.min(baseTop, bar.low + range) });
    }
    if (isHigh && clean.slice(i + 1, i + 6).some((next) => next.low <= bar.high - range)) {
      const baseBot = Math.min(bar.low, clean[i - 1].low);
      found.push({ kind: "supply", i, top: bar.high, bottom: Math.max(baseBot, bar.high - range) });
    }
  }
  const fresh: PriceZone[] = [];
  for (const zone of found) {
    let state: PriceZone["state"] | "tembus" = "utuh";
    for (let j = zone.i + wing + 1; j < clean.length; j++) {
      const bar = clean[j];
      if (zone.kind === "demand") {
        if (bar.close < zone.bottom) {
          state = "tembus";
          break;
        }
        if (bar.low <= zone.top) state = "tersentuh";
      } else if (bar.close > zone.top) {
        state = "tembus";
        break;
      } else if (bar.high >= zone.bottom) state = "tersentuh";
    }
    if (state === "tembus") continue;
    fresh.push({ kind: zone.kind, top: zone.top, bottom: zone.bottom, from: clean[zone.i].date, state });
  }
  return [
    ...fresh.filter((zone) => zone.kind === "demand").slice(-2),
    ...fresh.filter((zone) => zone.kind === "supply").slice(-2),
  ];
}

function frameOf(bars: YahooBar[], label: string): {
  structure: string;
  support: string;
  resistance: string;
  bias: string;
  location: string;
  note: string;
} {
  const clean = bars.filter((b) => b.high != null && b.low != null && b.close != null);
  const blank = {
    structure: GAP,
    support: GAP,
    resistance: GAP,
    bias: GAP,
    location: GAP,
    note: `${label}: bar tidak cukup untuk swing.`,
  };
  if (clean.length < 20) return blank;
  const wing = 2;
  const highs: { i: number; v: number }[] = [];
  const lows: { i: number; v: number }[] = [];
  for (let i = wing; i < clean.length - wing; i++) {
    const h = clean[i].high as number;
    const l = clean[i].low as number;
    let isHigh = true;
    let isLow = true;
    for (let k = 1; k <= wing; k++) {
      if ((clean[i - k].high as number) >= h || (clean[i + k].high as number) >= h) isHigh = false;
      if ((clean[i - k].low as number) <= l || (clean[i + k].low as number) <= l) isLow = false;
    }
    if (isHigh) highs.push({ i, v: h });
    if (isLow) lows.push({ i, v: l });
  }
  if (highs.length < 2 || lows.length < 2) return blank;
  const h1 = highs[highs.length - 2];
  const h2 = highs[highs.length - 1];
  const l1 = lows[lows.length - 2];
  const l2 = lows[lows.length - 1];
  const up = h2.v > h1.v && l2.v > l1.v;
  const down = h2.v < h1.v && l2.v < l1.v;
  const closes = clean.map((b) => b.close as number);
  const avg = ma(closes, 20);
  const last = closes[closes.length - 1];
  const bias = up && avg != null && last > avg ? "Bullish" : down && avg != null && last < avg ? "Bearish" : "Netral";
  const when = (i: number) => clean[i].date.slice(0, 16).replace("T", " ");
  const location =
    last > h2.v
      ? `Harga terakhir ${num(last, 2)} di atas swing high ${num(h2.v, 2)}.`
      : last < l2.v
        ? `Harga terakhir ${num(last, 2)} di bawah swing low ${num(l2.v, 2)}.`
        : `Harga terakhir ${num(last, 2)} di antara swing low ${num(l2.v, 2)} dan swing high ${num(h2.v, 2)}.`;
  return {
    structure: up ? "Naik. Higher high dan higher low." : down ? "Turun. Lower high dan lower low." : "Campuran. High dan low tidak searah.",
    support: `${num(l2.v, 2)} · ${when(l2.i)} UTC`,
    resistance: `${num(h2.v, 2)} · ${when(h2.i)} UTC`,
    bias,
    location,
    note: `${label}. Swing hanya dihitung jika dua bar di kiri dan kanan sudah lebih rendah atau lebih tinggi. Bar yang belum tertutup tidak dijadikan level. Bukan sinyal masuk.`,
  };
}

function clock(iso: string): string {
  const d = new Date(iso);
  const opt: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };
  const wib = new Intl.DateTimeFormat("en-GB", { ...opt, timeZone: "Asia/Jakarta" }).format(d);
  const et = new Intl.DateTimeFormat("en-GB", { ...opt, timeZone: "America/New_York" }).format(d);
  return `Diambil ${wib} WIB · ${et} ET. Setiap angka menyimpan waktu pengamatannya sendiri. Bukan satu potret resmi yang sinkron.`;
}

interface Scheduled {
  name: string;
  iso: string;
  when: string;
  covers: string;
  source: string;
}

const SCHEDULE: Scheduled[] = [
  {
    name: "FOMC minutes",
    iso: "2026-10-07T18:00:00Z",
    when: "7 Oct 2026, 14:00 ET",
    covers: "rapat 15–16 September",
    source:
      "Acuan jadwal. Federal Reserve merilis notulen tiga minggu setelah rapat. 16 Sep + 21 hari = 7 Okt. Jamnya adalah rilis notulen tetap pukul 14:00 ET. Bukan cetakan pasar.",
  },
  {
    name: "CPI",
    iso: "2026-10-14T12:30:00Z",
    when: "14 Oct 2026, 08:30 ET",
    covers: "September 2026",
    source:
      "Kalender rilis CPI FRED mencantumkan 14 Okt 2026 pukul 7:30 US Central, yaitu 08:30 ET. https://fred.stlouisfed.org/releases/calendar?rid=10",
  },
  {
    name: "PPI",
    iso: "2026-10-15T23:59:00Z",
    when: "15 Okt 2026 (tanggal). Jam tidak dibaca ulang dari BLS.",
    covers: "September 2026",
    source:
      "FRED mencantumkan rilis berikutnya WPSFD49116 pada 15 Okt 2026. https://fred.stlouisfed.org/series/WPSFD49116. Kebiasaan 08:30 ET tidak dikonfirmasi ulang dari halaman BLS pada pengambilan ini (halaman itu 403), jadi jamnya DATA TIDAK TERSEDIA.",
  },
  {
    name: "FOMC meeting",
    iso: "2026-10-28T18:00:00Z",
    when: "27–28 Oct 2026",
    covers: "rapat Oktober",
    source:
      "Kalender FOMC 2026 Federal Reserve. Jam pernyataan tidak berhasil dibaca dari HTML pada pengambilan ini. https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
  },
  {
    name: "JOLTS",
    iso: "2026-11-03T15:00:00Z",
    when: "3 Nov 2026, 10:00 ET",
    covers: "September 2026",
    source: "Jadwal rilis terpilih BLS untuk November 2026. https://www.bls.gov/schedule/2026/11_sched_list.htm",
  },
  {
    name: "Employment Situation",
    iso: "2026-11-06T13:30:00Z",
    when: "6 Nov 2026, 08:30 ET",
    covers: "October 2026",
    source: "Jadwal rilis terpilih BLS untuk November 2026. https://www.bls.gov/schedule/2026/11_sched_list.htm",
  },
  {
    name: "CPI",
    iso: "2026-11-10T13:30:00Z",
    when: "10 Nov 2026, 08:30 ET",
    covers: "October 2026",
    source: "Jadwal rilis terpilih BLS untuk November 2026. https://www.bls.gov/schedule/2026/11_sched_list.htm",
  },
];

function yieldSentence(name: string, w: Win): string {
  if (w.d21 == null || w.last == null || w.from21 == null || !w.date21 || !w.lastDate) {
    return `${name}: ${GAP} pada jendela 21 sesi.`;
  }
  const dir = w.d21 < 0 ? "lebih rendah" : w.d21 > 0 ? "lebih tinggi" : "tidak berubah";
  return `${name} ${Math.abs(w.d21 * 100).toFixed(1)} bps ${dir} dari ${w.date21} (${w.from21.toFixed(2)}%) ke ${w.lastDate} (${w.last.toFixed(2)}%).`;
}

function retSentence(name: string, w: Win): string {
  if (w.d21 == null || w.last == null || !w.date21 || !w.lastDate) {
    return `${name}: ${GAP} pada jendela 21 sesi.`;
  }
  return `${name} ${signed(w.d21, 2, "%")} dari ${w.date21} ke ${w.lastDate} (terakhir ${num(w.last, name === "DXY" ? 3 : 2)}).`;
}

export function buildTerminal(raw: RawBundle): TerminalSnapshot {
  const y2 = winDiff(raw.nominal.y2);
  const y5 = winDiff(raw.nominal.y5);
  const y10 = winDiff(raw.nominal.y10);
  const y30 = winDiff(raw.nominal.y30);
  const r5 = winDiff(raw.real.real5);
  const r10 = winDiff(raw.real.real10);
  const r30 = winDiff(raw.real.real30);

  const spot = raw.yahoo["XAUUSD=X"];
  const fut = raw.yahoo["GC=F"];
  const goldSeries = spot && spot.price != null ? spot : fut;
  const goldIsFutures = !(spot && spot.price != null);
  const goldObs = closes(goldSeries);
  const g = winRet(goldObs);
  const dxySeries = raw.yahoo["DX-Y.NYB"];
  const dxyObs = closes(dxySeries);
  const dx = winRet(dxyObs);

  const vixS = raw.yahoo["^VIX"];
  const spx = winRet(closes(raw.yahoo["^GSPC"]));
  const ndx = winRet(closes(raw.yahoo["^IXIC"]));
  const hyg = winRet(closes(raw.yahoo["HYG"]));
  const oil = winRet(closes(raw.yahoo["CL=F"]));
  const copper = winRet(closes(raw.yahoo["HG=F"]));
  const vix = winDiff(closes(vixS));

  const realVote = yieldVote(r10.d21, 0.05);
  const y2Vote = yieldVote(y2.d21, 0.05);
  const dxVote = softerVote(dx.d21, 0.6);
  const votes = [realVote, y2Vote, dxVote];
  const support = votes.filter((v) => v === "supportive").length;
  const restrict = votes.filter((v) => v === "restrictive").length;
  const abstain = votes.filter((v) => v === "abstain").length;

  let bias: "Bullish" | "Bearish" | "Neutral" | null = null;
  if (abstain >= 2) bias = null;
  else if (support >= 2 && support > restrict) bias = "Bullish";
  else if (restrict >= 2 && restrict > support) bias = "Bearish";
  else bias = "Neutral";

  const freshYield = y10.lastDate
    ? Date.parse(raw.retrievedAt) - Date.parse(`${y10.lastDate}T00:00:00Z`) < 5 * 86400000
    : false;
  const real5Contradicts = contradicts(realVote, r10.d5, 0.05);
  const y2Contradicts = contradicts(y2Vote, y2.d5, 0.05);
  const dxContradicts = contradicts(dxVote, dx.d5, 0.4);
  const losing = [real5Contradicts, y2Contradicts, dxContradicts].some(Boolean);

  let confidence: "Low" | "Medium" | "High" | null = null;
  if (bias === "Bullish" || bias === "Bearish") {
    const aligned = bias === "Bullish" ? support : restrict;
    const opposed = bias === "Bullish" ? restrict : support;
    if (!freshYield || opposed > 0) confidence = "Low";
    else if (aligned >= 3 && !losing) confidence = "High";
    else confidence = "Medium";
  } else if (bias === "Neutral") confidence = "Low";

  const goldUp21 = g.d21 != null && g.d21 > 0.8;
  const goldDown21 = g.d21 != null && g.d21 < -0.8;
  const goldFlat21 = g.d21 != null && Math.abs(g.d21) <= 0.8;

  let confirmation = "Bukti tidak cukup";
  let confirmationDetail = "Tidak ada tesis makro berarah yang bisa dikonfirmasi atau ditolak.";
  if (bias === "Bullish") {
    if (goldUp21) {
      confirmation = g.d5 != null && g.d5 < -0.4 ? "Sebagian" : "Terkonfirmasi";
      confirmationDetail = `Proksi emas ${signed(g.d21, 2, "%")} dalam ~21 sesi${g.d5 != null ? ` dan ${signed(g.d5, 2, "%")} dalam ~5 sesi` : ""}. ${confirmation === "Terkonfirmasi" ? "Harga bergerak searah dengan real yield dan dolar yang lebih longgar." : "Kenaikan 21 sesi searah, tetapi 5 sesi terakhir tidak. Konfirmasi hanya sebagian."}`;
    } else if (goldDown21) {
      confirmation = "Menyimpang";
      confirmationDetail = `Mata rantai makro condong mendukung emas, tetapi proksi emas ${signed(g.d21, 2, "%")} dalam ~21 sesi. Itu divergensi makro dan harga, bukan sinyal pembalikan.`;
    } else if (goldFlat21) {
      confirmation = "Sebagian";
      confirmationDetail = `Proksi emas masih di pita datar (${signed(g.d21, 2, "%")} dalam ~21 sesi) sementara mata rantai makro condong naik. Harga belum mengonfirmasi.`;
    }
  } else if (bias === "Bearish") {
    if (goldDown21) {
      confirmation = g.d5 != null && g.d5 > 0.4 ? "Sebagian" : "Terkonfirmasi";
      confirmationDetail = `Proksi emas ${signed(g.d21, 2, "%")} dalam ~21 sesi, searah dengan mata rantai makro yang menekan.`;
    } else if (goldUp21) {
      confirmation = "Menyimpang";
      confirmationDetail = `Mata rantai makro menekan emas, tetapi proksi emas ${signed(g.d21, 2, "%")} dalam ~21 sesi. Ketahanan yang tidak biasa terhadap mata rantai itu. Bukan alasan, sendirian, untuk melawan atau mengejar harga.`;
    } else if (goldFlat21) {
      confirmation = "Sebagian";
      confirmationDetail = "Mata rantai makro menekan, tetapi proksi emas masih di pita datar. Harga belum mengonfirmasi.";
    }
  } else if (bias === "Neutral") {
    confirmation = "Bukti tidak cukup";
    confirmationDetail =
      "Mata rantai inti tidak sepakat, jadi tidak ada satu tesis makro untuk dikonfirmasi emas. Pergerakan emas ditampilkan sendiri dan tidak disebut divergensi.";
  }

  const nowMs = Date.parse(raw.retrievedAt);
  const future = SCHEDULE.filter((e) => Date.parse(e.iso) >= nowMs);
  const next = future[0] ?? null;
  const liveEvent =
    SCHEDULE.find((e) => {
      const t = Date.parse(e.iso);
      return nowMs >= t - 36 * 3600000 && nowMs <= t + 18 * 3600000;
    }) ?? (next && Date.parse(next.iso) - nowMs < 7 * 86400000 ? next : null);

  const primary = bias
    ? [yieldSentence("US 10Y real yield", r10), yieldSentence("US 2Y", y2), retSentence("DXY", dx)]
        .filter((s) => !s.includes(GAP))
        .join(" ")
    : "BUKTI TIDAK CUKUP. Minimal dua dari real yield 10Y, US 2Y, dan DXY perlu perubahan 21 sesi sebelum bias makro emas ditetapkan. Data yang hilang tidak dianggap netral.";

  const secondary = [
    r10.d21 != null ? `Real yield, ~21 sesi: ${bps(r10.d21)}.` : null,
    y2.d21 != null ? `US 2Y, ~21 sesi: ${bps(y2.d21)}.` : null,
    dx.d21 != null ? `DXY, ~21 sesi: ${signed(dx.d21, 2, "%")}.` : null,
  ].filter((s): s is string => Boolean(s));

  let alert: string | null = null;
  if (bias === "Bullish" && losing) alert = "Tesis makro emas yang condong naik kehilangan konfirmasi.";
  if (bias === "Bearish" && losing) alert = "Tesis makro emas yang condong turun kehilangan konfirmasi.";

  const invalidation =
    bias === "Bullish"
      ? "Pembatalan bacaan makro naik: dalam jendela 5 sesi, real yield 10Y naik lebih dari 5 bps, US 2Y naik lebih dari 5 bps, dan DXY naik lebih dari 0,4%, ketiganya bersama. Satu yang berbalik hanya peringatan dini, belum pembatalan penuh."
      : bias === "Bearish"
        ? "Pembatalan bacaan makro turun: dalam jendela 5 sesi, real yield 10Y turun lebih dari 5 bps, US 2Y turun lebih dari 5 bps, dan DXY turun lebih dari 0,4%, ketiganya bersama."
        : "Tidak ada tesis berarah yang aktif, jadi tidak ada yang dibatalkan. Tesis butuh minimal dua dari real yield, 2Y, dan DXY bergerak ke arah yang sama bagi emas.";

  const thesis =
    bias === "Bullish"
      ? "Tesis kerja: latar makro emas condong naik karena biaya peluang dan mata rantai dolar sudah melonggar. Ini gambaran pita harga sekarang, bukan ramalan bahwa emas akan naik."
      : bias === "Bearish"
        ? "Tesis kerja: latar makro emas condong turun karena real yield dan/atau dolar mengencang. Ini bukan ramalan bahwa emas akan turun."
        : bias === "Neutral"
          ? "Tidak ada tesis berarah. Mata rantai inti tidak sepakat, atau masih di dalam pita datar."
          : "Tidak ada tesis kerja. Bukti belum mencapai batas minimum.";

  let pricedDetail =
    "Status priced-in butuh tiga lapisan: ekspektasi sebelum peristiwa, harga pasar atas ekspektasi itu (futures, OIS, atau distribusi tersirat yang bersumber), dan perubahan harga itu sesudah peristiwa. Fed funds futures, SOFR futures, dan OIS tidak diambil. Perkiraan kalender vendor, jika ada, bukan harga pasar itu. Statusnya karena itu tidak dipaksakan.";

  const cpi = raw.bls.CUUR0000SA0;
  const cpiSa = raw.bls.CUSR0000SA0;
  const core = raw.bls.CUUR0000SA0L1E;
  const coreSa = raw.bls.CUSR0000SA0L1E;
  const unemp = raw.bls.LNS14000000;
  const nfp = raw.bls.CES0000000001;
  const ahe = raw.bls.CES0500000003;
  const ppi = raw.bls.WPSFD4;
  const ppiCore = raw.bls.WPSFD49116;
  const jolts = raw.bls.JTS000000000000000JOL;
  const eci = raw.bls.CIU1010000000000A;

  const cpiYoy = yoyEnding(cpi, 0);
  const cpiAccel = cpiYoy != null && yoyEnding(cpi, 3) != null ? cpiYoy - (yoyEnding(cpi, 3) as number) : null;
  let inflation: "Hawkish" | "Dovish" | "Neutral" | "Insufficient" = "Insufficient";
  if (cpiYoy != null && cpiAccel != null) {
    if (cpiYoy >= 3 && cpiAccel > 0.1) inflation = "Hawkish";
    else if (cpiYoy <= 2.5 && cpiAccel < -0.1) inflation = "Dovish";
    else inflation = "Neutral";
  }
  const inflationDetail =
    cpiYoy == null
      ? `CPI tahun-ke-tahun tidak bisa dihitung. ${GAP}.`
      : `CPI-U NSA YoY ${num(cpiYoy, 2, "%")}${latestBls(cpi) ? ` (${latestBls(cpi)?.label})` : ""}. Perubahan YoY itu dibanding tiga bulan sebelumnya: ${signed(cpiAccel, 2, " pp")}. YoY inti NSA: ${num(yoyEnding(core, 0), 2, "%")}. Headline SA, 3 bulan disetahunkan: ${num(ann3(cpiSa), 2, "%")}. Aturan (model, bukan aturan Fed): ketat jika YoY ≥ 3,0 dan YoY naik lebih dari 0,1 pp dalam tiga bulan; longgar jika YoY ≤ 2,5 dan YoY turun lebih dari 0,1 pp; selain itu netral.`;

  const u = latestBls(unemp);
  const u3 = levelChg(unemp, 3);
  const nfpMonthly: number[] = [];
  if (nfp && nfp.length > 3) {
    for (let back = 0; back < 3; back++) {
      const a = blsAt(nfp, back);
      const b = blsAt(nfp, back + 1);
      if (a && b) nfpMonthly.push(a.value - b.value);
    }
  }
  const nfpAvg = nfpMonthly.length === 3 ? nfpMonthly.reduce((a, b) => a + b, 0) / 3 : null;
  const aheYoy = yoyEnding(ahe, 0);
  let employment: "Hawkish" | "Dovish" | "Neutral" | "Insufficient" = "Insufficient";
  if (u && u3 != null && nfpAvg != null) {
    if (u3 <= -0.1 && nfpAvg >= 150) employment = "Hawkish";
    else if (u3 >= 0.2 || nfpAvg <= 50) employment = "Dovish";
    else employment = "Neutral";
    if (employment === "Dovish" && aheYoy != null && aheYoy >= 4) employment = "Neutral";
    if (employment === "Hawkish" && aheYoy != null && aheYoy < 3) employment = "Neutral";
  }
  const employmentDetail =
    !u || nfpAvg == null
      ? `Pengangguran atau perubahan payroll tidak ada. ${GAP} untuk kaki tenaga kerja.`
      : `Pengangguran ${num(u.value, 1, "%")} (${u.label}), ${signed(u3, 1, " pp")} dalam tiga bulan. Nonfarm payroll, rata-rata perubahan 3 bulan ${signed(nfpAvg, 0, " ribu")} (bulanan terakhir ${signed(nfpMonthly[0] ?? null, 0, " ribu")}${prelim(latestBls(nfp))}). Upah per jam rata-rata YoY ${num(aheYoy, 2, "%")}, MoM ${num(mom(ahe), 2, "%")}. Aturan (model): ketat jika pengangguran turun minimal 0,1 pp dalam tiga bulan dan rata-rata payroll 3 bulan minimal +150 ribu; longgar jika pengangguran naik minimal 0,2 pp atau rata-rata payroll +50 ribu atau kurang. Campuran pekerjaan yang longgar dikembalikan ke netral jika YoY upah masih minimal 4%. Campuran yang ketat dikembalikan ke netral jika YoY upah di bawah 3%.`;

  let fedPressure = "Insufficient";
  if (inflation !== "Insufficient" && employment !== "Insufficient") {
    if (inflation === "Hawkish" && employment === "Hawkish") fedPressure = "Hawkish";
    else if (inflation === "Dovish" && employment === "Dovish") fedPressure = "Dovish";
    else if (
      (inflation === "Hawkish" || inflation === "Dovish") &&
      employment === "Neutral"
    )
      fedPressure = inflation;
    else if (
      (employment === "Hawkish" || employment === "Dovish") &&
      inflation === "Neutral"
    )
      fedPressure = employment;
    else fedPressure = "Neutral";
  } else if (inflation !== "Insufficient") fedPressure = inflation;
  else if (employment !== "Insufficient") fedPressure = employment;

  const fedPressureDetail = `Kaki inflasi ${legLabel(inflation)}. Kaki tenaga kerja ${legLabel(employment)}. Kaki pertumbuhan tidak cukup — PDB, ISM, penjualan ritel, produksi industri, barang tahan lama, dan keyakinan tidak diambil. Komposit ${legLabel(fedPressure as "Hawkish" | "Dovish" | "Neutral" | "Insufficient")}. Komposit yang sebagian bukan keputusan Fed dan tidak diubah menjadi probabilitas pangkas, tahan, atau naikkan suku bunga.`;

  const cpiFresh =
    latestBls(cpi)?.date === "2026-08-01" && nowMs < Date.parse("2026-10-14T12:30:00Z")
      ? "Vintase sekarang. CPI September dijadwalkan 14 Okt 2026 dan belum ada di jawaban ini."
      : latestBls(cpi)
        ? "Titik terakhir dari BLS. Bandingkan periodenya dengan kalender rilis sebelum dianggap masih berlaku."
        : GAP;
  const ppiFresh =
    latestBls(ppi)?.date === "2026-08-01" && nowMs < Date.parse("2026-10-15T00:00:00Z")
      ? "Vintase sekarang. FRED mencantumkan rilis PPI berikutnya 15 Okt 2026."
      : latestBls(ppi)
        ? "Titik terakhir dari BLS."
        : GAP;
  const nfpFresh =
    latestBls(nfp)?.date === "2026-09-01" && nowMs < Date.parse("2026-11-06T13:30:00Z")
      ? "Vintase sekarang. Employment Situation Oktober ada di jadwal BLS November pada 6 Nov 2026."
      : latestBls(nfp)
        ? "Titik terakhir dari BLS."
        : GAP;
  const joltsFresh =
    latestBls(jolts)?.date === "2026-08-01" && nowMs < Date.parse("2026-11-03T15:00:00Z")
      ? "Vintase sekarang. BLS mencantumkan JOLTS September 2026 pada 3 Nov 2026."
      : latestBls(jolts)
        ? "Titik terakhir dari BLS."
        : GAP;

  const nfpLast = latestBls(nfp);
  const nfpPrev = blsAt(nfp, 1);
  const nfpChg = levelChg(nfp, 1);
  const joltsLast = latestBls(jolts);
  const joltsPrev = blsAt(jolts, 1);

  const prints: TerminalSnapshot["prints"] = [
    {
      group: "Inflasi",
      rows: [
        indexPrint({
          name: "CPI",
          points: cpi,
          unit: "Indeks, 1982-84=100",
          frequency: "Bulanan",
          source: "BLS CUUR0000SA0 · CPI-U seluruh item, tidak disesuaikan musiman. https://data.bls.gov/timeseries/CUUR0000SA0",
          freshness: cpiFresh,
          showYoy: true,
        }),
        indexPrint({
          name: "CPI, disesuaikan musiman",
          points: cpiSa,
          unit: "Indeks",
          frequency: "Bulanan",
          source: "BLS CUSR0000SA0. MoM memakai indeks SA, perbandingan bulanan yang biasa.",
          freshness: cpiFresh,
          showMom: true,
        }),
        indexPrint({
          name: "CPI inti",
          points: core,
          unit: "Indeks",
          frequency: "Bulanan",
          source: "BLS CUUR0000SA0L1E · CPI-U semua item kurang makanan dan energi, tidak disesuaikan musiman.",
          freshness: cpiFresh,
          showYoy: true,
        }),
        indexPrint({
          name: "CPI inti, disesuaikan musiman",
          points: coreSa,
          unit: "Indeks",
          frequency: "Bulanan",
          source: "BLS CUSR0000SA0L1E.",
          freshness: cpiFresh,
          showMom: true,
        }),
        gapRow("PCE", "Indeks harga pengeluaran konsumsi pribadi BEA tidak diambil. Tidak ada umpan BEA tanpa kunci yang menjawab di build ini."),
        gapRow("PCE inti", "PCE inti BEA tidak diambil."),
        indexPrint({
          name: "PPI",
          points: ppi,
          unit: "Indeks",
          frequency: "Bulanan",
          source: "BLS WPSFD4 · PPI permintaan akhir, disesuaikan musiman.",
          freshness: ppiFresh,
          showYoy: true,
          showMom: true,
        }),
        indexPrint({
          name: "PPI inti",
          points: ppiCore,
          unit: "Indeks, Agu 2013=100",
          frequency: "Bulanan",
          source:
            "BLS WPSFD49116 · PPI permintaan akhir kurang makanan, energi, dan jasa perdagangan, disesuaikan musiman.",
          freshness: ppiFresh,
          showYoy: true,
          showMom: true,
        }),
        indexPrint({
          name: "Upah per jam rata-rata",
          points: ahe,
          unit: "Dolar",
          frequency: "Bulanan",
          source: "BLS CES0500000003 · upah per jam rata-rata, total swasta, disesuaikan musiman.",
          freshness: nfpFresh,
          showYoy: true,
          showMom: true,
        }),
      ],
    },
    {
      group: "Tenaga kerja",
      rows: [
        nfpLast && nfpPrev
          ? {
              name: "Payroll nonpertanian",
              period: nfpLast.label,
              actual: `${signed(nfpChg, 0, " ribu")} (level ${ints(nfpLast.value)} ribu)`,
              previous: `level ${ints(nfpPrev.value)} ribu`,
              revisedNote:
                "Perubahannya adalah selisih level pada vintase BLS sekarang. Payroll saat pertama terbit DATA TIDAK TERSEDIA." +
                prelim(nfpLast),
              forecast: GAP,
              unit: "Ribuan orang",
              frequency: "Bulanan",
              freshness: nfpFresh,
              source: "BLS CES0000000001 · seluruh pegawai, total nonpertanian, disesuaikan musiman.",
              observedChange: `Perubahan bulanan terakhir ${signed(nfpChg, 0, " ribu")}. Rata-rata 3 bulan ${signed(nfpAvg, 0, " ribu")}. Bukan kejutan.`,
              surprise: NO_SURPRISE,
            }
          : gapRow("Payroll nonpertanian", "BLS CES0000000001"),
        indexPrint({
          name: "Tingkat pengangguran",
          points: unemp,
          unit: "Persen",
          frequency: "Bulanan",
          source: "BLS LNS14000000 · tingkat pengangguran, 16 tahun ke atas, disesuaikan musiman.",
          freshness: nfpFresh,
          alreadyPercent: true,
        }),
        gapRow("Klaim pengangguran awal", "Klaim mingguan Departemen Tenaga Kerja tidak diambil."),
        gapRow("Klaim lanjutan", "Klaim lanjutan tidak diambil."),
        joltsLast
          ? {
              name: "Lowongan kerja JOLTS",
              period: joltsLast.label,
              actual: `${ints(joltsLast.value)} ribu`,
              previous: joltsPrev ? `${ints(joltsPrev.value)} ribu` : GAP,
              revisedNote: "Vintase sekarang. Lowongan saat pertama terbit DATA TIDAK TERSEDIA." + prelim(joltsLast),
              forecast: GAP,
              unit: "Ribuan",
              frequency: "Bulanan",
              freshness: joltsFresh,
              source: "BLS JTS000000000000000JOL · total lowongan nonpertanian, disesuaikan musiman.",
              observedChange: `Perubahan dibanding bulan sebelumnya ${signed(levelChg(jolts, 1), 0, " ribu")}. Bukan kejutan.`,
              surprise: NO_SURPRISE,
            }
          : gapRow("JOLTS", "BLS JTS000000000000000JOL"),
        gapRow("Ketenagakerjaan ADP", "ADP tidak diambil. Itu seri swasta, bukan cetakan BLS."),
        indexPrint({
          name: "Indeks biaya tenaga kerja",
          points: eci,
          unit: "Perubahan persen 12 bulan",
          frequency: "Triwulanan",
          source:
            "BLS CIU1010000000000A · kompensasi total, seluruh pekerja sipil, perubahan persen 12 bulan, tidak disesuaikan musiman.",
          freshness: "Titik terakhir dari BLS. Tanggal terbit ECI berikutnya tidak diambil, jadi ketertinggalan tidak dinilai.",
          alreadyPercent: true,
        }),
      ],
    },
    {
      group: "Pertumbuhan",
      rows: [
        gapRow("PDB", "PDB BEA tidak diambil."),
        gapRow("ISM manufaktur", "ISM tidak diambil. Tidak ada umpan resmi ISM tanpa kunci di build ini."),
        gapRow("ISM jasa", "ISM tidak diambil."),
        gapRow("PMI", "PMI S&P Global / ISM tidak diambil."),
        gapRow("Penjualan ritel", "Penjualan ritel Sensus tidak diambil."),
        gapRow("Produksi industri", "Produksi industri Federal Reserve tidak diambil."),
        gapRow("Barang tahan lama", "Barang tahan lama Sensus tidak diambil."),
        gapRow("Keyakinan konsumen", "Sentimen Conference Board / University of Michigan tidak diambil."),
      ],
    },
    {
      group: "Kondisi keuangan",
      rows: [
        gapRow("Indeks kondisi keuangan", "NFCI Chicago Fed dan indeks sejenis tidak diambil."),
        gapRow("Spread kredit (OAS)", "Option-adjusted spread yang bersumber tidak diambil. Harga HYG bukan spread."),
        {
          name: "Harga HYG (bukan spread)",
          period: hyg.lastDate ?? GAP,
          actual: num(hyg.last, 2),
          previous: hyg.from1 != null ? num(hyg.from1, 2) : GAP,
          revisedNote: "Kuotasi vendor. Bukan spread resmi.",
          forecast: GAP,
          unit: "Harga ETF, USD",
          frequency: "Harian",
          freshness: hyg.lastDate ? "Bar chart Yahoo terakhir" : GAP,
          source: "Chart Yahoo Finance HYG. ETF obligasi korporasi imbal hasil tinggi. Harga naik tidak otomatis berarti spread mengetat.",
          observedChange: `~5 sesi ${signed(hyg.d5, 2, "%")} · ~21 sesi ${signed(hyg.d21, 2, "%")}.`,
          surprise: NO_SURPRISE,
        },
        gapRow("Suku bunga KPR", "Seri suku bunga KPR utama tidak diambil."),
      ],
    },
  ];

  const yieldRows = [
    ["2Y", y2],
    ["5Y", y5],
    ["10Y", y10],
    ["30Y", y30],
    ["real 10Y", r10],
    ["real 5Y", r5],
    ["real 30Y", r30],
  ] as const;

  const tnxNote =
    raw.tnx != null && y10.last != null
      ? `Cek silang, bukan cetakan resmi kedua: indeks yield 10 tahun CBOE ^TNX kuotasi vendor terakhir ${raw.tnx.toFixed(3)} lawan Treasury 10Y CMT ${y10.last.toFixed(2)}% pada ${y10.lastDate}. Keduanya instrumen yang berbeda.`
      : "Cek silang CBOE ^TNX tidak tersedia.";

  const y2VsPath =
    "Jalur dana federal 12 bulan tidak diambil, jadi pergerakan 2Y tidak dibandingkan dengan perubahan kebijakan yang diharapkan. 2Y hanya yield par Treasury.";

  const realInterp =
    r10.d21 == null
      ? `Tafsir ditahan. ${GAP}.`
      : r10.d21 < -0.05
        ? `Real yield yang turun umumnya mendukung emas, karena biaya peluang memegang aset yang tidak berimbal hasil menjadi lebih rendah. Dalam ~21 sesi real yield 10Y ${bps(r10.d21)}. Ini kecenderungan, bukan instruksi, dan dicek terhadap dolar, sentimen risiko, dan posisi.`
        : r10.d21 > 0.05
          ? `Real yield yang naik umumnya menekan emas. Dalam ~21 sesi real yield 10Y ${bps(r10.d21)}. Ini tidak diterapkan otomatis: dolar, likuiditas, sentimen risiko, dan posisi dicek terpisah, dan tidak satu pun boleh mengarang seri yang hilang.`
          : `Real yield 10Y berada di pita datar ±5 bp dalam ~21 sesi (${bps(r10.d21)}). Tidak ada implikasi emas yang mendukung atau menekan dari real yield pada jendela ini.`;

  const dxyRelation =
    dx.d21 == null || bias == null
      ? "Apakah dolar mengonfirmasi atau menentang tesis makro emas ditahan sampai tesis dan jendela DXY keduanya ada."
      : dxVote === "supportive" && bias === "Bullish"
        ? "DXY mengonfirmasi tesis makro emas yang condong naik pada jendela 21 sesi (dolar lebih lemah)."
        : dxVote === "restrictive" && bias === "Bearish"
          ? "DXY mengonfirmasi tesis makro emas yang condong turun pada jendela 21 sesi (dolar lebih kuat)."
          : dxVote === "flat"
            ? "DXY di dalam pita datar dan tidak mengonfirmasi maupun menentang."
            : "DXY menentang tesis makro emas pada jendela 21 sesi.";

  const goldBars = goldSeries?.bars ?? [];
  const goldCloses = goldObs.map((p) => p.value);
  const logR: number[] = [];
  for (let i = 1; i < goldObs.length; i++) {
    const a = goldObs[i - 1].value;
    const b = goldObs[i].value;
    if (a > 0 && b > 0) logR.push(Math.log(b / a));
  }
  const rv = stdev(logR.slice(-20));
  const realized = rv == null ? null : rv * Math.sqrt(252) * 100;
  const atr14 = atr(goldBars, 14);
  const vols = goldBars.map((b) => b.volume).filter((v): v is number => v != null && v > 0);
  const vol20 = vols.length >= 20 ? vols.slice(-20).reduce((a, b) => a + b, 0) / 20 : null;
  const lastVol = vols.length ? vols[vols.length - 1] : null;

  let riskRegime = "Neutral";
  const vixLast = vix.last;
  if (vixLast != null && vixLast >= 22) riskRegime = "Risk-Off";
  else if (spx.d5 != null && spx.d5 <= -1.5) riskRegime = "Risk-Off";
  else if (spx.d5 != null && spx.d5 >= 1 && (vixLast == null || vixLast < 18) && (hyg.d5 == null || hyg.d5 > -0.4))
    riskRegime = "Risk-On";

  const riskDetail = `Aturan model, bukan fakta pasar: Risk-off jika VIX ≥ 22 atau S&P 500 turun minimal 1,5% dalam ~5 sesi. Risk-on jika S&P 500 naik minimal 1% dalam ~5 sesi, VIX di bawah 18, dan HYG tidak turun lebih dari 0,4% dalam ~5 sesi. Selain itu Netral. Sekarang: VIX ${num(vixLast, 2)}, S&P 500 ~5 sesi ${signed(spx.d5, 2, "%")}, HYG ~5 sesi ${signed(hyg.d5, 2, "%")}.`;

  let goldRiskNote =
    "Risk-off tidak dianggap otomatis mendukung emas. Dolar dicek sebelum cerita safe-haven dipakai.";
  if (riskRegime === "Risk-Off" && dx.d5 != null && dx.d5 > 0.25)
    goldRiskNote =
      "Risk-off berbarengan dengan DXY yang menguat dalam ~5 sesi. Permintaan dolar bisa mengimbangi permintaan safe-haven. Ini konflik yang perlu dilihat, bukan kesimpulan bahwa emas harus turun.";
  else if (riskRegime === "Risk-Off" && dx.d5 != null && dx.d5 < -0.25)
    goldRiskNote =
      "Risk-off dengan DXY yang melemah dalam ~5 sesi adalah campuran yang lebih sering memberi ruang bagi emas. Tetap bukan tawaran otomatis, dan bukan bukti mengapa pita harga ada di sini.";

  const mm = raw.cot?.managed ?? null;
  const mmNet = mm ? mm.long - mm.short : null;
  const mmNetChg = mm ? mm.longChg - mm.shortChg : null;
  const oi = raw.cot?.oi ?? null;

  const posReading = mm
    ? `Neto managed money (long dikurangi short, spread tidak dihitung) ${ints(mmNet)} kontrak${oi ? `, ${num(mmNet != null && oi ? (mmNet / oi) * 100 : null, 1, "%")} dari open interest` : ""}. Perubahan neto minggu ini: ${signed(mmNetChg, 0, " kontrak")}. Itu perubahan yang teramati. Bukan ramalan bahwa harga akan berbalik, dan bukan tuduhan posisi sesak.`
    : `Posisi ${GAP}.`;

  const lseFresh = raw.lseGold != null && Number.isFinite(Date.parse(raw.lseGold.asOf)) && Date.now() - Date.parse(raw.lseGold.asOf) < 6 * 60 * 60 * 1000;
  const goldInstrument = lseFresh
    ? "Kuotasi XAU/USD, London Strategic Edge"
    : goldIsFutures
      ? "Futures emas COMEX, GC=F"
      : "Kuotasi spot XAUUSD, XAUUSD=X";
  const goldDisclaimer = lseFresh
    ? "Harga terakhir dan chart 15 menit dari London Strategic Edge. Bukan fixing LBMA, bukan settlement COMEX, dan bukan harga broker. Arsip situs itu baru mulai 1 Oktober 2026, jadi riwayat harian, ATR, dan jarak 5 sesi tetap dari rangkaian yang lebih panjang. Volume pada chart 15 menit bukan volume bursa."
    : goldIsFutures
      ? "Spot XAUUSD tidak dikembalikan vendor. Harga yang dipakai adalah futures emas COMEX (GC=F), proksi yang likuid, bukan fixing LBMA dan bukan settlement resmi COMEX. Jangan dilabel ulang sebagai spot."
      : "Simbol spot vendor XAUUSD=X. Bukan fixing LBMA. Futures hanya ditampilkan jika spot tidak ada.";

  const movePhrase = (vote: Vote, label: string, text: string): string => {
    if (vote === "abstain") return `${label}: ${GAP}. Tidak ada implikasi emas yang diambil.`;
    if (vote === "flat") return `${label} di dalam pita datar. Tidak ada implikasi emas yang diambil.`;
    if (vote === "supportive") return `${text} Aturan model pada pergerakan yang teramati. Bukan hukum, dan bukan transaksi.`;
    return `${text} Aturan model pada pergerakan yang teramati. Bukan hukum, dan bukan transaksi.`;
  };

  const matrix: TerminalSnapshot["matrix"] = [
    {
      variable: "Real yield 10Y",
      move: `~21 sesi ${bps(r10.d21)} · terakhir ${num(r10.last, 2, "%")}`,
      interpretation: movePhrase(
        realVote,
        "Real yield",
        realVote === "supportive"
          ? "Real yield lebih rendah: umumnya mendukung emas (biaya peluang)."
          : "Real yield lebih tinggi: umumnya menekan emas (biaya peluang).",
      ),
    },
    {
      variable: "US 2Y",
      move: `~21 sesi ${bps(y2.d21)} · terakhir ${num(y2.last, 2, "%")}`,
      interpretation: movePhrase(
        y2Vote,
        "2Y",
        y2Vote === "supportive"
          ? "2Y lebih rendah: konsisten dengan harga kebijakan ujung pendek yang lebih longgar. Mendukung emas hanya sebagai proksi, bukan probabilitas dana federal."
          : "2Y lebih tinggi: konsisten dengan harga kebijakan ujung pendek yang lebih ketat. Menekan emas hanya sebagai proksi.",
      ),
    },
    {
      variable: "DXY",
      move: `~21 sesi ${signed(dx.d21, 2, "%")} · terakhir ${num(dx.last, 3)}`,
      interpretation: movePhrase(
        dxVote,
        "DXY",
        dxVote === "supportive"
          ? "Dolar lebih lemah: umumnya mendukung emas."
          : "Dolar lebih kuat: umumnya menekan emas.",
      ),
    },
    {
      variable: "Ekspektasi Fed",
      move: GAP,
      interpretation:
        "Probabilitas tahan, pangkas, dan naikkan suku bunga DATA TIDAK TERSEDIA. Tidak ada implikasi emas dari jalur yang terminal ini tidak punya.",
    },
    {
      variable: "Sentimen risiko",
      move: riskRegime === "Risk-Off" ? "Risk-off" : riskRegime === "Risk-On" ? "Risk-on" : "Netral",
      interpretation: "Bergantung konteks. Risk-off tidak dikode sebagai emas naik. Lihat cek dolar.",
    },
    {
      variable: "Posisi",
      move: mm ? `Neto managed money ${ints(mmNet)}` : GAP,
      interpretation:
        "Bukan sinyal arah emas. Persentil historis DATA TIDAK TERSEDIA, jadi risiko posisi long yang sesak tidak ditetapkan.",
    },
    {
      variable: "Proksi emas",
      move: `~21 sesi ${signed(g.d21, 2, "%")} · terakhir ${num(g.last, 2)}`,
      interpretation:
        confirmation === "Terkonfirmasi"
          ? "Harga mengonfirmasi tesis makro pada jendela 21 sesi."
          : confirmation === "Menyimpang"
            ? "Harga tidak mengonfirmasi tesis makro."
            : confirmation === "Sebagian"
              ? "Konfirmasi harga hanya sebagian."
              : "Tidak ada uji konfirmasi, karena tidak ada tesis makro berarah.",
    },
  ];

  let divClass = "Bukti tidak cukup";
  let divDetail = "Uji divergensi butuh tesis makro berarah dan jendela emas. Salah satunya tidak ada, atau mata rantainya pecah.";
  if (bias === "Bullish" && goldUp21) {
    divClass = "Konfirmasi makro kuat";
    divDetail = "Real yield, ujung pendek, dan/atau dolar melonggar, dan proksi emas lebih tinggi dalam ~21 sesi. Kasus A. Ini konfirmasi pita harga, bukan prediksi.";
  } else if (bias === "Bullish" && goldDown21) {
    divClass = "Divergensi makro/harga";
    divDetail = "Mata rantai makro lebih longgar bagi emas, tetapi proksi emas lebih rendah dalam ~21 sesi. Kasus B. Jangan langsung menyimpulkan pembalikan.";
  } else if (bias === "Bearish" && goldUp21) {
    divClass = "Emas menunjukkan ketahanan yang tidak biasa";
    divDetail = "Mata rantai makro menekan, tetapi proksi emas lebih tinggi dalam ~21 sesi. Kasus C. Ditandai untuk diperiksa. Penyebab tidak ditetapkan.";
  } else if (bias === "Bearish" && goldDown21) {
    divClass = "Pita menekan terkonfirmasi harga";
    divDetail = "Mata rantai makro menekan dan proksi emas lebih rendah dalam ~21 sesi. Kesejajaran, bukan ramalan bahwa pergerakan berlanjut.";
  }

  const hypotheses =
    divClass === "Divergensi makro/harga" || divClass === "Emas menunjukkan ketahanan yang tidak biasa"
      ? [
          "Penjelasan yang mungkin, tidak satu pun yang ditetapkan: pergerakan sudah ada di harga, posisi, data lain di hari yang sama, likuiditas, lokasi di rentang harian, permintaan dolar saat risk-off, atau perubahan komunikasi Fed.",
          "Terminal tidak memilih satu. Jalur peristiwa intraday dan fed funds futures DATA TIDAK TERSEDIA, jadi beberapa penjelasan itu tidak bisa diuji di sini.",
          mm
            ? `Fakta posisi yang bisa disebut tanpa memilih penyebab: neto managed money ${ints(mmNet)} kontrak, perubahan neto mingguan ${signed(mmNetChg, 0)}. Tanpa persentil historis ini bukan bukti posisi sesak.`
            : "Posisi tidak tersedia untuk dipakai sebagai bukti.",
        ]
      : ["Tidak ada kasus divergensi yang terbuka, jadi tidak ada hipotesis penyebab."];

  const pastEvents = [
    { name: "CPI (Agustus 2026)", date: "2026-09-11" },
    { name: "Keputusan FOMC (September)", date: "2026-09-16" },
    { name: "Employment Situation (September 2026)", date: "2026-10-02" },
  ];

  const releaseReactions = pastEvents.map((e) => ({
    event: e.name,
    date: e.date,
    gold: sessionMove(goldObs, e.date, "pct"),
    y2: sessionMove(raw.nominal.y2, e.date, "bps"),
    real: sessionMove(raw.real.real10, e.date, "bps"),
    dxy: sessionMove(dxyObs, e.date, "pct"),
  }));

  const changed: string[] = [];
  if (g.d1 != null && Math.abs(g.d1) >= 0.3) changed.push(`Proksi emas ${signed(g.d1, 2, "%")} pada sesi terakhir.`);
  if (r10.d1 != null && Math.abs(r10.d1) >= 0.02) changed.push(`Real yield 10Y ${bps(r10.d1)} pada sesi Treasury terakhir (${r10.lastDate}).`);
  if (y2.d1 != null && Math.abs(y2.d1) >= 0.02) changed.push(`US 2Y ${bps(y2.d1)} pada sesi Treasury terakhir.`);
  if (dx.d1 != null && Math.abs(dx.d1) >= 0.15) changed.push(`DXY ${signed(dx.d1, 2, "%")} pada sesi terakhir.`);
  if (vix.d1 != null && Math.abs(vix.d1) >= 1) changed.push(`VIX ${signed(vix.d1, 2, " poin")} pada sesi terakhir.`);
  if (!changed.length) changed.push("Tidak ada pergerakan di luar pita datar pada sesi terakhir untuk proksi emas, 2Y, real yield 10Y, atau DXY.");

  const recentNews = raw.news.filter((n) => {
    const t = Date.parse(n.pubDate);
    return Number.isFinite(t) && nowMs - t < 5 * 86400000 && nowMs - t > -86400000;
  });

  const ma20 = ma(goldCloses, 20);
  const ma60 = ma(goldCloses, 60);
  const lastPx = g.last;
  let techRegime = "DATA TIDAK TERSEDIA";
  if (lastPx != null && ma20 != null && ma60 != null) {
    if (lastPx > ma20 && ma20 > ma60) techRegime = "Struktur harian: naik. Harga di atas rata-rata 20 sesi, dan rata-rata itu di atas rata-rata 60 sesi.";
    else if (lastPx < ma20 && ma20 < ma60) techRegime = "Struktur harian: turun. Harga di bawah rata-rata 20 sesi, dan rata-rata itu di bawah rata-rata 60 sesi.";
    else techRegime = "Struktur harian: campuran. Harga serta rata-rata 20 dan 60 sesi tidak sepakat.";
  }
  const window60 = goldCloses.slice(-60);
  const hi = window60.length ? Math.max(...window60) : null;
  const lo = window60.length ? Math.min(...window60) : null;
  const location =
    lastPx != null && hi != null && lo != null && hi > lo
      ? `Harga terakhir berada ${num(((lastPx - lo) / (hi - lo)) * 100, 0, "%")} dari jarak terendah 60 sesi ke tertinggi 60 sesi. Itu statistik lokasi, bukan level support atau resistance.`
      : `Lokasi rentang ${GAP}.`;

  const separation =
    bias === "Bullish" && techRegime.startsWith("Struktur harian: turun")
      ? "Lingkungan makro condong naik, tetapi struktur harga harian tidak mengonfirmasi. Ini bukan instruksi transaksi."
      : bias === "Bearish" && techRegime.startsWith("Struktur harian: naik")
        ? "Lingkungan makro condong turun, tetapi struktur harga harian tidak mengonfirmasi. Ini bukan instruksi transaksi."
        : `Makro: ${bias === "Bullish" ? "condong naik" : bias === "Bearish" ? "condong turun" : bias === "Neutral" ? "netral" : "BUKTI TIDAK CUKUP"}. Teknikal: ${techRegime} Kedua lapisan tetap terpisah. Ini bukan instruksi transaksi.`;

  const y2Daily = raw.nominal.y2.slice(1).map((p, i) => (p.value - raw.nominal.y2[i].value) * 100);
  const y10Daily = raw.nominal.y10.slice(1).map((p, i) => (p.value - raw.nominal.y10[i].value) * 100);

  const eventPhase =
    liveEvent == null ? "none" : nowMs < Date.parse(liveEvent.iso) ? "pre" : "post";

  const KEEP_LOW =
    /cpi|pce|ppi|payroll|non-farm|unemployment|jobless|claims|jolts|\badp\b|ism|pmi|gdp|retail|confidence|sentiment|inflation|durable|industrial production|employment cost|average hourly/i;
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const ffWhen = (iso: string) => {
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return iso;
    const weekday = days[new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay()];
    return `${weekday} ${Number(m[3])} ${months[Number(m[2]) - 1]} · ${m[4]}:${m[5]} ET`;
  };
  const filled = (value: string) => (value.trim() ? value.trim() : GAP);
  const calendarRows = [...raw.calendar]
    .filter((e) => e.impact === "High" || e.impact === "Medium" || (e.impact === "Low" && KEEP_LOW.test(e.title)))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      when: ffWhen(e.date),
      title: e.title,
      impact: e.impact || GAP,
      forecast: filled(e.forecast),
      previous: filled(e.previous),
    }));
  const forecastCount = raw.calendar.filter((e) => e.forecast.trim()).length;
  const calendarNote = raw.calendar.length
    ? `Ekspor mingguan Forex Factory, ${forecastCount} baris USD yang kolom perkiraannya terisi. Kalender vendor, bukan BLS, BEA, Fed, atau CME. Berkasnya hanya punya perkiraan dan sebelumnya — tanpa aktual — jadi kejutan tidak dihitung. Hanya minggu ini, jadi CPI 14 Okt belum ada. HTML kalender kena pemeriksaan bot dan tidak di-scrape. Ekspor dibatasi dan dipakai ulang sampai 50 menit.`
    : "Ekspor mingguan Forex Factory tidak diambil. Konsensus tetap DATA TIDAK TERSEDIA. Hanya JSON publik minggu ini yang dipakai; HTML situsnya di balik pemeriksaan bot.";

  const mentions = (name: string, title: string) => {
    const n = name.toLowerCase();
    const t = title.toLowerCase();
    if (n.includes("minute") && t.includes("minute")) return true;
    if (/\bcpi\b/.test(n) && /\bcpi\b/.test(t)) return true;
    if (/\bppi\b/.test(n) && /\bppi\b/.test(t)) return true;
    if (n.includes("jolts") && t.includes("jolt")) return true;
    if (n.includes("employment") && /non-farm|unemployment rate|average hourly/.test(t)) return true;
    if (n.includes("fomc meeting") && /federal funds|fomc statement|interest rate/.test(t)) return true;
    return false;
  };
  const ffHit =
    liveEvent == null
      ? []
      : raw.calendar.filter((e) => {
          const at = Date.parse(e.date);
          const target = Date.parse(liveEvent.iso);
          return mentions(liveEvent.name, e.title) && Number.isFinite(at) && Math.abs(at - target) < 36 * 3600000;
        });
  const ffLine =
    liveEvent == null
      ? ""
      : !raw.calendar.length
        ? `Konsensus vendor: ${GAP}.`
        : ffHit.length === 0
          ? `Berkas minggu ini Forex Factory tidak mencantumkan ${liveEvent.name}. Konsensusnya tetap ${GAP}. Minggu berikutnya tidak ada di ekspor.`
          : ffHit
              .map((e) =>
                e.forecast.trim()
                  ? `${e.title}: perkiraan vendor ${e.forecast.trim()}, sebelumnya ${filled(e.previous)}.`
                  : `${e.title}: tercantum, kolom perkiraan kosong, jadi konsensus tetap ${GAP}.`,
              )
              .join(" ");

  const eventBlocks =
    liveEvent == null
      ? [{ heading: "Tidak ada peristiwa besar di jendela ini", body: "CPI, PCE, NFP, FOMC, dan tanggal notulen tidak berada di jendela sebelum/sesudah. Kalender di bawah tetap daftar pantauan." }]
      : eventPhase === "pre"
        ? [
            {
              heading: "Sebelum",
              body: `Konsensus peristiwa ini: ${ffLine} Ini kolom kalender vendor jika ada, bukan harga tersirat pasar. Pengaturan kebijakan yang teramati: target dana federal efektif ${raw.effr ? `${raw.effr.targetLow.toFixed(2)}–${raw.effr.targetHigh.toFixed(2)}%` : GAP} per ${raw.effr?.date ?? "tidak ada"} (NY Fed). Probabilitas tersirat pasar dan jalur kebijakan yang diharapkan: ${GAP}.`,
            },
            {
              heading: "Pasar yang masuk",
              body: `Real yield 10Y ${num(r10.last, 2, "%")} (${r10.lastDate ?? "tidak ada"}). US 2Y ${num(y2.last, 2, "%")}. DXY ${num(dx.last, 3)}. Proksi emas ${num(g.last, 2)} (${goldInstrument}). Posisi: ${mm ? `neto managed money ${ints(mmNet)} per ${raw.cot?.date}` : GAP}. Volatilitas tersirat di sekitar peristiwa: ${GAP}.`,
            },
            {
              heading: "Yang tidak diklaim",
              body: `${liveEvent.source} Teks peristiwanya belum ada. Tidak ada yang di panel sebelum peristiwa ini merupakan prediksi susunan kata atau reaksi emas.`,
            },
          ]
        : [
            { heading: "Sebelum", body: `Jalur tersirat pasar sebelum peristiwa tidak disimpan, karena futures juga ${GAP} sebelum peristiwa.` },
            { heading: "Aktual", body: `Teks atau data yang terbit untuk ${liveEvent.name} tidak diambil setelah stempel waktunya. ${GAP}. Judul berita tidak dipakai sebagai pengganti.` },
            { heading: "Reaksi langsung", body: "Jalur T+5 menit dan T+15 menit DATA TIDAK TERSEDIA. Terminal ini hanya punya bar harian." },
            { heading: "Penyesuaian harga", body: "Perubahan ekspektasi suku bunga: DATA TIDAK TERSEDIA. Perubahan yield di hari yang sama, setelah penutupan Treasury ada, adalah fakta yield, bukan bukti penyesuaian jalur kebijakan." },
            { heading: "Tindak lanjut", body: "Tindak lanjut 1 jam dan 4 jam DATA TIDAK TERSEDIA. Penutupan harian berikutnya adalah horizon pertama yang bisa diukur, dan itu mencampur seluruh sesi." },
            { heading: "Penilaian akhir", body: "Bukti tidak cukup. Priced-in lawan penyesuaian harga tidak ditetapkan." },
          ];

  const cotRows = raw.cot
    ? (["managed", "producer", "swap", "other"] as const).map((key) => {
        const book = raw.cot![key];
        const name =
          key === "managed"
            ? "Uang kelolaan"
            : key === "producer"
              ? "Produsen / pedagang"
              : key === "swap"
                ? "Dealer swap"
                : "Pelapor lain";
        const net = book.long - book.short;
        const netChg = book.longChg - book.shortChg;
        return {
          book: name,
          long: ints(book.long),
          short: ints(book.short),
          spread: book.spread == null ? "—" : ints(book.spread),
          net: ints(net),
          weekly: signed(netChg, 0),
          pctOi: oi ? num((net / oi) * 100, 1, "%") : GAP,
        };
      })
    : [];

  const claimsAhead = raw.calendar.find((e) => /unemployment claims/i.test(e.title) && Date.parse(e.date) > nowMs);
  const atr5 = atr(goldBars, 5);
  const atr20 = atr(goldBars, 20);
  const rangeRatio = atr5 != null && atr20 != null && atr20 > 0 ? atr5 / atr20 : null;
  const goldWalked = g.d5 != null && Math.abs(g.d5) >= 1.2;
  const dollarWalked = dx.d5 != null && Math.abs(dx.d5) >= 0.6;
  const yieldWalked = y2.d5 != null && Math.abs(y2.d5) >= 0.05;
  const walked = goldWalked || dollarWalked || yieldWalked;
  const hot = rangeRatio != null && rangeRatio >= 1.25;
  const newsName = liveEvent?.name ?? next?.name ?? null;
  const newsWhen = liveEvent?.when ?? next?.when ?? null;
  const newsAhead = liveEvent != null && eventPhase === "pre";
  let preLabel = "Insufficient Evidence";
  if (newsName == null) preLabel = "No high-impact item in the window";
  else if (!newsAhead && eventPhase === "post") preLabel = "After-news bar not clean";
  else if (rangeRatio == null || g.d5 == null) preLabel = "Insufficient Evidence";
  else if (walked && hot) preLabel = "Running ahead";
  else if (walked && !hot) preLabel = "Moving, range not wide";
  else if (!walked && hot) preLabel = "Wide range, little travel";
  else preLabel = "Quiet into the news";
  const inputNote =
    preLabel === "Running ahead"
      ? "Harga sudah berjalan dan rentang harian lebih lebar dari rata-rata 20 sesinya sendiri."
      : preLabel === "Moving, range not wide"
        ? "Harga sudah berjalan, tetapi rentang harian tidak lebih lebar dari rata-rata 20 sesinya sendiri."
        : preLabel === "Wide range, little travel"
          ? "Rentangnya lebar, tetapi pergerakan bersih 5 sesi masih di dalam pita."
          : preLabel === "Quiet into the news"
            ? "Baik rentang maupun pergerakan 5 sesi tidak meninggi."
            : preLabel === "After-news bar not clean"
              ? "Waktu rilis sudah lewat di dalam bar harian yang juga memuat jam-jam sebelumnya."
              : "Jalur sebelum berita tidak bisa diukur.";
  const prePath = newsName
    ? `Menuju ${newsName}${newsWhen ? ` (${newsWhen})` : ""}: emas ${signed(g.d5, 2, "%")}, DXY ${signed(dx.d5, 2, "%")}, 2Y ${bps(y2.d5)} dalam 5 sesi. Rata-rata rentang emas ${num(atr5, 2)} lawan ${num(atr20, 2)} dalam 20 sesi${rangeRatio == null ? "" : ` (${rangeRatio.toFixed(2)}×)`}. ${inputNote}`
    : "Tidak ada item berdampak tinggi yang bertanggal di dalam jendela ini.";
  let pricedInLabel = "Tidak pasti";
  pricedDetail = `${prePath} Jalur itu sudah ada di chart, jadi bukan vonis priced-in. Vonisnya adalah apakah rilis yang sebenarnya masih memaksa pergerakan baru. Rilis dan sesi sesudahnya belum keduanya ada. Sesi berikutnya yang kecil berarti pergerakan sebelumnya sudah menyelesaikan pekerjaan. Sesi yang lebih besar atau berlawanan berarti berita belum ada di harga.`;
  const goldPoints = winDiff(goldObs);
  const stretchRatio = atr14 != null && atr14 > 0 && goldPoints.d5 != null ? goldPoints.d5 / atr14 : null;
  const stretchAbs = stretchRatio == null ? null : Math.abs(stretchRatio);
  const stretchLabel = stretchAbs == null ? GAP : stretchAbs < 1 ? "Belum mulur" : stretchAbs < 2 ? "Sudah berjalan" : "Sudah mulur";
  const stretchDetail =
    stretchRatio == null || atr14 == null
      ? "Jarak 5 sesi atau ATR(14) tidak lengkap, jadi perbandingan tidak dibuat."
      : `${newsName ? `Menjelang ${newsName}. ` : ""}Emas bergerak ${signed(goldPoints.d5, 1)} USD dalam 5 sesi, setara ${signed(stretchRatio, 2)} kali ATR(14) harian (${num(atr14, 1)} USD). Di bawah 1 ATR belum mulur. Dari 1 sampai di bawah 2 sudah berjalan. 2 atau lebih sudah mulur. Estimasi model dari penutupan. Bukan sinyal, dan bukan vonis priced-in.`;
  const knownFinding = prePath;
  const tapeFinding = "Teks atau angka aktual rilis ini belum diambil. Perkiraan kosong di kalender bukan pengganti. Tanpa aktual, pergerakan sebelumnya tidak bisa dicocokkan ke suatu hasil.";
  const aheadFinding = `Sesi sesudah rilis belum ada, jadi status priced-in tetap tidak pasti.${claimsAhead?.forecast.trim() ? ` Klaim masih mendahului aktualnya: perkiraan vendor ${claimsAhead.forecast.trim()}, sebelumnya ${claimsAhead.previous.trim() || GAP}.` : ""} Volume intraday menuju rilis ${GAP}.`;

  const sources: TerminalSnapshot["sources"] = [
    {
      name: "Treasury",
      ok: raw.nominal.y10.length > 0 && raw.real.real10.length > 0,
      detail: raw.nominal.y10.length ? `CMT sampai ${y10.lastDate}` : "Kurva yield tidak diambil",
    },
    {
      name: "BLS",
      ok: Boolean(latestBls(cpi) || latestBls(nfp)),
      detail: latestBls(cpi) ? `CPI ${latestBls(cpi)?.label}` : "Vintase makro tidak diambil",
    },
    {
      name: "NY Fed",
      ok: Boolean(raw.effr),
      detail: raw.effr ? `EFFR ${raw.effr.rate.toFixed(2)}% ${raw.effr.date}` : "EFFR tidak diambil",
    },
    {
      name: "CFTC",
      ok: Boolean(raw.cot),
      detail: raw.cot ? `Futures terdisagregasi ${raw.cot.date}` : "COT tidak diambil",
    },
    {
      name: "Yahoo",
      ok: Boolean(goldSeries && goldSeries.price != null),
      detail: goldSeries?.price != null ? goldInstrument : "Kuotasi emas tidak diambil",
    },
    {
      name: "Fed press",
      ok: raw.news.length > 0,
      detail: raw.news.length ? `${raw.news.length} item kebijakan moneter` : "RSS tidak diambil",
    },
    {
      name: "FF calendar",
      ok: raw.calendar.length > 0,
      detail: raw.calendar.length ? `${forecastCount} perkiraan USD minggu ini` : "Ekspor mingguan tidak diambil",
    },
  ];

  const failed = raw.errors.map((e) => `${e.source}: ${e.message}`).slice(0, 6);
  const h4Bars = fourHour(raw.goldHours);
  const m15Bars = lseFresh ? raw.lseGold!.m15 : raw.goldM15.slice(-240);
  const dailyFrame = frameOf(goldBars, "Harian");
  const h4Frame = frameOf(h4Bars, "4 jam dari bar 60 menit COMEX");
  const m15Frame = frameOf(m15Bars, lseFresh ? "15 menit XAU/USD London Strategic Edge" : "15 menit COMEX");

  const y10Vote = yieldVote(y10.d21, 0.05);
  const linkImpact = (vote: Vote) =>
    vote === "supportive" ? "Mendukung emas" : vote === "restrictive" ? "Menekan emas" : vote === "flat" ? "Netral" : GAP;
  const linkStrength = (vote: Vote, abs: number | null, high: number) => {
    if (vote === "abstain" || abs == null) return "—";
    if (vote === "flat") return "Rendah";
    return Math.abs(abs) >= high ? "Tinggi" : "Sedang";
  };
  const modelImpact = (leg: string) =>
    leg === "Hawkish" ? "Menekan emas" : leg === "Dovish" ? "Mendukung emas" : leg === "Neutral" ? "Netral" : GAP;
  const modelStrength = (leg: string) => (leg === "Insufficient" ? "—" : leg === "Neutral" ? "Rendah" : "Sedang");
  const finalBias =
    bias === "Bullish" && confidence === "High" && confirmation === "Terkonfirmasi"
      ? "Bullish kuat"
      : bias === "Bearish" && confidence === "High" && confirmation === "Terkonfirmasi"
        ? "Bearish kuat"
        : bias === "Bullish"
          ? "Bullish"
          : bias === "Bearish"
            ? "Bearish"
            : bias === "Neutral"
              ? "Netral"
              : GAP;
  const marketLinks = [realVote, y2Vote, y10Vote, dxVote];
  const marketSupport = marketLinks.filter((v) => v === "supportive").length;
  const marketRestrict = marketLinks.filter((v) => v === "restrictive").length;
  const confluenceCall =
    confirmation === "Menyimpang"
      ? "DIVERGENSI"
      : confirmation === "Terkonfirmasi" && (marketSupport >= 2 || marketRestrict >= 2)
        ? "KONFLUENSI"
        : "CAMPURAN";
  const desk: TerminalSnapshot["desk"] = {
    regime: {
      inflation: `${legLabel(inflation)}. ${inflationDetail}`,
      labor: `${legLabel(employment)}. ${employmentDetail}`,
      growth: `${GAP}. PDB dan indikator pertumbuhan tidak diambil.`,
      financial: `${GAP}. Indeks kondisi keuangan tidak diambil. Harga HYG bukan kondisi keuangan.`,
    },
    fedView: {
      current: raw.effr ? `${raw.effr.targetLow.toFixed(2)}–${raw.effr.targetHigh.toFixed(2)}% · EFFR ${raw.effr.rate.toFixed(2)}%` : GAP,
      policyBias: `Model, bukan keputusan Fed: ${legLabel(fedPressure as "Hawkish" | "Dovish" | "Neutral" | "Insufficient")}.`,
      expected: `${GAP}. Dot plot, pidato, dan probabilitas rapat tidak diambil. Tidak ada angka yang dihitung sendiri.`,
      repricing: "Tidak diukur. Perubahan yield Treasury bukan bukti bahwa jalur suku bunga sudah diubah.",
    },
    lenses: {
      macro: finalBias,
      yield: `Real yield: ${linkImpact(realVote)}. 2Y: ${linkImpact(y2Vote)}.`,
      usd: linkImpact(dxVote),
      positioning: "Tidak dinilai sebagai arah. COT hanya konteks. Tanpa persentil, posisi sesak tidak disebut.",
      risk: "Tidak otomatis. Risk-off tidak sama dengan emas naik.",
    },
    finalBias,
    finalNote:
      "Bias akhir ini hanya makro. Bukan sinyal masuk. H4 tidak ada, jadi tidak digabung dengan teknikal.",
    technicalBias:
      h4Frame.bias === GAP
        ? `${dailyFrame.bias} pada grafik harian. 4 jam ${GAP}.`
        : `${h4Frame.bias} pada 4 jam. Harian: ${dailyFrame.bias}. Bukan bagian dari bias makro.`,
    overall: "Kondisi keseluruhan tidak disimpulkan menjadi transaksi. Makro dan H4 tidak disejajarkan.",
    confluence: [
      { factor: "Inflasi", condition: legLabel(inflation), impact: modelImpact(inflation), strength: modelStrength(inflation) },
      { factor: "Tenaga kerja", condition: legLabel(employment), impact: modelImpact(employment), strength: modelStrength(employment) },
      {
        factor: "Fed",
        condition: `Target saat ini teramati. Jalur ke depan ${GAP}.`,
        impact: GAP,
        strength: "—",
      },
      {
        factor: "Yield 2Y",
        condition: `~21 sesi ${bps(y2.d21)}`,
        impact: linkImpact(y2Vote),
        strength: linkStrength(y2Vote, y2.d21, 0.15),
      },
      {
        factor: "Yield 10Y",
        condition: `~21 sesi ${bps(y10.d21)}`,
        impact: linkImpact(y10Vote),
        strength: linkStrength(y10Vote, y10.d21, 0.15),
      },
      {
        factor: "Real yield",
        condition: `~21 sesi ${bps(r10.d21)}`,
        impact: linkImpact(realVote),
        strength: linkStrength(realVote, r10.d21, 0.15),
      },
      {
        factor: "USD",
        condition: `DXY ~21 sesi ${signed(dx.d21, 2, "%")}`,
        impact: linkImpact(dxVote),
        strength: linkStrength(dxVote, dx.d21, 1.2),
      },
      { factor: "COT", condition: mm ? `Neto uang kelolaan ${ints(mmNet)}` : GAP, impact: "Tidak dinilai", strength: "—" },
      { factor: "Sentimen risiko", condition: riskRegime === "Risk-Off" ? "Risk-off" : riskRegime === "Risk-On" ? "Risk-on" : "Netral", impact: "Tidak otomatis", strength: "Rendah" },
    ],
    confluenceCall,
    pricedStatus: "Tidak pasti",
    stretch: { label: stretchLabel, detail: stretchDetail },
    h4: {
      structure: h4Frame.structure,
      support: h4Frame.support,
      resistance: h4Frame.resistance,
      location: `${h4Frame.location} ${h4Frame.note}`,
      bias: h4Frame.bias,
      alignment:
        h4Frame.bias === GAP
          ? `Makro: ${finalBias}. 4 jam: ${GAP}. Keselarasan tidak dinilai.`
          : (finalBias.startsWith("Bullish") && h4Frame.bias === "Bullish") || (finalBias.startsWith("Bearish") && h4Frame.bias === "Bearish")
            ? `Makro ${finalBias} dan 4 jam ${h4Frame.bias}. Lebih selaras. Tetap bukan sinyal.`
            : (finalBias.startsWith("Bullish") && h4Frame.bias === "Bearish") || (finalBias.startsWith("Bearish") && h4Frame.bias === "Bullish")
              ? `Makro ${finalBias}, tetapi 4 jam ${h4Frame.bias}. Tidak selaras. Jangan dipaksa menjadi transaksi.`
              : `Makro ${finalBias}. 4 jam ${h4Frame.bias}. Belum cukup untuk disebut selaras.`,
    },
    dailyTech: dailyFrame,
    watch: [
      next ? `${next.name} · ${next.when}` : "Tidak ada katalis bertanggal berikutnya di kalender bawaan.",
      "Sesi sesudah rilis: yield 2Y, real yield, DXY, dan proksi emas. Tanpa itu priced-in tetap tidak pasti.",
      "Apakah jendela 5 sesi membatalkan arah 21 sesi.",
      "COT minggu berikutnya, hanya sebagai konteks posisi.",
      "PCE, PDB, dan probabilitas Fed tetap kosong sampai sumbernya benar-benar diambil.",
    ],
  };

  return {
    retrievedAt: raw.retrievedAt,
    clockNote: clock(raw.retrievedAt),
    sources,
    desk,
    state: {
      biasLabel: bias === "Bullish" ? "Condong naik" : bias === "Bearish" ? "Condong turun" : bias === "Neutral" ? "Netral" : "BUKTI TIDAK CUKUP",
      biasTone: bias === "Bullish" ? "bull" : bias === "Bearish" ? "bear" : bias === "Neutral" ? "neutral" : "gap",
      confidenceLabel: confidence === "High" ? "Tinggi" : confidence === "Medium" ? "Sedang" : confidence === "Low" ? "Rendah" : "—",
      primaryDriver: primary,
      secondary,
      confirmation,
      confirmationDetail,
      pricedIn: pricedInLabel,
      pricedInDetail: pricedDetail,
      positioningRisk: "Bukti tidak cukup",
      positioningDetail:
        "Risiko posisi sesak hanya Rendah, Sedang, atau Tinggi jika ada persentil historis. Distribusi itu tidak dimuat. Minggu COT terakhir ditampilkan supaya posisinya terlihat. Tidak dinilai.",
      nextCatalyst: next ? `${next.name} · ${next.covers}` : "Tidak ada katalis bertanggal lagi di kalender bawaan.",
      nextCatalystWhen: next ? `${next.when}. ${next.source}` : GAP,
      invalidation,
      invalidationAlert: alert,
      thesis,
    },
    chain: [
      {
        label: "Data ekonomi",
        status: latestBls(cpi) || latestBls(nfp) ? "partial" : "blocked",
        reading: "Vintase inflasi dan tenaga kerja BLS sudah masuk. PCE, PDB, ISM, klaim, dan keyakinan belum.",
      },
      {
        label: "Aktual lawan perkiraan",
        status: forecastCount > 0 ? "partial" : "blocked",
        reading:
          forecastCount > 0
            ? `Forex Factory memuat ${forecastCount} kolom perkiraan USD minggu ini. Ekspornya tidak punya aktual, jadi perbandingan belum tertutup. Aktual BLS tidak dipasangkan dengan perkiraan dari rilis yang berbeda.`
            : "Aktual ada untuk beberapa seri BLS. Konsensus yang bersumber untuk rilis yang sama tidak diambil, jadi perbandingan berhenti.",
      },
      {
        label: "Kejutan ekonomi",
        status: "blocked",
        reading:
          "Kejutan butuh aktual dikurangi konsensus untuk rilis yang sama, lalu riwayat kejutan. Ekspor mingguan tidak memuat aktual dan tidak punya riwayat. Kejutan tidak dihitung.",
      },
      {
        label: "Fungsi reaksi Fed",
        status: fedPressure === "Insufficient" ? "blocked" : "model",
        reading: `Komposit model: ${legLabel(fedPressure as "Hawkish" | "Dovish" | "Neutral" | "Insufficient")}. Ini bukan keputusan, dan bukan harga pasar.`,
      },
      {
        label: "Kebijakan tersirat pasar",
        status: "blocked",
        reading: "Fed funds futures, SOFR futures, dan OIS tidak diambil. Tidak ada probabilitas tahan, pangkas, atau naikkan suku bunga.",
      },
      {
        label: "Jalur suku bunga",
        status: "blocked",
        reading: `Suku bunga kebijakan tersirat rapat berikutnya, 3 bulan, 6 bulan, dan 12 bulan ${GAP}.`,
      },
      {
        label: "Yield dan real yield",
        status: r10.last != null && y2.last != null ? "open" : "partial",
        reading: "Yield par dan real yield Treasury. Resmi. Ini bukan pengganti jalur futures yang hilang.",
      },
      {
        label: "USD",
        status: dx.last != null ? "open" : "blocked",
        reading: "DXY adalah kuotasi indeks vendor (DX-Y.NYB), bukan cetakan Federal Reserve.",
      },
      {
        label: "XAUUSD",
        status: g.last != null ? "open" : "blocked",
        reading: goldDisclaimer,
      },
    ],
    crossChecks: [
      {
        label: "Posisi",
        status: raw.cot ? "partial" : "blocked",
        reading: raw.cot
          ? "Minggu futures terdisagregasi CFTC terakhir. Persentil dan posisi opsi tidak ada, jadi pemeriksaan ini tidak bisa mengalahkan harga."
          : GAP,
      },
      {
        label: "Likuiditas",
        status: raw.rrp ? "partial" : "blocked",
        reading: "Hanya reverse repo semalam yang diambil. Neraca Fed dan Treasury General Account tidak. Rezim likuiditas tidak dinyatakan.",
      },
      {
        label: "Sentimen risiko",
        status: spx.last != null || vixLast != null ? "model" : "blocked",
        reading: `${riskRegime === "Risk-Off" ? "Risk-off" : riskRegime === "Risk-On" ? "Risk-on" : "Netral"}. Label model dari VIX, S&P 500, dan HYG. Tidak menggantikan harga pasar.`,
      },
      {
        label: "Struktur teknikal",
        status: ma20 != null ? "model" : "blocked",
        reading: `Hanya rata-rata harian dan lokasi rentang. Struktur intraday ${GAP}. Tidak masuk ke tesis makro.`,
      },
    ],
    yields: yieldRows.map(([tenor, w]) => ({
      tenor,
      current: num(w.last, 2, "%"),
      daily: bps(w.d1),
      weekly: bps(w.d5),
      monthly: bps(w.d21),
      trend: trend(w.d21, 0.05),
    })),
    yieldNote: `Sumber: kurva yield par harian dan kurva real yield Departemen Keuangan AS. Sesi nominal terakhir ${y10.lastDate ?? GAP}. ${tnxNote} Jendelanya 1, 5, dan 21 pengamatan, bukan minggu kalender, dan tanggal ujungnya ada di masing-masing seri.`,
    yieldRead: y2VsPath,
    realYield: {
      current: num(r10.last, 2, "%"),
      daily: bps(r10.d1),
      weekly: bps(r10.d5),
      monthly: bps(r10.d21),
      asOf: r10.lastDate ?? GAP,
      interpretation: realInterp,
      caveats: [
        dxyRelation,
        riskRegime === "Risk-Off"
          ? goldRiskNote
          : "Sentimen risiko saat ini tidak berlabel risk-off, jadi tidak dipakai untuk mengalahkan kecenderungan real yield.",
        "Risiko geopolitik tidak dinilai. Tidak ada berita yang diperlakukan sebagai fakta safe-haven.",
      ],
    },
    usd: {
      current: num(dx.last, 3),
      daily: signed(dx.d1, 2, "%"),
      weekly: signed(dx.d5, 2, "%"),
      monthly: signed(dx.d21, 2, "%"),
      trend: trend(dx.d21, 0.6, "Menguat", "Melemah"),
      relation: dxyRelation,
      source: dxySeries
        ? `Chart Yahoo Finance ${dxySeries.symbol}${dxySeries.exchange ? ` · ${dxySeries.exchange}` : ""}. Waktu vendor terakhir ${dxySeries.marketTime ?? GAP}.`
        : GAP,
    },
    gold: {
      instrument: goldInstrument,
      disclaimer: goldDisclaimer,
      price: lseFresh ? num(raw.lseGold!.price, 2) : num(g.last, 2),
      daily: lseFresh ? signed(raw.lseGold!.change24, 2, "%") : signed(g.d1, 2, "%"),
      weekly: lseFresh ? signed(raw.lseGold!.changeWeek, 2, "%") : signed(g.d5, 2, "%"),
      monthly: signed(g.d21, 2, "%"),
      realizedVol: realized == null ? GAP : `${num(realized, 1, "%")} disetahunkan, 20 sesi, penutupan ke penutupan. Estimasi model dari penutupan yang teramati.`,
      atr: atr14 == null ? GAP : `${num(atr14, 2)} USD. ATR(14) pada bar harian. Estimasi model. Bukan volatilitas tersirat.`,
      volume:
        lastVol == null
          ? GAP
          : `${ints(lastVol)} lawan rata-rata 20 sesi ${vol20 == null ? GAP : ints(vol20)}. Volume vendor untuk instrumen ini.`,
      openInterest: raw.cot
        ? `${ints(raw.cot.oi)} kontrak pada laporan futures CFTC bertanggal ${raw.cot.date} (mingguan, perubahan ${signed(raw.cot.oiChg, 0)}). Open interest bursa yang langsung DATA TIDAK TERSEDIA.`
        : `Open interest langsung dan mingguan ${GAP}.`,
      source: lseFresh
        ? `London Strategic Edge, XAU/USD. Diperbarui ${raw.lseGold!.asOf}. Perubahan harian adalah 24 jam menurut vendor itu, bukan penutupan sesi.`
        : goldSeries
          ? `Chart Yahoo Finance ${goldSeries.symbol}${goldSeries.shortName ? ` · ${goldSeries.shortName}` : ""}.`
          : GAP,
      asOf: lseFresh ? raw.lseGold!.asOf : (goldSeries?.marketTime ?? g.lastDate ?? GAP),
    },
    charts: {
      gold: goldObs.slice(-140),
      real10: raw.real.real10.slice(-140),
      y2: raw.nominal.y2.slice(-140),
      dxy: dxyObs.slice(-140),
      h4: h4Bars.filter((b) => b.close != null).slice(-80).map((b) => ({ date: b.date, value: b.close as number })),
    },
    techCharts: {
      m15: {
        bars: candlesOf(m15Bars),
        zones: zonesOf(m15Bars),
        structure: m15Frame.structure,
        note: lseFresh
          ? "XAU/USD London Strategic Edge. Bar 1 menit digabung per 15 menit. Bukan candle broker dan bukan COMEX."
          : "COMEX GC=F, bar 15 menit. Bukan candle broker.",
      },
      h4: { bars: candlesOf(h4Bars).slice(-60), zones: zonesOf(h4Bars) },
      daily: { bars: candlesOf(goldBars).slice(-80), zones: zonesOf(goldBars) },
    },
    prints,
    surpriseSummary: raw.calendar.length
      ? "Kejutan ekonomi tidak dinilai. Berkas minggu ini Forex Factory memberi sebagian perkiraan vendor, tetapi tidak memuat aktual yang terbit dan tidak memuat riwayat kejutan. Momentum yang teramati di tabel cetakan adalah objek yang berbeda. Perkiraan tidak disebut naik atau turun untuk emas."
      : "Kejutan ekonomi tidak dinilai. Kejutan yang distandarkan butuh distribusi historis (aktual − konsensus). Konsensus tidak diambil, dan tidak diestimasi. Momentum yang teramati di tabel cetakan adalah objek yang berbeda.",
    reaction: {
      inflation: legLabel(inflation),
      inflationDetail,
      employment: legLabel(employment),
      employmentDetail,
      growth: "Tidak cukup",
      growthDetail:
        `Kaki pertumbuhan ${GAP}. Risiko resesi tidak diestimasi dari seri yang tidak ada.`,
      fedPressure: legLabel(fedPressure as "Hawkish" | "Dovish" | "Neutral" | "Insufficient"),
      fedPressureDetail,
      disclaimer:
        "Data ekonomi bukan keputusan Fed. Fungsi reaksi di sini adalah model eksplisit dengan ambang yang dituliskan. Kebijakan tersirat pasar adalah lapisan terpisah yang saat ini kosong.",
    },
    fed: {
      target: raw.effr
        ? `${raw.effr.targetLow.toFixed(2)}–${raw.effr.targetHigh.toFixed(2)}%`
        : GAP,
      effr: raw.effr ? `${raw.effr.rate.toFixed(2)}% · ${raw.effr.date}` : GAP,
      sofr: raw.sofr ? `${raw.sofr.rate.toFixed(2)}% · ${raw.sofr.date}` : GAP,
      probabilities: "Probabilitas tahan, pangkas, dan naikkan suku bunga: DATA TIDAK TERSEDIA. CME FedWatch tidak dipakai. Tidak ada probabilitas yang dihitung dari 2Y.",
      path: ["Rapat berikutnya", "3 bulan", "6 bulan", "12 bulan"].map((horizon) => ({
        horizon,
        rate: GAP,
        change: GAP,
      })),
      divergence: raw.calendar.length
        ? "Divergensi ekspektasi: BUKTI TIDAK CUKUP. Perkiraan Forex Factory adalah konsensus vendor untuk minggu ini saja. Itu bukan harga tersirat pasar, jadi keduanya tidak dibandingkan."
        : "Divergensi ekspektasi: BUKTI TIDAK CUKUP. Konsensus ekonom dan harga tersirat pasar adalah objek yang berbeda. Keduanya tidak diambil, jadi tidak dianggap sama dan tidak dianggap berbeda.",
      notes: [
        raw.fomcHtmlConfirmed
          ? "HTML kalender Federal Reserve yang diambil memuat rapat 15–16 September dan 27–28 Oktober 2026."
          : "Halaman kalender Federal Reserve diambil, tetapi kedua string tanggal September dan Oktober 2026 tidak ditemukan. Tanggal rapat di daftar pantauan tetap mengikuti jadwal 2026 yang diterbitkan dan sebaiknya dicek ulang di federalreserve.gov.",
        "SOFR adalah suku bunga overnight beragunan, bukan jalur kebijakan.",
        failed.length ? `Catatan pengambilan: ${failed.join(" · ")}` : "Tidak ada galat sumber pada pengambilan ini.",
      ],
    },
    pricedLayers: [
      { layer: "A · Jalur menuju berita", finding: knownFinding },
      { layer: "B · Aktualnya", finding: tapeFinding },
      { layer: "C · Sesi sesudahnya", finding: aheadFinding },
    ],
    releaseReactions,
    reactionNote:
      "Penutupan ke penutupan pada sesi yang memuat atau mengikuti tanggal rilis, memakai bar dalam empat hari. Ini bukan 15 menit pertama. Pergerakan bisa memuat berita lain di hari yang sama. Tidak ada label kejutan.",
    matrix,
    matrixFooter: "Jangan membaca satu baris sebagai kesimpulan. Panel status hanya memakai baris yang lolos aturan bukti.",
    divergence: { classification: divClass, detail: divDetail, hypotheses },
    positioning: {
      reportDate: raw.cot?.date ?? GAP,
      source: raw.cot
        ? "Laporan futures-only terdisagregasi CFTC, emas COMEX (kontrak 088691). https://www.cftc.gov/dea/newcot/f_disagg.txt. Uang kelolaan bukan kategori noncommercial lama. Produsen/pedagang bukan kategori commercial lama."
        : "Berkas CFTC tidak tersedia.",
      rows: cotRows,
      percentile:
        "Persentil historis: DATA TIDAK TERSEDIA. Arus ETF, skew opsi, dan distribusi COT beberapa tahun tidak dimuat. Satu minggu tidak bisa diletakkan pada persentil.",
      reading: posReading,
    },
    volatility: {
      rows: [
        {
          name: "Volatilitas terealisasi emas",
          value: realized == null ? GAP : num(realized, 1, "%"),
          meaning: "20 sesi, penutupan ke penutupan, disetahunkan. Estimasi model dari proksi emas. Bukan volatilitas tersirat.",
        },
        {
          name: "ATR emas (14)",
          value: atr14 == null ? GAP : num(atr14, 2),
          meaning: "Rata-rata true range dalam poin harga. Estimasi model. Tidak mengatakan apa yang sudah dihargai opsi.",
        },
        {
          name: "Volatilitas tersirat emas",
          value: GAP,
          meaning: "Pergerakan yang diharapkan yang dihargai opsi. Tidak diambil. Yang terealisasi bukan pengganti.",
        },
        {
          name: "Volatilitas tersirat USD dan Treasury",
          value: GAP,
          meaning: "Tidak diambil.",
        },
        {
          name: "Volatilitas harian terealisasi 2Y",
          value: stdev(y2Daily.slice(-21)) == null ? GAP : num(stdev(y2Daily.slice(-21)), 1, " bps"),
          meaning: "Simpangan baku perubahan harian 2Y selama 21 sesi Treasury terakhir. Estimasi model.",
        },
        {
          name: "Volatilitas harian terealisasi 10Y",
          value: stdev(y10Daily.slice(-21)) == null ? GAP : num(stdev(y10Daily.slice(-21)), 1, " bps"),
          meaning: "Konstruksi yang sama untuk yield nominal 10Y.",
        },
      ],
      note: "Volatilitas yang diharapkan tidak bisa dibandingkan dengan yang terjadi sampai pergerakan tersirat bersumber. Terminal tidak akan mengarang pergerakan yang diharapkan untuk CPI atau FOMC.",
    },
    liquidity: {
      rows: [
        {
          name: "Reverse repo semalam",
          value: raw.rrp ? `$${(raw.rrp.acceptedUsd / 1e9).toFixed(3)} miliar diterima` : GAP,
          note: raw.rrp
            ? `Tanggal operasi NY Fed ${raw.rrp.date}. Total diterima ${ints(raw.rrp.acceptedUsd)} dolar AS. Satu operasi, bukan indeks likuiditas.`
            : "Hasil reverse repo NY Fed tidak diambil.",
        },
        {
          name: "Neraca Fed",
          value: GAP,
          note: "H.4.1 / WALCL tidak diambil.",
        },
        {
          name: "Treasury General Account",
          value: GAP,
          note: "TGA tidak diambil.",
        },
        {
          name: "Indeks kondisi keuangan",
          value: GAP,
          note: "Tidak diambil.",
        },
      ],
      reading:
        "Likuiditas tidak mengonfirmasi atau menentang tesis makro. Satu cetakan reverse repo semalam bukan rezim. Tidak ada korelasi yang diklaim.",
    },
    risk: {
      regime: riskRegime === "Risk-Off" ? "Risk-off" : riskRegime === "Risk-On" ? "Risk-on" : "Netral",
      detail: riskDetail,
      goldNote: goldRiskNote,
      rows: [
        { name: "S&P 500", value: num(spx.last, 2), move: `~5 sesi ${signed(spx.d5, 2, "%")} · ~21 sesi ${signed(spx.d21, 2, "%")}` },
        { name: "Nasdaq", value: num(ndx.last, 2), move: `~5 sesi ${signed(ndx.d5, 2, "%")} · ~21 sesi ${signed(ndx.d21, 2, "%")}` },
        { name: "VIX", value: num(vixLast, 2), move: `~5 sesi ${signed(vix.d5, 2, " poin")}` },
        { name: "HYG", value: num(hyg.last, 2), move: `~5 sesi ${signed(hyg.d5, 2, "%")}` },
        { name: "WTI", value: num(oil.last, 2), move: `~5 sesi ${signed(oil.d5, 2, "%")}` },
        { name: "Tembaga", value: num(copper.last, 2), move: `~5 sesi ${signed(copper.d5, 2, "%")}` },
        { name: "DXY", value: num(dx.last, 3), move: `~5 sesi ${signed(dx.d5, 2, "%")}` },
      ],
    },
    scenarios: [
      {
        name: "Kasus dasar",
        summary:
          bias == null
            ? "Tidak ada arah kasus dasar. Rezim yang teramati belum lengkap."
            : `Rezim yang teramati ${bias === "Bullish" ? "condong naik" : bias === "Bearish" ? "condong turun" : "netral"} menurut aturan di atas. Kelanjutan adalah gambaran yang sudah ada di pita harga, bukan ramalan.`,
        trigger: "Tidak ada. Kasus ini adalah bukti sekarang, bukan peristiwa yang akan datang.",
        evidence: primary,
        confirmation: "Mata rantai yang menetapkan bias menjaga tandanya pada 5 dan 21 sesi berikutnya, dan proksi emas tidak menyimpang.",
        invalidation,
        watch: next ? `${next.name} pada ${next.when}.` : "Rilis bertanggal berikutnya di kalender.",
      },
      {
        name: "Skenario emas naik",
        summary:
          "Syarat yang dibutuhkan, bukan seruan: real yield lebih rendah, dolar lebih lemah, dan 2Y lebih rendah, dengan proksi emas mengonfirmasi. Jika itu sudah benar, skenario ini adalah kasus dasar, bukan prediksi tambahan.",
        trigger: "Real yield 10Y dan US 2Y turun lebih dari 5 bps dalam 21 sesi Treasury berikutnya, dan DXY tidak naik lebih dari 0,6%.",
        evidence: "Hanya mata rantai yang sudah mendukung yang dihitung sebagai bukti. Yang datar atau menekan tidak direkrut.",
        confirmation: "Proksi emas lebih tinggi selama syarat itu bertahan.",
        invalidation: "Pembalikan 5 sesi ke atas pada real yield, 2Y, dan DXY bersama-sama.",
        watch: next ? next.name : "Peristiwa CPI, PCE, NFP, atau FOMC berikutnya.",
      },
      {
        name: "Skenario emas turun",
        summary:
          "Syarat yang dibutuhkan, bukan seruan: real yield lebih tinggi, dolar lebih kuat, dan 2Y lebih tinggi, dengan proksi emas mengonfirmasi.",
        trigger: "Real yield 10Y dan US 2Y naik lebih dari 5 bps dalam 21 sesi Treasury berikutnya, dan DXY naik lebih dari 0,6%.",
        evidence: "Hanya mata rantai yang sudah menekan yang dihitung sebagai bukti.",
        confirmation: "Proksi emas lebih rendah selama syarat itu bertahan.",
        invalidation: "Pembalikan 5 sesi ke bawah pada real yield, 2Y, dan DXY bersama-sama.",
        watch: next ? next.name : "Peristiwa CPI, PCE, NFP, atau FOMC berikutnya.",
      },
    ],
    daily: [
      { heading: "Apa yang berubah?", body: changed.join(" ") },
      {
        heading: "Mengapa?",
        body: recentNews.length
          ? `Penyebab tidak disimpulkan dari pergerakan yang bersamaan. Item resmi Federal Reserve dalam lima hari terakhir ada dan tidak dinilai sebagai penyebab: ${recentNews.map((n) => n.title).join(" · ")}.`
          : "Penyebab tidak disimpulkan. Tidak ada item kebijakan moneter Federal Reserve di umpan yang diambil yang jatuh dalam lima hari terakhir, dan tidak ada rilis resmi lain yang ditetapkan sebagai alasan sesi terakhir.",
      },
      {
        heading: "Apa yang sudah di harga?",
        body: "Terminal tidak bisa mengatakan apa yang sudah di harga untuk peristiwa berikutnya. Yang teramati adalah level yield, dolar, dan proksi emas sekarang. Itu harga, bukan pernyataan bahwa cetakan berikutnya sudah ada di harga.",
      },
      {
        heading: "Apa yang belum di harga?",
        body: next
          ? `${next.name} (${next.covers}, ${next.when}) adalah katalis yang masih terbuka. Tidak digolongkan belum di harga atau sudah di harga.`
          : "Tidak ada katalis terbuka yang digolongkan belum di harga.",
      },
      {
        heading: "Apa yang mengonfirmasi tesis?",
        body:
          bias == null
            ? "Tidak ada. Tidak ada tesis untuk dikonfirmasi."
            : `${confirmation}. ${confirmationDetail}`,
      },
      { heading: "Apa yang membatalkannya?", body: invalidation },
      {
        heading: "Apa yang dipantau berikutnya?",
        body: next ? `${next.name} · ${next.when}. ${next.source}` : "Kalender di build ini tidak punya tanggal lagi.",
      },
    ],
    event: {
      mode: liveEvent ? "Analisis peristiwa" : "Standar",
      title: liveEvent
        ? `${liveEvent.name} · ${eventPhase === "pre" ? "sebelum terbit" : "jendela publikasi terbuka"} · ${liveEvent.when}`
        : "Tidak ada peristiwa di dalam jendela langsung",
      blocks: eventBlocks,
    },
    calendar: { note: calendarNote, rows: calendarRows },
    news: raw.news.slice(0, 6).map((n) => ({
      title: n.title,
      date: n.pubDate,
      link: n.link,
      classification: "Pernyataan resmi",
      note: "Item pers Federal Reserve. Bukan fakta pasar, bukan opini analis, dan tidak dinilai naik atau turun.",
    })),
    technical: {
      regime: techRegime,
      lines: [
        location,
        ma20 != null ? `Rata-rata 20 sesi ${num(ma20, 2)}.` : `Rata-rata 20 sesi ${GAP}.`,
        ma60 != null ? `Rata-rata 60 sesi ${num(ma60, 2)}.` : `Rata-rata 60 sesi ${GAP}.`,
        "Struktur intraday, termasuk level H4, DATA TIDAK TERSEDIA.",
      ],
      separation,
    },
    coverage: [
      {
        domain: "Makro resmi",
        have: raw.calendar.length
          ? "CPI, CPI inti, PPI, PPI inti, upah per jam, payroll, pengangguran, JOLTS, ECI, ditambah perkiraan USD minggu ini dari Forex Factory"
          : "CPI, CPI inti, PPI, PPI inti, upah per jam, payroll, pengangguran, JOLTS, ECI",
        missing:
          "PCE, PCE inti, klaim resmi, ADP, PDB, aktual ISM, penjualan ritel, produksi industri, barang tahan lama. Aktual kalender tidak ada di ekspor Forex Factory. Konsensus di luar minggu ini, termasuk CPI 14 Okt, tidak ada di berkas itu.",
      },
      {
        domain: "Harga kebijakan",
        have: "EFFR, rentang target, SOFR, yield par Treasury",
        missing: "Fed funds futures, SOFR futures, OIS, probabilitas rapat, jalur 3/6/12 bulan",
      },
      {
        domain: "Lintas aset",
        have: "Proksi emas, DXY, S&P 500, Nasdaq, VIX, WTI, tembaga, harga HYG",
        missing: "Fixing spot jika yang dipakai futures, OAS kredit, suku bunga KPR, indeks kondisi keuangan",
      },
      {
        domain: "Posisi dan volatilitas",
        have: "Futures terdisagregasi CFTC, satu minggu, plus volatilitas terealisasi dan ATR",
        missing: "Persentil COT historis, arus ETF, open interest opsi, volatilitas tersirat, skew, pergerakan tersirat peristiwa",
      },
    ],
    rules: [
      "Bias hanya memakai tiga mata rantai 21 sesi: real yield 10Y, US 2Y, dan DXY. Pita datar 5 bps untuk yield dan 0,6% untuk DXY. Condong naik butuh mata rantai itu lebih longgar bagi emas dan tidak ditentang. Kurang dari dua mata rantai yang bisa dipakai menghasilkan BUKTI TIDAK CUKUP, yang bukan kata yang sama dengan Netral.",
      "Keyakinan Tinggi hanya jika ketiga mata rantai sepakat, yield tidak lebih tua dari lima hari, dan jendela 5 sesi tidak menentangnya. Selain itu Sedang atau Rendah. Tidak ada skor angka.",
      "Pembalikan 5 sesi pada mata rantai yang mendukung tesis memunculkan peringatan bahwa tesis kehilangan konfirmasi. Itu tidak membalik bias 21 sesi sendirian.",
      "Kejutan ekonomi tidak pernah diisi tanpa aktual dan konsensus untuk rilis yang sama. Perkiraan Forex Factory adalah kolom kalender vendor. Bukan kejutan yang distandarkan dan bukan probabilitas Fed. Ambang tekanan Fed adalah estimasi model dan dicetak di samping hasilnya.",
      "Pergerakan sebelum rilis bukan vonis priced-in. Vonis butuh rilis aktual dan sesi sesudahnya. Sesi berikutnya yang kecil berarti pergerakan sebelumnya sudah menyelesaikan pekerjaan. Sesi yang lebih besar atau berlawanan berarti berita belum ada di harga. Sampai keduanya ada, status tetap Tidak pasti.",
      "Risk-off bukan berarti emas naik. Posisi tanpa persentil bukan tuduhan perdagangan sesak. Teknikal tidak masuk ke bias makro.",
      "Tidak ada model generatif yang menulis kalimat ini. Semuanya templat yang diisi hanya jika angka yang diambil ada.",
      raw.fomcHtmlConfirmed ? "String tanggal FOMC September dan Oktober 2026 ada di halaman kalender Fed yang diambil." : "Konfirmasi HTML FOMC tidak cocok dengan kedua string tanggal pada pengambilan ini.",
    ],
  };
}
