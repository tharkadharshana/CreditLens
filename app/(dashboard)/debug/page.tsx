'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Terminal, Activity, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface IngestionLog {
  id: string
  status: 'success' | 'error'
  error_message?: string
  raw_payload: Record<string, unknown>
  merchant?: string
  amount?: number
  created_at: string
}

export default function DebugPage() {
  const [logs, setLogs] = useState<IngestionLog[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // 1. Initial fetch
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('ingestion_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (data) setLogs(data)
    }

    fetchLogs()

    // 2. Realtime subscription
    const channel = supabase
      .channel('ingestion_logs_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ingestion_logs' },
        (payload) => {
          setLogs((prev) => [payload.new as IngestionLog, ...prev].slice(0, 20))
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
            <Terminal className="text-indigo-500" />
            Live Ingestion Feed
          </h1>
          <p className="text-[#94a3b8] text-sm flex items-center gap-2">
            Watch real-time data from your iPhone Shortcut
            <Badge variant="outline" className={isConnected ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5"}>
              {isConnected ? "Realtime Active" : "Connecting..."}
            </Badge>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-[#2d2d3d] bg-[#1a1a24] text-white">
          <CardHeader className="border-b border-[#2d2d3d]">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Incoming Stream (Most Recent 20)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-[#2d2d3d]">
                {logs.length === 0 ? (
                  <div className="p-12 text-center text-[#94a3b8] italic">
                    Waiting for first ingestion... Trigger your iPhone shortcut to see logs here.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-6 hover:bg-[#22222f]/50 transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {log.status === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-500" />
                            )}
                            <span className="font-semibold text-sm">
                              {log.merchant || (log.status === 'error' ? 'Failed Attempt' : 'Unknown Merchant')}
                            </span>
                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-[10px] h-5">
                              {log.status}
                            </Badge>
                          </div>
                          
                          {log.status === 'error' && (
                            <p className="text-xs text-rose-400 font-mono mt-1">
                              Error: {log.error_message}
                            </p>
                          )}

                          <div className="mt-4 bg-[#0f0f13] rounded p-3 border border-[#2d2d3d]">
                            <p className="text-[10px] text-[#64748b] uppercase mb-1 font-bold">Raw Payload</p>
                            <pre className="text-[10px] text-indigo-300 overflow-x-auto">
                              {JSON.stringify(log.raw_payload, null, 2)}
                            </pre>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          {log.amount && (
                            <div className="text-lg font-bold">
                              LKR {log.amount.toLocaleString()}
                            </div>
                          )}
                          <div className="text-[10px] text-[#94a3b8] flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
