"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CarouselProps {
  children: React.ReactNode
  className?: string
  autoPlay?: boolean
  showArrows?: boolean
  showDots?: boolean
}

export function Carousel({
  children,
  className,
  autoPlay = false,
  showArrows = true,
  showDots = true,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const childrenArray = React.Children.toArray(children)
  const totalSlides = childrenArray.length

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
  }

  React.useEffect(() => {
    if (autoPlay && totalSlides > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [autoPlay, totalSlides])

  return (
    <div className={cn("relative w-full", className)}>
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {childrenArray.map((child, index) => (
            <div key={index} className="min-w-full flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>

      {showArrows && totalSlides > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/10"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/10"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {showDots && totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {childrenArray.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentIndex
                  ? "w-8 bg-[#00ffea] shadow-[0_0_8px_rgba(0,255,234,0.5)]"
                  : "w-2 bg-white/20 hover:bg-white/30"
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CarouselItemProps {
  children: React.ReactNode
  className?: string
}

export function CarouselItem({ children, className }: CarouselItemProps) {
  return <div className={cn("w-full", className)}>{children}</div>
}

