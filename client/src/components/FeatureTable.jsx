import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageSquare, Search } from "lucide-react";
import {
  ALL_STATUSES,
  BACKLOG_STATUSES,
  ONGOING_STATUSES,
  SORTABLE_COLUMNS,
  STATUS_STYLES
} from "../constants";
import {
  filterFeatures,
  isBacklogStatus,
  sortFeatures
} from "../utils/features";
import {
  formatBreakeven,
  formatCurrency,
  formatDate,
  formatHours
} from "../utils/format";

const FILTER_KEYS = [
  { key: "strategicPillar", label: "Strategic Pillar" },
  { key: "status", label: "Status" },
  { key: "riskLevel", label: "Risk Level" },
  { key: "owner", label: "Owner" }
];

function getRiskRowTone(riskLevel, index) {
  const alternating = index % 2 === 0 ? "bg-white/90" : "bg-slate-50/90";

  if (riskLevel === "Low") {
    return `${alternating} border-emerald-100`;
  }

  if (riskLevel === "Medium") {
    return `${alternating} border-amber-100`;
  }

  return `${alternating} border-rose-100`;
}

function getRiskHighlight(riskLevel) {
  if (riskLevel === "Low") {
    return "bg-emerald-50";
  }

  if (riskLevel === "Medium") {
    return "bg-amber-50";
  }

  return "bg-rose-50";
}

function SortHeader({ column, sorting, onChange }) {
  const isActive = sorting.key === column.key;
  const direction = isActive ? sorting.direction : "desc";

  return (
    <button
      type="button"
      onClick={() => onChange(column.key)}
      className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:text-slate-900"
    >
      {column.label}
      <span className="ml-2 text-[10px] text-slate-400">
        {isActive ? (direction === "desc" ? "↓" : "↑") : ""}
      </span>
    </button>
  );
}

function FilterChipGroup({ label, value, options, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange("")}
        className={`rounded-full px-3 py-2 text-xs font-medium transition ${
          !value ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
        }`}
      >
        All
      </button>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full px-3 py-2 text-xs font-medium transition ${
            value === option
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value || "Not provided"}</p>
    </div>
  );
}

function CommentComposer({ featureId, onAddComment }) {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!author.trim() || !text.trim()) {
      return;
    }

    await onAddComment(featureId, {
      author: author.trim(),
      text: text.trim()
    });
    setAuthor("");
    setText("");
  }

  return (
    <form className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-[0.35fr_1fr]">
        <input
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          placeholder="Author name"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
        />
        <input
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          placeholder="Add a comment for discussion or review"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Save comment
        </button>
      </div>
    </form>
  );
}

function FeatureDetailPanel({ feature, onAddComment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-4"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DetailField label="Yearly Net Savings" value={formatCurrency(feature.yearlyNetSavings)} />
        <DetailField label="Monthly Hours Saved" value={formatHours(feature.monthlyHoursSaved)} />
        <DetailField label="Yearly Hours Saved" value={formatHours(feature.yearlyHoursSaved)} />
        <DetailField
          label="Cost Saved / Process"
          value={formatCurrency(feature.costSavedPerProcess)}
        />
        <DetailField
          label="Time Saved / Process"
          value={formatHours(feature.timeSavedPerProcess)}
        />
        <DetailField
          label="Opportunity Cost"
          value={feature.opportunityCost ? formatCurrency(Number(feature.opportunityCost)) : ""}
        />
        <DetailField
          label="Revenue Loss / Month"
          value={
            feature.revenueLossPerMonth
              ? formatCurrency(Number(feature.revenueLossPerMonth))
              : ""
          }
        />
        <DetailField label="Strategic Pillar" value={feature.strategicPillar} />
        <DetailField label="Customer Segment" value={feature.customerSegment} />
        <DetailField label="Dependencies" value={feature.dependencies} />
        <DetailField label="Description" value={feature.description} />
        <DetailField label="Notes" value={feature.notes} />
      </div>

      <div className="mt-4 grid gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-slate-500" />
          <p className="text-sm font-semibold text-slate-700">Comments</p>
        </div>

        <CommentComposer featureId={feature.id} onAddComment={onAddComment} />

        <div className="grid gap-3">
          {(feature.comments || []).length ? (
            feature.comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{comment.author}</p>
                  <p className="text-xs text-slate-400">{formatDate(comment.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{comment.text}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              No comments yet.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SectionTable({
  title,
  subtitle,
  features,
  sorting,
  onSortChange,
  onStatusChange,
  onEditFeature,
  onAddComment,
  collapsed,
  onToggleCollapsed,
  canCollapse = true
}) {
  const [expandedId, setExpandedId] = useState("");

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_rgba(30,41,59,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>

        {canCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {collapsed ? "Expand" : "Collapse"}
            <ChevronDown className={`h-4 w-4 transition ${collapsed ? "" : "rotate-180"}`} />
          </button>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[1120px]">
            <div className="grid grid-cols-[70px_2.4fr_140px_170px_150px_170px_180px_140px_150px_120px] gap-3 px-3 py-3">
              {SORTABLE_COLUMNS.map((column) => (
                <SortHeader
                  key={column.key}
                  column={column}
                  sorting={sorting}
                  onChange={onSortChange}
                />
              ))}
            </div>

            <AnimatePresence initial={false}>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className={`mb-3 overflow-hidden rounded-[1.6rem] border ${getRiskRowTone(
                    feature.riskLevel,
                    index
                  )} ${getRiskHighlight(feature.riskLevel)} ${
                    feature.isNew ? "border-l-4 border-l-amber-400" : ""
                  }`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setExpandedId((current) => (current === feature.id ? "" : feature.id))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setExpandedId((current) => (current === feature.id ? "" : feature.id));
                      }
                    }}
                    className="grid w-full grid-cols-[70px_2.4fr_140px_170px_150px_170px_180px_140px_150px_120px] gap-3 px-3 py-4 text-left transition hover:bg-white/40"
                  >
                    <Cell>{feature.rank}</Cell>
                    <Cell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{feature.name}</span>
                        {feature.isNew ? (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                            New
                          </span>
                        ) : null}
                      </div>
                    </Cell>
                    <Cell>
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                        {feature.roiScore.toFixed(1)} / 5
                      </span>
                    </Cell>
                    <Cell>{formatCurrency(feature.monthlyNetSavings)}</Cell>
                    <Cell>{formatBreakeven(feature.breakevenMonths)}</Cell>
                    <Cell>{formatCurrency(feature.implementationCost)}</Cell>
                    <Cell>
                      <select
                        value={feature.status}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => onStatusChange(feature.id, event.target.value)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold outline-none ${STATUS_STYLES[feature.status]}`}
                      >
                        {ALL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </Cell>
                    <Cell>{feature.owner}</Cell>
                    <Cell>{formatDate(feature.targetReleaseDate)}</Cell>
                    <Cell>{feature.riskLevel}</Cell>
                  </div>

                  <div className="px-3 pb-3">
                    <div className="flex justify-end gap-2 pb-3">
                      <button
                        type="button"
                        onClick={() => onEditFeature(feature)}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {expandedId === feature.id ? (
                        <FeatureDetailPanel feature={feature} onAddComment={onAddComment} />
                      ) : null}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Cell({ children }) {
  return <div className="flex items-center text-sm text-slate-700">{children}</div>;
}

export function FeatureTable({
  features,
  sorting,
  onSortingChange,
  onStatusChange,
  onEditFeature,
  onAddComment
}) {
  const [filters, setFilters] = useState({
    strategicPillar: "",
    status: "",
    riskLevel: "",
    owner: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isBacklogCollapsed, setIsBacklogCollapsed] = useState(true);

  const filterOptions = useMemo(
    () => ({
      strategicPillar: [...new Set(features.map((feature) => feature.strategicPillar))].filter(Boolean),
      status: [...new Set(features.map((feature) => feature.status))].filter(Boolean),
      riskLevel: [...new Set(features.map((feature) => feature.riskLevel))].filter(Boolean),
      owner: [...new Set(features.map((feature) => feature.owner))].filter(Boolean)
    }),
    [features]
  );

  const filteredFeatures = useMemo(
    () => filterFeatures(features, filters, searchTerm),
    [features, filters, searchTerm]
  );

  const sortedFeatures = useMemo(
    () => sortFeatures(filteredFeatures, sorting),
    [filteredFeatures, sorting]
  );

  const ongoingFeatures = sortedFeatures.filter((feature) => !isBacklogStatus(feature.status));
  const backlogFeatures = sortedFeatures.filter((feature) => isBacklogStatus(feature.status));

  function handleSortChange(key) {
    if (sorting.key === key) {
      onSortingChange({
        key,
        direction: sorting.direction === "desc" ? "asc" : "desc"
      });
      return;
    }

    onSortingChange({
      key,
      direction:
        key === "name" || key === "status" || key === "owner" || key === "targetReleaseDate"
          ? "asc"
          : "desc"
    });
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_rgba(30,41,59,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
              placeholder="Search by feature name or description"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="grid gap-3">
            {FILTER_KEYS.map((filterItem) => (
              <FilterChipGroup
                key={filterItem.key}
                label={filterItem.label}
                value={filters[filterItem.key]}
                options={filterOptions[filterItem.key]}
                onChange={(nextValue) =>
                  setFilters((current) => ({
                    ...current,
                    [filterItem.key]: nextValue
                  }))
                }
              />
            ))}
          </div>
        </div>
      </section>

      <SectionTable
        title="Ongoing features"
        subtitle={`Statuses included: ${ONGOING_STATUSES.join(", ")}`}
        features={ongoingFeatures}
        sorting={sorting}
        onSortChange={handleSortChange}
        onStatusChange={onStatusChange}
        onEditFeature={onEditFeature}
        onAddComment={onAddComment}
        collapsed={false}
        onToggleCollapsed={() => {}}
        canCollapse={false}
      />

      <SectionTable
        title="Backlog"
        subtitle={`Statuses included: ${BACKLOG_STATUSES.join(", ")}`}
        features={backlogFeatures}
        sorting={sorting}
        onSortChange={handleSortChange}
        onStatusChange={onStatusChange}
        onEditFeature={onEditFeature}
        onAddComment={onAddComment}
        collapsed={isBacklogCollapsed}
        onToggleCollapsed={() => setIsBacklogCollapsed((current) => !current)}
      />
    </div>
  );
}
