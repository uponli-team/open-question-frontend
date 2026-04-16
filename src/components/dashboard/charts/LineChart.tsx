import * as React from "react";

export default function LineChart({
  data,
  height = 120,
}: {
  data: number[];
  height?: number;
}) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = 40 + (i * 420) / Math.max(data.length - 1, 1);
    const y = 80 - (v / max) * 60;
    return { x, y };
  });

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 520 120"
        width="100%"
        height={height}
        role="img"
        aria-label="Line chart"
      >
        {[20, 40, 60, 80].map((p) => (
          <line
            key={p}
            x1="40"
            x2="480"
            y1={80 - (p / 100) * 60}
            y2={80 - (p / 100) * 60}
            stroke="#e5e7eb"
            strokeDasharray="4 6"
            strokeWidth="1"
          />
        ))}

        <path d={d} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <path
          d={`${d} L ${points[points.length - 1]?.x ?? 480} 90 L ${points[0]?.x ?? 40} 90 Z`}
          fill="#10b981"
          opacity="0.08"
        />

        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#34d399" stroke="#10b981" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
}

