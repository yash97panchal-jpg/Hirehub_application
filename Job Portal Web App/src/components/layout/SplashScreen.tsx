import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import symbolLogo from "../../imports/symbol_only.jpeg"
import { Sparkles } from "lucide-react"

interface SplashScreenProps {
  onFinish: () => void
  durationMs?: number
}

export default function SplashScreen({
  onFinish,
  durationMs = 2100,
}: SplashScreenProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Smooth progress bar fill
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 4
      })
    }, durationMs / 28)

    // Trigger exit animation shortly before full duration
    const exitTimer = setTimeout(() => {
      setIsClosing(true)
    }, durationMs - 350)

    // Complete and unmount
    const finishTimer = setTimeout(() => {
      onFinish()
    }, durationMs)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(exitTimer)
      clearTimeout(finishTimer)
    }
  }, [durationMs, onFinish])

  // Allow clicking to skip immediately
  const handleSkip = () => {
    setIsClosing(true)
    setTimeout(onFinish, 200)
  }

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          onClick={handleSkip}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0B0314] text-white select-none cursor-pointer overflow-hidden"
        >
          {/* Ambient Background Aura Lights */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[520px] h-[380px] sm:h-[520px] rounded-full bg-gradient-to-tr from-purple-700/30 via-[var(--primary)]/20 to-indigo-600/25 blur-3xl"
            />
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm">
            {/* Animated Logo Container */}
            <div className="relative mb-6">
              {/* Outer Radiant Orbit Glow */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-full bg-gradient-to-tr from-[var(--primary)] via-purple-600 to-amber-300 opacity-60 blur-md"
              />

              {/* Pulsing Aura Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.18, 1],
                  opacity: [0.8, 0.3, 0.8],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-1 rounded-full border-2 border-[var(--primary)]/70"
              />

              {/* Logo Card */}
              <motion.div
                initial={{ scale: 0.35, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 18,
                  delay: 0.05,
                }}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-white/10 backdrop-blur-xl border border-white/30 shadow-[0_0_50px_rgba(245,158,11,0.35)] flex items-center justify-center overflow-hidden"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2.5 shadow-inner overflow-hidden">
                  <img
                    src={symbolLogo}
                    alt="HireHub Symbol"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            </div>

            {/* Application Name Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="space-y-1 mb-5"
            >
              <h1 className="font-poppins text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-1">
                <span>Hire</span>
                <span className="text-[var(--primary)] drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">Hub</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-white/70 tracking-wide flex items-center justify-center gap-1.5">
                <Sparkles size={13} className="text-[var(--primary)] animate-pulse" />
                <span>AI-Powered Career & ATS Platform</span>
              </p>
            </motion.div>

            {/* Glowing Loading Progress Bar */}
            <motion.div
              initial={{ opacity: 0, width: "60%" }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="w-48 sm:w-56 space-y-2"
            >
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-[var(--primary)] rounded-full shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/50 tracking-wider font-mono">
                <span>INITIALIZING</span>
                <span>{progress}%</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Tap to Skip Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="absolute bottom-6 text-[11px] text-white/40 font-medium tracking-wide"
          >
            Click anywhere to enter
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
