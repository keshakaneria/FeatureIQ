import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell as BarCell } from "recharts";
import { formatCompactNumber, formatCurrency, formatHours } from "../utils/format";

function SummaryMetric({ label, value, tone }) {
  return (
    <div className={`rounded-3xl border p-6 transition-all hover:shadow-lg ${tone}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

export function SummaryBar({ summary }) {
  const chartData = [
    { name: "Hours", value: Number(summary.totalMonthlyHoursSaved.toFixed(1)), color: "#6366f1" },
    { name: "Cost", value: Number(summary.totalMonthlyNetSavings.toFixed(0)) / 1000, color: "#10b981" },
    { name: "Users", value: summary.totalUsersImpacted, color: "#f59e0b" }
  ];

  return (
    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.05)]">
      <div className="grid gap-10 xl:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
              Product Portfolio Intelligence
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <SummaryMetric
              label="Strategic Features"
              value={formatCompactNumber(summary.ongoingCount)}
              tone="border-slate-200 bg-slate-50 shadow-sm"
            />
            <SummaryMetric
              label="Pipeline Backlog"
              value={formatCompactNumber(summary.backlogCount)}
              tone="border-slate-200 bg-slate-50 shadow-sm"
            />
            <SummaryMetric
              label="Hours Saved / Month"
              value={formatHours(summary.totalMonthlyHoursSaved)}
              tone="border-emerald-200 bg-emerald-50 shadow-sm"
            />
            <SummaryMetric
              label="Net Monthly Profit"
              value={formatCurrency(summary.totalMonthlyNetSavings)}
              tone="border-indigo-200 bg-indigo-50 shadow-sm"
            />
            <SummaryMetric
              label="Total Users Impacted"
              value={formatCompactNumber(summary.totalUsersImpacted)}
              tone="border-amber-200 bg-amber-50 shadow-sm"
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-slate-50/30 p-6">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Efficiency Impact Distribution</p>
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
