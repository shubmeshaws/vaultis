import { Suspense } from 'react'
import { getAnalyzerData } from '@/lib/actions/analyzerActions'
import { AnalyzerClient } from '@/components/admin/AnalyzerClient'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
    title: 'Query Analyzer | QueryFlow',
    description: 'Monitor query performance and recent activity.'
}

export default async function AnalyzerPage() {
    const dataResult = await getAnalyzerData()

    const initialData = {
        slowestQueries: dataResult.success ? dataResult.slowestQueries || [] : [],
        latestQueries: dataResult.success ? dataResult.latestQueries || [] : []
    }

    return (
        <Suspense fallback={<AnalyzerLoading />}>
            <AnalyzerClient initialData={initialData} />
        </Suspense>
    )
}

function AnalyzerLoading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-64" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                    <Card key={i} className="bg-card/50 border-foreground/10">
                        <CardContent className="p-4 space-y-4">
                            <Skeleton className="h-8 w-32" />
                            {[1, 2, 3].map(j => (
                                <Skeleton key={j} className="h-24 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
