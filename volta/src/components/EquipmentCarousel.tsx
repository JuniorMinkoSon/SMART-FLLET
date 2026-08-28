import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from './ui'

interface Props {
  equipment: any[]
  title?: string
  showArrows?: boolean
}

export default function EquipmentCarousel({ equipment, title, showArrows = true }: Props) {
  const scrollContainer = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)

  const checkScroll = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainer.current
    if (!container) return

    const scrollAmount = 400
    const newScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    })

    setTimeout(checkScroll, 300)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainer.current) return

    const diff = dragStart - e.clientX
    scrollContainer.current.scrollLeft += diff
    checkScroll()
  }

  if (equipment.length === 0) {
    return null
  }

  return (
    <div className="relative group">
      {title && (
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-slate-700">({equipment.length} équipements)</span>
        </h3>
      )}

      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollContainer}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: 'smooth' }}
        >
          {equipment.map((item, idx) => (
            <Link key={item.id} to={`/equipment/${item.id}`}>
              <div
                className="flex-shrink-0 w-72 group/card transition-all duration-300"
                style={{
                  animation: `fadeInSlide 0.5s ease-out ${idx * 50}ms backwards`,
                }}
              >
                <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden bg-slate-200">
                    <img
                      src={item.photos[0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-125"
                      draggable={false}
                    />

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/card:opacity-100">
                      <div className="text-white font-bold flex items-center gap-2 transform -translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                        Voir détails
                        <span>→</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    {item.category && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-2">
                      <h4 className="font-bold text-slate-900 line-clamp-2 group-hover/card:text-slate-700 transition">
                        {item.name}
                      </h4>
                    </div>

                    <div className="text-xs text-slate-700 mb-3 line-clamp-1">
                      {item.brand} {item.model} • {item.year}
                    </div>

                    <div className="text-xs text-slate-600 mb-4 flex items-center gap-1">
                      📍 {item.location}
                    </div>

                    {/* CTA */}
                    <div className="pt-4 border-t border-slate-200">
                      <button className="w-full px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all duration-300">
                        📧 Demander devis
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation Buttons */}
        {showArrows && (
          <>
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-5 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 text-slate-900 hover:text-slate-700 text-xl font-bold"
              >
                ‹
              </button>
            )}

            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-5 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 text-slate-900 hover:text-slate-700 text-xl font-bold"
              >
                ›
              </button>
            )}
          </>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
