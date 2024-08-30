export function getUsageDetailsQueryDates() {
  const d = new Date();
  d.setDate(d.getDate() - 1);

  return { usageEnd: new Date().toISOString(), usageStart: d.toISOString() };
}
