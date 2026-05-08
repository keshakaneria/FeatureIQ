import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Save } from "lucide-react";
import {
  ALL_STATUSES,
  EMPTY_FEATURE,
  RISK_LEVELS,
  STRATEGIC_PILLARS
} from "../constants";
import { calculateFeatureMetrics } from "../utils/roi";
import { formatBreakeven, formatCurrency, formatHours } from "../utils/format";

function Field({ label, required, children, hint }) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

function inputClassName() {
  return "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";
}

export function FeatureForm({ selectedProductName, editingFeature, onSave }) {
  const [formValues, setFormValues] = useState(EMPTY_FEATURE);

  useEffect(() => {
    setFormValues(editingFeature ? { ...EMPTY_FEATURE, ...editingFeature } : EMPTY_FEATURE);
  }, [editingFeature]);

  const previewMetrics = useMemo(() => calculateFeatureMetrics(formValues), [formValues]);

  function updateField(key, value) {
    setFormValues((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(formValues);

    if (!editingFeature) {
      setFormValues(EMPTY_FEATURE);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(30,41,59,0.08)] backdrop-blur">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
              Feature input
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              {editingFeature ? "Edit feature" : `Add a feature to ${selectedProductName}`}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Required fields focus on practical implementation cost and before-versus-after
              operational savings.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Feature Name" required>
              <input
                className={inputClassName()}
                value={formValues.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
              />
            </Field>

            <Field label="Feature Owner" required>
              <input
                className={inputClassName()}
                value={formValues.owner}
                onChange={(event) => updateField("owner", event.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Feature Description" required>
            <textarea
              className={`${inputClassName()} min-h-28`}
              value={formValues.description}
              onChange={(event) => updateField("description", event.target.value)}
              required
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Status" required>
              <select
                className={inputClassName()}
                value={formValues.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                {ALL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Target Release Date" required>
              <input
                type="date"
                className={inputClassName()}
                value={formValues.targetReleaseDate}
                onChange={(event) => updateField("targetReleaseDate", event.target.value)}
                required
              />
            </Field>

            <Field label="Strategic Pillar" required>
              <select
                className={inputClassName()}
                value={formValues.strategicPillar}
                onChange={(event) => updateField("strategicPillar", event.target.value)}
              >
                {STRATEGIC_PILLARS.map((pillar) => (
                  <option key={pillar} value={pillar}>
                    {pillar}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Risk Level" required>
              <select
                className={inputClassName()}
                value={formValues.riskLevel}
                onChange={(event) => updateField("riskLevel", event.target.value)}
              >
                {RISK_LEVELS.map((risk) => (
                  <option key={risk} value={risk}>
                    {risk}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <section className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/90 p-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Implementation cost inputs</h3>
              <p className="mt-1 text-sm text-slate-600">
                These feed the implementation and monthly operating cost side of the ROI model.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Number of Resources" required>
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.resourceCount}
                  onChange={(event) => updateField("resourceCount", event.target.value)}
                  required
                />
              </Field>
              <Field label="Estimated Days to Complete" required>
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.estimatedDays}
                  onChange={(event) => updateField("estimatedDays", event.target.value)}
                  required
                />
              </Field>
              <Field label="Daily Rate / Resource (USD)" required>
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.baseDailyRate}
                  onChange={(event) => updateField("baseDailyRate", event.target.value)}
                  required
                />
              </Field>
              <Field label="Monthly Maintenance Cost (USD)" required>
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.monthlyMaintenanceCost}
                  onChange={(event) => updateField("monthlyMaintenanceCost", event.target.value)}
                  required
                />
              </Field>
              <Field label="Monthly Cloud Infrastructure Cost (USD)" required>
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.monthlyCloudCost}
                  onChange={(event) => updateField("monthlyCloudCost", event.target.value)}
                  required
                />
              </Field>
            </div>
          </section>

          <section className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/90 p-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Savings inputs</h3>
              <p className="mt-1 text-sm text-slate-600">
                Capture the manual process before the feature and the reduced process after it.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Manual Hours / Process Before" required>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClassName()}
                  value={formValues.manualHoursBefore}
                  onChange={(event) => updateField("manualHoursBefore", event.target.value)}
                  required
                />
              </Field>
              <Field label="Resources Involved Before" required>
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.resourcesBefore}
                  onChange={(event) => updateField("resourcesBefore", event.target.value)}
                  required
                />
              </Field>
              <Field label="Cost / Resource / Hour Before (USD)" required>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClassName()}
                  value={formValues.hourlyCostBefore}
                  onChange={(event) => updateField("hourlyCostBefore", event.target.value)}
                  required
                />
              </Field>
              <Field label="Automated Hours / Process After" required>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClassName()}
                  value={formValues.automatedHoursAfter}
                  onChange={(event) => updateField("automatedHoursAfter", event.target.value)}
                  required
                />
              </Field>
              <Field label="Resources Involved After" required>
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.resourcesAfter}
                  onChange={(event) => updateField("resourcesAfter", event.target.value)}
                  required
                />
              </Field>
              <Field label="Cost / Resource / Hour After (USD)" required>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClassName()}
                  value={formValues.hourlyCostAfter}
                  onChange={(event) => updateField("hourlyCostAfter", event.target.value)}
                  required
                />
              </Field>
              <Field label="Estimated Processes / Month" required>
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.processesPerMonth}
                  onChange={(event) => updateField("processesPerMonth", event.target.value)}
                  required
                />
              </Field>
              <Field label="Users Impacted" required hint="Used in the product summary bar.">
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.usersImpacted}
                  onChange={(event) => updateField("usersImpacted", event.target.value)}
                  required
                />
              </Field>
            </div>
          </section>

          <details className="group rounded-3xl border border-slate-200 bg-slate-50/90 p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Additional Details</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Optional fields for supporting context and executive tradeoff framing.
                </p>
              </div>
              <ChevronDown className="h-5 w-5 text-slate-500 transition group-open:rotate-180" />
            </summary>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Opportunity Cost (USD)">
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.opportunityCost}
                  onChange={(event) => updateField("opportunityCost", event.target.value)}
                />
              </Field>
              <Field label="Revenue Loss / Month if Not Built (USD)">
                <input
                  type="number"
                  min="0"
                  className={inputClassName()}
                  value={formValues.revenueLossPerMonth}
                  onChange={(event) => updateField("revenueLossPerMonth", event.target.value)}
                />
              </Field>
              <Field label="Customer Segment Impacted">
                <input
                  className={inputClassName()}
                  value={formValues.customerSegment}
                  onChange={(event) => updateField("customerSegment", event.target.value)}
                />
              </Field>
              <Field label="Dependencies">
                <input
                  className={inputClassName()}
                  value={formValues.dependencies}
                  onChange={(event) => updateField("dependencies", event.target.value)}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Notes and Additional Context">
                  <textarea
                    className={`${inputClassName()} min-h-28`}
                    value={formValues.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                  />
                </Field>
              </div>
            </div>
          </details>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              {editingFeature ? "Update feature" : "Save feature"}
            </button>
          </div>
        </form>

        <aside className="rounded-[1.75rem] border border-indigo-100 bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">
            Live ROI preview
          </p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">ROI Score</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {previewMetrics.roiScore.toFixed(1)}
                <span className="ml-1 text-lg text-slate-400">/ 5</span>
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <PreviewStat
                label="Monthly Net Savings"
                value={formatCurrency(previewMetrics.monthlyNetSavings)}
              />
              <PreviewStat
                label="Yearly Net Savings"
                value={formatCurrency(previewMetrics.yearlyNetSavings)}
              />
              <PreviewStat
                label="Monthly Hours Saved"
                value={formatHours(previewMetrics.monthlyHoursSaved)}
              />
              <PreviewStat
                label="Breakeven"
                value={formatBreakeven(previewMetrics.breakevenMonths)}
              />
              <PreviewStat
                label="Implementation Cost"
                value={formatCurrency(previewMetrics.implementationCost)}
              />
              <PreviewStat
                label="Time Saved / Process"
                value={formatHours(previewMetrics.timeSavedPerProcess)}
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PreviewStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white bg-white/90 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
