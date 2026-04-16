import { Lightbulb } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface Props {
  suggestions: string[]
}

export function SavingsSuggestions({ suggestions }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-amber-500" />
          </div>
          <CardTitle>CFO Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {suggestions.length === 0 ? (
          <p className="text-sm text-gray-400">Add transactions to see personalized insights.</p>
        ) : (
          suggestions.map((s, i) => (
            <div key={i} className="flex gap-2.5 p-3 rounded-lg bg-amber-50/60 border border-amber-100">
              <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
