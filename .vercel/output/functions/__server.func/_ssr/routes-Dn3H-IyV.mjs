import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route, r as getMacroTerminal } from "./router-AKGBdHBi.mjs";
import { a as ResponsiveContainer, i as Line, n as YAxis, o as Tooltip, r as XAxis, t as LineChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dn3H-IyV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SECTIONS = [
	["chain", "Chain"],
	["yields", "Yields"],
	["gold", "Gold & USD"],
	["macro", "Macro"],
	["fed", "Fed path"],
	["matrix", "Matrix"],
	["position", "Positioning"],
	["risk", "Risk & liquidity"],
	["scenarios", "Scenarios"],
	["daily", "Daily"],
	["event", "Event"],
	["method", "Method"]
];
function Dashboard({ initial }) {
	const [snap, setSnap] = (0, import_react.useState)(initial);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function refresh() {
		setPending(true);
		setError(null);
		try {
			const next = await getMacroTerminal({ data: { refresh: true } });
			setSnap(next);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Refresh failed");
		} finally {
			setPending(false);
		}
	}
	const s = snap.state;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen overflow-x-hidden bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-[0.18em] text-gold",
						children: "AURUM"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm text-muted",
						children: "XAUUSD macro terminal"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: refresh,
					disabled: pending,
					className: "h-11 shrink-0 rounded-lg border border-line bg-surface px-4 text-sm text-fg disabled:opacity-60",
					children: pending ? "Retrieving" : "Refresh"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "scroll-chips mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3",
				"aria-label": "Sections",
				children: SECTIONS.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-11 shrink-0 rounded-lg border border-line bg-surface px-3 text-sm text-muted",
					onClick: () => {
						const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
						document.getElementById(id)?.scrollIntoView({
							behavior: reduced ? "auto" : "smooth",
							block: "start"
						});
					},
					children: label
				}, id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "border border-line bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-pretty text-muted",
							children: "Expectation, pricing, repricing, confirmation, divergence. Bukan mesin prediksi."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-xs text-pretty text-faint",
							children: snap.clockNote
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: snap.sources.map((src) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "border border-line px-2 py-1 font-mono text-xs text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: src.ok ? "text-up" : "text-down",
										children: src.ok ? "Live" : "Gap"
									}),
									" ",
									src.name
								]
							}, src.name))
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-down",
							children: error
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "border border-gold/40 bg-surface p-4",
					"aria-label": "Macro state",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-faint",
							children: "XAUUSD MACRO STATE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Macro bias"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `mt-1 inline-block px-2 py-1 text-2xl font-medium ${tone(s.biasTone)}`,
								children: s.biasLabel
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Confidence"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono text-xl text-fg",
									children: s.confidenceLabel
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-pretty text-fg",
							children: s.thesis
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-pretty text-muted",
							children: s.primaryDriver
						}),
						s.secondary.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 flex flex-col gap-1 text-sm text-muted",
							children: s.secondary.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
						}) : null,
						s.invalidationAlert ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 border border-down/50 bg-down-dim px-3 py-3 text-sm text-pretty text-down",
							children: s.invalidationAlert
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-4 grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									term: "Market confirmation",
									value: s.confirmation,
									detail: s.confirmationDetail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									term: "Priced-in status",
									value: s.pricedIn,
									detail: s.pricedInDetail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									term: "Positioning risk",
									value: s.positioningRisk,
									detail: s.positioningDetail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
									term: "Next catalyst",
									value: s.nextCatalyst,
									detail: s.nextCatalystWhen
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-pretty text-muted",
							children: s.invalidation
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "chain",
					kicker: "01",
					title: "Transmission chain",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-pretty text-muted",
							children: "Economic data is not a Fed decision, and a Fed story is not market pricing. A blocked link is left blocked."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-4 flex flex-col",
							children: snap.chain.map((node, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "grid grid-cols-[2.5rem_1fr] gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `mt-1 size-2.5 rounded-full ${dot(node.status)}` }), i < snap.chain.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-px flex-1 bg-line" }) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pb-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-baseline justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-base font-medium",
											children: node.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Status, { status: node.status })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-pretty text-muted",
										children: node.reading
									})]
								})]
							}, node.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: snap.crossChecks.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "border border-line p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium",
										children: row.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Status, { status: row.status })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-pretty text-muted",
									children: row.reading
								})]
							}, row.label))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "yields",
					kicker: "02",
					title: "Treasury yields",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-pretty text-muted",
							children: snap.yieldNote
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[36rem] text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "font-mono text-xs text-faint",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "Tenor"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "Current"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "1 session"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "~5 sessions"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "~21 sessions"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-normal",
											children: "Trend"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "font-mono tabular-nums",
									children: snap.yields.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-line",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 pr-3 font-sans text-fg",
												children: row.tenor
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 pr-3",
												children: row.current
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: `py-2 pr-3 ${ink(row.daily)}`,
												children: row.daily
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: `py-2 pr-3 ${ink(row.weekly)}`,
												children: row.weekly
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: `py-2 pr-3 ${ink(row.monthly)}`,
												children: row.monthly
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 text-muted",
												children: row.trend
											})
										]
									}, row.tenor))
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-pretty text-muted",
							children: snap.yieldRead
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
								title: "US 2Y",
								data: snap.charts.y2,
								color: "var(--color-gold)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
								title: "US 10Y real",
								data: snap.charts.real10,
								color: "var(--color-up)"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "gold",
					kicker: "03",
					title: "Real yield, dollar, gold",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "border border-line p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium",
									children: "US 10Y real yield"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-mono text-2xl tabular-nums",
									children: snap.realYield.current
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-xs text-faint",
									children: ["As of ", snap.realYield.asOf]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-3 grid grid-cols-3 gap-2 font-mono text-sm tabular-nums",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
											k: "1s",
											v: snap.realYield.daily
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
											k: "~5s",
											v: snap.realYield.weekly
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
											k: "~21s",
											v: snap.realYield.monthly
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-pretty text-muted",
									children: snap.realYield.interpretation
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 flex flex-col gap-2 text-sm text-pretty text-muted",
									children: snap.realYield.caveats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: c }, c))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "border border-line p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium",
										children: "Dollar index"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-mono text-2xl tabular-nums",
										children: snap.usd.current
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "mt-3 grid grid-cols-3 gap-2 font-mono text-sm tabular-nums",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
												k: "1s",
												v: snap.usd.daily
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
												k: "~5s",
												v: snap.usd.weekly
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
												k: "~21s",
												v: snap.usd.monthly
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-sm text-muted",
										children: ["Trend ", snap.usd.trend]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-pretty text-muted",
										children: snap.usd.relation
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-mono text-xs text-pretty text-faint",
										children: snap.usd.source
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "border border-line p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium",
										children: snap.gold.instrument
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-mono text-2xl tabular-nums",
										children: snap.gold.price
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-mono text-xs text-faint",
										children: snap.gold.asOf
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "mt-3 grid grid-cols-3 gap-2 font-mono text-sm tabular-nums",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
												k: "1s",
												v: snap.gold.daily
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
												k: "~5s",
												v: snap.gold.weekly
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
												k: "~21s",
												v: snap.gold.monthly
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-pretty text-muted",
										children: snap.gold.disclaimer
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted",
										children: snap.gold.realizedVol
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: snap.gold.atr
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: snap.gold.volume
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-pretty text-muted",
										children: snap.gold.openInterest
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-mono text-xs text-pretty text-faint",
										children: snap.gold.source
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
								title: "Gold proxy",
								data: snap.charts.gold,
								color: "var(--color-gold)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
								title: "DXY",
								data: snap.charts.dxy,
								color: "var(--color-muted)"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "macro",
					kicker: "04",
					title: "Macro prints",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-pretty text-muted",
							children: snap.surpriseSummary
						}),
						snap.prints.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-medium text-gold",
								children: group.group
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-col gap-2",
								children: group.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "border border-line p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-baseline justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "text-sm font-medium",
												children: row.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-xs text-faint",
												children: row.period
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 font-mono text-sm tabular-nums text-fg",
											children: ["Actual ", row.actual]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 font-mono text-xs text-muted",
											children: [
												"Previous ",
												row.previous,
												" · Forecast ",
												row.forecast
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm text-pretty text-muted",
											children: row.observedChange
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-pretty text-faint",
											children: row.surprise
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 font-mono text-xs text-pretty text-faint",
											children: [
												row.freshness,
												" · ",
												row.unit,
												" · ",
												row.frequency
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 font-mono text-xs text-pretty text-faint",
											children: row.revisedNote
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 font-mono text-xs text-pretty text-faint",
											children: row.source
										})
									]
								}, row.name))
							})]
						}, group.group)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leg, {
									title: "Inflation",
									value: snap.reaction.inflation,
									detail: snap.reaction.inflationDetail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leg, {
									title: "Employment",
									value: snap.reaction.employment,
									detail: snap.reaction.employmentDetail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leg, {
									title: "Growth",
									value: snap.reaction.growth,
									detail: snap.reaction.growthDetail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leg, {
									title: "Fed pressure (model)",
									value: snap.reaction.fedPressure,
									detail: snap.reaction.fedPressureDetail
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-pretty text-muted",
							children: snap.reaction.disclaimer
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "fed",
					kicker: "05",
					title: "Market-implied policy",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									k: "Target range",
									v: snap.fed.target,
									note: "NY Fed EFFR release. Observed current setting."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									k: "EFFR",
									v: snap.fed.effr,
									note: "Effective federal funds rate."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									k: "SOFR",
									v: snap.fed.sofr,
									note: "Overnight secured rate. Not a path."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-pretty text-muted",
							children: snap.fed.probabilities
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[28rem] text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "font-mono text-xs text-faint",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "Horizon"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "Implied policy rate"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-normal",
											children: "Change vs prior pricing"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "font-mono",
									children: snap.fed.path.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-line",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 pr-3 font-sans",
												children: row.horizon
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 pr-3 text-faint",
												children: row.rate
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 text-faint",
												children: row.change
											})
										]
									}, row.horizon))
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-pretty text-muted",
							children: snap.fed.divergence
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 flex flex-col gap-2 text-sm text-pretty text-muted",
							children: snap.fed.notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: n }, n))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-5 text-sm font-medium",
							children: "Priced-in / repricing"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-col gap-2",
							children: snap.pricedLayers.map((layer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "border border-line p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-mono text-xs text-gold",
									children: layer.layer
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-pretty text-muted",
									children: layer.finding
								})]
							}, layer.layer))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-5 text-sm font-medium",
							children: "Release-day close-to-close"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-pretty text-muted",
							children: snap.reactionNote
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[40rem] text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "font-mono text-xs text-faint",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "Event"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "Gold proxy"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "2Y"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "10Y real"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-normal",
											children: "DXY"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: snap.releaseReactions.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-line align-top",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-2 pr-3",
											children: [row.event, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 block font-mono text-xs text-faint",
												children: row.date
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3 font-mono text-xs",
											children: row.gold
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3 font-mono text-xs",
											children: row.y2
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3 font-mono text-xs",
											children: row.real
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 font-mono text-xs",
											children: row.dxy
										})
									]
								}, row.event)) })]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "matrix",
					kicker: "06",
					title: "Cross-asset matrix",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[36rem] text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "font-mono text-xs text-faint",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "Variable"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "Current move"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-normal",
											children: "Gold interpretation"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: snap.matrix.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-line align-top",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 pr-3 font-medium",
											children: row.variable
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 pr-3 font-mono text-xs text-muted",
											children: row.move
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 text-sm text-pretty text-muted",
											children: row.interpretation
										})
									]
								}, row.variable)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-pretty text-muted",
							children: snap.matrixFooter
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "mt-3 border border-line p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium",
									children: snap.divergence.classification
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-pretty text-muted",
									children: snap.divergence.detail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 flex flex-col gap-2 text-sm text-pretty text-muted",
									children: snap.divergence.hypotheses.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: h }, h))
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "position",
					kicker: "07",
					title: "Positioning and volatility",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs text-faint",
							children: ["Report date ", snap.positioning.reportDate]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-pretty text-muted",
							children: snap.positioning.source
						}),
						snap.positioning.rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[40rem] text-left font-mono text-xs tabular-nums",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "text-faint",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
										"Book",
										"Long",
										"Short",
										"Spread",
										"Net",
										"Weekly net",
										"Net / OI"
									].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-normal",
										children: h
									}, h)) })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: snap.positioning.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-line",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3 font-sans text-sm",
											children: row.book
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: row.long
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: row.short
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: row.spread
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: row.net
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: row.weekly
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2",
											children: row.pctOi
										})
									]
								}, row.book)) })]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-faint",
							children: "DATA UNAVAILABLE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-pretty text-muted",
							children: snap.positioning.reading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-pretty text-faint",
							children: snap.positioning.percentile
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-col gap-2",
							children: snap.volatility.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "border border-line p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-baseline justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium",
										children: row.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-sm tabular-nums",
										children: row.value
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-pretty text-muted",
									children: row.meaning
								})]
							}, row.name))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-pretty text-muted",
							children: snap.volatility.note
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "risk",
					kicker: "08",
					title: "Liquidity and risk sentiment",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-pretty text-muted",
							children: snap.liquidity.reading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-col gap-2",
							children: snap.liquidity.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "border border-line p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium",
										children: row.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-mono text-sm",
										children: row.value
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-pretty text-muted",
										children: row.note
									})
								]
							}, row.name))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "mt-4 border border-line p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs text-faint",
									children: "RISK SENTIMENT · MODEL"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-2 text-xl font-medium",
									children: snap.risk.regime
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-pretty text-muted",
									children: snap.risk.detail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-pretty text-fg",
									children: snap.risk.goldNote
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[28rem] text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "font-mono text-xs text-faint",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "Market"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 font-normal",
											children: "Last"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-normal",
											children: "Change"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "font-mono tabular-nums",
									children: snap.risk.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-line",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 pr-3 font-sans",
												children: row.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 pr-3",
												children: row.value
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 text-xs text-muted",
												children: row.move
											})
										]
									}, row.name))
								})]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "scenarios",
					kicker: "09",
					title: "Scenarios and invalidation",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-3",
						children: snap.scenarios.map((sc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "border border-line p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-base font-medium",
									children: sc.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-pretty text-fg",
									children: sc.summary
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-3 flex flex-col gap-2 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioRow, {
											k: "Trigger",
											v: sc.trigger
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioRow, {
											k: "Supporting evidence",
											v: sc.evidence
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioRow, {
											k: "Confirmation",
											v: sc.confirmation
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioRow, {
											k: "Invalidation",
											v: sc.invalidation
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioRow, {
											k: "Watch",
											v: sc.watch
										})
									]
								})
							]
						}, sc.name))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "mt-3 border border-line p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-medium",
								children: "Technical layer, kept separate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-pretty text-fg",
								children: snap.technical.separation
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-pretty text-muted",
								children: snap.technical.regime
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 flex flex-col gap-1 text-sm text-muted",
								children: snap.technical.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					id: "daily",
					kicker: "10",
					title: "Daily report",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-3",
						children: snap.daily.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "border-t border-line pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-medium",
								children: block.heading
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-pretty text-muted",
								children: block.body
							})]
						}, block.heading))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "event",
					kicker: "11",
					title: snap.event.mode,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-medium text-pretty",
							children: snap.event.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-col gap-3",
							children: snap.event.blocks.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "border border-line p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-mono text-xs tracking-wide text-gold",
									children: block.heading
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-pretty text-muted",
									children: block.body
								})]
							}, block.heading))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-5 text-sm font-medium",
							children: "Official items only"
						}),
						snap.news.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 flex flex-col gap-3",
							children: snap.news.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border-t border-line pt-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: item.link,
										className: "text-sm text-fg underline decoration-line underline-offset-4",
										children: item.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 font-mono text-xs text-faint",
										children: [
											item.date,
											" · ",
											item.classification
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: item.note
									})
								]
							}, item.link || item.title))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-faint",
							children: "DATA UNAVAILABLE"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					id: "method",
					kicker: "12",
					title: "Coverage and rules",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-3",
							children: snap.coverage.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "border border-line p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium",
										children: row.domain
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-sm text-pretty text-muted",
										children: ["In hand: ", row.have]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-pretty text-faint",
										children: ["Not retrieved: ", row.missing]
									})
								]
							}, row.domain))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-4 flex list-decimal flex-col gap-3 pl-4 text-sm text-pretty text-muted",
							children: snap.rules.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: rule }, rule))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 text-sm text-pretty text-faint",
							children: "Classes used: observed official, observed vendor quote, model estimate. Market-implied estimates and AI interpretation are not produced. A gap stays labeled DATA UNAVAILABLE."
						})
					]
				})
			]
		})]
	});
}
function Section({ id, kicker, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id,
		className: "scroll-mt-28 border border-line bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs text-faint",
				children: kicker
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 text-lg font-medium text-balance",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children
			})
		]
	});
}
function Fact({ term, value, detail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-line pt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-xs text-faint",
				children: term
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-1 text-sm font-medium text-fg",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-1 text-sm text-pretty text-muted",
				children: detail
			})
		]
	});
}
function Status({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-mono text-xs text-faint",
		children: status === "open" ? "Observed" : status === "partial" ? "Partial" : status === "model" ? "Model" : "Blocked"
	});
}
function dot(status) {
	if (status === "open") return "bg-up";
	if (status === "blocked") return "bg-line";
	return "bg-gold";
}
function tone(kind) {
	if (kind === "bull") return "bg-gold-dim text-gold";
	if (kind === "bear") return "bg-down-dim text-down";
	if (kind === "neutral") return "bg-surface-2 text-muted";
	return "border border-line text-faint";
}
function ink(value) {
	if (value.startsWith("+")) return "text-up";
	if (value.startsWith("-") || value.startsWith("−")) return "text-down";
	return "text-muted";
}
function Mini({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-faint",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: ink(v),
		children: v
	})] });
}
function ChartCard({ title, data, color }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "border border-line p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-sm font-medium",
			children: title
		}), data.length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-faint",
			children: "DATA UNAVAILABLE"
		}) : ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 h-40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
					data,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "date",
							hide: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							hide: true,
							domain: ["auto", "auto"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							contentStyle: {
								background: "var(--color-surface)",
								border: "1px solid var(--color-line)",
								borderRadius: 0,
								fontSize: 12
							},
							labelStyle: { color: "var(--color-faint)" },
							itemStyle: { color: "var(--color-fg)" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							type: "monotone",
							dataKey: "value",
							name: title,
							stroke: color,
							dot: false,
							strokeWidth: 1.6
						})
					]
				})
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-2 h-40 bg-surface-2" })]
	});
}
function Leg({ title, value, detail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "border border-line p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm text-muted",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-lg font-medium",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-pretty text-muted",
				children: detail
			})
		]
	});
}
function Stat({ k, v, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "border border-line p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xs text-faint",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-sm text-pretty",
				children: v
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-pretty text-muted",
				children: note
			})
		]
	});
}
function ScenarioRow({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-faint",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "text-pretty text-muted",
		children: v
	})] });
}
function Home() {
	const initial = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, { initial });
}
//#endregion
export { Home as component };
