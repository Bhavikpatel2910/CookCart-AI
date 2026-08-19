import { Link } from 'react-router-dom'
import { ChefHat, Mail, MapPin, Phone, Sparkles } from 'lucide-react'
import { BRAND } from '../../utils/constants.js'

const EXPLORE = [
  { label: 'Home', to: '/' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'AI Chef', to: '/chef' },
  { label: 'My Cart', to: '/cart' },
  { label: 'My Profile', to: '/profile' },
  { label: 'Favorites', to: '/favorites' },
  { label: 'Orders', to: '/orders' },
  { label: 'Settings', to: '/settings' },
  { label: 'Help Center', to: '/help' },
]

export default function Footer() {
  return (
    <footer className="mt-auto bg-brand-dark text-white">
      <div className="max-w-page mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-success-veg text-white flex items-center justify-center shadow-glow-green">
              <ChefHat size={22} strokeWidth={1.75} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display font-bold text-headline-md tracking-tight">
                {BRAND.name}
              </span>
              <span className="text-label-sm text-white/70">{BRAND.tagline}</span>
            </span>
          </Link>
          <p className="text-body-md text-white/70 leading-relaxed">
            Search any dish → AI prepares the recipe → get exact ingredients →
            cook confidently. Your personal AI chef for every home.
          </p>
          <span className="inline-flex items-center gap-2 w-fit rounded-full bg-white/10 px-3 py-1.5 text-label-sm text-accent-green">
            <Sparkles size={14} />
            Powered by AI
          </span>
        </div>

        <div>
          <h3 className="text-label-md text-accent-green uppercase tracking-wider mb-4">
            Explore
          </h3>
          <ul className="flex flex-col gap-3">
            {EXPLORE.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="text-body-md text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-label-md text-accent-green uppercase tracking-wider mb-4">
            Account
          </h3>
          <ul className="flex flex-col gap-3">
            <li>
              <Link to="/login" className="text-body-md text-white/80 hover:text-white transition-colors">
                Login / Sign Up
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="text-body-md text-white/80 hover:text-white transition-colors">
                My Favorites
              </Link>
            </li>
            <li>
              <Link to="/orders" className="text-body-md text-white/80 hover:text-white transition-colors">
                Order History
              </Link>
            </li>
            <li>
              <Link to="/settings" className="text-body-md text-white/80 hover:text-white transition-colors">
                Settings
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-label-md text-accent-green uppercase tracking-wider mb-4">
            Get in touch
          </h3>
          <ul className="flex flex-col gap-3 text-body-md text-white/80">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-accent-green" /> {BRAND.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-accent-green" /> {BRAND.email}
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="text-accent-green shrink-0 mt-1" />
              {BRAND.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-page mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-label-sm text-white/60">
          <span>
            © {new Date().getFullYear()} {BRAND.name}. Crafted with care.
          </span>
          <span>Delivery in {BRAND.deliveryTime}</span>
        </div>
      </div>
    </footer>
  )
}
