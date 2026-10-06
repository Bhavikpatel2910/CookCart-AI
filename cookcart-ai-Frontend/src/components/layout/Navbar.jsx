import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChefHat,
  Home,
  LayoutGrid,
  Menu,
  ShoppingCart,
  Soup,
  Package,
  X,
} from 'lucide-react'
import { useCart } from '../../hooks/useCart.js'
import { useUser } from '../../hooks/useUser.js'
import { useAuth } from '../../hooks/useAuth.js'
import { BRAND } from '../../utils/constants.js'

const LINKS = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'categories', label: 'Categories', to: '/recipes', icon: LayoutGrid },
  { id: 'recipes', label: 'Recipes', to: '/recipes', icon: Soup },
  { id: 'pantry', label: 'Pantry', to: '/pantry', icon: Soup },
  { id: 'orders', label: 'Orders', to: '/orders', icon: Package },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount } = useCart()
  const { user } = useUser()
  const { isAuthenticated, user: authUser, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'glass-nav shadow-nav' : 'bg-transparent'
      }`}
    >
      <div className="max-w-page mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="w-10 h-10 rounded-2xl btn-gradient text-white flex items-center justify-center shadow-glow-green transition-transform group-hover:scale-105 group-hover:-rotate-6">
            <ChefHat size={22} strokeWidth={1.75} />
          </span>
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-display font-bold text-headline-md text-brand-dark tracking-tight">
              {BRAND.name}
            </span>
            <span className="text-label-sm text-on-surface-variant">
              {BRAND.tagline}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {LINKS.map(({ id, label, to }) => (
            <NavLink
              key={id}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-label-md font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-success-veg/10 text-success-veg'
                    : 'text-on-surface hover:bg-surface-container-low'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative hidden md:inline-flex items-center gap-2 bg-white border border-border-light shadow-sm hover:shadow-md hover:border-success-veg/40 text-on-surface text-label-md font-semibold px-4 py-2 rounded-full transition-all"
          >
            <ShoppingCart size={18} strokeWidth={1.75} />
            <span className="hidden xl:inline">My Cart</span>
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-success-veg text-white text-[11px] font-bold flex items-center justify-center shadow"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Auth: avatar or login buttons */}
          {isAuthenticated ? (
            <button
              type="button"
              aria-label="Profile"
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-success-veg transition-all shadow-sm cursor-pointer"
            >
              {authUser?.avatar ? (
                <img
                  src={authUser.avatar}
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="w-full h-full btn-gradient text-white text-label-md font-bold flex items-center justify-center">
                  {authUser?.initials ?? 'U'}
                </span>
              )}
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-label-md font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-full text-label-md font-semibold text-white bg-success-veg shadow-glow-green hover:shadow-glow-green-lg hover:-translate-y-0.5 transition-all"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-x-0 top-20 bottom-0 z-40 bg-background-alt/95 backdrop-blur-xl flex flex-col"
          >
            <nav className="flex flex-col gap-1 p-6" aria-label="Mobile">
             {LINKS.map(({ id, label, to, icon: Icon }) => (
                <NavLink
                 key={id}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-body-lg font-semibold transition-colors ${
                      isActive
                        ? 'bg-success-veg/10 text-success-veg'
                        : 'text-on-surface hover:bg-surface-container-low'
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={1.75} />
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-body-lg font-semibold text-on-surface hover:bg-surface-container-low"
              >
                <ShoppingCart size={20} strokeWidth={1.75} />
                My Cart
                {itemCount > 0 && (
                  <span className="ml-auto min-w-6 h-6 px-1.5 rounded-full bg-success-veg text-white text-label-sm font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </NavLink>
            </nav>
            <div className="mt-auto p-6 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-lowest shadow-soft"
                  >
                    {authUser?.avatar ? (
                      <img
                        src={authUser.avatar}
                        alt="Profile avatar"
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-11 h-11 rounded-full bg-success-veg text-white text-label-md font-bold flex items-center justify-center">
                        {authUser?.initials ?? 'U'}
                      </span>
                    )}
                    <div className="flex flex-col">
                      <span className="text-label-md text-on-surface font-semibold">
                        {authUser?.name ?? user?.name}
                      </span>
                      <span className="text-label-sm text-on-surface-variant">
                        View profile
                      </span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                      navigate('/')
                    }}
                    className="text-label-sm text-error font-semibold py-2 hover:underline"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center px-4 py-3 rounded-2xl text-label-md font-semibold text-on-surface border border-outline-variant hover:bg-surface-container-low transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center px-4 py-3 rounded-2xl text-label-md font-semibold text-white bg-success-veg hover:bg-primary transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
