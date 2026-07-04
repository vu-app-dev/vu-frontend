import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useMemo } from 'react';
import {
  CHART_BRAND,
  CHART_BAR_NEUTRAL,
  CHART_AXIS_X,
  CHART_AXIS_Y,
  CHART_GRID,
} from '../chartTokens';
import './BarChart.css';

/* Custom Tooltip */
function ChartTooltip({ active, payload, label, barColor }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bar-chart__tooltip">
      <span className="bar-chart__tooltip-label">{label}</span>
      {payload.map((entry, i) => (
        <span key={i} className="bar-chart__tooltip-value">
          <span
            className="bar-chart__tooltip-dot"
            style={{ backgroundColor: barColor || entry.color || entry.fill }}
          />
          {entry.name}: {entry.value}
        </span>
      ))}
    </div>
  );
}

/* Custom X Tick — wraps long labels into 2 lines */
function CustomXTick({ x, y, payload }) {
  const text = payload.value;
  const words = text.split(' ');
  let lines;

  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  } else if (text.length > 10) {
    lines = [text.slice(0, Math.ceil(text.length / 2)), text.slice(Math.ceil(text.length / 2))];
  } else {
    lines = [text];
  }

  return (
    <text
      x={x}
      y={y + 12}
      textAnchor="middle"
      fill={CHART_AXIS_X}
      fontSize={11}
      fontFamily="Inter, sans-serif"
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 13}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

/* Custom Y Tick */
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
const DEFAULT_DATA_KEYS = [{ key: 'value', label: 'Value' }];

export const BarChart = memo(function BarChart({
  title,
  data = EMPTY_DATA,
  dataKeys = DEFAULT_DATA_KEYS,
  xKey = 'label',
  className = '',
  density = 'default',
  animated = true,
}) {
  const isMultiBar = dataKeys.length > 1;

  /* Index of the highest-value bar (accent highlight) */
  const maxIdx = useMemo(() => {
    if (!data.length || isMultiBar) return -1;
    const key = dataKeys[0].key;
    let best = -Infinity;
    let idx = 0;
    data.forEach((d, i) => {
      if (d[key] > best) {
        best = d[key];
        idx = i;
      }
    });
    return idx;
  }, [data, dataKeys, isMultiBar]);

  return (
    <div
      className={['bar-chart', density === 'compact' && 'bar-chart--compact', className]
        .filter(Boolean)
        .join(' ')}
    >
      {title && <h3 className="bar-chart__title">{title}</h3>}
      {title && <div className="bar-chart__divider" />}

      <div className="bar-chart__body">
        <ResponsiveContainer width="100%" height={240}>
          <RechartsBar
            data={data}
            margin={{ top: 8, right: 8, bottom: 14, left: -16 }}
            barCategoryGap="38%"
            maxBarSize={30}
          >
            <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} tick={<CustomXTick />} axisLine={false} tickLine={false} />
            <YAxis tick={<CustomYTick />} axisLine={false} tickLine={false} />
            <Tooltip
              content={(props) => {
                const idx = data.findIndex((d) => d[xKey] === props.label);
                const barColor =
                  !isMultiBar && idx >= 0
                    ? idx === maxIdx
                      ? CHART_BRAND
                      : CHART_BAR_NEUTRAL
                    : null;
                return <ChartTooltip {...props} barColor={barColor} />;
              }}
              cursor={{ fill: 'transparent' }}
              isAnimationActive={false}
              wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
            />

            {dataKeys.map((dk) => (
              <Bar
                key={dk.key}
                dataKey={dk.key}
                name={dk.label}
                fill={CHART_BAR_NEUTRAL}
                radius={[4, 4, 0, 0]}
                isAnimationActive={animated}
                animationDuration={800}
                animationEasing="ease-out"
                activeBar={{ fillOpacity: 1 }}
              >
                {!isMultiBar &&
                  data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index === maxIdx ? CHART_BRAND : CHART_BAR_NEUTRAL}
                      fillOpacity={0.7}
                    />
                  ))}
              </Bar>
            ))}
          </RechartsBar>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

BarChart.propTypes = {
  title: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.object),
  dataKeys: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  xKey: PropTypes.string,
  className: PropTypes.string,
  density: PropTypes.oneOf(['default', 'compact']),
  animated: PropTypes.bool,
};
