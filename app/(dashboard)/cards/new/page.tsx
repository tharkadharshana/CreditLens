'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function AddCardPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Form fields
  const [bankName, setBankName] = useState('')
  const [cardName, setCardName] = useState('')
  const [lastFour, setLastFour] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [statementDay, setStatementDay] = useState('1')
  const [dueDay, setDueDay] = useState('15')

  const handleSubmit = async (e: React.FormEvent) => {
    const supabase = createClient()
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to add a card')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('credit_cards')
      .insert({
        user_id: user.id,
        bank_name: bankName,
        card_name: cardName,
        last_four: lastFour,
        credit_limit: parseFloat(creditLimit),
        statement_day: parseInt(statementDay),
        due_day: parseInt(dueDay),
        card_network: 'visa', // Default for now
      })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="border-[#2d2d3d] bg-[#1a1a24] text-[#f1f5f9]">
        <CardHeader>
          <CardTitle>Add New Credit Card</CardTitle>
          <CardDescription className="text-[#94a3b8]">Register a card to start tracking transactions</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {error && <div className="col-span-full p-3 text-sm bg-red-500/10 border border-red-500/50 text-red-500 rounded">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input 
                id="bankName" 
                placeholder="e.g. HSBC" 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
                className="bg-[#0f0f13] border-[#2d2d3d]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Card Name</Label>
              <Input 
                id="cardName" 
                placeholder="e.g. Platinum Visa" 
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                className="bg-[#0f0f13] border-[#2d2d3d]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastFour">Last 4 Digits</Label>
              <Input 
                id="lastFour" 
                placeholder="1234" 
                maxLength={4}
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value)}
                required
                className="bg-[#0f0f13] border-[#2d2d3d]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditLimit">Credit Limit (LKR)</Label>
              <Input 
                id="creditLimit" 
                type="number"
                placeholder="100000" 
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                required
                className="bg-[#0f0f13] border-[#2d2d3d]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statementDay">Statement Day (1-31)</Label>
              <Input 
                id="statementDay" 
                type="number"
                min="1"
                max="31"
                value={statementDay}
                onChange={(e) => setStatementDay(e.target.value)}
                required
                className="bg-[#0f0f13] border-[#2d2d3d]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDay">Due Day (1-31)</Label>
              <Input 
                id="dueDay" 
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                required
                className="bg-[#0f0f13] border-[#2d2d3d]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Adding...' : 'Add Card'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
