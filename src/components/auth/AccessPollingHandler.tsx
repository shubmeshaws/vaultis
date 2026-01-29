'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserStatus } from '@/lib/actions/userActions'

export function AccessPollingHandler() {
    const router = useRouter()

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await getUserStatus()
                if (res.success && res.isActive) {
                    // Force a full router refresh and potential page reload
                    // to ensure the layout re-calculates the user's active status
                    router.refresh()
                    // Occasionally router.refresh() isn't enough for layout-level changes
                    // especially if the layout is already rendered with a hard return.
                    // A window reload is the most "automatic" way to bridge the gap.
                    window.location.reload()
                }
            } catch (error) {
                console.error('Polling error:', error)
            }
        }, 5000) // Poll every 5 seconds

        return () => clearInterval(interval)
    }, [router])

    return null // Invisible component
}
