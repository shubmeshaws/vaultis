'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Search,
    Filter,
    AlertTriangle,
    Clock,
    Database,
    Download,
    Eye,
    X,
    ChevronLeft,
    FileText
} from 'lucide-react'
import Link from 'next/link'
import { getAuditLogs } from '@/lib/actions/auditActions'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { Portal } from '@/components/ui/Portal'
import { motion, AnimatePresence } from 'framer-motion'

interface AuditLog {
    id: string
    timestamp: string
    user: string
    userName: string
    database: string
    queryType: string
    query: string
    riskLevel: string
    affectedRows: number
    executionTime: string
    ipAddress: string
    userAgent: string
    status: string
}

interface User {
    id: string
    name: string | null
    email: string
}

interface DatabaseInfo {
    id: string
    name: string
}

interface AuditLogsClientProps {
    initialLogs: AuditLog[]
    users: User[]
    databases: DatabaseInfo[]
}

export function AuditLogsClient({ initialLogs, users, databases }: AuditLogsClientProps) {
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [userFilter, setUserFilter] = useState('all')
    const [databaseFilter, setDatabaseFilter] = useState('all')
    const [queryTypeFilter, setQueryTypeFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [logs, setLogs] = useState<AuditLog[]>(initialLogs)
    const [isLoading, setIsLoading] = useState(false)
    const [isLive, setIsLive] = useState(false)
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [exportRange, setExportRange] = useState({ start: '', end: '' })
    const [isExporting, setIsExporting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 20

    // Pagination calculations
    const totalPages = Math.ceil(logs.length / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedLogs = logs.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, userFilter, databaseFilter, queryTypeFilter, statusFilter, startDate, endDate])

    // Fetch logs when filters change
    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true)
            const result = await getAuditLogs({
                searchQuery,
                userId: userFilter,
                databaseId: databaseFilter,
                queryType: queryTypeFilter,
                status: statusFilter,
                startDate,
                endDate
            })
            if (result.success && result.logs) {
                setLogs(result.logs as any)
            }
            setIsLoading(false)
        }

        const debounce = setTimeout(() => {
            fetchLogs()
        }, 800) // Increased from 300ms to reduce server load

        return () => clearTimeout(debounce)
    }, [searchQuery, userFilter, databaseFilter, queryTypeFilter, statusFilter, startDate, endDate])

    // Live stream polling
    useEffect(() => {
        if (!isLive) return

        const interval = setInterval(async () => {
            const result = await getAuditLogs({
                searchQuery,
                userId: userFilter,
                databaseId: databaseFilter,
                queryType: queryTypeFilter,
                status: statusFilter,
                startDate,
                endDate
            })
            if (result.success && result.logs) {
                setLogs(result.logs as any)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [isLive, searchQuery, userFilter, databaseFilter, queryTypeFilter, statusFilter, startDate, endDate])

    const handleExport = async () => {
        setIsExporting(true)
        try {
            // Use selected export range or fall back to current filters if empty (though modal forces selection, initially empty means 'all time' or current)
            // If exporting from modal, use exportRange. If direct button (legacy), use current.
            // But we are moving to modal only.

            // Fetch comprehensive logs for export based on the selected range
            const result = await getAuditLogs({
                searchQuery,
                userId: userFilter,
                databaseId: databaseFilter,
                queryType: queryTypeFilter,
                status: statusFilter,
                startDate: exportRange.start || startDate,
                endDate: exportRange.end || endDate
            })

            const logsToExport = result.success && result.logs ? result.logs : logs

            const headers = ['Timestamp', 'User', 'Database', 'Query Type', 'Query', 'Risk Level', 'Affected Rows', 'Status', 'IP Address']
            const csvContent = [
                headers.join(','),
                ...logsToExport.map((log: any) => [
                    new Date(log.timestamp).toISOString(),
                    log.user,
                    log.database,
                    log.queryType,
                    `"${log.query.replace(/"/g, '""')}"`,
                    log.riskLevel,
                    log.affectedRows,
                    log.status,
                    log.ipAddress
                ].join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `audit_logs_${new Date().toISOString()}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            setIsExportModalOpen(false)
        } catch (error) {
            console.error('Export failed:', error)
        } finally {
            setIsExporting(false)
        }
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
            case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
            default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
        }
    }

    const getQueryTypeColor = (type: string) => {
        switch (type) {
            case 'DELETE': return 'text-red-500 bg-red-500/10 border-red-500/20'
            case 'DROP': return 'text-red-600 bg-red-600/10 border-red-600/20'
            case 'TRUNCATE': return 'text-red-600 bg-red-600/10 border-red-600/20'
            case 'ALTER': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
            case 'UPDATE': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
            case 'INSERT': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
            default: return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
        }
    }

    return (
        <div className="space-y-8 p-6 relative max-w-[1600px] mx-auto min-h-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-foreground/5 pb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all border border-foreground/5"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-1.5 shadow-sm">
                                <FileText className="w-3.5 h-3.5" />
                                Forensic Analysis
                            </div>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">/ Administration</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
                            Audit <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">Logs</span>
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium mt-2 max-w-xl">Complete forensic record of all database operations across the infrastructure</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-14 md:self-end">
                    <button
                        onClick={() => {
                            setExportRange({ start: startDate, end: endDate })
                            setIsExportModalOpen(true)
                        }}
                        className="h-10 px-6 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-foreground/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Export Log
                    </button>
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 ${isLive
                            ? 'bg-red-500 text-white shadow-red-500/20'
                            : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
                        {isLive ? 'Stop Stream' : 'Live Stream'}
                    </button>
                </div>
            </div>
            {/* Filters Bar */}
            <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm relative z-20">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search queries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <select
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            className="h-10 px-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm font-medium cursor-pointer hover:bg-foreground/10 hover:border-indigo-500/30 transition-all focus:outline-none focus:border-indigo-500/50"
                        >
                            <option value="all">All Users</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name || user.email}
                                </option>
                            ))}
                        </select>
                        <select
                            value={databaseFilter}
                            onChange={(e) => setDatabaseFilter(e.target.value)}
                            className="h-10 px-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm font-medium cursor-pointer hover:bg-foreground/10 hover:border-indigo-500/30 transition-all focus:outline-none focus:border-indigo-500/50"
                        >
                            <option value="all">All Databases</option>
                            {databases.map(db => (
                                <option key={db.id} value={db.id}>
                                    {db.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={queryTypeFilter}
                            onChange={(e) => setQueryTypeFilter(e.target.value)}
                            className="h-10 px-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm font-medium cursor-pointer hover:bg-foreground/10 hover:border-indigo-500/30 transition-all focus:outline-none focus:border-indigo-500/50"
                        >
                            <option value="all">All Query Types</option>
                            <option value="SELECT">SELECT</option>
                            <option value="INSERT">INSERT</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                            <option value="DROP">DROP</option>
                            <option value="TRUNCATE">TRUNCATE</option>
                            <option value="ALTER">ALTER</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 px-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm font-medium cursor-pointer hover:bg-foreground/10 hover:border-indigo-500/30 transition-all focus:outline-none focus:border-indigo-500/50"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="error">Failed</option>
                        </select>

                        <div className="h-10 w-[1px] bg-foreground/10 hidden md:block mx-1" />

                        <DateRangePicker
                            initialStart={startDate}
                            initialEnd={endDate}
                            onRangeChange={(range) => {
                                setStartDate(range.start)
                                setEndDate(range.end)
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {isLoading && (
                        <div className="p-12 text-center text-muted-foreground">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="mt-4">Loading logs...</p>
                        </div>
                    )}
                    {!isLoading && logs.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            <p className="text-lg font-semibold">No audit logs found</p>
                            <p className="text-sm mt-2">Try adjusting your filters</p>
                        </div>
                    )}
                    {!isLoading && logs.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-foreground/[0.02] border-b border-foreground/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Database</th>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Query Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Query Preview</th>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Risk</th>
                                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Affected</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-foreground/5">
                                    {paginatedLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className={`hover:bg-foreground/[0.02] transition-colors cursor-pointer group ${log.riskLevel === 'critical' || log.riskLevel === 'high' ? 'border-l-2 border-l-red-500/30' : ''
                                                }`}
                                        >
                                            <td className="px-6 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-mono text-foreground">
                                                        {new Date(log.timestamp).toLocaleString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2.5">
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{log.userName}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{log.user}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <Database className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span className="text-sm font-medium text-foreground">{log.database}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2.5">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${getQueryTypeColor(log.queryType)}`}>
                                                    {log.queryType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2.5">
                                                <p className="text-sm font-mono text-muted-foreground truncate max-w-md">
                                                    {log.query}
                                                </p>
                                            </td>
                                            <td className="px-6 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    {(log.riskLevel === 'critical' || log.riskLevel === 'high') && (
                                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                    )}
                                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${getRiskColor(log.riskLevel)}`}>
                                                        {log.riskLevel}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2.5">
                                                <span className="text-sm font-bold text-foreground">{log.affectedRows.toLocaleString()}</span>
                                                <span className="text-xs text-muted-foreground ml-1">rows</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!isLoading && logs.length > 0 && (
                        <div className="border-t border-foreground/5 p-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1}-{Math.min(endIndex, logs.length)} of {logs.length} logs
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-foreground/5 hover:bg-foreground/10 border border-foreground/10'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Side Drawer */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedLog(null)}
                    />

                    {/* Drawer */}
                    <div className="relative w-full max-w-2xl h-full bg-background border-l border-foreground/10 shadow-2xl overflow-y-auto">
                        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-foreground/10 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500">
                                            Forensic Detail
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${getRiskColor(selectedLog.riskLevel)}`}>
                                            {selectedLog.riskLevel} Risk
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-foreground">Query Execution Record</h2>
                                    <p className="text-sm text-muted-foreground mt-1">ID: {selectedLog.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Timestamp & User */}
                            <Card className="bg-card/50 backdrop-blur-xl border-foreground/10">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Execution Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timestamp</span>
                                        <span className="text-sm font-mono text-foreground">
                                            {new Date(selectedLog.timestamp).toLocaleString('en-US', {
                                                dateStyle: 'full',
                                                timeStyle: 'long'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User</span>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-foreground">{selectedLog.userName}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{selectedLog.user}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">IP Address</span>
                                        <span className="text-sm font-mono text-foreground">{selectedLog.ipAddress}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User Agent</span>
                                        <span className="text-xs font-mono text-muted-foreground max-w-xs truncate">{selectedLog.userAgent}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${selectedLog.status === 'success' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                            {selectedLog.status.toUpperCase()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Query Details */}
                            <Card className="bg-card/50 backdrop-blur-xl border-foreground/10">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Query Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Database</span>
                                        <span className="text-sm font-medium text-foreground">{selectedLog.database}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Query Type</span>
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${getQueryTypeColor(selectedLog.queryType)}`}>
                                            {selectedLog.queryType}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Execution Time</span>
                                        <span className="text-sm font-mono text-foreground">{selectedLog.executionTime}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Affected Rows</span>
                                        <span className="text-sm font-bold text-foreground">{selectedLog.affectedRows.toLocaleString()}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Full Query */}
                            <Card className={`backdrop-blur-xl border ${selectedLog.riskLevel === 'critical' || selectedLog.riskLevel === 'high'
                                ? 'bg-red-500/5 border-red-500/20'
                                : 'bg-card/50 border-foreground/10'
                                }`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Full Query</CardTitle>
                                        {(selectedLog.riskLevel === 'critical' || selectedLog.riskLevel === 'high') && (
                                            <div className="flex items-center gap-2 text-red-500">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Destructive Operation</span>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <pre className="p-4 bg-foreground/5 rounded-lg overflow-x-auto">
                                        <code className="text-sm font-mono text-foreground">{selectedLog.query}</code>
                                    </pre>
                                </CardContent>
                            </Card>

                            {/* Risk Indicators */}
                            <Card className="bg-card/50 backdrop-blur-xl border-foreground/10">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Risk Assessment</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Risk Level</span>
                                        <span className={`px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider border ${getRiskColor(selectedLog.riskLevel)}`}>
                                            {selectedLog.riskLevel}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Risk Factors</span>
                                        <div className="space-y-1">
                                            {selectedLog.queryType === 'DELETE' && (
                                                <div className="flex items-center gap-2 text-xs text-red-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                    <span>Destructive DELETE operation</span>
                                                </div>
                                            )}
                                            {selectedLog.queryType === 'DROP' && (
                                                <div className="flex items-center gap-2 text-xs text-red-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                    <span>Critical DROP TABLE operation</span>
                                                </div>
                                            )}
                                            {selectedLog.queryType === 'TRUNCATE' && (
                                                <div className="flex items-center gap-2 text-xs text-red-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                    <span>Critical TRUNCATE operation</span>
                                                </div>
                                            )}
                                            {selectedLog.affectedRows > 1000 && (
                                                <div className="flex items-center gap-2 text-xs text-amber-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                    <span>High volume: {selectedLog.affectedRows.toLocaleString()} rows affected</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Options Modal */}
            <Portal>
                <AnimatePresence>
                    {isExportModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsExportModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl bg-background border border-foreground/10 rounded-3xl shadow-2xl flex flex-col p-8 space-y-8"
                            >
                                <div className="text-center">
                                    <h2 className="text-xl font-black tracking-tight mb-2">Export Audit Logs</h2>
                                    <p className="text-sm text-muted-foreground">Select a date range to generate your forensic report.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Time Range</label>
                                    <DateRangePicker
                                        initialStart={exportRange.start}
                                        initialEnd={exportRange.end}
                                        onRangeChange={setExportRange}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setIsExportModalOpen(false)}
                                        className="flex-1 h-11 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-sm font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {isExporting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Preparing...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                Download CSV
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </Portal>
        </div>
    )
}
