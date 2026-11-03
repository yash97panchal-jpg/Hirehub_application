"use client"

import { useEffect, useRef } from "react"

interface Vector2D {
  x: number
  y: number
}

class Particle {
  pos: Vector2D
  vel: Vector2D = { x: 0, y: 0 }
  target: Vector2D
  radius: number
  color: string
  isKilled: boolean = false

  spring: number
  friction: number

  constructor(x: number, y: number, targetX: number, targetY: number, color: string, radius: number = 2.2) {
    this.pos = { x, y }
    this.target = { x: targetX, y: targetY }
    this.color = color
    this.radius = radius
    this.spring = 0.085 + Math.random() * 0.03
    this.friction = 0.81 + Math.random() * 0.03
  }

  update(touchX: number, touchY: number, touchActive: boolean) {
    // 1. Interactive cursor / finger repulsion
    if (touchActive) {
      const tdx = this.pos.x - touchX
      const tdy = this.pos.y - touchY
      const tdist = Math.sqrt(tdx * tdx + tdy * tdy)
      const maxRepel = 65

      if (tdist < maxRepel && tdist > 0) {
        const force = ((maxRepel - tdist) / maxRepel) * 9
        this.vel.x += (tdx / tdist) * force
        this.vel.y += (tdy / tdist) * force
      }
    }

    // 2. Damped Spring attraction towards letter target
    const dx = this.target.x - this.pos.x
    const dy = this.target.y - this.pos.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    this.vel.x += dx * this.spring
    this.vel.y += dy * this.spring

    this.vel.x *= this.friction
    this.vel.y *= this.friction

    this.pos.x += this.vel.x
    this.pos.y += this.vel.y

    // 3. Crisp lock-in to eliminate any jittering or glitch
    if (dist < 0.75 && Math.abs(this.vel.x) < 0.12 && Math.abs(this.vel.y) < 0.12) {
      this.pos.x = this.target.x
      this.pos.y = this.target.y
      this.vel.x = 0
      this.vel.y = 0
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  kill(width: number, height: number) {
    this.isKilled = true
    const angle = Math.random() * Math.PI * 2
    const dist = Math.max(width, height) * 0.85
    this.target.x = width / 2 + Math.cos(angle) * dist
    this.target.y = height / 2 + Math.sin(angle) * dist
    this.spring = 0.04
    this.friction = 0.88
  }
}

interface ParticleTextEffectProps {
  words?: string[]
  holdDurationMs?: number
}

const DEFAULT_WORDS = ["WELCOME", "HIREHUB", "CAREER SEARCH"]

const WORD_COLORS: Record<string, string> = {
  WELCOME: "#F59E0B",         // Radiant Marigold
  HIREHUB: "#F1F5F9",         // Crisp Ice Silver
  "CAREER SEARCH": "#FBBF24",   // Golden Marigold
  CAREER: "#FBBF24",
  SEARCH: "#F59E0B",
  "JOIN NOW": "#F59E0B",
  JOBS: "#F59E0B",
}

export function ParticleTextEffect({
  words = DEFAULT_WORDS,
  holdDurationMs = 4500,
}: ParticleTextEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const lastSwitchTimeRef = useRef<number>(performance.now())
  const wordIndexRef = useRef(0)
  const pointerRef = useRef({ x: -1000, y: -1000, active: false })

  // Sample letter points from offscreen canvas with mobile/tablet multi-line & adaptive density
  const getWordCoordinates = (
    word: string,
    width: number,
    height: number,
  ): { x: number; y: number }[] => {
    if (width <= 0 || height <= 0) return []

    const offscreen = document.createElement("canvas")
    offscreen.width = width
    offscreen.height = height
    const ctx = offscreen.getContext("2d")
    if (!ctx) return []

    // Adaptive sampling density: tighter sampling on mobile/tablet so letters are solid and clear
    const step = width < 480 ? 3.8 : width < 768 ? 4.2 : 5.2
    const isMobileTablet = width < 1024

    // On phone & tablet, split multi-word phrases (e.g. "CAREER SEARCH") onto two clean lines
    // so font size is large, bold, and fully readable!
    const lines = isMobileTablet && word.includes(" ") ? word.split(" ") : [word]

    // Calculate font size that fits nicely within container
    const longestLineLen = Math.max(...lines.map((l) => l.length))
    const maxFontByWidth = (width * (isMobileTablet ? 0.82 : 0.85)) / (longestLineLen * 0.58)
    const maxFontByHeight = (height * (isMobileTablet ? 0.30 : 0.22)) / lines.length
    const fontSize = Math.max(28, Math.min(84, Math.floor(Math.min(maxFontByWidth, maxFontByHeight))))

    ctx.fillStyle = "white"
    ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // On mobile & tablet, center Y is positioned safely above the bottom tagline
    const centerY = isMobileTablet ? height * 0.36 : height * 0.44
    const lineHeight = fontSize * 1.18
    const startY = centerY - ((lines.length - 1) * lineHeight) / 2

    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight)
    })

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const points: { x: number; y: number }[] = []

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (Math.floor(y) * width + Math.floor(x)) * 4
        if (data[idx + 3] > 120) {
          points.push({ x: Math.round(x), y: Math.round(y) })
        }
      }
    }

    // Shuffle points randomly for organic, multi-directional particle gathering
    for (let i = points.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[points[i], points[j]] = [points[j], points[i]]
    }

    return points
  }

  const setWord = (word: string, canvas: HTMLCanvasElement) => {
    const width = canvas.width
    const height = canvas.height
    if (width <= 0 || height <= 0) return

    const points = getWordCoordinates(word, width, height)
    const color = WORD_COLORS[word] || "#F59E0B"
    const particles = particlesRef.current
    const particleRadius = width < 600 ? 1.85 : 2.2

    let pIdx = 0

    // Assign points to existing or newly spawned particles
    for (const pt of points) {
      if (pIdx < particles.length) {
        const p = particles[pIdx]
        p.target.x = pt.x
        p.target.y = pt.y
        p.color = color
        p.radius = particleRadius
        p.isKilled = false
        p.spring = 0.085 + Math.random() * 0.03
        p.friction = 0.81 + Math.random() * 0.03
        // Subtle velocity nudge for fluid transition
        p.vel.x += (Math.random() - 0.5) * 3
        p.vel.y += (Math.random() - 0.5) * 3
        pIdx++
      } else {
        // Spawn from scattered perimeter positions
        const angle = Math.random() * Math.PI * 2
        const spawnDist = Math.max(width, height) * (0.4 + Math.random() * 0.5)
        const spawnX = width / 2 + Math.cos(angle) * spawnDist
        const spawnY = height / 2 + Math.sin(angle) * spawnDist

        const newP = new Particle(spawnX, spawnY, pt.x, pt.y, color, particleRadius)
        particles.push(newP)
        pIdx++
      }
    }

    // Kill extra particles not needed for this word
    for (let i = pIdx; i < particles.length; i++) {
      particles[i].kill(width, height)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const particles = particlesRef.current
    const pointer = pointerRef.current

    // Smooth subtle trail background
    ctx.fillStyle = "rgba(18, 5, 27, 0.32)"
    ctx.fillRect(0, 0, width, height)

    // Update and render particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.update(pointer.x, pointer.y, pointer.active)
      p.draw(ctx)

      // Clean up out-of-bounds dead particles
      if (p.isKilled) {
        if (
          p.pos.x < -100 ||
          p.pos.x > width + 100 ||
          p.pos.y < -100 ||
          p.pos.y > height + 100
        ) {
          particles.splice(i, 1)
        }
      }
    }

    // Auto-advance words after hold duration
    const now = performance.now()
    if (now - lastSwitchTimeRef.current >= holdDurationMs) {
      lastSwitchTimeRef.current = now
      wordIndexRef.current = (wordIndexRef.current + 1) % words.length
      setWord(words[wordIndexRef.current], canvas)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const updateDimensions = () => {
      const w = parent.clientWidth || 600
      const h = parent.clientHeight || 500
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        setWord(words[wordIndexRef.current], canvas)
      }
    }

    updateDimensions()

    // ResizeObserver ensures canvas responds immediately to phone/tablet orientation and size changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })
    resizeObserver.observe(parent)

    // Mouse & Touch handlers for phone, tablet, and desktop
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      }
    }

    const handleMouseLeave = () => {
      pointerRef.current.active = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect()
        pointerRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
          active: true,
        }
      }
    }

    const handleTouchEnd = () => {
      pointerRef.current.active = false
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true })
    canvas.addEventListener("touchend", handleTouchEnd)
    canvas.addEventListener("touchstart", handleTouchMove, { passive: true })

    // Start animation loop
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      resizeObserver.disconnect()
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
      canvas.removeEventListener("touchstart", handleTouchMove)
    }
  }, [words, holdDurationMs])

  return (
    <div className="absolute inset-0 z-0 bg-[#12051B] overflow-hidden pointer-events-auto">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#F59E0B]/12 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#4A1A60]/25 rounded-full filter blur-[100px] pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full block relative z-10 cursor-pointer" />
    </div>
  )
}
