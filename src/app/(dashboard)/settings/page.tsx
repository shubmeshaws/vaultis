
import React from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import SettingsClient from '@/components/settings/SettingsClient'

export default function SettingsPage() {
    return (
        <div className="space-y-8 p-8 relative min-h-screen pb-24">
            {/* Header Section */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-foreground/5 text-muted-foreground">
                    <SettingsIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-500">
                            System
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Configuration</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">Settings</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Manage system health, preferences, and application information
                    </p>
                </div>
            </div>

            <SettingsClient />
        </div>
    )
}
