import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

export default function FluidBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        if (typeof window !== 'undefined') {
            import('webgl-fluid-simulation').then((module) => {
                const webGLFluid = module.default || module;
                if (typeof webGLFluid === 'function') {
                    webGLFluid(canvas, {
                        SIM_RESOLUTION: 128,
                        DYE_RESOLUTION: 1024,
                        DENSITY_DISSIPATION: 1.5,
                        VELOCITY_DISSIPATION: 0.5,
                        PRESSURE: 0.8,
                        CURL: 30,
                        SPLAT_RADIUS: 0.25,
                        SPLAT_FORCE: 6000,
                        SHADING: true,
                        COLORFUL: true,
                        COLOR_UPDATE_SPEED: 10,
                        PAUSED: false,
                        BACK_COLOR: theme === 'dark' ? { r: 5, g: 5, b: 10 } : { r: 249, g: 250, b: 251 },
                        TRANSPARENT: true,
                        BLOOM: true,
                        BLOOM_ITERATIONS: 8,
                        BLOOM_RESOLUTION: 256,
                        BLOOM_INTENSITY: 0.8,
                        BLOOM_THRESHOLD: 0.6,
                        BLOOM_SOFT_KNEE: 0.7,
                        SUNRAYS: true,
                        SUNRAYS_RESOLUTION: 196,
                        SUNRAYS_WEIGHT: 1.0,
                    })
                }
            }).catch(err => {
                console.warn('Fluid simulation failed to load:', err)
            })
        }
    }, [theme, mounted])

    if (!mounted) return null

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 w-full h-full -z-10 pointer-events-none transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-30 mix-blend-screen' : 'opacity-10 mix-blend-multiply'}`}
        />
    )
}
