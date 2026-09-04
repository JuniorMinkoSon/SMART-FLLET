import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Carousel.css'

interface CarouselProps {
  /** Diapositives déjà rendues. */
  children: ReactNode[]
  /** Nombre de diapositives visibles simultanément (desktop). */
  perView?: number
  /** Libellé accessible du carrousel. */
  label: string
  /** Défilement automatique — désactivé par défaut, et coupé si l'utilisateur
   *  a demandé moins d'animations ou interagit avec le carrousel. */
  autoPlayMs?: number
  className?: string
}

/**
 * Carrousel générique Smart Fleet.
 * - navigation gauche/droite + pagination + clavier (flèches)
 * - défilement natif `scroll-snap` : pas de calcul de transform fragile
 * - respecte `prefers-reduced-motion`
 */
export function Carousel({
  children,
  perView = 3,
  label,
  autoPlayMs,
  className = '',
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = children.length

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = ((i % count) + count) % count
    const slide = track.children[clamped] as HTMLElement | undefined
    if (!slide) return
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' })
    setIndex(clamped)
  }, [count])

  // L'index suit le défilement réel (molette, tactile, barre de défilement).
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const children = Array.from(track.children) as HTMLElement[]
        const left = track.scrollLeft + track.offsetLeft
        let nearest = 0
        let best = Infinity
        children.forEach((c, i) => {
          const d = Math.abs(c.offsetLeft - left)
          if (d < best) { best = d; nearest = i }
        })
        setIndex(nearest)
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!autoPlayMs || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => scrollTo(index + 1), autoPlayMs)
    return () => window.clearInterval(id)
  }, [autoPlayMs, paused, index, scrollTo])

  const atStart = index === 0
  const atEnd = index >= count - 1

  return (
    <div
      className={`carousel ${className}`}
      role="region"
      aria-roledescription="carrousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); scrollTo(index - 1) }
        if (e.key === 'ArrowRight') { e.preventDefault(); scrollTo(index + 1) }
      }}
    >
      <div
        ref={trackRef}
        className="carousel-track"
        style={{ ['--per-view' as string]: perView }}
        tabIndex={0}
        aria-live="polite"
      >
        {children.map((child, i) => (
          <div
            className="carousel-slide"
            key={i}
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${count}`}
          >
            {child}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="carousel-nav prev"
        onClick={() => scrollTo(index - 1)}
        disabled={atStart && !autoPlayMs}
        aria-label="Diapositive précédente"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        className="carousel-nav next"
        onClick={() => scrollTo(index + 1)}
        disabled={atEnd && !autoPlayMs}
        aria-label="Diapositive suivante"
      >
        <ChevronRight size={20} />
      </button>

      <div className="carousel-dots">
        {children.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`carousel-dot ${i === index ? 'active' : ''}`}
            onClick={() => scrollTo(i)}
            aria-label={`Aller à la diapositive ${i + 1}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </div>
  )
}
