import { createContext, useContext, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

const TabsContext = createContext<{ value: string; onValueChange: (value: string) => void } | null>(null)

export function Tabs({ value, onValueChange, className, children }: { value: string; onValueChange: (value: string) => void; className?: string; children: ReactNode }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('grid gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-100 p-1', className)} {...props} />
}

export function TabsTrigger({ value, className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  return (
    <button
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors',
        context.value === value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950',
        className,
      )}
      onClick={() => context.onValueChange(value)}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }: HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')
  if (context.value !== value) return null

  return <div className={cn('grid gap-4', className)}>{children}</div>
}
