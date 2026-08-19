import { ArrowRight, Inbox } from 'lucide-react'
import Button from './Button.jsx'

export default function EmptyState({ title, description, actionLabel, onAction, icon: Icon = Inbox }) {
  return (
    <div className="bg-surface rounded-2xl border border-border-light p-10 text-center flex flex-col items-center">
      <span className="w-16 h-16 rounded-2xl bg-success-veg/10 text-success-veg flex items-center justify-center mb-4"><Icon size={30} /></span>
      <h2 className="font-display text-2xl font-bold text-on-surface">{title}</h2>
      <p className="text-body-md text-on-surface-variant max-w-md mt-2 mb-6">{description}</p>
      {actionLabel && <Button icon={ArrowRight} iconPosition="right" onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
