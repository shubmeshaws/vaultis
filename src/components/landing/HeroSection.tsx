'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { Terminal, Shield, Database, Cpu, Globe, Lock, Key, Activity, X, Play } from 'lucide-react'
import Image from 'next/image'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    const [showVideoModal, setShowVideoModal] = useState(false)
    const [showSignupModal, setShowSignupModal] = useState(false)

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e
        const { innerWidth, innerHeight } = window
        const x = (clientX / innerWidth - 0.5) * 40
        const y = (clientY / innerHeight - 0.5) * 40
        setMousePos({ x, y })
    }

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden perspective-2000"
        >
            {/* Ambient Background Elements */}
            <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[140px] animate-pulse -z-20" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[160px] -z-20" />

            <div className="max-w-7xl mx-auto px-8 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transform scale-[1.05] lg:scale-110 origin-center">

                    {/* Left: Content (7 cols) */}
                    <motion.div
                        className="lg:col-span-7 -ml-[20px] lg:-ml-[75px]"
                        style={{
                            rotateX: -mousePos.y * 0.1,
                            rotateY: mousePos.x * 0.1,
                            transformStyle: "preserve-3d"
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary/5 border border-primary/20 mb-8 backdrop-blur-xl group hover:border-primary/40 transition-colors shadow-sm"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Secure Infrastructure Gate</span>
                        </motion.div>

                        <h1 className="text-7xl md:text-[6.5rem] font-black tracking-[-0.04em] leading-[0.85] text-foreground mb-10 text-shadow-xl">
                            QUERY YOUR DATA WITH<br />
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">CONFIDENCE.</span>
                        </h1>

                        <p className="text-2xl md:text-3xl text-muted-foreground leading-relaxed max-w-3xl mb-12 font-medium tracking-tight">
                            Accepts, rejects and monitor database queries in realtime. Built for teams who prioritize security and efficiency.
                        </p>
                    </motion.div>

                    {/* Right: Advanced 3D Core Visual (5 cols) */}
                    <motion.div
                        className="lg:col-span-5 relative perspective-1000 hidden lg:block mt-20"
                        style={{
                            rotateX: -mousePos.y * 0.2, // Reduced sensitivity
                            rotateY: mousePos.x * 0.2, // Reduced sensitivity
                            transformStyle: "preserve-3d"
                        }}
                    >
                        {/* The Visual Stage */}
                        <div className="relative w-full aspect-[4/5] max-w-[380px] mx-auto group">
                            {/* Layer 0: Deep Glow */}
                            <div className="absolute inset-[-10%] bg-primary/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                            {/* Layer 1: Base Glass Plate */}
                            <div className="absolute inset-0 bg-background/40 backdrop-blur-md rounded-[40px] border border-foreground/15 shadow-2xl transform translate-z-[15px]" />

                            {/* Layer 2: Glowing Core with Circular Border */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 transform translate-z-[100px]">
                                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                                <div className="relative w-full h-full flex items-center justify-center bg-background/80 backdrop-blur-md border border-primary/50 rounded-full shadow-[0_0_40px_rgba(var(--primary),0.2)]">
                                    <Activity className="w-10 h-10 text-primary" />
                                </div>
                            </div>

                            {/* Layer 3: Orbital Path Ring and Data Cards */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] border border-primary/30 rounded-full border-dashed transform translate-z-[80px] pointer-events-none" />

                            {[
                                { icon: Shield, label: "Security", val: "99.9%", top: "5%", left: "-10%", z: 140, color: "text-primary" },
                                { icon: Globe, label: "Traceability", val: "Forensic", bottom: "10%", right: "-10%", z: 160, color: "text-blue-500" },
                                { icon: Key, label: "Control", val: "RBAC", top: "40%", right: "-20%", z: 100, color: "text-primary" },
                                { icon: Activity, label: "Exporter", val: "Active", bottom: "0%", left: "-5%", z: 120, color: "text-blue-600" }
                            ].map((card, i) => (
                                <motion.div
                                    key={`card-${i}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.2 }}
                                    style={{
                                        position: 'absolute',
                                        top: card.top,
                                        left: card.left,
                                        right: card.right,
                                        bottom: card.bottom,
                                        z: card.z,
                                        transformStyle: 'preserve-3d'
                                    }}
                                    className="p-3.5 rounded-xl bg-background/70 backdrop-blur-md border border-foreground/15 shadow-xl min-w-[120px]"
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <card.icon className={`w-3 h-3 ${card.color}`} />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-foreground/50">{card.label}</span>
                                    </div>
                                    <div className="text-base font-black text-foreground">{card.val}</div>
                                </motion.div>
                            ))}

                            {/* Layer 4: Orbital Database Ecosystem */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none">
                                <motion.div
                                    animate={{ rotateZ: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    style={{ transformStyle: "preserve-3d" }}
                                    className="relative"
                                >
                                    {[
                                        { src: "https://cdn-icons-png.flaticon.com/512/5968/5968342.png", angle: 0, radius: 95, z: 110 },
                                        { src: "https://images.icon-icons.com/2415/PNG/512/mongodb_original_wordmark_logo_icon_146425.png", angle: 120, radius: 95, z: 110 },
                                        { src: "https://images.icon-icons.com/2415/PNG/512/redis_original_wordmark_logo_icon_146369.png", angle: 240, radius: 95, z: 110 }
                                    ].map((logo, i) => {
                                        const x = Math.cos((logo.angle * Math.PI) / 180) * logo.radius
                                        const y = Math.sin((logo.angle * Math.PI) / 180) * logo.radius

                                        return (
                                            <motion.div
                                                key={`db-${i}`}
                                                style={{
                                                    position: 'absolute',
                                                    x: x - 24,
                                                    y: y - 24,
                                                    z: logo.z,
                                                    transformStyle: 'preserve-3d',
                                                    pointerEvents: 'auto'
                                                }}
                                            >
                                                <motion.div
                                                    animate={{ rotateZ: -360 }}
                                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                                    className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center p-2 shadow-xl hover:scale-110 transition-transform"
                                                >
                                                    <Image src={logo.src} alt="DB Logo" width={48} height={48} unoptimized className="w-full h-full object-contain filter drop-shadow-lg" />
                                                </motion.div>
                                            </motion.div>
                                        )
                                    })}
                                </motion.div>
                            </div>

                            {/* Layer 5: Floating Particles */}
                            <motion.div
                                animate={{ y: [0, -30, 0], rotate: [0, 45, 0] }}
                                transition={{ duration: 6, repeat: Infinity }}
                                className="absolute top-[10%] right-[10%] w-10 h-10 bg-foreground/5 backdrop-blur-md border border-foreground/15 rounded-lg transform translate-z-[160px]"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Attribution - Subtle but clear */}
                <div className="mt-12 flex justify-between items-end border-t border-foreground/5 pt-8 pb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-5">
                        <div className="flex flex-col">
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showSignupModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSignupModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-background border border-foreground/15 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setShowSignupModal(false)}
                                className="absolute top-6 right-6 p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 transition-colors z-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="py-12 px-2">
                                <RegisterForm />
                            </div>
                        </motion.div>
                    </div>
                )}

                {showVideoModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowVideoModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] border border-foreground/20 shadow-2xl overflow-hidden"
                        >
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="absolute top-6 right-6 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {/* In a real scenario, this would be a high-quality demo video */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-transparent">
                                <div className="p-8 rounded-full bg-primary/20 border border-primary/30 mb-6 group cursor-pointer hover:bg-primary/30 transition-all">
                                    <Play className="w-16 h-16 text-primary fill-primary" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-white italic">Protocol <span className="text-primary">Demo</span></h3>
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-2 underline underline-offset-8 decoration-primary/30">Vaultis - Distributed Query Guard</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    )
}
