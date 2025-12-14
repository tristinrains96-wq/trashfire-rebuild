'use client'

import * as React from 'react'
import Portal from '@/components/ui/Portal'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

type DrawerProps = React.HTMLAttributes<HTMLDivElement> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: 'bottom' | 'right' | 'left'
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ open, onOpenChange, side = 'bottom', className, children, ...props }, ref) => {
    const pathname = usePathname()
    const containerRef = React.useRef<HTMLDivElement | null>(null)

    // Close on route changes (e.g., switching sections)
    React.useEffect(() => {
      if (open) onOpenChange(false)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    // Close on Esc
    React.useEffect(() => {
      if (!open) return
      function handleKey(e: KeyboardEvent) {
        if (e.key === 'Escape') onOpenChange(false)
      }
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // Close on click outside
    function handleOverlayMouseDown() {
      onOpenChange(false)
    }

    const positionClasses = {
      bottom: 'bottom-0 left-0 right-0 translate-y-full',
      right: 'top-0 right-0 h-full translate-x-full',
      left: 'top-0 left-0 h-full -translate-x-full',
    }[side]

    const openClasses = {
      bottom: 'translate-y-0',
      right: 'translate-x-0',
      left: 'translate-x-0',
    }[side]

    return (
      <Portal>
        {/* Overlay sits above bottom stack; click = close */}
        <div
          aria-hidden={!open}
          className={cn(
            'fixed inset-0 z-[90] bg-black/50 transition-opacity duration-200',
            open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
          onMouseDown={handleOverlayMouseDown}
        />

        {/* Drawer container */}
        <div
          ref={(node) => {
            // keep forwarded ref and internal ref
            if (typeof ref === 'function') ref(node as HTMLDivElement)
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
            containerRef.current = node
          }}
          role="dialog"
          aria-modal="true"
          className={cn(
            'fixed z-[100] bg-surface border-t border-border rounded-t-2xl shadow-xl',
            'transition-transform duration-300',
            side !== 'bottom' && 'w-[min(92vw,420px)]',
            side === 'bottom' && 'left-0 right-0',
            positionClasses,
            open ? openClasses : ''
          )}
          {...props}
        >
          {children}
        </div>
      </Portal>
    )
  }
)

Drawer.displayName = 'Drawer'
export default Drawer
export { Drawer }
