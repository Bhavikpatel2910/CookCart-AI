import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ChefHat, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import BlinkitLogo from '../components/common/BlinkitLogo.jsx'
import AuthShowcase from '../components/auth/AuthShowcase.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { BRAND } from '../utils/constants.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithBlinkit } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [blinkitLoading, setBlinkitLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const from = location.state?.from?.pathname ?? '/'

  const afterLogin = () => {
    toast.success(`Welcome back, ${BRAND.name}`)
    navigate(from, { replace: true })
  }

  const onSubmit = async (values) => {
    const identifier = values.identifier?.trim() ?? ''
    const isEmail = identifier.includes('@')
    try {
      await login({
        email: isEmail ? identifier : undefined,
        phone: !isEmail ? identifier : undefined,
        password: values.password,
      })
      afterLogin()
    } catch (error) {
      toast.error(error.response?.data?.error ?? 'Invalid email/phone or password')
    }
  }

  const handleBlinkit = async () => {
    setBlinkitLoading(true)
    try {
      await loginWithBlinkit()
      afterLogin()
    } catch (error) {
      toast.error(error.message ?? 'Blinkit sign-in is unavailable right now')
    } finally {
      setBlinkitLoading(false)
    }
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
                Welcome back
              </h2>
              <p className="text-body-md text-on-surface-variant mt-1">
                Sign in to continue to {BRAND.name}
              </p>
            </div>

            {/* Sign in with Blinkit */}
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
                  Sign in with Blinkit
                </>
              )}
            </button>

            <div className="flex items-center gap-3 my-6">
              <span className="flex-1 h-px bg-border-light" />
              <span className="text-label-sm text-on-surface-variant">or continue with</span>
              <span className="flex-1 h-px bg-border-light" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">Password</span>
                  <button type="button" onClick={() => toast('Enter your email or phone and we will send a reset link.')} className="text-label-sm text-success-veg font-semibold hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
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
                {errors.password && (
                  <span className="text-label-sm text-error">{errors.password.message}</span>
                )}
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-success-veg text-on-primary text-label-md font-semibold py-3.5 px-6 rounded-[16px] shadow-glow-green hover:shadow-glow-green-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:translate-y-0"
              >
                Sign in
              </button>
            </form>
          </div>

          <p className="text-center text-body-md text-on-surface-variant mt-6">
            New to {BRAND.name}?{' '}
            <Link to="/signup" className="text-success-veg font-bold hover:underline">
              Create an account
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
