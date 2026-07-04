function toTimestamp(value) {
  if (!value) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

export function getDisplayJobStatus(job) {
  const rawStatus = String(job?.statusValue || job?.raw?.status || job?.status || '').toLowerCase();
  const uiStatus = String(job?.status || '').toLowerCase();
  const end = toTimestamp(job?.raw?.endDate) || toTimestamp(job?.endDateInput) || toTimestamp(job?.endDate);
  const start =
    toTimestamp(job?.raw?.startDate) || toTimestamp(job?.startDateInput) || toTimestamp(job?.startDate);
  const now = Date.now();

  if (rawStatus === 'closed' || uiStatus === 'closed') return 'closed';
  if (end && end < now) return 'closed';
  if (rawStatus === 'scheduled' || uiStatus === 'scheduled') {
    return !start || start > now ? 'scheduled' : 'active';
  }
  return 'active';
}
