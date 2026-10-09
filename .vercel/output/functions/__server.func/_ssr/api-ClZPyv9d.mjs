import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-ClZPyv9d.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var GAP = "DATA UNAVAILABLE";
var NO_SURPRISE = "INSUFFICIENT EVIDENCE — no sourced consensus forecast, so this is not an economic surprise.";
function winDiff(points) {
	const blank = {
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
		from21: null
	};
	if (!points.length) return blank;
	const last = points[points.length - 1];
	const pick = (back) => {
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
		from21: p21?.value ?? null
	};
}
function closes(series) {
	if (!series) return [];
	return series.bars.filter((b) => b.close != null && Number.isFinite(b.close)).map((b) => ({
		date: b.date,
		value: b.close
	}));
}
function winRet(points) {
	const base = winDiff(points);
	const pct = (diff, from) => {
		if (diff == null || from == null || from === 0) return null;
		return ((from + diff) / from - 1) * 100;
	};
	return {
		...base,
		d1: pct(base.d1, base.from1),
		d5: pct(base.d5, base.from5),
		d21: pct(base.d21, base.from21)
	};
}
function signed(v, digits, suffix = "") {
	if (v == null || !Number.isFinite(v)) return GAP;
	return `${v > 0 ? "+" : ""}${v.toFixed(digits)}${suffix}`;
}
function num(v, digits, suffix = "") {
	if (v == null || !Number.isFinite(v)) return GAP;
	return `${v.toFixed(digits)}${suffix}`;
}
function bps(levelDiff) {
	if (levelDiff == null || !Number.isFinite(levelDiff)) return GAP;
	return signed(levelDiff * 100, 1, " bps");
}
function ints(v) {
	if (v == null || !Number.isFinite(v)) return GAP;
	return new Intl.NumberFormat("en-US").format(Math.round(v));
}
function yieldVote(diff, dead) {
	if (diff == null || !Number.isFinite(diff)) return "abstain";
	if (Math.abs(diff) < dead) return "flat";
	return diff < 0 ? "supportive" : "restrictive";
}
function softerVote(ret, dead) {
	if (ret == null || !Number.isFinite(ret)) return "abstain";
	if (Math.abs(ret) < dead) return "flat";
	return ret < 0 ? "supportive" : "restrictive";
}
function trend(diff, dead, up = "Higher", down = "Lower") {
	if (diff == null || !Number.isFinite(diff)) return GAP;
	if (Math.abs(diff) < dead) return "Flat";
	return diff > 0 ? up : down;
}
function latestBls(points) {
	if (!points?.length) return null;
	return points[points.length - 1];
}
function blsAt(points, back) {
	if (!points || points.length <= back) return null;
	return points[points.length - 1 - back];
}
function yoyEnding(points, back) {
	if (!points) return null;
	const i = points.length - 1 - back;
	const j = i - 12;
	if (i < 0 || j < 0) return null;
	const b = points[j].value;
	if (!b) return null;
	return (points[i].value / b - 1) * 100;
}
function mom(points) {
	const a = latestBls(points);
	const b = blsAt(points, 1);
	if (!a || !b || !b.value) return null;
	return (a.value / b.value - 1) * 100;
}
function ann3(points) {
	const a = latestBls(points);
	const b = blsAt(points, 3);
	if (!a || !b || !b.value) return null;
	return (Math.pow(a.value / b.value, 4) - 1) * 100;
}
function levelChg(points, back = 1) {
	const a = latestBls(points);
	const b = blsAt(points, back);
	if (!a || !b) return null;
	return a.value - b.value;
}
function prelim(p) {
	return p?.preliminary ? " Preliminary." : "";
}
function gapRow(name, why) {
	return {
		name,
		period: GAP,
		actual: GAP,
		previous: GAP,
		revisedNote: "No vintage was retrieved.",
		forecast: GAP,
		unit: GAP,
		frequency: GAP,
		freshness: GAP,
		source: why,
		observedChange: GAP,
		surprise: NO_SURPRISE
	};
}
function indexPrint(opts) {
	const a = latestBls(opts.points);
	const prev = blsAt(opts.points, 1);
	if (!a) return gapRow(opts.name, opts.source);
	const yoy = opts.showYoy ? yoyEnding(opts.points, 0) : null;
	const m = opts.showMom ? mom(opts.points) : null;
	const bits = [];
	if (opts.alreadyPercent) bits.push(`latest print ${num(a.value, 1, "%")}`);
	else bits.push(`index ${num(a.value, 3)}`);
	if (yoy != null) bits.push(`YoY ${signed(yoy, 2, "%")}`);
	if (m != null) bits.push(`MoM ${signed(m, 2, "%")}`);
	const observed = yoy != null || m != null ? `${bits.join(" · ")}. Observed change, not a surprise versus consensus.` : bits.join(" · ");
	return {
		name: opts.name,
		period: a.label,
		actual: opts.alreadyPercent ? num(a.value, 1, "%") : num(a.value, 3),
		previous: prev ? opts.alreadyPercent ? num(prev.value, 1, "%") : num(prev.value, 3) : GAP,
		revisedNote: "Previous is the prior period in the current BLS vintage. The as-first-published number is DATA UNAVAILABLE." + prelim(a),
		forecast: GAP,
		unit: opts.unit,
		frequency: opts.frequency,
		freshness: opts.freshness,
		source: opts.source,
		observedChange: observed,
		surprise: NO_SURPRISE
	};
}
function legLabel(kind) {
	return kind;
}
function contradicts(vote, shortDiff, dead) {
	if (vote === "abstain" || vote === "flat" || shortDiff == null) return false;
	if (vote === "supportive") return shortDiff > dead;
	return shortDiff < -dead;
}
function sessionMove(points, date, mode) {
	const i = points.findIndex((p) => p.date >= date);
	if (i <= 0) return GAP;
	if ((Date.parse(`${points[i].date}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 864e5 > 4) return GAP;
	const now = points[i].value;
	const prev = points[i - 1].value;
	const span = `${points[i - 1].date} → ${points[i].date}`;
	if (mode === "bps") return `${bps(now - prev)} (${span})`;
	if (!prev) return GAP;
	return `${signed((now / prev - 1) * 100, 2, "%")} (${span})`;
}
function ma(values, n) {
	if (values.length < n) return null;
	return values.slice(-n).reduce((a, b) => a + b, 0) / n;
}
function stdev(values) {
	if (values.length < 8) return null;
	const mean = values.reduce((a, b) => a + b, 0) / values.length;
	const v = values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
	return Math.sqrt(v);
}
function atr(bars, n = 14) {
	const trs = [];
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
function clock(iso) {
	const d = new Date(iso);
	const opt = {
		dateStyle: "medium",
		timeStyle: "short"
	};
	return `Retrieved ${new Intl.DateTimeFormat("en-GB", {
		...opt,
		timeZone: "Asia/Jakarta"
	}).format(d)} WIB · ${new Intl.DateTimeFormat("en-GB", {
		...opt,
		timeZone: "America/New_York"
	}).format(d)} ET. Each figure keeps its own observation time. Not one synchronized official snapshot.`;
}
var SCHEDULE = [
	{
		name: "FOMC minutes",
		iso: "2026-10-07T18:00:00Z",
		when: "7 Oct 2026, 14:00 ET",
		covers: "September 15–16 meeting",
		source: "Schedule reference. The Federal Reserve releases minutes three weeks after the meeting. 16 Sep + 21 days is 7 Oct. Clock time is the standing 14:00 ET minutes release. Not a market print."
	},
	{
		name: "CPI",
		iso: "2026-10-14T12:30:00Z",
		when: "14 Oct 2026, 08:30 ET",
		covers: "September 2026",
		source: "FRED CPI release calendar lists 14 Oct 2026 at 7:30 US Central, which is 08:30 ET. https://fred.stlouisfed.org/releases/calendar?rid=10"
	},
	{
		name: "PPI",
		iso: "2026-10-15T23:59:00Z",
		when: "15 Oct 2026 (date). Clock time not re-read from BLS.",
		covers: "September 2026",
		source: "FRED lists the next release of WPSFD49116 as 15 Oct 2026. https://fred.stlouisfed.org/series/WPSFD49116. The 08:30 ET convention was not re-confirmed from the BLS page on this run (that page returned 403), so the clock time is DATA UNAVAILABLE."
	},
	{
		name: "FOMC meeting",
		iso: "2026-10-28T18:00:00Z",
		when: "27–28 Oct 2026",
		covers: "October meeting",
		source: "Federal Reserve 2026 FOMC calendar. Statement clock time was not parsed from the HTML on this run. https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"
	},
	{
		name: "JOLTS",
		iso: "2026-11-03T15:00:00Z",
		when: "3 Nov 2026, 10:00 ET",
		covers: "September 2026",
		source: "BLS schedule of selected releases for November 2026. https://www.bls.gov/schedule/2026/11_sched_list.htm"
	},
	{
		name: "Employment Situation",
		iso: "2026-11-06T13:30:00Z",
		when: "6 Nov 2026, 08:30 ET",
		covers: "October 2026",
		source: "BLS schedule of selected releases for November 2026. https://www.bls.gov/schedule/2026/11_sched_list.htm"
	},
	{
		name: "CPI",
		iso: "2026-11-10T13:30:00Z",
		when: "10 Nov 2026, 08:30 ET",
		covers: "October 2026",
		source: "BLS schedule of selected releases for November 2026. https://www.bls.gov/schedule/2026/11_sched_list.htm"
	}
];
function yieldSentence(name, w) {
	if (w.d21 == null || w.last == null || w.from21 == null || !w.date21 || !w.lastDate) return `${name}: ${GAP} on the 21-session window.`;
	const dir = w.d21 < 0 ? "lower" : w.d21 > 0 ? "higher" : "unchanged";
	return `${name} is ${Math.abs(w.d21 * 100).toFixed(1)} bps ${dir} from ${w.date21} (${w.from21.toFixed(2)}%) to ${w.lastDate} (${w.last.toFixed(2)}%).`;
}
function retSentence(name, w) {
	if (w.d21 == null || w.last == null || !w.date21 || !w.lastDate) return `${name}: ${GAP} on the 21-session window.`;
	return `${name} is ${signed(w.d21, 2, "%")} from ${w.date21} to ${w.lastDate} (last ${num(w.last, name === "DXY" ? 3 : 2)}).`;
}
function buildTerminal(raw) {
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
	const realVote = yieldVote(r10.d21, .05);
	const y2Vote = yieldVote(y2.d21, .05);
	const dxVote = softerVote(dx.d21, .6);
	const votes = [
		realVote,
		y2Vote,
		dxVote
	];
	const support = votes.filter((v) => v === "supportive").length;
	const restrict = votes.filter((v) => v === "restrictive").length;
	const abstain = votes.filter((v) => v === "abstain").length;
	let bias = null;
	if (abstain >= 2) bias = null;
	else if (support >= 2 && support > restrict) bias = "Bullish";
	else if (restrict >= 2 && restrict > support) bias = "Bearish";
	else bias = "Neutral";
	const freshYield = y10.lastDate ? Date.parse(raw.retrievedAt) - Date.parse(`${y10.lastDate}T00:00:00Z`) < 432e6 : false;
	const losing = [
		contradicts(realVote, r10.d5, .05),
		contradicts(y2Vote, y2.d5, .05),
		contradicts(dxVote, dx.d5, .4)
	].some(Boolean);
	let confidence = null;
	if (bias === "Bullish" || bias === "Bearish") {
		const aligned = bias === "Bullish" ? support : restrict;
		if (!freshYield || (bias === "Bullish" ? restrict : support) > 0) confidence = "Low";
		else if (aligned >= 3 && !losing) confidence = "High";
		else confidence = "Medium";
	} else if (bias === "Neutral") confidence = "Low";
	const goldUp21 = g.d21 != null && g.d21 > .8;
	const goldDown21 = g.d21 != null && g.d21 < -.8;
	const goldFlat21 = g.d21 != null && Math.abs(g.d21) <= .8;
	let confirmation = "Insufficient Evidence";
	let confirmationDetail = "There is no directional macro thesis to confirm or reject.";
	if (bias === "Bullish") {
		if (goldUp21) {
			confirmation = g.d5 != null && g.d5 < -.4 ? "Partial" : "Confirmed";
			confirmationDetail = `Gold proxy is ${signed(g.d21, 2, "%")} over ~21 sessions${g.d5 != null ? ` and ${signed(g.d5, 2, "%")} over ~5 sessions` : ""}. ${confirmation === "Confirmed" ? "The price is moving with the easier real-yield / dollar backdrop." : "The 21-session rise agrees, but the latest 5 sessions do not. Partial confirmation only."}`;
		} else if (goldDown21) {
			confirmation = "Divergent";
			confirmationDetail = `Macro links lean bullish for gold, but the gold proxy is ${signed(g.d21, 2, "%")} over ~21 sessions. That is a macro/price divergence, not a reversal call.`;
		} else if (goldFlat21) {
			confirmation = "Partial";
			confirmationDetail = `Gold proxy is inside the flat band (${signed(g.d21, 2, "%")} over ~21 sessions) while the macro links lean bullish. Price has not confirmed.`;
		}
	} else if (bias === "Bearish") {
		if (goldDown21) {
			confirmation = g.d5 != null && g.d5 > .4 ? "Partial" : "Confirmed";
			confirmationDetail = `Gold proxy is ${signed(g.d21, 2, "%")} over ~21 sessions, in the same direction as the restrictive macro links.`;
		} else if (goldUp21) {
			confirmation = "Divergent";
			confirmationDetail = `Macro links lean restrictive for gold, but the gold proxy is ${signed(g.d21, 2, "%")} over ~21 sessions. Unusual resilience relative to those links. Not a reason, by itself, to fade or chase.`;
		} else if (goldFlat21) {
			confirmation = "Partial";
			confirmationDetail = "Restrictive macro links, but the gold proxy is inside the flat band. Price has not confirmed.";
		}
	} else if (bias === "Neutral") {
		confirmation = "Insufficient Evidence";
		confirmationDetail = "The core links do not agree, so there is no single macro thesis for gold to confirm. The gold move is shown on its own and is not called a divergence.";
	}
	const nowMs = Date.parse(raw.retrievedAt);
	const next = SCHEDULE.filter((e) => Date.parse(e.iso) >= nowMs)[0] ?? null;
	const liveEvent = SCHEDULE.find((e) => {
		const t = Date.parse(e.iso);
		return nowMs >= t - 1296e5 && nowMs <= t + 648e5;
	}) ?? (next && Date.parse(next.iso) - nowMs < 6048e5 ? next : null);
	const primary = bias ? [
		yieldSentence("US 10Y real yield", r10),
		yieldSentence("US 2Y", y2),
		retSentence("DXY", dx)
	].filter((s) => !s.includes(GAP)).join(" ") : "INSUFFICIENT EVIDENCE. At least two of 10Y real yield, US 2Y, and DXY need a 21-session change before a gold macro bias is assigned. Missing inputs are not treated as neutral.";
	const secondary = [
		r10.d21 != null ? `Real yield, ~21 sessions: ${bps(r10.d21)}.` : null,
		y2.d21 != null ? `US 2Y, ~21 sessions: ${bps(y2.d21)}.` : null,
		dx.d21 != null ? `DXY, ~21 sessions: ${signed(dx.d21, 2, "%")}.` : null
	].filter((s) => Boolean(s));
	let alert = null;
	if (bias === "Bullish" && losing) alert = "Bullish Gold Macro Thesis Losing Confirmation.";
	if (bias === "Bearish" && losing) alert = "Bearish Gold Macro Thesis Losing Confirmation.";
	const invalidation = bias === "Bullish" ? "Invalidation of the bullish gold macro read: on a 5-session window, 10Y real yield rises more than 5 bps, US 2Y rises more than 5 bps, and DXY rises more than 0.4%, together. One of those reversing is an early warning, not yet a full invalidation." : bias === "Bearish" ? "Invalidation of the bearish gold macro read: on a 5-session window, 10Y real yield falls more than 5 bps, US 2Y falls more than 5 bps, and DXY falls more than 0.4%, together." : "No directional thesis is active, so there is nothing to invalidate. A thesis requires at least two of real yield, 2Y, and DXY to move the same way for gold.";
	const thesis = bias === "Bullish" ? "Working thesis: gold's macro backdrop is bullish because the opportunity-cost and dollar links have eased. This is a description of the current tape, not a forecast that gold will rise." : bias === "Bearish" ? "Working thesis: gold's macro backdrop is bearish because real yields and/or the dollar have tightened. This is not a forecast that gold will fall." : bias === "Neutral" ? "No working directional thesis. The core market links disagree or are inside the flat band." : "No working thesis. Evidence is short of the minimum.";
	const pricedDetail = "Priced-in status needs three layers: a pre-event expectation, market pricing of that expectation (futures, OIS, or a sourced implied distribution), and the post-event change in that pricing. Fed funds futures, SOFR futures, and OIS were not retrieved. Consensus forecasts were not retrieved. The status is therefore not forced.";
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
	const cpiAccel = cpiYoy != null && yoyEnding(cpi, 3) != null ? cpiYoy - yoyEnding(cpi, 3) : null;
	let inflation = "Insufficient";
	if (cpiYoy != null && cpiAccel != null) {
		if (cpiYoy >= 3 && cpiAccel > .1) inflation = "Hawkish";
		else if (cpiYoy <= 2.5 && cpiAccel < -.1) inflation = "Dovish";
		else inflation = "Neutral";
	}
	const inflationDetail = cpiYoy == null ? `CPI year-over-year could not be computed. ${GAP}.` : `CPI-U NSA YoY is ${num(cpiYoy, 2, "%")}${latestBls(cpi) ? ` (${latestBls(cpi)?.label})` : ""}. Change in that YoY versus three months earlier: ${signed(cpiAccel, 2, " pp")}. Core NSA YoY: ${num(yoyEnding(core, 0), 2, "%")}. SA headline 3-month annualized: ${num(ann3(cpiSa), 2, "%")}. Rule (model, not the Fed's): hawkish if YoY ≥ 3.0 and YoY has risen more than 0.1 pp over three months; dovish if YoY ≤ 2.5 and YoY has fallen more than 0.1 pp; otherwise neutral.`;
	const u = latestBls(unemp);
	const u3 = levelChg(unemp, 3);
	const nfpMonthly = [];
	if (nfp && nfp.length > 3) for (let back = 0; back < 3; back++) {
		const a = blsAt(nfp, back);
		const b = blsAt(nfp, back + 1);
		if (a && b) nfpMonthly.push(a.value - b.value);
	}
	const nfpAvg = nfpMonthly.length === 3 ? nfpMonthly.reduce((a, b) => a + b, 0) / 3 : null;
	const aheYoy = yoyEnding(ahe, 0);
	let employment = "Insufficient";
	if (u && u3 != null && nfpAvg != null) {
		if (u3 <= -.1 && nfpAvg >= 150) employment = "Hawkish";
		else if (u3 >= .2 || nfpAvg <= 50) employment = "Dovish";
		else employment = "Neutral";
		if (employment === "Dovish" && aheYoy != null && aheYoy >= 4) employment = "Neutral";
		if (employment === "Hawkish" && aheYoy != null && aheYoy < 3) employment = "Neutral";
	}
	const employmentDetail = !u || nfpAvg == null ? `Unemployment or payroll changes are missing. ${GAP} for the labor leg.` : `Unemployment ${num(u.value, 1, "%")} (${u.label}), ${signed(u3, 1, " pp")} over three months. Nonfarm payrolls, 3-month average change ${signed(nfpAvg, 0, " thousand")} (latest monthly ${signed(nfpMonthly[0] ?? null, 0, " thousand")}${prelim(latestBls(nfp))}). Average hourly earnings YoY ${num(aheYoy, 2, "%")}, MoM ${num(mom(ahe), 2, "%")}. Rule (model): hawkish if unemployment is down at least 0.1 pp over three months and the 3-month payroll average is at least +150k; dovish if unemployment is up at least 0.2 pp or the payroll average is +50k or less. A dovish jobs mix is set back to neutral if AHE YoY is still at least 4%. A hawkish jobs mix is set back to neutral if AHE YoY is under 3%.`;
	let fedPressure = "Insufficient";
	if (inflation !== "Insufficient" && employment !== "Insufficient") {
		if (inflation === "Hawkish" && employment === "Hawkish") fedPressure = "Hawkish";
		else if (inflation === "Dovish" && employment === "Dovish") fedPressure = "Dovish";
		else if ((inflation === "Hawkish" || inflation === "Dovish") && employment === "Neutral") fedPressure = inflation;
		else if ((employment === "Hawkish" || employment === "Dovish") && inflation === "Neutral") fedPressure = employment;
		else fedPressure = "Neutral";
	} else if (inflation !== "Insufficient") fedPressure = inflation;
	else if (employment !== "Insufficient") fedPressure = employment;
	const fedPressureDetail = `Inflation leg ${inflation}. Employment leg ${employment}. Growth leg Insufficient — GDP, ISM, retail sales, industrial production, durable goods, and confidence were not retrieved. Composite ${fedPressure}. A partial composite is not a Fed decision and is not converted into a cut, hold, or hike probability.`;
	const cpiFresh = latestBls(cpi)?.date === "2026-08-01" && nowMs < Date.parse("2026-10-14T12:30:00Z") ? "Current vintage. September CPI is scheduled for 14 Oct 2026 and is not in this response." : latestBls(cpi) ? "Latest point returned by BLS. Compare the period with the release calendar before treating it as current." : GAP;
	const ppiFresh = latestBls(ppi)?.date === "2026-08-01" && nowMs < Date.parse("2026-10-15T00:00:00Z") ? "Current vintage. FRED lists the next PPI release as 15 Oct 2026." : latestBls(ppi) ? "Latest point returned by BLS." : GAP;
	const nfpFresh = latestBls(nfp)?.date === "2026-09-01" && nowMs < Date.parse("2026-11-06T13:30:00Z") ? "Current vintage. October Employment Situation is on the BLS November schedule for 6 Nov 2026." : latestBls(nfp) ? "Latest point returned by BLS." : GAP;
	const joltsFresh = latestBls(jolts)?.date === "2026-08-01" && nowMs < Date.parse("2026-11-03T15:00:00Z") ? "Current vintage. BLS lists JOLTS for September 2026 on 3 Nov 2026." : latestBls(jolts) ? "Latest point returned by BLS." : GAP;
	const nfpLast = latestBls(nfp);
	const nfpPrev = blsAt(nfp, 1);
	const nfpChg = levelChg(nfp, 1);
	const joltsLast = latestBls(jolts);
	const joltsPrev = blsAt(jolts, 1);
	const prints = [
		{
			group: "Inflation",
			rows: [
				indexPrint({
					name: "CPI",
					points: cpi,
					unit: "Index, 1982-84=100",
					frequency: "Monthly",
					source: "BLS CUUR0000SA0 · CPI-U all items, not seasonally adjusted. https://data.bls.gov/timeseries/CUUR0000SA0",
					freshness: cpiFresh,
					showYoy: true
				}),
				indexPrint({
					name: "CPI, seasonally adjusted",
					points: cpiSa,
					unit: "Index",
					frequency: "Monthly",
					source: "BLS CUSR0000SA0. MoM uses the SA index, which is the usual monthly comparison.",
					freshness: cpiFresh,
					showMom: true
				}),
				indexPrint({
					name: "Core CPI",
					points: core,
					unit: "Index",
					frequency: "Monthly",
					source: "BLS CUUR0000SA0L1E · CPI-U all items less food and energy, not seasonally adjusted.",
					freshness: cpiFresh,
					showYoy: true
				}),
				indexPrint({
					name: "Core CPI, seasonally adjusted",
					points: coreSa,
					unit: "Index",
					frequency: "Monthly",
					source: "BLS CUSR0000SA0L1E.",
					freshness: cpiFresh,
					showMom: true
				}),
				gapRow("PCE", "BEA personal consumption expenditures price index was not retrieved. No API keyless BEA feed responded in this build."),
				gapRow("Core PCE", "BEA core PCE was not retrieved."),
				indexPrint({
					name: "PPI",
					points: ppi,
					unit: "Index",
					frequency: "Monthly",
					source: "BLS WPSFD4 · PPI final demand, seasonally adjusted.",
					freshness: ppiFresh,
					showYoy: true,
					showMom: true
				}),
				indexPrint({
					name: "Core PPI",
					points: ppiCore,
					unit: "Index, Aug 2013=100",
					frequency: "Monthly",
					source: "BLS WPSFD49116 · PPI final demand less foods, energy, and trade services, seasonally adjusted.",
					freshness: ppiFresh,
					showYoy: true,
					showMom: true
				}),
				indexPrint({
					name: "Average hourly earnings",
					points: ahe,
					unit: "Dollars",
					frequency: "Monthly",
					source: "BLS CES0500000003 · average hourly earnings, total private, seasonally adjusted.",
					freshness: nfpFresh,
					showYoy: true,
					showMom: true
				})
			]
		},
		{
			group: "Labor",
			rows: [
				nfpLast && nfpPrev ? {
					name: "Nonfarm payrolls",
					period: nfpLast.label,
					actual: `${signed(nfpChg, 0, " thousand")} (level ${ints(nfpLast.value)} thousand)`,
					previous: `level ${ints(nfpPrev.value)} thousand`,
					revisedNote: "The change is the difference of levels in the current BLS vintage. As-first-published payrolls are DATA UNAVAILABLE." + prelim(nfpLast),
					forecast: GAP,
					unit: "Thousands of persons",
					frequency: "Monthly",
					freshness: nfpFresh,
					source: "BLS CES0000000001 · all employees, total nonfarm, seasonally adjusted.",
					observedChange: `Latest monthly change ${signed(nfpChg, 0, " thousand")}. 3-month average ${signed(nfpAvg, 0, " thousand")}. Not a surprise.`,
					surprise: NO_SURPRISE
				} : gapRow("Nonfarm payrolls", "BLS CES0000000001"),
				indexPrint({
					name: "Unemployment rate",
					points: unemp,
					unit: "Percent",
					frequency: "Monthly",
					source: "BLS LNS14000000 · unemployment rate, 16 years and over, seasonally adjusted.",
					freshness: nfpFresh,
					alreadyPercent: true
				}),
				gapRow("Initial jobless claims", "Department of Labor weekly claims were not retrieved."),
				gapRow("Continuing claims", "Continuing claims were not retrieved."),
				joltsLast ? {
					name: "JOLTS job openings",
					period: joltsLast.label,
					actual: `${ints(joltsLast.value)} thousand`,
					previous: joltsPrev ? `${ints(joltsPrev.value)} thousand` : GAP,
					revisedNote: "Current vintage. As-first-published openings are DATA UNAVAILABLE." + prelim(joltsLast),
					forecast: GAP,
					unit: "Thousands",
					frequency: "Monthly",
					freshness: joltsFresh,
					source: "BLS JTS000000000000000JOL · total nonfarm job openings, seasonally adjusted.",
					observedChange: `Change versus prior month ${signed(levelChg(jolts, 1), 0, " thousand")}. Not a surprise.`,
					surprise: NO_SURPRISE
				} : gapRow("JOLTS", "BLS JTS000000000000000JOL"),
				gapRow("ADP employment", "ADP was not retrieved. It is a private series, not a BLS print."),
				indexPrint({
					name: "Employment Cost Index",
					points: eci,
					unit: "12-month percent change",
					frequency: "Quarterly",
					source: "BLS CIU1010000000000A · total compensation, all civilian workers, 12-month percent change, not seasonally adjusted.",
					freshness: "Latest point returned by BLS. The next ECI publication date was not retrieved, so staleness is not judged.",
					alreadyPercent: true
				})
			]
		},
		{
			group: "Growth",
			rows: [
				gapRow("GDP", "BEA GDP was not retrieved."),
				gapRow("ISM manufacturing", "ISM was not retrieved. There is no keyless official ISM feed in this build."),
				gapRow("ISM services", "ISM was not retrieved."),
				gapRow("PMI", "S&P Global / ISM PMI was not retrieved."),
				gapRow("Retail sales", "Census retail sales were not retrieved."),
				gapRow("Industrial production", "Federal Reserve industrial production was not retrieved."),
				gapRow("Durable goods", "Census durable goods were not retrieved."),
				gapRow("Consumer confidence", "Conference Board / University of Michigan sentiment was not retrieved.")
			]
		},
		{
			group: "Financial conditions",
			rows: [
				gapRow("Financial conditions index", "Chicago Fed NFCI and similar indexes were not retrieved."),
				gapRow("Credit spread (OAS)", "A sourced option-adjusted spread was not retrieved. HYG price is not a spread."),
				{
					name: "HYG price (not a spread)",
					period: hyg.lastDate ?? GAP,
					actual: num(hyg.last, 2),
					previous: hyg.from1 != null ? num(hyg.from1, 2) : GAP,
					revisedNote: "Vendor quote. Not an official spread.",
					forecast: GAP,
					unit: "ETF price, USD",
					frequency: "Daily",
					freshness: hyg.lastDate ? "Latest Yahoo chart bar" : GAP,
					source: "Yahoo Finance chart HYG. High-yield corporate bond ETF. Price up is not 'spreads tighter' by identity.",
					observedChange: `~5 sessions ${signed(hyg.d5, 2, "%")} · ~21 sessions ${signed(hyg.d21, 2, "%")}.`,
					surprise: NO_SURPRISE
				},
				gapRow("Mortgage rates", "A primary mortgage rate series was not retrieved.")
			]
		}
	];
	const yieldRows = [
		["2Y", y2],
		["5Y", y5],
		["10Y", y10],
		["30Y", y30],
		["10Y real", r10],
		["5Y real", r5],
		["30Y real", r30]
	];
	const tnxNote = raw.tnx != null && y10.last != null ? `Cross-check, not a second official print: CBOE 10-year yield index ^TNX last vendor quote ${raw.tnx.toFixed(3)} versus Treasury 10Y CMT ${y10.last.toFixed(2)}% on ${y10.lastDate}. They are different instruments.` : "CBOE ^TNX cross-check was not available.";
	const y2VsPath = "A 12-month fed funds path was not retrieved, so the 2Y move is not compared with a change in expected policy. The 2Y is only the Treasury par yield.";
	const realInterp = r10.d21 == null ? `Interpretation withheld. ${GAP}.` : r10.d21 < -.05 ? `Falling real yields are generally supportive for gold, because the opportunity cost of holding a non-yielding asset is lower. Over ~21 sessions the 10Y real yield is ${bps(r10.d21)}. This is a tendency, not an instruction, and it is checked against the dollar, risk sentiment, and positioning.` : r10.d21 > .05 ? `Rising real yields are generally restrictive for gold. Over ~21 sessions the 10Y real yield is ${bps(r10.d21)}. This is not applied automatically: the dollar, liquidity, risk sentiment, and positioning are checked separately, and none of them is allowed to invent a missing series.` : `The 10Y real yield is inside the ±5 bp flat band over ~21 sessions (${bps(r10.d21)}). No supportive or restrictive gold implication is taken from real yields on this window.`;
	const dxyRelation = dx.d21 == null || bias == null ? "Whether the dollar confirms or contradicts the gold macro thesis is withheld until both a thesis and a DXY window exist." : dxVote === "supportive" && bias === "Bullish" ? "DXY confirms the bullish gold macro thesis on the 21-session window (softer dollar)." : dxVote === "restrictive" && bias === "Bearish" ? "DXY confirms the bearish gold macro thesis on the 21-session window (firmer dollar)." : dxVote === "flat" ? "DXY is inside the flat band and neither confirms nor contradicts." : "DXY contradicts the gold macro thesis on the 21-session window.";
	const goldBars = goldSeries?.bars ?? [];
	const goldCloses = goldObs.map((p) => p.value);
	const logR = [];
	for (let i = 1; i < goldObs.length; i++) {
		const a = goldObs[i - 1].value;
		const b = goldObs[i].value;
		if (a > 0 && b > 0) logR.push(Math.log(b / a));
	}
	const rv = stdev(logR.slice(-20));
	const realized = rv == null ? null : rv * Math.sqrt(252) * 100;
	const atr14 = atr(goldBars, 14);
	const vols = goldBars.map((b) => b.volume).filter((v) => v != null && v > 0);
	const vol20 = vols.length >= 20 ? vols.slice(-20).reduce((a, b) => a + b, 0) / 20 : null;
	const lastVol = vols.length ? vols[vols.length - 1] : null;
	let riskRegime = "Neutral";
	const vixLast = vix.last;
	if (vixLast != null && vixLast >= 22) riskRegime = "Risk-Off";
	else if (spx.d5 != null && spx.d5 <= -1.5) riskRegime = "Risk-Off";
	else if (spx.d5 != null && spx.d5 >= 1 && (vixLast == null || vixLast < 18) && (hyg.d5 == null || hyg.d5 > -.4)) riskRegime = "Risk-On";
	const riskDetail = `Model rule, not a market fact: Risk-Off if VIX ≥ 22 or S&P 500 is down at least 1.5% over ~5 sessions. Risk-On if S&P 500 is up at least 1% over ~5 sessions, VIX is under 18, and HYG is not down more than 0.4% over ~5 sessions. Otherwise Neutral. Now: VIX ${num(vixLast, 2)}, S&P 500 ~5 sessions ${signed(spx.d5, 2, "%")}, HYG ~5 sessions ${signed(hyg.d5, 2, "%")}.`;
	let goldRiskNote = "Risk-off is not treated as gold-bullish. The dollar is checked before any safe-haven story is entertained.";
	if (riskRegime === "Risk-Off" && dx.d5 != null && dx.d5 > .25) goldRiskNote = "Risk-off is coinciding with a firmer DXY over ~5 sessions. Dollar demand can offset a safe-haven bid. This is a conflict to notice, not a conclusion that gold must fall.";
	else if (riskRegime === "Risk-Off" && dx.d5 != null && dx.d5 < -.25) goldRiskNote = "Risk-off with a softer DXY over ~5 sessions is the mix that more often leaves room for gold. It is still not an automatic bid, and it is not evidence of why the tape is here.";
	const mm = raw.cot?.managed ?? null;
	const mmNet = mm ? mm.long - mm.short : null;
	const mmNetChg = mm ? mm.longChg - mm.shortChg : null;
	const oi = raw.cot?.oi ?? null;
	const posReading = mm ? `Managed money net (long minus short, spreading excluded) is ${ints(mmNet)} contracts${oi ? `, ${num(mmNet != null && oi ? mmNet / oi * 100 : null, 1, "%")} of open interest` : ""}. Week change in that net: ${signed(mmNetChg, 0, " contracts")}. That is an observed change. It is not a forecast that price will reverse, and it is not a crowded-trade call.` : `Positioning ${GAP}.`;
	const goldInstrument = goldIsFutures ? "COMEX gold futures, GC=F" : "XAUUSD spot quote, XAUUSD=X";
	const goldDisclaimer = goldIsFutures ? "Spot XAUUSD was not returned by the vendor. The price used is COMEX gold futures (GC=F), a liquid proxy, not an LBMA fix and not an official COMEX settlement. Do not relabel it as spot." : "Vendor spot symbol XAUUSD=X. Not an LBMA fix. Futures are shown only if spot is missing.";
	const movePhrase = (vote, label, text) => {
		if (vote === "abstain") return `${label}: ${GAP}. No gold implication is taken.`;
		if (vote === "flat") return `${label} is inside the flat band. No gold implication is taken.`;
		if (vote === "supportive") return `${text} Model rule on an observed move. Not a law, and not a trade.`;
		return `${text} Model rule on an observed move. Not a law, and not a trade.`;
	};
	const matrix = [
		{
			variable: "10Y real yield",
			move: `~21 sessions ${bps(r10.d21)} · last ${num(r10.last, 2, "%")}`,
			interpretation: movePhrase(realVote, "Real yield", realVote === "supportive" ? "Lower real yield: generally supportive for gold (opportunity cost)." : "Higher real yield: generally restrictive for gold (opportunity cost).")
		},
		{
			variable: "US 2Y",
			move: `~21 sessions ${bps(y2.d21)} · last ${num(y2.last, 2, "%")}`,
			interpretation: movePhrase(y2Vote, "2Y", y2Vote === "supportive" ? "Lower 2Y: consistent with easier short-end policy pricing. Bullish for gold only as a proxy, not as a fed funds probability." : "Higher 2Y: consistent with tighter short-end policy pricing. Restrictive for gold only as a proxy.")
		},
		{
			variable: "DXY",
			move: `~21 sessions ${signed(dx.d21, 2, "%")} · last ${num(dx.last, 3)}`,
			interpretation: movePhrase(dxVote, "DXY", dxVote === "supportive" ? "Softer dollar: generally supportive for gold." : "Firmer dollar: generally restrictive for gold.")
		},
		{
			variable: "Fed expectations",
			move: GAP,
			interpretation: "Hold, cut, and hike probabilities are DATA UNAVAILABLE. No gold implication is taken from a path this terminal does not have."
		},
		{
			variable: "Risk sentiment",
			move: riskRegime,
			interpretation: "Context-dependent. Risk-off is not coded as bullish gold. See the dollar check."
		},
		{
			variable: "Positioning",
			move: mm ? `Managed money net ${ints(mmNet)}` : GAP,
			interpretation: "Not a directional gold signal. Historical percentile is DATA UNAVAILABLE, so crowded-long risk is not assigned."
		},
		{
			variable: "Gold proxy",
			move: `~21 sessions ${signed(g.d21, 2, "%")} · last ${num(g.last, 2)}`,
			interpretation: confirmation === "Confirmed" ? "Price confirms the macro thesis on the 21-session window." : confirmation === "Divergent" ? "Price does not confirm the macro thesis." : confirmation === "Partial" ? "Price confirmation is only partial." : "No confirmation test, because there is no directional macro thesis."
		}
	];
	let divClass = "Insufficient Evidence";
	let divDetail = "A divergence test needs a directional macro thesis and a gold window. One of those is missing or the links are split.";
	if (bias === "Bullish" && goldUp21) {
		divClass = "Strong Macro Confirmation";
		divDetail = "Real yield, the short end, and/or the dollar have eased, and the gold proxy is higher over ~21 sessions. Case A in the framework. This is confirmation of the tape, not a prediction.";
	} else if (bias === "Bullish" && goldDown21) {
		divClass = "Macro/Price Divergence";
		divDetail = "The macro links lean easier for gold, and the gold proxy is lower over ~21 sessions. Case B. Do not jump to a reversal.";
	} else if (bias === "Bearish" && goldUp21) {
		divClass = "Gold showing unusual resilience";
		divDetail = "The macro links lean restrictive, and the gold proxy is higher over ~21 sessions. Case C. Flagged for investigation. A cause is not assigned.";
	} else if (bias === "Bearish" && goldDown21) {
		divClass = "Restrictive tape confirmed by price";
		divDetail = "Restrictive macro links and a lower gold proxy over ~21 sessions. Alignment, not a forecast that the move continues.";
	}
	const hypotheses = divClass === "Macro/Price Divergence" || divClass === "Gold showing unusual resilience" ? [
		"Possible explanations, none of them established: the move was already in the price, positioning, another data point the same day, liquidity, location in the daily range, risk-off dollar demand, or a shift in Fed communication.",
		"The terminal does not pick one. Intraday event paths and fed funds futures are DATA UNAVAILABLE, so several of those explanations cannot be tested here.",
		mm ? `Positioning fact that can be stated without choosing a cause: managed money net is ${ints(mmNet)} contracts, weekly net change ${signed(mmNetChg, 0)}. Without a historical percentile this is not evidence of a crowded trade.` : "Positioning was not available to use as evidence."
	] : ["No divergence case is open, so no causal hypothesis is offered."];
	const releaseReactions = [
		{
			name: "CPI (August 2026)",
			date: "2026-09-11"
		},
		{
			name: "FOMC decision (September)",
			date: "2026-09-16"
		},
		{
			name: "Employment Situation (September 2026)",
			date: "2026-10-02"
		}
	].map((e) => ({
		event: e.name,
		date: e.date,
		gold: sessionMove(goldObs, e.date, "pct"),
		y2: sessionMove(raw.nominal.y2, e.date, "bps"),
		real: sessionMove(raw.real.real10, e.date, "bps"),
		dxy: sessionMove(dxyObs, e.date, "pct")
	}));
	const changed = [];
	if (g.d1 != null && Math.abs(g.d1) >= .3) changed.push(`Gold proxy ${signed(g.d1, 2, "%")} on the latest session.`);
	if (r10.d1 != null && Math.abs(r10.d1) >= .02) changed.push(`10Y real yield ${bps(r10.d1)} on the latest Treasury session (${r10.lastDate}).`);
	if (y2.d1 != null && Math.abs(y2.d1) >= .02) changed.push(`US 2Y ${bps(y2.d1)} on the latest Treasury session.`);
	if (dx.d1 != null && Math.abs(dx.d1) >= .15) changed.push(`DXY ${signed(dx.d1, 2, "%")} on the latest session.`);
	if (vix.d1 != null && Math.abs(vix.d1) >= 1) changed.push(`VIX ${signed(vix.d1, 2, " pts")} on the latest session.`);
	if (!changed.length) changed.push("No move beyond the flat band on the latest session for the gold proxy, 2Y, 10Y real yield, or DXY.");
	const recentNews = raw.news.filter((n) => {
		const t = Date.parse(n.pubDate);
		return Number.isFinite(t) && nowMs - t < 432e6 && nowMs - t > -864e5;
	});
	const ma20 = ma(goldCloses, 20);
	const ma60 = ma(goldCloses, 60);
	const lastPx = g.last;
	let techRegime = "DATA UNAVAILABLE";
	if (lastPx != null && ma20 != null && ma60 != null) {
		if (lastPx > ma20 && ma20 > ma60) techRegime = "Daily structure: rising. Price is above the 20-session average and that average is above the 60-session average.";
		else if (lastPx < ma20 && ma20 < ma60) techRegime = "Daily structure: falling. Price is below the 20-session average and that average is below the 60-session average.";
		else techRegime = "Daily structure: mixed. Price and the 20- and 60-session averages do not agree.";
	}
	const window60 = goldCloses.slice(-60);
	const hi = window60.length ? Math.max(...window60) : null;
	const lo = window60.length ? Math.min(...window60) : null;
	const location = lastPx != null && hi != null && lo != null && hi > lo ? `The last price sits ${num((lastPx - lo) / (hi - lo) * 100, 0, "%")} of the way from the 60-session low to the 60-session high. That is a location statistic, not a support or resistance level.` : `Range location ${GAP}.`;
	const separation = bias === "Bullish" && techRegime.startsWith("Daily structure: falling") ? "Bullish macro environment, but daily price structure is not confirming. This is not a trade instruction." : bias === "Bearish" && techRegime.startsWith("Daily structure: rising") ? "Bearish macro environment, but daily price structure is not confirming. This is not a trade instruction." : `Macro: ${bias ?? "INSUFFICIENT EVIDENCE"}. Technical: ${techRegime} These layers stay separate. This is not a trade instruction.`;
	const y2Daily = raw.nominal.y2.slice(1).map((p, i) => (p.value - raw.nominal.y2[i].value) * 100);
	const y10Daily = raw.nominal.y10.slice(1).map((p, i) => (p.value - raw.nominal.y10[i].value) * 100);
	const eventPhase = liveEvent == null ? "none" : nowMs < Date.parse(liveEvent.iso) ? "pre" : "post";
	const eventBlocks = liveEvent == null ? [{
		heading: "No major event inside the window",
		body: "CPI, PCE, NFP, FOMC, and the minutes date are not inside the pre/post window. The calendar below is still the watchlist."
	}] : eventPhase === "pre" ? [
		{
			heading: "Before",
			body: `Consensus for this event: ${GAP}. Previous policy setting that is observed: effective federal funds target ${raw.effr ? `${raw.effr.targetLow.toFixed(2)}–${raw.effr.targetHigh.toFixed(2)}%` : GAP} as of ${raw.effr?.date ?? "n/a"} (NY Fed). Market-implied probabilities and the expected policy path: ${GAP}.`
		},
		{
			heading: "Market going in",
			body: `10Y real ${num(r10.last, 2, "%")} (${r10.lastDate ?? "n/a"}). US 2Y ${num(y2.last, 2, "%")}. DXY ${num(dx.last, 3)}. Gold proxy ${num(g.last, 2)} (${goldInstrument}). Positioning: ${mm ? `managed money net ${ints(mmNet)} as of ${raw.cot?.date}` : GAP}. Implied volatility around the event: ${GAP}.`
		},
		{
			heading: "What is not claimed",
			body: `${liveEvent.source} The text of the event is not in hand. Nothing in the pre-event panel is a prediction of the wording or of the gold reaction.`
		}
	] : [
		{
			heading: "Before",
			body: `The pre-event market-implied path was not stored, because futures were ${GAP} before the event as well.`
		},
		{
			heading: "Actual",
			body: `The released text or data for ${liveEvent.name} was not retrieved after the timestamp. ${GAP}. Headlines are not substituted.`
		},
		{
			heading: "Immediate reaction",
			body: "T+5 minute and T+15 minute paths are DATA UNAVAILABLE. This terminal has daily bars only."
		},
		{
			heading: "Repricing",
			body: "Change in rate expectations: DATA UNAVAILABLE. A same-day yield change, once the Treasury close exists, is a yield fact, not proof of a policy-path repricing."
		},
		{
			heading: "Follow-through",
			body: "1-hour and 4-hour follow-through are DATA UNAVAILABLE. The next daily close is the first horizon this terminal can measure, and it mixes the whole session."
		},
		{
			heading: "Final assessment",
			body: "Insufficient Evidence. Priced-in versus repricing is not assigned."
		}
	];
	const cotRows = raw.cot ? [
		"managed",
		"producer",
		"swap",
		"other"
	].map((key) => {
		const book = raw.cot[key];
		const name = key === "managed" ? "Managed money" : key === "producer" ? "Producer / merchant" : key === "swap" ? "Swap dealers" : "Other reportables";
		const net = book.long - book.short;
		const netChg = book.longChg - book.shortChg;
		return {
			book: name,
			long: ints(book.long),
			short: ints(book.short),
			spread: book.spread == null ? "—" : ints(book.spread),
			net: ints(net),
			weekly: signed(netChg, 0),
			pctOi: oi ? num(net / oi * 100, 1, "%") : GAP
		};
	}) : [];
	const sources = [
		{
			name: "Treasury",
			ok: raw.nominal.y10.length > 0 && raw.real.real10.length > 0,
			detail: raw.nominal.y10.length ? `CMT through ${y10.lastDate}` : "Yield curve not retrieved"
		},
		{
			name: "BLS",
			ok: Boolean(latestBls(cpi) || latestBls(nfp)),
			detail: latestBls(cpi) ? `CPI ${latestBls(cpi)?.label}` : "Macro vintages not retrieved"
		},
		{
			name: "NY Fed",
			ok: Boolean(raw.effr),
			detail: raw.effr ? `EFFR ${raw.effr.rate.toFixed(2)}% ${raw.effr.date}` : "EFFR not retrieved"
		},
		{
			name: "CFTC",
			ok: Boolean(raw.cot),
			detail: raw.cot ? `Disaggregated futures ${raw.cot.date}` : "COT not retrieved"
		},
		{
			name: "Yahoo",
			ok: Boolean(goldSeries && goldSeries.price != null),
			detail: goldSeries?.price != null ? goldInstrument : "Gold quote not retrieved"
		},
		{
			name: "Fed press",
			ok: raw.news.length > 0,
			detail: raw.news.length ? `${raw.news.length} monetary-policy items` : "RSS not retrieved"
		}
	];
	const failed = raw.errors.map((e) => `${e.source}: ${e.message}`).slice(0, 6);
	return {
		retrievedAt: raw.retrievedAt,
		clockNote: clock(raw.retrievedAt),
		sources,
		state: {
			biasLabel: bias ?? "INSUFFICIENT EVIDENCE",
			biasTone: bias === "Bullish" ? "bull" : bias === "Bearish" ? "bear" : bias === "Neutral" ? "neutral" : "gap",
			confidenceLabel: confidence ?? "—",
			primaryDriver: primary,
			secondary,
			confirmation,
			confirmationDetail,
			pricedIn: "Insufficient Evidence",
			pricedInDetail: pricedDetail,
			positioningRisk: "Insufficient Evidence",
			positioningDetail: "Crowded-position risk is Low, Medium, or High only with a historical percentile. That distribution was not loaded. The latest COT week is shown so the position can be seen. It is not scored.",
			nextCatalyst: next ? `${next.name} · ${next.covers}` : "No further dated catalyst in the built-in calendar.",
			nextCatalystWhen: next ? `${next.when}. ${next.source}` : GAP,
			invalidation,
			invalidationAlert: alert,
			thesis
		},
		chain: [
			{
				label: "Economic data",
				status: latestBls(cpi) || latestBls(nfp) ? "partial" : "blocked",
				reading: "BLS inflation and labor vintages are in. PCE, GDP, ISM, claims, and confidence are not."
			},
			{
				label: "Actual vs forecast",
				status: "blocked",
				reading: "Actuals exist for several BLS series. Consensus forecasts were not retrieved, so the comparison stops."
			},
			{
				label: "Economic surprise",
				status: "blocked",
				reading: "Surprise = actual minus consensus, then standardized. Without a sourced consensus and a history of surprises, the surprise is not computed."
			},
			{
				label: "Fed reaction function",
				status: fedPressure === "Insufficient" ? "blocked" : "model",
				reading: `Model composite: ${fedPressure}. It is not a decision, and it is not market pricing.`
			},
			{
				label: "Market-implied policy",
				status: "blocked",
				reading: "Fed funds futures, SOFR futures, and OIS were not retrieved. No hold, cut, or hike probability is shown."
			},
			{
				label: "Expected rate path",
				status: "blocked",
				reading: "Next meeting, 3-month, 6-month, and 12-month implied policy rates are DATA UNAVAILABLE."
			},
			{
				label: "Yields and real yield",
				status: r10.last != null && y2.last != null ? "open" : "partial",
				reading: "Treasury constant-maturity par yields and real yields. Official. This is not a substitute for the missing futures path."
			},
			{
				label: "USD",
				status: dx.last != null ? "open" : "blocked",
				reading: "DXY is a vendor index quote (DX-Y.NYB), not a Federal Reserve print."
			},
			{
				label: "XAUUSD",
				status: g.last != null ? "open" : "blocked",
				reading: goldDisclaimer
			}
		],
		crossChecks: [
			{
				label: "Positioning",
				status: raw.cot ? "partial" : "blocked",
				reading: raw.cot ? "Latest CFTC disaggregated futures week. Percentile and options positioning are missing, so this check cannot override price." : GAP
			},
			{
				label: "Liquidity",
				status: raw.rrp ? "partial" : "blocked",
				reading: "Only overnight reverse repo was retrieved. The Fed balance sheet and the Treasury General Account were not. No liquidity regime is declared."
			},
			{
				label: "Risk sentiment",
				status: spx.last != null || vixLast != null ? "model" : "blocked",
				reading: `${riskRegime}. A model label from VIX, the S&P 500, and HYG. It does not replace market pricing.`
			},
			{
				label: "Technical structure",
				status: ma20 != null ? "model" : "blocked",
				reading: "Daily averages and range location only. Intraday structure is DATA UNAVAILABLE. Kept off the macro thesis."
			}
		],
		yields: yieldRows.map(([tenor, w]) => ({
			tenor,
			current: num(w.last, 2, "%"),
			daily: bps(w.d1),
			weekly: bps(w.d5),
			monthly: bps(w.d21),
			trend: trend(w.d21, .05)
		})),
		yieldNote: `Source: U.S. Treasury daily par yield curve and real yield curve. Latest nominal session ${y10.lastDate ?? GAP}. ${tnxNote} Windows are 1, 5, and 21 observations, not calendar weeks, and the endpoint dates are on each series.`,
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
				riskRegime === "Risk-Off" ? goldRiskNote : "Risk sentiment is not currently tagged Risk-Off, so it is not being used to override the real-yield tendency.",
				"Geopolitical risk is not scored. No news item is treated as a safe-haven fact."
			]
		},
		usd: {
			current: num(dx.last, 3),
			daily: signed(dx.d1, 2, "%"),
			weekly: signed(dx.d5, 2, "%"),
			monthly: signed(dx.d21, 2, "%"),
			trend: trend(dx.d21, .6, "Firmer", "Softer"),
			relation: dxyRelation,
			source: dxySeries ? `Yahoo Finance chart ${dxySeries.symbol}${dxySeries.exchange ? ` · ${dxySeries.exchange}` : ""}. Last vendor time ${dxySeries.marketTime ?? GAP}.` : GAP
		},
		gold: {
			instrument: goldInstrument,
			disclaimer: goldDisclaimer,
			price: num(g.last, 2),
			daily: signed(g.d1, 2, "%"),
			weekly: signed(g.d5, 2, "%"),
			monthly: signed(g.d21, 2, "%"),
			realizedVol: realized == null ? GAP : `${num(realized, 1, "%")} annualized, 20 sessions, close-to-close. Model estimate from observed closes.`,
			atr: atr14 == null ? GAP : `${num(atr14, 2)} USD. ATR(14) on daily bars. Model estimate. Not implied volatility.`,
			volume: lastVol == null ? GAP : `${ints(lastVol)} vs 20-session average ${vol20 == null ? GAP : ints(vol20)}. Vendor volume for this instrument.`,
			openInterest: raw.cot ? `${ints(raw.cot.oi)} contracts in the CFTC futures report dated ${raw.cot.date} (weekly, change ${signed(raw.cot.oiChg, 0)}). Live exchange open interest is DATA UNAVAILABLE.` : `Live and weekly open interest ${GAP}.`,
			source: goldSeries ? `Yahoo Finance chart ${goldSeries.symbol}${goldSeries.shortName ? ` · ${goldSeries.shortName}` : ""}.` : GAP,
			asOf: goldSeries?.marketTime ?? g.lastDate ?? GAP
		},
		charts: {
			gold: goldObs.slice(-140),
			real10: raw.real.real10.slice(-140),
			y2: raw.nominal.y2.slice(-140),
			dxy: dxyObs.slice(-140)
		},
		prints,
		surpriseSummary: "Economic surprise is not scored. A standardized surprise needs the historical distribution of (actual − consensus). Consensus was not retrieved from a primary or licensed survey, and it is not estimated. Observed momentum (the change in the data itself) is shown in the print table and is a different object.",
		reaction: {
			inflation: legLabel(inflation),
			inflationDetail,
			employment: legLabel(employment),
			employmentDetail,
			growth: "Insufficient",
			growthDetail: "Growth leg is DATA UNAVAILABLE. Recession risk is not estimated from the series that are missing.",
			fedPressure,
			fedPressureDetail,
			disclaimer: "Economic data is not a Fed decision. The reaction function here is an explicit model with published thresholds. Market-implied policy is a separate, currently empty, layer."
		},
		fed: {
			target: raw.effr ? `${raw.effr.targetLow.toFixed(2)}–${raw.effr.targetHigh.toFixed(2)}%` : GAP,
			effr: raw.effr ? `${raw.effr.rate.toFixed(2)}% · ${raw.effr.date}` : GAP,
			sofr: raw.sofr ? `${raw.sofr.rate.toFixed(2)}% · ${raw.sofr.date}` : GAP,
			probabilities: "Hold, cut, and hike probabilities: DATA UNAVAILABLE. CME FedWatch was not used. No probability was calculated from the 2Y.",
			path: [
				"Next meeting",
				"3 months",
				"6 months",
				"12 months"
			].map((horizon) => ({
				horizon,
				rate: GAP,
				change: GAP
			})),
			divergence: "Expectation divergence: INSUFFICIENT EVIDENCE. Economist consensus and market-implied pricing are different objects. Neither was retrieved, so they are not assumed to match and not assumed to differ.",
			notes: [
				raw.fomcHtmlConfirmed ? "The fetched Federal Reserve calendar HTML contains the September 15–16 and October 27–28, 2026 meetings." : "The Federal Reserve calendar page was fetched but the September and October 2026 date strings were not both found. Meeting dates in the watchlist still follow the published 2026 schedule and should be re-checked on federalreserve.gov.",
				"SOFR is an overnight secured rate, not a policy path.",
				failed.length ? `Retrieval notes: ${failed.join(" · ")}` : "No source errors on this retrieval."
			]
		},
		pricedLayers: [
			{
				layer: "A · Expectation",
				finding: "What economists forecast for the next print: DATA UNAVAILABLE. Not filled from headlines."
			},
			{
				layer: "B · Market pricing",
				finding: "What futures, OIS, and options already reflect: DATA UNAVAILABLE. Treasury yields are observed prices, but a yield level is not a full pricing of the next CPI or the next dot plot."
			},
			{
				layer: "C · Event and reaction",
				finding: "Where a past release date lines up with a daily bar, the close-to-close move is in the reaction table. Intraday T+5 / T+15 / T+1h / T+4h is DATA UNAVAILABLE. A daily move is not classified as repricing of policy."
			}
		],
		releaseReactions,
		reactionNote: "Close-to-close across the session that contains or follows the release date, using a bar within four days. This is not the first 15 minutes. A move can include other news the same day. No surprise label is attached.",
		matrix,
		matrixFooter: "Do not read one row as the conclusion. The state panel uses only the rows that cleared the evidence rule.",
		divergence: {
			classification: divClass,
			detail: divDetail,
			hypotheses
		},
		positioning: {
			reportDate: raw.cot?.date ?? GAP,
			source: raw.cot ? "CFTC disaggregated futures-only report, COMEX gold (contract 088691). https://www.cftc.gov/dea/newcot/f_disagg.txt. Managed money is not the same thing as the legacy noncommercial category. Producer/merchant is not the same thing as legacy commercials." : "CFTC file not available.",
			rows: cotRows,
			percentile: "Historical percentile: DATA UNAVAILABLE. ETF flows, options skew, and a multi-year COT distribution were not loaded. A single week cannot sit on a percentile.",
			reading: posReading
		},
		volatility: {
			rows: [
				{
					name: "Gold realized volatility",
					value: realized == null ? GAP : num(realized, 1, "%"),
					meaning: "20-session close-to-close, annualized. Model estimate from the gold proxy. Not implied volatility."
				},
				{
					name: "Gold ATR(14)",
					value: atr14 == null ? GAP : num(atr14, 2),
					meaning: "Average true range in price points. Model estimate. Says nothing about what options have priced."
				},
				{
					name: "Gold implied volatility",
					value: GAP,
					meaning: "Expected move priced by options. Not retrieved. Realized is not a substitute."
				},
				{
					name: "USD and Treasury implied volatility",
					value: GAP,
					meaning: "Not retrieved."
				},
				{
					name: "2Y realized daily volatility",
					value: stdev(y2Daily.slice(-21)) == null ? GAP : num(stdev(y2Daily.slice(-21)), 1, " bps"),
					meaning: "Standard deviation of daily 2Y changes over the last 21 Treasury sessions. Model estimate."
				},
				{
					name: "10Y realized daily volatility",
					value: stdev(y10Daily.slice(-21)) == null ? GAP : num(stdev(y10Daily.slice(-21)), 1, " bps"),
					meaning: "Same construction for the 10Y nominal yield."
				}
			],
			note: "Expected volatility versus actual volatility cannot be compared until an implied move is sourced. The terminal will not invent an expected move for CPI or FOMC."
		},
		liquidity: {
			rows: [
				{
					name: "Overnight reverse repo",
					value: raw.rrp ? `$${(raw.rrp.acceptedUsd / 1e9).toFixed(3)} billion accepted` : GAP,
					note: raw.rrp ? `NY Fed operation date ${raw.rrp.date}. Raw totalAmtAccepted ${ints(raw.rrp.acceptedUsd)} US dollars. One operation, not a liquidity index.` : "NY Fed reverse repo results were not retrieved."
				},
				{
					name: "Fed balance sheet",
					value: GAP,
					note: "H.4.1 / WALCL was not retrieved."
				},
				{
					name: "Treasury General Account",
					value: GAP,
					note: "TGA was not retrieved."
				},
				{
					name: "Financial conditions index",
					value: GAP,
					note: "Not retrieved."
				}
			],
			reading: "Liquidity does not confirm or contradict the macro thesis. One overnight reverse-repo print is not a regime. No correlation is being claimed."
		},
		risk: {
			regime: riskRegime,
			detail: riskDetail,
			goldNote: goldRiskNote,
			rows: [
				{
					name: "S&P 500",
					value: num(spx.last, 2),
					move: `~5s ${signed(spx.d5, 2, "%")} · ~21s ${signed(spx.d21, 2, "%")}`
				},
				{
					name: "Nasdaq",
					value: num(ndx.last, 2),
					move: `~5s ${signed(ndx.d5, 2, "%")} · ~21s ${signed(ndx.d21, 2, "%")}`
				},
				{
					name: "VIX",
					value: num(vixLast, 2),
					move: `~5s ${signed(vix.d5, 2, " pts")}`
				},
				{
					name: "HYG",
					value: num(hyg.last, 2),
					move: `~5s ${signed(hyg.d5, 2, "%")}`
				},
				{
					name: "WTI",
					value: num(oil.last, 2),
					move: `~5s ${signed(oil.d5, 2, "%")}`
				},
				{
					name: "Copper",
					value: num(copper.last, 2),
					move: `~5s ${signed(copper.d5, 2, "%")}`
				},
				{
					name: "DXY",
					value: num(dx.last, 3),
					move: `~5s ${signed(dx.d5, 2, "%")}`
				}
			]
		},
		scenarios: [
			{
				name: "Base case",
				summary: bias == null ? "There is no base-case direction. The observed regime is incomplete." : `The observed regime is ${bias.toLowerCase()} on the rules above. Continuation is a description of what is already in the tape, not a forecast.`,
				trigger: "None. This case is the current evidence, not a future event.",
				evidence: primary,
				confirmation: "The same links that set the bias keep their sign on the next 5 and 21 sessions, and the gold proxy does not diverge.",
				invalidation,
				watch: next ? `${next.name} on ${next.when}.` : "The next dated release on the calendar."
			},
			{
				name: "Bullish gold scenario",
				summary: "Conditions required, not a call: real yields lower, the dollar softer, and the 2Y lower, with the gold proxy confirming. If those are already true, this scenario is the base case, not an extra prediction.",
				trigger: "10Y real yield and US 2Y down more than 5 bps over the next 21 Treasury sessions, and DXY not up more than 0.6%.",
				evidence: "Only links that are already supportive count as evidence. Flat or restrictive links are not recruited.",
				confirmation: "Gold proxy higher while those conditions hold.",
				invalidation: "5-session reversal higher in real yield, 2Y, and DXY together.",
				watch: next ? next.name : "The next CPI, PCE, NFP, or FOMC event."
			},
			{
				name: "Bearish gold scenario",
				summary: "Conditions required, not a call: real yields higher, the dollar firmer, and the 2Y higher, with the gold proxy confirming.",
				trigger: "10Y real yield and US 2Y up more than 5 bps over the next 21 Treasury sessions, and DXY up more than 0.6%.",
				evidence: "Only links that are already restrictive count as evidence.",
				confirmation: "Gold proxy lower while those conditions hold.",
				invalidation: "5-session reversal lower in real yield, 2Y, and DXY together.",
				watch: next ? next.name : "The next CPI, PCE, NFP, or FOMC event."
			}
		],
		daily: [
			{
				heading: "What changed?",
				body: changed.join(" ")
			},
			{
				heading: "Why?",
				body: recentNews.length ? `Cause is not inferred from co-movement. Official Federal Reserve items dated inside the last five days exist and are not scored as the cause: ${recentNews.map((n) => n.title).join(" · ")}.` : "Cause is not inferred. No Federal Reserve monetary-policy item in the retrieved feed falls inside the last five days, and no other official release is being assigned as the reason for the latest session."
			},
			{
				heading: "What is priced?",
				body: "The terminal cannot say what is priced into the next event. What is observed is the current level of yields, the dollar, and the gold proxy. That is a price, not a statement that the next print is in the price."
			},
			{
				heading: "What is not priced?",
				body: next ? `${next.name} (${next.covers}, ${next.when}) is an open catalyst. It is not classified as unpriced or priced.` : "No open catalyst is classified as unpriced."
			},
			{
				heading: "What confirms the thesis?",
				body: bias == null ? "Nothing. There is no thesis to confirm." : `${confirmation}. ${confirmationDetail}`
			},
			{
				heading: "What invalidates it?",
				body: invalidation
			},
			{
				heading: "What to watch next?",
				body: next ? `${next.name} · ${next.when}. ${next.source}` : "The calendar in this build has no further date."
			}
		],
		event: {
			mode: liveEvent ? "Event analysis" : "Standard",
			title: liveEvent ? `${liveEvent.name} · ${eventPhase === "pre" ? "before publication" : "publication window open"} · ${liveEvent.when}` : "No event inside the live window",
			blocks: eventBlocks
		},
		news: raw.news.slice(0, 6).map((n) => ({
			title: n.title,
			date: n.pubDate,
			link: n.link,
			classification: "Official statement",
			note: "Federal Reserve press item. Not a market fact, not an analyst opinion, and not scored bullish or bearish."
		})),
		technical: {
			regime: techRegime,
			lines: [
				location,
				ma20 != null ? `20-session average ${num(ma20, 2)}.` : `20-session average ${GAP}.`,
				ma60 != null ? `60-session average ${num(ma60, 2)}.` : `60-session average ${GAP}.`,
				"Intraday structure, including any H4 level, is DATA UNAVAILABLE."
			],
			separation
		},
		coverage: [
			{
				domain: "Official macro",
				have: "CPI, core CPI, PPI, core PPI, average hourly earnings, payrolls, unemployment, JOLTS, ECI",
				missing: "PCE, core PCE, claims, ADP, GDP, ISM, retail sales, industrial production, durable goods, confidence"
			},
			{
				domain: "Policy pricing",
				have: "EFFR, target range, SOFR, Treasury par yields",
				missing: "Fed funds futures, SOFR futures, OIS, meeting probabilities, 3m/6m/12m path"
			},
			{
				domain: "Cross-asset",
				have: "Gold proxy, DXY, S&P 500, Nasdaq, VIX, WTI, copper, HYG price",
				missing: "Spot fix if futures are the proxy, credit OAS, mortgage rates, financial conditions index"
			},
			{
				domain: "Positioning and vol",
				have: "CFTC disaggregated futures, one week, plus realized vol and ATR",
				missing: "Historical COT percentile, ETF flows, options open interest, implied vol, skew, event implied move"
			}
		],
		rules: [
			"Bias uses only three 21-session links: 10Y real yield, US 2Y, and DXY. Flat band is 5 bps for yields and 0.6% for DXY. Bullish needs those links easier for gold and not opposed. Fewer than two usable links produces INSUFFICIENT EVIDENCE, which is not the same word as Neutral.",
			"Confidence is High only when all three links agree, yields are no older than five days, and the 5-session window does not contradict them. Otherwise Medium or Low. No numeric score.",
			"A 5-session reversal in a link that supports the thesis raises the alert that the thesis is losing confirmation. It does not flip the 21-session bias by itself.",
			"Economic surprise is never filled without a sourced consensus. Fed pressure thresholds are model estimates and are printed next to the result. They are not mapped to a probability.",
			"Priced-in is Insufficient Evidence until a pre-event market price and a post-event change in that price both exist. Headlines do not qualify.",
			"Risk-off is not gold-bullish. Positioning without a percentile is not a crowded-trade call. Technicals do not enter the macro bias.",
			"No generative model writes these sentences. They are templates filled only when a retrieved number exists.",
			raw.fomcHtmlConfirmed ? "FOMC date strings for September and October 2026 were present on the fetched Fed calendar page." : "FOMC HTML confirmation did not match both date strings on this run."
		]
	};
}
var UA = "Mozilla/5.0 (compatible; AurumMacroTerminal/1.0; research)";
var box = globalThis;
function monthList() {
	return [
		"202605",
		"202606",
		"202607",
		"202608",
		"202609",
		"202610"
	];
}
async function getText(url, ms = 12e3) {
	const res = await fetch(url, {
		signal: AbortSignal.timeout(ms),
		headers: {
			"User-Agent": UA,
			Accept: "*/*"
		}
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.text();
}
function parseCsv(text) {
	return text.trim().split(/\r?\n/).filter(Boolean).map(splitCsvLine);
}
function splitCsvLine(line) {
	const out = [];
	let cur = "";
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (quoted) {
			if (c === "\"") {
				if (line[i + 1] === "\"") {
					cur += "\"";
					i += 1;
				} else quoted = false;
			} else cur += c;
		} else if (c === "\"") quoted = true;
		else if (c === ",") {
			out.push(cur.trim());
			cur = "";
		} else cur += c;
	}
	out.push(cur.trim());
	return out;
}
function toIsoDate(mdy) {
	const m = mdy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (!m) return null;
	return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}
function column(header, names) {
	const norm = header.map((h) => h.toLowerCase().replace(/\s+/g, ""));
	for (const name of names) {
		const i = norm.indexOf(name.toLowerCase().replace(/\s+/g, ""));
		if (i >= 0) return i;
	}
	return -1;
}
async function loadCurve(type, fields) {
	const buckets = {};
	for (const f of fields) buckets[f.key] = [];
	const chunks = await Promise.all(monthList().map(async (yyyymm) => {
		const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/all/${yyyymm}?field_tdr_date_value_month=${yyyymm}&type=${type}&page&_format=csv`;
		try {
			return await getText(url, 12e3);
		} catch {
			return "";
		}
	}));
	for (const text of chunks) {
		const rows = parseCsv(text);
		if (rows.length < 2) continue;
		const header = rows[0];
		const dateIdx = column(header, ["Date"]);
		const idxs = fields.map((f) => ({
			key: f.key,
			idx: column(header, f.names)
		}));
		for (const row of rows.slice(1)) {
			const date = dateIdx >= 0 ? toIsoDate(row[dateIdx] ?? "") : null;
			if (!date) continue;
			for (const { key, idx } of idxs) {
				if (idx < 0) continue;
				const value = Number(row[idx]);
				if (!Number.isFinite(value)) continue;
				buckets[key].push({
					date,
					value
				});
			}
		}
	}
	for (const key of Object.keys(buckets)) {
		const map = /* @__PURE__ */ new Map();
		for (const p of buckets[key]) map.set(p.date, p.value);
		buckets[key] = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, value]) => ({
			date,
			value
		}));
	}
	if (Object.values(buckets).every((rows) => rows.length === 0)) throw new Error("yield curve returned no rows");
	return buckets;
}
function exchangeDate(ts, offsetSec) {
	return (/* @__PURE__ */ new Date((ts + offsetSec) * 1e3)).toISOString().slice(0, 10);
}
async function loadYahoo(symbol) {
	const text = await getText(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=6mo`, 12e3);
	const result = JSON.parse(text).chart?.result?.[0];
	if (!result?.meta || !result.timestamp) return null;
	const quote = result.indicators?.quote?.[0] ?? {};
	const offset = result.meta.gmtoffset ?? 0;
	const bars = result.timestamp.map((ts, i) => ({
		date: exchangeDate(ts, offset),
		high: quote.high?.[i] ?? null,
		low: quote.low?.[i] ?? null,
		close: quote.close?.[i] ?? null,
		volume: quote.volume?.[i] ?? null
	}));
	const price = result.meta.regularMarketPrice ?? null;
	if (price != null && bars.length) bars[bars.length - 1] = {
		...bars[bars.length - 1],
		close: price
	};
	const marketTime = result.meta.regularMarketTime != null ? (/* @__PURE__ */ new Date(result.meta.regularMarketTime * 1e3)).toISOString() : null;
	return {
		symbol: result.meta.symbol ?? symbol,
		shortName: result.meta.shortName ?? null,
		exchange: result.meta.exchangeName ?? null,
		currency: result.meta.currency ?? null,
		price,
		marketTime,
		volume: result.meta.regularMarketVolume ?? null,
		bars
	};
}
var MONTHS = [
	"",
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
function blsPoint(year, period, value, footnotes) {
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
			preliminary
		};
	}
	if (period.startsWith("Q")) {
		const q = Number(period.slice(1));
		const month = q * 3;
		return {
			date: `${year}-${String(month).padStart(2, "0")}-01`,
			label: `Q${q} ${year}`,
			value: n,
			preliminary
		};
	}
	return null;
}
async function loadBls() {
	const res = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
		method: "POST",
		signal: AbortSignal.timeout(15e3),
		headers: {
			"Content-Type": "application/json",
			"User-Agent": UA
		},
		body: JSON.stringify({
			seriesid: [
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
				"CIU1010000000000A"
			],
			startyear: "2025",
			endyear: "2026"
		})
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const json = await res.json();
	if (json.status !== "REQUEST_SUCCEEDED") throw new Error(json.status ?? "BLS rejected the request");
	const out = {};
	for (const series of json.Results?.series ?? []) {
		const points = (series.data ?? []).map((row) => blsPoint(row.year, row.period, row.value, row.footnotes)).filter((p) => Boolean(p)).sort((a, b) => a.date.localeCompare(b.date));
		out[series.seriesID] = points;
	}
	return out;
}
function numAt(cols, i) {
	const n = Number((cols[i] ?? "").replace(/,/g, ""));
	return Number.isFinite(n) ? n : null;
}
function side(cols, all, chg, spread) {
	return {
		long: numAt(cols, all) ?? 0,
		short: numAt(cols, all + 1) ?? 0,
		spread: spread ? numAt(cols, all + 2) : null,
		longChg: numAt(cols, chg) ?? 0,
		shortChg: numAt(cols, chg + 1) ?? 0,
		spreadChg: spread ? numAt(cols, chg + 2) : null
	};
}
async function loadCot() {
	const line = (await getText("https://www.cftc.gov/dea/newcot/f_disagg.txt", 2e4)).split(/\r?\n/).find((ln) => ln.includes("GOLD - COMMODITY EXCHANGE INC."));
	if (!line) throw new Error("COMEX gold row missing");
	const cols = splitCsvLine(line);
	const all = 7;
	const chg = 55;
	const oi = numAt(cols, all);
	const totLong = numAt(cols, 19);
	const producer = side(cols, 8, 56, false);
	const swap = side(cols, 10, 58, true);
	const managed = side(cols, 13, 61, true);
	const other = side(cols, 16, 64, true);
	if (oi == null || totLong == null) throw new Error("COT columns did not parse");
	const reconstructed = producer.long + swap.long + managed.long + other.long + (swap.spread ?? 0) + (managed.spread ?? 0) + (other.spread ?? 0);
	if (Math.abs(reconstructed - totLong) > 1) throw new Error("COT column check failed");
	return {
		date: cols[2] ?? "",
		oi,
		oiChg: numAt(cols, chg) ?? 0,
		producer,
		swap,
		managed,
		other
	};
}
function decode(value) {
	return value.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/&#39;|'/g, "'").replace(/"/g, "\"").trim();
}
async function loadNews() {
	return [...(await getText("https://www.federalreserve.gov/feeds/press_monetary.xml", 12e3)).matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 6).map((match) => {
		const block = match[1];
		return {
			title: decode(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ""),
			link: decode(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? ""),
			pubDate: decode(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "")
		};
	}).filter((item) => item.title);
}
async function loadEffr() {
	const row = JSON.parse(await getText("https://markets.newyorkfed.org/api/rates/unsecured/effr/last/1.json")).refRates?.[0];
	if (!row?.effectiveDate || row.percentRate == null || row.targetRateFrom == null || row.targetRateTo == null) throw new Error("EFFR payload incomplete");
	return {
		date: row.effectiveDate,
		rate: row.percentRate,
		targetLow: row.targetRateFrom,
		targetHigh: row.targetRateTo
	};
}
async function loadSofr() {
	const row = JSON.parse(await getText("https://markets.newyorkfed.org/api/rates/secured/sofr/last/1.json")).refRates?.[0];
	if (!row?.effectiveDate || row.percentRate == null) throw new Error("SOFR payload incomplete");
	return {
		date: row.effectiveDate,
		rate: row.percentRate
	};
}
async function loadRrp() {
	const row = JSON.parse(await getText("https://markets.newyorkfed.org/api/rp/reverserepo/all/results/last/1.json")).repo?.operations?.[0];
	if (!row?.operationDate || row.totalAmtAccepted == null) throw new Error("RRP payload incomplete");
	return {
		date: row.operationDate,
		acceptedUsd: row.totalAmtAccepted
	};
}
async function loadFomcFlag() {
	const text = (await getText("https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm", 15e3)).replace(/<[^>]+>/g, " ").replace(/&ndash;|&#8211;/g, "–");
	const sep = /September\s+15\s*[–-]\s*16/.test(text);
	const oct = /October\s+27\s*[–-]\s*28/.test(text);
	return sep && oct;
}
async function settled(source, errors, task) {
	try {
		return await task;
	} catch (error) {
		const message = error instanceof Error ? error.message.slice(0, 160) : "request failed";
		errors.push({
			source,
			message
		});
		return null;
	}
}
async function loadTerminal(refresh) {
	const hit = box.__aurumCache;
	if (!refresh && hit && Date.now() - hit.at < 18e4) return hit.snap;
	const errors = [];
	const yahooSymbols = [
		"XAUUSD=X",
		"GC=F",
		"DX-Y.NYB",
		"^VIX",
		"^GSPC",
		"^IXIC",
		"CL=F",
		"HG=F",
		"HYG",
		"^TNX"
	];
	const [nominal, real, bls, cot, news, effr, sofr, rrp, fomcHtmlConfirmed, yahooList] = await Promise.all([
		settled("Treasury nominal", errors, loadCurve("daily_treasury_yield_curve", [
			{
				key: "y2",
				names: ["2 Yr", "2Yr"]
			},
			{
				key: "y5",
				names: ["5 Yr", "5Yr"]
			},
			{
				key: "y10",
				names: ["10 Yr", "10Yr"]
			},
			{
				key: "y30",
				names: ["30 Yr", "30Yr"]
			}
		])),
		settled("Treasury real", errors, loadCurve("daily_treasury_real_yield_curve", [
			{
				key: "real5",
				names: ["5 YR", "5 Yr"]
			},
			{
				key: "real10",
				names: ["10 YR", "10 Yr"]
			},
			{
				key: "real30",
				names: ["30 YR", "30 Yr"]
			}
		])),
		settled("BLS", errors, loadBls()),
		settled("CFTC", errors, loadCot()),
		settled("Fed RSS", errors, loadNews()),
		settled("NY Fed EFFR", errors, loadEffr()),
		settled("NY Fed SOFR", errors, loadSofr()),
		settled("NY Fed RRP", errors, loadRrp()),
		settled("Fed calendar", errors, loadFomcFlag()),
		Promise.all(yahooSymbols.map(async (symbol) => settled(`Yahoo ${symbol}`, errors, loadYahoo(symbol))))
	]);
	const yahoo = {};
	yahooSymbols.forEach((symbol, i) => {
		yahoo[symbol] = yahooList[i];
	});
	const empty = [];
	const bundle = {
		retrievedAt: (/* @__PURE__ */ new Date()).toISOString(),
		errors,
		nominal: {
			y2: nominal?.y2 ?? empty,
			y5: nominal?.y5 ?? empty,
			y10: nominal?.y10 ?? empty,
			y30: nominal?.y30 ?? empty
		},
		real: {
			real5: real?.real5 ?? empty,
			real10: real?.real10 ?? empty,
			real30: real?.real30 ?? empty
		},
		yahoo,
		bls: bls ?? {},
		effr,
		sofr,
		rrp,
		cot,
		news: news ?? [],
		fomcHtmlConfirmed: Boolean(fomcHtmlConfirmed),
		tnx: yahoo["^TNX"]?.price ?? null
	};
	const snap = buildTerminal(bundle);
	if (bundle.nominal.y10.length > 0 || (yahoo["GC=F"]?.price ?? yahoo["XAUUSD=X"]?.price) != null) box.__aurumCache = {
		at: Date.now(),
		snap
	};
	return snap;
}
var getMacroTerminal_createServerFn_handler = createServerRpc({
	id: "b200facc167b79a6eba55eacc0d761c87a3be0a7007698494752b9015e0d09a5",
	name: "getMacroTerminal",
	filename: "src/lib/macro/api.ts"
}, (opts) => getMacroTerminal.__executeServer(opts));
var getMacroTerminal = createServerFn({ method: "GET" }).validator((input) => {
	return { refresh: typeof input === "object" && input !== null && "refresh" in input && input.refresh === true };
}).handler(getMacroTerminal_createServerFn_handler, async ({ data }) => loadTerminal(data.refresh));
//#endregion
export { getMacroTerminal_createServerFn_handler };
