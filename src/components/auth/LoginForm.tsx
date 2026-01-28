'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShieldCheck, Github, ArrowRight, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 p-6 relative">
      {/* Premium Glassmorphic Background Card */}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl rounded-[2rem] border border-foreground/15 shadow-xl -z-10" />

      <div className="relative space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-2 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-xl mb-1.5 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">Sign <span className="text-primary italic">In</span></h1>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.2em] opacity-70">Authorize your session</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            {/* GitHub OAuth Button */}
            <button
              type="button"
              onClick={() => signIn('github')}
              className="w-full group relative px-5 py-3.5 bg-foreground text-background font-black rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              <Github className="w-4 h-4 relative z-10" />
              <span className="relative z-10 text-[10px] uppercase tracking-[0.15em]">Continue with GitHub</span>
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-foreground/10" />
              </div>
              <span className="relative px-3 text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] bg-transparent">Secure Access</span>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-[10px] text-destructive font-bold flex items-center gap-2"
              >
                <div className="w-1 h-1 rounded-full bg-destructive animate-pulse" />
                {error}
              </motion.div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-foreground/60 ml-1">username</Label>
                </div>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={isLoading}
                  className="bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-11 rounded-xl px-5 text-[12px] font-medium transition-all shadow-sm"
                  placeholder="Username or Email"
                />
                {errors.email && (
                  <p className="text-[9px] text-destructive font-bold ml-1 uppercase">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-widest text-foreground/60 ml-1">password</Label>
                  <button type="button" className="text-[8px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors mr-1">Forgot?</button>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  disabled={isLoading}
                  className="bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-11 rounded-xl px-5 text-[12px] font-medium transition-all shadow-sm"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-[9px] text-destructive font-bold ml-1 uppercase">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-1">
            <Button
              type="submit"
              className="flex-[2] h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] overflow-hidden group relative"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              <span className="relative z-10">{isLoading ? 'Auth...' : 'Authorize'}</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1 h-11 rounded-xl border-foreground/15 bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground font-black text-[10px] uppercase tracking-widest gap-2 transition-all active:scale-[0.98] shadow-sm"
            >
              Cancel
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="text-center pt-2 border-t border-foreground/5">
            <p className="text-[10px] font-bold text-muted-foreground/50">
              New here? {' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 transition-colors font-black"
              >
                Request Access
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
