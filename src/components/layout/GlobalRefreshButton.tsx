'use client'

import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function GlobalRefreshButton() {
    const router = useRouter()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        // Use window.location.reload() to ensure all data is refreshed
        // This works for both server and client components
        window.location.reload()
    }

    return (
        <div className="absolute top-6 right-[35px] z-[100] group">
            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className={cn(
                    "bg-amber-500/10 backdrop-blur-xl border-amber-500/20 hover:bg-amber-500 hover:text-white shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 transition-all duration-300 gap-2 h-9 px-4 rounded-full group",
                    isRefreshing && "bg-amber-500 text-white shadow-amber-500/40"
                )}
            >
                <RefreshCw className={cn(
                    "w-3.5 h-3.5 text-amber-600 dark:text-amber-500 group-hover:text-white transition-all duration-700",
                    isRefreshing && "rotate-180 text-white"
                )} />
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 group-hover:text-white transition-colors",
                    isRefreshing && "text-white"
                )}>
                    Refresh
                </span>
            </Button>
        </div>
    )
}
