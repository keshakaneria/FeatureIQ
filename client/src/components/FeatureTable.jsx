import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageSquare, Search, Filter, ArrowUpRight, Clock, User, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
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
  { key: "strategicPillar", label: "Pillar" },
  { key: "status", label: "Status" },
  { key: "riskLevel", label: "Risk" },
  { key: "owner", label: "Owner" }
];

const TABLE_GRID_CLASS = "grid grid-cols-[50px_minmax(200px,2.5fr)_70px_120px_85px_120px_130px_100px_110px_80px] gap-4 items-center";

function SortHeader({ column, sorting, onChange }) {
  const isActive = sorting.key === column.key;
  const direction = isActive ? sorting.direction : "desc";

  return (
    <button
      type="button"
      onClick={() => onChange(column.key)}
      className="group flex items-center gap-1.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-indigo-600"
    >
      <span className="truncate">{column.label}</span>
      <div className={`flex-shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
        <ChevronDown className={`h-3 w-3 transition-transform ${isActive && direction === 'asc' ? 'rotate-180' : ''}`} />
      </div>
    </button>
  );
}

function DetailField({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      </div>
      <p className="text-sm font-bold leading-relaxed text-slate-700">{value || "—"}</p>
    </div>
  );
}

function CommentComposer({ featureId, onAddComment }) {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!author.trim() || !text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(featureId, { author: author.trim(), text: text.trim() });
      toast.success("Comment added");
      setAuthor("");
      setText("");
    } catch (e) {
      toast.error("Comment failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4 rounded-2xl bg-slate-50/50 p-5 border border-slate-100" onSubmit={handleSubmit}>
      <div className="flex flex-col md:flex-row gap-3">
        <input
          className="md:w-1/3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
          placeholder="Your name"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
        />
        <input
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
          placeholder="Add strategic context or feedback..."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </form>
  );
}

function FeatureDetailPanel({ feature, onAddComment }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="p-6 bg-slate-50/30 border-t border-slate-100 grid gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Yearly Efficiency Savings" value={formatCurrency(feature.yearlyNetSavings)} icon={ArrowUpRight} />
          <DetailField label="Hours Freed / Month" value={formatHours(feature.monthlyHoursSaved)} icon={Clock} />
          <DetailField label="Customer Segment" value={feature.customerSegment} icon={User} />
          <DetailField label="Risk Profile" value={feature.riskLevel} icon={Shield} />
          <div className="md:col-span-2 lg:col-span-4">
            <DetailField label="Description & Context" value={feature.description} />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <DetailField label="Implementation Notes" value={feature.notes} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <MessageSquare className="h-4 w-4 text-indigo-500" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Discussion History</h4>
          </div>
          <CommentComposer featureId={feature.id} onAddComment={onAddComment} />
          <div className="grid gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {(feature.comments || []).length ? (
              [...(feature.comments || [])].reverse().map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <p className="text-sm font-bold text-slate-900">{comment.author}</p>
                    <p className="text-[10px] font-medium text-slate-400">{formatDate(comment.createdAt)}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">{comment.text}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400 text-sm italic">
                No context provided in comments yet.
              </div>
            )}
          </div>
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

  const handleStatusChange = async (featureId, newStatus) => {
    try {
      await onStatusChange(featureId, newStatus);
      toast.success(`Moved to ${newStatus}`);
    } catch (e) {
      toast.error("Status update failed");
    }
  };

  return (
    <section className="rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_20px_80px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center justify-between p-8 border-b border-slate-50">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="mt-1 text-sm font-medium text-slate-400">{subtitle}</p>
        </div>

        {canCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-95"
          >
            <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </button>
        ) : null}
      </div>

      {!collapsed && (
        <div className="w-full">
          <div className={`${TABLE_GRID_CLASS} px-8 py-4 bg-slate-50/50 border-b border-slate-100`}>
            {SORTABLE_COLUMNS.map((column) => (
              <SortHeader
                key={column.key}
                column={column}
                sorting={sorting}
                onChange={onSortChange}
              />
            ))}
          </div>

          <div className="p-4 space-y-2">
            <AnimatePresence initial={false}>
              {features.map((feature) => (
                <motion.div
                  key={feature.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative rounded-2xl border border-transparent transition-all duration-200 hover:border-indigo-100 hover:bg-indigo-50/30 ${
                    expandedId === feature.id ? 'border-indigo-100 bg-indigo-50/30' : 'bg-white'
                  }`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedId(curr => curr === feature.id ? "" : feature.id)}
                    className={`${TABLE_GRID_CLASS} px-4 py-4 cursor-pointer`}
                  >
                    <Cell><span className="font-mono text-slate-400 text-[10px] font-bold">#{feature.rank}</span></Cell>
                    <Cell>
                      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                        <span className="font-bold text-slate-900 text-sm truncate" title={feature.name}>
                          {feature.name}
                        </span>
                        {feature.isNew && (
                          <span className="w-fit rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                            New
                          </span>
                        )}
                      </div>
                    </Cell>
                    <Cell>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-[11px]">
                        {feature.roiScore.toFixed(1)}
                      </div>
                    </Cell>
                    <Cell><span className="font-bold text-slate-700 text-xs">{formatCurrency(feature.monthlyNetSavings)}</span></Cell>
                    <Cell><span className="font-bold text-slate-700 text-xs">{formatBreakeven(feature.breakevenMonths)}</span></Cell>
                    <Cell><span className="font-bold text-slate-700 text-xs">{formatCurrency(feature.implementationCost)}</span></Cell>
                    <Cell>
                      <select
                        value={feature.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => handleStatusChange(feature.id, e.target.value)}
                        className={`rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none border-none cursor-pointer transition-transform hover:scale-105 ${STATUS_STYLES[feature.status]}`}
                      >
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Cell>
                    <Cell><span className="text-slate-500 font-semibold text-xs truncate">{feature.owner}</span></Cell>
                    <Cell><span className="text-slate-500 font-semibold text-[10px] whitespace-nowrap">{formatDate(feature.targetReleaseDate)}</span></Cell>
                    <Cell>
                      <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-center w-full ${
                        feature.riskLevel === 'High' ? 'text-rose-700 bg-rose-50' :
                        feature.riskLevel === 'Medium' ? 'text-amber-700 bg-amber-50' :
                        'text-emerald-700 bg-emerald-50'
                      }`}>
                        {feature.riskLevel}
                      </div>
                    </Cell>
                  </div>

                  <AnimatePresence>
                    {expandedId === feature.id && (
                      <FeatureDetailPanel feature={feature} onAddComment={onAddComment} />
                    )}
                  </AnimatePresence>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditFeature(feature); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </section>
  );
}

function Cell({ children }) {
  return <div className="flex items-center min-w-0 overflow-hidden">{children}</div>;
}

export function FeatureTable({
  features,
  sorting,
  onSortingChange,
  onStatusChange,
  onEditFeature,
  onAddComment
}) {
  const [filters, setFilters] = useState({ strategicPillar: "", status: "", riskLevel: "", owner: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isBacklogCollapsed, setIsBacklogCollapsed] = useState(false);

  const filterOptions = useMemo(() => ({
    strategicPillar: [...new Set(features.map(f => f.strategicPillar))].filter(Boolean),
    status: [...new Set(features.map(f => f.status))].filter(Boolean),
    riskLevel: [...new Set(features.map(f => f.riskLevel))].filter(Boolean),
    owner: [...new Set(features.map(f => f.owner))].filter(Boolean)
  }), [features]);

  const filteredFeatures = useMemo(() => filterFeatures(features, filters, searchTerm), [features, filters, searchTerm]);
  const sortedFeatures = useMemo(() => sortFeatures(filteredFeatures, sorting), [filteredFeatures, sorting]);

  const ongoingFeatures = sortedFeatures.filter(f => !isBacklogStatus(f.status));
  const backlogFeatures = sortedFeatures.filter(f => isBacklogStatus(f.status));

  return (
    <div className="grid gap-10">
      <section className="flex flex-col lg:flex-row lg:items-center gap-6 p-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
          <input
            className="w-full rounded-[2rem] border border-slate-200 bg-white py-5 pl-14 pr-6 text-base font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 shadow-sm"
            placeholder="Search by initiative name or strategic goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-2 text-slate-400">
            <Filter className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Filter By</span>
          </div>
          {FILTER_KEYS.map((filterItem) => (
            <div key={filterItem.key} className="relative">
              <select
                className="appearance-none rounded-2xl border border-slate-200 bg-white px-6 py-4 pr-12 text-xs font-bold text-slate-600 outline-none transition-all hover:border-indigo-300 hover:bg-slate-50 focus:ring-4 focus:ring-indigo-500/5 cursor-pointer shadow-sm"
                value={filters[filterItem.key]}
                onChange={(e) => setFilters(curr => ({ ...curr, [filterItem.key]: e.target.value }))}
              >
                <option value="">{filterItem.label}: All</option>
                {filterOptions[filterItem.key].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
            </div>
          ))}
        </div>
      </section>

      <SectionTable
        title="Active Strategic Bets"
        subtitle={`${ongoingFeatures.length} initiatives in execution or review`}
        features={ongoingFeatures}
        sorting={sorting}
        onSortChange={(key) => onSortingChange({ key, direction: sorting.key === key && sorting.direction === 'desc' ? 'asc' : 'desc' })}
        onStatusChange={onStatusChange}
        onEditFeature={onEditFeature}
        onAddComment={onAddComment}
        collapsed={false}
        canCollapse={false}
      />

      <SectionTable
        title="Future Pipeline"
        subtitle={`${backlogFeatures.length} opportunities for future consideration`}
        features={backlogFeatures}
        sorting={sorting}
        onSortChange={(key) => onSortingChange({ key, direction: sorting.key === key && sorting.direction === 'desc' ? 'asc' : 'desc' })}
        onStatusChange={onStatusChange}
        onEditFeature={onEditFeature}
        onAddComment={onAddComment}
        collapsed={isBacklogCollapsed}
        onToggleCollapsed={() => setIsBacklogCollapsed(!isBacklogCollapsed)}
      />
    </div>
  );
}
