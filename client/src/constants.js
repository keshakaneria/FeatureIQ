export const ONGOING_STATUSES = [
  "TBD",
  "Approved (To Do)",
  "In Local UTDD",
  "In Dev UTDD",
  "In QA UTDD",
  "Released"
];

export const BACKLOG_STATUSES = ["Not Implemented", "Cancelled"];

export const ALL_STATUSES = [...ONGOING_STATUSES, ...BACKLOG_STATUSES];

export const STRATEGIC_PILLARS = [
  "Customer Experience",
  "Revenue Growth",
  "Operational Efficiency",
  "Risk & Compliance",
  "Platform Scale"
];

export const RISK_LEVELS = ["Low", "Medium", "High"];

export const DEFAULT_PRODUCT_NAME = "Core Product";

export const STATUS_STYLES = {
  TBD: "bg-slate-100 text-slate-500",
  "Approved (To Do)": "bg-sky-500 text-white shadow-sm",
  "In Local UTDD": "bg-violet-500 text-white shadow-sm",
  "In Dev UTDD": "bg-indigo-500 text-white shadow-sm",
  "In QA UTDD": "bg-orange-500 text-white shadow-sm",
  Released: "bg-emerald-500 text-white shadow-sm",
  "Not Implemented": "bg-slate-200 text-slate-600",
  Cancelled: "bg-rose-500 text-white shadow-sm"
};

export const SORTABLE_COLUMNS = [
  { key: "rank", label: "Rank" },
  { key: "name", label: "Feature Name" },
  { key: "roiScore", label: "ROI Score" },
  { key: "monthlyNetSavings", label: "Monthly Cost Saving" },
  { key: "monthlyHoursSaved", label: "Monthly Hours Saving" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Owner" },
  { key: "targetReleaseDate", label: "Target Release Date" },
  { key: "riskLevel", label: "Risk Level" }
];

export const CUSTOMER_SEGMENTS = [
  "Internal Operations",
  "End Customers",
  "Enterprise Partners",
  "Small Business Owners",
  "Executive Team",
  "Product Managers",
  "Developers"
];

export const EMPTY_FEATURE = {
  name: "",
  description: "",
  owner: "",
  status: "TBD",
  targetReleaseDate: "",
  strategicPillar: STRATEGIC_PILLARS[0],
  riskLevel: "Medium",
  resourceCount: 0,
  estimatedDays: 0,
  baseHourlyRate: 0,
  monthlyMaintenanceCost: 0,
  monthlyCloudCost: 0,
  manualHoursBefore: 0,
  resourcesBefore: 0,
  hourlyCostBefore: 0,
  automatedHoursAfter: 0,
  resourcesAfter: 0,
  hourlyCostAfter: 0,
  processesPerMonth: 0,
  opportunityCost: 0,
  revenueLossPerMonth: 0,
  notes: "",
  customerSegment: CUSTOMER_SEGMENTS[0],
  dependencies: "",
  usersImpacted: 0
};
