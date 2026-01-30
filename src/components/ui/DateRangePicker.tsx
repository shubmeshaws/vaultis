'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, Clock, X } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface DateRange {
    start: string
    end: string
}

interface DateRangePickerProps {
    onRangeChange: (range: DateRange) => void
    initialStart?: string
    initialEnd?: string
}

const PRESETS = [
    { label: 'All Time', getValue: () => ({ start: '', end: '' }) },
    {
        label: 'Last 5 Minutes', getValue: () => {
            const now = new Date()
            const start = new Date(now.getTime() - 5 * 60 * 1000)
            return { start: start.toISOString().slice(0, 16), end: now.toISOString().slice(0, 16) }
        }
    },
    {
        label: 'Last 1 Hour', getValue: () => {
            const now = new Date()
            const start = new Date(now.getTime() - 60 * 60 * 1000)
            return { start: start.toISOString().slice(0, 16), end: now.toISOString().slice(0, 16) }
        }
    },
    {
        label: 'Last 6 Hours', getValue: () => {
            const now = new Date()
            const start = new Date(now.getTime() - 6 * 60 * 60 * 1000)
            return { start: start.toISOString().slice(0, 16), end: now.toISOString().slice(0, 16) }
        }
    },
    {
        label: 'Last 12 Hours', getValue: () => {
            const now = new Date()
            const start = new Date(now.getTime() - 12 * 60 * 60 * 1000)
            return { start: start.toISOString().slice(0, 16), end: now.toISOString().slice(0, 16) }
        }
    },
    {
        label: 'Last 24 Hours', getValue: () => {
            const now = new Date()
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            return { start: start.toISOString().slice(0, 16), end: now.toISOString().slice(0, 16) }
        }
    },
    {
        label: 'Last 7 Days', getValue: () => {
            const now = new Date()
            const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return { start: start.toISOString().slice(0, 16), end: now.toISOString().slice(0, 16) }
        }
    },
    {
        label: 'Last 30 Days', getValue: () => {
            const now = new Date()
            const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return { start: start.toISOString().slice(0, 16), end: now.toISOString().slice(0, 16) }
        }
    }
]

export function DateRangePicker({ onRangeChange, initialStart = '', initialEnd = '' }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [startDate, setStartDate] = useState(initialStart)
    const [endDate, setEndDate] = useState(initialEnd)
    const [activePreset, setActivePreset] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleApply = () => {
        onRangeChange({ start: startDate, end: endDate })
        setIsOpen(false)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        setStartDate('')
        setEndDate('')
        setActivePreset(null)
        onRangeChange({ start: '', end: '' })
    }

    const applyPreset = (preset: typeof PRESETS[0]) => {
        const { start, end } = preset.getValue()
        setStartDate(start)
        setEndDate(end)
        setActivePreset(preset.label)
        onRangeChange({ start, end })
        setIsOpen(false)
    }

    const getRangeLabel = () => {
        if (activePreset) return activePreset
        if (!startDate && !endDate) return 'Select Date Range'

        try {
            const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '...'
            const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Now'
            return `${start} - ${end}`
        } catch (e) {
            return 'Invalid Range'
        }
    }

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="outline"
                className={cn(
                    "h-10 px-4 justify-start text-left font-medium w-full md:min-w-[240px] bg-foreground/5 border-foreground/10 hover:bg-foreground/10 hover:border-indigo-500/30 transition-all gap-2",
                    isOpen && "border-indigo-500/50 ring-2 ring-indigo-500/10"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Clock className="w-4 h-4 text-indigo-500" />
                <span className="truncate flex-1">{getRangeLabel()}</span>
                {(startDate || endDate) && (
                    <div
                        onClick={handleClear}
                        className="p-1 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </div>
                )}
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform opacity-50", isOpen && "rotate-180")} />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-[100] top-full right-0 mt-2 min-w-[320px]"
                    >
                        <Card className="bg-background/95 backdrop-blur-xl border border-foreground/10 shadow-2xl overflow-hidden p-2">
                            <div className="grid grid-cols-2 gap-1 mb-3">
                                {PRESETS.map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => applyPreset(preset)}
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-xs font-bold text-left transition-all",
                                            activePreset === preset.label
                                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                                : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3 pt-3 border-t border-foreground/5 p-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Custom Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-muted-foreground ml-1">From</p>
                                            <input
                                                type="datetime-local"
                                                value={startDate}
                                                onChange={(e) => {
                                                    setStartDate(e.target.value)
                                                    setActivePreset(null)
                                                }}
                                                className="w-full h-8 px-2 bg-foreground/5 border border-foreground/10 rounded-md text-xs font-medium focus:outline-none focus:border-indigo-500/50"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-muted-foreground ml-1">To</p>
                                            <input
                                                type="datetime-local"
                                                value={endDate}
                                                onChange={(e) => {
                                                    setEndDate(e.target.value)
                                                    setActivePreset(null)
                                                }}
                                                className="w-full h-8 px-2 bg-foreground/5 border border-foreground/10 rounded-md text-xs font-medium focus:outline-none focus:border-indigo-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button size="sm" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white h-8 text-xs font-bold" onClick={handleApply}>
                                    Apply Custom Range
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
