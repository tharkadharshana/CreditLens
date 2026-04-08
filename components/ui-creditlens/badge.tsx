import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  type: 'category' | 'source' | 'role'
  className?: string
  children: React.ReactNode
  style?: React.CSSProperties
}

export function Badge({ type, className, children, style }: BadgeProps) {
  const baseClass = type === 'category' ? 'cat-badge' : type === 'source' ? 'source-badge' : 'role-badge'
  
  return (
    <span 
      className={cn(baseClass, className)}
      style={style}
    >
      {children}
    </span>
  )
}
