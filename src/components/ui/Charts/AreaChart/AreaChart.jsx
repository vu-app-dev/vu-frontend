import { memo, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_AXIS_X, CHART_AXIS_Y, CHART_BRAND, CHART_CURSOR, CHART_GRID } from '../chartTokens';
import './AreaChart.css';

const GRADIENT_ID = 'area-chart-gradient';
const STROKE_COLOR = CHART_BRAND;

/** Custom tooltip */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="area-chart__tooltip">
      <span className="area-chart__tooltip-label">{label}</span>
      {payload.map((entry, i) => (
        <span key={i} className="area-chart__tooltip-value">
          <span className="area-chart__tooltip-dot" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value}
        </span>
      ))}
    </div>
  );
}

/** Custom axis tick */
function CustomTick({ x, y, payload, anchor = 'middle' }) {
  return (
    <text
      x={x}
      y={y + 12}
      textAnchor={anchor}
      fill={CHART_AXIS_X}
      fontSize={11}
      fontFamily="Inter, sans-serif"
    >
      {payload.value}
    </text>
  );
}

function CustomYTick({ x, y, payload }) {
  return (
    <text
      x={x - 8}
      y={y + 4}
      textAnchor="end"
      fill={CHART_AXIS_Y}
      fontSize={11}
      fontFamily="Inter, sans-serif"
    >
      {payload.value}
    </text>
  );
}

const EMPTY_DATA = [];
const DEFAULT_DATA_KEYS = [{ key: 'value', label: 'Value', color: STROKE_COLOR }];

export const AreaChart = memo(function AreaChart({
  title,
  data = EMPTY_DATA,
  dataKeys = DEFAULT_DATA_KEYS,
  xKey = 'label',
  className = '',
  density = 'default',
  animated = true,
}) {
  const [activeKey, setActiveKey] = useState(null);

  const handleLegendEnter = useCallback((key) => setActiveKey(key), []);
  const handleLegendLeave = useCallback(() => setActiveKey(null), []);

  const gradients = useMemo(
    () =>
      dataKeys.map((dk, i) => ({
        id: `${GRADIENT_ID}-${i}`,
        color: dk.color || STROKE_COLOR,
      })),
    [dataKeys]
  );

  return (
    <div
      className={['area-chart', density === 'compact' && 'area-chart--compact', className]
        .filter(Boolean)
        .join(' ')}
    >
      {title && <h3 className="area-chart__title">{title}</h3>}
      {title && <div className="area-chart__divider" />}

      {/* Legend */}
      {dataKeys.length > 1 && (
        <div className="area-chart__legend">
          {dataKeys.map((dk) => (
            <div
              key={dk.key}
              className={[
                'area-chart__legend-item',
                activeKey && activeKey !== dk.key && 'area-chart__legend-item--dimmed',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => handleLegendEnter(dk.key)}
              onMouseLeave={handleLegendLeave}
            >
              <span
                className="area-chart__legend-dot"
                style={{ backgroundColor: dk.color || STROKE_COLOR }}
              />
              <span className="area-chart__legend-label">{dk.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="area-chart__body">
        <ResponsiveContainer width="100%" height={240}>
          <RechartsArea data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              {gradients.map((g) => (
                <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={g.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={g.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} tick={<CustomTick />} axisLine={false} tickLine={false} />
            <YAxis tick={<CustomYTick />} axisLine={false} tickLine={false} />
            <Tooltip
              content={<ChartTooltip />}
              isAnimationActive={false}
              wrapperStyle={{ outline: 'none', pointerEvents: 'none', zIndex: 10 }}
              allowEscapeViewBox={{ x: true, y: true }}
              cursor={{ stroke: CHART_CURSOR, strokeWidth: 1 }}
            />
            {dataKeys.map((dk, i) => (
              <Area
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.label}
                stroke={dk.color || STROKE_COLOR}
                strokeWidth={activeKey && activeKey !== dk.key ? 1 : 2}
                fill={`url(#${gradients[i].id})`}
                fillOpacity={activeKey && activeKey !== dk.key ? 0.3 : 1}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: dk.color || STROKE_COLOR,
                  stroke: 'var(--bg-card)',
                  strokeWidth: 2,
                }}
                isAnimationActive={animated}
                animationDuration={800}
                animationEasing="ease-out"
              />
            ))}
          </RechartsArea>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

AreaChart.propTypes = {
  title: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.object),
  dataKeys: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ),
  xKey: PropTypes.string,
  className: PropTypes.string,
  density: PropTypes.oneOf(['default', 'compact']),
  animated: PropTypes.bool,
};
