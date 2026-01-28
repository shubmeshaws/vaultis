'use client'

import React, { useState } from 'react'
import { DatabasesGrid } from '@/components/admin/DatabasesGrid'
import { Database } from '@/components/admin/DatabaseCard'
import { DangerousActionModal } from '@/components/ui/DangerousActionModal'

const Icons = {
    Plus: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    Refresh: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    Shield: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
}

export default function DatabasesManagementPage() {
    const [databases] = useState<Database[]>([
        {
            id: 'db-1',
            name: 'Production Core',
            type: 'postgres',
            status: 'healthy',
            environment: 'production',
            host: 'pg-prod-01.aws.internal',
            latency: 12,
            users: [{ id: '1', name: 'Dexter' }, { id: '2', name: 'James' }, { id: '3', name: 'Debra' }],
            lastBackup: '2h ago'
        },
        {
            id: 'db-2',
            name: 'Inventory Engine',
            type: 'mysql',
            status: 'healthy',
            environment: 'production',
            host: 'mysql-prod-04.aws.internal',
            latency: 18,
            users: [{ id: '1', name: 'Dexter' }, { id: '4', name: 'Vince' }],
            lastBackup: '5h ago'
        },
        {
            id: 'db-3',
            name: 'User Staging',
            type: 'postgres',
            status: 'healthy',
            environment: 'staging',
            host: 'pg-stage-02.internal',
            latency: 45,
            users: [{ id: '1', name: 'Dexter' }, { id: '2', name: 'James' }],
            lastBackup: '1d ago'
        },
        {
            id: 'db-4',
            name: 'Billing Staging',
            type: 'mongodb',
            status: 'warning',
            environment: 'staging',
            host: 'mongo-stage-01.internal',
            latency: 124,
            users: [{ id: '3', name: 'Debra' }],
            lastBackup: '4h ago'
        },
        {
            id: 'db-5',
            name: 'Local Scratch',
            type: 'sqlite',
            status: 'offline',
            environment: 'development',
            host: 'localhost:5432',
            latency: 0,
            users: [{ id: '1', name: 'Dexter' }],
            lastBackup: 'Never'
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDbId, setSelectedDbId] = useState<string | null>(null)

    const handleDisconnectRequest = (id: string) => {
        setSelectedDbId(id)
        setIsModalOpen(true)
    }

    const handleConfirmDisconnect = () => {
        if (!selectedDbId) return
        console.log('Node Disconnected:', selectedDbId)
        // In a real app, we would trigger a delete/disconnect mutation here
    }

    const selectedDbName = databases.find(db => db.id === selectedDbId)?.name || 'the selected node'

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                            <Icons.Shield className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic px-1">Cluster <span className="text-primary not-italic">Registry</span></h1>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg ml-1">Monitor infrastructure health and manage node access.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground transition-all">
                        <Icons.Refresh className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-[0_8px_32px_rgba(var(--primary),0.3)] hover:shadow-[0_12px_48px_rgba(var(--primary),0.5)] transition-all">
                        <Icons.Plus className="w-4 h-4" />
                        Provision Cluster
                    </button>
                </div>
            </header>

            {/* Registry Grid */}
            <div className="relative">
                <DatabasesGrid
                    databases={databases}
                    onTestConnection={(id) => console.log('Testing signal', id)}
                    onEditPermissions={(id) => console.log('Edit permissions', id)}
                    onDisconnect={handleDisconnectRequest}
                />

                <DangerousActionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmDisconnect}
                    title="Disconnect Infrastructure Node"
                    description={`You are about to disconnect "${selectedDbName}". This will sever all active platform connections and terminate background sync processes immediately.`}
                    confirmKeyword="DISCONNECT"
                    actionLabel="Confirm Disconnection"
                />

                {/* Atmosphere */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
            </div>
        </div>
    )
}
