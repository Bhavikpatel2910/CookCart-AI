import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sparkles } from 'lucide-react'

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search for products or dishes',
  size = 'md',
  className = '',
}) {
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    const query = value?.trim()
    if (onSubmit) {
      onSubmit(query)
      return
    }
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full bg-surface-container-lowest border border-border-light shadow-soft flex items-center px-4 gap-3 focus-within:border-success-veg transition-colors ${
        size === 'lg' ? 'h-16 rounded-[20px]' : 'h-14 rounded-[20px]'
      } ${className}`}
    >
      <Search size={size === 'lg' ? 24 : 20} className="text-on-surface-variant shrink-0" />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        type="text"
        placeholder={placeholder}
        className="flex-grow bg-transparent border-none outline-none text-body-md text-on-surface placeholder:text-on-surface-variant focus:ring-0 min-w-0"
        aria-label="Search"
      />
      <div className="flex items-center gap-2 pl-3 border-l border-border-light">
        <button
          type="submit"
          aria-label="Search"
          className="hidden sm:inline-flex items-center gap-1.5 bg-success-veg text-white text-label-sm font-semibold px-4 py-2 rounded-xl hover:bg-secondary hover:shadow-glow-green transition-all active:scale-95"
        >
          <Sparkles size={14} />
          Create Recipe
        </button>
      </div>
    </form>
  )
}
