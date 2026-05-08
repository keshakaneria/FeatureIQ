import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { formatCompactNumber, formatCurrency, formatHours } from "../utils/format";

function SummaryMetric({ label, value, tone }) {
  return (
    <div className={`rounded-2xl border px-4 py-4 ${tone}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function SummaryBar({ summary }) {
  const chartData = [
    { name: "Hours", value: Number(summary.totalMonthlyHoursSaved.toFixed(1)) },
    { name: "Savings", value: Number(summary.totalMonthlyNetSavings.toFixed(0)) / 1000 },
    { name: "Users", value: summary.totalUsersImpacted }
  ];

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(30,41,59,0.08)] backdrop-blur">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
            Product summary
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <SummaryMetric
              label="Ongoing"
              value={formatCompactNumber(summary.ongoingCount)}
              tone="border-slate-200 bg-slate-50"
            />
            <SummaryMetric
              label="Backlog"
              value={formatCompactNumber(summary.backlogCount)}
              tone="border-slate-200 bg-slate-50"
            />
            <SummaryMetric
              label="Hours Saved / Month"
              value={formatHours(summary.totalMonthlyHoursSaved)}
              tone="border-emerald-200 bg-emerald-50"
            />
            <SummaryMetric
              label="Net Savings / Month"
              value={formatCurrency(summary.totalMonthlyNetSavings)}
              tone="border-indigo-200 bg-indigo-50"
            />
            <SummaryMetric
              label="Users Impacted"
              value={formatCompactNumber(summary.totalUsersImpacted)}
              tone="border-amber-200 bg-amber-50"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Portfolio snapshot</p>
          <div className="mt-4 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "value" && chartData[1].value === value) {
                      return [`${value}k`, "Savings"];
                    }

                    return [value, "Metric"];
                  }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
