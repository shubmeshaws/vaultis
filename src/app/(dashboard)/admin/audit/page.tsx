'use client'

import React, { useState } from 'react'
import { AuditLogTable, AuditEntry } from '@/components/admin/AuditLogTable'
import { AuditLogDrawer } from '@/components/admin/AuditLogDrawer'

const Icons = {
    Search: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    Download: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    ),
    Filter: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
    ),
    Calendar: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Terminal: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
}

export default function AuditLogPage() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const entries: AuditEntry[] = [
        {
            id: 'log_98234-AX',
            timestamp: '2026-01-27 15:42:01.002',
            user: { name: 'Dexter Morgan', email: 'dexter@queryflow.io' },
            database: 'prod-core-01',
            operation: 'DROP',
            query: 'TABLE temp_logs_archive',
            risk: 'Critical',
            duration: 1240,
            status: 'Success'
        },
        {
            id: 'log_98235-BY',
            timestamp: '2026-01-27 15:45:12.441',
            user: { name: 'James Doakes', email: 'doakes@queryflow.io' },
            database: 'prod-inventory-04',
            operation: 'UPDATE',
            query: 'inventory_items SET stock = stock - 1 WHERE sku = "X-901"',
            risk: 'Low',
            duration: 45,
            status: 'Success'
        },
        {
            id: 'log_98236-CZ',
            timestamp: '2026-01-27 16:02:44.912',
            user: { name: 'Debra Morgan', email: 'deb@queryflow.io' },
            database: 'prod-billing-02',
            operation: 'SELECT',
            query: 'FROM invoices WHERE created_at > "2026-01-01"',
            risk: 'Low',
            duration: 22,
            status: 'Success'
        },
        {
            id: 'log_98237-DK',
            timestamp: '2026-01-27 16:15:33.110',
            user: { name: 'Vince Masuka', email: 'masuka@queryflow.io' },
            database: 'prod-core-01',
            operation: 'TRUNCATE',
            query: 'TABLE analytics_raw_events',
            risk: 'High',
            duration: 890,
            status: 'Success'
        },
        {
            id: 'log_98238-EL',
            timestamp: '2026-01-27 16:20:11.554',
            user: { name: 'Angel Batista', email: 'batista@queryflow.io' },
            database: 'dev-scratch-01',
            operation: 'DELETE',
            query: 'FROM sandbox_users WHERE id = 10',
            risk: 'Medium',
            duration: 12,
            status: 'Success'
        }
    ]

    const handleSelectEntry = (entry: AuditEntry) => {
        setSelectedEntry(entry)
        setIsDrawerOpen(true)
    }

    const filteredEntries = entries.filter(e =>
        e.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.operation.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground">
                            <Icons.Terminal className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic px-1">Forensic <span className="text-primary not-italic">Audit Log</span></h1>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg ml-1">Comprehensive platform activity and session traceability.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground font-black text-xs uppercase tracking-widest hover:text-foreground hover:bg-white/10 transition-all">
                        <Icons.Download className="w-4 h-4" />
                        Export Archive
                    </button>
                </div>
            </header>

            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-3xl p-5">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search forensic records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all w-80"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                        <Icons.Filter className="w-3.5 h-3.5" />
                        Op: All
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                        <Icons.Calendar className="w-3.5 h-3.5" />
                        Last 24 Hours
                    </button>
                </div>
                <div className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                    Trace Record Status: <span className="text-emerald-400">ENCRYPTED & AUTHENTICATED</span>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="relative">
                <AuditLogTable
                    entries={filteredEntries}
                    onSelectEntry={handleSelectEntry}
                />

                {/* Forensic Overlays */}
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
            </div>

            <AuditLogDrawer
                entry={selectedEntry}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    )
}
