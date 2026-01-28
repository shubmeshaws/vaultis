'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, ShieldCheck, Orbit } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!mounted) return null

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${isScrolled
                ? 'py-3 bg-background/60 backdrop-blur-3xl border-b border-foreground/10 shadow-xl'
                : 'py-6 bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
                {/* Vaultis Advanced Logo */}
                <Link href="/" className="flex items-center gap-4 group relative">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        {/* Outer Glow */}
                        <div className="absolute inset-0 bg-primary/30 rounded-[12px] blur-xl group-hover:bg-primary/50 transition-all duration-500 scale-75 group-hover:scale-100" />

                        {/* Animated Logo Layers */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-[1.5px] border-primary/20 rounded-[16px]"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 border-[1.5px] border-primary/40 rounded-[12px]"
                        />
                        <div className="relative z-10 p-3 bg-background/50 backdrop-blur-md rounded-[12px] border border-foreground/10 group-hover:border-primary/50 transition-colors shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-primary fill-primary/10" />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-[0.12em] text-foreground leading-[0.8] transition-all group-hover:text-primary font-[family-name:var(--font-flexing)]">
                            VAULTIS
                        </span>
                        <span className="text-[8px] font-bold tracking-[0.3em] text-muted-foreground/60 uppercase mt-2 group-hover:text-primary transition-colors">
                            by shubham meshram
                        </span>
                    </div>
                </Link>

                {/* desktop actions */}
                <div className="flex items-center gap-5">
                    <button
                        onClick={toggleTheme}
                        className="relative p-2.5 rounded-xl bg-foreground/5 border border-foreground/15 text-foreground/60 hover:text-foreground transition-all overflow-hidden group hover:border-primary/30 shadow-sm"
                        aria-label="Toggle theme"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {theme === 'dark' ? <Sun className="w-4 h-4 relative z-10" /> : <Moon className="w-4 h-4 relative z-10" />}
                    </button>


                    <Link
                        href="/login"
                        className="relative px-6 py-2.5 text-[10px] font-black bg-foreground text-background rounded-xl hover:scale-105 transition-all shadow-lg overflow-hidden group active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                        <span className="relative z-10 tracking-[0.1em]">SIGN IN</span>
                    </Link>

                    <Link
                        href="/register"
                        className="relative px-6 py-2.5 text-[10px] font-black bg-foreground text-background rounded-xl hover:scale-105 transition-all shadow-lg overflow-hidden group active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                        <span className="relative z-10 tracking-[0.1em]">SIGN UP</span>
                    </Link>
                </div>
            </div>
        </header>
    )
}
