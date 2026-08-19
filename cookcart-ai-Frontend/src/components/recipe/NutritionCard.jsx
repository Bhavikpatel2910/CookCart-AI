export default function NutritionCard({ nutrition, className = '' }) {
  const rows = [
    { label: 'Calories', value: nutrition?.calories, unit: 'kcal' },
    { label: 'Protein', value: nutrition?.protein, unit: 'g' },
    { label: 'Carbs', value: nutrition?.carbs, unit: 'g' },
    { label: 'Fat', value: nutrition?.fat, unit: 'g' },
    { label: 'Fiber', value: nutrition?.fiber, unit: 'g' },
  ].filter((row) => row.value != null)

  return (
    <div className={`grid ${rows.length > 1 ? 'grid-cols-5' : 'grid-cols-1'} divide-x divide-border-light bg-surface-container-lowest rounded-2xl shadow-card-soft ${className}`}>
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col items-center gap-0.5 px-2 py-5 text-center">
          <span className="font-display text-headline-md text-on-surface font-bold leading-none">
            {row.value}
            <span className="text-label-sm text-on-surface-variant font-normal ml-0.5">
              {row.unit}
            </span>
          </span>
          <span className="text-label-sm text-on-surface-variant">{row.label}</span>
        </div>
      ))}
    </div>
  )
}
