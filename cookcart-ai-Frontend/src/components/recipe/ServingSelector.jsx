import { useRecipe } from '../../hooks/useRecipe.js'

export default function ServingSelector({ className = '' }) {
  const { servings, setServings, servingOptions } = useRecipe()

  return (
    <div
      className={`flex bg-surface-container-low rounded-xl p-1 w-full ${className}`}
      role="tablist"
      aria-label="Select servings"
    >
      {servingOptions.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={servings === option}
          onClick={() => setServings(option)}
          className={`flex-1 py-2 text-label-md font-semibold rounded-lg transition-all duration-200 ${
            servings === option
              ? 'bg-surface shadow-sm text-on-surface border border-border-light'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
