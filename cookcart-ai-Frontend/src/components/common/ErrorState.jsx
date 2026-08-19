import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function ErrorState({ message = 'Something went wrong.', onRetry, onBack }) {
  return <div className="bg-surface rounded-2xl border border-error/20 p-10 text-center flex flex-col items-center">
    <span className="w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-4"><AlertTriangle size={28} /></span>
    <h2 className="font-display text-2xl font-bold text-on-surface">We hit a snag</h2>
    <p className="text-body-md text-on-surface-variant mt-2 mb-6">{message}</p>
    <div className="flex gap-3"><button type="button" onClick={onRetry} className="px-4 py-2.5 rounded-xl bg-success-veg text-white inline-flex items-center gap-2"><RefreshCw size={16} /> Try again</button>{onBack && <button type="button" onClick={onBack} className="px-4 py-2.5 rounded-xl border border-border-light inline-flex items-center gap-2"><ArrowLeft size={16} /> Back</button>}</div>
  </div>
}
