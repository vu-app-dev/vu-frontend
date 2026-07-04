import { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  RadialBarChart as RechartsRadialBar,
  RadialBar,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_PALETTE, CHART_GRID } from '../chartTokens';
import './RadialBarChart.css';

const DEFAULT_COLORS = CHART_PALETTE;
const EMPTY_DATA = [];

export const RadialBarChart = memo(function RadialBarChart({
  title,
  data = EMPTY_DATA,
  colors = DEFAULT_COLORS,
  className = '',
  density = 'default',
  animated = true,
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  // Scale by max value so largest ring fills ~80%, not by total (which made large rings dominate)
  const chartData = useMemo(() => {
    const maxVal = Math.max(...data.map((d) => d.value), 1);
    return data
      .map((d, i) => ({
        label: d.label,
        count: d.value,
        percentage: total > 0 ? (d.value / total) * 100 : 0,
        value: (d.value / maxVal) * 80,
        fill: colors[i % colors.length],
      }))
      .reverse();
  }, [data, total, colors]);

  const activeSegment = useMemo(() => {
    if (activeIndex === null) return null;
    return chartData[activeIndex];
  }, [activeIndex, chartData]);

  return (
    <div
      className={[
        'radial-bar-chart',
        density === 'compact' && 'radial-bar-chart--compact',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {title && <h3 className="radial-bar-chart__title">{title}</h3>}
      {title && <div className="radial-bar-chart__divider" />}

      <div className="radial-bar-chart__content">
        {/* Legend */}
        <div className="radial-bar-chart__legend">
          {data.map((item, index) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            const chartIdx = data.length - 1 - index;
            return (
              <div
                key={index}
                className={[
                  'radial-bar-chart__legend-item',
                  activeIndex === chartIdx && 'radial-bar-chart__legend-item--active',
                  activeIndex !== null &&
                    activeIndex !== chartIdx &&
                    'radial-bar-chart__legend-item--dimmed',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setActiveIndex(chartIdx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <span
                  className="radial-bar-chart__legend-dot"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="radial-bar-chart__legend-label">{item.label}</span>
                <span className="radial-bar-chart__legend-count">{item.value}</span>
                <span className="radial-bar-chart__legend-pct">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>

        {/* Radial Bar Chart */}
        <div className="radial-bar-chart__visual">
          <ResponsiveContainer width={200} height={200}>
            <RechartsRadialBar
              innerRadius="30%"
              outerRadius="95%"
              data={chartData}
              startAngle={90}
              endAngle={-270}
              barSize={10}
            >
              <RadialBar
                background={{ fill: CHART_GRID }}
                dataKey="value"
                cornerRadius={5}
                isAnimationActive={animated}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    cursor="pointer"
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  />
                ))}
              </RadialBar>
            </RechartsRadialBar>
          </ResponsiveContainer>

          {/* Center value */}
          <div className="radial-bar-chart__center">
            <span className="radial-bar-chart__center-value">
              {activeSegment ? activeSegment.count : total}
            </span>
            <span className="radial-bar-chart__center-label">
              {activeSegment ? `${activeSegment.percentage.toFixed(0)}%` : 'Total'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

RadialBarChart.propTypes = {
  title: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ),
  colors: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  density: PropTypes.oneOf(['default', 'compact']),
  animated: PropTypes.bool,
};
