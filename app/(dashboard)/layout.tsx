import { Sidebar } from '@/components/sidebar'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[#0f0f13] text-[#f1f5f9] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-[#2d2d3d] flex items-center justify-between px-8 sticky top-0 bg-[#0f0f13]/80 backdrop-blur-md z-20">
          <div className="text-sm font-medium text-[#94a3b8]">
            Lobby &gt; <span className="text-white">Command Centre</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400">
              CL
            </div>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
