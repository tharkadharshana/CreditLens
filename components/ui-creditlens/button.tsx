import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'secondary' | 'primary' | 'danger'
  children: React.ReactNode
}

export function Button({ variant = 'secondary', className, children, ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : ''
  
  return (
    <button 
      className={cn('btn', variantClass, className)}
      {...props}
    >
      {children}
    </button>
  )
}
