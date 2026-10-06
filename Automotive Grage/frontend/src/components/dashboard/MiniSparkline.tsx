import React, { useState } from 'react';

export interface MiniSparklineProps {
  data: number[];
  color?: string;
  fillColor?: string;
  height?: number;
  width?: number | string;
  showEndDot?: boolean;
  labels?: string[];
  unit?: string;
  className?: string;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color = '#1B4D3E',
  fillColor,
  height = 28,
  width = '100%',
  showEndDot = true,
  labels = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Yest', 'Today'],
  unit = '',
  className = ''
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return null;
  }

  const svgWidth = 100;
  const svgHeight = height;
  const paddingX = 4;
  const paddingY = 4;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  // Compute point coordinates
  const points = data.map((val, index) => {
    const x = paddingX + (index / (data.length - 1)) * (svgWidth - paddingX * 2);
    // Invert y: high values near top (paddingY), low values near bottom (svgHeight - paddingY)
    const normalized = (val - minVal) / range;
    const y = svgHeight - paddingY - normalized * (svgHeight - paddingY * 2);
    return { x, y, val };
  });

  // Build smooth cubic bezier curve
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  // Build area fill path
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaD = `${pathD} L ${lastPoint.x} ${svgHeight} L ${firstPoint.x} ${svgHeight} Z`;

  // Unique gradient ID
  const gradientId = `sparkline-grad-${color.replace('#', '')}-${Math.abs(minVal + maxVal)}`;

  return (
    <div className={`relative flex flex-col justify-end ${className}`} style={{ width, height: svgHeight + 2 }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fillColor || color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={fillColor || color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Shaded Area */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Trend Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover / Point Interactive targets */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoveredIndex === idx ? 3.5 : 2}
            className="cursor-pointer transition-all duration-150"
            fill={hoveredIndex === idx ? color : '#FFFFFF'}
            stroke={color}
            strokeWidth={hoveredIndex === idx ? 2 : 1.5}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* Active End Dot */}
        {showEndDot && hoveredIndex === null && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="2.5"
            fill={color}
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {/* Tooltip on hover */}
      {hoveredIndex !== null && (
        <div
          className="absolute -top-7 transform -translate-x-1/2 pointer-events-none z-20 whitespace-nowrap rounded bg-[#202321] px-1.5 py-0.5 text-[9px] font-mono font-medium text-white shadow-md transition-opacity duration-150"
          style={{
            left: `${(points[hoveredIndex].x / svgWidth) * 100}%`
          }}
        >
          <span>{labels[hoveredIndex] ? `${labels[hoveredIndex]}: ` : ''}</span>
          <span className="font-bold">
            {unit ? `${unit} ` : ''}
            {points[hoveredIndex].val >= 1000
              ? points[hoveredIndex].val.toLocaleString()
              : points[hoveredIndex].val}
          </span>
        </div>
      )}
    </div>
  );
};
