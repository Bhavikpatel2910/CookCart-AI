import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Compass, Home } from 'lucide-react'
import Button from '../components/common/Button.jsx'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[75vh] max-w-page mx-auto px-4 flex flex-col items-center justify-center text-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <span className="w-24 h-24 rounded-3xl bg-surface-soft text-success-veg flex items-center justify-center mb-8 shadow-card-soft">
          <Compass size={44} />
        </span>
        <p className="font-display text-headline-md font-bold text-success-veg mb-2">404</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-3">
          This page is off the menu
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-md mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you
          back to something delicious.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button variant="dark" icon={Home} onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
