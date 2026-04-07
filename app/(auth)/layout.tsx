import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0f0f13] text-[#f1f5f9] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-500 mb-2">CreditLens</h1>
          <p className="text-[#94a3b8]">Your complete credit command centre</p>
        </div>
        {children}
      </div>
    </div>
  )
}
