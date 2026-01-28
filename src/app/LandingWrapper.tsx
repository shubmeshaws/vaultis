'use client'

import React, { useState } from 'react'
import LandingHeader from '@/components/landing/LandingHeader'
import HeroSection from '@/components/landing/HeroSection'
import FluidBackground from '@/components/landing/FluidBackground'

export function LandingWrapper() {
    return (
        <main className="min-h-screen relative">
            <LandingHeader />
            <FluidBackground />
            <HeroSection />
        </main>
    )
}
