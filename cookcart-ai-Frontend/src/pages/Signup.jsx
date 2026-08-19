import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ChefHat, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import BlinkitLogo from '../components/common/BlinkitLogo.jsx'
import AuthShowcase from '../components/auth/AuthShowcase.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { BRAND } from '../utils/constants.js'

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signup, loginWithBlinkit } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [blinkitLoading, setBlinkitLoading] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const password = watch('password') ?? ''
  const passwordStrength = password.length >= 8 ? 3 : password.length >= 6 ? 2 : password.length > 0 ? 1 : 0
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][passwordStrength]

  const from = location.state?.from?.pathname ?? '/'

  const afterAuth = () => {
    toast.success('Welcome to CookCart AI!')
    navigate(from, { replace: true })
  }

  const onSubmit = (values) => {
    signup(values)
    afterAuth()
  }

  const handleBlinkit = () => {
    setBlinkitLoading(true)
    window.setTimeout(() => {
      loginWithBlinkit()
      setBlinkitLoading(false)
      afterAuth()
    }, 700)
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-alt flex">
      <AuthShowcase />

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-surface rounded-3xl shadow-card-soft border border-border-light/60 p-8">
            <div className="text-center mb-8">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-success-veg/10 text-success-veg mb-4">
                <ChefHat size={28} />
              </span>
              <h2 className="font-display text-3xl font-bold text-on-surface">
                Create your account
              </h2>
              <p className="text-body-md text-on-surface-variant mt-1">
                Start cooking with {BRAND.name}
              </p>
            </div>

            {/* Sign up with Blinkit */}
            <button
              type="button"
              onClick={handleBlinkit}
              disabled={blinkitLoading}
              className="w-full bg-[#067A2E] text-white font-bold py-3.5 px-6 rounded-[16px] shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] transition-all inline-flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0"
            >
              {blinkitLoading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <BlinkitLogo size={22} />
                  Sign up with Blinkit
                </>
              )}
            </button>

            <div className="flex items-center gap-3 my-6">
              <span className="flex-1 h-px bg-border-light" />
              <span className="text-label-sm text-on-surface-variant">or sign up with</span>
              <span className="flex-1 h-px bg-border-light" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-label-sm text-on-surface-variant">Full name</span>
                <div className="relative">
                  <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="Aarav Sharma"
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Enter your full name' } })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-border-light text-body-md text-on-surface outline-none focus:border-success-veg focus:ring-2 focus:ring-success-veg/20 transition-all"
                  />
                </div>
                {errors.name && <span className="text-label-sm text-error">{errors.name.message}</span>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-label-sm text-on-surface-variant">Phone or email</span>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="+91 98765 43210 or name@example.com"
                    {...register('identifier', { required: 'Phone or email is required' })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-border-light text-body-md text-on-surface outline-none focus:border-success-veg focus:ring-2 focus:ring-success-veg/20 transition-all"
                  />
                </div>
                {errors.identifier && (
                  <span className="text-label-sm text-error">{errors.identifier.message}</span>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-label-sm text-on-surface-variant">Password</span>
                <div className="relative">
                  <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-surface-container-lowest border border-border-light text-body-md text-on-surface outline-none focus:border-success-veg focus:ring-2 focus:ring-success-veg/20 transition-all"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((show) => !show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((level) => (
                        <span
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            passwordStrength >= level
                              ? level <= 1 ? 'bg-error' : level === 2 ? 'bg-warning' : 'bg-success-veg'
                              : 'bg-surface-container-high'
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-label-sm ${
                        passwordStrength <= 1 ? 'text-error' : passwordStrength === 2 ? 'text-warning' : 'text-success-veg'
                      }`}
                    >
                      {strengthLabel}
                    </span>
                  </div>
                )}
                {errors.password && <span className="text-label-sm text-error">{errors.password.message}</span>}
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-success-veg text-on-primary text-label-md font-semibold py-3.5 px-6 rounded-[16px] shadow-glow-green hover:shadow-glow-green-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:translate-y-0"
              >
                Create account
              </button>
            </form>
          </div>

          <p className="text-center text-body-md text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-success-veg font-bold hover:underline">
              Sign in
            </Link>
          </p>

          <p className="flex items-center justify-center gap-1.5 text-label-sm text-on-surface-variant mt-4">
            <ShieldCheck size={14} className="text-success-veg" />
            Protected by bank-level encryption · By continuing you agree to our Terms
          </p>
        </motion.div>
      </div>
    </div>
  )
}
