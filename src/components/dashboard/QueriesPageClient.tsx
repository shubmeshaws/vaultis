'use client'

import React, { useState } from 'react'
import { QueryEditor } from '@/components/editor/QueryEditor'
import { QueryStatusPanel } from '@/components/dashboard/QueryStatusPanel'
import { QueryResultsTable } from '@/components/dashboard/QueryResultsTable'
import { DownloadHistoryPanel } from '@/components/dashboard/DownloadHistoryPanel'
import { SavedQueriesPanel } from '@/components/dashboard/SavedQueriesPanel'
import { Sparkles } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

type TabType = 'editor' | 'saved' | 'history'

export function QueriesPageClient() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const activeTab = (searchParams.get('tab') as TabType) || 'editor'

    const setActiveTab = (tab: TabType) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)
        router.push(`/queries?${params.toString()}`)
    }

    return (
        <div className="space-y-6 p-2 lg:p-4 min-h-full">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Query Explorer
                    </h1>
                    <p className="text-muted-foreground text-[10px] font-medium mt-0.5">
                        Write, execute, and analyze database operations
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-foreground/5 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'editor'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'saved'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Saved
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'editor' && (
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Main Workspace */}
                    <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
                        <QueryEditor />

                        {/* Results Area */}
                        <QueryResultsTable
                            columns={[
                                { key: 'id', label: 'ID', width: 100 },
                                { key: 'name', label: 'User', width: 200 },
                                { key: 'email', label: 'Email', width: 250 },
                                { key: 'role', label: 'Role', width: 120 },
                                { key: 'status', label: 'Status', width: 120 },
                            ]}
                            data={Array.from({ length: 25 }, (_, i) => ({
                                id: `#829${i + 1}`,
                                name: 'Alex Johnson',
                                email: 'alex@example.com',
                                role: 'Admin',
                                status: 'Active'
                            }))}
                            totalRows={25}
                            executionTime="142ms"
                        />
                    </div>

                    {/* Sidecar (Status & Quick History) */}
                    <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
                        {/* Status Panel */}
                        <QueryStatusPanel stats={{
                            status: 'success',
                            executionTime: '142ms',
                            rowsAffected: 12,
                            dataSize: '2.4 KB',
                            message: 'Query executed successfully.'
                        }} />

                        {/* Download History - Now always visible or accessible above results on mobile/tablet */}
                        <div className="bg-card/50 dark:bg-card/20 backdrop-blur-xl rounded-2xl border border-foreground/5 dark:border-white/5 p-4">
                            <DownloadHistoryPanel
                                downloads={[
                                    {
                                        id: '1',
                                        fileName: 'users_export_2024.csv',
                                        fileType: 'csv',
                                        size: '2.4 KB',
                                        createdAt: '2 mins ago',
                                        queryPreview: 'SELECT * FROM users LIMIT 10'
                                    },
                                    {
                                        id: '2',
                                        fileName: 'analytics_data.json',
                                        fileType: 'json',
                                        size: '5.8 KB',
                                        createdAt: '15 mins ago',
                                        queryPreview: 'SELECT COUNT(*) FROM events'
                                    },
                                    {
                                        id: '3',
                                        fileName: 'report_Q1_2024.xlsx',
                                        fileType: 'excel',
                                        size: '12.3 KB',
                                        createdAt: '1 hour ago',
                                        queryPreview: 'SELECT * FROM sales WHERE...'
                                    }
                                ]}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'saved' && (
                <SavedQueriesPanel
                    queries={[
                        {
                            id: '1',
                            name: 'Active Users Report',
                            query: 'SELECT * FROM users WHERE status = \'active\' ORDER BY created_at DESC',
                            database: 'Production',
                            lastExecuted: '2 hours ago',
                            isFavorite: true
                        },
                        {
                            id: '2',
                            name: 'Monthly Revenue',
                            query: 'SELECT DATE_TRUNC(\'month\', created_at) as month, SUM(amount) FROM orders GROUP BY month',
                            database: 'Analytics',
                            lastExecuted: '1 day ago',
                            isFavorite: false
                        },
                        {
                            id: '3',
                            name: 'Top Products',
                            query: 'SELECT product_id, COUNT(*) as sales FROM orders GROUP BY product_id ORDER BY sales DESC LIMIT 10',
                            database: 'Production',
                            lastExecuted: '3 hours ago',
                            isFavorite: true
                        },
                        {
                            id: '4',
                            name: 'User Engagement',
                            query: 'SELECT user_id, COUNT(DISTINCT session_id) as sessions FROM events WHERE created_at > NOW() - INTERVAL \'30 days\' GROUP BY user_id',
                            database: 'Analytics',
                            lastExecuted: '5 hours ago',
                            isFavorite: false
                        },
                        {
                            id: '5',
                            name: 'Error Logs',
                            query: 'SELECT * FROM logs WHERE level = \'ERROR\' AND created_at > NOW() - INTERVAL \'1 day\' ORDER BY created_at DESC',
                            database: 'Staging',
                            lastExecuted: '30 mins ago',
                            isFavorite: false
                        }
                    ]}
                />
            )}

            {activeTab === 'history' && (
                <div className="text-center py-16 px-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
                    <p className="text-sm font-medium text-muted-foreground">Query History</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                        Coming soon...
                    </p>
                </div>
            )}
        </div>
    )
}
