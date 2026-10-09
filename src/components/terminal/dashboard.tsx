import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { getMacroTerminal } from "@/lib/macro/api";
import type { CandlePoint, PriceZone, TerminalSnapshot } from "@/lib/macro/types";
import { Activity, Gem, Radio, Shield } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const PAGES = [
  ["overview", "Ringkasan"],
  ["regime", "Rezim"],
  ["fed", "Fed"],
  ["treasury", "Treasury"],
  ["usd", "Dolar"],
  ["position", "Posisi"],
  ["risk", "Risiko"],
  ["goldbias", "Emas"],
  ["confluence", "Konfluensi"],
  ["divergence", "Divergensi"],
  ["priced", "Priced-in"],
  ["h4", "Teknikal"],
  ["scenarios", "Skenario"],
  ["watch", "Pantauan"],
  ["method", "Aturan"],
] as const;

export function Dashboard({ initial }: { initial: TerminalSnapshot }) {
  const [snap, setSnap] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setPending(true);
    setError(null);
    try {
      const next = await getMacroTerminal({ data: { refresh: true } });
      setSnap(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pemuatan ulang gagal");
    } finally {
      setPending(false);
    }
  }

  const [page, setPage] = useState<string>("overview");
  const pageLabel = PAGES.find(([id]) => id === page)?.[1] ?? "Ringkasan";

  useEffect(() => {
    const pull = () => {
      if (document.visibilityState === "hidden") return;
      getMacroTerminal({ data: { refresh: false } })
        .then((next) => setSnap(next))
        .catch(() => {});
    };
    const id = window.setInterval(pull, 60_000);
    document.addEventListener("visibilitychange", pull);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", pull);
    };
  }, []);

  const s = snap.state;

  return (
    <main className="min-h-screen overflow-x-hidden bg-bg text-fg md:grid md:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface px-3 py-4 md:flex">
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-xl bg-gold text-gold-ink">
            <Gem className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold">Aurum</p>
            <p className="text-xs text-faint">Terminal makro</p>
          </div>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Sections">
          {PAGES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPage(id)}
              className={`h-11 rounded-xl px-3 text-left text-sm ${page === id ? "bg-gold text-gold-ink" : "text-muted hover:bg-surface-2"}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold md:hidden">Aurum</p>
            <p className="truncate text-sm text-muted">{pageLabel}</p>
            <p className="truncate text-xs text-faint">Diperbarui sendiri tiap 3 menit</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={pending}
            className="h-11 shrink-0 rounded-xl bg-gold px-4 text-sm font-medium text-gold-ink disabled:opacity-60"
          >
            {pending ? "Mengambil" : "Muat ulang"}
          </button>
        </div>
        <nav className="scroll-chips mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 md:hidden" aria-label="Sections">
          {PAGES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`h-11 shrink-0 rounded-xl px-3 text-sm ${page === id ? "bg-gold text-gold-ink" : "tile text-muted"}`}
              onClick={() => setPage(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
        {error ? <p className="text-sm text-down">{error}</p> : null}
        {page === "overview" ? (
        <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi icon={<Gem className="size-4" aria-hidden />} label="Emas" value={snap.gold.price} delta={snap.gold.daily} data={snap.charts.gold} />
          <Kpi icon={<Activity className="size-4" aria-hidden />} label="DXY" value={snap.usd.current} delta={snap.usd.daily} data={snap.charts.dxy} />
          <Kpi icon={<Radio className="size-4" aria-hidden />} label="Real yield 10Y" value={snap.realYield.current} delta={snap.realYield.daily} data={snap.charts.real10} />
          <Kpi icon={<Shield className="size-4" aria-hidden />} label="Bias" value={s.biasLabel} delta={s.confidenceLabel} data={snap.charts.y2} />
        </div>
        <section className="panel p-4">
          <p className="text-sm text-pretty text-muted">
            Expectation, pricing, repricing, confirmation, divergence. Bukan mesin prediksi.
          </p>
          <p className="mt-2 font-mono text-xs text-pretty text-faint">{snap.clockNote}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {snap.sources.map((src) => (
              <span key={src.name} className="border border-line px-2 py-1 font-mono text-xs text-muted">
                <span className={src.ok ? "text-up" : "text-down"}>{src.ok ? "Hidup" : "Celah"}</span> {src.name}
              </span>
            ))}
          </div>
        </section>

        <section className="panel p-4" aria-label="Macro state">
          <p className="font-mono text-xs tracking-widest text-faint">STATUS MAKRO XAUUSD</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Bias makro</p>
              <p className={`mt-1 inline-block px-2 py-1 text-2xl font-medium ${tone(s.biasTone)}`}>{s.biasLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Keyakinan</p>
              <p className="mt-1 font-mono text-xl text-fg">{s.confidenceLabel}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-pretty text-fg">{s.thesis}</p>
          <p className="mt-3 text-sm text-pretty text-muted">{s.primaryDriver}</p>
          {s.secondary.length ? (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-muted">
              {s.secondary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          {s.invalidationAlert ? (
            <p className="mt-4 border border-down/50 bg-down-dim px-3 py-3 text-sm text-pretty text-down">{s.invalidationAlert}</p>
          ) : null}
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Fact term="Konfirmasi pasar" value={s.confirmation} detail={s.confirmationDetail} />
            <Fact term="Vonis priced-in" value={s.pricedIn} detail={s.pricedInDetail} />
            <Fact term="Risiko posisi" value={s.positioningRisk} detail={s.positioningDetail} />
            <Fact term="Katalis berikutnya" value={s.nextCatalyst} detail={s.nextCatalystWhen} />
          </dl>
          <p className="mt-4 text-sm text-pretty text-muted">{s.invalidation}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Fact term="Bias makro akhir" value={snap.desk.finalBias} detail={snap.desk.finalNote} />
            <Fact term="Bias teknikal" value={snap.desk.technicalBias} detail={snap.desk.overall} />
            <Fact term="Konfluensi" value={snap.desk.confluenceCall} detail="Diambil dari yield, real yield, dolar, dan apakah harga emas searah." />
            <Fact term="Priced-in" value={snap.desk.pricedStatus} detail="Tidak disebut sudah di harga tanpa konsensus, harga pasar, aktual, dan reaksi sesudahnya." />
            <Fact term="Jarak vs ATR" value={snap.desk.stretch?.label ?? "DATA TIDAK TERSEDIA"} detail={snap.desk.stretch?.detail ?? "Perbandingan belum dihitung."} />
          </div>
        </section>
        </>
        ) : null}

        <Section page={page} id="regime" kicker="01" title="Rezim makro">
          <div className="grid gap-3 sm:grid-cols-2">
            <Fact term="Inflasi" value={snap.reaction.inflation} detail={snap.desk.regime.inflation} />
            <Fact term="Tenaga kerja" value={snap.reaction.employment} detail={snap.desk.regime.labor} />
            <Fact term="Pertumbuhan" value={snap.reaction.growth} detail={snap.desk.regime.growth} />
            <Fact term="Kondisi keuangan" value="DATA TIDAK TERSEDIA" detail={snap.desk.regime.financial} />
          </div>
          <p className="mt-3 text-sm text-pretty text-muted">{snap.surpriseSummary}</p>
        </Section>

        <Section page={page} id="usd" kicker="04" title="Dolar">
          <p className="font-mono text-2xl tabular-nums">{snap.usd.current}</p>
          <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-sm tabular-nums">
            <Mini k="1 sesi" v={snap.usd.daily} />
            <Mini k="~5 sesi" v={snap.usd.weekly} />
            <Mini k="~21 sesi" v={snap.usd.monthly} />
          </dl>
          <p className="mt-3 text-sm text-muted">Arah {snap.usd.trend}</p>
          <p className="mt-2 text-sm text-pretty text-muted">{snap.usd.relation}</p>
          <p className="mt-2 text-sm text-pretty text-muted">{snap.desk.lenses.usd}. Dolar yang menguat biasanya menjadi angin lawan bagi emas, yang melemah biasanya angin mendukung. Tetap dicek bersama yield.</p>
          <p className="mt-2 font-mono text-xs text-pretty text-faint">{snap.usd.source}</p>
          <div className="mt-4">
            <ChartCard title="DXY" data={snap.charts.dxy} color="var(--color-up)" />
          </div>
        </Section>

        <Section page={page} id="goldbias" kicker="07" title="Emas">
          <p className="font-mono text-2xl tabular-nums">{snap.gold.price}</p>
          <p className="mt-1 text-sm text-muted">{snap.gold.instrument}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Fact term="Bias makro" value={snap.desk.lenses.macro} detail={s.thesis} />
            <Fact term="Bias yield" value={snap.desk.lenses.yield} detail={snap.realYield.interpretation} />
            <Fact term="Bias USD" value={snap.desk.lenses.usd} detail={snap.usd.relation} />
            <Fact term="Posisi" value="Konteks" detail={snap.desk.lenses.positioning} />
            <Fact term="Sentimen risiko" value={snap.risk.regime} detail={snap.desk.lenses.risk} />
            <Fact term="Bias akhir" value={snap.desk.finalBias} detail={snap.desk.finalNote} />
          </dl>
          <p className="mt-3 text-sm text-pretty text-faint">{snap.gold.disclaimer}</p>
        </Section>

        <Section page={page} id="confluence" kicker="08" title="Konfluensi makro">
          <p className="text-sm font-medium">{snap.desk.confluenceCall}</p>
          <p className="mt-2 text-sm text-pretty text-muted">Dampak pada emas adalah kecenderungan, bukan perintah. Fed tidak diisi dari tebakan probabilitas.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="font-mono text-xs text-faint">
                <tr>
                  <th className="py-2 pr-3 font-normal">Faktor</th>
                  <th className="py-2 pr-3 font-normal">Kondisi</th>
                  <th className="py-2 pr-3 font-normal">Dampak emas</th>
                  <th className="py-2 font-normal">Kekuatan</th>
                </tr>
              </thead>
              <tbody>
                {snap.desk.confluence.map((row) => (
                  <tr key={row.factor} className="border-t border-line align-top">
                    <td className="py-3 pr-3 font-medium">{row.factor}</td>
                    <td className="py-3 pr-3 text-muted">{row.condition}</td>
                    <td className="py-3 pr-3">{row.impact}</td>
                    <td className="py-3 text-muted">{row.strength}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section page={page} id="divergence" kicker="09" title="Detektor divergensi">
          <h3 className="text-base font-medium">{snap.divergence.classification}</h3>
          <p className="mt-2 text-sm text-pretty text-muted">{snap.divergence.detail}</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-pretty text-muted">
            {snap.divergence.hypotheses.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-pretty text-faint">Kejutan ekonomi tidak sama dengan kejutan pasar. Harga yang tidak mengikuti data bukan alasan untuk langsung membalik arah.</p>
        </Section>

        <Section page={page} id="priced" kicker="10" title="Status priced-in">
          <p className="text-2xl font-medium">{snap.desk.pricedStatus}</p>
          <p className="mt-2 text-sm text-pretty text-muted">{s.pricedInDetail}</p>
          <div className="mt-4">
            <Fact term="Jarak vs ATR" value={snap.desk.stretch?.label ?? "DATA TIDAK TERSEDIA"} detail={snap.desk.stretch?.detail ?? "Perbandingan belum dihitung."} />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {snap.pricedLayers.map((layer) => (
              <article key={layer.layer} className="tile p-3">
                <h3 className="font-mono text-xs text-gold">{layer.layer}</h3>
                <p className="mt-2 text-sm text-pretty text-muted">{layer.finding}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section page={page} id="h4" kicker="11" title="Analisa teknikal">
          <p className="text-sm text-pretty text-muted">
            Supply dan demand ditandai dari swing yang sudah berbalik minimal satu ATR, lalu belum ditutup tembus. Zona yang sudah tembus tidak digambar. Bukan sinyal beli atau jual.
          </p>
          <div className="mt-4">
            <ZoneChart
              title="15 menit"
              note={snap.techCharts?.m15?.note ?? "COMEX GC=F, bar 15 menit. Bukan candle broker."}
              bars={snap.techCharts?.m15?.bars ?? []}
              zones={snap.techCharts?.m15?.zones ?? []}
              structure={snap.techCharts?.m15?.structure ?? "DATA TIDAK TERSEDIA"}
            />
          </div>
          <div className="mt-4">
            <ZoneChart
              title="4 jam"
              note="COMEX, bar 60 menit digabung per 4 jam UTC. Bukan candle broker."
              bars={snap.techCharts?.h4.bars ?? []}
              zones={snap.techCharts?.h4.zones ?? []}
              structure={snap.desk.h4.structure}
            />
          </div>
          <div className="mt-4">
            <ZoneChart
              title="Harian"
              note="Penutupan harian instrumen yang sama."
              bars={snap.techCharts?.daily.bars ?? []}
              zones={snap.techCharts?.daily.zones ?? []}
              structure={snap.desk.dailyTech.structure}
            />
          </div>
          <p className="mt-3 text-sm text-pretty text-faint">{snap.desk.h4.alignment}</p>
        </Section>

        <Section page={page} id="watch" kicker="13" title="Yang dipantau">
          <ul className="flex flex-col gap-3">
            {snap.desk.watch.map((item) => (
              <li key={item} className="border-t border-line pt-3 text-sm text-pretty text-muted">{item}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3">
            {snap.daily.map((block) => (
              <article key={block.heading}>
                <h3 className="text-sm font-medium">{block.heading}</h3>
                <p className="mt-2 text-sm text-pretty text-muted">{block.body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section page={page} id="chain" kicker="01" title="Rantai transmisi">
          <p className="text-sm text-pretty text-muted">
            Data ekonomi bukan keputusan Fed, dan cerita Fed bukan harga pasar. Mata rantai yang tertutup dibiarkan tertutup.
          </p>
          <ol className="mt-4 flex flex-col">
            {snap.chain.map((node, i) => (
              <li key={node.label} className="grid grid-cols-[2.5rem_1fr] gap-3">
                <div className="flex flex-col items-center">
                  <span className={`mt-1 size-2.5 rounded-full ${dot(node.status)}`} />
                  {i < snap.chain.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
                </div>
                <div className="pb-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base font-medium">{node.label}</h3>
                    <Status status={node.status} />
                  </div>
                  <p className="mt-1 text-sm text-pretty text-muted">{node.reading}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="grid gap-3 sm:grid-cols-2">
            {snap.crossChecks.map((row) => (
              <article key={row.label} className="tile p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">{row.label}</h3>
                  <Status status={row.status} />
                </div>
                <p className="mt-2 text-sm text-pretty text-muted">{row.reading}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section page={page} id="treasury" kicker="03" title="Treasury">
          <p className="text-sm text-pretty text-muted">{snap.yieldNote}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="font-mono text-xs text-faint">
                <tr>
                  <th className="py-2 pr-3 font-normal">Tenor</th>
                  <th className="py-2 pr-3 font-normal">Saat ini</th>
                  <th className="py-2 pr-3 font-normal">1 sesi</th>
                  <th className="py-2 pr-3 font-normal">~5 sesi</th>
                  <th className="py-2 pr-3 font-normal">~21 sesi</th>
                  <th className="py-2 font-normal">Arah</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {snap.yields.map((row) => (
                  <tr key={row.tenor} className="border-t border-line">
                    <td className="py-2 pr-3 font-sans text-fg">{row.tenor}</td>
                    <td className="py-2 pr-3">{row.current}</td>
                    <td className={`py-2 pr-3 ${ink(row.daily)}`}>{row.daily}</td>
                    <td className={`py-2 pr-3 ${ink(row.weekly)}`}>{row.weekly}</td>
                    <td className={`py-2 pr-3 ${ink(row.monthly)}`}>{row.monthly}</td>
                    <td className="py-2 text-muted">{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-pretty text-muted">{snap.yieldRead}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ChartCard title="US 2Y" data={snap.charts.y2} color="var(--color-chart)" />
            <ChartCard title="Real yield 10Y AS" data={snap.charts.real10} color="var(--color-gold)" />
          </div>
        </Section>

        <Section page={page} id="gold" kicker="03" title="Real yield, dolar, emas">
          <article className="tile p-3">
            <h3 className="text-sm font-medium">Real yield 10Y AS</h3>
            <p className="mt-2 font-mono text-2xl tabular-nums">{snap.realYield.current}</p>
            <p className="mt-1 font-mono text-xs text-faint">Per {snap.realYield.asOf}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-sm tabular-nums">
              <Mini k="1 sesi" v={snap.realYield.daily} />
              <Mini k="~5 sesi" v={snap.realYield.weekly} />
              <Mini k="~21 sesi" v={snap.realYield.monthly} />
            </dl>
            <p className="mt-3 text-sm text-pretty text-muted">{snap.realYield.interpretation}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-pretty text-muted">
              {snap.realYield.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </article>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <article className="tile p-3">
              <h3 className="text-sm font-medium">Indeks dolar</h3>
              <p className="mt-2 font-mono text-2xl tabular-nums">{snap.usd.current}</p>
              <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-sm tabular-nums">
                <Mini k="1 sesi" v={snap.usd.daily} />
                <Mini k="~5 sesi" v={snap.usd.weekly} />
                <Mini k="~21 sesi" v={snap.usd.monthly} />
              </dl>
              <p className="mt-2 text-sm text-muted">Arah {snap.usd.trend}</p>
              <p className="mt-2 text-sm text-pretty text-muted">{snap.usd.relation}</p>
              <p className="mt-2 font-mono text-xs text-pretty text-faint">{snap.usd.source}</p>
            </article>
            <article className="tile p-3">
              <h3 className="text-sm font-medium">{snap.gold.instrument}</h3>
              <p className="mt-2 font-mono text-2xl tabular-nums">{snap.gold.price}</p>
              <p className="mt-1 font-mono text-xs text-faint">{snap.gold.asOf}</p>
              <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-sm tabular-nums">
                <Mini k="1 sesi" v={snap.gold.daily} />
                <Mini k="~5 sesi" v={snap.gold.weekly} />
                <Mini k="~21 sesi" v={snap.gold.monthly} />
              </dl>
              <p className="mt-3 text-sm text-pretty text-muted">{snap.gold.disclaimer}</p>
              <p className="mt-2 text-sm text-muted">{snap.gold.realizedVol}</p>
              <p className="mt-1 text-sm text-muted">{snap.gold.atr}</p>
              <p className="mt-1 text-sm text-muted">{snap.gold.volume}</p>
              <p className="mt-1 text-sm text-pretty text-muted">{snap.gold.openInterest}</p>
              <p className="mt-2 font-mono text-xs text-pretty text-faint">{snap.gold.source}</p>
            </article>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ChartCard title="Proksi emas" data={snap.charts.gold} color="var(--color-chart)" />
            <ChartCard title="DXY" data={snap.charts.dxy} color="var(--color-up)" />
          </div>
        </Section>

        <Section page={page} id="regime" kicker="01" title="Cetakan dan kualitas data">
          <p className="text-sm text-pretty text-muted">{snap.surpriseSummary}</p>
          {snap.prints.map((group) => (
            <div key={group.group} className="mt-4">
              <h3 className="text-sm font-medium text-gold">{group.group}</h3>
              <div className="mt-2 flex flex-col gap-2">
                {group.rows.map((row) => (
                  <article key={row.name} className="tile p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="text-sm font-medium">{row.name}</h4>
                      <span className="font-mono text-xs text-faint">{row.period}</span>
                    </div>
                    <p className="mt-2 font-mono text-sm tabular-nums text-fg">Aktual {row.actual}</p>
                    <p className="mt-1 font-mono text-xs text-muted">Sebelumnya {row.previous} · Perkiraan {row.forecast}</p>
                    <p className="mt-2 text-sm text-pretty text-muted">{row.observedChange}</p>
                    <p className="mt-1 text-sm text-pretty text-faint">{row.surprise}</p>
                    <p className="mt-2 font-mono text-xs text-pretty text-faint">
                      {row.freshness} · {row.unit} · {row.frequency}
                    </p>
                    <p className="mt-1 font-mono text-xs text-pretty text-faint">{row.revisedNote}</p>
                    <p className="mt-1 font-mono text-xs text-pretty text-faint">{row.source}</p>
                    <p className="mt-2 font-mono text-xs text-gold">
                      {row.actual === "DATA TIDAK TERSEDIA" ? "TIDAK TERSEDIA" : row.forecast === "DATA TIDAK TERSEDIA" ? "SEBAGIAN · aktual lawan sebelumnya, bukan kejutan" : "TERVERIFIKASI"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Leg title="Inflasi" value={snap.reaction.inflation} detail={snap.reaction.inflationDetail} />
            <Leg title="Ketenagakerjaan" value={snap.reaction.employment} detail={snap.reaction.employmentDetail} />
            <Leg title="Pertumbuhan" value={snap.reaction.growth} detail={snap.reaction.growthDetail} />
            <Leg title="Tekanan Fed (model)" value={snap.reaction.fedPressure} detail={snap.reaction.fedPressureDetail} />
          </div>
          <p className="mt-3 text-sm text-pretty text-muted">{snap.reaction.disclaimer}</p>
        </Section>

        <Section page={page} id="fed" kicker="02" title="Fed">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Fact term="Suku bunga saat ini" value={snap.desk.fedView.current} detail="Kebijakan yang sedang berlaku. Bukan jalur ke depan." />
            <Fact term="Bias kebijakan" value={snap.reaction.fedPressure} detail={snap.desk.fedView.policyBias} />
            <Fact term="Kebijakan yang diharapkan" value="DATA TIDAK TERSEDIA" detail={snap.desk.fedView.expected} />
            <Fact term="Penyesuaian harga kebijakan" value="DATA TIDAK TERSEDIA" detail={snap.desk.fedView.repricing} />
          </dl>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat k="Rentang target" v={snap.fed.target} note="Rilis EFFR NY Fed. Pengaturan yang teramati saat ini." />
            <Stat k="EFFR" v={snap.fed.effr} note="Suku bunga dana federal efektif." />
            <Stat k="SOFR" v={snap.fed.sofr} note="Suku bunga overnight beragunan. Bukan jalur." />
          </div>
          <p className="mt-4 text-sm text-pretty text-muted">{snap.fed.probabilities}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="font-mono text-xs text-faint">
                <tr>
                  <th className="py-2 pr-3 font-normal">Horizon</th>
                  <th className="py-2 pr-3 font-normal">Suku bunga tersirat</th>
                  <th className="py-2 font-normal">Perubahan vs harga sebelumnya</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {snap.fed.path.map((row) => (
                  <tr key={row.horizon} className="border-t border-line">
                    <td className="py-2 pr-3 font-sans">{row.horizon}</td>
                    <td className="py-2 pr-3 text-faint">{row.rate}</td>
                    <td className="py-2 text-faint">{row.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-pretty text-muted">{snap.fed.divergence}</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-pretty text-muted">
            {(snap.fed.notes ?? []).map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <h3 className="mt-5 text-sm font-medium">Priced-in / penyesuaian harga</h3>
          <div className="mt-2 flex flex-col gap-2">
            {snap.pricedLayers.map((layer) => (
              <article key={layer.layer} className="tile p-3">
                <h4 className="font-mono text-xs text-gold">{layer.layer}</h4>
                <p className="mt-2 text-sm text-pretty text-muted">{layer.finding}</p>
              </article>
            ))}
          </div>
          <h3 className="mt-5 text-sm font-medium">Penutupan ke penutupan hari rilis</h3>
          <p className="mt-2 text-sm text-pretty text-muted">{snap.reactionNote}</p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="font-mono text-xs text-faint">
                <tr>
                  <th className="py-2 pr-3 font-normal">Peristiwa</th>
                  <th className="py-2 pr-3 font-normal">Proksi emas</th>
                  <th className="py-2 pr-3 font-normal">2Y</th>
                  <th className="py-2 pr-3 font-normal">10Y real</th>
                  <th className="py-2 font-normal">DXY</th>
                </tr>
              </thead>
              <tbody>
                {snap.releaseReactions.map((row) => (
                  <tr key={row.event} className="border-t border-line align-top">
                    <td className="py-2 pr-3">
                      {row.event}
                      <span className="mt-1 block font-mono text-xs text-faint">{row.date}</span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{row.gold}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{row.y2}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{row.real}</td>
                    <td className="py-2 font-mono text-xs">{row.dxy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section page={page} id="matrix" kicker="06" title="Matriks lintas aset">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="font-mono text-xs text-faint">
                <tr>
                  <th className="py-2 pr-3 font-normal">Variabel</th>
                  <th className="py-2 pr-3 font-normal">Pergerakan</th>
                  <th className="py-2 font-normal">Arti bagi emas</th>
                </tr>
              </thead>
              <tbody>
                {snap.matrix.map((row) => (
                  <tr key={row.variable} className="border-t border-line align-top">
                    <td className="py-3 pr-3 font-medium">{row.variable}</td>
                    <td className="py-3 pr-3 font-mono text-xs text-muted">{row.move}</td>
                    <td className="py-3 text-sm text-pretty text-muted">{row.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-pretty text-muted">{snap.matrixFooter}</p>
          <article className="mt-3 tile p-3">
            <h3 className="text-sm font-medium">{snap.divergence.classification}</h3>
            <p className="mt-2 text-sm text-pretty text-muted">{snap.divergence.detail}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-pretty text-muted">
              {snap.divergence.hypotheses.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </article>
        </Section>

        <Section page={page} id="position" kicker="07" title="Posisi dan volatilitas">
          <p className="font-mono text-xs text-faint">Tanggal laporan {snap.positioning.reportDate}</p>
          <p className="mt-2 text-sm text-pretty text-muted">{snap.positioning.source}</p>
          {snap.positioning.rows.length ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left font-mono text-xs tabular-nums">
                <thead className="text-faint">
                  <tr>
                    {["Buku", "Long", "Short", "Spread", "Neto", "Neto mingguan", "Neto / OI"].map((h) => (
                      <th key={h} className="py-2 pr-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {snap.positioning.rows.map((row) => (
                    <tr key={row.book} className="border-t border-line">
                      <td className="py-2 pr-3 font-sans text-sm">{row.book}</td>
                      <td className="py-2 pr-3">{row.long}</td>
                      <td className="py-2 pr-3">{row.short}</td>
                      <td className="py-2 pr-3">{row.spread}</td>
                      <td className="py-2 pr-3">{row.net}</td>
                      <td className="py-2 pr-3">{row.weekly}</td>
                      <td className="py-2">{row.pctOi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-sm text-faint">DATA TIDAK TERSEDIA</p>
          )}
          <p className="mt-3 text-sm text-pretty text-muted">{snap.positioning.reading}</p>
          <p className="mt-2 text-sm text-pretty text-faint">{snap.positioning.percentile}</p>
          <div className="mt-4 flex flex-col gap-2">
            {snap.volatility.rows.map((row) => (
              <article key={row.name} className="tile p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-medium">{row.name}</h3>
                  <span className="font-mono text-sm tabular-nums">{row.value}</span>
                </div>
                <p className="mt-2 text-sm text-pretty text-muted">{row.meaning}</p>
              </article>
            ))}
          </div>
          <p className="mt-3 text-sm text-pretty text-muted">{snap.volatility.note}</p>
        </Section>

        <Section page={page} id="risk" kicker="08" title="Likuiditas dan sentimen risiko">
          <p className="text-sm text-pretty text-muted">{snap.liquidity.reading}</p>
          <div className="mt-3 flex flex-col gap-2">
            {snap.liquidity.rows.map((row) => (
              <article key={row.name} className="tile p-3">
                <h3 className="text-sm font-medium">{row.name}</h3>
                <p className="mt-1 font-mono text-sm">{row.value}</p>
                <p className="mt-2 text-sm text-pretty text-muted">{row.note}</p>
              </article>
            ))}
          </div>
          <article className="mt-4 tile p-3">
            <p className="font-mono text-xs text-faint">SENTIMEN RISIKO · MODEL</p>
            <h3 className="mt-2 text-xl font-medium">{snap.risk.regime}</h3>
            <p className="mt-2 text-sm text-pretty text-muted">{snap.risk.detail}</p>
            <p className="mt-2 text-sm text-pretty text-fg">{snap.risk.goldNote}</p>
          </article>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="font-mono text-xs text-faint">
                <tr>
                  <th className="py-2 pr-3 font-normal">Pasar</th>
                  <th className="py-2 pr-3 font-normal">Terakhir</th>
                  <th className="py-2 font-normal">Perubahan</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {snap.risk.rows.map((row) => (
                  <tr key={row.name} className="border-t border-line">
                    <td className="py-2 pr-3 font-sans">{row.name}</td>
                    <td className="py-2 pr-3">{row.value}</td>
                    <td className="py-2 text-xs text-muted">{row.move}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section page={page} id="scenarios" kicker="09" title="Skenario dan pembatalan">
          <div className="flex flex-col gap-3">
            {snap.scenarios.map((sc) => (
              <article key={sc.name} className="tile p-3">
                <h3 className="text-base font-medium">{sc.name}</h3>
                <p className="mt-2 text-sm text-pretty text-fg">{sc.summary}</p>
                <dl className="mt-3 flex flex-col gap-2 text-sm">
                  <ScenarioRow k="Pemicu" v={sc.trigger} />
                  <ScenarioRow k="Reaksi makro" v={sc.summary} />
                  <ScenarioRow k="Konfirmasi" v={sc.confirmation} />
                  <ScenarioRow k="Pembatalan" v={sc.invalidation} />
                  <ScenarioRow k="Yang dipantau" v={sc.watch} />
                </dl>
              </article>
            ))}
          </div>
          <article className="mt-3 tile p-3">
            <h3 className="text-sm font-medium">Lapisan teknikal, dipisah</h3>
            <p className="mt-2 text-sm text-pretty text-fg">{snap.technical.separation}</p>
            <p className="mt-2 text-sm text-pretty text-muted">{snap.technical.regime}</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-muted">
              {snap.technical.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        </Section>

        <Section page={page} id="daily" kicker="10" title="Laporan harian">
          <div className="flex flex-col gap-3">
            {snap.daily.map((block) => (
              <article key={block.heading} className="border-t border-line pt-3">
                <h3 className="text-sm font-medium">{block.heading}</h3>
                <p className="mt-2 text-sm text-pretty text-muted">{block.body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section page={page} id="event" kicker="11" title={snap.event.mode}>
          <h3 className="text-base font-medium text-pretty">{snap.event.title}</h3>
          <div className="mt-3 flex flex-col gap-3">
            {snap.event.blocks.map((block) => (
              <article key={block.heading} className="tile p-3">
                <h4 className="font-mono text-xs tracking-wide text-gold">{block.heading}</h4>
                <p className="mt-2 text-sm text-pretty text-muted">{block.body}</p>
              </article>
            ))}
          </div>
          <h3 className="mt-5 text-sm font-medium">Kalender vendor · minggu ini</h3>
          <p className="mt-2 text-sm text-pretty text-muted">{snap.calendar.note}</p>
          {snap.calendar.rows.length ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="font-mono text-xs text-faint">
                  <tr>
                    <th className="py-2 pr-3 font-normal">Waktu</th>
                    <th className="py-2 pr-3 font-normal">Peristiwa</th>
                    <th className="py-2 pr-3 font-normal">Dampak</th>
                    <th className="py-2 pr-3 font-normal">Perkiraan</th>
                    <th className="py-2 font-normal">Sebelumnya</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.calendar.rows.map((row) => (
                    <tr key={`${row.when}-${row.title}`} className="border-t border-line">
                      <td className="py-2 pr-3 font-mono text-xs text-muted">{row.when}</td>
                      <td className="py-2 pr-3">{row.title}</td>
                      <td className={`py-2 pr-3 font-mono text-xs ${row.impact === "High" ? "text-down" : row.impact === "Medium" ? "text-gold" : "text-muted"}`}>
                        {row.impact === "High" ? "Tinggi" : row.impact === "Medium" ? "Sedang" : row.impact === "Low" ? "Rendah" : row.impact}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">{row.forecast}</td>
                      <td className="py-2 font-mono text-xs">{row.previous}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-sm text-faint">DATA TIDAK TERSEDIA</p>
          )}
          <p className="mt-3 text-sm text-pretty text-faint">
            Aktual tidak ada di ekspor ini, jadi tidak ada baris yang diberi kejutan. Perkiraan kosong tetap DATA TIDAK TERSEDIA.
          </p>
          <h3 className="mt-5 text-sm font-medium">Hanya item resmi</h3>
          {snap.news.length ? (
            <ul className="mt-2 flex flex-col gap-3">
              {snap.news.map((item) => (
                <li key={item.link || item.title} className="border-t border-line pt-3">
                  <a href={item.link} className="text-sm text-fg underline decoration-line underline-offset-4">
                    {item.title}
                  </a>
                  <p className="mt-1 font-mono text-xs text-faint">{item.date} · {item.classification}</p>
                  <p className="mt-1 text-sm text-muted">{item.note}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-faint">DATA TIDAK TERSEDIA</p>
          )}
        </Section>

        <Section page={page} id="method" kicker="12" title="Cakupan dan aturan">
          <div className="flex flex-col gap-3">
            {snap.coverage.map((row) => (
              <article key={row.domain} className="tile p-3">
                <h3 className="text-sm font-medium">{row.domain}</h3>
                <p className="mt-2 text-sm text-pretty text-muted">Yang ada: {row.have}</p>
                <p className="mt-1 text-sm text-pretty text-faint">Tidak diambil: {row.missing}</p>
              </article>
            ))}
          </div>
          <ol className="mt-4 flex list-decimal flex-col gap-3 pl-4 text-sm text-pretty text-muted">
            {snap.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-pretty text-faint">
            Kelas yang dipakai: teramati resmi, kuotasi vendor teramati, estimasi model. Estimasi tersirat pasar dan tafsir AI tidak dibuat. Celah tetap berlabel DATA TIDAK TERSEDIA.
          </p>
        </Section>
      </div>
      </div>
    </main>
  );
}

function Section({
  page,
  id,
  kicker,
  title,
  children,
}: {
  page: string;
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  if (page !== id) return null;
  return (
    <section className="panel p-4">
      <p className="font-mono text-xs text-faint">{kicker}</p>
      <h2 className="mt-1 text-lg font-medium text-balance">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Fact({ term, value, detail }: { term: string; value: string; detail: string }) {
  return (
    <div className="border-t border-line pt-3">
      <dt className="text-xs text-faint">{term}</dt>
      <dd className="mt-1 text-sm font-medium text-fg">{value}</dd>
      <dd className="mt-1 text-sm text-pretty text-muted">{detail}</dd>
    </div>
  );
}

function Status({ status }: { status: "open" | "partial" | "blocked" | "model" }) {
  const label = status === "open" ? "Teramati" : status === "partial" ? "Sebagian" : status === "model" ? "Model" : "Terblokir";
  const cls =
    status === "open"
      ? "bg-up/15 text-up"
      : status === "blocked"
        ? "bg-surface-2 text-faint"
        : "bg-gold/20 text-gold";
  return <span className={`rounded-full px-2.5 py-1 font-mono text-xs ${cls}`}>{label}</span>;
}

function dot(status: "open" | "partial" | "blocked" | "model") {
  if (status === "open") return "bg-up";
  if (status === "blocked") return "bg-line";
  return "bg-gold";
}

function tone(kind: TerminalSnapshot["state"]["biasTone"]) {
  if (kind === "bull") return "bg-gold-dim text-gold";
  if (kind === "bear") return "bg-down-dim text-down";
  if (kind === "neutral") return "bg-surface-2 text-muted";
  return "border border-line text-faint";
}

function ink(value: string) {
  if (value.startsWith("+")) return "text-up";
  if (value.startsWith("-") || value.startsWith("−")) return "text-down";
  return "text-muted";
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{k}</dt>
      <dd className={ink(v)}>{v}</dd>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  delta,
  data,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delta: string;
  data: { value: number }[];
}) {
  return (
    <article className="panel p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-gold text-gold-ink">{icon}</span>
        <Spark data={data} />
      </div>
      <p className="mt-3 text-xs text-faint">{label}</p>
      <p className="mt-1 truncate font-mono text-xl font-medium tabular-nums">{value}</p>
      <p className={`mt-1 font-mono text-xs ${ink(delta)}`}>{delta}</p>
    </article>
  );
}

function Spark({ data }: { data: { value: number }[] }) {
  const slice = data.slice(-28);
  if (slice.length < 2) return <span className="h-7 w-16" />;
  const vals = slice.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const w = 72;
  const h = 28;
  const points = vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = max === min ? h / 2 : h - ((v - min) / (max - min)) * (h - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const up = vals[vals.length - 1] >= vals[0];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0">
      <polyline fill="none" stroke={up ? "var(--color-up)" : "var(--color-down)"} strokeWidth="1.8" points={points} />
    </svg>
  );
}

function ZoneChart({
  title,
  note,
  bars,
  zones,
  structure,
}: {
  title: string;
  note: string;
  bars: CandlePoint[];
  zones: PriceZone[];
  structure: string;
}) {
  const [win, setWin] = useState({ end: bars.length, count: Math.min(36, bars.length) });
  const [hover, setHover] = useState<number | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const follow = useRef(true);
  const drag = useRef<{ x: number; end: number; moved: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; count: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    setWin((current) => (follow.current ? { end: bars.length, count: Math.min(current.count, bars.length) } : current));
  }, [bars]);

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      follow.current = false;
      setWin((current) => clampWindow(bars.length, current.end, current.count + (event.deltaY > 0 ? 6 : -6)));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [bars.length]);

  const view = bars.slice(Math.max(0, win.end - win.count), win.end);
  const focus = zones.find((zone) => `${zone.kind}-${zone.from}` === picked);
  const lows = view.map((bar) => bar.low).concat(focus ? [focus.bottom] : []);
  const highs = view.map((bar) => bar.high).concat(focus ? [focus.top] : []);
  const span = view.length > 1 ? Math.max(...highs) - Math.min(...lows) : 0;
  if (view.length < 8 || span <= 0) {
    return (
      <article className="tile p-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-6 text-sm text-faint">DATA TIDAK TERSEDIA</p>
      </article>
    );
  }
  const pad = span * 0.1;
  const y0 = Math.min(...lows) - pad;
  const y1 = Math.max(...highs) + pad;
  const W = 640;
  const H = 320;
  const left = 8;
  const right = 58;
  const top = 12;
  const bottom = 22;
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const yOf = (value: number) => top + (1 - (value - y0) / (y1 - y0)) * plotH;
  const slot = plotW / view.length;
  const xOf = (index: number) => left + index * slot + slot / 2;
  const activeIndex = Number.isInteger(hover) ? Math.max(0, Math.min(view.length - 1, hover as number)) : view.length - 1;
  const active = view[activeIndex] ?? view[view.length - 1];

  function indexOf(date: string) {
    const exact = view.findIndex((bar) => bar.date === date);
    if (exact >= 0) return exact;
    const older = view.findIndex((bar) => bar.date > date);
    return older < 0 ? 0 : Math.max(0, older - 1);
  }

  function moveTo(clientX: number, clientY: number, target: SVGSVGElement) {
    const rect = target.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;
    const index = Math.round((x - left) / slot - 0.5);
    if (Number.isFinite(index)) setHover(Math.max(0, Math.min(view.length - 1, index)));
    return { x, y, rect };
  }

  function onPointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), count: win.count };
      drag.current = null;
      return;
    }
    drag.current = { x: event.clientX, end: win.end, moved: 0 };
  }

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!event.currentTarget) return;
    if (pointers.current.has(event.pointerId)) pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    moveTo(event.clientX, event.clientY, event.currentTarget);
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current.dist > 0) {
        follow.current = false;
        const next = pinch.current.count * (pinch.current.dist / dist);
        setWin((current) => clampWindow(bars.length, current.end, next));
      }
      return;
    }
    if (!drag.current) return;
    const origin = drag.current.end;
    const rect = event.currentTarget.getBoundingClientRect();
    const slotPx = (rect.width * plotW) / W / Math.max(win.count, 1);
    const moved = event.clientX - drag.current.x;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(moved));
    if (Math.abs(moved) < 4 || rect.width <= 0) return;
    follow.current = false;
    const shift = Math.round(-moved / Math.max(slotPx, 1));
    setWin((current) => clampWindow(bars.length, origin + shift, current.count));
  }

  function onPointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const tap = drag.current != null && drag.current.moved < 8;
    drag.current = null;
    if (!tap || !event.currentTarget) return;
    const { y } = moveTo(event.clientX, event.clientY, event.currentTarget);
    if (!Number.isFinite(y)) return;
    const hit = zones.find((zone) => y >= yOf(zone.top) && y <= yOf(zone.bottom));
    setPicked(hit ? `${hit.kind}-${hit.from}` : null);
  }

  function zoom(step: number) {
    follow.current = win.end >= bars.length;
    setWin((current) => clampWindow(bars.length, current.end, current.count + step));
  }

  function focusZone(zone: PriceZone) {
    const key = `${zone.kind}-${zone.from}`;
    setPicked(key);
    const index = bars.findIndex((bar) => bar.date === zone.from);
    if (index < 0) return;
    follow.current = false;
    setWin((current) => clampWindow(bars.length, Math.min(bars.length, index + Math.round(current.count * 0.72)), current.count));
  }

  return (
    <article className="tile p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="mt-1 text-xs text-pretty text-faint">{note}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" className="tile h-11 w-11 text-lg" onClick={() => zoom(-6)} aria-label="Perbesar">+</button>
          <button type="button" className="tile h-11 w-11 text-lg" onClick={() => zoom(6)} aria-label="Perkecil">−</button>
          <button
            type="button"
            className="tile h-11 px-3 text-xs"
            onClick={() => {
              follow.current = true;
              setHover(null);
              setWin({ end: bars.length, count: Math.min(36, bars.length) });
            }}
          >
            Akhir
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 font-mono text-[11px]">
        <span className="text-faint">O {active.open.toFixed(1)}</span>
        <span className="text-up">H {active.high.toFixed(1)}</span>
        <span className="text-down">L {active.low.toFixed(1)}</span>
        <span>C {active.close.toFixed(1)}</span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-faint">{stamp(active.date)} · {structure}</p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 h-72 w-full touch-none"
        role="img"
        aria-label={`${title}. Geser untuk melihat, cubit atau tombol untuk zoom.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {[0.25, 0.5, 0.75].map((step) => {
          const value = y0 + (y1 - y0) * (1 - step);
          const y = top + plotH * step;
          return (
            <g key={step}>
              <line x1={left} x2={W - right} y1={y} y2={y} stroke="var(--color-line)" strokeWidth="1" />
              <text x={W - right + 4} y={y + 3} fill="var(--color-faint)" fontSize="10">{value.toFixed(0)}</text>
            </g>
          );
        })}
        {zones.map((zone) => {
          const key = `${zone.kind}-${zone.from}`;
          const x = xOf(indexOf(zone.from)) - slot / 2;
          const y = yOf(zone.top);
          const height = Math.max(3, yOf(zone.bottom) - y);
          const demand = zone.kind === "demand";
          const on = picked === key;
          return (
            <g key={key}>
              <rect
                x={Math.max(left, x)}
                y={y}
                width={Math.max(0, W - right - Math.max(left, x))}
                height={height}
                fill={demand ? "var(--color-up)" : "var(--color-down)"}
                opacity={on ? 0.38 : zone.state === "utuh" ? 0.2 : 0.1}
              />
              <text x={left + 4} y={y + 12} fill={demand ? "var(--color-up)" : "var(--color-down)"} fontSize="11">
                {demand ? "Demand" : "Supply"} {zone.bottom.toFixed(0)}–{zone.top.toFixed(0)}
              </text>
            </g>
          );
        })}
        {view.map((bar, index) => {
          const up = bar.close >= bar.open;
          const color = up ? "var(--color-up)" : "var(--color-down)";
          const x = xOf(index);
          const body = Math.max(1.4, Math.abs(yOf(bar.open) - yOf(bar.close)));
          const bodyY = Math.min(yOf(bar.open), yOf(bar.close));
          const on = index === activeIndex;
          return (
            <g key={`${bar.date}-${index}`} opacity={hover == null || on ? 1 : 0.72}>
              <line x1={x} x2={x} y1={yOf(bar.high)} y2={yOf(bar.low)} stroke={color} strokeWidth={on ? 1.6 : 1} />
              <rect x={x - Math.max(1.6, slot * 0.3)} y={bodyY} width={Math.max(3, slot * 0.6)} height={body} fill={color} rx="1" />
            </g>
          );
        })}
        <line x1={xOf(activeIndex)} x2={xOf(activeIndex)} y1={top} y2={top + plotH} stroke="var(--color-gold)" strokeDasharray="3 3" strokeWidth="1" />
        <line x1={left} x2={W - right} y1={yOf(active.close)} y2={yOf(active.close)} stroke="var(--color-chart)" strokeOpacity="0.7" strokeWidth="1" />
        <text x={left} y={H - 6} fill="var(--color-faint)" fontSize="10">{stamp(view[0].date)}</text>
        <text x={W - right - 78} y={H - 6} fill="var(--color-faint)" fontSize="10">{stamp(view[view.length - 1].date)}</text>
      </svg>
      <p className="mt-1 text-[11px] text-faint">Geser chart. Cubit atau tombol untuk zoom. Ketuk zona untuk menandai.</p>
      {zones.length === 0 ? (
        <p className="mt-2 text-sm text-faint">Tidak ada zona utuh. Yang sudah ditutup tembus tidak ditandai.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {zones.map((zone) => {
            const key = `${zone.kind}-${zone.from}`;
            return (
              <li key={key}>
                <button type="button" onClick={() => focusZone(zone)} className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl px-2 text-left text-xs ${picked === key ? "bg-surface-2" : ""}`}>
                  <span className={zone.kind === "demand" ? "text-up" : "text-down"}>
                    {zone.kind === "demand" ? "Demand" : "Supply"} · {zone.state}
                  </span>
                  <span className="font-mono text-muted">{zone.bottom.toFixed(1)} – {zone.top.toFixed(1)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

function clampWindow(length: number, end: number, count: number) {
  const nextCount = Math.min(length, Math.max(12, Math.round(count)));
  const nextEnd = Math.min(length, Math.max(nextCount, Math.round(end)));
  return { end: nextEnd, count: nextCount };
}

function stamp(date: string) {
  if (date.includes("T")) {
    const [day, time] = date.split("T");
    return `${day.slice(5)} ${time.slice(0, 5)}`;
  }
  return date.slice(5);
}

function ChartCard({ title, data, color }: { title: string; data: { date: string; value: number }[]; color: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const gid = `fill-${title.replace(/[^a-z0-9]+/gi, "")}`;
  return (
    <article className="tile p-3">
      <h3 className="text-sm font-medium">{title}</h3>
      {data.length < 2 ? (
        <p className="mt-6 text-sm text-faint">DATA TIDAK TERSEDIA</p>
      ) : ready ? (
        <div className="mt-2 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--color-faint)" }}
                itemStyle={{ color: "var(--color-fg)" }}
              />
              <Area type="monotone" dataKey="value" name={title} stroke={color} fill={`url(#${gid})`} strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-2 h-44 rounded-xl bg-surface-2" />
      )}
    </article>
  );
}

function Leg({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="tile p-3">
      <h3 className="text-sm text-muted">{title}</h3>
      <p className="mt-1 text-lg font-medium">{value}</p>
      <p className="mt-2 text-sm text-pretty text-muted">{detail}</p>
    </article>
  );
}

function Stat({ k, v, note }: { k: string; v: string; note: string }) {
  return (
    <article className="tile p-3">
      <h3 className="text-xs text-faint">{k}</h3>
      <p className="mt-1 font-mono text-sm text-pretty">{v}</p>
      <p className="mt-2 text-sm text-pretty text-muted">{note}</p>
    </article>
  );
}

function ScenarioRow({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{k}</dt>
      <dd className="text-pretty text-muted">{v}</dd>
    </div>
  );
}
