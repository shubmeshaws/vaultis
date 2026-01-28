'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Shield,
    Search,
    Filter,
    ChevronLeft,
    AlertTriangle,
    Clock,
    User,
    Database,
    FileText,
    X,
    Download,
    Eye,
    Activity
} from 'lucide-react'

// Mock audit log data
const auditLogs = [
    {
        id: '1',
        timestamp: '2026-01-29T00:01:23Z',
        user: 'dexter@queryflow.io',
        userName: 'Dexter Morgan',
        database: 'Production DB',
        queryType: 'DELETE',
        query: 'DELETE FROM users WHERE last_login < \'2025-01-01\'',
        riskLevel: 'high',
        affectedRows: 1247,
        executionTime: '234ms',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
        id: '2',
        timestamp: '2026-01-29T00:00:45Z',
        user: 'james@queryflow.io',
        userName: 'James Doakes',
        database: 'Analytics DB',
        queryType: 'SELECT',
        query: 'SELECT * FROM user_analytics WHERE date >= \'2026-01-01\' LIMIT 1000',
        riskLevel: 'low',
        affectedRows: 1000,
        executionTime: '89ms',
        ipAddress: '192.168.1.112',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
        id: '3',
        timestamp: '2026-01-28T23:58:12Z',
        user: 'deb@queryflow.io',
        userName: 'Debra Morgan',
        database: 'Production DB',
        queryType: 'UPDATE',
        query: 'UPDATE orders SET status = \'cancelled\' WHERE created_at < \'2025-12-01\'',
        riskLevel: 'medium',
        affectedRows: 523,
        executionTime: '156ms',
        ipAddress: '192.168.1.118',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
        id: '4',
        timestamp: '2026-01-28T23:55:34Z',
        user: 'admin@queryflow.io',
        userName: 'System Admin',
        database: 'Production DB',
        queryType: 'DROP',
        query: 'DROP TABLE temp_migration_backup',
        riskLevel: 'critical',
        affectedRows: 0,
        executionTime: '12ms',
        ipAddress: '192.168.1.100',
        userAgent: 'PostgreSQL Admin Tool v3.2'
    },
    {
        id: '5',
        timestamp: '2026-01-28T23:52:01Z',
        user: 'james@queryflow.io',
        userName: 'James Doakes',
        database: 'Staging DB',
        queryType: 'INSERT',
        query: 'INSERT INTO test_data (name, value) VALUES (\'test\', 123)',
        riskLevel: 'low',
        affectedRows: 1,
        executionTime: '23ms',
        ipAddress: '192.168.1.112',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
]

export default function AuditLogsPage() {
    const [selectedLog, setSelectedLog] = useState<typeof auditLogs[0] | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

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
            case 'UPDATE': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
            case 'INSERT': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
            default: return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
        }
    }

    return (
        <div className="space-y-6 p-8 relative min-h-full">
            {/* Dark Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/10 via-transparent to-amber-950/10 -z-10 pointer-events-none" />

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <a
                        href="/admin"
                        className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </a>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500">
                                Forensic Analysis
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Audit Trail</p>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground">Query Audit Logs</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            Complete forensic record of all database operations
                        </p>
                    </div>
                </div>

                {/* Filters Bar */}
                <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <select className="h-10 px-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm font-medium cursor-pointer">
                                <option>All Users</option>
                                <option>Dexter Morgan</option>
                                <option>James Doakes</option>
                                <option>Debra Morgan</option>
                            </select>
                            <select className="h-10 px-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm font-medium cursor-pointer">
                                <option>All Databases</option>
                                <option>Production DB</option>
                                <option>Analytics DB</option>
                                <option>Staging DB</option>
                            </select>
                            <select className="h-10 px-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm font-medium cursor-pointer">
                                <option>All Query Types</option>
                                <option>SELECT</option>
                                <option>INSERT</option>
                                <option>UPDATE</option>
                                <option>DELETE</option>
                                <option>DROP</option>
                            </select>
                            <select className="h-10 px-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm font-medium cursor-pointer">
                                <option>Last 24 Hours</option>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Custom Range</option>
                            </select>
                            <button className="h-10 px-4 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Audit Logs Table */}
            <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-foreground/[0.02] border-b border-foreground/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Timestamp</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Database</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Query Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Query Preview</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Risk</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Affected</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/5">
                                {auditLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        onClick={() => setSelectedLog(log)}
                                        className={`hover:bg-foreground/[0.02] transition-colors cursor-pointer group ${log.riskLevel === 'critical' || log.riskLevel === 'high' ? 'border-l-2 border-l-red-500/30' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
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
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{log.userName}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{log.user}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Database className="w-3.5 h-3.5 text-indigo-500" />
                                                <span className="text-sm font-medium text-foreground">{log.database}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${getQueryTypeColor(log.queryType)}`}>
                                                {log.queryType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-mono text-muted-foreground truncate max-w-md">
                                                {log.query}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {(log.riskLevel === 'critical' || log.riskLevel === 'high') && (
                                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                )}
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${getRiskColor(log.riskLevel)}`}>
                                                    {log.riskLevel}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-foreground">{log.affectedRows.toLocaleString()}</span>
                                            <span className="text-xs text-muted-foreground ml-1">rows</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                                            {selectedLog.affectedRows > 1000 && (
                                                <div className="flex items-center gap-2 text-xs text-amber-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                    <span>High volume: {selectedLog.affectedRows.toLocaleString()} rows affected</span>
                                                </div>
                                            )}
                                            {selectedLog.database === 'Production DB' && (
                                                <div className="flex items-center gap-2 text-xs text-orange-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                    <span>Production database modification</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-sm font-bold transition-colors">
                                    <Download className="w-4 h-4" />
                                    Export Record
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-sm font-bold transition-colors">
                                    <Eye className="w-4 h-4" />
                                    View Context
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
