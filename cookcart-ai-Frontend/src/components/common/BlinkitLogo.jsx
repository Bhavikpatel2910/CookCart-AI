import { Zap } from 'lucide-react'

export default function BlinkitLogo({ size = 28, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[28%] bg-[#067A2E] text-white shadow-sm shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Zap size={size * 0.62} strokeWidth={2.4} fill="currentColor" />
    </span>
  )
}
