'use client'

import dynamic from 'next/dynamic'
import LandingHeader from '@/components/landing/LandingHeader'
import HeroSection from '@/components/landing/HeroSection'

const FluidBackground = dynamic(() => import('@/components/landing/FluidBackground'), {
    ssr: false,
    loading: () => <div className="fixed inset-0 -z-10 bg-background" />
})

export function LandingWrapper() {
    return (
        <main className="min-h-screen relative">
            <LandingHeader />
            <FluidBackground />
            <HeroSection />
        </main>
    )
}
