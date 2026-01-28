'use client'

import { motion } from 'framer-motion'
import { LoginForm } from '@/components/auth/LoginForm'
import LandingHeader from '@/components/landing/LandingHeader'
import { useState } from 'react'

export default function LoginPage() {
  return (
    <main className="relative min-h-screen">
      <LandingHeader />

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4 py-20 z-10">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          {/* Layer 0: Animated Mesh Gradient */}
          <div className="absolute inset-0">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] mix-blend-screen opacity-50"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [0, -90, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-[140px] mix-blend-screen opacity-40"
            />
          </div>

          {/* Layer 1: Advanced Interactive Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

          {/* Layer 2: Subtle Particles / Grain */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        {/* Content Container - Moved up with margin */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.2
          }}
          className="relative z-10 w-full max-w-xl mt-0"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[80px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <LoginForm />
        </motion.div>

        {/* Bottom Attribution */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity cursor-default">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground">
            Vaultis - By Shubham Meshram
          </span>
        </div>
      </div>
    </main>
  )
}
