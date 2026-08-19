import { ChefHat, Sparkles, Truck, UtensilsCrossed } from 'lucide-react'
import { BRAND } from '../../utils/constants.js'
import SmartImage from '../common/SmartImage.jsx'

const PERKS = [
  { icon: Truck, text: 'Ingredients in ~10 minutes, live tracked' },
  { icon: Sparkles, text: 'AI Chef suggests recipes for your pantry' },
  { icon: UtensilsCrossed, text: 'Step-by-step guided cooking mode' },
]

export default function AuthShowcase() {
  return (
    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-dark via-primary to-success-veg relative overflow-hidden flex-col justify-center px-16">
      <div className="absolute -left-16 -top-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-accent-green/20 rounded-full blur-3xl" />
      <div className="relative z-10 max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-12 h-12 rounded-2xl bg-accent-green text-brand-dark flex items-center justify-center shadow-lg">
            <ChefHat size={26} />
          </span>
          <div className="text-white">
            <p className="font-display font-bold text-headline-md leading-none">{BRAND.name}</p>
            <p className="text-white/70 text-label-sm mt-1">{BRAND.tagline}</p>
          </div>
        </div>

        <h1 className="font-display text-5xl font-bold text-white leading-tight mb-4">
          Dinner, decided.
          <br />
          <span className="text-accent-green">Ingredients, delivered.</span>
        </h1>
        <p className="text-white/80 text-body-lg mb-10">
          Pick a dish, we prep the pantry, you cook like a pro.
        </p>

        <ul className="flex flex-col gap-4">
          {PERKS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-white">
              <span className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                <Icon size={18} className="text-accent-green" />
              </span>
              <span className="text-body-md">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 mt-12 rounded-2xl overflow-hidden border border-white/20 shadow-2xl max-w-md">
        <SmartImage
          src={{ name: 'Paneer Butter Masala' }}
          kind="recipe"
          alt="Paneer Butter Masala"
          className="w-full h-44 object-cover bg-surface"
        />
      </div>
    </div>
  )
}
