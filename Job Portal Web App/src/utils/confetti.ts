/**
 * Lightweight, zero-dependency canvas confetti burst.
 * Runs smoothly on 60fps across mobile and desktop browsers.
 */
export function triggerConfetti() {
  const canvas = document.createElement("canvas")
  canvas.style.position = "fixed"
  canvas.style.top = "0"
  canvas.style.left = "0"
  canvas.style.width = "100%"
  canvas.style.height = "100%"
  canvas.style.pointerEvents = "none"
  canvas.style.zIndex = "9999"
  document.body.appendChild(canvas)

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  ctx.scale(dpr, dpr)

  const colors = ["#7C3AED", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"]
  const particles: Array<{
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    rotation: number
    vRot: number
    alpha: number
  }> = []

  for (let i = 0; i < 75; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1,
    })
  }

  let animationFrameId: number
  const startTime = Date.now()

  const render = () => {
    const elapsed = Date.now() - startTime
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.35 // gravity
      p.rotation += p.vRot
      p.alpha = Math.max(0, 1 - elapsed / 1800)

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }

    if (elapsed < 1800) {
      animationFrameId = requestAnimationFrame(render)
    } else {
      cancelAnimationFrame(animationFrameId)
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
    }
  }

  animationFrameId = requestAnimationFrame(render)
}
