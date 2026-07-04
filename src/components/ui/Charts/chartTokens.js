/**
 * Chart color tokens are expressed as CSS variables so light/dark mode updates
 * are applied automatically without reloading modules.
 */
export const CHART_BRAND = 'var(--chart-brand)';
export const CHART_BRAND_SOFT = 'var(--chart-brand-soft)';
export const CHART_BRAND_STRONG = 'var(--chart-brand-strong)';
export const CHART_SUCCESS = 'var(--chart-success)';
export const CHART_WARNING = 'var(--chart-warning)';
export const CHART_DANGER = 'var(--chart-danger)';
export const CHART_INFO = 'var(--chart-info)';

export const CHART_PALETTE = [
  'var(--chart-brand-1)',
  'var(--chart-brand-2)',
  'var(--chart-brand-3)',
  'var(--chart-brand-4)',
  'var(--chart-brand-5)',
  'var(--chart-brand-6)',
];

/**
 * Maps a numeric score to the nearest tokenized tint.
 * Higher values map to stronger brand colors.
 */
export const getValueColor = (value, max = 100) => {
  const lastIndex = CHART_PALETTE.length - 1;
  if (lastIndex <= 0 || max <= 0) return CHART_PALETTE[lastIndex] || CHART_BRAND;

  const t = Math.max(0, Math.min(1, value / max));
  const index = Math.round((1 - t) * lastIndex);
  return CHART_PALETTE[index];
};

export const CHART_BAR_NEUTRAL = 'var(--chart-bar-neutral)';
export const CHART_GRID = 'var(--chart-grid)';
export const CHART_AXIS_X = 'var(--chart-axis-x)';
export const CHART_AXIS_Y = 'var(--chart-axis-y)';
export const CHART_CURSOR = 'var(--chart-cursor)';
