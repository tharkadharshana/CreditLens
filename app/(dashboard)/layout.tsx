import React from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0f0f13] text-[#f1f5f9]">
      <header className="h-16 border-b border-[#2d2d3d] flex items-center px-6 sticky top-0 bg-[#0f0f13] z-10">
        <h1 className="text-xl font-bold text-indigo-500">CreditLens</h1>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
