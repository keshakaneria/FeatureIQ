export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatHours(value) {
  return `${Number.isFinite(value) ? value.toFixed(1) : "0.0"} hrs`;
}

export function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatBreakeven(value) {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

  if (value <= 0) {
    return "Immediate";
  }

  return `${value.toFixed(1)} mo`;
}
