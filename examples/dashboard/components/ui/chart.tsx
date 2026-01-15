"use client";

import { type ComponentRenderProps } from "@json-render/react";
import { useData } from "@json-render/react";
import { getByPath } from "@json-render/core";
import { useRef, useState, useEffect } from "react";

interface ChartProps {
  type?: "bar" | "line" | "pie" | "area";
  title?: string | null;
  dataPath: string;
  height?: number;
}

interface ChartDataItem {
  label: string;
  value: number;
}

// 颜色调色板
const COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
];

// 自适应容器 Hook
function useContainerWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return { containerRef, width };
}

// 柱状图组件
function BarChart({ data, height }: { data: ChartDataItem[]; height: number }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const barAreaHeight = height - 50; // 预留空间给数值和标签

  return (
    <div style={{ width: "100%" }}>
      {/* 数值行 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: "center",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            {d.value}
          </div>
        ))}
      </div>

      {/* 柱状图区域 - 固定高度 */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          height: barAreaHeight,
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 60,
                height: Math.max((d.value / maxValue) * barAreaHeight, 4),
                background: COLORS[i % COLORS.length],
                borderRadius: "4px 4px 0 0",
              }}
            />
          </div>
        ))}
      </div>

      {/* 标签行 */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: "center",
              fontSize: 11,
              color: "var(--muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// 饼图组件
function PieChart({
  data,
  height,
  width,
}: {
  data: ChartDataItem[];
  height: number;
  width: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // 响应式尺寸：根据容器宽度调整
  const isCompact = width < 400;
  const pieSize = isCompact
    ? Math.min(height - 20, width - 20, 150)
    : Math.min(height, 180);

  // 计算每个扇形的角度
  let cumulativeAngle = 0;
  const segments = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...d,
      startAngle,
      angle,
      color: COLORS[i % COLORS.length],
      percentage: ((d.value / total) * 100).toFixed(1),
    };
  });

  // 生成 SVG 扇形路径
  const createArcPath = (startAngle: number, angle: number, radius: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((startAngle + angle - 90) * Math.PI) / 180;

    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isCompact ? "column" : "row",
        gap: isCompact ? 16 : 24,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <svg
        width={pieSize}
        height={pieSize}
        viewBox={`0 0 ${pieSize} ${pieSize}`}
        style={{ flexShrink: 0 }}
      >
        {segments.map((seg, i) => (
          <path
            key={i}
            d={createArcPath(seg.startAngle, seg.angle, pieSize / 2)}
            fill={seg.color}
            stroke="var(--card)"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flexWrap: "wrap",
          maxHeight: isCompact ? "none" : height,
        }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: seg.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "var(--foreground)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {seg.label}
            </span>
            <span
              style={{ fontSize: 12, color: "var(--muted)", flexShrink: 0 }}
            >
              {seg.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 折线图组件
function LineChart({
  data,
  height,
  width,
}: {
  data: ChartDataItem[];
  height: number;
  width: number;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const chartWidth = Math.max(width, 200);
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1 || 1)) * innerWidth,
    y: padding.top + innerHeight - ((d.value - minValue) / range) * innerHeight,
    ...d,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // 计算合适的标签间隔
  const labelInterval = Math.ceil(data.length / Math.floor(innerWidth / 50));

  return (
    <svg
      width="100%"
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      {/* Y轴网格线 */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <g key={ratio}>
          <line
            x1={padding.left}
            y1={padding.top + innerHeight * (1 - ratio)}
            x2={chartWidth - padding.right}
            y2={padding.top + innerHeight * (1 - ratio)}
            stroke="var(--border)"
            strokeDasharray="4"
          />
          <text
            x={padding.left - 8}
            y={padding.top + innerHeight * (1 - ratio) + 4}
            textAnchor="end"
            fill="var(--muted)"
            fontSize="10"
          >
            {Math.round(minValue + range * ratio)}
          </text>
        </g>
      ))}

      {/* 折线 */}
      <path d={pathD} fill="none" stroke={COLORS[0]} strokeWidth="2" />

      {/* 数据点和标签 */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={COLORS[0]} />
          {i % labelInterval === 0 && (
            <text
              x={p.x}
              y={chartHeight - 8}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize="10"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// 面积图组件
function AreaChart({
  data,
  height,
  width,
}: {
  data: ChartDataItem[];
  height: number;
  width: number;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = 0;
  const range = maxValue - minValue || 1;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const chartWidth = Math.max(width, 200);
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1 || 1)) * innerWidth,
    y: padding.top + innerHeight - ((d.value - minValue) / range) * innerHeight,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1]?.x || padding.left} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`;

  // 计算合适的标签间隔
  const labelInterval = Math.ceil(data.length / Math.floor(innerWidth / 50));

  return (
    <svg
      width="100%"
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      {/* Y轴网格线 */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <g key={ratio}>
          <line
            x1={padding.left}
            y1={padding.top + innerHeight * (1 - ratio)}
            x2={chartWidth - padding.right}
            y2={padding.top + innerHeight * (1 - ratio)}
            stroke="var(--border)"
            strokeDasharray="4"
          />
          <text
            x={padding.left - 8}
            y={padding.top + innerHeight * (1 - ratio) + 4}
            textAnchor="end"
            fill="var(--muted)"
            fontSize="10"
          >
            {Math.round(minValue + range * ratio)}
          </text>
        </g>
      ))}

      {/* 面积 */}
      <path d={areaPath} fill={COLORS[0]} fillOpacity="0.2" />

      {/* 折线 */}
      <path d={linePath} fill="none" stroke={COLORS[0]} strokeWidth="2" />

      {/* 数据点和标签 */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={COLORS[0]} />
          {i % labelInterval === 0 && (
            <text
              x={p.x}
              y={chartHeight - 8}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize="10"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function Chart({ element }: ComponentRenderProps) {
  const {
    type = "bar",
    title,
    dataPath,
    height = 200,
  } = element.props as ChartProps;
  const { data } = useData();
  const chartData = getByPath(data, dataPath) as ChartDataItem[] | undefined;
  const { containerRef, width } = useContainerWidth();

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>
        暂无数据
      </div>
    );
  }

  const renderChart = () => {
    if (width === 0) return null; // 等待容器宽度计算完成

    switch (type) {
      case "pie":
        return <PieChart data={chartData} height={height} width={width} />;
      case "line":
        return <LineChart data={chartData} height={height} width={width} />;
      case "area":
        return <AreaChart data={chartData} height={height} width={width} />;
      case "bar":
      default:
        return <BarChart data={chartData} height={height} />;
    }
  };

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {title && (
        <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>
          {title}
        </h4>
      )}
      {renderChart()}
    </div>
  );
}
