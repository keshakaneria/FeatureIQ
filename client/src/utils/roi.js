function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// The ROI score is intentionally centralized here so PMs can tune the weights
// later without touching the rest of the UI. The inputs are normalized against
// pragmatic MVP ranges instead of historic data because that data does not
// exist yet for a new product portfolio.
export function calculateRoiScore(metrics) {
  const monthlyNetSavings = toNumber(metrics.monthlyNetSavings);
  const yearlyNetSavings = toNumber(metrics.yearlyNetSavings);
  const breakevenMonths = toNumber(metrics.breakevenMonths);
  const opportunityCost = toNumber(metrics.opportunityCost);
  const revenueLossPerMonth = toNumber(metrics.revenueLossPerMonth);

  const monthlyScore = clamp(monthlyNetSavings / 50000, 0, 1);
  const yearlyScore = clamp(yearlyNetSavings / 600000, 0, 1);
  const breakevenScore =
    monthlyNetSavings <= 0 || !Number.isFinite(breakevenMonths)
      ? 0
      : clamp((24 - breakevenMonths) / 24, 0, 1);
  const opportunityScore = clamp(opportunityCost / 250000, 0, 1);
  const revenueLossScore = clamp(revenueLossPerMonth / 50000, 0, 1);

  const weightedScore =
    monthlyScore * 0.35 +
    yearlyScore * 0.2 +
    breakevenScore * 0.25 +
    opportunityScore * 0.1 +
    revenueLossScore * 0.1;

  return clamp(1 + weightedScore * 4, 1, 5);
}

export function calculateFeatureMetrics(feature) {
  const implementationCost =
    toNumber(feature.resourceCount) *
    toNumber(feature.estimatedDays) *
    8 *
    toNumber(feature.baseHourlyRate);
  const monthlyOperationalCostAfter =
    toNumber(feature.monthlyMaintenanceCost) + toNumber(feature.monthlyCloudCost);

  const monthlyManualHoursBefore =
    toNumber(feature.manualHoursBefore) * toNumber(feature.processesPerMonth);
  const monthlyManualCostBefore =
    monthlyManualHoursBefore *
    toNumber(feature.resourcesBefore) *
    toNumber(feature.hourlyCostBefore);

  const monthlyAutomatedHoursAfter =
    toNumber(feature.automatedHoursAfter) * toNumber(feature.processesPerMonth);
  const monthlyAutomatedCostAfter =
    monthlyAutomatedHoursAfter *
    toNumber(feature.resourcesAfter) *
    toNumber(feature.hourlyCostAfter);

  const monthlyHoursSaved = monthlyManualHoursBefore - monthlyAutomatedHoursAfter;
  const monthlyNetSavings =
    monthlyManualCostBefore - monthlyAutomatedCostAfter - monthlyOperationalCostAfter;
  const yearlyHoursSaved = monthlyHoursSaved * 12;
  const yearlyNetSavings = monthlyNetSavings * 12;
  const breakevenMonths =
    monthlyNetSavings > 0 ? implementationCost / monthlyNetSavings : Number.POSITIVE_INFINITY;
  const timeSavedPerProcess =
    toNumber(feature.manualHoursBefore) - toNumber(feature.automatedHoursAfter);
  const costSavedPerProcess =
    toNumber(feature.manualHoursBefore) * toNumber(feature.hourlyCostBefore) -
    toNumber(feature.automatedHoursAfter) * toNumber(feature.hourlyCostAfter);

  const roiScore = calculateRoiScore({
    monthlyNetSavings,
    yearlyNetSavings,
    breakevenMonths,
    opportunityCost: feature.opportunityCost,
    revenueLossPerMonth: feature.revenueLossPerMonth
  });

  return {
    implementationCost,
    monthlyOperationalCostAfter,
    monthlyManualHoursBefore,
    monthlyManualCostBefore,
    monthlyAutomatedHoursAfter,
    monthlyAutomatedCostAfter,
    monthlyHoursSaved,
    monthlyNetSavings,
    yearlyHoursSaved,
    yearlyNetSavings,
    breakevenMonths,
    timeSavedPerProcess,
    costSavedPerProcess,
    roiScore
  };
}
