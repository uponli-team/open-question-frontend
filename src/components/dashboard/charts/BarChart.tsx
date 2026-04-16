import * as React from "react";

type BarDatum = { label: string; value: number };

export default function BarChart({
  data,
  height = 140,
}: {
  data: BarDatum[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const bars = data.map((d) => ({
    ...d,
    h: (d.value / max) * 100,
  }));

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 520 180"
        width="100%"
        height={height}
        role="img"
        aria-label="Bar chart"
      >
        {/* Grid */}
        {[20, 40, 60, 80].map((p) => (
          <line
            key={p}
            x1="60"
            x2="500"
            y1={160 - (p / 100) * 120}
            y2={160 - (p / 100) * 120}
            stroke="#e5e7eb"
            strokeDasharray="4 6"
            strokeWidth="1"
          />
        ))}

        {/* Bars */}
        {bars.map((d, i) => {
          const barW = 60;
          const gap = 10;
          const x = 70 + i * (barW + gap);
          const barH = (d.h / 100) * 120;
          const y = 160 - barH;
          const rx = 10;
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={rx}
                fill="#10b981"
                opacity="0.9"
              />
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.min(barH, 10)}
                rx={rx}
                fill="#34d399"
                opacity="0.55"
              />
              <text
                x={x + barW / 2}
                y={176}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Axis */}
        <line x1="60" x2="500" y1="160" y2="160" stroke="#d1d5db" strokeWidth="1" />
      </svg>
    </div>
  );
}

