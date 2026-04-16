'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, X, Sparkles, ShieldCheck, TrendingUp, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  title: string
  content: string
  target?: string
  icon: any
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const TOUR_STEPS: Step[] = [
  {
    title: "Welcome to Len-Den",
    content: "The world's first premium RWA (Real World Asset) fractional investment platform. Let's take a quick tour of your new investment powerhouse.",
    icon: Sparkles,
    position: 'center'
  },
  {
    title: "Real-Time Portfolio Value",
    content: "This is your total net worth on the platform, including real estate, gold, and startups. It updates instantly with market movements.",
    target: "portfolio-value",
    icon: ShieldCheck,
    position: 'bottom'
  },
  {
    title: "Performance & ROI",
    content: "Track your unrealized gains and overall yield here. We use blockchain transparency to ensure every ₹1 of profit is verified.",
    target: "unrealized-gains",
    icon: TrendingUp,
    position: 'bottom'
  },
  {
    title: "Deep Asset Drill-down",
    content: "View every single unit you own. Check P&L, dividend history, and verified legal documents for each investment.",
    target: "your-holdings",
    icon: LayoutGrid,
    position: 'right'
  },
  {
    title: "Grow Your Wealth",
    content: "Ready to diversify? Head to the Marketplace to discover institutional-grade assets starting from just ₹1,000.",
    target: "add-asset-btn",
    icon: Plus,
    position: 'left'
  }
]

import { Plus } from 'lucide-react'

export function GuidedTour() {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour')
    if (!hasSeenTour) {
      setIsVisible(true)
      setCurrentStep(0)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTour()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeTour = () => {
    localStorage.setItem('hasSeenTour', 'true')
    setIsVisible(false)
    setCurrentStep(-1)
  }

  if (!isVisible || currentStep === -1) return null

  const step = TOUR_STEPS[currentStep]
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Dimmed Background */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] pointer-events-auto" onClick={completeTour} />
      
      {/* Tour Card */}
      <div className={cn(
        "absolute z-[210] pointer-events-auto transition-all duration-500",
        step.position === 'center' ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm" : "w-80",
        step.position === 'bottom' && "top-[var(--target-bottom)] left-[var(--target-left)] mt-4",
        step.position === 'right' && "top-[var(--target-top)] left-[var(--target-right)] ml-4",
        step.position === 'left' && "top-[var(--target-top)] right-[calc(100vw-var(--target-left))] mr-4",
      )}
      style={{
        '--target-top': '0px',
        '--target-left': '0px',
        '--target-right': '0px',
        '--target-bottom': '0px',
      } as any}
      id="tour-card"
      >
        <Card className="p-6 border-accent/20 bg-card/90 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors" />
          
          <button 
            onClick={completeTour}
            className="absolute right-3 top-3 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-bold text-lg leading-tight">{step.title}</h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {step.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i === currentStep ? "bg-accent w-4" : "bg-muted"
                  )} 
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="ghost" size="sm" onClick={handlePrev} className="h-8 w-8 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" onClick={handleNext} className="gap-2 bg-accent hover:bg-accent/90">
                {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Target Highlight Effect (Virtual) */}
      {step.target && (
         <TourHighlight targetId={step.target} setVisible={setIsVisible} />
      )}
    </div>
  )
}

function TourHighlight({ targetId, setVisible }: { targetId: string, setVisible: (v: boolean) => void }) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const el = document.getElementById(targetId)
    if (el) {
      const update = () => {
        const r = el.getBoundingClientRect()
        setRect(r)
        
        const card = document.getElementById('tour-card')
        if (card) {
          card.style.setProperty('--target-top', `${r.top}px`)
          card.style.setProperty('--target-left', `${r.left}px`)
          card.style.setProperty('--target-right', `${r.right}px`)
          card.style.setProperty('--target-bottom', `${r.bottom}px`)
        }
      }
      update()
      window.addEventListener('resize', update)
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return () => window.removeEventListener('resize', update)
    }
  }, [targetId])

  if (!rect) return null

  return (
    <div 
      className="absolute border-2 border-accent rounded-2xl z-[205] shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-500"
      style={{
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      }}
    />
  )
}
