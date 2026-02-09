'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Zap,
    Clock,
    Database,
    User as UserIcon,
    AlertCircle,
    CheckCircle2,
    Calendar,
    BarChart3,
    ArrowUpRight,
    Timer,
    ChevronDown,
    Filter,
    ChevronLeft
} from 'lucide-react'
import Link from 'next/link'
import { getAnalyzerData } from '@/lib/actions/analyzerActions'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface QueryData {
    id: string
    sql: string
    executionTime: string
    status: string
    createdAt: string
    userName: string
    userEmail: string
    databaseName: string
}

interface AnalyzerClientProps {
    initialData: {
        slowestQueries: QueryData[]
        latestQueries: QueryData[]
    }
}

export function AnalyzerClient({ initialData }: AnalyzerClientProps) {
    const [data, setData] = useState(initialData)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [minDuration, setMinDuration] = useState<number>(0)
    const [isLoading, setIsLoading] = useState({ slowest: false, latest: false })
    const [isMounted, setIsMounted] = useState(false)
    const [isDurationOpen, setIsDurationOpen] = useState(false)
    const durationRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setIsMounted(true)
        const handleClickOutside = (event: MouseEvent) => {
            if (durationRef.current && !durationRef.current.contains(event.target as Node)) {
                setIsDurationOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Isolated Recent Activity Fetch (Only on Date Change)
    useEffect(() => {
        const fetchLatest = async () => {
            setIsLoading(prev => ({ ...prev, latest: true }))
            const result = await getAnalyzerData({ startDate, endDate, target: 'latest' })
            if (result.success) {
                setData(prev => ({ ...prev, latestQueries: result.latestQueries || [] }))
            }
            setIsLoading(prev => ({ ...prev, latest: false }))
        }

        if (isMounted) fetchLatest()
    }, [startDate, endDate, isMounted])

    // Isolated Bottlenecks Fetch (On Date OR MinDuration Change)
    useEffect(() => {
        const fetchSlowest = async () => {
            setIsLoading(prev => ({ ...prev, slowest: true }))
            const result = await getAnalyzerData({ startDate, endDate, minDuration, target: 'slowest' })
            if (result.success) {
                setData(prev => ({ ...prev, slowestQueries: result.slowestQueries || [] }))
            }
            setIsLoading(prev => ({ ...prev, slowest: false }))
        }

        if (isMounted) fetchSlowest()
    }, [startDate, endDate, minDuration, isMounted])

    const QueryCard = ({ query, type }: { query: QueryData; type: 'slowest' | 'latest' }) => (
        <div className="group relative bg-foreground/[0.02] dark:bg-white/[0.02] border border-foreground/5 dark:border-white/5 rounded-xl p-4 hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg",
                        type === 'slowest' ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"
                    )}>
                        {type === 'slowest' ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground dark:text-white/90">{query.userName}</span>
                            <span className="text-[10px] text-muted-foreground bg-foreground/5 dark:bg-white/5 px-1.5 py-0.5 rounded italic">
                                {query.databaseName}
                            </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                            <span>{isMounted ? new Date(query.createdAt).toLocaleString() : ''}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className={cn(
                        "text-xs font-mono font-black",
                        type === 'slowest' ? "text-amber-500" : "text-indigo-400"
                    )}>
                        {query.executionTime}
                    </span>
                    <div className="mt-1">
                        {query.status === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
                        ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500/70" />
                        )}
                    </div>
                </div>
            </div>

            <div className="relative group/sql">
                <pre className="text-[11px] font-mono bg-black/20 dark:bg-black/40 p-3 rounded-lg border border-foreground/5 dark:border-white/5 overflow-x-auto text-muted-foreground group-hover/sql:text-foreground dark:group-hover/sql:text-white/80 transition-colors">
                    <code>{query.sql}</code>
                </pre>
            </div>
        </div>
    )

    return (
        <div className="space-y-8 p-6 relative max-w-[1600px] mx-auto min-h-full">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-foreground/5 pb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all border border-foreground/5"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-1.5 shadow-sm">
                                <BarChart3 className="w-3.5 h-3.5" />
                                System Telemetry
                            </div>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">/ Administration</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none italic flex flex-wrap items-center gap-x-4">
                            Query <span className="text-primary not-italic">Analyzer</span>
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium mt-2 max-w-xl">Real-time performance metrics and query activity insights</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 mr-8 mt-14 md:self-end">
                    <DateRangePicker
                        initialStart={startDate}
                        initialEnd={endDate}
                        onRangeChange={(range) => {
                            setStartDate(range.start)
                            setEndDate(range.end)
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Slowest Queries Section */}
                <Card className="bg-card/30 backdrop-blur-xl border-foreground/10 dark:border-white/5 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent pointer-events-none" />
                    <CardHeader className="border-b border-foreground/5 dark:border-white/5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black flex items-center gap-2 text-amber-500/90">
                                    <Zap className="w-5 h-5" />
                                    Performance Bottlenecks
                                </CardTitle>
                                <CardDescription className="text-xs italic mt-0.5">
                                    {minDuration > 0
                                        ? `Top 10 slowest queries taking more than ${minDuration >= 60000 ? `${minDuration / 60000}m` : `${minDuration / 1000}s`}.`
                                        : "Top 10 most time-taking queries for the selected period."}
                                </CardDescription>
                            </div>

                            {/* Duration Filter Popover */}
                            <div className="relative" ref={durationRef}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsDurationOpen(!isDurationOpen)}
                                    className={cn(
                                        "h-8 px-2 text-[10px] font-black uppercase tracking-widest gap-2 bg-foreground/5 border-foreground/10 hover:border-amber-500/30 transition-all",
                                        isDurationOpen && "border-amber-500/50 ring-2 ring-amber-500/10"
                                    )}
                                >
                                    <Filter className="w-3 h-3 text-amber-500" />
                                    <span>{minDuration === 0 ? 'All' : `>${minDuration >= 60000 ? minDuration / 60000 + 'm' : minDuration / 1000 + 's'}`}</span>
                                    <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", isDurationOpen && "rotate-180")} />
                                </Button>

                                <AnimatePresence>
                                    {isDurationOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 4, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.1 }}
                                            className="absolute z-[100] top-full right-0 mt-1 min-w-[140px]"
                                        >
                                            <Card className="bg-background/95 backdrop-blur-xl border border-foreground/10 shadow-2xl overflow-hidden p-1">
                                                <div className="flex flex-col gap-0.5">
                                                    {[
                                                        { label: 'All Queries', value: 0 },
                                                        { label: '> 30 Seconds', value: 30000 },
                                                        { label: '> 1 Minute', value: 60000 },
                                                        { label: '> 5 Minutes', value: 300000 },
                                                        { label: '> 15 Minutes', value: 900000 },
                                                        { label: '> 30 Minutes', value: 1800000 },
                                                        { label: '> 1 Hour', value: 3600000 },
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => {
                                                                setMinDuration(opt.value)
                                                                setIsDurationOpen(false)
                                                            }}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-left transition-all",
                                                                minDuration === opt.value
                                                                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                                                    : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </Card>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {isLoading.slowest ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-foreground/5 dark:bg-white/5 rounded-xl" />
                                ))}
                            </div>
                        ) : data.slowestQueries.length > 0 ? (
                            data.slowestQueries.map(query => (
                                <QueryCard key={query.id} query={query} type="slowest" />
                            ))
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground italic border-2 border-dashed border-foreground/5 dark:border-white/5 rounded-2xl">
                                <AlertCircle className="w-8 h-8 opacity-20 mb-2" />
                                <span className="text-sm">No performance data found.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Latest Queries Section */}
                <Card className="bg-card/30 backdrop-blur-xl border-foreground/10 dark:border-white/5 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />
                    <CardHeader className="border-b border-foreground/5 dark:border-white/5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black flex items-center gap-2 text-indigo-400">
                                    <Clock className="w-5 h-5" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription className="text-xs italic mt-0.5">
                                    Live stream of the latest top 10 queries.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {isLoading.latest ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-foreground/5 dark:bg-white/5 rounded-xl" />
                                ))}
                            </div>
                        ) : data.latestQueries.length > 0 ? (
                            data.latestQueries.map(query => (
                                <QueryCard key={query.id} query={query} type="latest" />
                            ))
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground italic border-2 border-dashed border-foreground/5 dark:border-white/5 rounded-2xl">
                                <AlertCircle className="w-8 h-8 opacity-20 mb-2" />
                                <span className="text-sm">No recent activity found.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
