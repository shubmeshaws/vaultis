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
        router.refresh()
        // Artificial delay to make it feel responsive and show animation
        setTimeout(() => setIsRefreshing(false), 800)
    }

    return (
        <div className="fixed top-6 right-8 z-[100] group">
            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className={cn(
                    "bg-background/50 backdrop-blur-xl border-foreground/10 hover:border-primary/50 shadow-2xl transition-all duration-300 gap-2 h-9 px-3 rounded-xl",
                    isRefreshing && "bg-primary/10 border-primary/30"
                )}
            >
                <RefreshCw className={cn(
                    "w-4 h-4 text-primary transition-all duration-700",
                    isRefreshing && "rotate-180"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                    Refresh
                </span>
            </Button>
        </div>
    )
}
