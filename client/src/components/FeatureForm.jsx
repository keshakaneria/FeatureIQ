import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Save, Info, X, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  ALL_STATUSES,
  EMPTY_FEATURE,
  RISK_LEVELS,
  STRATEGIC_PILLARS,
  CUSTOMER_SEGMENTS
} from "../constants";
import { calculateFeatureMetrics } from "../utils/roi";
import { formatBreakeven, formatCurrency, formatHours } from "../utils/format";

function Tooltip({ content }) {
  return (
    <div className="relative inline-block ml-1.5 group/tooltip">
      <div className="cursor-help transition-colors text-slate-400 hover:text-indigo-500">
        <Info className="h-3.5 w-3.5" />
      </div>
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 w-60 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-[11px] leading-relaxed text-white opacity-0 shadow-2xl transition-all group-hover/tooltip:translate-y-[-4px] group-hover/tooltip:opacity-100 z-[100]">
        {content}
        <div className="absolute top-full left-1/2 -mt-1.5 h-3 w-3 -translate-x-1/2 rotate-45 bg-slate-900" />
      </div>
    </div>
  );
}

function Field({ label, required, children, hint, tooltip }) {
  return (
    <label className="grid gap-2.5 text-sm text-slate-700">
      <span className="font-semibold flex items-center text-slate-900">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
        {tooltip && <Tooltip content={tooltip} />}
      </span>
      {children}
      {hint ? <span className="text-[11px] font-medium text-slate-400">{hint}</span> : null}
    </label>
  );
}

function inputClassName() {
  return "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300";
}

export function FeatureForm({ selectedProductName, editingFeature, onSave, onCancelEdit, allFeatures = [] }) {
  const [formValues, setFormValues] = useState(EMPTY_FEATURE);
  const [isSaving, setIsSaving] = useState(false);
  const [previewRank, setPreviewRank] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (editingFeature) {
      setFormValues({ ...EMPTY_FEATURE, ...editingFeature });
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setFormValues(EMPTY_FEATURE);
    }
  }, [editingFeature]);

  const previewMetrics = useMemo(() => calculateFeatureMetrics(formValues), [formValues]);

  function updateField(key, value) {
    const isNumeric = typeof EMPTY_FEATURE[key] === "number";
    
    if (isNumeric) {
      // Allow empty string or negative sign while typing
      if (value === "" || value === "-") {
        setFormValues(curr => ({ ...curr, [key]: value }));
        return;
      }
      
      const parsed = parseFloat(value);
      setFormValues(curr => ({ ...curr, [key]: isNaN(parsed) ? 0 : parsed }));
    } else {
      setFormValues((current) => ({
        ...current,
        [key]: value
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    const loadingToast = toast.loading(editingFeature ? "Syncing changes..." : "Adding to roadmap...");
    
    try {
      // Clean up numerical values before saving
      const cleanedValues = { ...formValues };
      Object.keys(cleanedValues).forEach(key => {
        if (typeof EMPTY_FEATURE[key] === "number" && (cleanedValues[key] === "" || cleanedValues[key] === "-")) {
          cleanedValues[key] = 0;
        }
      });

      console.log("Submitting feature to onSave:", cleanedValues);
      await onSave(cleanedValues);
      console.log("onSave promise resolved");
      
      toast.success(editingFeature ? "Update successful" : "Feature added", { id: loadingToast });
      
      if (!editingFeature) {
        setFormValues(EMPTY_FEATURE);
        setPreviewRank(null);
      }
    } catch (error) {
      console.error("Save error details:", error);
      toast.error(error.message || "Save failed", { id: loadingToast, duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  }

  function handlePreviewRank() {
    const sortedWithPreview = [...allFeatures, { ...formValues, ...previewMetrics }]
      .sort((a, b) => b.roiScore - a.roiScore);
    const rank = sortedWithPreview.findIndex(f => f.name === formValues.name || f.id === formValues.id) + 1;
    setPreviewRank(rank);
  }

  return (
    <section ref={formRef} id="feature-input" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="grid gap-10 xl:grid-cols-[1fr_380px]">
        <form className="grid gap-8" onSubmit={handleSubmit}>
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-600">
                Data Entry
              </div>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900">
                {editingFeature ? "Modify existing feature" : `Strategic Input for ${selectedProductName}`}
              </h2>
              <p className="mt-2 text-slate-500 text-sm font-medium">
                Fill in the operational and technical details to generate an ROI score.
              </p>
            </div>
            {editingFeature && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 active:scale-95 shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Feature Name" required tooltip="Use a descriptive name that executives will recognize.">
              <input
                className={inputClassName()}
                value={formValues.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
                placeholder="e.g. AI-Powered Customer Triage"
              />
            </Field>

            <Field label="Feature Owner" required tooltip="Primary contact for this feature's delivery.">
              <input
                className={inputClassName()}
                value={formValues.owner}
                onChange={(event) => updateField("owner", event.target.value)}
                required
                placeholder="Lead PM or Designer"
              />
            </Field>
          </div>

          <Field label="Problem & Solution Context" required tooltip="Briefly describe the 'Why' and 'How'.">
            <textarea
              className={`${inputClassName()} min-h-32 resize-none`}
              value={formValues.description}
              onChange={(event) => updateField("description", event.target.value)}
              required
              placeholder="What pain point does this solve? How does the solution work?"
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Current Status" required>
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

            <Field label="Target Launch" required>
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

            <Field label="Execution Risk" required>
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

          <section className="grid gap-6 rounded-3xl border border-slate-100 bg-slate-50/50 p-7">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <h3 className="text-lg font-bold text-slate-900">Delivery & Infrastructure Costs</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Total Resources" required tooltip="FTEs or contractors allocated.">
                <input
                  type="number"
                  className={inputClassName()}
                  value={formValues.resourceCount}
                  onChange={(event) => updateField("resourceCount", event.target.value)}
                  required
                />
              </Field>
              <Field label="Delivery Days" required tooltip="Estimated work days until production.">
                <input
                  type="number"
                  className={inputClassName()}
                  value={formValues.estimatedDays}
                  onChange={(event) => updateField("estimatedDays", event.target.value)}
                  required
                />
              </Field>
              <Field label="Hourly Rate ($)" required tooltip="Blended average hourly cost.">
                <input
                  type="number"
                  className={inputClassName()}
                  value={formValues.baseHourlyRate}
                  onChange={(event) => updateField("baseHourlyRate", event.target.value)}
                  required
                />
              </Field>
              <Field label="OpEx / Month ($)" required tooltip="Ongoing support and maintenance.">
                <input
                  type="number"
                  className={inputClassName()}
                  value={formValues.monthlyMaintenanceCost}
                  onChange={(event) => updateField("monthlyMaintenanceCost", event.target.value)}
                  required
                />
              </Field>
              <Field label="Cloud / Month ($)" required tooltip="Infrastructure and API expenses.">
                <input
                  type="number"
                  className={inputClassName()}
                  value={formValues.monthlyCloudCost}
                  onChange={(event) => updateField("monthlyCloudCost", event.target.value)}
                  required
                />
              </Field>
            </div>
          </section>

          <section className="grid gap-8 rounded-3xl border border-slate-100 bg-slate-50/50 p-7">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900">Efficiency & Savings Metrics</h3>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">Current Process</h4>
                  <Tooltip content="The manual effort required before this feature is implemented." />
                </div>
                <div className="grid gap-5 rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
                  <Field label="Hours / Process">
                    <input type="number" step="0.1" className={inputClassName()} value={formValues.manualHoursBefore} onChange={(event) => updateField("manualHoursBefore", event.target.value)} />
                  </Field>
                  <Field label="Resources Involved">
                    <input type="number" className={inputClassName()} value={formValues.resourcesBefore} onChange={(event) => updateField("resourcesBefore", event.target.value)} />
                  </Field>
                  <Field label="Blended Hourly Rate ($)">
                    <input type="number" step="0.1" className={inputClassName()} value={formValues.hourlyCostBefore} onChange={(event) => updateField("hourlyCostBefore", event.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">Automated Process</h4>
                  <Tooltip content="The estimated effort required after automation." />
                </div>
                <div className="grid gap-5 rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
                  <Field label="Hours / Process">
                    <input type="number" step="0.1" className={inputClassName()} value={formValues.automatedHoursAfter} onChange={(event) => updateField("automatedHoursAfter", event.target.value)} />
                  </Field>
                  <Field label="Resources Involved">
                    <input type="number" className={inputClassName()} value={formValues.resourcesAfter} onChange={(event) => updateField("resourcesAfter", event.target.value)} />
                  </Field>
                  <Field label="Blended Hourly Rate ($)">
                    <input type="number" step="0.1" className={inputClassName()} value={formValues.hourlyCostAfter} onChange={(event) => updateField("hourlyCostAfter", event.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Global Impact Multipliers</h4>
                <div className="grid gap-5 md:grid-cols-2 rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
                  <Field label="Processes / Month">
                    <input type="number" className={inputClassName()} value={formValues.processesPerMonth} onChange={(event) => updateField("processesPerMonth", event.target.value)} />
                  </Field>
                  <Field label="Users Impacted">
                    <input type="number" className={inputClassName()} value={formValues.usersImpacted} onChange={(event) => updateField("usersImpacted", event.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          </section>

          <details className="group rounded-[2rem] border border-slate-200 bg-white p-2 transition-all">
            <summary className="flex cursor-pointer list-none items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-open:bg-indigo-50 group-open:text-indigo-600 transition-colors">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Tradeoff & Opportunity Context</h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">Optional qualitative data for roadmap discussions.</p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-slate-300 transition-transform duration-300 group-open:rotate-180" />
            </summary>

            <div className="px-6 pb-6 pt-2 grid gap-6 md:grid-cols-2 border-t border-slate-50 mt-2">
              <Field label="Opportunity Cost ($)" tooltip="Revenue potential sacrificed to build this.">
                <input
                  type="number"
                  className={inputClassName()}
                  value={formValues.opportunityCost}
                  onChange={(event) => updateField("opportunityCost", event.target.value)}
                />
              </Field>
              <Field label="Revenue Loss / Month ($)" tooltip="Cost of inaction.">
                <input
                  type="number"
                  className={inputClassName()}
                  value={formValues.revenueLossPerMonth}
                  onChange={(event) => updateField("revenueLossPerMonth", event.target.value)}
                />
              </Field>
              <Field label="Target Customer Segment">
                <select
                  className={inputClassName()}
                  value={formValues.customerSegment}
                  onChange={(event) => updateField("customerSegment", event.target.value)}
                >
                  {CUSTOMER_SEGMENTS.map((seg) => (
                    <option key={seg} value={seg}>{seg}</option>
                  ))}
                </select>
              </Field>
              <Field label="Key Dependencies">
                <input
                  className={inputClassName()}
                  value={formValues.dependencies}
                  onChange={(event) => updateField("dependencies", event.target.value)}
                  placeholder="Platform, Legal, APIs..."
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Internal Roadmap Notes">
                  <textarea
                    className={`${inputClassName()} min-h-28 resize-none`}
                    value={formValues.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    placeholder="Extra context for the executive team..."
                  />
                </Field>
              </div>
            </div>
          </details>

          <div className="flex flex-wrap items-center justify-end gap-4 pt-6 mt-4 border-t border-slate-100">
            {editingFeature && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
              >
                Cancel Edit
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handlePreviewRank}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-8 py-4 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-100 active:scale-95 shadow-sm"
            >
              <Eye className="h-4 w-4" />
              Preview ROI
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-10 py-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {editingFeature ? "Commit Changes" : "Save Feature"}
            </motion.button>
          </div>
        </form>

        <aside className="relative">
          <div className="sticky top-10 space-y-6">
            <div className="rounded-[2.5rem] border border-violet-100 bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 text-white shadow-2xl shadow-violet-200">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-200">
                Strategic Intelligence
              </p>
              <div className="mt-8 flex flex-col items-center text-center">
                <div className="relative">
                  <svg className="h-40 w-40 -rotate-90">
                    <circle cx="80" cy="80" r="74" className="stroke-fuchsia-400/30 fill-none" strokeWidth="8" />
                    <circle 
                      cx="80" cy="80" r="74" 
                      className="stroke-white fill-none transition-all duration-1000" 
                      strokeWidth="8" 
                      strokeDasharray={464}
                      strokeDashoffset={464 - (464 * (previewMetrics.roiScore / 5))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-5xl font-black">{previewMetrics.roiScore.toFixed(1)}</p>
                    <p className="text-xs font-bold text-violet-200 mt-1">ROI SCORE</p>
                  </div>
                </div>
                
                {previewRank && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-xl border border-white/20 shadow-lg"
                  >
                    <p className="text-sm font-bold uppercase tracking-widest text-violet-100">Ranked:</p>
                    <p className="text-2xl font-black text-white">#{previewRank}</p>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <PreviewStat label="Net Monthly" value={formatCurrency(previewMetrics.monthlyNetSavings)} />
              <PreviewStat label="Breakeven" value={formatBreakeven(previewMetrics.breakevenMonths)} />
              <PreviewStat label="Delivery Cost" value={formatCurrency(previewMetrics.implementationCost)} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PreviewStat({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-lg font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
