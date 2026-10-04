export function ProgressRing({ value, size = 18 }: { value: number; size?: number }) {
  const stroke = 2.5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const complete = value >= 1
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill={complete ? 'rgb(16 185 129)' : 'none'} stroke={complete ? 'rgb(16 185 129)' : 'currentColor'} strokeWidth={stroke} className="text-slate-200 dark:text-slate-700" />
      {!complete && value > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(99 102 241)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
      {complete && <path d={`M${size * 0.3} ${size * 0.52} l${size * 0.14} ${size * 0.14} l${size * 0.26} -${size * 0.3}`} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}
