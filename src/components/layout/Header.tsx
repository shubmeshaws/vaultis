'use client'

import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Role } from '@/lib/auth/permissions'
import Link from 'next/link'

export function Header() {
  const { user, isAdmin } = useAuth()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold">
            QueryFlow
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Dashboard
            </Link>
            <Link
              href="/queries"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Queries
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-muted-foreground">
              {user.name || user.email}
              {user.role === Role.ADMIN && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">
                  Admin
                </span>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
