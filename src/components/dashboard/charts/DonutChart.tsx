import * as React from "react";

export default function DonutChart({
  value,
  label,
}: {
  value: number; // 0..100
  label: string;
}) {
  const safe = Math.max(0, Math.min(100, value));
  const stroke = 10;
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (safe / 100) * c;
  const gap = c - dash;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={`${label} donut`}>
        <circle cx="42" cy="42" r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx="42"
          cy="42"
          r={r}
          stroke="#10b981"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          transform="rotate(-90 42 42)"
          strokeLinecap="round"
        />
        <text x="42" y="47" textAnchor="middle" fontSize="18" fill="#0f172a" fontWeight={700}>
          {safe}%
        </text>
      </svg>
      <div className="text-xs font-medium text-zinc-600">{label}</div>
    </div>
  );
}

