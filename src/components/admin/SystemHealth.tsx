'use client'

import React from 'react'
import { motion } from 'framer-motion'

export interface HealthNode {
    id: string
    name: string
    status: 'online' | 'warning' | 'offline'
    load: number
    uptime: string
}

interface SystemHealthProps {
    score: number
    nodes: HealthNode[]
}

const Icons = {
    Server: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
    ),
    Activity: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
}

export function SystemHealth({ score, nodes }: SystemHealthProps) {
    return (
        <div className="p-8 rounded-3xl bg-card border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                {/* Main Health Gauge */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="84"
                            className="fill-none stroke-white/5 stroke-[12]"
                        />
                        <motion.circle
                            cx="96"
                            cy="96"
                            r="84"
                            className={`fill-none stroke-[12] stroke-linecap-round ${score > 90 ? 'stroke-emerald-500' : score > 70 ? 'stroke-amber-500' : 'stroke-red-500'}`}
                            strokeDasharray={527}
                            initial={{ strokeDashoffset: 527 }}
                            animate={{ strokeDashoffset: 527 - (527 * (score / 100)) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-bold text-foreground">{score}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Global Health</span>
                    </div>

                    {/* Animated Pulse */}
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20 border-2 border-primary pointer-events-none" />
                </div>

                {/* Node Status Grid */}
                <div className="flex-1 w-full space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Icons.Server className="w-4 h-4" />
                            Infrastructure Status
                        </h3>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Live Pulse</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {nodes.map((node) => (
                            <div key={node.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">{node.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono uppercase">{node.uptime}</p>
                                </div>
                                <div className="text-right space-y-2">
                                    <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${node.status === 'online' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        node.status === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                        {node.status}
                                    </div>
                                    <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${node.load}%` }}
                                            className={`h-full ${node.load > 80 ? 'bg-red-500' : node.load > 60 ? 'bg-amber-500' : 'bg-primary'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        </div>
    )
}
