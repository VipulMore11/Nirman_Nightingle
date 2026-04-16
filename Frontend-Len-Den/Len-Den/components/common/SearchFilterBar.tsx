'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

interface SearchFilterProps {
  onSearch?: (query: string) => void
  onFilterChange?: (filters: Record<string, any>) => void
  placeholder?: string
}

export default function SearchFilterBar({
  onSearch,
  onFilterChange,
  placeholder = 'Search assets, users, or transactions...',
}: SearchFilterProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    type: 'all',
  })

  const handleSearch = (value: string) => {
    setQuery(value)
    onSearch?.(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== 'all')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
            hasActiveFilters
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border text-foreground hover:bg-muted'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent"></span>}
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-card border border-border rounded-lg">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Status</label>
            <select
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={e => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Type</label>
            <select
              value={filters.type}
              onChange={e => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Types</option>
              <option value="real-estate">Real Estate</option>
              <option value="commodities">Commodities</option>
              <option value="art">Art</option>
              <option value="startup">Startup</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
