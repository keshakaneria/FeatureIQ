import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell as BarCell } from "recharts";
import { formatCompactNumber, formatCurrency, formatHours } from "../utils/format";

function SummaryMetric({ label, value, tone }) {
  return (
    <div className={`rounded-2xl border p-5 transition-all hover:border-slate-300 ${tone}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

export function SummaryBar({ summary }) {
  const chartData = [
    { name: "Hours", value: Number(summary.totalMonthlyHoursSaved.toFixed(1)), color: "#a855f7" },
    { name: "Cost", value: Number(summary.totalMonthlyNetSavings.toFixed(0)) / 1000, color: "#10b981" },
    { name: "Users", value: summary.totalUsersImpacted, color: "#f59e0b" }
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet-600">
              Portfolio Intelligence
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <SummaryMetric
              label="Strategic Features"
              value={formatCompactNumber(summary.ongoingCount)}
              tone="border-slate-200 bg-white"
            />
            <SummaryMetric
              label="Pipeline Backlog"
              value={formatCompactNumber(summary.backlogCount)}
              tone="border-slate-200 bg-white"
            />
            <SummaryMetric
              label="Hours Saved / Month"
              value={formatHours(summary.totalMonthlyHoursSaved)}
              tone="border-purple-200 bg-purple-50 text-purple-900 shadow-sm"
            />
            <SummaryMetric
              label="Net Monthly Profit"
              value={formatCurrency(summary.totalMonthlyNetSavings)}
              tone="border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm"
            />
            <SummaryMetric
              label="Total Users Impacted"
              value={formatCompactNumber(summary.totalUsersImpacted)}
              tone="border-amber-200 bg-amber-50 text-amber-900 shadow-sm"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Efficiency Impact</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 700 }}
                  formatter={(value, name, props) => {
                    const type = props.payload.name;
                    if (type === "Cost") return [`$${(value * 1000).toLocaleString()}`];
                    if (type === "Hours") return [`${value}`];
                    if (type === "Users") return [`${value}`];
                    return [value, name];
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <BarCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
