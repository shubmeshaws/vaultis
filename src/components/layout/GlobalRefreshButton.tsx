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
        <div className="absolute top-6 right-[110px] z-[100] group">
            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className={cn(
                    "bg-background/80 backdrop-blur-xl border-foreground/10 hover:border-primary/50 shadow-lg transition-all duration-300 gap-2 h-9 px-4 rounded-full",
                    isRefreshing && "bg-primary/10 border-primary/30"
                )}
            >
                <RefreshCw className={cn(
                    "w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-all duration-700",
                    isRefreshing && "rotate-180 text-primary"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                    Refresh
                </span>
            </Button>
        </div>
    )
}
