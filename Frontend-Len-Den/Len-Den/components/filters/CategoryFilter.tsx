'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface CategoryFilterProps {
  categories: string[]
  selected: string[]
  onChange: (categories: string[]) => void
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground block">Asset Category</label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selected.includes(category)
          return (
            <button
              key={category}
              onClick={() => {
                if (isSelected) {
                  onChange(selected.filter(c => c !== category))
                } else {
                  onChange([...selected, category])
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card border border-border text-foreground hover:border-accent/50'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Clear filters
        </button>
      )}
    </div>
  )
}
