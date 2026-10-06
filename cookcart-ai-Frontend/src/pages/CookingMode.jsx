import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Clock, Flame, Maximize2, Pause, Play, UtensilsCrossed } from 'lucide-react'
import { useRecipe } from '../hooks/useRecipe.js'
import { useAuth } from '../hooks/useAuth.js'

function formatSeconds(total) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function CookingMode() {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const { activeRecipe, servings } = useRecipe()
  const steps = activeRecipe?.steps ?? []
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [showAllSteps, setShowAllSteps] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const timerRef = useRef(null)

  const RECENTLY_COOKED_KEY = 'cookcart_recently_cooked'
  const addToRecentlyCooked = (recipeId) => {
    if (!authUser?.user_id) return
    try {
      const existing = JSON.parse(localStorage.getItem(RECENTLY_COOKED_KEY) || '[]')
      const entry = {
        recipe_id: recipeId,
        user_id: authUser.user_id,
        cooked_at: new Date().toISOString(),
      }
      const updated = [entry, ...existing.filter(e => e.recipe_id !== recipeId)].slice(0, 20)
      localStorage.setItem(RECENTLY_COOKED_KEY, JSON.stringify(updated))
    } catch {
      // Ignore localStorage errors
    }
  }

  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1
  const progress = useMemo(
    () => (steps.length ? ((stepIndex + (done.includes(stepIndex) ? 1 : 0)) / steps.length) * 100 : 0),
    [stepIndex, done, steps.length],
  )

  useEffect(() => {
    if (!running || timeLeft <= 0) return undefined
    timerRef.current = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setRunning(false)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timerRef.current)
  }, [running, timeLeft])

  useEffect(() => {
    if (step) {
      setTimeLeft((step.time || 0) * 60)
      setRunning(false)
    }
  }, [stepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeRecipe) {
    return (
      <div className="min-h-[70vh] bg-brand-dark flex flex-col items-center justify-center text-white px-6 text-center">
        <span className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
          <UtensilsCrossed size={36} className="text-accent-green" />
        </span>
        <h1 className="font-display text-3xl font-bold mb-3">Pick a recipe to cook</h1>
        <p className="text-white/70 max-w-md mb-8">
          Choose a recipe first, then follow it step by step with a live timer.
        </p>
        <button
          type="button"
          onClick={() => navigate('/recipes')}
          className="bg-accent-green text-brand-dark font-semibold px-8 py-4 rounded-[16px] hover:-translate-y-0.5 transition-all"
        >
          Browse Recipes
        </button>
      </div>
    )
  }

  if (!steps.length) {
    return (
      <div className="min-h-[70vh] bg-brand-dark flex flex-col items-center justify-center text-white px-6 text-center">
        <span className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
          <UtensilsCrossed size={36} className="text-accent-green" />
        </span>
        <h1 className="font-display text-3xl font-bold mb-3">
          {activeRecipe.name} has no guided steps yet
        </h1>
        <p className="text-white/70 max-w-md mb-8">
          We're still writing the guided recipe for this dish. Try{' '}
          <button type="button" className="text-accent-green underline underline-offset-4" onClick={() => navigate('/recipe/aloo-paratha')}>
            Aloo Paratha
          </button>{' '}
          for a full cooking experience.
        </p>
        <button
          type="button"
          onClick={() => navigate('/recipes')}
          className="bg-accent-green text-brand-dark font-semibold px-8 py-4 rounded-[16px] hover:-translate-y-0.5 transition-all"
        >
          Browse Recipes
        </button>
      </div>
    )
  }

  const toggleDone = (index) => {
    setDone((current) => (current.includes(index) ? current.filter((i) => i !== index) : [...current, index]))
  }

  const goNext = () => {
    if (isLast) return
    setDone((current) => (current.includes(stepIndex) ? current : [...current, stepIndex]))
    setStepIndex((index) => index + 1)
  }

  const goPrev = () => {
    if (isFirst) return
    setStepIndex((index) => index - 1)
  }

  const handleFinish = async () => {
    if (finishing) return
    setFinishing(true)
    try {
      addToRecentlyCooked(activeRecipe.recipe_id)
      navigate(`/recipe/${activeRecipe.slug}`)
    } finally {
      setFinishing(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-dark text-white flex flex-col">
      {/* Top progress + header */}
      <header className="sticky top-16 z-30 bg-brand-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-page mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                aria-label="Back"
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-label-md font-bold truncate">{activeRecipe.name}</h1>
                <p className="text-white/60 text-label-sm">
                  Step {stepIndex + 1} of {steps.length} · {servings} servings
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAllSteps((show) => !show)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-label-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                All Steps <ChevronDown size={14} />
              </button>
              <button
                type="button"
                aria-label="Fullscreen"
                onClick={() => document.documentElement.requestFullscreen?.()}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-accent-green to-success-veg rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Step overview dropdown */}
      <AnimatePresence>
        {showAllSteps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-brand-dark/95 border-b border-white/10 overflow-hidden"
          >
            <div className="max-w-page mx-auto px-4 md:px-8 py-4 flex gap-2 overflow-x-auto no-scrollbar">
              {steps.map((s, index) => (
                <button
                  key={`${s.title}-${index}`}
                  type="button"
                  onClick={() => setStepIndex(index)}
                  className={`shrink-0 px-4 py-2 rounded-full text-label-sm font-semibold transition-colors ${
                    index === stepIndex
                      ? 'bg-accent-green text-brand-dark'
                      : done.includes(index)
                        ? 'bg-white/15 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {done.includes(index) && <Check size={12} className="inline mr-1" />}
                  Step {index + 1}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step content */}
      <main className="flex-1 max-w-page w-full mx-auto px-4 md:px-8 py-8 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="flex items-center gap-3 text-accent-green text-label-sm font-bold mb-4">
              <span className="w-8 h-8 rounded-full bg-accent-green text-brand-dark flex items-center justify-center">
                {stepIndex + 1}
              </span>
              STEP {stepIndex + 1} / {steps.length}
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 max-w-3xl">
              {step.title}
            </h2>
            <p className="text-white/80 text-body-lg md:text-2xl leading-relaxed max-w-3xl mb-8">
              {step.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              {step.ingredients?.map((ingredient, index) => (
                <span
                  key={`${ingredient.name}-${index}`}
                  className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-label-sm font-semibold"
                >
                  {ingredient.qty} {ingredient.name}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom controls */}
      <footer className="sticky bottom-0 bg-brand-dark/95 backdrop-blur border-t border-white/10">
        <div className="max-w-page mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous step"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-full px-5 py-2.5 flex items-center gap-3">
              <Clock size={18} className="text-accent-green" />
              <span className="font-display text-headline-md font-bold tabular-nums">
                {formatSeconds(timeLeft)}
              </span>
              <button
                type="button"
                onClick={() => setRunning((run) => !run)}
                disabled={timeLeft <= 0}
                className="w-9 h-9 rounded-full bg-accent-green text-brand-dark flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
                aria-label={running ? 'Pause timer' : 'Start timer'}
              >
                {running ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>
              <span className="w-px h-6 bg-white/20" />
              <span className="text-label-sm text-white/70 flex items-center gap-1.5">
                <Flame size={14} /> {step.time ? `${step.time} min` : 'No timer'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => toggleDone(stepIndex)}
              className={`px-4 py-2.5 rounded-full text-label-sm font-semibold transition-colors ${
                done.includes(stepIndex) ? 'bg-success-veg text-white' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Check size={14} className="inline mr-1" />
              Done
            </button>
          </div>

          {isLast ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={finishing}
              className={`bg-accent-green text-brand-dark font-bold px-6 py-3 rounded-full hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 ${
                finishing ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {finishing ? (
                <>
                  <span className="w-5 h-5 border-2 border-brand-dark/40 border-t-brand-dark rounded-full animate-spin" />
                  Finishing...
                </>
              ) : (
                <>
                  Finish <Check size={18} />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="bg-accent-green text-brand-dark font-bold px-6 py-3 rounded-full hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
            >
              Next <ArrowRight size={18} />
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
