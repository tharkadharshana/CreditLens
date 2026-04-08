import React from 'react'
import { cn } from '@/lib/utils'

interface ToggleProps {
  isOn: boolean
  onToggle: (state: boolean) => void
  className?: string
}

export function Toggle({ isOn, onToggle, className }: ToggleProps) {
  return (
    <div 
      className={cn('toggle', isOn && 'on', className)}
      onClick={() => onToggle(!isOn)}
    />
  )
}
