'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type IncomeSource = Database['public']['Tables']['income_sources']['Row']
type IncomeEntry = Database['public']['Tables']['income_entries']['Row']

interface IncomeSourceWithEntries extends IncomeSource {
  recent_entries: IncomeEntry[]
  monthly_total: number
}

interface IncomeSourceCardProps {
  source: IncomeSourceWithEntries
  onAddEntry: () => void
  onRefresh: () => void
}

function getIncomeTypeColor(type: string) {
  const colors = {
    salary: 'bg-green-100 text-green-800',
    freelance: 'bg-blue-100 text-blue-800',
    investment: 'bg-purple-100 text-purple-800',
    rental: 'bg-yellow-100 text-yellow-800',
    business: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-800',
  }
  return colors[type as keyof typeof colors] || colors.other
}

function getFrequencyText(frequency: string | null, isRecurring: boolean) {
  if (!isRecurring) return 'One-time'
  if (!frequency) return 'Recurring'
  
  const frequencies = {
    weekly: 'Weekly',
    'bi-weekly': 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly'
  }
  
  return frequencies[frequency as keyof typeof frequencies] || 'Recurring'
}

export default function IncomeSourceCard({ 
  source, 
  onAddEntry, 
  onRefresh 
}: IncomeSourceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this income source? This will also delete all associated entries.')) {
      return
    }

    setIsDeleting(true)
    try {
      // Delete all income entries first (due to foreign key constraint)
      await supabase
        .from('income_entries')
        .delete()
        .eq('income_source_id', source.id)

      // Then delete the income source
      const { error } = await supabase
        .from('income_sources')
        .delete()
        .eq('id', source.id)

      if (error) throw error
      
      onRefresh()
    } catch (error) {
      console.error('Error deleting income source:', error)
      alert('Failed to delete income source. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{source.name}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIncomeTypeColor(source.type)}`}>
              {source.type}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAddEntry}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Add Entry
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Frequency:</span>
            <span className="text-gray-900">{getFrequencyText(source.frequency, source.is_recurring)}</span>
          </div>
          
          {source.amount && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Expected Amount:</span>
              <span className="text-gray-900">${source.amount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-500">This Month:</span>
            <span className="text-green-600">${source.monthly_total.toLocaleString()}</span>
          </div>
        </div>

        {/* Recent Entries */}
        {source.recent_entries.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Entries</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {source.recent_entries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex justify-between items-center text-xs">
                  <div>
                    <div className="text-gray-900">
                      ${entry.amount.toLocaleString()}
                    </div>
                    {entry.description && (
                      <div className="text-gray-500 truncate max-w-32">
                        {entry.description}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            
            {source.recent_entries.length > 3 && (
              <div className="text-xs text-gray-500 mt-2">
                +{source.recent_entries.length - 3} more entries
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {source.recent_entries.length === 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="text-center py-4">
              <div className="text-gray-400 text-sm">No entries yet</div>
              <button
                onClick={onAddEntry}
                className="mt-2 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Add your first entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}