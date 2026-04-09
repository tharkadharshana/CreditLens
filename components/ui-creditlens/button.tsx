import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'secondary' | 'primary'
  children: React.ReactNode
}

export function Button({ variant = 'secondary', className, children, ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn-primary' : ''
  
  return (
    <button 
      className={cn('btn', variantClass, className)}
      {...props}
    >
      {children}
    </button>
  )
}
