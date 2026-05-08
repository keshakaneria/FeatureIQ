import { BACKLOG_STATUSES, ONGOING_STATUSES } from "../constants";
import { calculateFeatureMetrics } from "./roi";

export function isBacklogStatus(status) {
  return BACKLOG_STATUSES.includes(status);
}

export function isOngoingStatus(status) {
  return ONGOING_STATUSES.includes(status);
}

export function enrichFeature(feature) {
  const metrics = calculateFeatureMetrics(feature);
  const createdAt = feature.createdAt || new Date().toISOString();
  const isNew = Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;

  return {
    ...feature,
    ...metrics,
    createdAt,
    isNew,
    comments: feature.comments || []
  };
}

export function aggregateProductSummary(features) {
  return features.reduce(
    (summary, feature) => {
      const enriched = enrichFeature(feature);

      if (isOngoingStatus(enriched.status)) {
        summary.ongoingCount += 1;
      }

      if (isBacklogStatus(enriched.status)) {
        summary.backlogCount += 1;
      }

      summary.totalMonthlyHoursSaved += enriched.monthlyHoursSaved;
      summary.totalMonthlyNetSavings += enriched.monthlyNetSavings;
      summary.totalUsersImpacted += Number(enriched.usersImpacted || 0);

      return summary;
    },
    {
      ongoingCount: 0,
      backlogCount: 0,
      totalMonthlyHoursSaved: 0,
      totalMonthlyNetSavings: 0,
      totalUsersImpacted: 0
    }
  );
}

function compareValues(left, right, direction) {
  if (left === right) {
    return 0;
  }

  if (left === undefined || left === null || left === "") {
    return 1;
  }

  if (right === undefined || right === null || right === "") {
    return -1;
  }

  const factor = direction === "asc" ? 1 : -1;
  return left > right ? factor : -factor;
}

export function sortFeatures(features, sorting) {
  const sorted = [...features];

  sorted.sort((left, right) => {
    if (sorting.key === "rank") {
      return compareValues(left.roiScore, right.roiScore, "desc");
    }

    return compareValues(left[sorting.key], right[sorting.key], sorting.direction);
  });

  return sorted.map((feature, index) => ({
    ...feature,
    rank: index + 1
  }));
}

export function filterFeatures(features, filters, searchTerm) {
  const term = searchTerm.trim().toLowerCase();

  return features.filter((feature) => {
    const matchesSearch =
      !term ||
      feature.name.toLowerCase().includes(term) ||
      feature.description.toLowerCase().includes(term);

    const matchesStatus = !filters.status || feature.status === filters.status;
    const matchesPillar =
      !filters.strategicPillar || feature.strategicPillar === filters.strategicPillar;
    const matchesRisk = !filters.riskLevel || feature.riskLevel === filters.riskLevel;
    const matchesOwner = !filters.owner || feature.owner === filters.owner;

    return matchesSearch && matchesStatus && matchesPillar && matchesRisk && matchesOwner;
  });
}
