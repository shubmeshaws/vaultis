'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, ShieldCheck, Mail, Lock, User, ArrowRight, X, Sparkles, Fingerprint } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  name: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  securityQuestion1: z.string().min(1, 'Required'),
  securityAnswer1: z.string().min(1, 'Required'),
  securityQuestion2: z.string().min(1, 'Required'),
  securityAnswer2: z.string().min(1, 'Required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

const SECURITY_QUESTIONS = [
  "What was your first pet's name?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the model of your first car?",
  "What was the name of your elementary school?"
]

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Registration failed')
        setIsLoading(false)
        return
      }

      router.push('/login?registered=true')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 p-6 relative">
      {/* Premium Glassmorphic Background Card */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-3xl rounded-[2rem] border border-foreground/15 shadow-xl -z-10" />

      <div className="relative space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">Create <span className="text-primary italic">Account</span></h1>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.2em] opacity-80">Join the QueryX Network</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-[10px] text-destructive font-bold flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {/* Identity Credentials Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1.5 border-b border-foreground/10">
                <User className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/80 transition-colors">Identity Credentials</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-foreground/60 ml-1">First Name</Label>
                  <Input {...register('firstName')} disabled={isLoading} className="bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-10 rounded-xl px-4 text-[11px] transition-all shadow-sm" placeholder="John" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-foreground/60 ml-1">Last Name</Label>
                  <Input {...register('lastName')} disabled={isLoading} className="bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-10 rounded-xl px-4 text-[11px] transition-all shadow-sm" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[8px] font-black uppercase tracking-widest text-foreground/60 ml-1">Username</Label>
                <Input {...register('name')} disabled={isLoading} className="bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-10 rounded-xl px-4 text-[11px] transition-all shadow-sm" placeholder="admin@test.com" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[8px] font-black uppercase tracking-widest text-foreground/60 ml-1">Email Address</Label>
                <Input {...register('email')} disabled={isLoading} className="bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-10 rounded-xl px-4 text-[11px] transition-all shadow-sm" placeholder="john@example.com" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-foreground/60 ml-1">Password</Label>
                  <Input type="password" {...register('password')} disabled={isLoading} className="bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-10 rounded-xl px-4 text-[11px] transition-all shadow-sm" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-foreground/60 ml-1">Confirm</Label>
                  <Input type="password" {...register('confirmPassword')} disabled={isLoading} className="bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-10 rounded-xl px-4 text-[11px] transition-all shadow-sm" placeholder="••••••••" />
                </div>
              </div>
            </div>

            {/* Security Verification Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1.5 border-b border-foreground/10">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/80 transition-colors">Security Verification</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-foreground/60 ml-1">Security Question 1</Label>
                  <select {...register('securityQuestion1')} className="w-full bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-10 rounded-xl px-4 text-[11px] transition-all appearance-none outline-none shadow-sm cursor-pointer">
                    <option value="" className="bg-background text-foreground">Select a question</option>
                    {SECURITY_QUESTIONS.map(q => <option key={q} value={q} className="bg-background text-foreground">{q}</option>)}
                  </select>
                  <Input {...register('securityAnswer1')} disabled={isLoading} className="bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-10 rounded-xl px-4 text-[11px] transition-all mt-2 shadow-sm" placeholder="Your answer" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-foreground/60 ml-1">Security Question 2</Label>
                  <select {...register('securityQuestion2')} className="w-full bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-10 rounded-xl px-4 text-[11px] transition-all appearance-none outline-none shadow-sm cursor-pointer">
                    <option value="" className="bg-background text-foreground">Select a question</option>
                    {SECURITY_QUESTIONS.map(q => <option key={q} value={q} className="bg-background text-foreground">{q}</option>)}
                  </select>
                  <Input {...register('securityAnswer2')} disabled={isLoading} className="bg-foreground/[0.04] dark:bg-foreground/[0.06] border-foreground/15 dark:border-foreground/20 focus:border-primary/50 h-10 rounded-xl px-4 text-[11px] transition-all mt-2 shadow-sm" placeholder="Your answer" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-foreground/5">
            <Button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] overflow-hidden group relative"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              <span className="relative z-10">{isLoading ? 'Deploying...' : 'Request Deployment'}</span>
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

          <div className="text-center pt-2">
            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest transition-colors">
              Already have an endpoint? {' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-primary hover:text-primary/80 transition-colors font-black underline decoration-primary/30 underline-offset-4"
              >
                Return to Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
